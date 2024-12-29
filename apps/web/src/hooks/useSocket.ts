import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '@vocab/shared';
import { useToast } from './use-toast';
import { initializeSocket } from '@/lib/socket';

export function useSocket() {
    const { toast } = useToast();
    const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

    // Initialize socket immediately, not in useEffect
    if (!socketRef.current) {
        socketRef.current = initializeSocket();
    }

    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        function onConnect() {
            console.log('[Socket] Connected with ID:', socket?.id);
        }

        function onDisconnect(reason: string) {
            console.log('[Socket] Disconnected:', reason);
            toast({
                title: "Connection Lost",
                description: "Attempting to reconnect...",
                variant: "destructive",
            });
        }

        function onError(error: Error) {
            console.error('[Socket] Error:', error);
            toast({
                title: "Connection Error",
                description: error.message,
                variant: "destructive",
            });
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onError);

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('connect_error', onError);
        };
    }, [toast]);

    return { socket: socketRef.current, isConnected: socketRef.current?.connected };
} 