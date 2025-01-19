
import Header from './components/Header'
import GameFormWrapper from './components/GameFormWrapper'
import { Suspense } from 'react'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <Header />
      <Suspense fallback={
        <div className="w-full max-w-md animate-pulse">
          <div className="h-11 bg-primary/10 rounded-md mb-4" />
          <div className="h-11 bg-primary/10 rounded-md mb-4" />
          <div className="h-11 bg-primary/10 rounded-md" />
        </div>
      }>
        <GameFormWrapper />
      </Suspense>
    </div>
  )
}