import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import {
    ClientToServerEvents,
    ServerToClientEvents,
    GameState,
    Player
} from '@vocab/shared';
import { GameRoom } from '../types/GameRoom';
import { getAllCategories, getRandomWordsByCategory } from '@vocab/database';

export function setupGameHandlers(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    gameRooms: Map<string, GameRoom>
) {
    socket.on('game:join', ({ nickname, roomId }) => {
        try {
            // Create player object
            const player: Player = {
                id: socket.id,
                nickname,
                score: 0,
                roomId: roomId || uuidv4(),
                isHost: false
            };

            let room = gameRooms.get(player.roomId);

            // Create new room if it doesn't exist
            if (!room) {
                player.isHost = true;
                room = {
                    roomId: player.roomId,
                    players: [],
                    status: 'waiting',
                    currentRound: 0,
                    maxRounds: 10,
                    answers: new Map()
                };
                gameRooms.set(player.roomId, room);
            }

            // Leave any existing rooms first
            socket.rooms.forEach(roomId => {
                if (roomId !== socket.id) {
                    socket.leave(roomId);
                }
            });

            // Join the new room
            socket.join(player.roomId);

            // Add player to room's player list if not already present
            if (!room.players.find(p => p.id === player.id)) {
                room.players.push(player);
            }

            // Broadcast to all clients in the room
            io.to(player.roomId).emit('game:playerJoined', player);

            // Send current game state to the new player
            socket.emit('game:state', {
                roomId: room.roomId,
                players: room.players,
                status: room.status,
                currentRound: room.currentRound,
                maxRounds: room.maxRounds,
                currentWord: room.currentWord,
                category: room.category
            });

            console.log(`Player ${player.nickname} joined room ${player.roomId}`);
        } catch (error) {
            console.error('Error joining game:', error);
            socket.emit('game:error', 'Failed to join game');
        }
    });

    // Add other game event handlers here
    socket.on('game:startGame', async () => {
        const player = findPlayerBySocketId(socket.id, gameRooms);
        if (!player || !player.isHost) return;

        const room = gameRooms.get(player.roomId);
        if (!room) return;

        room.status = 'playing';

        io.to(player.roomId).emit('game:state', {
            ...room,
            status: 'playing'
        });
    });

    socket.on('game:spinWheel', async () => {
        const player = findPlayerBySocketId(socket.id, gameRooms);
        if (!player) return;

        const room = gameRooms.get(player.roomId);
        if (!room || room.status !== 'playing') return;

        try {
            // Get all categories and randomly select one
            const categories = await getAllCategories();
            if (!categories || categories.length === 0) {
                socket.emit('game:error', 'No categories available');
                return;
            }

            const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
            if (!selectedCategory) {
                socket.emit('game:error', 'Failed to select category');
                return;
            }

            // Get words for the selected category
            const words = await getRandomWordsByCategory(selectedCategory.id, 'en', 1);

            if (words && words.length > 0) {
                const word = words[0];
                room.currentWord = {
                    ...word,
                    category: selectedCategory.name,
                    language: word.language.code
                };
                room.category = selectedCategory.name;

                io.to(player.roomId).emit('game:wheelSpun', selectedCategory.name);
                io.to(player.roomId).emit('game:roundStart', {
                    ...word,
                    category: selectedCategory.name,
                    language: word.language.code
                });
            } else {
                socket.emit('game:error', 'No words available for selected category');
            }
        } catch (error) {
            console.error('Error in spinWheel:', error);
            socket.emit('game:error', 'Failed to spin wheel');
        }
    });

    socket.on('game:answer', (answer: string) => {
        const player = findPlayerBySocketId(socket.id, gameRooms);
        if (!player) return;

        const room = gameRooms.get(player.roomId);
        if (!room || !room.currentWord) return;

        const isCorrect = answer === room.currentWord.translation;
        const currentAnswers = room.answers || new Map<string, boolean>();

        // Record this player's answer
        currentAnswers.set(player.id, isCorrect);
        room.answers = currentAnswers;

        // If everyone has answered, calculate scores
        if (currentAnswers.size === room.players.length) {
            const correctPlayers = Array.from(currentAnswers.entries())
                .filter(([_, correct]) => correct)
                .map(([playerId]) => playerId);

            const scores: Record<string, number> = {};

            // Assign points based on order
            correctPlayers.forEach((playerId, index) => {
                scores[playerId] = index === 0 ? 3 : index === 1 ? 2 : 1;
            });

            // Update player scores
            room.players.forEach(p => {
                p.score += scores[p.id] || 0;
            });

            // Clear answers for next round
            room.answers = new Map();

            // Emit scores and round end
            io.to(room.roomId).emit('game:roundEnd', scores);
            io.to(room.roomId).emit('game:state', room);
        }
    });

    socket.on('disconnect', () => {
        const player = findPlayerBySocketId(socket.id, gameRooms);
        if (!player) return;

        const room = gameRooms.get(player.roomId);
        if (!room) return;

        // Remove player from room
        room.players = room.players.filter(p => p.id !== socket.id);

        // Notify other players
        io.to(player.roomId).emit('game:playerLeft', socket.id);

        // Update game state
        io.to(player.roomId).emit('game:state', room);

        // Clean up empty rooms
        if (room.players.length === 0) {
            gameRooms.delete(player.roomId);
        } else if (player.isHost) {
            // Assign new host if the host left
            const newHost = room.players[0];
            if (newHost) {
                newHost.isHost = true;
                io.to(player.roomId).emit('game:state', room);
            }
        }

        console.log(`Player ${player.nickname} disconnected from room ${player.roomId}`);
    });
}

function findPlayerBySocketId(
    socketId: string,
    gameRooms: Map<string, GameRoom>
): Player | null {
    for (const room of Array.from(gameRooms.values())) {
        const player = room.players.find(p => p.id === socketId);
        if (player) return player;
    }
    return null;
} 