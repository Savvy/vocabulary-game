import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import {
    ClientToServerEvents,
    ServerToClientEvents} from '@vocab/shared';
import { TimeAttackGame } from '@vocab/game-engine';
import { getRandomWordsByCategory, getAllCategories } from '@vocab/database';
import { GameConfig } from '@vocab/game-engine/src/types';


export function setupGameHandlers(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    games: Map<string, TimeAttackGame>
) {
    socket.on('game:join', ({ nickname, roomId }) => {
        const targetRoomId = roomId || uuidv4();
        let game = games.get(targetRoomId);

        if (!game) {
            if (roomId) {
                socket.emit('game:error', 'Game not found');
                return;
            }
            game = new TimeAttackGame(targetRoomId);
            game.onStateChange = (state) => {
                io.to(targetRoomId).emit('game:state', state);
            };
            games.set(targetRoomId, game);
            socket.emit('game:roomCreated', targetRoomId);
        }

        const player = {
            id: socket.id,
            nickname,
            score: 0,
            roomId: targetRoomId,
            isHost: game.getState().players.length === 0
        };

        game.addPlayer(player);
        socket.join(targetRoomId);
        io.to(targetRoomId).emit('game:playerJoined', player);
        socket.emit('game:state', game.getState());
    });

    socket.on('game:spinWheel', async () => {
        console.log('Received game:spinWheel event');
        const game = findGameBySocketId(socket.id, games);
        if (!game) {
            console.error('Game not found');
            return;
        }

        if (socket.id !== game.getState().currentTurn) {
            socket.emit('game:error', 'Not your turn');
            return;
        }

        const categories = await getAllCategories();
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        game.dispatch({
            type: 'SPIN_WHEEL',
            payload: { 
                playerId: socket.id,
                category: randomCategory.name,
                categoryId: randomCategory.id
            }
        });

        io.to(game.getState().roomId).emit('game:wheelSpun', randomCategory.name);
    });

    socket.on('game:startTurn', async () => {
        const game = findGameBySocketId(socket.id, games);
        if (!game) return;

        if (socket.id !== game.getState().currentTurn) {
            socket.emit('game:error', 'Not your turn');
            return;
        }

        const { category, categoryId } = game.getState();
        if (!category || !categoryId) return;

        const dbWords = await getRandomWordsByCategory(categoryId, "en", 5);
        const words = dbWords.map(w => ({
            id: w.id,
            word: w.word,
            translation: w.translation,
            imageUrl: w.imageUrl || '',
            category: w.category.name,
            language: w.language.code,
            options: w.options
        }));
        
        game.setWordQueue(words);
        console.log('[Socket] Set word queue', words);
        game.dispatch({
            type: 'START_TURN',
            payload: { playerId: socket.id }
        });
        
        // Broadcast updated state to all players in the room
        io.to(game.getState().roomId).emit('game:state', game.getState());
    });

    socket.on('game:answer', (answer: string) => {
        const game = findGameBySocketId(socket.id, games);
        if (!game) return;

        game.dispatch({
            type: 'SUBMIT_ANSWER',
            payload: { 
                playerId: socket.id,
                answer 
            }
        });
    });

    socket.on('game:startGame', () => {
        const game = findGameBySocketId(socket.id, games);
        if (!game) return;

        const state = game.getState();
        const player = state.players.find(p => p.id === socket.id);
        
        if (!player?.isHost) {
            socket.emit('game:error', 'Only the host can start the game');
            return;
        }

        try {
            // Start the game using the game engine
            game.start();
            
            // Emit updated state to all players in the room
            io.to(state.roomId).emit('game:state', game.getState());
        } catch (error) {
            socket.emit('game:error', error instanceof Error ? error.message : 'Failed to start game');
        }
    });

    socket.on('game:updateConfig', (config: Partial<GameConfig>) => {
        const game = findGameBySocketId(socket.id, games);
        if (!game) return;

        const player = game.getState().players.find(p => p.id === socket.id);
        if (!player?.isHost) {
            socket.emit('game:error', 'Only the host can update game settings');
            return;
        }

        try {
            game.updateConfig(config);
            io.to(game.getState().roomId).emit('game:state', game.getState());
        } catch (error) {
            socket.emit('game:error', error instanceof Error ? error.message : 'Failed to update config');
        }
    });

    socket.on('disconnect', () => {
        console.log('[Socket] Disconnecting from socket', socket.id);
        const game = findGameBySocketId(socket.id, games);
        if (!game) return;

        console.log('[Socket] Game state FROM DISCONNECT BEFORE REMOVE', game.getState().roomId);
        game.removePlayer(socket.id);
        const state = game.getState();
        io.to(state.roomId).emit('game:playerLeft', socket.id);

        if (state.players.length === 0) {
            games.delete(state.roomId);
        }
    });
}

function findGameBySocketId(socketId: string, games: Map<string, TimeAttackGame>): TimeAttackGame | undefined {
    for (const game of games.values()) {
        if (game.getState().players.some(p => p.id === socketId)) {
            return game;
        }
    }
    return undefined;
} 