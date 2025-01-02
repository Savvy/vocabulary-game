'use client';

import { Player } from '@vocab/shared';
import { ArrowRight, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { GameStats } from './GameStats';
import { PlayerResult } from './PlayerResult';

interface GameEndViewProps {
    players: Player[];
    wordsAnswered: Record<string, { correct: number; total: number; }>;
    scores: Record<string, number>;
}

export function GameEndView({ players, wordsAnswered, scores }: GameEndViewProps) {
    const router = useRouter();

    // Sort players by score
    const sortedPlayers = [...players].sort((a, b) => scores[b.id] - scores[a.id]);
    // const winner = sortedPlayers[0];

    useEffect(() => {
        // Trigger confetti for winner celebration
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.3 },
            zIndex: -1
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
                        score={scores[player.id]}
                        words={wordsAnswered[player.id].total}
                        isWinner={index === 0}
                    />
                ))}
            </div>

            <GameStats
                totalWords={45}
                totalTime="5:32"
                categories={['Animals', 'Food', 'Sports']}
            />

            {/* <button
                onClick={onPlayAgain}
                className="w-full group relative py-3 px-6 rounded-xl bg-indigo-500 
                   hover:bg-indigo-400 text-white font-medium transition-all 
                   overflow-hidden mt-8"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 
                       to-violet-400/20 opacity-0 group-hover:opacity-100 
                       transition-opacity" />
                <span className="relative flex items-center justify-center gap-2">
                    Play Again
                    <ArrowRight className="w-5 h-5" />
                </span>
            </button> */}
             <Button 
                size="lg" 
                onClick={() => router.push('/')}
                className="mt-8 w-full py-3 px-6 font-bold group"
            >
                Play Again
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
        </div>
    );
} 