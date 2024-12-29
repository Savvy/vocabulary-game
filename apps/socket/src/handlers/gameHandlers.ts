import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import {
    ClientToServerEvents,
    ServerToClientEvents,
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
            const targetRoomId = roomId || uuidv4();
            const room = gameRooms.get(targetRoomId);

            // Check for duplicate nicknames only if the room exists
            if (room?.players?.some(p => p.nickname.toLowerCase() === nickname.toLowerCase())) {
                socket.emit('game:error', 'Nickname already taken in this room');
                return;
            }

            // Create player object
            const player: Player = {
                id: socket.id,
                nickname,
                score: 0,
                roomId: targetRoomId,
                isHost: !room // Player is host if room doesn't exist
            };

            // Create new room if it doesn't exist
            if (!room) {
                const newRoom: GameRoom = {
                    roomId: targetRoomId,
                    players: [player], // Initialize with the first player
                    status: 'waiting',
                    currentRound: 0,
                    maxRounds: 10,
                    answers: new Map(),
                    maxAttempts: 3,
                    currentAttempts: 0
                };
                gameRooms.set(targetRoomId, newRoom);
                socket.emit('game:roomCreated', targetRoomId);
                
                // Join the room
                socket.join(targetRoomId);
                
                // Send initial game state
                socket.emit('game:state', newRoom);
                return;
            }

            // For existing rooms
            socket.join(targetRoomId);
            
            // Add player to room's player list if not already present
            if (!room.players.find(p => p.id === player.id)) {
                room.players.push(player);
            }
            
            // Broadcast to all clients in the room
            io.to(targetRoomId).emit('game:playerJoined', player);

            // Send current game state to the new player
            socket.emit('game:state', room);

            console.log(`Player ${player.nickname} joined room ${targetRoomId}`);
        } catch (error) {
            console.error('Error joining game:', error);
            socket.emit('game:error', 'Failed to join game');
        }
    });

    // Add other game event handlers here
    socket.on('game:startGame', async () => {
        console.log('[Server] Received game:startGame event')
        const player = findPlayerBySocketId(socket.id, gameRooms)
        if (!player || !player.isHost) {
            console.log('[Server] Player not authorized:', { playerId: socket.id, isHost: player?.isHost })
            return
        }

        const room = gameRooms.get(player.roomId)
        if (!room) {
            console.log('[Server] Room not found:', player.roomId)
            return
        }

        const updatedRoom: GameRoom = {
            ...room,
            status: 'playing',
            currentRound: 1,
            currentTurn: room.players[0].id,
            maxAttempts: 3,
            currentAttempts: 0,
            timeRemaining: 30
        }
        
        gameRooms.set(player.roomId, updatedRoom)
        console.log('[Server] Emitting game:state:', {
            roomId: updatedRoom.roomId,
            status: updatedRoom.status,
            recipients: io.sockets.adapter.rooms.get(player.roomId)?.size
        })
        io.to(player.roomId).emit('game:state', updatedRoom)
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
    if (!room.currentTurn || room.players.length === 0) return;

    const currentPlayerIndex = room.players.findIndex(p => p.id === room.currentTurn);
    
    // Handle case where current player is not found
    if (currentPlayerIndex === -1) {
        room.currentTurn = room.players[0].id;
    } else {
        const nextPlayerIndex = (currentPlayerIndex + 1) % room.players.length;
        room.currentTurn = room.players[nextPlayerIndex].id;
    }

    // Reset turn state
    room.timeRemaining = 30;
    room.currentAttempts = 0;
    room.currentWord = undefined;
    room.category = undefined;

    // Check if we've completed a round
    if (currentPlayerIndex === room.players.length - 1) {
        room.currentRound++;
        if (room.currentRound > room.maxRounds) {
            room.status = 'finished';
        }
    }

    io.to(room.roomId).emit('game:state', room);
} 