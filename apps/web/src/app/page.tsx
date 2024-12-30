'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGame } from '@/contexts/GameContext'
import { useToast } from '@/hooks/use-toast'
import { useSocket } from '@/hooks/useSocket'

export default function Home() {
  const [nickname, setNickname] = useState('')
  const [roomId, setRoomId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { joinGame } = useGame()
  const { toast } = useToast()
  const router = useRouter()
  const { socket } = useSocket()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    <main className="container mx-auto min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Vocabulary Game</CardTitle>
          <CardDescription>
            Enter your nickname to start playing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your nickname"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomId">Room ID (optional)</Label>
              <Input
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID to join existing game"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {roomId ? 'Join Game' : 'Create Game'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}