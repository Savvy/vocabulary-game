import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from 'dotenv';
import { ClientToServerEvents, ServerToClientEvents } from '@vocab/shared';
import { setupGameHandlers } from './handlers/gameHandlers.js';
import { TimeAttackGame } from '@vocab/game-engine';

config();

const app = express();
app.use(cors());

// Add health check endpoint
app.get('/', (req: any, res: any) => {
    res.send('OK');
});

const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Game state management
const gameRooms = new Map<string, TimeAttackGame>();

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    setupGameHandlers(io, socket, gameRooms);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
}); 