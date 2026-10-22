# TeleTerm 3D — Production Game Server & Remote Terminal Engine
FROM node:20-bookworm-slim

# Install system dependencies required for native node-pty C++ compilation & shells
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    build-essential \
    ca-certificates \
    curl \
    git \
    bash \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Install cloudflared for automatic zero-config HTTPS internet tunneling (supports x86_64 & arm64)
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then CF_ARCH="amd64"; \
    elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then CF_ARCH="arm64"; \
    else CF_ARCH="amd64"; fi && \
    curl -fsSL "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${CF_ARCH}" -o /usr/local/bin/cloudflared && \
    chmod +x /usr/local/bin/cloudflared

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
