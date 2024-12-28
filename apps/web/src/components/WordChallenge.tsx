import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useGame } from '@/contexts/GameContext'
import Image from 'next/image'

interface WordChallengeProps {
    category: string
}

export function WordChallenge({ category }: WordChallengeProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const { state, submitAnswer } = useGame()
    const { currentWord } = state

    useEffect(() => {
        // Auto focus the input when component mounts
        inputRef.current?.focus()
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const answer = inputRef.current?.value
        if (answer) {
            submitAnswer(answer)
            inputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-6">
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-center"
            >
                Category: {category}
            </motion.h2>

            {currentWord && (
                <Card className="overflow-hidden">
                    <div className="aspect-video relative">
                        <Image
                            src={currentWord.imageUrl}
                            alt="Word to guess"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                    <div className="p-4">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                ref={inputRef}
                                placeholder="Type your answer..."
                                className="flex-1"
                                autoComplete="off"
                            />
                            <Button type="submit">Submit</Button>
                        </form>
                    </div>
                </Card>
            )}
        </div>
    )
}