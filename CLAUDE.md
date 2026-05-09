# StreamSeek

A movie and TV show discovery app built as a monorepo with a Next.js 16 frontend and Express backend, containerized with Docker.

## Monorepo Structure

```
streamseek/
├── package.json                    # Root orchestrator (concurrently for parallel dev)
├── docker-compose.yml              # Development: builds images locally on VM
├── docker-compose.prod.yml         # Production: pre-built images (pushed via deploy.sh)
├── docker-compose.dev.yml          # Development: volume mounts + hot reload
├── deploy.sh                       # Build locally & deploy to VM (interactive + CLI)
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
│   │   │   ├── Footer.tsx          # Footer with feedback form + GitHub/LinkedIn/Privacy links
│   │   │   ├── appbar/
│   │   │   │   ├── DesktopNav.tsx
│   │   │   │   ├── GenreFilter.tsx
│   │   │   │   ├── MobileDrawer.tsx
│   │   │   │   ├── SearchInput.tsx
│   │   │   │   └── UserMenu.tsx
│   │   │   ├── auth/
│   │   │   │   ├── AuthDialog.tsx
│   │   │   │   └── SessionSync.tsx
│   │   │   ├── dashboard/           # Netflix-style dashboard (8 components)
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
│   │   ├── privacy/                # Privacy Policy page (static, server-rendered)
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
│   │   ├── resources/interactions/ # Watchlist & Likes controllers + routes
│   │   ├── apiExternal/            # TMDB + Watchmode external calls
│   │   ├── services/
│   │   │   ├── db.ts               # MongoDB URI config (lazy connection via connectMongo)
│   │   │   └── mongo.ts            # MongoDB connection with error handling + 5s timeout
│   │   ├── middlewares/            # unknownEndpoint, authMiddleware, rateLimiter
│   │   └── types.ts                # TMDB response type definitions
│   └── tests/                      # Jest test suite
│
└── docs/
    ├── docker-setup-guide.md       # Comprehensive Docker documentation
    ├── migration-plan.md           # 8-phase migration plan
    ├── production-deployment-guide.md  # Step-by-step VM deployment guide
    └── prd-watchlist-likes.md      # PRD for Watchlist & Likes feature
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
npm run deploy        # Interactive deploy menu (./deploy.sh)
npm run deploy:all    # Build + push + restart all services
npm run deploy:frontend  # Build + push + restart frontend only
npm run deploy:backend   # Build + push + restart backend only
npm run deploy:nginx     # Sync nginx config + restart
npm run deploy:init      # First-time VM setup (dirs, Docker, swap)
```

## Deploy Script (`deploy.sh`)

### Strategy: Build Locally → Push to VM

Instead of building Docker images on the VM (which consumes RAM/CPU/disk), images are built locally and shipped as tarballs:

1. `docker build` on local machine (platform: `linux/amd64`)
2. `docker save | gzip` → `/tmp/streamseek-{frontend,backend}.tar.gz`
3. `scp` tarballs to VM
4. `docker load` on VM + remove tarballs

### VM Configuration

- **IP**: `34.45.33.206`
- **User**: `sameersitre`
- **SSH Key**: `~/.ssh/trovie-key-nopass`
- **Deploy Dir**: `~/streamseek`
- **Domain**: `streamseek.sameersitre.dev`

### Usage

```bash
# Non-interactive (CI-friendly)
./deploy.sh all        # Full build & deploy
./deploy.sh frontend   # Frontend only
./deploy.sh backend    # Backend only
./deploy.sh nginx      # Nginx config sync + restart
./deploy.sh init       # First-time VM setup

# Interactive menu
./deploy.sh            # Shows numbered menu with all options
```

### Interactive Menu Options

| Option | Action |
|--------|--------|
| 1 | Deploy everything (full rebuild) |
| 2 | Deploy frontend only |
| 3 | Deploy backend only |
| 4 | Sync configs (docker-compose, nginx) |
| 5 | Sync env files (.env) |
| 6 | Restart services on VM |
| 7 | Health check (containers, API, HTTPS, disk) |
| 8 | View VM logs |
| 9 | SSH into VM |
| n | Restart nginx |
| d | MongoDB SSH tunnel (localhost:27018) |
| s | Setup SSL (first time, via certbot) |
| r | Renew SSL certificate |
| i | Init VM (dirs, Docker, 10GB swap) |
| c | Clean up unused Docker images on VM |

### Production Compose (`docker-compose.prod.yml`)

Uses `image:` references instead of `build:` — the deploy script uploads this as `docker-compose.yml` on the VM. Frontend/backend images are `streamseek-frontend:latest` and `streamseek-backend:latest`, loaded via `docker load` from tarballs. The original `docker-compose.yml` (with `build:` directives) is kept for local `docker compose build` workflows.

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
- Everything else proxied to `frontend:3000`; `sameersitre.dev` proxied to `portfolio:3001`
- Certbot container auto-renews SSL certificates every 12 hours
- `resolver 127.0.0.11 valid=30s` + upstream hostname variables (`set $upstream_X hostname`) — required so nginx resolves Docker service names at request time, not at startup (avoids crash-loop when nginx starts before other services are in the network)

### Docker Compose Files

- **`docker-compose.yml`** — Production: 5 services (nginx, certbot, frontend, backend, mongodb). Services use `expose` (internal only), nginx handles external ports 80/443. Health checks, `depends_on` ordering, `restart: unless-stopped`, named volume for MongoDB data. MongoDB port `27017` also exposed to host for local dev/debugging.
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
| `CLIENT_URL` | Runtime (server-only) | CORS origin for credentialed requests (defaults to `http://localhost:3000`) |
| `GOOGLE_WEB_CLIENT_ID` | Runtime (server-only) | Google OAuth audience for web (Bearer token auth path) |
| `GOOGLE_CLIENT_ID_IOS` | Runtime (server-only) | Google OAuth audience for iOS (Bearer token auth path) |
| `GOOGLE_CLIENT_ID_ANDROID` | Runtime (server-only) | Google OAuth audience for Android (Bearer token auth path) |

### Quick Start

```bash
cp .env.example .env   # Fill in secrets
npm run docker:up      # Production
npm run docker:dev     # Development with hot reload
```

## Routes

| Route | Page | Hook | Params |
|---|---|---|---|
| `/` | Dashboard (Netflix-style) | `useTrending`, `usePopular`, `useTopRated`, `useNowPlaying`, `useAiringToday`, `useOnTheAir`, `useTrendingPeople`, `useUpcoming` | Filter tabs + genre dropdown |
| `/movies` | Movies | `useTrending("movie", page)` | `?page=` |
| `/tvshows` | TV Shows | `useTrending("tv", page)` | `?page=` |
| `/upcoming` | Upcoming | `useUpcoming(page)` | `?page=` |
| `/search` | Search | `useSearch(q, page)` | `?q=` + `?page=` |
| `/filter` | Filter | `useFilter(genres, page)` | `?genres=` + `?page=` |
| `/details/[mediatype]/[id]` | Media Details | 5 parallel queries | Dynamic route |
| `/watchlist` | Watchlist | `useUserWatchlist(page)` | `?page=` |
| `/likes` | Likes | `useUserLikes(page)` | `?page=` |
| `/privacy` | Privacy Policy | — | Static page |
| `/api/auth/[...nextauth]` | Auth.js API | — | OAuth callbacks |
| `/api/interactions/[...path]` | Interaction Proxy | — | Proxies to backend |

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
- **@auth/core** — Decode Auth.js JWE tokens for server-side auth
- **cookie-parser** — Parse cookies from requests
- **express-rate-limit** — Rate limiting (30 req/min on toggle endpoints)

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
| `/api/v2/popular` | POST | Popular movies/TV by type + page (cached) |
| `/api/v2/topRated` | POST | Top rated movies/TV by type + page (cached) |
| `/api/v2/nowPlaying` | POST | Now playing in theaters (cached) |
| `/api/v2/airingToday` | POST | TV airing today (cached) |
| `/api/v2/onTheAir` | POST | TV on the air this week (cached) |
| `/api/v2/trendingPeople` | POST | Trending people (cached) |
| `/api/v2/discoverByGenre` | POST | Discover movies by genre (cached) |
| `/api/v2/interactions/all` | POST | Get all user interactions (auth required) |
| `/api/v2/interactions/toggle-like` | POST | Toggle like on/off (auth + rate limited) |
| `/api/v2/interactions/toggle-watchlist` | POST | Toggle watchlist on/off (auth + rate limited) |
| `/api/v2/interactions/watchlist` | POST | Get user's watchlist, paginated (auth required) |
| `/api/v2/interactions/likes` | POST | Get user's likes, paginated (auth required) |
| `/api/v2/users/sync-profile` | POST | Sync user profile on sign-in (internal auth only) |
| `/` | GET | Health check |

## Authentication (`client/auth.ts` + Auth.js v5)

- **SSO Providers**: Google + GitHub
- **Session Strategy**: JWT (no database required)
- **Profile sync**: `events.signIn` callback fires POST to `/api/v2/users/sync-profile` on every login (fire-and-forget, never blocks auth)
- **Mobile auth**: Express accepts `Authorization: Bearer <googleIdToken>` — validates via Google tokeninfo endpoint, checks audience against configured client IDs
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
- **TypeScript** (bolt conventions applied):
  - `ContentMediaType = "movie" | "tv"` — use this (not `string`) for all detail/interaction endpoints; `MediaType = "all" | ContentMediaType` for search/trending params
  - `OTTStreamType = "sub" | "rent" | "buy" | "free" | "tve"` — union for `OTTPlatform.type`
  - `MediaRef` base interface (`mediaId + mediaType`) extended by `InteractionItem`, `ToggleParams`, `WatchlistItem`
  - `PaginatedListResponse<T = WatchlistItem>` — generic; reuse for any paginated list
  - Server `createCachedListHandler<TBody>` — generic factory; infers body type from `urlBuilder`
  - `axiosFetch<T = any>` — callers can opt in to typed returns; default `any` keeps untyped callers valid
  - `server/tsconfig.json`: `strict: true` enabled; `@types/compression` installed

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
- Phase 14: Watchlist & Likes — Server Backend (PRD, auth middleware, interaction endpoints, rate limiting, MongoDB indexes) ✅COMPLETE
- Phase 15: Watchlist & Likes — Client Data Layer (types, endpoints, apiClient, TanStack Query hooks with optimistic updates) ✅COMPLETE
- Phase 16: Watchlist & Likes — UI Components (DetailActions, MediaCard like/watchlist buttons, persistent status indicators) ✅COMPLETE
- Phase 17: Watchlist & Likes — Pages, API Proxy, Nav & Docker (watchlist/likes pages, Next.js API proxy, nav link, Docker env vars) ✅COMPLETE
- Phase 18: Mobile Auth + Profile Sync (Google Bearer token auth path, user profile sync on sign-in, internal auth middleware, MongoDB port exposure for dev) ✅COMPLETE
- Phase 19: Privacy Policy Page (Google Play Store compliant, covers StreamSeek web + Trovie mobile, 11-section policy, footer link) ✅COMPLETE
- Phase 20: Netflix-style Dashboard (hero carousel, filter tabs, horizontal scroll rows, Top 10, trending people, lazy genre rows, in-memory TTL cache, 7 new TMDB endpoints) ✅COMPLETE
- Phase 21: Dynamic Portfolio Data (MongoDB-backed portfolio content via StreamSeek backend, ISR 5min, `/api/v2/portfolio/content` + `/seed` endpoints, nginx resolver fix) ✅COMPLETE

## Production Deployment

- **Live URL**: `https://streamseek.sameersitre.dev`
- **Portfolio URL**: `https://sameersitre.dev`
- **VM**: Debian 12 (bookworm), Google Cloud, 2GB RAM + 2GB swap
- **Guide**: `docs/production-deployment-guide.md` — full step-by-step instructions
- **Key deployment fixes applied**:
  - `server/Dockerfile`: `--ignore-scripts` on `npm ci` to skip husky in Docker builds
  - `server/src/common/logger.ts`: Conditional pino-pretty (dev only, avoids production crash)
  - `docker-compose.yml`: `HOSTNAME=0.0.0.0` + `AUTH_TRUST_HOST=true` for frontend, node-based healthcheck, increased timeouts for slow VMs
  - `nginx/nginx.conf`: Route `/api/v2/` to backend (not `/api/` which caught Auth.js routes)
  - `nginx/nginx.conf`: Added `resolver 127.0.0.11` + upstream hostname variables so nginx resolves Docker service names at request time, not at startup (prevents crash-loop when nginx starts before other containers)
  - `deploy.sh` `renew_ssl()`: Must use `docker run certbot/certbot` with volume mounts — running host `certbot --standalone` writes to `/etc/letsencrypt` (not the Docker volume), nginx won't pick up the new cert

## SSL Certificate Renewal

- **Cert paths (Docker volume)**: `~/streamseek/nginx/certbot/conf/live/{domain}/`
- **Renew via deploy script**: `./deploy.sh` → option `r` — stops nginx, runs certbot inside Docker with correct volume mounts, restarts nginx
- **Never run** `sudo certbot renew --standalone` directly on the host — it writes to `/etc/letsencrypt` which is not the Docker volume nginx reads from
- If cert was accidentally renewed on host: `sudo cp -rL /etc/letsencrypt/live/{domain}/. ~/streamseek/nginx/certbot/conf/live/{domain}/` then `docker compose restart nginx`

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

## User Interactions (Watchlist & Likes)

- **PRD**: `docs/prd-watchlist-likes.md` — full architecture, API design, implementation roadmap
- **Auth middleware**: `server/src/middlewares/authMiddleware.ts` — 3-path authentication:
  1. **Trusted internal header** (`X-Internal-Secret` + `X-User-Id`) — for Next.js API proxy
  2. **Google Bearer token** (`Authorization: Bearer <idToken>`) — for mobile app, validates via `googleapis.com/tokeninfo`, checks audience against `GOOGLE_WEB_CLIENT_ID` / `GOOGLE_CLIENT_ID_IOS` / `GOOGLE_CLIENT_ID_ANDROID`
  3. **Auth.js JWE cookie** — decodes via `@auth/core/jwt` using shared `AUTH_SECRET`
- **Internal-only middleware**: `requireInternalAuth` — lightweight secret-only validation for server-to-server calls (e.g., profile sync)
- **Cookie names**: `authjs.session-token` (dev), `__Secure-authjs.session-token` (prod)
- **User profile sync**: `client/auth.ts` `events.signIn` fires fire-and-forget POST to `POST /api/v2/users/sync-profile` with `X-Internal-Secret` header, persisting user profile (name, email, image, provider) to MongoDB on every sign-in
- **Rate limiter**: `server/src/middlewares/rateLimiter.ts` — 30 req/min per IP on toggle endpoints
- **MongoDB collection**: `user_interactions` — one document per user-media pair with `liked`/`watchlisted` boolean flags + denormalized title/posterPath/voteAverage
- **Indexes**: unique `{ userId, mediaId, mediaType }`, plus compound indexes for watchlist/likes listing queries
- **CORS**: Express configured with `credentials: true` and explicit `origin` to allow cookie-based auth
- **Client types**: `client/app/types/interaction.ts` — `InteractionItem`, `InteractionStatus`, `ToggleParams`, `AllInteractionsResponse`, `WatchlistItem`, `PaginatedListResponse`
- **Client endpoints**: `client/app/services/endpoints.ts` — 5 interaction endpoints; `apiClient.ts` — 5 methods + `credentials: "include"` on all fetch calls
- **Query keys**: `interactionKeys` in `queryKeys.ts` — `all`, `userAll`, `watchlist(page)`, `likes(page)`
- **TanStack Query hooks** (5 hooks):
  - `useUserInteractions` — fetches all user interactions, provides `isLiked()`/`isWatchlisted()` helpers, 10min staleTime, session-gated
  - `useToggleLike` / `useToggleWatchlist` — mutations with optimistic cache updates + rollback on error
  - `useUserWatchlist` / `useUserLikes` — paginated list queries for dedicated pages, session-gated
- **UI components**:
  - `DetailActions` — Like + Watchlist buttons below genre badges on details page, opens AuthDialog if unauthenticated
  - `MediaCard` — Hover overlay with like/watchlist circular buttons (top-right), persistent status indicators (top-left) when liked/watchlisted, uses `e.preventDefault()`/`e.stopPropagation()` to prevent navigation
  - `DetailHeader` — Accepts `mediaType`/`mediaId` props, renders `DetailActions`
- **Dependency**: `@fortawesome/free-regular-svg-icons` — outline heart/bookmark icons for untoggled state
- **API proxy**: `client/app/api/interactions/[...path]/route.ts` — Next.js API route that proxies interaction requests to backend server-side; authenticates via `auth()` session, forwards `X-User-Id` + `X-Internal-Secret` headers (avoids cross-origin cookie issues)
- **Auth middleware trusted headers**: `X-Internal-Secret` (matches `AUTH_SECRET`) + `X-User-Id` — trusted internal path for Next.js proxy (skips cookie decoding)
- **Mobile auth env vars**: `GOOGLE_WEB_CLIENT_ID`, `GOOGLE_CLIENT_ID_IOS`, `GOOGLE_CLIENT_ID_ANDROID` — audience validation for Google Bearer tokens
- **Interaction endpoints**: Client now calls same-origin `/api/interactions/*` (not direct backend), proxied through Next.js
- **Lazy MongoDB**: Controller uses async `connectMongo()` for collection access (fixes cold start crashes)
- **Pages**: `/watchlist` + `/likes` — grid layout with `MediaPoster`, pagination, empty states, sign-in prompt for unauthenticated users, SEO metadata via layout.tsx
- **Nav**: "Watchlist" link added to Appbar nav links (visible to all users, shows sign-in prompt if unauthenticated)
- **Docker**: `AUTH_SECRET` + `CLIENT_URL` env vars passed to backend service in `docker-compose.yml`

## OTT Streaming Platforms (Watchmode API)

- **API**: Watchmode REST API v1 (`https://api.watchmode.com/v1/`)
- **Auth**: `apiKey` query parameter (free tier: 1,000 calls/month)
- **Title sources**: `/title/{media_type}-{tmdb_id}/sources/?apiKey=...` — returns streaming availability
- **Source logos**: `/sources/?apiKey=...` — returns provider reference data with `logo_100px` URLs, cached in-memory on server
- **Logo CDN**: `cdn.watchmode.com` — requires `referrerPolicy="no-referrer"` on `<img>` tags (blocks Next.js Image optimizer)
- **MongoDB cache**: `ott_streams` collection caches results per title ID; `counters` collection tracks API usage with upsert
- **Env vars**: `WATCHMODE_API_URL` (base URL, defaults to `https://api.watchmode.com/v1`), `WATCHMODE_API_KEY` (get free key at https://api.watchmode.com/requestApiKey)

## Privacy Policy

- **Route**: `/privacy` — static, server-rendered page (no "use client")
- **Platforms covered**: StreamSeek (web) + Trovie (mobile app on Google Play Store)
- **Layout**: `client/app/privacy/layout.tsx` — SEO metadata, OpenGraph, canonical URL
- **Page**: `client/app/privacy/page.tsx` — 11-section privacy policy with dark theme styling
- **Footer link**: Shield icon + "Privacy Policy" link in Footer.tsx Links section
- **Sections**: Information We Collect, How We Use It, Third-Party Services (Google/GitHub OAuth, TMDB, Watchmode), Cookies & Sessions, Data Sharing, Data Security, Data Retention, Children's Privacy, Your Rights, Changes, Contact
- **Contact**: sameersitre@gmail.com
- **Google Play compliance**: Publicly accessible URL, plain language, effective date, no paywall, children's privacy (COPPA), data collection disclosures, third-party links
- **TMDB attribution**: Required notice included ("uses the TMDB API but is not endorsed or certified by TMDB")

## Portfolio (`../portfolio-web/` — `sameersitre.dev`)

- **Repo**: `/Users/codercouple/Documents/sameer/portfolio-web/` — separate Next.js app, deployed as `streamseek-portfolio` Docker image on same VM
- **Dynamic content**: Experiences, skill categories, and projects are stored in MongoDB `portfolio_content` collection, fetched via StreamSeek backend
- **Backend endpoint**: `POST /api/v2/portfolio/content` — public, returns `{ experiences, skillCategories, projects }`
- **Seed endpoint**: `POST /api/v2/portfolio/seed` — `X-Internal-Secret` required, upserts one content type `{ type, data[] }`
- **Fetch**: `portfolio-web/lib/portfolio.ts` — fetches `http://backend:8000/api/v2/portfolio/content` at runtime, falls back to `lib/data.ts` on error or empty DB
- **ISR**: `export const revalidate = 300` in `app/page.tsx` — page refreshes from MongoDB every 5 minutes after first request
- **Build-time**: Backend unreachable during `docker build` (not in network yet) — build always uses static fallback; ISR kicks in at runtime
- **Backend URL**: Must include `/api` prefix — `http://backend:8000/api/v2/...` (Express mounts routes at `/api/`)
- **Docker env**: `BACKEND_INTERNAL_URL=http://backend:8000` passed to portfolio service in `docker-compose.prod.yml`
- **Seed command** (run after deploy to populate/update content):
  ```bash
  curl -X POST https://streamseek.sameersitre.dev/api/v2/portfolio/seed \
    -H "Content-Type: application/json" \
    -H "X-Internal-Secret: <AUTH_SECRET>" \
    -d '{"type":"experiences","data":[...]}'
  # Repeat for skillCategories and projects
  ```
- **DNS**: `sameersitre.dev` + `www.sameersitre.dev` → A record `34.45.33.206` (Squarespace DNS). Was previously pointing to Vercel — caused stale cached content.
