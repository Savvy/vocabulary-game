'use client'

import { Button } from '@/components/ui/button'
import { Player, TimeAttackState } from '@vocab/shared'
import { PlayerAvatar } from './PlayerAvatar'
import { Play, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import WaitingRoomHeader from './Header'
import { AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { CopyButton } from '@/components/CopyButton'
import { GameConfigDialog } from './GameConfigDialog'

export default function WaitingRoom({ state, isHost, startGame }: {
    host?: Player, state: TimeAttackState, isHost: boolean, startGame: () => void
}) {
    console.log('waiting room categories', state.categories)
    return (
        <div className="max-w-2xl mx-auto p-6 space-y-12">
            <WaitingRoomHeader
                title="Time Attack"
                playerRange={`${state.players.length} / ${state.maxPlayers}`}
                roomId={state.roomId}
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
                    "flex gap-4 mt-8",
                    /* isHost ? "grid-cols-2" : "grid-cols-1" */
                )}>
                    <InviteFriendsDialog roomId={state.roomId} />
                    {isHost && (
                        <div className="flex-grow flex gap-4">
                            <Button
                                onClick={startGame}
                                variant={'default'}
                                size={'lg'}
                                className='bg-primary/30 backdrop-blur h-12 flex-grow'
                                disabled={!isHost}
                            >
                                <Play className={cn("w-5 h-5 text-primary-foreground")} />
                                Start Game
                            </Button>
                            <GameConfigDialog
                                initialConfig={{
                                    maxPlayers: state.maxPlayers,
                                    roundTimeLimit: state.roundTimeLimit,
                                    maxRounds: state.maxRounds,
                                    inputType: state.inputType,
                                    categories: state.categories,
                                    sourceLanguage: state.sourceLanguage,
                                    targetLanguage: state.targetLanguage
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function InviteFriendsDialog({ roomId }: { roomId: string }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant={'secondary'}
                    size={'lg'}
                    className='bg-secondary/30 backdrop-blur h-12'
                >
                    <UserPlus className="w-5 h-5 mr-2 text-indigo-400" />
                    Invite Friends
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite Friends</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Invite your friends to join the game.
                </DialogDescription>
                <div className="flex flex-row gap-2">
                    <Input
                        placeholder="Copy link"
                        value={`${window.location.origin}?roomId=${roomId}`}
                        className='flex-grow'
                        readOnly
                        disabled
                    />
                    <CopyButton
                        text={`${window.location.origin}?roomId=${roomId}`}
                        description="Room ID copied to clipboard"
                        variant="outline"

                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}