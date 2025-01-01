"use client"; // Required for Framer Motion
import { motion } from "framer-motion";
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface PlayerAvatarProps {
    nickname: string
    isHost: boolean
}

export function PlayerAvatar({ nickname, isHost }: PlayerAvatarProps) {
    return (
        <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
                scale: [0, 1.35, 1],
                opacity: [0, 1, 1]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
                duration: 0.5,
                times: [0, 0.6, 1],
                ease: "easeOut"
            }}
            className="flex flex-col items-center gap-2 group"
        >
            <div className="relative">
                <div className={cn(
                    "w-20 h-20 rounded-full bg-[#1a2333] border border-indigo-500/20",
                    "flex items-center justify-center shadow-lg shadow-indigo-500/10",
                    "group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-300"
                )}> 
                    <User className="w-10 h-10 text-indigo-400" />
                </div>
                {/* {status === 'ready' && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full 
                         flex items-center justify-center border-2 border-[#0f1520]">
                        <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                )} */}
            </div>
            <div className="text-center">
                <div className="text-white font-medium">{nickname}</div>
                {isHost && <div className="text-indigo-300/80 text-sm">
                    Host
                </div>}
            </div>
        </motion.div>
    );
}