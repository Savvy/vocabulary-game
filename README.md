# Vocabulary Game Platform

A modern, interactive vocabulary learning platform built with Next.js, TypeScript, and WebSocket for real-time multiplayer games.

## Project Overview

This is a monorepo project managed with Turborepo and pnpm, consisting of multiple applications and shared packages:

### Applications

- `apps/web`: Main web application for users to play vocabulary games
- `apps/admin`: Admin dashboard for managing words, categories, and users
- `apps/socket`: WebSocket server for real-time game functionality

### Shared Packages

- `packages/database`: Prisma database schema and client
- `packages/game-engine`: Core game logic and rules
- `packages/shared`: Shared types and utilities

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Prisma with PostgreSQL
- **UI Components**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Server Components + nuqs for URL state
- **Real-time**: WebSocket (Socket.io)
- **Package Management**: pnpm + Turborepo
- **Deployment**: Vercel (web + admin) / Railway (socket)

## Features

### Web Application
- User authentication and profiles
- Multiple vocabulary game modes
- Real-time multiplayer games
- Progress tracking and statistics
- Responsive design for all devices

### Admin Dashboard
- Word and category management
- Bulk word import functionality
- User management and roles
- Game statistics and analytics
- Content moderation tools

### Game Engine
- Multiple game modes support
- Real-time game state management
- Score calculation and ranking
- Match-making system
- Game session persistence

## Getting Started

1. **Prerequisites**
   ```bash
   node >= 18
   pnpm >= 8
   postgresql >= 14
   ```

2. **Installation**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Configure your database and API keys

4. **Development**
   ```bash
   pnpm dev       # Run all applications
   pnpm build     # Build all applications
   pnpm lint      # Lint all applications
   ```

## Implementing New Games

To add a new game mode:

1. **Define Game Logic** in `packages/game-engine/src/games/`
   ```typescript
   // Example: newGame.ts
   export interface NewGameState {
     // Game state interface
   }
   
   export function initializeGame(): NewGameState {
     // Initialize game state
   }
   
   export function processMove(state: NewGameState, move: any): NewGameState {
     // Process game moves
   }
   ```

2. **Add Socket Handlers** in `apps/socket/src/handlers/`
   ```typescript
   // Register game-specific socket events
   socket.on('newGame:move', (data) => {
     // Handle game moves
   });
   ```

3. **Create UI Components** in `apps/web/src/components/games/`
   ```typescript
   // Create game interface components
   export function NewGameBoard() {
     // Game UI implementation
   }
   ```

4. **Update Game Registry** in `packages/game-engine/src/registry.ts`
   ```typescript
   export const GAME_TYPES = {
     // ... existing games
     NEW_GAME: 'new-game',
   } as const;
   ```

## Project Structure

```
├── apps/
│   ├── web/          # Main web application
│   ├── admin/        # Admin dashboard
│   └── socket/       # WebSocket server
├── packages/
│   ├── database/     # Prisma schema and client
│   ├── game-engine/  # Game logic
│   ├── shared/       # Shared utilities
```

## Contributing

1. Create a feature branch
2. Implement changes
3. Add tests if applicable
4. Submit a pull request

## License

MIT License - see LICENSE file for details
