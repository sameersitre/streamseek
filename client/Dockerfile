# ─── Base ────────────────────────────────────────────
FROM node:20-slim AS base
WORKDIR /app

# ─── Stage 1: Install dependencies ──────────────────
FROM base AS deps

COPY package.json ./
# Drop any macOS-generated lockfile — it omits linux/x64 optional native binaries
# (lightningcss-linux-x64-gnu, @tailwindcss/oxide-linux-x64-gnu, @next/swc-linux-x64-gnu).
# A fresh npm install inside the linux/amd64 container resolves the correct binaries.
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 60000 && \
    npm config set fetch-retry-maxtimeout 300000 && \
    npm install --no-audit

# ─── Stage 2: Build the application ─────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are inlined at build time — pass via --build-arg
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ─── Stage 3: Production runner ─────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs

# Copy only what's needed for production
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
