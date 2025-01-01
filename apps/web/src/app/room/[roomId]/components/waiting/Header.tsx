"use client"

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy, Gamepad2, Users } from "lucide-react"

interface GameHeaderProps {
    title: string;
    playerRange: string;
}

export default function WaitingRoomHeader({ title, playerRange }: GameHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-12 bg-[#1a2333]/50 p-4 rounded-2xl border border-indigo-500/10">
            <div className="flex items-center gap-4">
                <div className="inline-block p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 
                    to-violet-500/20 border border-primary/20">
                    <Gamepad2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                        {title}
                    </h1>
                    <div className="flex items-center gap-2 text-indigo-300/80 text-sm">
                        <Users className="w-4 h-4" />
                        <span>{playerRange}</span>
                    </div>
                </div>
            </div>

            <Button
                className={cn(
                    "px-4 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center",
                    "hover:bg-indigo-500/20 hover:border-indigo-500/30"
                )}
                size={'sm'}
            >
                <Copy className="w-4 h-4 mr-2 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-300">Copy Room ID</span>
            </Button>
        </div>
    )
}