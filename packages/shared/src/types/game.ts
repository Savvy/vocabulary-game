export type Player = {
    id: string;
    nickname: string;
    score: number;
    roomId: string;
    isHost: boolean;
};

export type GameState = {
    roomId: string;
    players: Player[];
    currentWord?: Word;
    category?: string;
    status: 'waiting' | 'playing' | 'finished';
    roundStartTime?: number;
    currentRound: number;
    maxRounds: number;
    currentTurn?: string;
    timeRemaining?: number;
    maxAttempts: number;
    currentAttempts: number;
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

// Socket event types
export type ServerToClientEvents = {
    'game:state': (state: GameState) => void;
    'game:playerJoined': (player: Player) => void;
    'game:playerLeft': (playerId: string) => void;
    'game:roundStart': (word: Word) => void;
    'game:roundEnd': (scores: Record<string, number>) => void;
    'game:wheelSpun': (category: string) => void;
    'game:error': (message: string) => void;
};

export type ClientToServerEvents = {
    'game:join': (payload: { nickname: string; roomId?: string }) => void;
    'game:leave': () => void;
    'game:spinWheel': () => void;
    'game:answer': (answer: string) => void;
    'game:startGame': () => void;
};