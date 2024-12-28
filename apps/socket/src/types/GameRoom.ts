import { GameState } from '@vocab/shared';

export interface GameRoom extends Omit<GameState, 'category'> {} 