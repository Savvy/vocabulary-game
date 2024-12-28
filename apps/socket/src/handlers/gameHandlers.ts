import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import {
    ClientToServerEvents,
    ServerToClientEvents,
    GameState,
    Player
} from '@vocab/shared';
import { GameRoom } from '../types/GameRoom';

export function setupGameHandlers(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    gameRooms: Map<string, GameRoom>
) {
    socket.on('game:join', ({ nickname, roomId }) => {
        try {
            const player: Player = {
                id: socket.id,
                nickname,
                score: 0,
                roomId: roomId || uuidv4(),
                isHost: false
            };

            let room = gameRooms.get(player.roomId);

            if (!room) {
                // Create new room if it doesn't exist
                player.isHost = true;
                room = {
                    roomId: player.roomId,
                    players: [],
                    status: 'waiting',
                    currentRound: 0,
                    maxRounds: 10
                };
                gameRooms.set(player.roomId, room);
            }

            // Join socket room
            socket.join(player.roomId);
            room.players.push(player);

            // Notify room of new player
            io.to(player.roomId).emit('game:playerJoined', player);

            // Send current game state to new player
            socket.emit('game:state', {
                roomId: room.roomId,
                players: room.players,
                status: room.status,
                currentRound: room.currentRound,
                maxRounds: room.maxRounds
            });
        } catch (error) {
            socket.emit('game:error', 'Failed to join game');
        }
    });

    // Add other game event handlers here
    socket.on('game:startGame', () => {
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