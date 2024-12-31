'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RouletteWheel } from '@/components/RouletteWheel';

interface GameStageProps {
    isCurrentTurn: boolean;
    category?: string;
    hasStartedTurn?: boolean;
    onSpinComplete: () => void;
    onStartTurn: () => void;
}

export function GameStage({ 
    isCurrentTurn, 
    category, 
    hasStartedTurn = false,
    onSpinComplete, 
    onStartTurn 
}: GameStageProps) {
    if (!isCurrentTurn) return null;

    return (
        <Card className="w-full p-6">
            {!category ? (
                <div className="text-center">
                    <h4 className="text-lg font-semibold mb-4">Spin the wheel to get your category!</h4>
                    <RouletteWheel onSpinComplete={onSpinComplete} />
                </div>
            ) : (
                <div className="text-center">
                    <h4 className="text-lg font-semibold mb-4">
                        Category: {category}
                    </h4>
                    {!hasStartedTurn && (
                        <Button onClick={onStartTurn}>
                            Start Turn
                        </Button>
                    )}
                </div>
            )}
        </Card>
    );
} 