'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from './ui/card'
import { Button } from './ui/button'
import Image from 'next/image'
import { Word } from '@vocab/shared'
import { useGame } from '@/contexts/GameContext'

interface WordDisplayProps {
    word: Word
    disabled?: boolean
    onAnswer: (answer: string) => void
}

export function WordDisplay({ word, disabled, onAnswer }: WordDisplayProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [showResult, setShowResult] = useState(false)
    const { submitAnswer } = useGame()

    const handleAnswer = (answer: string) => {
        if (disabled || selectedAnswer) return

        setSelectedAnswer(answer)
        setShowResult(true)
        submitAnswer(answer)
        onAnswer(answer)

        // Reset after delay
        setTimeout(() => {
            setSelectedAnswer(null)
            setShowResult(false)
        }, 2000)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl mx-auto"
        >
            <Card className="p-6">
                <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold">{word.word}</h3>
                    <p className="text-gray-500">Category: {word.category}</p>
                </div>
                
                <motion.div
                    className="aspect-video relative rounded-lg overflow-hidden mb-6"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <Image
                        src={word.imageUrl}
                        alt={word.word}
                        fill
                        className="object-cover"
                        priority
                    />
                </motion.div>

                <div className="grid grid-cols-2 gap-4">
                    {word.options.map((option) => (
                        <Button
                            key={option}
                            onClick={() => handleAnswer(option)}
                            disabled={disabled || !!selectedAnswer}
                            variant={selectedAnswer === option ? "secondary" : "outline"}
                            className={`p-4 h-auto text-lg ${
                                showResult && option === word.translation
                                    ? "bg-green-100 border-green-500"
                                    : showResult && option === selectedAnswer
                                    ? "bg-red-100 border-red-500"
                                    : ""
                            }`}
                        >
                            {option}
                        </Button>
                    ))}
                </div>
            </Card>
        </motion.div>
    )
}