import { BaseGameState, Player, Word } from '@vocab/shared';

export interface VocabularyState extends BaseGameState {
    currentWord?: Word;
    category?: string;
    currentTurn?: string;
    timeRemaining: number;
}

export interface VocabularyAction {
    type: 'SPIN_WHEEL' | 'SUBMIT_ANSWER';
    payload: {
        playerId: string;
        category?: string;
        answer?: string;
    };
}

export { Word }; 