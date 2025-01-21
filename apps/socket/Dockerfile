FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json ./
COPY tsconfig.json ./

# Copy source code
COPY src ./src

# Install dependencies without frozen lockfile
RUN pnpm install

# Build the app
RUN pnpm build

# Expose the port
EXPOSE 4000

# Start the server
CMD ["pnpm", "start"]