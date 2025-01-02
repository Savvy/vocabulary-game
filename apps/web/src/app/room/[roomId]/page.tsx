'use client'

import { useGame } from '@/contexts/GameContext'
import { Player } from '@vocab/shared'
import { useSocket } from '@/hooks/useSocket'
import { TimeAttackGame } from './game'
import { useGameSession } from '@/hooks/useGameSession'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import WaitingRoom from './components/waiting/WaitingRoom'

export default function GameRoom() {
    const { roomId } = useParams()
    const { socket, isConnected } = useSocket()
    const { state, startGame, joinGame } = useGame()

    // This is used for joining a game from an existing session
    const { getSession, redirectToGame } = useGameSession()

    useEffect(() => {
        const session = getSession()
        if (!session || session.roomId !== roomId || state.roomId === roomId) {
            console.log('Session not found or roomId does not match')
            console.log('Session:', session)
            console.log('RoomId:', roomId, session?.roomId)
            return;
        }
        joinGame(session.nickname, session.roomId)
        redirectToGame(session.roomId)
    }, [])

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