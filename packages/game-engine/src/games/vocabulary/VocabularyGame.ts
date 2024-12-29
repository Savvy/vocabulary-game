import { VocabularyState, VocabularyAction } from './types';
import { BaseGame } from '../../BaseGame';

export class VocabularyGame extends BaseGame<VocabularyState, VocabularyAction> {
    constructor() {
        super(
            {
                maxPlayers: 8,
                minPlayers: 1,
                roundTimeLimit: 30,
                maxRounds: 10,
                scoreSystem: {
                    basePoints: 3,
                    timeBonus: true,
                    timeBonusMultiplier: 0.1
                }
            },
            {
                timeRemaining: 30,
                currentRound: 0,
                status: 'waiting'
            }
        );
    }

    startRound(): void {
        throw new Error('Method not implemented.');
    }
    endRound(): void {
        throw new Error('Method not implemented.');
    }

    getState(): VocabularyState {
        return this.state;
    }

    // Implement only vocabulary-specific logic
    dispatch(action: VocabularyAction) {
        // ... vocabulary specific action handling
    }
} 