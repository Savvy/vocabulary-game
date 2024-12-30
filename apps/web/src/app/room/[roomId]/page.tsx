'use client'

import { useGame } from '@/contexts/GameContext'
import { Button } from '@/components/ui/button'
import { Player } from '@vocab/shared'
import { useSocket } from '@/hooks/useSocket'
import { useEffect } from 'react'
import { TimeAttackGame } from './game'

export default function GameRoom() {
    const { socket, isConnected } = useSocket()
    const { state, startGame } = useGame()

    useEffect(() => {
        console.log('GameRoom state:', state)
    }, [socket.id, isConnected, state.players, state.status, state.currentTurn, state])

    const isHost = isConnected && socket ?
        state.players.find((p: Player) => p.id === socket.id)?.isHost || false : false

    const host = state.players.find((p: Player) => p.isHost)
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl text-center font-bold">
                GameRoom - Host: {host?.nickname}, Status: {state.status}
            </h1>
            {state.status === 'waiting' ? (
                <div className="text-center space-y-4">
                    {isHost ? (
                        <div className="my-12">
                            <Button onClick={startGame}>
                                Start Game
                            </Button>
                        </div>
                    ) : (
                        <p>Waiting for host to start the game...</p>
                    )}
                    <div className="space-x-2">
                        {state.players.map((p: Player) => (
                            <span key={p.id}>{p.nickname}</span>
                        ))}
                    </div>
                </div>
            ) : (
                <TimeAttackGame />
            )}
        </div>
    )
}