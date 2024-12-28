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
                    answers: new Map(),
                    maxAttempts: 3,
                    currentAttempts: 0
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
                category: room.category,
                maxAttempts: room.maxAttempts || 3,
                currentAttempts: room.currentAttempts || 0
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
        room.currentRound = 1;
        room.currentTurn = room.players[0].id; // Start with first player
        room.maxAttempts = 3;
        room.currentAttempts = 0;
        room.timeRemaining = 30; // 30 seconds per turn

        io.to(player.roomId).emit('game:state', room);

        // Start turn timer
        startTurnTimer(room, io);
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

            console.log('Selected category:', selectedCategory);

            // Get words for the selected category
            const words = await getRandomWordsByCategory(selectedCategory.id, 'en', 1);
            console.log('Words:', words);
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
        if (!room || !room.currentWord || player.id !== room.currentTurn) return;

        const isCorrect = answer.toLowerCase() === room.currentWord.translation.toLowerCase();
        room.currentAttempts++;

        if (isCorrect) {
            // Award points based on attempts
            const points = Math.max(4 - room.currentAttempts, 1); // 3 points for first try, 2 for second, 1 for third
            player.score += points;
            
            io.to(room.roomId).emit('game:roundEnd', { [player.id]: points });
            moveToNextTurn(room, io);
        } else if (room.currentAttempts >= room.maxAttempts) {
            moveToNextTurn(room, io);
        }

        io.to(room.roomId).emit('game:state', room);
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

function startTurnTimer(room: GameRoom, io: Server) {
    const timer = setInterval(() => {
        if (!room.timeRemaining || room.timeRemaining <= 0) {
            clearInterval(timer);
            moveToNextTurn(room, io);
            return;
        }
        
        room.timeRemaining--;
        io.to(room.roomId).emit('game:state', room);
    }, 1000);

    return timer;
}

function moveToNextTurn(room: GameRoom, io: Server) {
    if (!room.currentTurn) return;

    const currentPlayerIndex = room.players.findIndex(p => p.id === room.currentTurn);
    const nextPlayerIndex = (currentPlayerIndex + 1) % room.players.length;
    console.log('Current player index:', currentPlayerIndex);
    console.log('Next player index:', nextPlayerIndex);

    room.currentTurn = room.players[nextPlayerIndex].id;
    room.timeRemaining = 30;
    room.currentAttempts = 0;
    room.currentWord = undefined;
    room.category = undefined;

    if (nextPlayerIndex === 0) {
        room.currentRound++;
        if (room.currentRound > room.maxRounds) {
            room.status = 'finished';
        }
    }

    io.to(room.roomId).emit('game:state', room);
} 