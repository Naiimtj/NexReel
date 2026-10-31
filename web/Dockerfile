# Multi-stage build for the NexReel React/Vite frontend served by nginx
# ---------------------------------------------------------------------
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack — version pinned in package.json#packageManager
RUN corepack enable

# Install deps with cache-friendly layer
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy sources and build.
# Las VITE_* se leen de web/.env (incluido en el contexto de build) por Vite.
COPY . .

RUN pnpm build

# ---------------------------------------------------------------------
# Runtime stage: nginx serving the SPA + reverse-proxying /v1/ to fastapi
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
