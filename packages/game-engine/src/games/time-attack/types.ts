import { BaseGameState, Word } from '@vocab/shared';

export interface TimeAttackState extends BaseGameState {
    currentWord?: Word;
    category?: string;
    categoryId?: string;
    currentTurn?: string;
    timeRemaining: number;
    timerStartedAt?: number;
    gameStartedAt?: number;
    gameEndedAt?: number;
    roundTimeLimit: number;
    hasStartedTurn?: boolean;
    categories: Array<{
        id: string;
        name: string;
        style?: {
            backgroundColor: string;
            textColor: string;
        };
    }>;
    wordsAnswered: Record<string, { 
        correct: number;
        total: number;
    }>;
    sourceLanguage: string;
    targetLanguage: string;
}

export interface TimeAttackAction {
    type: 'SPIN_WHEEL' | 'SUBMIT_ANSWER' | 'START_TURN' | 'END_TURN';
    payload: {
        playerId: string;
        category?: string;
        categoryId?: string;
        answer?: string;
    };
}