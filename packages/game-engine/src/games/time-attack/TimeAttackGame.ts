import { BaseGame } from '../../BaseGame.js';
import { TimeAttackState, TimeAttackAction } from './types';
import { Word } from '@vocab/shared';

export class TimeAttackGame extends BaseGame<TimeAttackState, TimeAttackAction> {
    private wordQueue: Word[] = [];
    private timer: ReturnType<typeof setInterval> | null = null;

    constructor(roomId: string) {
        super(
            {
                maxPlayers: 8,
                minPlayers: 1,
                roundTimeLimit: 30,
                maxRounds: 2, // Temporary for testing
                scoreSystem: {
                    basePoints: 1,
                    timeBonus: false,
                    timeBonusMultiplier: 0
                }
            },
            {
                roomId,
                timeRemaining: 30,
                currentRound: 0,
                status: 'waiting',
                wordsAnswered: {},
                roundTimeLimit: 30
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
        this.startRound();
    }

    startRound(): void {
        if (this.state.players.length === 0) return;
        
        // Set turn to first player when starting new round
        this.state.currentTurn = this.state.players[0].id;
        this.state.timeRemaining = this.config.roundTimeLimit;

        // Reset words
        this.state.currentWord = undefined;
        this.state.category = undefined;
        this.state.categoryId = undefined;
        this.wordQueue = [];

        console.log('[Game] State for round', this.state);

        // Notify state change
        this.onStateChange?.(this.state);
    }

    endRound(): void {
        if (this.state.currentRound >= this.config.maxRounds) {
            console.log('[Game] Current round:', this.state.currentRound);
            console.log('[Game] Max rounds:', this.config.maxRounds);
            
            // Check if the current round is complete (all players have had their turn)
            const currentPlayerIndex = this.state.players.findIndex(p => p.id === this.state.currentTurn);
            const isLastPlayer = currentPlayerIndex === this.state.players.length - 1;
            
            if (isLastPlayer) {
                console.log('[Game] Ending game, max rounds reached and last player finished');
                this.end();
                return;
            }
        }
        
        console.log('[Game] Starting next round');
        this.state.currentRound++;
        this.startRound();
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
        this.state.wordsAnswered[playerId].total++;
        
        if (isCorrect) {
            this.state.wordsAnswered[playerId].correct++;
            this.state.scores[playerId] = (this.state.scores[playerId] || 0) + this.config.scoreSystem.basePoints;
            
            // Only move to next word if answer was correct
            this.state.currentWord = this.wordQueue.shift();

            // End turn if no more words
            if (!this.state.currentWord) {
                this.endPlayerTurn(playerId);
                return;
            }
        }
        this.onStateChange?.(this.state);
    }

    private startTimer(): void {
        if (this.timer) {
            clearInterval(this.timer);
        }

        const startTime = Date.now();
        this.state.timerStartedAt = startTime;
        this.state.timeRemaining = this.config.roundTimeLimit;
        this.onStateChange?.(this.state);
        
        // Server only checks for turn end
        this.timer = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            
            if (elapsed >= this.config.roundTimeLimit) {
                this.endPlayerTurn(this.state.currentTurn!);
                return;
            }
            
            // Update time remaining every second for state consistency
            this.state.timeRemaining = Math.max(0, this.config.roundTimeLimit - elapsed);
        }, 1000);
    }

    private stopTimer(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private startPlayerTurn(playerId: string): void {
        if (playerId !== this.state.currentTurn) return;
        console.log('[Game] Starting player turn', playerId);
        if (this.wordQueue.length === 0) {
            console.log('[Game] No words left, ending turn');
            this.endPlayerTurn(playerId);
            return;
        }
        
        this.state.timeRemaining = this.config.roundTimeLimit;
        this.state.currentWord = this.wordQueue[0];
        this.state.hasStartedTurn = true;
        this.wordQueue = this.wordQueue.slice(1);
        console.log('[Game] Starting timer');
        this.startTimer();
        this.onStateChange?.(this.state);
    }

    private endPlayerTurn(playerId: string): void {
        if (playerId !== this.state.currentTurn) return;
        
        console.log('[Game] Ending player turn', playerId);
        this.stopTimer();
        this.state.currentWord = undefined;
        this.state.category = undefined;
        this.state.hasStartedTurn = false;
        
        // Check if all players have had their turn
        const currentPlayerIndex = this.state.players.findIndex(p => p.id === playerId);
        const isLastPlayer = currentPlayerIndex === this.state.players.length - 1;
        
        if (isLastPlayer) {
            console.log('[Game] Last player, ending round');
            /* this.state.currentRound++; */
            this.endRound();
        } else {
            console.log('[Game] Not last player, starting next turn');
            this.state.currentTurn = this.state.players[currentPlayerIndex + 1].id;
            this.onStateChange?.(this.state);
        }
    }

    // Add onStateChange callback for socket updates
    onStateChange?: (state: TimeAttackState) => void;

    // Override end method to cleanup
    end(): void {
        console.log('[Game] Ending game');
        this.stopTimer();
        
        // Reset game state
        this.state = {
            ...this.state,
            status: 'finished',
            currentWord: undefined,
            category: undefined,
            categoryId: undefined,
            currentTurn: undefined,
            timeRemaining: 0
        };
        
        // Notify state change one last time
        this.onStateChange?.(this.state);
        
        super.end();
    }

    setWordQueue(words: Word[]): void {
        this.wordQueue = words;
    }
} 