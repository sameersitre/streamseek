# PRD: Watchlist & Likes Feature

## 1. Overview

**Goal:** Allow authenticated users to like media and add them to a personal watchlist. Data persists in MongoDB and syncs across devices via the user's Auth.js session.

**User Stories:**
- As a signed-in user, I can click a heart icon to like/unlike a movie or TV show
- As a signed-in user, I can click a bookmark icon to add/remove media from my watchlist
- As a signed-in user, I can view my watchlist and liked items on a dedicated page
- As an unauthenticated user, clicking like/watchlist opens the sign-in dialog
- Like/watchlist toggles feel instant (optimistic UI) and rollback on failure

---

## 2. Architecture

### Auth Flow for Protected Endpoints

Auth.js v5 uses **encrypted JWTs (JWE)** — not standard JWTs. The token is stored in an HTTP-only cookie (`authjs.session-token` in dev, `__Secure-authjs.session-token` in prod).

**Token verification on Express:**

Since both services share `AUTH_SECRET` (via Docker Compose env), the Express server can decrypt the Auth.js JWE token directly using `@auth/core`'s `decode` function:

```
Browser (cookie) → Express middleware → decode(token, AUTH_SECRET) → req.userId
```

- Use `cookie-parser` to read the session cookie from the request
- Use `@auth/core/jwt` `decode()` to decrypt the JWE with the shared `AUTH_SECRET`
- Attach `userId` (from `token.uid` or `token.sub`) to `req` for downstream handlers
- The client `apiClient.ts` must send `credentials: "include"` on fetch calls
- Express CORS must be configured with `credentials: true` and explicit `origin`

**Why `@auth/core` over manual `jose`:**
- Auth.js owns the encryption format — using their own decoder guarantees compatibility
- If Auth.js changes algorithms in a future version, `@auth/core` tracks it automatically
- Lighter than installing all of `next-auth` on the server

### MongoDB Schema

**Collection: `user_interactions`** — one document per user-media pair

```javascript
{
  userId: String,        // Auth.js token.uid (provider account ID)
  mediaId: Number,       // TMDB ID
  mediaType: String,     // "movie" | "tv"
  liked: Boolean,        // default false
  watchlisted: Boolean,  // default false
  // Denormalized for rendering lists without extra API calls
  title: String,
  posterPath: String,
  voteAverage: Number,
  createdAt: Date,
  updatedAt: Date,
}
```

**Indexes:**
| Index | Purpose |
|-------|---------|
| `{ userId: 1, mediaId: 1, mediaType: 1 }` (unique) | Prevent duplicates, fast lookup for "is this liked?" |
| `{ userId: 1, watchlisted: 1, updatedAt: -1 }` | Render user's watchlist page sorted by recent |
| `{ userId: 1, liked: 1, updatedAt: -1 }` | Render user's likes page sorted by recent |
| `{ mediaId: 1, mediaType: 1, liked: 1 }` | Aggregate "X users liked this movie" |

**Why single collection (not separate `watchlist` + `likes`):**
- A user can like AND watchlist the same media — single doc handles both with boolean flags
- Avoids duplicate denormalized media info across two collections
- Simpler queries: one read to check both states for a given media

**Why denormalize title/posterPath:**
- Rendering the watchlist page needs poster + title — without denormalization, each item would require a TMDB API call
- Movie titles and posters rarely change, so stale data risk is minimal

---

## 3. API Design

### New Endpoints (mounted at `/api/v2/`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/interactions/status` | Required | Get like/watchlist status for a media item |
| POST | `/interactions/toggle-like` | Required | Toggle like on/off |
| POST | `/interactions/toggle-watchlist` | Required | Toggle watchlist on/off |
| POST | `/interactions/watchlist` | Required | Get user's full watchlist (paginated) |
| POST | `/interactions/likes` | Required | Get user's full likes (paginated) |
| POST | `/interactions/batch-status` | Required | Get like/watchlist status for multiple media IDs (for listing pages) |

### Request/Response Shapes

**POST `/interactions/status`**
```json
// Request
{ "mediaId": 550, "mediaType": "movie" }
// Response
{ "liked": true, "watchlisted": false }
```

**POST `/interactions/toggle-like`**
```json
// Request
{ "mediaId": 550, "mediaType": "movie", "title": "Fight Club", "posterPath": "/abc.jpg", "voteAverage": 8.4 }
// Response
{ "liked": true, "watchlisted": false }
```

**POST `/interactions/toggle-watchlist`**
```json
// Request
{ "mediaId": 550, "mediaType": "movie", "title": "Fight Club", "posterPath": "/abc.jpg", "voteAverage": 8.4 }
// Response
{ "liked": false, "watchlisted": true }
```

**POST `/interactions/watchlist`**
```json
// Request
{ "page": 1 }
// Response
{ "results": [{ "mediaId": 550, "mediaType": "movie", "title": "Fight Club", "posterPath": "/abc.jpg", "voteAverage": 8.4, "updatedAt": "..." }], "total": 12, "page": 1, "totalPages": 1 }
```

**POST `/interactions/batch-status`**
```json
// Request
{ "items": [{ "mediaId": 550, "mediaType": "movie" }, { "mediaId": 1396, "mediaType": "tv" }] }
// Response
{ "statuses": { "movie-550": { "liked": true, "watchlisted": false }, "tv-1396": { "liked": false, "watchlisted": true } } }
```

### Why POST (not GET/PUT/DELETE)?

The existing codebase uses POST for all endpoints. Keeping this consistent avoids mixed patterns. The `userId` comes from the decoded JWT cookie, not the request body.

---

## 4. Server Implementation Roadmap

### Phase 1: Auth Middleware

**New files:**
- `server/src/middlewares/authMiddleware.ts`

**New dependencies:**
- `@auth/core` — decode Auth.js JWE tokens
- `cookie-parser` — parse cookies from requests (re-add, was removed in cleanup)
- `express-rate-limit` — rate limiting for interaction endpoints

**Changes to existing files:**
- `server/src/app.ts` — add `cookieParser()` middleware, update CORS config with `credentials: true` and explicit `origin`

**Auth middleware logic:**
1. Read cookie `authjs.session-token` (dev) or `__Secure-authjs.session-token` (prod)
2. Call `decode({ token, secret: AUTH_SECRET, salt: cookieName })`
3. Extract `token.uid` or `token.sub` as `userId`
4. Attach to `req.userId`
5. Return 401 if no valid token

### Phase 2: Interaction Endpoints

**New files:**
- `server/src/resources/interactions/controller.ts` — CRUD handlers
- `server/src/resources/interactions/routes.ts` — route definitions

**Changes to existing files:**
- `server/src/common/routes.ts` — mount interaction routes: `router.use('/v2/interactions', interactionRouter)`
- `server/.env.example` — add `AUTH_SECRET` env var for token decryption

**Controller functions:**
| Function | Description |
|----------|-------------|
| `getStatus` | Find doc by `{ userId, mediaId, mediaType }`, return `{ liked, watchlisted }` |
| `toggleLike` | Upsert doc, flip `liked` boolean, set `updatedAt` |
| `toggleWatchlist` | Upsert doc, flip `watchlisted` boolean, set `updatedAt` |
| `getWatchlist` | Find all docs where `{ userId, watchlisted: true }`, sorted by `updatedAt desc`, paginated |
| `getLikes` | Find all docs where `{ userId, liked: true }`, sorted by `updatedAt desc`, paginated |
| `getBatchStatus` | Find all docs matching `{ userId, $or: [...items] }`, return map |

**Rate limiting:**
- 30 requests/minute per user for toggle endpoints
- No rate limiting for status/list endpoints (read-only)

### Phase 3: MongoDB Index Setup

Create indexes on first deploy (in `connectMongo` or migration script):
```javascript
db.collection('user_interactions').createIndex(
  { userId: 1, mediaId: 1, mediaType: 1 },
  { unique: true }
);
db.collection('user_interactions').createIndex(
  { userId: 1, watchlisted: 1, updatedAt: -1 }
);
db.collection('user_interactions').createIndex(
  { userId: 1, liked: 1, updatedAt: -1 }
);
```

---

## 5. Client Implementation Roadmap

### Phase 4: API Client & Types

**Changes to existing files:**
- `client/app/services/endpoints.ts` — add interaction endpoints
- `client/app/services/apiClient.ts` — add interaction methods + `credentials: "include"` on all fetch calls
- `client/app/types/api.ts` — add interaction param/response types
- `client/app/types/index.ts` — re-export new types
- `client/app/hooks/queries/queryKeys.ts` — add `userKeys` for interaction queries

**New types:**
```typescript
interface InteractionStatus {
  liked: boolean;
  watchlisted: boolean;
}

interface ToggleParams {
  mediaId: number;
  mediaType: string;
  title: string;
  posterPath: string | null;
  voteAverage: number;
}

interface WatchlistItem {
  mediaId: number;
  mediaType: string;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  updatedAt: string;
}
```

### Phase 5: TanStack Query Hooks

**New files:**
- `client/app/hooks/queries/useInteractionStatus.ts` — query hook for single media status
- `client/app/hooks/queries/useToggleLike.ts` — mutation with optimistic update
- `client/app/hooks/queries/useToggleWatchlist.ts` — mutation with optimistic update
- `client/app/hooks/queries/useUserWatchlist.ts` — query for watchlist page
- `client/app/hooks/queries/useUserLikes.ts` — query for likes page
- `client/app/hooks/queries/useBatchInteractionStatus.ts` — batch status for listing pages

**Optimistic update pattern (for toggle mutations):**
1. `onMutate`: Cancel outgoing queries, snapshot previous state, optimistically flip the boolean in cache
2. `onError`: Rollback to snapshot
3. `onSettled`: Invalidate query to sync with server truth
4. Use `cancelQueries` to prevent rapid toggle bouncing

### Phase 6: UI Components

**New files:**
- `client/app/components/details/DetailActions.tsx` — like + watchlist buttons for details page
- `client/app/watchlist/page.tsx` — watchlist page
- `client/app/watchlist/layout.tsx` — watchlist page metadata
- `client/app/likes/page.tsx` — likes page
- `client/app/likes/layout.tsx` — likes page metadata

**Changes to existing files:**
- `client/app/components/details/DetailHeader.tsx` — add `<DetailActions>` below genre badges
- `client/app/components/media/MediaCard.tsx` — add like button in hover overlay (top-right)
- `client/app/components/appbar/DesktopNav.tsx` — add "Watchlist" nav link (authenticated only)
- `client/app/components/appbar/MobileDrawer.tsx` — add "Watchlist" nav link (authenticated only)

**UI behavior:**
| State | Like Button | Watchlist Button |
|-------|-------------|------------------|
| Not signed in | Opens AuthDialog | Opens AuthDialog |
| Signed in, not liked/watchlisted | Outline heart | Outline bookmark |
| Signed in, liked/watchlisted | Filled heart (accent color) | Filled bookmark (accent color) |
| Mutation pending | Optimistically toggled + subtle pulse animation | Same |
| Error rollback | Reverts to previous state | Same |

**Detail Actions layout:**
```
[Heart Icon] Like  ·  [Bookmark Icon] Watchlist
```
Positioned below genre badges in `DetailHeader.tsx`.

**MediaCard hover overlay:**
Small heart icon (top-right corner of card), toggles on click without navigating to details page (use `e.preventDefault()` + `e.stopPropagation()`).

### Phase 7: Watchlist Page

- Route: `/watchlist`
- Shows grid of watchlisted media using the same `MediaCard` component
- Sorted by most recently added
- Pagination support
- Empty state: "Your watchlist is empty. Browse movies and TV shows to add some!"
- Protected: redirect to home or show sign-in prompt if not authenticated

---

## 6. Environment Variables

### New variables needed

| Variable | Service | Purpose |
|----------|---------|---------|
| `AUTH_SECRET` | server | Decrypt Auth.js JWE tokens (same value as client's `AUTH_SECRET`) |

Add to:
- `server/.env.example`
- `docker-compose.yml` (pass from root `.env`)

---

## 7. File Summary

### New Files (16)

| File | Purpose |
|------|---------|
| `server/src/middlewares/authMiddleware.ts` | Decode Auth.js JWE, attach userId to req |
| `server/src/middlewares/rateLimiter.ts` | Rate limiting config |
| `server/src/resources/interactions/controller.ts` | Interaction CRUD handlers |
| `server/src/resources/interactions/routes.ts` | Route definitions |
| `client/app/types/interaction.ts` | Interaction types |
| `client/app/hooks/queries/useInteractionStatus.ts` | Single media status query |
| `client/app/hooks/queries/useBatchInteractionStatus.ts` | Batch status for listings |
| `client/app/hooks/queries/useToggleLike.ts` | Like mutation + optimistic update |
| `client/app/hooks/queries/useToggleWatchlist.ts` | Watchlist mutation + optimistic update |
| `client/app/hooks/queries/useUserWatchlist.ts` | Full watchlist query |
| `client/app/hooks/queries/useUserLikes.ts` | Full likes query |
| `client/app/components/details/DetailActions.tsx` | Like + watchlist buttons |
| `client/app/watchlist/page.tsx` | Watchlist page |
| `client/app/watchlist/layout.tsx` | Watchlist metadata |
| `client/app/likes/page.tsx` | Likes page |
| `client/app/likes/layout.tsx` | Likes metadata |

### Modified Files (11)

| File | Change |
|------|--------|
| `server/src/app.ts` | Add cookie-parser, update CORS config |
| `server/src/common/routes.ts` | Mount interaction routes |
| `server/package.json` | Add @auth/core, cookie-parser, express-rate-limit |
| `server/.env.example` | Add AUTH_SECRET |
| `client/app/services/endpoints.ts` | Add interaction endpoints |
| `client/app/services/apiClient.ts` | Add interaction methods, credentials: "include" |
| `client/app/types/index.ts` | Re-export interaction types |
| `client/app/hooks/queries/queryKeys.ts` | Add userKeys |
| `client/app/components/details/DetailHeader.tsx` | Add DetailActions component |
| `client/app/components/media/MediaCard.tsx` | Add like button in hover overlay |
| `client/app/components/appbar/DesktopNav.tsx` | Add Watchlist nav link |

### New Dependencies

| Package | Where | Purpose |
|---------|-------|---------|
| `@auth/core` | server | Decode Auth.js JWE tokens |
| `cookie-parser` | server | Parse cookies from requests |
| `express-rate-limit` | server | Rate limiting |

---

## 8. Implementation Order

| Phase | Scope | Description |
|-------|-------|-------------|
| **1** | Server | Auth middleware (cookie-parser + @auth/core decode) |
| **2** | Server | Interaction routes + controller + MongoDB indexes |
| **3** | Server | Rate limiting on toggle endpoints |
| **4** | Client | Types, endpoints, apiClient methods (credentials: "include") |
| **5** | Client | TanStack Query hooks (status, toggle mutations, list queries) |
| **6** | Client | DetailActions component + integrate in DetailHeader |
| **7** | Client | MediaCard like button in hover overlay |
| **8** | Client | Watchlist page + Likes page + nav links |
| **9** | Both  | Docker Compose: pass AUTH_SECRET to server container |
| **10** | Both | Test end-to-end: sign in → like → watchlist → verify persistence |

---

## 9. Testing Checklist

- [ ] Unauthenticated user clicks like → AuthDialog opens
- [ ] Sign in with Google → session established
- [ ] Click like on a movie → heart fills instantly (optimistic), persists on refresh
- [ ] Click like again → heart unfills (toggle off)
- [ ] Click watchlist bookmark → fills, shows in /watchlist page
- [ ] Navigate to different movie → like/watchlist state is independent
- [ ] Sign out → like/watchlist buttons show unauthenticated state
- [ ] Sign in with different provider → separate user, empty state
- [ ] Rapid toggle clicking → no UI bouncing (optimistic + cancelQueries)
- [ ] Network error during toggle → UI rolls back gracefully
- [ ] Listing pages (trending, search) → MediaCard shows like state via batch API
- [ ] Watchlist page → shows all watchlisted items with poster/title, paginated
