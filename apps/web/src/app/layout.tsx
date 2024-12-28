import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/toaster'
import { GameProvider } from '@/contexts/GameContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vocabulary Game',
  description: 'Learn vocabulary through interactive gaming',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn(
        inter.className,
        "min-h-screen bg-background antialiased"
      )}>
        <GameProvider>
          {children}
        </GameProvider>
        <Toaster />
      </body>
    </html>
  )
}