# ─── Base ────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# ─── Stage 1: Install production dependencies ───────
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 60000 && \
    npm config set fetch-retry-maxtimeout 300000 && \
    npm ci --omit=dev --ignore-scripts && npm cache clean --force

# ─── Stage 2: Build TypeScript ──────────────────────
FROM base AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 60000 && \
    npm config set fetch-retry-maxtimeout 300000 && \
    npm ci --ignore-scripts

COPY . .

# prebuild script expects .env to exist for cp — create empty placeholder
RUN touch .env
RUN npm run build

# ─── Stage 3: Production runner ─────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# dumb-init handles PID 1 signal forwarding (graceful shutdown)
RUN apk add --no-cache dumb-init

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# Copy production deps + compiled output
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER appuser

EXPOSE 8000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/src/server.js"]
