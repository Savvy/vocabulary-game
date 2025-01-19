'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGame } from '@/contexts/GameContext'
import { useToast } from '@/hooks/use-toast'
import { useSocket } from '@/hooks/useSocket'
import GameForm from './GameForm'

export default function GameFormWrapper() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { joinGame } = useGame()
    const { toast } = useToast()
    const router = useRouter()
    const { socket } = useSocket()
    const searchParams = useSearchParams()
    const roomId = searchParams.get('roomId')

    const handleSubmit = async ({ nickname, roomId }: { nickname: string, roomId?: string }) => {
        if (!nickname.trim()) {
            toast({
                variant: "destructive",
                title: "Nickname required",
                description: "Please enter a nickname to join the game",
            })
            return
        }

        setIsSubmitting(true)
        const loadingToast = toast({
            title: "Joining game...",
            description: "Please wait while we connect you to the game",
        })

        try {
            // Join the game first
            joinGame(nickname, roomId || undefined)

            // Create a promise that resolves when we get either success or error
            const result = await new Promise<{ success: boolean; roomId?: string }>((resolve) => {
                const cleanup = () => {
                    socket?.off('game:error', handleError)
                    socket?.off('game:roomCreated', handleRoomCreated)
                }

                const handleError = () => {
                    cleanup()
                    resolve({ success: false })
                }

                const handleRoomCreated = (newRoomId: string) => {
                    console.log('[Game from Socket] Room created', newRoomId);
                    cleanup()
                    resolve({ success: true, roomId: newRoomId })
                }

                // For existing rooms, we just need to wait for potential errors
                if (roomId) {
                    socket?.once('game:error', handleError)
                    // Set a short timeout for existing room joins
                    setTimeout(() => {
                        cleanup()
                        resolve({ success: true, roomId })
                    }, 500)
                } else {
                    socket?.once('game:error', handleError)
                    socket?.once('game:roomCreated', handleRoomCreated)
                }
            })

            loadingToast.dismiss()

            if (result.success && result.roomId) {
                router.push(`/room/${result.roomId}`)
            }
        } catch (error) {
            console.error('Error joining game:', error)
            toast({
                variant: "destructive",
                title: "Failed to join game",
                description: error instanceof Error ? error.message : "Please try again with a different nickname",
            })
        } finally {
            setIsSubmitting(false)
        }
    }


    return (
        <div className="w-full max-w-md">
            <GameForm
                isSubmitting={isSubmitting}
                handleSubmit={handleSubmit}
                defaultRoomId={roomId}
            />
        </div>
    )
} 