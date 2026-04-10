# syntax=docker/dockerfile:1

# ── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Baked into the bundle at build time; also readable at runtime via env var.
ARG NUXT_PUBLIC_BACKEND_TS_BASE_URL=http://localhost:3001
ENV NUXT_PUBLIC_BACKEND_TS_BASE_URL=$NUXT_PUBLIC_BACKEND_TS_BASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# ── Stage 3: Runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/.output ./.output

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
