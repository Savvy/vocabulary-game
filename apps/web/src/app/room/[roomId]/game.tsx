'use client';

import { useGame } from '@/contexts/GameContext';
import { useSocket } from '@/hooks/useSocket';
import { useEffect, useState } from 'react';
import { GameHeader } from './components/GameHeader';
import { TurnEndAlert } from './components/TurnEndAlert';
import { GameTimer } from './components/GameTimer';
import { CurrentPlayer } from './components/CurrentPlayer';
import { GameStage } from './components/GameStage';
import { WordDisplay } from './components/WordDisplay';
import { ScoreBoard } from './components/ScoreBoard';
import { GameEndView } from './components/GameEndView';

export function TimeAttackGame() {
    const { socket } = useSocket();
    const { state } = useGame();
    const isCurrentTurn = socket?.id === state.currentTurn;
    const [lastAnswer, setLastAnswer] = useState<{ text: string; isCorrect: boolean | null }>({ text: '', isCorrect: null });
    const [showTurnEnd, setShowTurnEnd] = useState(false);
    const [lastTurn, setLastTurn] = useState<string | null>(null);

    // Monitor turn changes and round changes
    useEffect(() => {
        const currentTurnId = state.currentTurn;

        if (state.status === 'playing' &&
            lastTurn &&
            lastTurn !== currentTurnId &&
            state.wordsAnswered[lastTurn]
        ) {
            setShowTurnEnd(true);
            const timer = setTimeout(() => setShowTurnEnd(false), 2000);
            return () => clearTimeout(timer);
        }

        if (currentTurnId !== lastTurn) {
            setLastTurn(currentTurnId || null);
        }
    }, [state.currentTurn, state.status, state.wordsAnswered, lastTurn]);

    if (state.status === 'finished') {
        return (
            <GameEndView
                players={state.players}
                wordsAnswered={state.wordsAnswered}
                scores={state.scores}
            />
        );
    }

    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-7xl p-6 mx-auto">
            <div className="flex items-center gap-8 w-full">
                <GameHeader
                    currentRound={state.currentRound}
                    maxRounds={state.maxRounds}
                />

                <GameTimer
                    timerStartedAt={state.timerStartedAt || 0}
                    roundDuration={state.roundTimeLimit}
                    isRunning={!!state.currentWord}
                />
            </div>

            <TurnEndAlert
                show={showTurnEnd}
                currentRound={state.currentRound}
                players={state.players}
                currentTurn={state.currentTurn}
                wordsAnswered={state.wordsAnswered}
                scores={state.scores}
            />

            <div className="w-full grid gap-6 lg:grid-cols-[1fr,350px]">
                <div className="space-y-6">
                    <CurrentPlayer
                        isCurrentTurn={isCurrentTurn}
                        players={state.players}
                        currentTurn={state.currentTurn}
                    />

                    <GameStage
                        isCurrentTurn={isCurrentTurn}
                        category={state.category}
                        onSpinComplete={() => socket?.emit('game:spinWheel')}
                        onStartTurn={() => socket?.emit('game:startTurn')}
                        hasStartedTurn={state.hasStartedTurn}
                    />

                    {state.currentWord && (
                        <WordDisplay
                            word={state.currentWord}
                            isCurrentTurn={isCurrentTurn}
                            lastAnswer={lastAnswer}
                            onAnswer={(answer) => {
                                setLastAnswer({ text: answer, isCorrect: null });
                                socket?.emit('game:answer', answer);

                                if (answer.toLowerCase() === state.currentWord?.translation.toLowerCase()) {
                                    setLastAnswer(prev => ({ ...prev, isCorrect: true }));
                                } else {
                                    setLastAnswer(prev => ({ ...prev, isCorrect: false }));
                                }

                                setTimeout(() => {
                                    setLastAnswer({ text: '', isCorrect: null });
                                }, 1500);
                            }}
                        />
                    )}
                </div>
                <ScoreBoard
                    players={state.players}
                    wordsAnswered={state.wordsAnswered}
                    currentTurn={state.currentTurn}
                />
            </div>
        </div>
    );
} 