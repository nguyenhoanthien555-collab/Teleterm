# TeleTerm 3D — Production Game Server
FROM node:20-bookworm-slim

# Install system dependencies required for native node-pty C++ compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    build-essential \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package definitions
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy source code and assets
COPY src/ ./src/
COPY public/ ./public/

# Setup persistent storage
ENV NODE_ENV=production
ENV PORT=4000
ENV TELETERM_USER_DATA_PATH=/app/data
RUN mkdir -p /app/data

EXPOSE 4000

CMD ["node", "src/server/index.js"]
