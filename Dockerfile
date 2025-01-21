FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./

# Copy packages
COPY packages/shared ./packages/shared
COPY packages/game-engine ./packages/game-engine
COPY apps/socket ./apps/socket

# Install dependencies
RUN pnpm install

# Build shared packages
RUN pnpm --filter @vocab/shared build
RUN pnpm --filter @vocab/game-engine build

# Build socket app
RUN pnpm --filter @vocab/socket build

# Set working directory to socket app
WORKDIR /app/apps/socket

# Expose the port
EXPOSE 4000

# Start the socket server
CMD ["pnpm", "start"] 