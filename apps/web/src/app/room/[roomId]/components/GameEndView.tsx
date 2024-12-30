'use client';

import { Player } from '@vocab/shared';
import { Card } from '@/components/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface GameEndViewProps {
    players: Player[];
    wordsAnswered: Record<string, { correct: number; total: number; }>;
    scores: Record<string, number>;
}

export function GameEndView({ players, wordsAnswered, scores }: GameEndViewProps) {
    const router = useRouter();

    // Sort players by score
    const sortedPlayers = [...players].sort((a, b) => scores[b.id] - scores[a.id]);
    const winner = sortedPlayers[0];

    useEffect(() => {
        // Trigger confetti for winner celebration
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, []);

    const getPlayerIcon = (index: number) => {
        switch (index) {
            case 0: return <Trophy className="h-8 w-8 text-yellow-500" />;
            case 1: return <Medal className="h-8 w-8 text-gray-400" />;
            case 2: return <Award className="h-8 w-8 text-amber-700" />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-5xl mx-auto">
            <Card className="w-full p-6 text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <Trophy className="h-16 w-16 text-yellow-500" />
                    <h1 className="text-3xl font-bold">Game Over!</h1>
                    <p className="text-xl">
                        🎉 Winner: <span className="font-bold">{winner.nickname}</span>
                    </p>
                </motion.div>
            </Card>

            <Card className="w-full p-6">
                <h2 className="text-xl font-bold mb-4">Final Results</h2>
                <div className="space-y-4">
                    {sortedPlayers.map((player, index) => {
                        const stats = wordsAnswered[player.id] || { correct: 0, total: 0 };
                        const accuracy = stats.total > 0
                            ? ((stats.correct / stats.total) * 100).toFixed(0)
                            : '0';

                        return (
                            <motion.div
                                key={player.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 rounded-lg bg-muted"
                            >
                                <div className="flex items-center gap-4">
                                    {getPlayerIcon(index)}
                                    <div>
                                        <p className="font-semibold">{player.nickname}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {stats.correct}/{stats.total} words • {accuracy}% accuracy
                                        </p>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold">
                                    {scores[player.id]} pts
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </Card>

            <Button 
                size="lg" 
                onClick={() => router.push('/')}
                className="mt-4"
            >
                Play Again
            </Button>
        </div>
    );
} 