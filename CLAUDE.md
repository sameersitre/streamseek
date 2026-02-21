# StreamSeek

A movie and TV show discovery app built as a monorepo with a Next.js 16 frontend and Express backend, containerized with Docker.

## Monorepo Structure

```
streamseek/
├── package.json                    # Root orchestrator (concurrently for parallel dev)
├── docker-compose.yml              # Production: nginx + certbot + frontend + backend + MongoDB
├── docker-compose.dev.yml          # Development: volume mounts + hot reload
├── nginx/
│   └── nginx.conf                  # Reverse proxy config (HTTPS, domain routing)
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
│   │   ├── resources/users/        # Controllers + routes (API endpoint handlers)
│   │   ├── apiExternal/            # TMDB + Watchmode external calls
│   │   ├── services/
│   │   │   ├── db.ts               # MongoDB URI config (lazy connection via connectMongo)
│   │   │   └── mongo.ts            # MongoDB connection with error handling + 5s timeout
│   │   ├── middlewares/            # unknownEndpoint handler
│   │   └── types.ts                # TMDB response type definitions
│   └── tests/                      # Jest test suite
│
└── docs/
    ├── docker-setup-guide.md       # Comprehensive Docker documentation
    ├── migration-plan.md           # 8-phase migration plan
    └── production-deployment-guide.md  # Step-by-step VM deployment guide
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
├── nginx      (Reverse Proxy)  → Port 80/443 (HTTPS via Let's Encrypt)
├── certbot    (SSL Renewal)    → Auto-renews certificates every 12h
├── frontend   (Next.js 16)     → Internal :3000 (exposed via nginx)
├── backend    (Express API)    → Internal :8000 (exposed via nginx /api/)
└── mongodb    (MongoDB 7)      → Internal :27017 (persistent volume)
```

### Production Domain
- **URL**: `https://streamseek.sameersitre.dev`
- Nginx proxies `/api/v2/*` → backend, everything else (incl. `/api/auth/*`) → frontend
- Single domain eliminates CORS issues
- HTTPS via Let's Encrypt + Certbot auto-renewal

### Dockerfiles

- **`client/Dockerfile`** — 3-stage multi-stage build (deps → builder → runner). Uses `output: "standalone"` for ~150MB final image. Non-root user `nextjs`. `NEXT_PUBLIC_API_URL` passed as build arg.
- **`server/Dockerfile`** — 3-stage build (deps → builder → runner). Uses `dumb-init` for proper signal handling. Non-root user `appuser`. Production deps only via `npm ci --omit=dev`.

### Nginx Reverse Proxy (`nginx/nginx.conf`)
- HTTP (:80) redirects to HTTPS (:443)
- Let's Encrypt ACME challenge served from `/var/www/certbot`
- `/api/v2/*` proxied to `backend:8000` (Auth.js `/api/auth/*` stays on frontend)
- Everything else proxied to `frontend:3000`
- Certbot container auto-renews SSL certificates every 12 hours

### Docker Compose Files

- **`docker-compose.yml`** — Production: 5 services (nginx, certbot, frontend, backend, mongodb). Services use `expose` (internal only), nginx handles external ports 80/443. Health checks, `depends_on` ordering, `restart: unless-stopped`, named volume for MongoDB data.
- **`docker-compose.dev.yml`** — Development: volume mounts for hot reload, `env_file` for local env vars.

### Environment Variables

| Variable | Type | Where |
|----------|------|-------|
| `NEXT_PUBLIC_API_URL` | Build-time (client bundle) | Compose `args:` → `https://streamseek.sameersitre.dev/api/v2` |
| `AUTH_SECRET`, `AUTH_GOOGLE_*`, `AUTH_GITHUB_*` | Runtime (server-only) | Compose `environment:` from `.env` |
| `MONGO_URI` | Runtime (server-only) | Compose `environment:` → `mongodb://mongodb:27017/bingefeast` |
| `TMDB_API_KEY` | Runtime (server-only) | Compose `environment:` from `.env` |
| `WATCHMODE_API_URL` | Runtime (server-only) | Compose `environment:` → `https://api.watchmode.com/v1` |
| `WATCHMODE_API_KEY` | Runtime (server-only) | Compose `environment:` from `.env` |

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
- **Axios** — External API calls (TMDB, Watchmode)

### DevOps
- **Docker** — Multi-stage builds, Alpine base images
- **Docker Compose** — Multi-container orchestration with health checks
- **concurrently** — Parallel dev server execution

## API

### Client → Backend (`client/app/services/apiClient.ts`)

All calls use native `fetch` POST with 15s timeout. Base URL: `NEXT_PUBLIC_API_URL` (defaults to `https://streamseek.sameersitre.dev/api/v2`).

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
| `/api/v2/getOTTPlatforms` | POST | Streaming platforms (via Watchmode API) |
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
- Phase 10: Server Fixes + Production Deployment (TMDB Bearer auth, lazy MongoDB, Nginx HTTPS proxy, domain config, VM deployment guide) ✅COMPLETE
- Phase 11: Watchmode OTT Integration (replace Utelly + RapidAPI with direct Watchmode API, cached source logos, security fix) ✅COMPLETE
- Phase 12: SEO (metadata, JSON-LD, OG images, robots, sitemap, manifest, Twitter cards) + search navigation fix ✅COMPLETE
- Phase 13: Codebase cleanup (remove legacy code, unused deps, dead routes, hardcoded URLs, fix indentation) ✅COMPLETE

## Production Deployment

- **Live URL**: `https://streamseek.sameersitre.dev`
- **VM**: Debian 12 (bookworm), Google Cloud, 2GB RAM + 2GB swap
- **Guide**: `docs/production-deployment-guide.md` — full step-by-step instructions
- **Key deployment fixes applied**:
  - `server/Dockerfile`: `--ignore-scripts` on `npm ci` to skip husky in Docker builds
  - `server/src/common/logger.ts`: Conditional pino-pretty (dev only, avoids production crash)
  - `docker-compose.yml`: `HOSTNAME=0.0.0.0` + `AUTH_TRUST_HOST=true` for frontend, node-based healthcheck, increased timeouts for slow VMs
  - `nginx/nginx.conf`: Route `/api/v2/` to backend (not `/api/` which caught Auth.js routes)

## SEO (`client/app/`)

- **Site config**: `lib/siteConfig.ts` — centralized name, URL, description, colors
- **Metadata**: `layout.tsx` — `metadataBase`, googleBot directives, OG, Twitter cards, theme-color
- **Sub-page metadata**: movies, tvshows, upcoming get descriptions + OG + canonical; search, filter get `noindex`
- **JSON-LD**: `components/JsonLd.tsx` — `WebsiteJsonLd` (SearchAction schema) on root, `MediaJsonLd` (Movie/TVSeries + aggregateRating) on details page
- **OG image**: `opengraph-image.tsx` — Edge Runtime dynamic 1200x630 branded image, re-exported as `twitter-image.tsx`
- **Details page**: `details/[mediatype]/[id]/page.tsx` — `React.cache()` deduplicates API call between `generateMetadata` and page, adds `MediaJsonLd`, Twitter cards, canonical URL
- **Crawling**: `robots.ts` — allow all, disallow `/api/`; `sitemap.ts` — 4 static routes
- **PWA**: `manifest.ts` — standalone display, dark theme
- **Search fix**: `components/appbar/SearchInput.tsx` — removed `pathname` from debounce effect deps to prevent back-and-forth navigation loop; clear input when leaving `/search`

## OTT Streaming Platforms (Watchmode API)

- **API**: Watchmode REST API v1 (`https://api.watchmode.com/v1/`)
- **Auth**: `apiKey` query parameter (free tier: 1,000 calls/month)
- **Title sources**: `/title/{media_type}-{tmdb_id}/sources/?apiKey=...` — returns streaming availability
- **Source logos**: `/sources/?apiKey=...` — returns provider reference data with `logo_100px` URLs, cached in-memory on server
- **Logo CDN**: `cdn.watchmode.com` — requires `referrerPolicy="no-referrer"` on `<img>` tags (blocks Next.js Image optimizer)
- **MongoDB cache**: `ott_streams` collection caches results per title ID; `counters` collection tracks API usage with upsert
- **Env vars**: `WATCHMODE_API_URL` (base URL, defaults to `https://api.watchmode.com/v1`), `WATCHMODE_API_KEY` (get free key at https://api.watchmode.com/requestApiKey)
