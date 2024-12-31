"use client"

import { Gamepad2 } from "lucide-react"

export default function Header() {
    return (
        <div className="text-center mb-8">
            <div className="inline-block p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 
                    to-violet-500/20 border border-primary/20 mb-4">
                <Gamepad2 className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent mb-2">
                Welcome to VocabMaster
            </h1>
            <p className="text-indigo-300/80">Enter a nickname to start playing</p>
        </div>
    )
}