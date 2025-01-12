'use client';

import { Player } from '@vocab/shared';
import { ArrowRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useEffect, useMemo } from 'react';
import { GameStats } from './GameStats';
import { PlayerResult } from './PlayerResult';
import { useGame } from '@/contexts/GameContext';

interface GameEndViewProps {
    players: Player[];
    wordsAnswered: Record<string, { correct: number; total: number; }>;
    scores: Record<string, number>;
    rounds: number;
    gameStartedAt?: number;
    gameEndedAt?: number;
}

// Calculate game duration
const formatDuration = (startTime?: number, endTime?: number) => {
    if (!startTime || !endTime) return "00:00";
    const durationInSeconds = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export function GameEndView({ players, wordsAnswered, rounds, gameStartedAt, gameEndedAt }: GameEndViewProps) {
    const router = useRouter();
    const { resetGame } = useGame();

    const gameDuration = useMemo(() => formatDuration(gameStartedAt, gameEndedAt), [gameStartedAt, gameEndedAt]);

    // Sort players by score
    // const sortedPlayers = [...players].sort((a, b) => scores[b.id] - scores[a.id]);
    const sortedPlayers = [...players].sort((a, b) => {
        const playerA = wordsAnswered[a.id];
        const playerB = wordsAnswered[b.id];

        // Calculate accuracy percentage (avoid division by zero)
        const accuracyA = playerA.total > 0 ? (playerA.correct / playerA.total) : 0;
        const accuracyB = playerB.total > 0 ? (playerB.correct / playerB.total) : 0;

        // Final score combines correct answers and accuracy
        const scoreA = (playerA.correct * 100) + (accuracyA * 50);
        const scoreB = (playerB.correct * 100) + (accuracyB * 50);

        return scoreB - scoreA;
    });

    useEffect(() => {
        // Trigger confetti for winner celebration
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.3 },
        });
    }, []);

    /* const getPlayerIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="h-8 w-8 text-yellow-500" />;
            case 1: return <Medal className="h-8 w-8 text-gray-400" />;
            case 2: return <Award className="h-8 w-8 text-amber-700" />;
            default: return null;
        }
    }; */

    const handlePlayAgain = () => {
        resetGame();
        router.push('/');
    };

    return (
        <div className="max-w-2xl mx-auto p-6 relative">
            <div className="text-center mb-12">
                <div className="inline-block p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 
                        to-yellow-500/20 border border-amber-500/20 mb-4">
                    <Trophy className="w-8 h-8 text-amber-400" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-amber-200 
                        bg-clip-text text-transparent mb-2">
                    Game Over!
                </h1>
                <p className="text-indigo-300/80">Here&apos;s how everyone performed</p>
            </div>

            <div className="grid gap-6 mb-8 relative z-10">
                {sortedPlayers.map((player, index) => (
                    <PlayerResult
                        key={player.id}
                        rank={index + 1}
                        nickname={player.nickname}
                        wordsCorrect={wordsAnswered[player.id].correct}
                        totalWords={wordsAnswered[player.id].total}
                        isWinner={index === 0}
                    />
                ))}
            </div>

            <GameStats
                totalWords={Object.values(wordsAnswered).reduce((acc, curr) => acc + curr.total, 0)}
                totalTime={gameDuration}
                rounds={rounds}
            />
            <Button
                size="lg"
                onClick={handlePlayAgain}
                className="mt-8 w-full py-3 px-6 font-bold group"
            >
                Play Again
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
        </div>
    );
} 