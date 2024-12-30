'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Word } from '@vocab/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface WordDisplayProps {
    word: Word;
    isCurrentTurn: boolean;
    lastAnswer: { text: string; isCorrect: boolean | null };
    onAnswer: (answer: string) => void;
}

export function WordDisplay({ word, isCurrentTurn, lastAnswer, onAnswer }: WordDisplayProps) {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onAnswer(input.trim());
            setInput('');
        }
    };

    return (
        <Card className="w-full p-6">
            <div className="flex flex-col gap-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">
                        {word.word}
                    </h2>
                    {word.imageUrl && (
                        <img 
                            src={word.imageUrl} 
                            alt={word.word}
                            className="mx-auto max-h-48 object-contain mb-4"
                        />
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {lastAnswer.isCorrect !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`text-center font-semibold ${
                                lastAnswer.isCorrect ? 'text-green-500' : 'text-red-500'
                            }`}
                        >
                            {lastAnswer.isCorrect ? 'Correct!' : 'Try again!'}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your answer..."
                        className="flex-1"
                        autoComplete="off"
                        autoFocus
                        disabled={!isCurrentTurn}
                    />
                    <Button type="submit" disabled={!isCurrentTurn || !input.trim()}>
                        Submit
                    </Button>
                </form>
            </div>
        </Card>
    );
} 