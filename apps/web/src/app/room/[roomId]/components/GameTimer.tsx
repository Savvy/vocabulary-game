'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Timer } from 'lucide-react';

interface GameTimerProps {
    timerStartedAt: number;
    roundDuration: number;
    isRunning: boolean;
}

export function GameTimer({ timerStartedAt, roundDuration, isRunning }: GameTimerProps) {
    const progressRef = useRef<HTMLDivElement>(null);
    const timeRef = useRef<HTMLSpanElement>(null);
    
    useEffect(() => {
        if (!timerStartedAt || !isRunning) {
            // Reset timer when not running
            if (progressRef.current) {
                progressRef.current.style.transition = 'none';
                progressRef.current.style.width = '100%';
            }
            if (timeRef.current) {
                timeRef.current.textContent = `${roundDuration.toFixed(1)}s`;
                timeRef.current.classList.remove('text-red-500');
            }
            return;
        }
        
        const progressBar = progressRef.current;
        const timeDisplay = timeRef.current;
        if (!progressBar || !timeDisplay) return;

        // Set initial state
        progressBar.style.transition = 'none';
        progressBar.style.width = '100%';
        
        // Force reflow
        void progressBar.offsetHeight;
        
        // Start animation
        progressBar.style.transition = `width ${roundDuration}s linear`;
        progressBar.style.width = '0%';

        let frameId: number;
        const updateTime = () => {
            const elapsed = (Date.now() - timerStartedAt) / 1000;
            const remaining = Math.max(0, roundDuration - elapsed);
            
            if (timeDisplay) {
                timeDisplay.textContent = `${remaining.toFixed(1)}s`;
                timeDisplay.classList.toggle('text-red-500', remaining <= 5);
            }

            if (remaining > 0 && isRunning) {
                frameId = requestAnimationFrame(updateTime);
            }
        };

        frameId = requestAnimationFrame(updateTime);
        
        return () => {
            cancelAnimationFrame(frameId);
            progressBar.style.transition = 'none';
        };
    }, [timerStartedAt, roundDuration, isRunning]);

    return (
        <Card className="w-full p-4">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    <span ref={timeRef} className="font-mono text-lg" />
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                        ref={progressRef}
                        className="h-full bg-primary"
                        style={{ width: '100%' }}
                    />
                </div>
            </div>
        </Card>
    );
} 