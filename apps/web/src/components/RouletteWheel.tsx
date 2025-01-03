'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const Wheel = dynamic(
    () => import('react-custom-roulette').then(mod => mod.Wheel),
    { ssr: false }
)

interface RouletteWheelProps {
    categories: Array<{
        id: string;
        name: string;
        style?: {
            backgroundColor: string;
            textColor: string;
        };
    }>;
    onSpinComplete: (category: string, categoryId: string) => void;
}

export function RouletteWheel({ categories, onSpinComplete }: RouletteWheelProps) {
    const [mustSpin, setMustSpin] = useState(false)
    const [prizeNumber, setPrizeNumber] = useState(0)

    const data = categories.map(cat => ({
        option: cat.name,
        style: cat.style || { backgroundColor: '#4ECDC4', textColor: 'white' }
    }))

    const handleSpinClick = () => {
        if (!mustSpin) {
            const newPrizeNumber = Math.floor(Math.random() * data.length)
            setPrizeNumber(newPrizeNumber)
            setMustSpin(true)
        }
    }

    const handleSpinComplete = () => {
        setMustSpin(false)
        onSpinComplete(categories[prizeNumber].name, categories[prizeNumber].id)
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