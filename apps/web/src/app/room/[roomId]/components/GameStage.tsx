'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RouletteWheel } from '@/components/RouletteWheel';

interface GameStageProps {
    isCurrentTurn: boolean;
    categories: Array<{
        id: string;
        name: string;
        translation: string;
        style?: {
            backgroundColor: string;
            textColor: string;
        };
    }>;
    category?: string;
    hasStartedTurn?: boolean;
    onSpinComplete: (category: string, categoryId: string) => void;
    onStartTurn: () => void;
}

export function GameStage({
    isCurrentTurn,
    categories,
    category,
    hasStartedTurn = false,
    onSpinComplete,
    onStartTurn
}: GameStageProps) {
    if (!isCurrentTurn) return null;

    console.log('[GameStage] category', category);
    console.log('[GameStage] categories', categories);

    return (
        <Card className="w-full p-6">
            {!category ? (
                <div className="text-center">
                    <h4 className="text-lg font-semibold mb-4">Spin the wheel to get your category!</h4>
                    <RouletteWheel
                        categories={categories}
                        onSpinComplete={onSpinComplete}
                    />
                </div>
            ) : (
                <div className="text-center space-y-4">
                    <h4 className="text-lg font-semibold">
                        {category}
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