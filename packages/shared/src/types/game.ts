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

export type ClientToServerEvents = {
    'game:join': (payload: { nickname: string; roomId?: string }) => void;
    'game:leave': () => void;
    'game:spinWheel': () => void;
    'game:answer': (answer: string) => void;
    'game:startGame': () => void;
    'game:startTurn': () => void;
};

export interface TimeAttackState extends BaseGameState {
    currentWord?: Word;
    category?: string;
    currentTurn?: string;
    timeRemaining: number;
    timerStartedAt?: number;
    roundTimeLimit: number;
    wordsAnswered: Record<string, { 
        correct: number;
        total: number;
    }>;
}