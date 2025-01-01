'use client'

import { useGame } from '@/contexts/GameContext'
import { Button } from '@/components/ui/button'
import { Player, TimeAttackState } from '@vocab/shared'
import { useSocket } from '@/hooks/useSocket'
import { TimeAttackGame } from './game'
import { PlayerAvatar } from './components/waiting/PlayerAvatar'
import { Play, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import WaitingRoomHeader from './components/waiting/Header'
import { AnimatePresence } from 'framer-motion'

export default function GameRoom() {
    const { socket, isConnected } = useSocket()
    const { state, startGame } = useGame()

    const isHost = isConnected && socket ?
        state.players.find((p: Player) => p.id === socket.id)?.isHost || false : false

    const host = state.players.find((p: Player) => p.isHost)

    if (state.status === 'waiting') {
        return (
            <WaitingRoom
                host={host}
                state={state}
                isHost={isHost}
                startGame={startGame}
            />
        )
    }

    return (
        <TimeAttackGame />
    )
}

function WaitingRoom({ state, isHost, startGame }: {
    host?: Player, state: TimeAttackState, isHost: boolean, startGame: () => void
}) {
    return (
        <div className="max-w-2xl mx-auto p-6 space-y-12">
            {/* <h1 className="text-2xl text-center font-bold mb-8">
                GameRoom - Host: {host?.nickname}, Status: {state.status}
            </h1> */}
            <WaitingRoomHeader
                title="Time Attack"
                // TODO: get max players from backend
                playerRange={`${state.players.length} / 4`}
            />
            <div className="text-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <AnimatePresence>
                        {state.players.map((player: Player) => (
                            <PlayerAvatar
                                key={player.id}
                                nickname={player.nickname}
                                isHost={player.isHost}
                            />
                        ))}
                    </AnimatePresence>
                </div>
                <div className="text-center mt-12 mb-4">
                    <p className="text-indigo-300">Waiting for host to start...</p>
                </div>
                <div className={cn(
                    "grid gap-4 mt-8",
                    isHost ? "grid-cols-2" : "grid-cols-1"
                )}>
                    <Button
                        onClick={startGame}
                        variant={'secondary'}
                        size={'lg'}
                        className='bg-secondary/30 backdrop-blur h-12'
                    >
                        <UserPlus className="w-5 h-5 mr-2 text-indigo-400" />
                        Invite Friends
                    </Button>
                    {isHost && (
                        <Button
                            onClick={startGame}
                            variant={'default'}
                            size={'lg'}
                            className='bg-primary/30 backdrop-blur h-12'
                            disabled={!isHost}
                        >
                            <Play className={cn("w-5 h-5 text-primary-foreground")} />
                            Start Game
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}