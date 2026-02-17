# Full Migration: BingeFeast Legacy App → StreamSeek (Next.js)

## Context
Migrating the entire BingeFeast/bingr-webapp (React 17 + Redux + Material UI + React Router v5) to the StreamSeek Next.js 16 project using Zustand, TanStack Query, and shadcn/ui. The legacy app is a TMDB-based movie/TV discovery platform with trending, search, genre filtering, media details (cast, trailers, OTT links, seasons), and Firebase auth.

**Already done**: Appbar (nav, search, genre filter, mobile drawer, user menu), 8 placeholder pages, shadcn/ui init, Font Awesome, dark theme.

## 8 Phases (each builds and works independently)

---

### PHASE 1: Foundation (Types + API Client + Zustand + TanStack Query + Config)

**Install**: `zustand`, `@tanstack/react-query`, `@tanstack/react-query-devtools`

**Create**:
| File | Purpose |
|------|---------|
| `.env.local` | `NEXT_PUBLIC_API_URL=https://bingee-server.herokuapp.com/api` |
| `app/types/media.ts` | `MediaItem`, `MediaType`, `PaginatedResponse<T>`, `Genre` |
| `app/types/details.ts` | `MediaDetails`, `CastMember`, `Video`, `OTTPlatform`, `Season`, `Episode` |
| `app/types/user.ts` | `UserProfile`, `UserLocation` |
| `app/types/api.ts` | Request param interfaces (`TrendingParams`, `SearchParams`, etc.) |
| `app/types/index.ts` | Barrel re-export |
| `app/services/apiClient.ts` | Typed `fetch` POST client (replaces Axios) with 15s timeout |
| `app/services/endpoints.ts` | 12 endpoint constants |
| `app/stores/useAppStore.ts` | Zustand: `searchText`, `selectedGenreIds`, `userProfile` (persisted), `userLocation`, UI flags |
| `app/providers/QueryProvider.tsx` | `"use client"` TanStack QueryClientProvider wrapper |

**Modify**:
| File | Change |
|------|--------|
| `next.config.ts` | Add `images.remotePatterns` for `image.tmdb.org` |
| `app/layout.tsx` | Wrap with `<QueryProvider>` |
| `app/constants/genres.ts` | Add 7 TV-specific genres (total 26, matching legacy `Genres.js`) |

**API client design**: All endpoints as typed methods — `apiClient.trending(params)` returns `Promise<PaginatedResponse<MediaItem>>`. Uses native `fetch` (no Axios needed).

**Zustand store**: `persist` middleware for `userProfile` (localStorage). Search text and genre IDs are ephemeral/URL-driven.

---

### PHASE 2: Query Hooks + Common Components (MediaCard, Grid, Pagination)

**Install shadcn**: `npx shadcn@latest add card skeleton`

**Create**:
| File | Purpose |
|------|---------|
| `app/hooks/queries/queryKeys.ts` | Query key factory: `mediaKeys.trending(type,page)`, `detailKeys.detail(type,id)` |
| `app/hooks/queries/useTrending.ts` | `useTrending(mediaType, page)` — staleTime: 5min |
| `app/hooks/queries/useSearch.ts` | `useSearch(text, page)` — enabled when text.length > 1 |
| `app/hooks/queries/useFilter.ts` | `useFilter(genres, page)` |
| `app/hooks/queries/useUpcoming.ts` | `useUpcoming(region, page)` |
| `app/hooks/queries/useMediaDetails.ts` | `useMediaDetails(type, id)` |
| `app/hooks/queries/useMediaVideos.ts` | `useMediaVideos(type, id)` |
| `app/hooks/queries/useMediaCast.ts` | `useMediaCast(type, id)` |
| `app/hooks/queries/useOTTPlatforms.ts` | `useOTTPlatforms(type, id)` |
| `app/hooks/queries/useRecommendations.ts` | `useRecommendations(type, id)` |
| `app/hooks/queries/useSeasonEpisodes.ts` | `useSeasonEpisodes(id, seasonNumber)` |
| `app/hooks/queries/index.ts` | Barrel export |
| `app/lib/tmdb.ts` | Image URL helpers: `posterUrl(path, size)`, `backdropUrl(path)` |
| `app/lib/formatDate.ts` | `formatYear()`, `formatDate()` using Intl (replaces moment.js) |
| `app/components/media/MediaCard.tsx` | shadcn Card + Next.js Image + hover overlay (genres, rating, date) → navigates to `/details/{type}/{id}` |
| `app/components/media/MediaGrid.tsx` | Responsive CSS grid of MediaCards, shows MediaSkeleton when loading |
| `app/components/media/MediaPagination.tsx` | Prev/Next buttons using URL search params |
| `app/components/media/MediaPoster.tsx` | Next.js Image wrapper for TMDB posters |
| `app/components/media/MediaSkeleton.tsx` | Grid of skeleton cards (shadcn Skeleton) |
| `app/components/media/index.ts` | Barrel export |

**MediaCard hover**: Shows title, `vote_average` as rating, release year, genre names resolved from `GENRES` constant. Click → `/details/movie/123`.

---

### PHASE 3: Listing Pages (Dashboard, Movies, TVShows, Upcoming, Search, Filter)

**Modify** all 6 placeholder pages to use TanStack Query hooks + common components:

| Page | Hook | Params |
|------|------|--------|
| `app/page.tsx` | `useTrending("all", page)` | `?page=` from searchParams |
| `app/movies/page.tsx` | `useTrending("movie", page)` | `?page=` |
| `app/tvshows/page.tsx` | `useTrending("tv", page)` | `?page=` |
| `app/upcoming/page.tsx` | `useUpcoming(region, page)` | `?page=`, region defaults to "US" |
| `app/search/page.tsx` | `useSearch(q, page)` | `?q=` + `?page=` from searchParams |
| `app/filter/page.tsx` | `useFilter(genres, page)` | `?genres=` + `?page=` from searchParams |

**Pattern**: Each page wraps content in `<Suspense>` (for `useSearchParams`), renders `<MediaGrid>` + `<MediaPagination>`.

**Also modify**: `app/components/appbar/GenreFilter.tsx` — sync `selectedIds` to Zustand store for persistence across navigation.

---

### PHASE 4: Details Page + Sub-components

**Install shadcn**: `npx shadcn@latest add dialog scroll-area tooltip separator avatar`

**Create**:
| File | Purpose |
|------|---------|
| `app/details/[mediatype]/[id]/DetailsClient.tsx` | `"use client"` — fires 5 parallel TanStack queries |
| `app/components/details/DetailBackground.tsx` | Full-viewport TMDB backdrop with gradient overlay |
| `app/components/details/DetailPoster.tsx` | Large poster image |
| `app/components/details/DetailHeader.tsx` | Title, tagline, rating, date, runtime, genre badges |
| `app/components/details/DetailOverview.tsx` | Plot description |
| `app/components/details/DetailCast.tsx` | Horizontal scroll cast carousel (shadcn ScrollArea) |
| `app/components/details/DetailStreams.tsx` | OTT platform icons with links (shadcn Tooltip) |
| `app/components/details/DetailVideos.tsx` | Trailer list + YouTube embed dialog (shadcn Dialog) |
| `app/components/details/DetailRecommends.tsx` | Recommendation carousel |
| `app/components/details/DetailSeasons.tsx` | TV seasons carousel |
| `app/components/details/EpisodesDialog.tsx` | Season episodes in shadcn Dialog |
| `app/components/details/DetailSkeleton.tsx` | Loading state skeleton |

**Details page** fires 5 queries in parallel (TanStack Query handles this natively):
```
useMediaDetails(type, id)     → header, poster, overview, genres
useMediaVideos(type, id)      → trailers section
useMediaCast(type, id)        → cast carousel
useOTTPlatforms(type, id)     → streaming links
useRecommendations(type, id)  → recommendation carousel
```

---

### PHASE 5: Footer + Feedback Form
**Install shadcn**: `npx shadcn@latest add input textarea`

Create `app/components/Footer.tsx` — feedback form (email + message + submit using `apiClient.feedback`), external links. Add to `app/layout.tsx`.

---

### PHASE 6: Authentication (Firebase v10+ modular)
**Install**: `firebase`

Create `app/lib/firebase.ts`, `app/lib/auth.ts` (Google/Facebook/Twitter sign-in), `app/components/auth/AuthDialog.tsx` (shadcn Dialog), `app/components/auth/AuthProvider.tsx` (syncs Firebase → Zustand). Modify `UserMenu.tsx` for login/logout/avatar.

---

### PHASE 7: Analytics + Geolocation
Create `app/lib/analytics.ts` (GA4 gtag), `app/lib/geolocation.ts` (Cloudflare trace), `app/hooks/useUserTracking.ts` (info API after 15s). Add analytics events to MediaCard clicks.

---

### PHASE 8: Error Handling + SEO + Polish
Create `app/error.tsx`, `app/not-found.tsx`, `app/loading.tsx`, details-level error/loading. Add `generateMetadata` for SEO. Security headers in `next.config.ts`.

---

## Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| `fetch` over Axios | Next.js built-in; no extra dependency |
| Zustand for client state only | Search text, user profile, UI flags — NOT server data |
| TanStack Query for all server data | Caching, dedup, parallel queries, loading/error states built-in |
| `Set<number>` for genre selection | O(1) toggle/lookup (from skills: search-filter-patterns) |
| URL search params for pagination | Already established in CLAUDE.md conventions |
| `Intl.DateTimeFormat` over moment.js | Zero bundle cost; moment is deprecated |
| shadcn Dialog over custom modals | Accessible, animated, Radix-based |
| 5 parallel queries on details page | TanStack Query handles concurrent requests natively |

## Verification (per phase)
- `npm run build` passes with no errors
- `npm run dev` shows working pages with real data
- Pagination, search, filter all navigate correctly
- Details page loads all sections in parallel

## Recommended Implementation Order
Start with **Phase 1** (foundation) → **Phase 2** (components) → **Phase 3** (pages) to get a working app with real data. Phases 4-8 can be done incrementally.
