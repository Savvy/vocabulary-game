import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/toaster'
import { GameProvider } from '@/contexts/GameContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Voqab',
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
        "dark",
        "min-h-screen antialiased relative"
      )}>
        {/* Gradient blobs */}
        <div className="relative z-10 min-h-screen backdrop-blur-3xl bg-background/50">
          <GameProvider>
            {children}
          </GameProvider>
        </div>
        <Toaster />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/10 rounded-full blur-3xl" />
        {/* <Script src="https://unpkg.com/react-scan/dist/auto.global.js"></Script> */}
      </body>
    </html>
  )
}