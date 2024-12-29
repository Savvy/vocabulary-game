'use client';

import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSocket } from '@/hooks/useSocket';
import { Player } from '@vocab/shared';
import { RouletteWheel } from '@/components/RouletteWheel';
import { Input } from '@/components/ui/input';

export function TimeAttackGame() {
    const { socket } = useSocket();
    const { state } = useGame();
    const isCurrentTurn = socket?.id === state.currentTurn;

    const handleSpinComplete = () => {
        if (socket?.connected) {
            socket.emit('game:spinWheel');
        }
    };

    const handleAnswer = (answer: string) => {
        socket?.emit('game:answer', answer);
    };

    const handleStartTurn = () => {
        socket?.emit('game:startTurn');
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
            {/* Timer */}
            <div className="w-full">
                <Progress 
                    value={(state.timeRemaining || 0) / 30 * 100} 
                    className="h-3 transition-all duration-75 ease-linear"
                />
                <p className="text-center mt-2">
                    Time: {(state.timeRemaining || 0).toFixed(1)}s
                </p>
            </div>

            {/* Current Player */}
            <div className="text-center">
                <h3 className="text-lg font-semibold">
                    {isCurrentTurn ? "Your Turn!" : 
                        `${state.players.find((p: Player) => p.id === state.currentTurn)?.nickname}'s Turn`}
                </h3>
            </div>

            {/* Game Stage */}
            {isCurrentTurn && !state.category && (
                <Card className="p-6 text-center">
                    <h4 className="mb-4">Spin the wheel to get your category!</h4>
                    <RouletteWheel onSpinComplete={handleSpinComplete} />
                </Card>
            )}

            {isCurrentTurn && state.category && !state.currentWord && (
                <Card className="p-6 text-center">
                    <h4 className="mb-4">Category: {state.category}</h4>
                    <Button onClick={handleStartTurn}>
                        Start Turn
                    </Button>
                </Card>
            )}

            {/* Word Display */}
            {state.currentWord && (
                <Card className="p-6 w-full">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">
                            {state.currentWord.word}
                        </h2>
                        {state.currentWord.imageUrl && (
                            <img 
                                src={state.currentWord.imageUrl} 
                                alt={state.currentWord.word}
                                className="mx-auto max-h-48 object-contain"
                            />
                        )}
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem('answer') as HTMLInputElement;
                        if (input.value) {
                            handleAnswer(input.value);
                            input.value = '';
                        }
                    }} className="flex gap-2">
                        <Input
                            name="answer"
                            placeholder="Type your answer..."
                            className="flex-1"
                            autoComplete="off"
                            autoFocus
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Card>
            )}

            {/* Score Display */}
            <div className="w-full">
                <h3 className="text-lg font-semibold mb-2">Scores</h3>
                <div className="grid gap-2">
                    {state.players.map((player: Player) => (
                        <div 
                            key={player.id} 
                            className="flex justify-between items-center"
                        >
                            <span>{player.nickname}</span>
                            <span className="font-mono">
                                {state.wordsAnswered[player.id]?.correct || 0}/ 
                                {state.wordsAnswered[player.id]?.total || 0}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 