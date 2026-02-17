# StreamSeek

A movie and TV show discovery app built as a monorepo with a Next.js 16 frontend and Express backend, containerized with Docker.

## Monorepo Structure

```
streamseek/
├── package.json                    # Root orchestrator (concurrently for parallel dev)
├── docker-compose.yml              # Production: frontend + backend + MongoDB
├── docker-compose.dev.yml          # Development: volume mounts + hot reload
├── .env.example                    # Template for all required env vars
├── .gitignore                      # Root gitignore (covers client + server)
│
├── client/                         # ─── Frontend (Next.js 16) ───────────────
│   ├── Dockerfile                  # 3-stage build: deps → builder → runner (standalone)
│   ├── .dockerignore
│   ├── package.json                # npm
│   ├── next.config.ts              # output: "standalone" for Docker
│   ├── auth.ts                     # Auth.js v5 config (Google + GitHub SSO)
│   ├── app/
│   │   ├── components/
│   │   │   ├── Appbar.tsx          # Main app bar (fixed, gradient, responsive)
│   │   │   ├── Footer.tsx          # Footer with feedback form + GitHub/LinkedIn links
│   │   │   ├── Header.tsx          # Legacy simple header
│   │   │   ├── appbar/
│   │   │   │   ├── DesktopNav.tsx
│   │   │   │   ├── GenreFilter.tsx
│   │   │   │   ├── MobileDrawer.tsx
│   │   │   │   ├── SearchInput.tsx
│   │   │   │   └── UserMenu.tsx
│   │   │   ├── auth/
│   │   │   │   ├── AuthDialog.tsx
│   │   │   │   └── SessionSync.tsx
│   │   │   ├── details/            # 11 detail sub-components
│   │   │   └── media/              # Reusable media display components
│   │   ├── constants/genres.ts
│   │   ├── hooks/queries/          # TanStack Query hooks (12 hooks)
│   │   ├── api/auth/[...nextauth]/route.ts
│   │   ├── providers/              # AuthProvider + QueryProvider
│   │   ├── services/               # apiClient.ts + endpoints.ts
│   │   ├── stores/useAppStore.ts   # Zustand store
│   │   ├── types/                  # TypeScript interfaces
│   │   ├── details/[mediatype]/[id]/
│   │   ├── filter/ movies/ search/ tvshows/ upcoming/
│   │   ├── error.tsx not-found.tsx loading.tsx
│   │   ├── globals.css layout.tsx page.tsx
│   │   └── lib/                    # tmdb.ts + formatDate.ts
│   ├── components/ui/              # shadcn/ui components (12 components)
│   └── lib/utils.ts                # cn() class merge utility
│
├── server/                         # ─── Backend (Express API) ────────────────
│   ├── Dockerfile                  # 3-stage build: deps → builder → runner (dumb-init)
│   ├── .dockerignore
│   ├── package.json                # npm
│   ├── src/
│   │   ├── server.ts               # Entry point (PORT from env)
│   │   ├── app.ts                  # Express app (cors, helmet, compression)
│   │   ├── common/
│   │   │   ├── env.ts              # dotenv.config()
│   │   │   ├── logger.ts           # Pino logger
│   │   │   └── routes.ts           # Route mounting (/api/v2)
│   │   ├── resources/users/        # Controllers, routes, model, interface
│   │   ├── apiExternal/            # TMDB + RapidAPI external calls
│   │   ├── services/
│   │   │   ├── db.ts               # MongoDB connection (supports MONGO_URI env var)
│   │   │   ├── mongo.ts            # MongoDB native client
│   │   │   └── checkAuth.ts        # Google auth verification
│   │   ├── middlewares/            # unknownEndpoint handler
│   │   ├── types.ts                # TMDB response type definitions
│   │   └── utils/utils.ts          # Utility functions
│   └── tests/                      # Jest test suite
│
└── docs/
    ├── docker-setup-guide.md       # Comprehensive Docker documentation
    └── migration-plan.md           # 8-phase migration plan
```

## Root Scripts (`package.json`)

```bash
npm run dev           # Start both client + server dev servers (concurrently)
npm run dev:client    # Start only frontend (next dev)
npm run dev:server    # Start only backend (nodemon)
npm run build         # Build both for production
npm run install:all   # Install root + client + server dependencies
npm run lint          # Lint both projects
npm run test          # Run server tests
npm run clean         # Remove all node_modules and build artifacts
npm run docker:up     # docker compose up -d (production)
npm run docker:down   # docker compose down
npm run docker:dev    # docker compose -f docker-compose.dev.yml up
npm run docker:build  # docker compose build
```

## Docker Setup

### Architecture

```
Docker Network (app-network)
├── frontend   (Next.js 16)     → Port 3000
├── backend    (Express API)    → Port 8000
└── mongodb    (MongoDB 7)      → Port 27017 (persistent volume)
```

### Dockerfiles

- **`client/Dockerfile`** — 3-stage multi-stage build (deps → builder → runner). Uses `output: "standalone"` for ~150MB final image. Non-root user `nextjs`. `NEXT_PUBLIC_API_URL` passed as build arg.
- **`server/Dockerfile`** — 3-stage build (deps → builder → runner). Uses `dumb-init` for proper signal handling. Non-root user `appuser`. Production deps only via `npm ci --omit=dev`.

### Docker Compose Files

- **`docker-compose.yml`** — Production: all 3 services with health checks, `depends_on` ordering, `restart: unless-stopped`, named volume for MongoDB data.
- **`docker-compose.dev.yml`** — Development: volume mounts for hot reload, `env_file` for local env vars.

### Environment Variables

| Variable | Type | Where |
|----------|------|-------|
| `NEXT_PUBLIC_API_URL` | Build-time (client bundle) | Compose `args:` → `http://localhost:8000/api/v2` |
| `AUTH_SECRET`, `AUTH_GOOGLE_*`, `AUTH_GITHUB_*` | Runtime (server-only) | Compose `environment:` from `.env` |
| `MONGO_URI` | Runtime (server-only) | Compose `environment:` → `mongodb://mongodb:27017/bingefeast` |
| `TMDB_API_KEY`, `RAPIDAPI_*` | Runtime (server-only) | Compose `environment:` from `.env` |

### Quick Start

```bash
cp .env.example .env   # Fill in secrets
npm run docker:up      # Production
npm run docker:dev     # Development with hot reload
```

## Routes

| Route | Page | Hook | Params |
|---|---|---|---|
| `/` | Dashboard (Trending) | `useTrending("all", page)` | `?page=` |
| `/movies` | Movies | `useTrending("movie", page)` | `?page=` |
| `/tvshows` | TV Shows | `useTrending("tv", page)` | `?page=` |
| `/upcoming` | Upcoming | `useUpcoming(page)` | `?page=` |
| `/search` | Search | `useSearch(q, page)` | `?q=` + `?page=` |
| `/filter` | Filter | `useFilter(genres, page)` | `?genres=` + `?page=` |
| `/details/[mediatype]/[id]` | Media Details | 5 parallel queries | Dynamic route |
| `/api/auth/[...nextauth]` | Auth.js API | — | OAuth callbacks |

## Key Libraries

### Client
- **shadcn/ui** — 12 UI components in `client/components/ui/`
- **Font Awesome** — Icons
- **Tailwind CSS v4** — Styling with `@theme inline` custom properties
- **Zustand** — Client state (search, genres, user profile with localStorage persistence)
- **TanStack Query** — Server data fetching, caching, dedup (5min staleTime)
- **Auth.js v5** — SSO (Google + GitHub), JWT sessions

### Server
- **Express 4.21** — REST API framework
- **Mongoose 8** — MongoDB ODM
- **Pino** — Structured JSON logging
- **Helmet** — Security headers
- **Axios** — External API calls (TMDB, RapidAPI)

### DevOps
- **Docker** — Multi-stage builds, Alpine base images
- **Docker Compose** — Multi-container orchestration with health checks
- **concurrently** — Parallel dev server execution

## API

### Client → Backend (`client/app/services/apiClient.ts`)

All calls use native `fetch` POST with 15s timeout. Base URL: `NEXT_PUBLIC_API_URL` (defaults to `https://bingee-server.herokuapp.com/api`).

### Backend Routes (`/api/v2/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v2/trending` | POST | Trending media by type + page |
| `/api/v2/search` | POST | Text search |
| `/api/v2/filter` | POST | Filter by genres |
| `/api/v2/upcoming` | POST | Upcoming releases |
| `/api/v2/getDetails` | POST | Single media details |
| `/api/v2/getVideos` | POST | Trailers/videos |
| `/api/v2/getCastDetails` | POST | Cast members |
| `/api/v2/getOTTPlatforms` | POST | Streaming platforms |
| `/api/v2/getRecommendations` | POST | Related media |
| `/api/v2/getSeasons` | POST | TV season episodes |
| `/api/v2/feedback` | POST | User feedback |
| `/` | GET | Health check |

## Authentication (`client/auth.ts` + Auth.js v5)

- **SSO Providers**: Google + GitHub
- **Session Strategy**: JWT (no database required)
- **Auth Flow**: UserMenu → AuthDialog → `signIn("google"|"github")` → OAuth → JWT → SessionSync → Zustand
- **Env vars**: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`

## Conventions

- Dark theme by default (oklch dark zinc palette)
- Accent color: `#E46E36` (orange) — `--color-accent` in `@theme inline`
- shadcn/ui components in `client/components/ui/`, app components in `client/app/components/`
- `cn()` from `client/lib/utils.ts` for class merging
- Pagination via search params (`?page=1`)
- Genre filter via search params (`?genres=28,12,16`)
- `useSearchParams()` must be wrapped in `<Suspense>` boundary
- Font Awesome SSR: `config.autoAddCss = false` + explicit CSS import in layout

## Migration Status

- Phase 1: Foundation (Types, API Client, Zustand, TanStack Query) ✅COMPLETE
- Phase 2: Query Hooks + Common Components (MediaCard, Grid, Pagination) ✅COMPLETE
- Phase 3: Listing Pages (Dashboard, Movies, TVShows, Upcoming, Search, Filter) ✅COMPLETE
- Phase 4: Details Page + Sub-components (11 detail components, 5 parallel queries) ✅COMPLETE
- Phase 5: Footer + Feedback Form ✅COMPLETE
- Phase 6: Authentication (Auth.js v5 — Google + GitHub SSO) ✅COMPLETE
- Phase 7: Analytics + Geolocation — pending
- Phase 8: Error Handling + SEO + Polish ✅COMPLETE
- Phase 9: Docker + Monorepo Restructure (client/server split, Docker Compose, concurrently) ✅COMPLETE
