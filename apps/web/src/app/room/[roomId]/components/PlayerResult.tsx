import { cn } from '@/lib/utils';
import { Medal, Crown } from 'lucide-react';

interface PlayerResultProps {
    nickname: string;
    wordsCorrect: number;
    totalWords: number;
    rank: number;
    isWinner?: boolean;
}

export function PlayerResult({ nickname, wordsCorrect, totalWords, rank, isWinner }: PlayerResultProps) {
    const getRankIcon = () => {
        if (isWinner) return <Crown className="w-5 h-5 text-amber-400" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
        return null;
    };

    const accuracy = totalWords > 0
        ? ((wordsCorrect / totalWords) * 100).toFixed(0)
        : '0';

    return (
        <div className={cn(
            "relative rounded-xl p-4 border transition-all",
            { 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/20': isWinner },
            { 'bg-[#1a2333] border-indigo-500/20': !isWinner }
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-xl bg-[#1a2333] border border-indigo-500/20",
                        "flex items-center justify-center"
                    )}>
                        {getRankIcon() || <span className="text-indigo-400 font-bold">#{rank}</span>}
                    </div>
                    <div>
                        <h3 className="font-bold text-white flex items-center gap-2">
                            {nickname}
                            {isWinner && (
                                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                                    Winner!
                                </span>
                            )}
                        </h3>
                        <p className="text-indigo-300/80 text-sm">{wordsCorrect} / {totalWords} words</p>
                    </div>
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                    {accuracy}%
                </div>
            </div>
        </ div>
    );
}