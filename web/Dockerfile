# Multi-stage build for the NexReel React/Vite frontend served by nginx
# ---------------------------------------------------------------------
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via corepack (bundled with Node 20)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install deps with cache-friendly layer
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy sources and build
COPY . .

# Build-time env vars (passed via docker compose `args`)
ARG VITE_URL_DB=/v1/
ARG VITE_URL_TMDB=https://api.themoviedb.org/3/
ARG VITE_APIKEY_TMDB=""
ARG VITE_URL_IMDB=""
ARG VITE_APIKEY_IMDB=""
ARG VITE_URL_PLEX=""
ARG VITE_APIKEY_PLEX=""
ARG VITE_USE_MOCKS="false"
ARG VITE_NOT_USE_IMDB="false"

ENV VITE_URL_DB=${VITE_URL_DB} \
    VITE_URL_TMDB=${VITE_URL_TMDB} \
    VITE_APIKEY_TMDB=${VITE_APIKEY_TMDB} \
    VITE_URL_IMDB=${VITE_URL_IMDB} \
    VITE_APIKEY_IMDB=${VITE_APIKEY_IMDB} \
    VITE_URL_PLEX=${VITE_URL_PLEX} \
    VITE_APIKEY_PLEX=${VITE_APIKEY_PLEX} \
    VITE_USE_MOCKS=${VITE_USE_MOCKS} \
    VITE_NOT_USE_IMDB=${VITE_NOT_USE_IMDB}

RUN pnpm build

# ---------------------------------------------------------------------
# Runtime stage: nginx serving the SPA + reverse-proxying /v1/ to fastapi
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
