# Multi-stage build for unloggarr (Next.js web UI + Python MCP server)
FROM node:20-slim AS web-builder

# Build the Next.js application
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Production stage with Python + Node.js
FROM python:3.11-slim

# Install Node.js and system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install uv for Python dependency management
RUN pip install uv

# Set working directory
WORKDIR /app

# Copy Next.js built application from builder stage
COPY --from=web-builder /app/.next ./.next
COPY --from=web-builder /app/public ./public
COPY --from=web-builder /app/package.json ./package.json
COPY --from=web-builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=web-builder /app/next.config.ts ./next.config.ts

# Install Node.js production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy Python MCP server files
COPY unraid-mcp/ ./unraid-mcp/

# Create Python virtual environment with uv and install dependencies
RUN cd unraid-mcp && \
    uv venv .venv && \
    . .venv/bin/activate && \
    uv pip install -r requirements.txt

# Copy startup script
COPY docker/start.sh ./start.sh
RUN chmod +x ./start.sh

# Environment variables
ENV NODE_ENV=production
ENV PYTHONPATH=/app/unraid-mcp
ENV UV_VENV=/app/unraid-mcp/.venv

# Expose ports
EXPOSE 3000 6970

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start both services
CMD ["./start.sh"] 