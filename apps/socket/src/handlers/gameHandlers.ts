import { Server, Socket } from 'socket.io';
import { nanoid } from 'nanoid';
import {
    ClientToServerEvents,
    ServerToClientEvents
} from '@vocab/shared';
import { TimeAttackGame } from '@vocab/game-engine';
import { getRandomWordsByCategory, getRandomCategories, getCategories } from '@vocab/database';
import { GameConfig } from '@vocab/game-engine/src/types';


export function setupGameHandlers(
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    games: Map<string, TimeAttackGame>
) {
    socket.on('game:join', async ({ nickname, roomId, sourceLanguage, targetLanguage }) => {
        const targetRoomId = roomId || nanoid(8);
        let game = games.get(targetRoomId);

        if (!game) {
            if (roomId) {
                socket.emit('game:error', 'Game not found');
                return;
            }
            game = new TimeAttackGame({
                roomId: targetRoomId,
                sourceLanguage,
                targetLanguage,
                categories: []
            });
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

    socket.on('game:spinWheel', async ({ category, categoryId }) => {
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

        game.dispatch({
            type: 'SPIN_WHEEL',
            payload: {
                playerId: socket.id,
                category,
                categoryId
            }
        });

        io.to(game.getState().roomId).emit('game:wheelSpun', category);
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
        const { sourceLanguage, targetLanguage } = game.getState();
        const dbWords = await getRandomWordsByCategory(categoryId, sourceLanguage, targetLanguage, 20);
        const words = dbWords.map((w, index) => {
            const sourceTranslation = w.translations.find(t =>
                t.languageId === sourceLanguage
            );

            const targetTranslation = w.translations.find(t =>
                t.languageId === targetLanguage
            );

            if (!sourceTranslation || !targetTranslation) {
                throw new Error(`Missing translations for word ${w.id}`);
            }

            // Get 3 random incorrect options from other words
            const otherWords = dbWords.filter((_, i) => i !== index);
            const incorrectOptions = otherWords
                .map(other => other.translations.find(t => t.languageId === targetLanguage)?.translation)
                .filter((translation): translation is string => !!translation)
                .slice(0, 3);

            // Combine correct answer with incorrect options
            const options = [targetTranslation.translation, ...incorrectOptions];

            return {
                id: w.id,
                word: sourceTranslation.translation,
                translation: targetTranslation.translation,
                imageUrl: w.imageUrl || '',
                category: w.categoryId,
                language: sourceTranslation.languageId,
                options: options
            };
        });

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

    socket.on('game:startGame', async () => {
        const game = findGameBySocketId(socket.id, games);
        if (!game) return;

        const state = game.getState();
        const player = state.players.find(p => p.id === socket.id);

        if (!player?.isHost) {
            socket.emit('game:error', 'Only the host can start the game');
            return;
        }

        // Set categories for game based on source and target language
        console.log("State categories", state.categories.length)
        if (state.categories.length === 0) {
            const categories = await getRandomCategories(6, state.sourceLanguage, state.targetLanguage);
            game.setCategories(categories)
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

    socket.on('game:updateConfig', async (config: Partial<GameConfig>) => {
        const game = findGameBySocketId(socket.id, games);
        if (!game) return;

        const player = game.getState().players.find(p => p.id === socket.id);
        if (!player?.isHost) {
            socket.emit('game:error', 'Only the host can update game settings');
            return;
        }

        if (config.categories) {
            const categories = await getCategories(
                config.categories as any as string[],
                game.getState().sourceLanguage,
                game.getState().targetLanguage
            );
            console.log("Categories from config", categories)
            config.categories = categories;
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