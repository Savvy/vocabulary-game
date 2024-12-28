'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Trophy } from 'lucide-react'
import { Player } from '@vocab/shared'

interface ScoreBoardProps {
    players: Player[]
}

export function ScoreBoard({ players }: ScoreBoardProps) {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

    const getPlayerRank = (index: number) => {
        if (index === 0) return '🥇'
        if (index === 1) return '🥈'
        if (index === 2) return '🥉'
        return `${index + 1}th`
    }

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Scoreboard</h2>
                <Trophy className="w-6 h-6 text-yellow-500" />
            </div>

            <div className="space-y-3">
                {sortedPlayers.map((player, index) => (
                    <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg font-bold w-8">
                                {getPlayerRank(index)}
                            </span>
                            <span>{player.nickname}</span>
                            {player.isHost && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Host
                                </span>
                            )}
                        </div>

                        <motion.div
                            className="font-bold text-lg"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.3 }}
                            key={player.score} // Trigger animation on score change
                        >
                            {player.score}
                        </motion.div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-4 text-sm text-gray-500 text-center">
                Top player gets 3 points
                <br />
                Second player gets 2 points
                <br />
                Other correct answers get 1 point
            </div>
        </Card>
    )
}