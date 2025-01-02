import { Player, BaseGameState } from '@vocab/shared';

export interface GameEngine<TState extends BaseGameState, TAction> {
    initialize(config: GameConfig): void;
    start(): void;
    end(): void;
    getState(): TState;
    dispatch(action: TAction): void;
    addPlayer(player: Player): void;
    removePlayer(playerId: string): void;
    startRound(): void;
    endRound(): void;
}

export interface GameConfig {
    maxPlayers: number;
    minPlayers: number;
    roundTimeLimit: number;
    maxRounds: number;
    scoreSystem: ScoreSystem;
    inputType: 'multiple-choice' | 'single-choice';
}

export interface ScoreSystem {
    basePoints: number;
    timeBonus?: boolean;
    timeBonusMultiplier?: number;
    streakBonus?: boolean;
    streakBonusMultiplier?: number;
}

// Internal engine types
export interface Round {
    roundNumber: number;
    startTime: number;
    endTime?: number;
    currentTurn?: string;
    state: 'preparing' | 'active' | 'evaluating' | 'complete';
    data: unknown;
}

export interface RoundResult {
    roundNumber: number;
    scores: Record<string, number>;
    correctAnswers: Record<string, boolean>;
    timeElapsed: number;
}

export interface GameResult {
    winner: string;
    finalScores: Record<string, number>;
    totalRounds: number;
    duration: number;
} 