'use client';

import { Card } from '@/components/ui/card';
import { Player } from '@vocab/shared';
import { Trophy } from 'lucide-react';

interface ScoreBoardProps {
    players: Player[];
    wordsAnswered: Record<string, { correct: number; total: number; }>;
    currentTurn: string | undefined;
}

export function ScoreBoard({ players, wordsAnswered, currentTurn }: ScoreBoardProps) {
    // Sort players by correct answers
    const sortedPlayers = [...players].sort((a, b) => {
        const aCorrect = wordsAnswered[a.id]?.correct || 0;
        const bCorrect = wordsAnswered[b.id]?.correct || 0;
        return bCorrect - aCorrect;
    });

    const getPlayerRank = (index: number) => {
        if (index === 0) return '🥇'
        if (index === 1) return '🥈'
        if (index === 2) return '🥉'
        return `${index + 1}th`
    }

    return (
        <Card className="w-full p-4">
            <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Scoreboard</h3>
            </div>

            <div className="space-y-2">
                {sortedPlayers.map((player, index) => {
                    const stats = wordsAnswered[player.id] || { correct: 0, total: 0 };
                    const accuracy = stats.total > 0
                        ? ((stats.correct / stats.total) * 100).toFixed(0)
                        : '0';

                    return (
                        <div
                            key={player.id}
                            className={`flex items-center justify-between p-2 rounded ${player.id === currentTurn ? 'bg-secondary' : ''
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold w-8">
                                    {getPlayerRank(index)}
                                </span>
                                <span className="font-medium">
                                    {player.nickname}
                                </span>
                                {player.isHost && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        Host
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                                <span>
                                    {stats.correct}/{stats.total} words
                                </span>
                                <span className="w-16 text-right">
                                    {accuracy}% acc
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
} 