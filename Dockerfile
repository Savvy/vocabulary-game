FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY tsconfig.json ./

# Copy all packages
COPY packages/ ./packages/
COPY apps/socket ./apps/socket

# Install all dependencies
RUN pnpm install

# Generate Prisma client
RUN cd packages/database && pnpm db:generate

# Build all packages in correct order
RUN pnpm build

# Set working directory to socket app
WORKDIR /app/apps/socket

# Expose the port
EXPOSE 4000

# Start the socket server
CMD ["pnpm", "start"] 