'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
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
                <h3 className="font-semibold text-lg">Players</h3>
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
                            className={cn(
                                'flex items-center justify-between p-6 rounded-xl',
                                'bg-gradient-to-r from-primary/10 to-transparent',
                                { 'from-primary/20': player.id === currentTurn }
                            )}
                        >
                            <div className="flex flex-grow items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-primary/30 flex items-center justify-center font-bold text-primary">
                                    {getPlayerRank(index)}
                                </span>
                                <div className="flex flex-col">
                                    <div className="space-x-2">
                                        <span className="font-medium">{player.nickname}</span>
                                        {player.isHost && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                Host
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {stats.correct}/{stats.total} words
                                    </span>
                                </div>
                            </div>
                            <div className="text-muted-foreground text-xl font-bold text-right">
                                {accuracy}%
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
} 