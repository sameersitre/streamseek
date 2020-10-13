exports.trendingURL = (params) => {
    return `${process.env.TMDB_URL}/trending/${params.type}/day?api_key=${process.env.TMDB_API_KEY}&page=${params.page}`
}

exports.searchURL = (params) => {
    return `${process.env.TMDB_URL}/search/multi?api_key=${process.env.TMDB_API_KEY}&language=en-US&query=${params.searchText}&page=1&include_adult=false`
}

exports.filterURL = (params) => {
    return `${process.env.TMDB_URL}/discover/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=${params.genres}`
}

exports.detailsURL = (params) => {
    return `${process.env.TMDB_URL}/${params.media_type}/${params.id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`
}

exports.ottStreamURL = (params) => {
    return `${process.env.RAPIDAPI_UTELLY_URL}?source_id=${params.id}&source=tmdb`
}

exports.externalIDURL = (params) => {
    return `${process.env.TMDB_URL}/${params.media_type}/${params.id}/external_ids?api_key=${process.env.TMDB_API_KEY}`
}

exports.videosURL = (params) => {
    return `${process.env.TMDB_URL}/${params.media_type}/${params.id}/videos?api_key=${process.env.TMDB_API_KEY}&language=en-US`
}

exports.recommendationsURL = (params) => {
    return `${process.env.TMDB_URL}/${params.media_type}/${params.id}/recommendations?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`
}
