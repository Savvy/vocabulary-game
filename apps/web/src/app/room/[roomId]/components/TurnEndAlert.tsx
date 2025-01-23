'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@vocab/shared';

interface TurnEndAlertProps {
    currentRound: number;
    players: Player[];
    currentTurn: string | undefined;
    wordsAnswered: Record<string, { correct: number; total: number; }>;
    scores: Record<string, number>;
}

export function TurnEndAlert({
    currentRound, 
    players, 
    currentTurn,
    wordsAnswered,
    scores 
}: TurnEndAlertProps) {
    const nextPlayer = players.find(p => p.id === currentTurn);
    const lastPlayer = players.find(p => wordsAnswered[p.id]?.total > 0);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full"
            >
                <Alert variant="default" className="border-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-xl">
                        {currentRound > 1 ? 'New Round Started!' : 'Turn Ended!'}
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                        <div className="space-y-2">
                            <p className="font-medium">
                                {nextPlayer?.nickname}&apos;s turn is next
                            </p>
                            {lastPlayer && (
                                <div className="text-sm text-muted-foreground">
                                    <p>
                                        Last turn: {wordsAnswered[lastPlayer.id].correct} correct 
                                        out of {wordsAnswered[lastPlayer.id].total} attempts
                                        <br />
                                        Score: +{scores[lastPlayer.id] || 0} points
                                    </p>
                                </div>
                            )}
                        </div>
                    </AlertDescription>
                </Alert>
            </motion.div>
        </AnimatePresence>
    );
} 