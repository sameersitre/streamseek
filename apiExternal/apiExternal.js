const axios = require("axios")
const restructure = require("../helpers/jsonRestructure")

exports.tmdbGetDetails = async function (data) {
    try {
        let params = data
        let details = null
        let videos = null
        let recommendations = null
        let combinedData = null

        let detailsAPI = `${process.env.TMDB_URL}/${params.media_type}/${params.id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`

        let videosAPI = `${process.env.TMDB_URL}/${params.media_type}/${params.id}/videos?api_key=${process.env.TMDB_API_KEY}&language=en-US`

        let recommendationsAPI = `${process.env.TMDB_URL}/${params.media_type}/${params.id}/recommendations?api_key=${process.env.TMDB_API_KEY}&language=en-US&page=1`

        // DETAILS
        await axios
            .get(detailsAPI)
            .then((res) => {
                // logger.info("tmdb details api called.")
                console.log("tmdb details api called.")

                let x = res.data

                x = { ...x, media_type: params.media_type }
                details = x
            })
            .catch(function (error) {
                console.log(error)
            })

        // VIDEOS
        await axios
            .get(videosAPI)
            .then((res) => {
                videos = res.data.results
            })
            .catch(function (error) {
                console.log(error)
            })

        // RECOMMENDATIONS
        await axios
            .get(recommendationsAPI)
            .then((res) => {
                recommendations = res.data.results
            })
            .catch(function (error) {
                console.log(error)
            })

        combinedData = {
            ...details,
            videos,
            recommendations,
        }
        return combinedData
    } catch (error) {}
}

exports.ottStreams = async function (params) {
    try {
        let streamAvailablity = null
        await axios
            .get(
                `${process.env.RAPIDAPI_UTELLY_URL}?source_id=${params.id}&source=tmdb`,
                {
                    headers: {
                        "x-rapidapi-key": process.env.RAPIDAPI_UTELLY_API_KEY,
                    },
                }
            )
            .then((res) => {
                streamAvailablity = res.data
            })
            .catch((error) => {
                console.log(error)
            })
        return streamAvailablity.collection.locations
        // return restructure.restruct_ott(streamAvailablity.)
    } catch (error) {}
}
