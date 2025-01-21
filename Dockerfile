FROM node:20-alpine

WORKDIR /app

# Install OpenSSL and other required dependencies
RUN apk add --no-cache openssl openssl-dev

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY tsconfig.json ./
COPY .npmrc ./

# Copy packages
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY packages/game-engine ./packages/game-engine
COPY apps/socket ./apps/socket

# Install dependencies
RUN pnpm install

# Generate Prisma client first
RUN cd packages/database && pnpm db:generate

# Build shared packages
RUN pnpm --filter @vocab/shared build
RUN pnpm --filter @vocab/database build
RUN pnpm --filter @vocab/game-engine build

# Build socket app
RUN pnpm --filter @vocab/socket build

# Set working directory to socket app
WORKDIR /app/apps/socket

# Expose the port
EXPOSE 4000

# Start the socket server
CMD ["pnpm", "start"] 