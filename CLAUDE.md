# StreamSeek

A movie and TV show discovery app built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

## Project Structure

```
app/
├── components/
│   ├── Appbar.tsx                  # Main app bar (fixed, gradient, responsive)
│   ├── Footer.tsx                  # Footer with feedback form + GitHub/LinkedIn links
│   ├── Header.tsx                  # Legacy simple header (kept as reference)
│   └── appbar/
│       ├── DesktopNav.tsx          # Desktop nav links with active state
│       ├── GenreFilter.tsx         # Genre filter popover with chip selection (shadcn)
│       ├── MobileDrawer.tsx        # Slide-over mobile navigation drawer
│       ├── SearchInput.tsx         # Debounced search input (1300ms)
│       └── UserMenu.tsx            # User avatar/login with auth dialog + sign out
│   └── auth/
│       ├── AuthDialog.tsx          # Login dialog with Google/GitHub SSO buttons (shadcn Dialog)
│       └── SessionSync.tsx         # Syncs Auth.js session → Zustand userProfile
├── constants/
│   └── genres.ts                   # TMDB genre data (27 genres: 19 movie + 8 TV-specific) + GENRE_MAP
├── hooks/
│   ├── useDebounce.ts              # Generic debounce hook
│   └── queries/                    # TanStack Query hooks
│       ├── queryKeys.ts            # Query key factory (mediaKeys, detailKeys)
│       ├── useTrending.ts          # Trending media by type + page
│       ├── useSearch.ts            # Text search (enabled when text.length > 1)
│       ├── useFilter.ts            # Genre filter
│       ├── useUpcoming.ts          # Upcoming releases
│       ├── useMediaDetails.ts      # Single media details
│       ├── useMediaVideos.ts       # Trailers/videos
│       ├── useMediaCast.ts         # Cast members
│       ├── useOTTPlatforms.ts      # Streaming platform links
│       ├── useRecommendations.ts   # Related media
│       ├── useSeasonEpisodes.ts    # TV season episodes
│       └── index.ts                # Barrel export
├── api/auth/[...nextauth]/
│   └── route.ts                    # Auth.js API route handler (GET + POST)
├── providers/
│   ├── AuthProvider.tsx            # Auth.js SessionProvider wrapper ("use client")
│   └── QueryProvider.tsx           # TanStack Query client provider ("use client")
├── services/
│   ├── apiClient.ts                # Typed fetch POST client with 15s timeout (12 endpoint methods)
│   └── endpoints.ts                # API endpoint URL constants (env-configurable)
├── stores/
│   └── useAppStore.ts              # Zustand store (search, genres, user profile, UI flags)
├── types/
│   ├── api.ts                      # Request param interfaces (TrendingParams, SearchParams, etc.)
│   ├── details.ts                  # MediaDetails, CastMember, Video, OTTPlatform, Season, Episode
│   ├── index.ts                    # Barrel re-export
│   ├── media.ts                    # MediaItem, MediaType, PaginatedResponse<T>, Genre
│   └── user.ts                     # UserProfile, UserLocation
├── components/
│   └── details/                    # Details page sub-components
│       ├── DetailBackground.tsx    # Full-viewport TMDB backdrop with gradient overlay
│       ├── DetailPoster.tsx        # Large poster image
│       ├── DetailHeader.tsx        # Title, tagline, rating, date, runtime, IMDb link, genre badges
│       ├── DetailOverview.tsx      # Plot description
│       ├── DetailCast.tsx          # Horizontal scroll cast carousel (ScrollArea)
│       ├── DetailStreams.tsx       # OTT platform icons with tooltips and links
│       ├── DetailVideos.tsx        # Trailer buttons + YouTube embed Dialog
│       ├── DetailRecommends.tsx    # Recommendation poster carousel
│       ├── DetailSeasons.tsx       # TV seasons carousel with click-to-expand
│       ├── EpisodesDialog.tsx      # Season episodes in scrollable Dialog
│       └── DetailSkeleton.tsx      # Loading state skeleton
├── details/[mediatype]/[id]/
│   ├── page.tsx                    # Server component with generateMetadata + DetailsClient
│   ├── DetailsClient.tsx           # "use client" orchestrator — fires 5 parallel TanStack queries
│   ├── error.tsx                   # Details-level error boundary
│   └── loading.tsx                 # Details loading skeleton
├── filter/
│   ├── page.tsx                    # Filter page (receives ?genres=28,12,16)
│   └── layout.tsx                  # Static metadata: "Filter"
├── movies/
│   ├── page.tsx                    # Movies listing
│   └── layout.tsx                  # Static metadata: "Movies"
├── search/
│   ├── page.tsx                    # Search page (receives ?q=query)
│   └── layout.tsx                  # Static metadata: "Search"
├── test/page.tsx                   # Test/dev page
├── tvshows/
│   ├── page.tsx                    # TV Shows listing
│   └── layout.tsx                  # Static metadata: "TV Shows"
├── upcoming/
│   ├── page.tsx                    # Upcoming releases
│   └── layout.tsx                  # Static metadata: "Upcoming"
├── error.tsx                       # Global error boundary ("use client")
├── not-found.tsx                   # Custom 404 page
├── loading.tsx                     # Global loading skeleton
├── globals.css                     # Global styles (dark theme, shadcn + Tailwind v4)
├── layout.tsx                      # Root layout with AuthProvider + QueryProvider + TooltipProvider
└── page.tsx                        # Dashboard (home page)

├── components/
│   └── media/                      # Reusable media display components
│       ├── MediaCard.tsx           # Card with poster + hover overlay (title, rating, year, genres)
│       ├── MediaGrid.tsx           # Responsive CSS grid with loading/empty states
│       ├── MediaPagination.tsx     # Prev/Next pagination using URL search params
│       ├── MediaPoster.tsx         # Next.js Image wrapper for TMDB posters
│       ├── MediaSkeleton.tsx       # Grid of skeleton loading cards
│       └── index.ts               # Barrel export
├── lib/
│   ├── tmdb.ts                     # TMDB image URL helpers (posterUrl, backdropUrl, profileUrl)
│   └── formatDate.ts              # Date formatting (formatDate, formatYear) using Intl
├── ...pages...
├── globals.css                     # Global styles (dark theme, shadcn + Tailwind v4)
├── layout.tsx                      # Root layout with AuthProvider + QueryProvider + Font Awesome config
└── page.tsx                        # Dashboard (home page)

components/
└── ui/                             # shadcn/ui components (project root)
    ├── avatar.tsx
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── popover.tsx
    ├── scroll-area.tsx
    ├── separator.tsx
    ├── skeleton.tsx
    ├── textarea.tsx
    └── tooltip.tsx

auth.ts                                # Auth.js v5 config (Google + GitHub SSO, JWT sessions)

docs/
└── migration-plan.md               # Full 8-phase migration plan (BingeFeast → StreamSeek)

lib/
└── utils.ts                        # cn() class merge utility (clsx + tailwind-merge)
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
| `/test` | Test | — | — |

**Page pattern**: Each listing page is a `"use client"` component with inner content wrapped in `<Suspense>` (required for `useSearchParams`). Renders `<MediaGrid>` + `<MediaPagination>`.

## Key Libraries

- **shadcn/ui** — Avatar, Badge, Button, Card, Dialog, Input, Popover, ScrollArea, Separator, Skeleton, Textarea, Tooltip (in `components/ui/`)
- **Font Awesome** — Icons (`@fortawesome/react-fontawesome`, `free-solid-svg-icons`, `free-brands-svg-icons`)
- **Tailwind CSS v4** — Styling with `@theme inline` custom properties
- **Zustand** — Client state management (search, genres, user profile with localStorage persistence)
- **TanStack Query** — Server data fetching, caching, dedup (5min staleTime default)
- **Auth.js v5** — SSO authentication (Google + GitHub), JWT sessions, no database required

## API Client (`app/services/apiClient.ts`)

All backend calls go through `apiClient` methods using native `fetch` POST with 15s timeout:
- `apiClient.trending({ media_type, page })` → `PaginatedResponse<MediaItem>`
- `apiClient.search({ searchText, page })` → `PaginatedResponse<MediaItem>`
- `apiClient.filter({ media_type, genres, page })` → `PaginatedResponse<MediaItem>`
- `apiClient.upcoming({ page })` → `PaginatedResponse<MediaItem>`
- `apiClient.details({ id, media_type })` → `MediaDetails`
- `apiClient.videos({ id, media_type })` → `{ results: Video[] }`
- `apiClient.cast({ id, media_type })` → `{ cast: CastMember[] }`
- `apiClient.ottPlatforms({ id, media_type })` → `{ platforms: OTTPlatform[] }`
- `apiClient.recommendations({ id, media_type })` → `PaginatedResponse<MediaItem>`
- `apiClient.seasons({ id, seasonNumber })` → `{ episodes: Episode[] }`
- `apiClient.feedback({ email, message })` → `{ status: number }`

Base URL configured via `NEXT_PUBLIC_API_URL` env variable (defaults to `https://bingee-server.herokuapp.com/api`).

## Zustand Store (`app/stores/useAppStore.ts`)

- `searchText` / `setSearchText` — ephemeral search text (also URL-driven)
- `selectedGenreIds` / `toggleGenre` / `setGenreIds` / `clearGenres` — genre filter state (`Set<number>`)
- `userProfile` / `setUserProfile` — persisted to localStorage via zustand `persist` middleware
- `userLocation` / `setUserLocation` — geolocation data
- `isMobileDrawerOpen` / `setMobileDrawerOpen` — UI flag

## Query Hooks (`app/hooks/queries/`)

All server data fetching uses TanStack Query hooks with structured query keys:
- `useTrending(mediaType, page)` — Trending media by type ("all" | "movie" | "tv")
- `useSearch(text, page)` — Text search, enabled when text.length > 1
- `useFilter(genres, page)` — Filter by comma-separated genre IDs
- `useUpcoming(page)` — Upcoming releases
- `useMediaDetails(type, id)` — Single media details
- `useMediaVideos(type, id)` — Trailers and videos
- `useMediaCast(type, id)` — Cast members
- `useOTTPlatforms(type, id)` — Streaming platform links
- `useRecommendations(type, id)` — Related media recommendations
- `useSeasonEpisodes(id, seasonNumber)` — TV season episodes

## Media Components (`app/components/media/`)

- `MediaCard` — Card with TMDB poster + hover overlay showing title, ★ rating, year, genre badges
- `MediaGrid` — Responsive grid (2→6 cols) rendering MediaCards, with loading/error/empty states
- `MediaPagination` — Prev/Next buttons updating `?page=` URL search param
- `MediaPoster` — Next.js Image wrapper for TMDB poster URLs with fallback
- `MediaSkeleton` — Grid of skeleton loading cards (shadcn Skeleton)

## Details Page (`app/details/[mediatype]/[id]/`)

Server component exports `generateMetadata` (fetches details for dynamic title/description/OG image).
Client component fires 5 TanStack queries in parallel via `DetailsClient.tsx`:
- `useMediaDetails(type, id)` → header, poster, overview, genres (includes `isError` handling)
- `useMediaVideos(type, id)` → trailers section with YouTube embed Dialog
- `useMediaCast(type, id)` → horizontal scroll cast carousel
- `useOTTPlatforms(type, id)` → streaming platform icons with Tooltip links
- `useRecommendations(type, id)` → recommendation poster carousel

TV shows additionally render `DetailSeasons` → `EpisodesDialog` (fetches episodes on demand).

## TMDB Image Helpers (`app/lib/tmdb.ts`)

- `posterUrl(path, size?)` — Returns TMDB poster URL (w300 | w500, defaults to w500)
- `backdropUrl(path, size?)` — Returns backdrop URL (w780 | original, defaults to original)
- `profileUrl(path, size?)` — Returns profile URL (w300 | w500, defaults to w500)

## Authentication (`auth.ts` + Auth.js v5)

- **SSO Providers**: Google + GitHub (auto-detected from `AUTH_GOOGLE_ID`/`AUTH_GITHUB_ID` env vars)
- **Session Strategy**: JWT (no database required)
- **Auth Flow**: UserMenu → AuthDialog → `signIn("google"|"github")` → OAuth redirect → JWT session → SessionSync → Zustand `userProfile`
- `auth.ts` — Root config exporting `handlers`, `signIn`, `signOut`, `auth`
- `app/api/auth/[...nextauth]/route.ts` — API route handler
- `app/providers/AuthProvider.tsx` — Wraps app with `<SessionProvider>`
- `app/components/auth/AuthDialog.tsx` — Login dialog with Google/GitHub buttons
- `app/components/auth/SessionSync.tsx` — Bridges Auth.js session → Zustand store
- `app/components/appbar/UserMenu.tsx` — Shows avatar when logged in, sign-in icon when logged out
- **Avatar domains**: `lh3.googleusercontent.com` (Google), `avatars.githubusercontent.com` (GitHub) in `next.config.ts`
- **Env vars**: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`

## Error Handling

- `app/error.tsx` — Global error boundary with "Try again" reset button
- `app/not-found.tsx` — Custom 404 page with link to home
- `app/loading.tsx` — Global route loading (MediaSkeleton)
- `app/details/[mediatype]/[id]/error.tsx` — Details-level error boundary
- `app/details/[mediatype]/[id]/loading.tsx` — Details loading (DetailSkeleton)
- `MediaGrid` accepts optional `isError` prop — all 6 listing pages pass it from query hooks
- `DetailsClient` checks `isError` from `useMediaDetails` before rendering

## SEO + Metadata

- Root layout exports metadata with `title.template: "%s | StreamSeek"` for automatic title suffixing
- Details page exports `generateMetadata` — fetches details server-side for dynamic title, description, OG image
- Each listing route has a `layout.tsx` with static metadata (e.g., `{ title: "Movies" }` → renders as "Movies | StreamSeek")
- OpenGraph defaults: `siteName: "StreamSeek"`, `type: "website"`, `locale: "en_US"`

## Security Headers (`next.config.ts`)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `poweredByHeader: false`

## Conventions

- Dark theme by default (oklch dark zinc palette, always-dark — no light/dark toggle)
- Accent color: `#E46E36` (orange) — registered as `--color-accent` in `@theme inline`
- shadcn/ui components in `components/ui/` (project root), app components in `app/components/`
- `cn()` from `lib/utils.ts` for class merging in shadcn components
- Pagination via search params (`?page=1`) rather than route segments
- Genre filter via search params (`?genres=28,12,16`)
- Dynamic route params for media details (`mediatype` and `id`)
- Font Awesome SSR: `config.autoAddCss = false` + explicit CSS import in layout
- `useSearchParams()` must be wrapped in `<Suspense>` boundary

## Migration Status

- Phase 1: Foundation (Types, API Client, Zustand, TanStack Query) ✅COMPLETE
- Phase 2: Query Hooks + Common Components (MediaCard, Grid, Pagination) ✅COMPLETE
- Phase 3: Listing Pages (Dashboard, Movies, TVShows, Upcoming, Search, Filter) ✅COMPLETE
- Phase 4: Details Page + Sub-components (11 detail components, 5 parallel queries) ✅COMPLETE
- Phase 5: Footer + Feedback Form ✅COMPLETE
- Phase 6: Authentication (Auth.js v5 — Google + GitHub SSO) ✅COMPLETE
- Phase 7: Analytics + Geolocation — pending
- Phase 8: Error Handling + SEO + Polish ✅COMPLETE
