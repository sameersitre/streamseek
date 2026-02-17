# Docker Setup Guide — StreamSeek

> Containerizing the **StreamSeek frontend** (Next.js 16) and **bingr-server backend** (Express + MongoDB) using Docker best practices.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Analysis](#project-analysis)
3. [Prerequisites](#prerequisites)
4. [Frontend Dockerfile (Next.js 16)](#frontend-dockerfile-nextjs-16)
5. [Backend Dockerfile (Express + TypeScript)](#backend-dockerfile-express--typescript)
6. [Docker Compose (Multi-Container)](#docker-compose-multi-container)
7. [.dockerignore Files](#dockerignore-files)
8. [Environment Variable Strategy](#environment-variable-strategy)
9. [Development vs Production](#development-vs-production)
10. [Health Checks](#health-checks)
11. [Image Size Optimization](#image-size-optimization)
12. [Security Best Practices](#security-best-practices)
13. [Common Commands](#common-commands)
14. [Troubleshooting](#troubleshooting)
15. [References](#references)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                   Docker Network                     │
│                                                      │
│  ┌─────────────────┐      ┌─────────────────┐       │
│  │    frontend      │      │    backend       │       │
│  │  (Next.js 16)    │─────▶│  (Express API)   │       │
│  │  Port 3000       │      │  Port 8000       │       │
│  └─────────────────┘      └────────┬────────┘       │
│                                     │                │
│                            ┌────────▼────────┐       │
│                            │    mongodb       │       │
│                            │  Port 27017      │       │
│                            │  (persistent vol)│       │
│                            └─────────────────┘       │
└──────────────────────────────────────────────────────┘
         │                          │
    Host :3000                 Host :8000
```

| Service | Tech Stack | Port | Image Base |
|---------|-----------|------|------------|
| **frontend** | Next.js 16.1.6, React 19, Tailwind v4, Auth.js v5 | 3000 | `node:20-alpine` |
| **backend** | Express 4.21, TypeScript, Mongoose 8.15 | 8000 | `node:20-alpine` |
| **mongodb** | MongoDB 7 | 27017 | `mongo:7` |

---

## Project Analysis

### Frontend — StreamSeek (`client/`)

| Aspect | Detail |
|--------|--------|
| Framework | Next.js 16.1.6 (App Router) |
| Build command | `npm run build` → `.next/` |
| Start command | `npm start` (or `node server.js` with standalone) |
| Public env vars | `NEXT_PUBLIC_API_URL` (inlined at build time) |
| Server env vars | `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` |
| Image domains | `image.tmdb.org`, `lh3.googleusercontent.com`, `avatars.githubusercontent.com` |

### Backend — bingr-server (`server/`)

| Aspect | Detail |
|--------|--------|
| Framework | Express 4.21.2 + TypeScript 5.4 |
| Build command | `npm run build` → `dist/` |
| Start command | `node dist/src/server.js` |
| Database | MongoDB (Mongoose 8.15.1) |
| Key env vars | `PORT`, `MONGO_URI`, `TMDB_API_KEY`, `RAPIDAPI_UTELLY_API_KEY`, etc. |
| API prefix | `/api/v2/` |
| Default port | 8000 |

---

## Prerequisites

1. **Docker Engine** 24+ and **Docker Compose** v2
2. **`output: "standalone"`** must be added to `next.config.ts`:

```typescript
// client/next.config.ts
const nextConfig: NextConfig = {
  output: "standalone",  // <-- ADD THIS
  poweredByHeader: false,
  // ... rest of existing config
};
```

This is **critical** — it tells Next.js to trace dependencies and produce a self-contained `server.js` that doesn't need the full `node_modules`. Reduces the final Docker image from ~500MB to ~150MB.

---

## Frontend Dockerfile (Next.js 16)

Based on the [official Vercel Docker example](https://github.com/vercel/next.js/tree/canary/examples/with-docker), using a **3-stage multi-stage build**:

```dockerfile
# client/Dockerfile

# ─── Base ────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# ─── Stage 1: Install dependencies ──────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci

# ─── Stage 2: Build the application ─────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars are inlined at build time — pass via --build-arg
ARG NEXT_PUBLIC_API_URL=http://backend:8000/api/v2
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ─── Stage 3: Production runner ─────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what's needed for production
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Why 3 stages?

| Stage | Purpose | Cached when... |
|-------|---------|---------------|
| **deps** | Install `node_modules` | `package.json` unchanged |
| **builder** | Compile Next.js app | Source code unchanged |
| **runner** | Minimal production image | Build output unchanged |

The final image contains **only** the standalone server, static assets, and public files — no `node_modules`, no source code, no dev dependencies.

---

## Backend Dockerfile (Express + TypeScript)

```dockerfile
# server/Dockerfile

# ─── Base ────────────────────────────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# ─── Stage 1: Install production dependencies ───────
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# ─── Stage 2: Build TypeScript ──────────────────────
FROM base AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Stage 3: Production runner ─────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# dumb-init handles PID 1 signal forwarding (graceful shutdown)
RUN apk add --no-cache dumb-init

# Non-root user
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# Copy production deps + compiled output
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER appuser

EXPOSE 8000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/src/server.js"]
```

### Why `dumb-init`?

Node.js running as PID 1 in a container **does not** handle `SIGTERM`/`SIGINT` properly. Without `dumb-init`:
- `docker stop` waits 10s then force-kills the process
- In-flight requests are dropped
- Database connections aren't closed cleanly

`dumb-init` acts as a lightweight init system that proxies signals correctly to Node.js.

---

## Docker Compose (Multi-Container)

### Production — `docker-compose.yml`

```yaml
services:
  # ─── Frontend (Next.js) ───────────────────────────
  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: http://backend:8000/api/v2
    ports:
      - "3000:3000"
    environment:
      - AUTH_SECRET=${AUTH_SECRET}
      - AUTH_GOOGLE_ID=${AUTH_GOOGLE_ID}
      - AUTH_GOOGLE_SECRET=${AUTH_GOOGLE_SECRET}
      - AUTH_GITHUB_ID=${AUTH_GITHUB_ID}
      - AUTH_GITHUB_SECRET=${AUTH_GITHUB_SECRET}
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
    restart: unless-stopped
    networks:
      - app-network

  # ─── Backend (Express API) ────────────────────────
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongodb:27017/bingefeast
      - TMDB_URL=${TMDB_URL}
      - TMDB_API_KEY=${TMDB_API_KEY}
      - RAPIDAPI_UTELLY_API_KEY=${RAPIDAPI_UTELLY_API_KEY}
      - RAPIDAPI_UTELLY_URL=${RAPIDAPI_UTELLY_URL}
      - RAPIDAPI_WATCHMODE_URL=${RAPIDAPI_WATCHMODE_URL}
    depends_on:
      mongodb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8000/api/v2"]
      interval: 15s
      timeout: 5s
      retries: 5
      start_period: 10s
    restart: unless-stopped
    networks:
      - app-network

  # ─── MongoDB ──────────────────────────────────────
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 15s
      timeout: 5s
      retries: 5
      start_period: 10s
    restart: unless-stopped
    networks:
      - app-network

volumes:
  mongodb_data:
    driver: local

networks:
  app-network:
    driver: bridge
```

### Development — `docker-compose.dev.yml`

```yaml
services:
  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
      target: deps
    ports:
      - "3000:3000"
    volumes:
      - ./client:/app
      - /app/node_modules   # anonymous volume — prevents host override
      - /app/.next           # prevents .next from being overwritten
    env_file:
      - ./client/.env.local
    command: npm run dev
    networks:
      - app-network

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
      target: builder
    ports:
      - "8000:8000"
    volumes:
      - ./server:/app
      - /app/node_modules
    env_file:
      - ./server/.env
    command: npx nodemon src/server.ts
    networks:
      - app-network

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

volumes:
  mongodb_data:

networks:
  app-network:
```

### Folder Structure (Monorepo)

```
streamseek/
├── docker-compose.yml          # Production
├── docker-compose.dev.yml      # Development
├── .env.example                # Template for secrets
├── .env                        # Actual secrets (git-ignored)
├── client/                     # Frontend (Next.js 16)
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── next.config.ts
│   ├── app/
│   └── ...
├── server/                     # Backend (Express API)
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── src/
│   └── ...
└── docs/
```

---

## .dockerignore Files

### Frontend (`client/.dockerignore`)

```
# Version control
.git
.gitignore

# Dependencies (rebuilt in container)
node_modules

# Build artifacts (rebuilt in container)
.next
out
build

# Environment files (injected via Docker)
.env
.env.*

# Docker files
Dockerfile
Dockerfile.*
docker-compose*.yml
.dockerignore

# IDE / OS
.vscode
.idea
*.swp
.DS_Store

# Docs and non-runtime files
docs/
*.md
LICENSE
.commitmsg

# Claude
.claude/
```

### Backend (`server/.dockerignore`)

```
.git
.gitignore
node_modules
dist
coverage
build

.env
.env.*

Dockerfile
Dockerfile.*
docker-compose*.yml
.dockerignore

.vscode
.idea
*.swp
.DS_Store

docs/
*.md
LICENSE

.claude/
```

### Why `.dockerignore` matters

Without it, Docker sends the **entire directory** (including `node_modules`, `.git`, etc.) as build context to the daemon. This:
- Slows down every build by hundreds of MB
- Can invalidate layer caches unexpectedly
- Risks leaking secrets into the image

---

## Environment Variable Strategy

### Build-Time vs Runtime

| Variable | Type | When Needed | How to Pass |
|----------|------|------------|-------------|
| `NEXT_PUBLIC_API_URL` | Public (client bundle) | **Build time** | `docker build --build-arg` or Compose `args:` |
| `AUTH_SECRET` | Server-only | Runtime | Compose `environment:` or `env_file:` |
| `AUTH_GOOGLE_ID` | Server-only | Runtime | Compose `environment:` |
| `AUTH_GOOGLE_SECRET` | Server-only (secret) | Runtime | Compose `environment:` or Docker Secrets |
| `AUTH_GITHUB_ID` | Server-only | Runtime | Compose `environment:` |
| `AUTH_GITHUB_SECRET` | Server-only (secret) | Runtime | Compose `environment:` or Docker Secrets |
| `TMDB_API_KEY` | Server-only (secret) | Runtime | Compose `environment:` |
| `MONGO_URI` | Server-only | Runtime | Compose `environment:` |
| `PORT` | Server-only | Runtime | Compose `environment:` |

### Key Rule

> **`NEXT_PUBLIC_*` variables are inlined into the JavaScript bundle during `next build`.** They cannot be changed at runtime without rebuilding the image. All other variables can be injected at container start time.

### Recommended `.env` file (at Docker Compose level)

```bash
# .env (git-ignored, at docker-compose.yml level)

# Frontend — Auth.js
AUTH_SECRET=your-auth-secret-here
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret

# Backend — TMDB
TMDB_URL=https://api.themoviedb.org/3
TMDB_API_KEY=your-tmdb-api-key

# Backend — RapidAPI
RAPIDAPI_UTELLY_API_KEY=your-utelly-key
RAPIDAPI_UTELLY_URL=https://utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com
RAPIDAPI_WATCHMODE_URL=https://api.watchmode.com/v1
```

---

## Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| Compose file | `docker-compose.dev.yml` | `docker-compose.yml` |
| Build target | `deps` / `builder` (partial) | `runner` (final stage) |
| Source code | Volume-mounted from host | Copied into image |
| Hot reload | Yes (`next dev` / `nodemon`) | No |
| node_modules | Full (incl. devDependencies) | Production-only / standalone |
| Image size | ~800MB+ | ~150-200MB |
| NODE_ENV | `development` | `production` |
| User | root (file write access) | Non-root (`nextjs` / `appuser`) |

### When to use Docker for dev?

**Recommendation**: Use Docker for development **only if you need MongoDB locally** or want a consistent team environment. For day-to-day frontend/backend development, running `npm run dev` natively is faster on macOS because Docker Desktop uses a Linux VM with slower filesystem I/O through volume mounts.

A pragmatic approach:
- Run MongoDB in Docker (`docker compose up mongodb`)
- Run frontend + backend natively with `npm run dev`

---

## Health Checks

### Why health checks?

Without health checks, Docker only knows if a process is **running** — not if it's actually **serving requests**. Health checks enable:
- `depends_on: condition: service_healthy` — ordered startup
- Automatic restarts when a service becomes unresponsive
- Load balancer integration in orchestrators (Kubernetes, Swarm)

### Implementation

**Frontend** — uses `wget` (available on Alpine by default, unlike `curl`):
```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 20s  # grace period for Next.js startup
```

**Backend** — consider adding a `/health` endpoint:
```typescript
// Add to bingr-server routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});
```

```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "-q", "http://localhost:8000/health"]
  interval: 15s
  timeout: 5s
  retries: 5
  start_period: 10s
```

**MongoDB**:
```yaml
healthcheck:
  test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
  interval: 15s
  timeout: 5s
  retries: 5
  start_period: 10s
```

---

## Image Size Optimization

### Techniques Used

| Technique | Impact | Applied In |
|-----------|--------|-----------|
| **Alpine base** (`node:20-alpine`) | ~120MB vs ~350MB for Debian | Both |
| **Multi-stage builds** | Only production artifacts in final image | Both |
| **`output: "standalone"`** | Traces only needed node_modules | Frontend |
| **`npm ci --omit=dev`** | No dev dependencies in prod | Backend |
| **`.dockerignore`** | Faster build context transfer | Both |
| **`npm cache clean --force`** | Removes npm cache from layer | Backend |

### Expected Image Sizes

| Image | Estimated Size |
|-------|---------------|
| Frontend (standalone + Alpine) | ~150-200MB |
| Backend (prod deps + Alpine) | ~200-250MB |
| MongoDB | ~750MB (official image) |

---

## Security Best Practices

### Applied in These Dockerfiles

1. **Non-root user** — both containers run as UID 1001 (not root)
2. **Multi-stage builds** — build tools and source code never appear in the final image
3. **`--omit=dev`** — dev dependencies (test frameworks, linters) excluded from production
4. **No secrets in image layers** — all secrets injected at runtime via environment variables
5. **`dumb-init`** — proper signal handling for graceful shutdown (backend)
6. **Alpine base** — minimal attack surface (fewer packages installed)
7. **Pinned base images** — `node:20-alpine` rather than `node:latest` for reproducibility

### Additional Recommendations

- Use `docker scout` or `trivy` to scan images for vulnerabilities
- Consider Docker Secrets for highly sensitive values (API keys, OAuth secrets)
- Pin exact Node.js versions in production (e.g., `node:20.11-alpine`) for deterministic builds
- Set `read_only: true` in Compose for containers that don't need to write to the filesystem

---

## Common Commands

### Build & Run

```bash
# Production — build and start all services
docker compose up --build -d

# Development — with volume mounts and hot reload
docker compose -f docker-compose.dev.yml up --build

# Build with custom API URL
docker compose build --build-arg NEXT_PUBLIC_API_URL=https://api.mysite.com frontend

# Start only MongoDB (for native dev)
docker compose up mongodb -d
```

### Monitoring

```bash
# View logs (follow)
docker compose logs -f

# View logs for one service
docker compose logs -f frontend

# Check health status
docker compose ps

# Inspect a container
docker inspect <container_id>
```

### Maintenance

```bash
# Stop all services
docker compose down

# Stop and remove volumes (deletes MongoDB data!)
docker compose down -v

# Rebuild a single service
docker compose build frontend

# Prune unused images
docker image prune -f

# Prune everything (containers, networks, images, cache)
docker system prune -af
```

### Debugging

```bash
# Shell into a running container
docker compose exec frontend sh
docker compose exec backend sh

# Shell into MongoDB
docker compose exec mongodb mongosh

# Run one-off command
docker compose run --rm backend npm test
```

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `ECONNREFUSED` from frontend to backend | Wrong API URL or backend not ready | Use `http://backend:8000` (Docker DNS), add `depends_on` with health check |
| `standalone` folder missing | `output: "standalone"` not in `next.config.ts` | Add the config and rebuild |
| Slow builds on macOS | Docker VM filesystem overhead | Use `.dockerignore`, avoid volume mounts in prod builds |
| `node_modules` conflicts with volume mount | Host `node_modules` overrides container's | Use anonymous volume: `/app/node_modules` |
| MongoDB connection timeout | MongoDB not ready when backend starts | Use `depends_on: condition: service_healthy` |
| `NEXT_PUBLIC_*` value not updating | These vars are inlined at build time | Rebuild the image (not just restart the container) |
| Permission denied errors | Running as non-root user | Ensure `--chown` flags on COPY commands |

---

## References

- [Vercel Official Next.js Docker Example](https://github.com/vercel/next.js/tree/canary/examples/with-docker)
- [Next.js Deploying Documentation](https://nextjs.org/docs/app/getting-started/deploying)
- [Next.js `output: "standalone"` Reference](https://nextjs.org/docs/pages/api-reference/config/next-config-js/output)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [Snyk: 10 Best Practices to Containerize Node.js](https://snyk.io/blog/10-best-practices-to-containerize-nodejs-web-applications-with-docker/)
- [Docker Compose Environment Variables](https://docs.docker.com/compose/how-tos/environment-variables/best-practices/)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
