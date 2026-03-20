const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://bingee-server.herokuapp.com/api";

export const ENDPOINTS = {
  TRENDING: `${API_BASE}/trending`,
  SEARCH: `${API_BASE}/search`,
  FILTER: `${API_BASE}/filter`,
  UPCOMING: `${API_BASE}/upcoming`,
  DETAILS: `${API_BASE}/getDetails`,
  VIDEOS: `${API_BASE}/getVideos`,
  CAST: `${API_BASE}/getCastDetails`,
  OTT_PLATFORMS: `${API_BASE}/getOTTPlatforms`,
  RECOMMENDATIONS: `${API_BASE}/getRecommendations`,
  SEASONS: `${API_BASE}/getSeasons`,
  FEEDBACK: `${API_BASE}/feedback`,
  POPULAR: `${API_BASE}/popular`,
  TOP_RATED: `${API_BASE}/topRated`,
  NOW_PLAYING: `${API_BASE}/nowPlaying`,
  AIRING_TODAY: `${API_BASE}/airingToday`,
  ON_THE_AIR: `${API_BASE}/onTheAir`,
  TRENDING_PEOPLE: `${API_BASE}/trendingPeople`,
  DISCOVER_BY_GENRE: `${API_BASE}/discoverByGenre`,
  // Interaction endpoints — routed through Next.js API proxy (same-origin for cookies)
  ALL_INTERACTIONS: "/api/interactions/all",
  TOGGLE_LIKE: "/api/interactions/toggle-like",
  TOGGLE_WATCHLIST: "/api/interactions/toggle-watchlist",
  WATCHLIST: "/api/interactions/watchlist",
  LIKES: "/api/interactions/likes",
} as const;
