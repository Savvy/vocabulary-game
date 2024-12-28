import { GameState } from '@vocab/shared';

export interface GameRoom extends GameState {
    answers?: Map<string, boolean>;
} 