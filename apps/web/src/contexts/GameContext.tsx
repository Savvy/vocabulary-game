"use client";

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { GameState, Player, Word } from '@vocab/shared';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/use-toast';

type GameContextType = {
    state: GameState;
    joinGame: (nickname: string, roomId?: string) => void;
    leaveGame: () => void;
    spinWheel: () => void;
    submitAnswer: (answer: string) => void;
    startGame: () => void;
};

const initialState: GameState = {
    roomId: '',
    players: [],
    status: 'waiting',
    currentRound: 0,
    maxRounds: 10,
    maxAttempts: 3,
    currentAttempts: 0
};

type GameAction =
    | { type: 'SET_STATE'; payload: GameState }
    | { type: 'ADD_PLAYER'; payload: Player }
    | { type: 'REMOVE_PLAYER'; payload: string }
    | { type: 'SET_WORD'; payload: Word }
    | { type: 'SET_CATEGORY'; payload: string }
    | { type: 'UPDATE_SCORES'; payload: Record<string, number> };

function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'SET_STATE':
            return action.payload;
        case 'ADD_PLAYER':
            return {
                ...state,
                players: [...state.players, action.payload],
            };
        case 'REMOVE_PLAYER':
            return {
                ...state,
                players: state.players.filter((p) => p.id !== action.payload),
            };
        case 'SET_WORD':
            return {
                ...state,
                currentWord: action.payload,
            };
        case 'SET_CATEGORY':
            return {
                ...state,
                category: action.payload,
            };
        case 'UPDATE_SCORES':
            return {
                ...state,
                players: state.players.map(player => ({
                    ...player,
                    score: action.payload[player.id] || player.score,
                })),
            };
        default:
            return state;
    }
}

const GameContext = createContext<GameContextType>({} as GameContextType);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const { toast } = useToast();
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        // Handle game state updates
        socket.on('game:state', (newState) => {
            dispatch({ type: 'SET_STATE', payload: newState });
        });

        // Handle player joined
        socket.on('game:playerJoined', (player) => {
            dispatch({ type: 'ADD_PLAYER', payload: player });
            toast({
                title: "Player Joined",
                description: `${player.nickname} joined the game`,
            });
        });

        // Handle player left
        socket.on('game:playerLeft', (playerId) => {
            dispatch({ type: 'REMOVE_PLAYER', payload: playerId });
        });

        // Handle round start
        socket.on('game:roundStart', (word) => {
            dispatch({ type: 'SET_WORD', payload: word });
        });

        // Handle wheel spin
        socket.on('game:wheelSpun', (category) => {
            dispatch({ type: 'SET_CATEGORY', payload: category });
        });

        // Handle round end
        socket.on('game:roundEnd', (scores) => {
            dispatch({ type: 'UPDATE_SCORES', payload: scores });
        });

        return () => {
            socket.off('game:state');
            socket.off('game:playerJoined');
            socket.off('game:playerLeft');
            socket.off('game:roundStart');
            socket.off('game:wheelSpun');
            socket.off('game:roundEnd');
        };
    }, [socket, toast]);

    // Actions
    const joinGame = useCallback((nickname: string, roomId?: string) => {
        if (!socket) return;
        
        const handleConnect = () => {
            socket.emit('game:join', { nickname, roomId });
        };

        if (socket.connected) {
            handleConnect();
        } else {
            socket.connect();
            socket.once('connect', handleConnect);
        }
    }, [socket]);

    const leaveGame = useCallback(() => {
        if (!socket) return;
        socket.emit('game:leave');
        socket.disconnect();
    }, [socket]);

    const spinWheel = useCallback(() => {
        if (!socket) return;
        socket.emit('game:spinWheel');
    }, [socket]);

    const startGame = useCallback(() => {
        if (!socket) return;
        socket.emit('game:startGame');
    }, [socket]);

    const submitAnswer = useCallback((answer: string) => {
        if (!socket) return;
        socket.emit('game:answer', answer);
    }, [socket]);

    return (
        <GameContext.Provider
            value={{
                state,
                joinGame,
                leaveGame,
                spinWheel,
                submitAnswer,
                startGame
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};