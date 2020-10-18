var API_URL = process.env.REACT_APP_API_URL

export const trendingURL = `${API_URL}/trending`
export const searchURL = `${API_URL}/search`
export const filterURL = `${API_URL}/filter`
export const upcomingURL = `${API_URL}/upcoming`
export const getDetailsURL = `${API_URL}/getDetails`
export const getVideosURL = `${API_URL}/getVideos`
export const getRecommendationsURL = `${API_URL}/getRecommendations`
export const getOTTPlatformsURL = `${API_URL}/getOTTPlatforms`
export const getCastDetailsURL = `${API_URL}/getCastDetails`


// exports.searchURL = (params) =>
//     `${process.env.TMDB_URL}/search/multi?api_key=${process.env.TMDB_API_KEY}&language=en-US&query=${params.searchText}&page=1&include_adult=false`

// exports.filterURL = (params) =>
//     `${process.env.TMDB_URL}/discover/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=${params.genres}`

// exports.detailsURL = (params) =>
//     `${process.env.TMDB_URL}/${params.media_type}/${params.id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`

// exports.ottStreamURL = (params) =>
//     `${process.env.RAPIDAPI_UTELLY_URL}?source_id=${params.id}&source=tmdb`

// exports.castDetailsURL = (params) =>
//     `https://imdb-internet-movie-database-unofficial.p.rapidapi.com/film/${params.imdb_id}`

// exports.actorDetailsURL = (params) =>
//     `${process.env.TMDB_URL}/find/${params.actor_id}?api_key=${process.env.TMDB_API_KEY}&language=en-US&external_source=imdb_id`

// exports.externalIDURL = (params) =>
//     `${process.env.TMDB_URL}/${params.media_type}/${params.id}/external_ids?api_key=${process.env.TMDB_API_KEY}`

// exports.videosURL = (params) =>
//     `${process.env.TMDB_URL}/${params.media_type}/${params.id}/videos?api_key=${process.env.TMDB_API_KEY}&language=en-US`

// exports.recommendationsURL = (params) =>
//     `${process.env.TMDB_URL}/${params.media_type}/${params.id}/recommendations?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`
