import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '@vocab/shared';

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

export const initializeSocket = () => {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            timeout: 10000,
            transports: ['websocket']
        });

        socket.on('connect', () => {
            console.log('[Socket] Connected to game server');
        });

        socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error);
        });

        socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
        });
    }

    return socket;
};

export const getSocket = () => {
    if (!socket) {
        return initializeSocket();
    }
    return socket;
};