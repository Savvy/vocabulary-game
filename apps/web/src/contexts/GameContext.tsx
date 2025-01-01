"use client";

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { BaseGameState, Player, Word, TimeAttackState } from '@vocab/shared';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/use-toast';
import { useGameSession } from '@/hooks/useGameSession';

type GameContextType = {
    state: TimeAttackState;
    joinGame: (nickname: string, roomId?: string) => void;
    leaveGame: () => void;
    spinWheel: () => void;
    submitAnswer: (answer: string) => void;
    startGame: () => void;
};

const initialState: TimeAttackState = {
    roomId: '',
    players: [],
    status: 'waiting',
    currentRound: 0,
    maxRounds: 10,
    scores: {},
    wordsAnswered: {},
    timeRemaining: 30,
    roundTimeLimit: 30,
    hasStartedTurn: false
};

type GameAction =
    | { type: 'SET_STATE'; payload: TimeAttackState }
    | { type: 'ADD_PLAYER'; payload: Player }
    | { type: 'REMOVE_PLAYER'; payload: string }
    | { type: 'SET_WORD'; payload: Word }
    | { type: 'SET_CATEGORY'; payload: string }
    | { type: 'UPDATE_SCORES'; payload: Record<string, number> }
    | { type: 'SET_ROOM_ID'; payload: string };

function gameReducer(state: TimeAttackState, action: GameAction): TimeAttackState {
    switch (action.type) {
        case 'SET_STATE':
            // Prevent unnecessary state updates if the game is finished
            if (state.status === 'finished' && action.payload.status === 'finished') {
                return state;
            }
            
            return {
                ...state,
                status: action.payload.status,
                currentRound: action.payload.currentRound,
                maxRounds: action.payload.maxRounds,
                timeRemaining: action.payload.timeRemaining,
                timerStartedAt: action.payload.timerStartedAt,
                currentWord: action.payload.currentWord,
                category: action.payload.category,
                currentTurn: action.payload.currentTurn,
                hasStartedTurn: action.payload.hasStartedTurn,
                players: action.payload.players || state.players,
                scores: action.payload.scores || state.scores,
                wordsAnswered: action.payload.wordsAnswered || state.wordsAnswered
            };
        case 'ADD_PLAYER':
            if (state.players.some(p => p.id === action.payload.id)) {
                return state;
            }
            return {
                ...state,
                players: [...state.players, action.payload],
            };
        case 'REMOVE_PLAYER':
            return {
                ...state,
                players: state.players.filter((p: Player) => p.id !== action.payload),
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
                scores: action.payload,
            };
        case 'SET_ROOM_ID':
            return {
                ...state,
                roomId: action.payload,
            };
        default:
            return state;
    }
}

const GameContext = createContext<GameContextType>({} as GameContextType);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const { toast } = useToast();
    const { socket } = useSocket();
    const { saveSession, clearSession } = useGameSession();

    useEffect(() => {
        if (!socket) {
            console.log('[GameContext] Socket not connected');
            return;
        }

        socket.on('connect', () => {
            console.log('[Socket] Connected with ID:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
        });

        const handleGameState = (newState: BaseGameState) => {
                dispatch({ type: 'SET_STATE', payload: newState as TimeAttackState });
        };

        socket.on('game:state', handleGameState);
        
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('game:state', handleGameState);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) return;

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

        // Add new room created handler
        socket.on('game:roomCreated', (roomId: string) => {
            dispatch({ type: 'SET_ROOM_ID', payload: roomId });
        });

        return () => {
            socket.off('game:playerJoined');
            socket.off('game:playerLeft');
            socket.off('game:roundStart');
            socket.off('game:wheelSpun');
            socket.off('game:roundEnd');
            socket.off('game:roomCreated');
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) return;

        socket.on('game:error', (message) => {
            toast({
                variant: "destructive",
                title: "Game Error",
                description: message,
            });
        });

        return () => {
            socket.off('game:error');
        };
    }, [socket, toast]);

    // Actions
    const joinGame = useCallback((nickname: string, roomId?: string) => {
        if (!socket) return;
        
        const handleConnect = () => {
            socket.emit('game:join', { nickname, roomId });
            saveSession(nickname, roomId || '');
        };

        if (socket.connected) {
            handleConnect();
        } else {
            socket.connect();
            socket.once('connect', handleConnect);
        }
    }, [socket, saveSession]);

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
        if (!socket) {
            console.log('Socket not connected');
            return;
        }
        console.log('Emitting game:startGame event');
        socket.emit('game:startGame');
    }, [socket]);

    const submitAnswer = useCallback((answer: string) => {
        if (!socket) return;
        socket.emit('game:answer', answer);
    }, [socket]);

    useEffect(() => {
        if (state.status === 'finished') {
            clearSession();
        }
    }, [state.status, clearSession]);

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