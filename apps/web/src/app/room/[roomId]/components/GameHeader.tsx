'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface GameHeaderProps {
    currentRound: number;
    maxRounds: number;
}

export function GameHeader({ currentRound, maxRounds }: GameHeaderProps) {
    const progress = (currentRound / maxRounds) * 100;

    return (
        <Card className="w-full p-4">
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        Round {currentRound} of {maxRounds}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                        {progress.toFixed(0)}% Complete
                    </span>
                </div>
                <Progress 
                    value={progress} 
                    className="h-2"
                />
            </div>
        </Card>
    );
} 