import { BaseGame } from '../../BaseGame.js';
import { TimeAttackState, TimeAttackAction } from './types';
import { Word } from '@vocab/shared';

export class TimeAttackGame extends BaseGame<TimeAttackState, TimeAttackAction> {
    private wordQueue: Word[] = [];
    private timer: ReturnType<typeof setInterval> | null = null;
    private startTime: number = 0;

    constructor() {
        super(
            {
                maxPlayers: 8,
                minPlayers: 1,
                roundTimeLimit: 30,
                maxRounds: 10,
                scoreSystem: {
                    basePoints: 1,
                    timeBonus: false,
                    timeBonusMultiplier: 0
                }
            },
            {
                timeRemaining: 30,
                currentRound: 0,
                status: 'waiting',
                wordsAnswered: {}
            }
        );
    }

    start(): void {
        if (this.state.players.length < this.config.minPlayers) {
            throw new Error('Not enough players');
        }
        
        this.state.status = 'playing';
        this.state.currentRound = 1;
        this.state.timeRemaining = this.config.roundTimeLimit;
        
        // Set initial turn to first player
        this.state.currentTurn = this.state.players[0].id;
        
        // Notify state change
        this.onStateChange?.(this.state);
        
        // Start the first round
        this.startRound();
    }

    startRound(): void {
        if (this.state.players.length === 0) return;
        
        const currentPlayerIndex = this.state.currentTurn 
            ? this.state.players.findIndex(p => p.id === this.state.currentTurn)
            : -1;
            
        const nextPlayerIndex = (currentPlayerIndex + 1) % this.state.players.length;
        this.state.currentTurn = this.state.players[nextPlayerIndex].id;
        this.state.timeRemaining = this.config.roundTimeLimit;
        this.state.currentWord = undefined;
        this.state.category = undefined;
        
        if (nextPlayerIndex === 0) {
            this.state.currentRound++;
        }

        // Notify state change
        this.onStateChange?.(this.state);
    }

    endRound(): void {
        if (this.state.currentRound >= this.config.maxRounds) {
            this.end();
        } else {
            this.startRound();
        }
    }

    dispatch(action: TimeAttackAction): void {
        switch (action.type) {
            case 'SPIN_WHEEL':
                this.handleSpinWheel(action.payload.category!, action.payload.playerId, action.payload.categoryId!);
                break;
            case 'SUBMIT_ANSWER':
                this.handleAnswer(action.payload.answer!, action.payload.playerId);
                break;
            case 'START_TURN':
                this.startPlayerTurn(action.payload.playerId);
                break;
            case 'END_TURN':
                this.endPlayerTurn(action.payload.playerId);
                break;
        }
    }

    getState(): TimeAttackState {
        return this.state;
    }

    private handleSpinWheel(category: string, playerId: string, categoryId: string): void {
        if (playerId !== this.state.currentTurn) return;
        this.state.category = category;
        this.state.categoryId = categoryId;
        this.onStateChange?.(this.state);
    }

    private handleAnswer(answer: string, playerId: string): void {
        if (playerId !== this.state.currentTurn || !this.state.currentWord) return;

        const isCorrect = answer.toLowerCase() === this.state.currentWord.translation.toLowerCase();
        
        // Update player's word count
        if (!this.state.wordsAnswered[playerId]) {
            this.state.wordsAnswered[playerId] = { correct: 0, total: 0 };
        }
        
        if (isCorrect) {
            this.state.wordsAnswered[playerId].correct++;
            this.state.scores[playerId] = (this.state.scores[playerId] || 0) + this.config.scoreSystem.basePoints;
        }
        
        this.state.wordsAnswered[playerId].total++;
        
        // Move to next word if available
        this.state.currentWord = this.wordQueue.shift();

        // End turn if no more words
        if (!this.state.currentWord) {
            this.endPlayerTurn(playerId);
            return;
        }

        this.onStateChange?.(this.state);
    }

    private startTimer(): void {
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.startTime = Date.now();
        
        this.timer = setInterval(() => {
            const elapsed = (Date.now() - this.startTime) / 1000;
            this.state.timeRemaining = Math.max(0, this.config.roundTimeLimit - elapsed);
            
            if (this.state.timeRemaining <= 0) {
                this.endPlayerTurn(this.state.currentTurn!);
                return;
            }

            this.onStateChange?.(this.state);
        }, 16); // ~60fps update rate
    }

    private stopTimer(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private startPlayerTurn(playerId: string): void {
        if (playerId !== this.state.currentTurn) return;
        if (this.wordQueue.length === 0) return;
        
        this.state.timeRemaining = this.config.roundTimeLimit;
        this.state.currentWord = this.wordQueue[0]; // Get first word
        this.wordQueue = this.wordQueue.slice(1); // Remove first word
        this.startTimer();
        this.onStateChange?.(this.state);
    }

    private endPlayerTurn(playerId: string): void {
        if (playerId !== this.state.currentTurn) return;
        
        this.stopTimer();
        this.state.currentWord = undefined;
        this.state.category = undefined;
        this.endRound();
        this.onStateChange?.(this.state);
    }

    // Add onStateChange callback for socket updates
    onStateChange?: (state: TimeAttackState) => void;

    // Override end method to cleanup
    end(): void {
        this.stopTimer();
        super.end();
    }

    setWordQueue(words: Word[]): void {
        this.wordQueue = words;
    }
} 