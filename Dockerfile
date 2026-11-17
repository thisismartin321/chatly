# Chatly Premium Dockerfile
# Multi-stage build for Chatly Premium Discord-like platform

FROM node:18-alpine AS base

# Install dependencies for building
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    git \
    && apk add --no-cache curl

# Install pnpm
RUN curl -fsSL https://pnpm.js.org/install.sh | sh -
ENV PATH="/root/.pnpm" "$PATH"

WORKDIR /app

# Copy package files
COPY package.json package-lock.yaml ./

# Install dependencies with pnpm
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS dev

# Copy source files
COPY . ./

# Expose ports
EXPOSE 3000

# Start development server
CMD ["pnpm", "run", "dev"]

# Production stage
FROM base AS prod

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV SESSION_SECRET="${SESSION_SECRET}"
ENV INVITE_CODE="${INVITE_CODE}"
ENV ENCRYPTION_KEY="${ENCRYPTION_KEY}"
ENV ENCRYPTION_IV="${ENCRYPTION_IV}"

# Create necessary directories
RUN mkdir -p /app/public/sounds /app/encrypted_files /app/data

# Copy source files
COPY . ./

# Build application
RUN pnpm run build

# Set up health check
HEALTHCHECK --interval=5m --timeout=15m "curl -f http://localhost:3000/api/health || exit 1"

# Start production server
CMD ["pnpm", "start"]

# Testing stage
FROM base AS test

# Install testing dependencies
RUN apk add --no-cache git

# Copy source files
COPY . ./

# Run tests
CMD ["pnpm", "run", "test"]