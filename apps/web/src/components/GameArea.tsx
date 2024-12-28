import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RouletteWheel } from './RouletteWheel'
import { WordChallenge } from './WordChallenge'
import { useGame } from '@/contexts/GameContext'

export function GameArea() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const { spinWheel } = useGame()

    const handleSpinComplete = (category: string) => {
        setSelectedCategory(category)
        spinWheel()
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AnimatePresence mode="wait">
                {!selectedCategory ? (
                    <motion.div
                        key="roulette"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <RouletteWheel onSpinComplete={handleSpinComplete} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="word-challenge"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                    >
                        <WordChallenge category={selectedCategory} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}