'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Player } from '@vocab/shared';
import { User } from 'lucide-react';

interface CurrentPlayerProps {
    isCurrentTurn: boolean;
    players: Player[];
    currentTurn: string | undefined;
}

export function CurrentPlayer({ isCurrentTurn, players, currentTurn }: CurrentPlayerProps) {
    const currentPlayer = players.find(p => p.id === currentTurn);

    return (
        <Card className="w-full p-4">
            <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                    <h3 className={cn(
                        "text-muted-foreground",
                        isCurrentTurn ? 'font-bold' : 'font-normal'
                    )}>
                        {isCurrentTurn ? (
                            "Your Turn!"
                        ) : (
                            `${currentPlayer?.nickname}'s Turn`
                        )}
                    </h3>
                </div>
            </div>
        </Card>
    );
} 