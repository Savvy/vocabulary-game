"use client"

interface GameStatsProps {
    totalWords: number;
    totalTime: string;
    categories: string[];
}

export function GameStats({ totalWords, totalTime, categories }: GameStatsProps) {
    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#1a2333] rounded-xl p-4 border border-indigo-500/20">
                <div className="text-indigo-300/80 text-sm mb-1">Total Words</div>
                <div className="text-2xl font-bold text-white">{totalWords}</div>
            </div>

            <div className="bg-[#1a2333] rounded-xl p-4 border border-indigo-500/20">
                <div className="text-indigo-300/80 text-sm mb-1">Game Time</div>
                <div className="text-2xl font-bold text-white">{totalTime}</div>
            </div>

            <div className="bg-[#1a2333] rounded-xl p-4 border border-indigo-500/20">
                <div className="text-indigo-300/80 text-sm mb-1">Categories</div>
                <div className="text-2xl font-bold text-white">{categories.length}</div>
            </div>
        </div>
    );
}