# Task: Build Netflix-Style Dashboard for Trovie Mobile App

Replace the current DashboardScreen (infinite scroll trending grid) with a Netflix-style dashboard matching the StreamSeek web app. The backend APIs already exist — this is purely a frontend task.

## Current Trovie App Context

- **Location:** `/Users/codercouple/Documents/sameer/trovieapp/src`
- **Framework:** React Native 0.84, React 19, New Architecture (Fabric)
- **Styling:** NativeWind v4 (`className` prop, never inline `style` objects except calculated values)
- **State:** Zustand v5 (client), TanStack Query v5 (server)
- **Navigation:** React Navigation v7, DashboardStack (Home → Details → Episodes → WebView)
- **Icons:** lucide-react-native
- **Fonts:** OpenSans via `font-opensans-{weight}` classes
- **Theme:** `useTheme()` hook provides `isDarkTheme`, `themeColorCode`, `themeBackgroundColor`, `themeTextColor`
- **API:** `apiClient.post(url, body)` in `src/services/apiClient.ts` — native fetch POST, 15s timeout, auto Bearer token injection
- **Existing components to reuse:**
  - `PosterCard` (`src/components/cards/PosterCard.tsx`) — poster with title, rating, liked badge
  - `ScreenWrapper` (`src/components/layout/ScreenWrapper.tsx`) — handles header blur, back button
  - `ThemedText` (`src/components/common/ThemedText.tsx`) — theme-aware text with size/variant props
  - `Pill` (`src/components/common/Pill.tsx`) — rounded badge/filter button
  - `AdBanner` (`src/components/ads/AdBanner.tsx`) — AdMob banner
  - `ScrollableList` (`src/components/lists/ScrollableList.tsx`) — infinite scroll FlatList
- **Image base URL:** `Config.TMDB_IMAGE_URI` (from `src/utils/constants.ts` — `TMDB_IMAGE_URI`, `IMAGE_SIZES.POSTER_MEDIUM`, `IMAGE_SIZES.BACKDROP_LARGE`, etc.)
- **Genres:** `GENRES` array in `src/utils/genres.ts`
- **Query patterns:** All hooks in `src/hooks/queries/`, use `mediaKeys` from `queryKeys.ts`, 5min staleTime

## Backend APIs (Already Deployed)

All endpoints are POST to `{API_URL}/endpoint` (API_URL defaults to `https://streamseek.sameersitre.dev/api/v2`). These already exist and work:

| Endpoint | Body | Returns | Notes |
|----------|------|---------|-------|
| `/trending` | `{ media_type: "all"\|"movie"\|"tv", page }` | `PaginatedResponse<MediaItem>` | For hero + Top 10 |
| `/popular` | `{ media_type: "movie"\|"tv", page }` | `PaginatedResponse<MediaItem>` | Server-cached 5min |
| `/topRated` | `{ media_type: "movie"\|"tv", page }` | `PaginatedResponse<MediaItem>` | Server-cached 5min |
| `/nowPlaying` | `{ page }` | `PaginatedResponse<MediaItem>` | Movies only, cached |
| `/airingToday` | `{ page }` | `PaginatedResponse<MediaItem>` | TV only, cached |
| `/onTheAir` | `{ page }` | `PaginatedResponse<MediaItem>` | TV only, cached |
| `/trendingPeople` | `{ page }` | `PaginatedResponse<PersonItem>` | Cached |
| `/discoverByGenre` | `{ genre: number, page }` | `PaginatedResponse<MediaItem>` | Movies, cached |
| `/upcoming` | `{ page }` | `PaginatedResponse<MediaItem>` | Existing |

## What to Build

### 1. New Types (`src/types/media.ts`)

Add `PersonItem` type:

```typescript
interface PersonItem {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string;
  known_for: Result[];
  media_type: "person";
  popularity: number;
  gender?: number;
}
```

### 2. New API Param Types (`src/types/api.ts`)

Add: `PopularParams`, `TopRatedParams`, `NowPlayingParams`, `AiringTodayParams`, `OnTheAirParams`, `TrendingPeopleParams`, `DiscoverByGenreParams`

### 3. New Endpoints (`src/services/endpoints.ts`)

Add 7 new endpoint constants: POPULAR, TOP_RATED, NOW_PLAYING, AIRING_TODAY, ON_THE_AIR, TRENDING_PEOPLE, DISCOVER_BY_GENRE

### 4. New API Client Methods (`src/services/apiClient.ts`)

Add 7 methods matching the new endpoints.

### 5. New Query Keys (`src/hooks/queries/queryKeys.ts`)

Add keys: `popular`, `topRated`, `nowPlaying`, `airingToday`, `onTheAir`, `trendingPeople`, `discoverByGenre`

### 6. New Query Hooks (`src/hooks/queries/`)

Create 7 hooks (NOT infinite queries — just `useQuery` for page 1):

- `usePopular(mediaType, page)`
- `useTopRated(mediaType, page)`
- `useNowPlaying(page)`
- `useAiringToday(page)`
- `useOnTheAir(page)`
- `useTrendingPeople(page)`
- `useDiscoverByGenre(genre, page, enabled)` — `enabled` flag for lazy loading

All with 5min staleTime. Export from barrel `index.ts`.

### 7. New Dashboard Components (`src/components/dashboard/`)

Create these components using NativeWind `className` prop for all styling:

#### a) HeroCarousel

- Full-width backdrop image carousel from trending data
- Auto-rotates every 6 seconds
- Shows: title, rating (★), year, media_type badge, 2-line overview
- "More Info" button navigates to Details screen
- Dot indicators at bottom (active dot = accent color, wider)
- Swipeable with FlatList horizontal + pagingEnabled (not ScrollView)
- Height: ~55% of screen height
- Gradient overlay from bottom (transparent → background color)

#### b) FilterBar

- Horizontal row of Pill components: All, Movies, TV Shows, People
- Plus a "Categories" pill with dropdown/bottom sheet for genre selection
- Active pill uses `themeColorCode` background
- Inactive: dark zinc background
- Use existing `Pill` component or create filter-specific pills

#### c) Top10Row

- "Top 10 Today" section title
- Horizontal FlatList
- Each item: large outlined rank number (1-10) on left + poster on right (overlapping with negative margin)
- Rank number: very large font, transparent fill, white stroke border
- Tapping navigates to Details

#### d) MediaRow

- Reusable horizontal scrollable row with section title
- Horizontal FlatList of `PosterCard` components
- Loading state: skeleton placeholders
- Hides if error or empty data

#### e) PeopleRow

- "Trending Stars" section title
- Horizontal FlatList of circular profile photos
- Each card: circular image (120px), name below, department, known-for titles
- Fallback for missing photo

#### f) PeopleCard

- Circular profile image with border
- Name (1 line, centered)
- Department label
- Known-for titles (1 line, max 2 items)

#### g) GenreRow

- Lazy-loaded row that only fetches data when scrolled into view
- Use `onViewableItemsChanged` on parent ScrollView or a visibility check
- Wraps MediaRow with `useDiscoverByGenre(genreId, 1, isVisible)`

#### h) DashboardSkeleton

- Full loading state: hero skeleton + filter pills skeleton + 4 row skeletons

### 8. Refactor DashboardScreen (`src/screens/dashboard/DashboardScreen.tsx`)

Replace the current infinite-scroll trending grid with:

```jsx
<ScrollView>
  <HeroCarousel items={trending.data?.results} isLoading={trending.isLoading} />
  <FilterBar active={filter} onChange={setFilter} selectedGenre={genre} onGenreChange={setGenre} />
  <Top10Row items={trending.data?.results} isLoading={trending.isLoading} />

  {/* Content rows — filtered by active tab */}
  <MediaRow title="Popular Movies" items={popularMovies} />       {/* if movies or all */}
  <MediaRow title="Popular TV Shows" items={popularTV} />          {/* if tv or all */}
  <MediaRow title="Now Playing" items={nowPlaying} />              {/* if movies or all */}
  <MediaRow title="Upcoming" items={upcoming} />                   {/* if movies or all */}
  <MediaRow title="Airing Today" items={airingToday} />            {/* if tv or all */}
  <MediaRow title="On The Air" items={onTheAir} />                 {/* if tv or all */}
  <MediaRow title="Top Rated Movies" items={topRatedMovies} />     {/* if movies or all */}
  <MediaRow title="Top Rated TV" items={topRatedTV} />             {/* if tv or all */}

  <PeopleRow items={trendingPeople} />                             {/* if people or all */}

  {/* Lazy genre rows — if all or movies, no genre filter */}
  <GenreRow genreId={28} genreName="Action" />
  <GenreRow genreId={35} genreName="Comedy" />
  <GenreRow genreId={27} genreName="Horror" />
  <GenreRow genreId={878} genreName="Sci-Fi" />
  <GenreRow genreId={10749} genreName="Romance" />
  <GenreRow genreId={99} genreName="Documentary" />

  <AdBanner />                                                     {/* keep existing ad banner */}
</ScrollView>
```

## Design Specifications

- **Theme-aware:** Use `useTheme()` for all dynamic colors
- **Accent color:** `themeColorCode` from useTheme (user-selectable: orange/blue/green/purple)
- **Dark mode background:** zinc-950/900 palette
- **Light mode:** white/zinc-100 palette
- **Text:** Use `ThemedText` component for all text
- **Spacing:** Use NativeWind gap/padding classes (gap-3, px-4, py-2, mb-6, etc.)
- **Cards in rows:** Should be tappable → navigate to Details via `navigation.navigate('Details', { id, mediaType })`
- **Hero carousel height:** Use `Dimensions.get('window').height * 0.55`
- **Poster sizes in rows:** width ~130-140px (responsive isn't needed, fixed is fine for mobile)
- **Genre dropdown:** Use `@gorhom/bottom-sheet` (already installed) instead of dropdown overlay

## Conventions to Follow

1. All styling via `className` prop (NativeWind), never inline `style` except for calculated dimensions
2. Icons from `lucide-react-native`, sized explicitly (20-24px typically)
3. Theme colors via `useTheme()` hook, not hardcoded
4. Existing `PosterCard` for media items in rows — it already handles navigation, liked badge, etc.
5. `ThemedText` for all text rendering
6. `useToastStore.getState().showToast()` for error feedback
7. Query hooks follow existing pattern in `src/hooks/queries/`
8. Barrel exports from `src/hooks/queries/index.ts` and new `src/components/dashboard/index.ts`
9. Font classes: `font-opensans-bold`, `font-opensans-semibold`, `font-opensans-medium`, `font-opensans-regular`
10. FlatList for horizontal lists (not ScrollView) for virtualization performance

## Files to Modify

- `src/types/media.ts` — add PersonItem
- `src/types/api.ts` — add param types
- `src/services/endpoints.ts` — add endpoint constants
- `src/services/apiClient.ts` — add api methods
- `src/hooks/queries/queryKeys.ts` — add query keys
- `src/hooks/queries/index.ts` — barrel exports
- `src/screens/dashboard/DashboardScreen.tsx` — replace with new dashboard

## Files to Create

- `src/hooks/queries/usePopular.ts`
- `src/hooks/queries/useTopRated.ts`
- `src/hooks/queries/useNowPlaying.ts`
- `src/hooks/queries/useAiringToday.ts`
- `src/hooks/queries/useOnTheAir.ts`
- `src/hooks/queries/useTrendingPeople.ts`
- `src/hooks/queries/useDiscoverByGenre.ts`
- `src/components/dashboard/HeroCarousel.tsx`
- `src/components/dashboard/FilterBar.tsx`
- `src/components/dashboard/Top10Row.tsx`
- `src/components/dashboard/MediaRow.tsx`
- `src/components/dashboard/PeopleRow.tsx`
- `src/components/dashboard/PeopleCard.tsx`
- `src/components/dashboard/GenreRow.tsx`
- `src/components/dashboard/DashboardSkeleton.tsx`
- `src/components/dashboard/index.ts`

## Important Notes

- Do NOT modify any backend code — all APIs are already deployed and working
- Do NOT change navigation structure — DashboardScreen stays as the Home tab root
- Keep the existing AdBanner integration on the dashboard
- The current `useTrending` hook already exists and works (it's an infinite query) — for the dashboard hero, just use page 1 data from it, or create a separate non-infinite `useTrendingPage` hook
- PosterCard already handles navigation to Details — just pass the item and it works
- Test on both dark and light themes
