# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# NUXT_PUBLIC_BACKEND_TS_BASE_URL is baked in at build time for public (browser-side) env vars.
# Pass it as a build argument so CI/CD pipelines can set the correct API URL per environment.
ARG NUXT_PUBLIC_BACKEND_TS_BASE_URL=http://localhost:3001
ENV NUXT_PUBLIC_BACKEND_TS_BASE_URL=$NUXT_PUBLIC_BACKEND_TS_BASE_URL

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# ── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Copy the Nuxt output bundle (.output contains server + public assets)
COPY --from=builder /app/.output ./.output

# NUXT_PUBLIC_BACKEND_TS_BASE_URL can also be overridden at container runtime
# (for server-side rendering or future SSR enablement)
ENV NUXT_PUBLIC_BACKEND_TS_BASE_URL=http://localhost:3001

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
