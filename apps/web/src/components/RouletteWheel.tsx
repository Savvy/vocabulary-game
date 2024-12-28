'use client'

import { useState } from 'react'
import { Wheel } from 'react-custom-roulette'
import { Button } from '@/components/ui/button'
import { useGame } from '@/contexts/GameContext'
import confetti from 'canvas-confetti'

interface RouletteWheelProps {
    onSpinComplete: (category: string) => void
}

export function RouletteWheel({ onSpinComplete }: RouletteWheelProps) {
    const [mustSpin, setMustSpin] = useState(false)
    const [prizeNumber, setPrizeNumber] = useState(0)
    const { spinWheel } = useGame()

    const data = [
        { option: 'Animals', style: { backgroundColor: '#FF6B6B', textColor: 'white' } },
        { option: 'Food', style: { backgroundColor: '#4ECDC4', textColor: 'white' } },
        { option: 'Sports', style: { backgroundColor: '#45B7D1', textColor: 'white' } },
        { option: 'Professions', style: { backgroundColor: '#96CEB4', textColor: 'white' } },
        { option: 'Transportation', style: { backgroundColor: '#FFEEAD', textColor: 'black' } },
        { option: 'Household', style: { backgroundColor: '#D4A5A5', textColor: 'white' } }
    ]

    const handleSpinClick = () => {
        if (!mustSpin) {
            const newPrizeNumber = Math.floor(Math.random() * data.length)
            setPrizeNumber(newPrizeNumber)
            setMustSpin(true)
            spinWheel()
        }
    }

    const handleSpinComplete = () => {
        setMustSpin(false)
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        })
        onSpinComplete(data[prizeNumber].option)
    }

    return (
        <div className="flex flex-col items-center gap-8">
            <div className="">
                <Wheel
                    mustStartSpinning={mustSpin}
                    prizeNumber={prizeNumber}
                    data={data}
                    onStopSpinning={handleSpinComplete}
                    spinDuration={0.8}
                    radiusLineWidth={1}
                    outerBorderWidth={2}
                    fontSize={16}
                />
            </div>
            <Button 
                onClick={handleSpinClick} 
                disabled={mustSpin}
                size="lg"
            >
                {mustSpin ? 'Spinning...' : 'Spin'}
            </Button>
        </div>
    )
}