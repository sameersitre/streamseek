const axios = require("axios")
const restructure = require("../helpers/jsonRestructure")
const apiURL = require("./apiURL")
const apiCall = require("./apiCall")

exports.trending = function (data) {
    try {
        return apiCall.axios(apiURL.trendingURL(data))
    } catch (error) {
        console.log(error)
    }
}

exports.search = async function (data) {
    try {
        return apiCall.axios(apiURL.searchURL(data))
    } catch (error) {
        console.log(error)
    }
}

exports.filter = async function (data) {
    try {
        return apiCall.axios(apiURL.filterURL(data))
    } catch (error) {
        console.log(error)
    }
}

exports.externalID = async function (data) {
    let result = null
    await axios
        .get(apiURL.externalIDURL(data))
        .then((res) => {
            result = res.data
        })
        .catch(function (error) {
            result = error
        })
    return result
}

exports.tmdbGetDetails = async function (data) {
    try {
        let params = data
        let details = null
        let videos = null
        let recommendations = null
        let combinedData = null

        // DETAILS
        await axios
            .get(apiURL.detailsURL(data))
            .then((res) => {
                // logger.info("tmdb details api called.")
                console.log("tmdb details api called.")

                let x = res.data

                x = { ...x, media_type: params.media_type }
                details = x
            })
            .catch(function (error) {
                details = error
            })

        // VIDEOS
        await axios
            .get(apiURL.videosURL(data))
            .then((res) => {
                console.log("tmdb videos api called.")
                videos = res.data.results
            })
            .catch(function (error) {
                videos = error
            })

        // RECOMMENDATIONS
        await axios
            .get(apiURL.recommendationsURL(data))
            .then((res) => {
                console.log("tmdb recommends api called.")
                recommendations = res.data.results
            })
            .catch(function (error) {
                recommendations = error
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
            .get(apiURL.ottStreamURL(params), {
                headers: {
                    "x-rapidapi-key": process.env.RAPIDAPI_UTELLY_API_KEY,
                },
            })
            .then((res) => {
                console.log("utelly api called.")
                streamAvailablity = res.data
            })
            .catch((error) => {
                streamAvailablity = error
            })
        return streamAvailablity.collection.locations
        // return restructure.restruct_ott(streamAvailablity.)
    } catch (error) {}
}

