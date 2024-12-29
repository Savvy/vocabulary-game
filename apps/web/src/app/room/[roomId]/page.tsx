'use client'

/* import { useParams } from 'next/navigation' */
import { useGame } from '@/contexts/GameContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScoreBoard } from '@/components/ScoreBoard'
import { Player } from '@vocab/shared'
import { GameArea } from '@/components/GameArea'
import { useSocket } from '@/hooks/useSocket'

export default function GameRoom() {
    /* const { roomId } = useParams() */
    const { socket } = useSocket()
    const { state, startGame } = useGame()
    const isHost = state.players.find((p: Player) => p.id === socket?.id)?.isHost || false;

    const handleStartGame = () => {
        if (!isHost) {
            console.log('Not host, cannot start game')
            return
        }
        console.log('Starting game as host')
        startGame()
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center w-full flex-col gap-20">
                <div className="w-full justify-center flex flex-row gap-4">
                    {/* Scoreboard */}
                    <div className='max-w-md w-full'>
                        <ScoreBoard players={state.players} />
                    </div>

                    {/* Players List */}
                    <Card className="max-w-md w-full p-4">
                        <h2 className="text-xl font-bold mb-4">Players</h2>
                        <div className="space-y-2">
                            {state.players.map((player: Player) => (
                                <div
                                    key={player.id}
                                    className="flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{player.nickname}</span>
                                        {player.isHost && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                Host
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-bold">{player.score}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
                {/* Game Area */}
                <div className="md:col-span-2">
                    {state.status === 'waiting' ? (
                        <div className="text-center">
                            <h2 className="text-xl mb-4">
                                Waiting for players...
                            </h2>
                            {isHost && (
                                <Button onClick={handleStartGame}>
                                    Start Game
                                </Button>
                            )}
                        </div>
                    ) : (
                        <GameArea />
                    )}
                </div>
            </div>
        </div>
    )
}