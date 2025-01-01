'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const Wheel = dynamic(
  () => import('react-custom-roulette').then(mod => mod.Wheel),
  { ssr: false }
)

interface RouletteWheelProps {
    onSpinComplete: (category: string) => void
}

export function RouletteWheel({ onSpinComplete }: RouletteWheelProps) {
    const [mustSpin, setMustSpin] = useState(false)
    const [prizeNumber, setPrizeNumber] = useState(0)

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
        }
    }

    const handleSpinComplete = () => {
        setMustSpin(false)
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
                <RotateCw className={cn("w-4 h-4 mr-2", mustSpin && "animate-spin")} />
                {mustSpin ? 'Spinning...' : 'Spin'}
            </Button>
        </div>
    )
}