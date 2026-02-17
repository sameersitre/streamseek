const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://bingee-server.herokuapp.com/api";

export const ENDPOINTS = {
  TEST: `${API_BASE}/test`,
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
  INFO: `${API_BASE}/info`,
  FEEDBACK: `${API_BASE}/feedback`,
} as const;
