"use client"; // Required for Framer Motion
import { motion } from "framer-motion";
import { cn } from '@/lib/utils';
import Image from "next/image";

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
                    "w-20 h-20 rounded-full overflow-hidden bg-[#1a2333] border border-indigo-500/20",
                    "flex items-center justify-center shadow-lg shadow-indigo-500/10",
                    "group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-300"
                )}>
                    <div className="relative w-full h-full">
                        <Image
                            src={`https://api.dicebear.com/9.x/thumbs/webp?seed=${nickname.replace(/\s+/g, '+')}`}
                            alt="avatar"
                            fill
                            className="h-full w-full"
                        />
                    </div>
                </div>
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