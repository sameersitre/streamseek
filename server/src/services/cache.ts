/** In-memory TTL cache for non-personalized TMDB list responses. Avoids redundant API calls across users. */

interface CacheEntry<T> {
  data: T
  expiry: number
}

const store = new Map<string, CacheEntry<unknown>>()

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiry) {
    store.delete(key)
    return null
  }
  return entry.data as T
}

export function cacheSet<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
  store.set(key, { data, expiry: Date.now() + ttl })
}
