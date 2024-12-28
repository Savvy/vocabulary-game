import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '@vocab/shared';
import { useToast } from './use-toast';
import { initializeSocket } from '@/lib/socket';

export function useSocket() {
    const { toast } = useToast();
    const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>(undefined);

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = initializeSocket();
        }

        const socket = socketRef.current;

        socket.connect();

        socket.on('connect', () => {
            toast({
                title: "Connected",
                description: "Successfully connected to game server",
            });
        });

        socket.on('disconnect', () => {
            toast({
                variant: "destructive",
                title: "Disconnected",
                description: "Lost connection to game server",
            });
        });

        return () => {
            socket.off();
        };
    }, [toast]);

    return socketRef.current;
} 