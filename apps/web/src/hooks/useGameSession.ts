import { useRouter } from 'next/navigation';

interface GameSession {
    nickname: string;
    roomId: string;
}

export function useGameSession() {
    const router = useRouter();

    const saveSession = (nickname: string, roomId: string) => {
        localStorage.setItem('gameSession', JSON.stringify({ nickname, roomId }));
    };

    const getSession = (): GameSession | null => {
        const session = localStorage.getItem('gameSession');
        return session ? JSON.parse(session) : null;
    };

    const clearSession = () => {
        localStorage.removeItem('gameSession');
    };

    const redirectToGame = (roomId: string) => {
        router.push(`/room/${roomId}`);
    };

    return {
        saveSession,
        getSession,
        clearSession,
        redirectToGame,
    };
}
