FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY tsconfig.json ./

# Copy all packages first
COPY packages/ ./packages/

# Build shared packages first
RUN pnpm install --filter "@vocab/*" --ignore-scripts
RUN pnpm --filter "@vocab/shared" build
RUN pnpm --filter "@vocab/game-engine" build

# Now copy and build the socket app
COPY apps/socket ./apps/socket
RUN pnpm install --filter "@vocab/socket"

# Build the socket app
WORKDIR /app/apps/socket
RUN pnpm build

# Start the socket server
CMD ["pnpm", "start"] 