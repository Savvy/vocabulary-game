import { Player, BaseGameState } from '@vocab/shared';
import { GameEngine, GameConfig } from './types';

export abstract class BaseGame<TState extends BaseGameState, TAction> implements GameEngine<TState, TAction> {
    protected state: TState;
    protected config: GameConfig;

    constructor(config: GameConfig, initialState: Partial<TState>) {
        this.config = config;
        this.state = {
            roomId: '',
            players: [],
            status: 'waiting',
            currentRound: 0,
            maxRounds: config.maxRounds,
            scores: {},
            timeRemaining: config.roundTimeLimit,
            ...initialState
        } as unknown as TState;
    }

    initialize(config: GameConfig): void {
        this.config = config;
        this.state.maxRounds = config.maxRounds;
    }

    start(): void {
        if (this.state.players.length < this.config.minPlayers) {
            throw new Error('Not enough players');
        }
        this.state.status = 'playing';
        this.startRound();
    }

    end(): void {
        this.state.status = 'finished';
    }

    addPlayer(player: Player): void {
        if (this.state.players.length >= this.config.maxPlayers) {
            throw new Error('Room is full');
        }
        this.state.players.push(player);
        this.state.scores[player.id] = 0;
    }

    removePlayer(playerId: string): void {
        this.state.players = this.state.players.filter(p => p.id !== playerId);
        delete this.state.scores[playerId];
    }

    abstract startRound(): void;
    abstract endRound(): void;
    abstract dispatch(action: TAction): void;
    abstract getState(): TState;

    protected calculateTimeBonus(timeRemaining: number): number {
        if (!this.config.scoreSystem.timeBonus) return 0;
        return Math.floor(timeRemaining * (this.config.scoreSystem.timeBonusMultiplier || 0.1));
    }
} 