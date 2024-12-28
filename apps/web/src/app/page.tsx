'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGame } from '@/contexts/GameContext'
import { useToast } from '@/hooks/use-toast'

export default function Home() {
  const [nickname, setNickname] = useState('')
  const [roomId, setRoomId] = useState('')
  const { joinGame } = useGame()
  const { toast } = useToast()
  const router = useRouter()

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

    try {
      joinGame(nickname, roomId || undefined)

      // Add loading state
      const loadingToast = toast({
        title: "Joining game...",
        description: "Please wait while we connect you to the game",
      })

      // Wait for socket connection and game join
      await new Promise((resolve) => setTimeout(resolve, 1000))

      loadingToast.dismiss()
      router.push(roomId ? `/room/${roomId}` : '/room/new')
    } catch (error) {
      console.error('Error joining game:', error)
      toast({
        variant: "destructive",
        title: "Failed to join game",
        description: "Please try again",
      })
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomId">Room ID (optional)</Label>
              <Input
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID to join existing game"
              />
            </div>
            <div className="space-y-2">
              <Button type="submit" className="w-full">
                {roomId ? 'Join Game' : 'Create Game'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}