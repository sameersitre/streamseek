# StreamSeek

A movie and TV show discovery app built as a monorepo with a Next.js 16 frontend and Express backend, containerized with Docker.

**Live**: [streamseek.sameersitre.dev](https://streamseek.sameersitre.dev)

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query, Zustand, Auth.js v5
- **Backend**: Express 4.21, MongoDB (Mongoose 8), Pino logger, Helmet, Axios
- **Infrastructure**: Docker, Docker Compose, Nginx reverse proxy, Let's Encrypt SSL

## Architecture

```
Docker Network (app-network)
├── nginx      (Reverse Proxy)  → Port 80/443 (HTTPS via Let's Encrypt)
├── certbot    (SSL Renewal)    → Auto-renews certificates every 12h
├── frontend   (Next.js 16)     → Internal :3000
├── backend    (Express API)    → Internal :8000
└── mongodb    (MongoDB 7)      → Internal :27017
```

## Getting Started

### Local Development

```bash
npm run install:all   # Install root + client + server dependencies
cp .env.example .env  # Fill in secrets
npm run dev           # Start both client + server dev servers
```

### Docker Development

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up
```

## Docker Commands (Cloud VM)

### Initial Setup

```bash
git clone <repo-url> streamseek && cd streamseek
cp .env.example .env   # Fill in secrets
```

### Build & Run

```bash
# Build all images
docker compose build

# Start production (detached)
docker compose up -d

# Build and start in one step
docker compose up -d --build
```

### Management

```bash
# Stop all services
docker compose down

# Restart a specific service (e.g., after code change)
docker compose up -d --build frontend
docker compose up -d --build backend

# Restart without rebuild
docker compose restart frontend backend

# View logs
docker compose logs -f              # All services
docker compose logs -f backend      # Single service
docker compose logs --tail=100 frontend
```

### Monitoring

```bash
# Running containers + health status
docker compose ps

# Resource usage
docker stats

# Shell into a container
docker exec -it streamseek-backend-1 sh
docker exec -it streamseek-mongodb-1 mongosh
```

### Cleanup

```bash
# Stop and remove containers + networks
docker compose down

# Also remove volumes (WARNING: deletes MongoDB data)
docker compose down -v

# Remove unused images
docker image prune -f

# Nuclear cleanup (all unused containers, images, volumes)
docker system prune -af
```

### SSL Certificate

```bash
# Certbot auto-renews every 12h via the certbot container
# Force renewal if needed:
docker compose restart certbot
```

### Update Deployment

```bash
git pull
docker compose up -d --build
```

## Scripts

```bash
npm run dev           # Start both client + server (concurrently)
npm run dev:client    # Frontend only (next dev)
npm run dev:server    # Backend only (nodemon)
npm run build         # Build both for production
npm run install:all   # Install all dependencies
npm run lint          # Lint both projects
npm run test          # Run server tests
npm run clean         # Remove node_modules and build artifacts
npm run docker:up     # docker compose up -d
npm run docker:down   # docker compose down
npm run docker:dev    # docker compose -f docker-compose.dev.yml up
npm run docker:build  # docker compose build
```

## Environment Variables

See [.env.example](.env.example) for the full list of required variables.

## Documentation

- [Docker Setup Guide](docs/docker-setup-guide.md)
- [Production Deployment Guide](docs/production-deployment-guide.md)
- [Migration Plan](docs/migration-plan.md)
- [Watchlist & Likes PRD](docs/prd-watchlist-likes.md)
