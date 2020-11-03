// var API_URL = process.env.NODE_ENV === "development" ?
//     process.env.REACT_APP_API_URL_DEV :
//     process.env.REACT_APP_API_URL_PROD

var API_URL = process.env.REACT_APP_API_URL_PROD

export const testURL = `${API_URL}/test`

export const trendingURL = `${API_URL}/trending`
export const searchURL = `${API_URL}/search`
export const filterURL = `${API_URL}/filter`
export const upcomingURL = `${API_URL}/upcoming`
export const getDetailsURL = `${API_URL}/getDetails`
export const getVideosURL = `${API_URL}/getVideos`
export const getRecommendationsURL = `${API_URL}/getRecommendations`
export const getOTTPlatformsURL = `${API_URL}/getOTTPlatforms`
export const getCastDetailsURL = `${API_URL}/getCastDetails`
export const getInfo = `${API_URL}/info`
export const getFeedback = `${API_URL}/feedback`

