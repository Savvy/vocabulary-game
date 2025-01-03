export type Player = {
    id: string;
    nickname: string;
    score: number;
    roomId: string;
    isHost: boolean;
};

export type Word = {
    id: string;
    word: string;
    translation: string;
    imageUrl: string;
    category: string;
    language: string;
    options: string[];
};

// Base game state used by both frontend and backend
export interface BaseGameState {
    roomId: string;
    players: Player[];
    status: 'waiting' | 'playing' | 'finished';
    currentRound: number;
    maxRounds: number;
    currentWord?: Word;
    category?: string;
    currentTurn?: string;
    timeRemaining?: number;
    scores: Record<string, number>;
    maxPlayers: number;
    roundTimeLimit: number;
    inputType: 'multiple-choice' | 'single-choice';
}

// Socket Events (keep as is)
export type ServerToClientEvents = {
    'game:state': (state: BaseGameState) => void;
    'game:playerJoined': (player: Player) => void;
    'game:playerLeft': (playerId: string) => void;
    'game:roundStart': (word: Word) => void;
    'game:roundEnd': (scores: Record<string, number>) => void;
    'game:wheelSpun': (category: string) => void;
    'game:roomCreated': (roomId: string) => void;
    'game:error': (message: string) => void;
};

export interface GameConfig {
    maxPlayers: number;
    roundTimeLimit: number;
    maxRounds: number;
    inputType: 'multiple-choice' | 'single-choice';
}

export type ClientToServerEvents = {
    'game:join': (payload: { nickname: string; roomId?: string }) => void;
    'game:leave': () => void;
    'game:spinWheel': (payload: { category: string; categoryId: string }) => void;
    'game:answer': (answer: string) => void;
    'game:startGame': () => void;
    'game:startTurn': () => void;
    'game:updateConfig': (config: Partial<GameConfig>) => void;
};

export interface TimeAttackState extends BaseGameState {
    currentWord?: Word;
    category?: string;
    currentTurn?: string;
    timeRemaining: number;
    timerStartedAt?: number;
    roundTimeLimit: number;
    hasStartedTurn: boolean;
    wordsAnswered: Record<string, { 
        correct: number;
        total: number;
    }>;
    categories: Array<{
        id: string;
        name: string;
        style?: {
            backgroundColor: string;
            textColor: string;
        };
    }>;
}