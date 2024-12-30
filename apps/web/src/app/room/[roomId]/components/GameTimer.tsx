'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Timer } from 'lucide-react';

interface GameTimerProps {
    timeRemaining: number;
}

export function GameTimer({ timeRemaining }: GameTimerProps) {
    const maxTime = 30; // This should match the game config
    const progress = (timeRemaining / maxTime) * 100;
    const isLowTime = timeRemaining <= 5;

    return (
        <Card className="w-full p-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    <span className={`font-mono text-lg ${
                        isLowTime ? 'text-red-500 font-bold' : ''
                    }`}>
                        {timeRemaining.toFixed(1)}s
                    </span>
                </div>
                <Progress 
                    value={progress} 
                    className={`h-2 transition-all duration-75 ${
                        isLowTime ? '[&>div]:bg-red-500 bg-red-200' : ''
                    }`}
                />
            </div>
        </Card>
    );
} 