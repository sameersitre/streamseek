const { MongoClient } = require("mongodb")
const apiResponse = require("../helpers/apiResponse")
const apiExternal = require("../apiExternal/apiExternal")
const apiURL = require("../apiExternal/apiURL")
const apiCall = require("../apiExternal/apiCall")
const uri = `mongodb://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.CLUSTER_URL}/?authMechanism=${process.env.AUTH_MECHANISM}`
const client = new MongoClient(uri, {
    useUnifiedTopology: true,
    //   useNewUrlParser: true,
    //   useMongoClient: true
})
var available_tmdbid_in_db = [];

var list_movieID = [539885, 299534, 99861, 497582, 27205]
var list_tvID = [];

//add ids from movie & tv db
// (async () => {
//     await client.connect()
//     let db = client.db("bingefeast")
//     if (list_movieID.length === 0 || list_tvID.length === 0) {
//         let movieList = await db
//             .collection("details_movie")
//             .find(undefined, { projection: { id: 1 } })
//             .toArray()

//         let tvList = await db
//             .collection("details_tv")
//             .find(undefined, { projection: { id: 1 } })
//             .toArray()

//         available_tmdbid_in_db = [
//             ...available_tmdbid_in_db,
//             ...movieList.map((data) => data.id),
//             ...tvList.map((data) => data.id),
//         ]

//         list_movieID = [...movieList.map((data) => data.id)]
//         list_tvID = [...tvList.map((data) => data.id)]

//         console.log("movie ids", list_movieID)
//         console.log("tv ids", list_tvID)
//         console.log(available_tmdbid_in_db)
//     }
// })()

// let check_ID_from_db = function (ID, mediaType) {
//     let checkID = false

//     for (let i = 0; i < available_tmdbid_in_db.length; i++) {
//         if (req.body.id === available_tmdbid_in_db[i]) {
//             checkID = true
//         }
//     }
// }

exports.test = async function (req, res) {
    apiResponse.testSuccessResponse(res, "Success.", await apiExternal.castDetails(req.body))
}

exports.trendingList = async function (req, res) {
    try {
        apiResponse.successResponse(
            res,
            "Success.",
            await apiCall.axios(apiURL.trendingURL(req.body))
        )
    } catch (error) {
        apiResponse.ErrorResponse(res, error)
    }
}

exports.searchList = async function (req, res) {
    try {
        apiResponse.successResponse(
            res,
            "Success.",
            await apiCall.axios(apiURL.searchURL(req.body))
        )
    } catch (error) {
        apiResponse.ErrorResponse(res, error)
    }
}

exports.filterList = async function (req, res) {
    try {
        apiResponse.successResponse(
            res,
            "Success.",
            await apiCall.axios(apiURL.filterURL(req.body))
        )
    } catch (error) {
        apiResponse.ErrorResponse(res, error)
    }
}

exports.getVideos = async function (req, res) {
    // try {
    await client.connect()
    let db = client.db("bingefeast")

    let mediaAvailable = await db.collection("media").findOne({ id: req.body.id })

    if (mediaAvailable === null) {
        let newMedia = { ...req.body, ...await apiCall.axios(apiURL.videosURL(req.body)) }
        let db_videos = await db.collection("media").insertOne(newMedia)
        console.log(`Doc created in details_movie/tv id: ${db_videos.insertedId}`)
        await apiResponse.successResponse(res, "Doc Creation Successful.", newMedia)
    } else {
        await apiResponse.successResponse(res, "Doc Selection Successful.", mediaAvailable)
    }

    // } catch (error) {
    //     apiResponse.ErrorResponse(res, error)
    // }
}

exports.getRecommends = async function (req, res) {
    // try {
    await client.connect()
    let db = client.db("bingefeast")

    let recommendsAvailable = await db.collection("recommendations").findOne({ id: req.body.id })

    if (recommendsAvailable === null) {
        let newData = { ...req.body, ...await apiCall.axios(apiURL.recommendationsURL(req.body)) }
        let db_videos = await db.collection("recommendations").insertOne(newData)
        console.log(`Doc created in recommendations, id: ${db_videos.insertedId}`)
        await apiResponse.successResponse(res, "Doc Creation Successful.", newData)
    } else {
        await apiResponse.successResponse(res, "Doc Selection Successful.", recommendsAvailable)
    }

    // } catch (error) {
    //     apiResponse.ErrorResponse(res, error)
    // }
}

exports.getOTTStreams = async function (req, res) {
    // try {
    await client.connect()
    let db = client.db("bingefeast")

    let dataFromDB = await db.collection("ott_streams").findOne({ id: req.body.id })

    if (dataFromDB === null) {
        let platforms = await apiExternal.ottStreams(req.body)
        let dbCount = await db.collection("counters")
            .updateOne({ counterName: "utelly" }, { $inc: { counts: +1 } })
        console.log(`docs matched QRY:${dbCount.matchedCount}, doc updated:${dbCount.modifiedCount}`)

        let newData = { ...req.body, platforms }
        let db_videos = await db.collection("ott_streams").insertOne(newData)
        console.log(`Doc created in ott_streams, id: ${db_videos.insertedId}`)

        await apiResponse.successResponse(res, "Doc Creation Successful.", newData)
    } else {
        await apiResponse.successResponse(res, "Doc Selection Successful.", dataFromDB)
    }

    // } catch (error) {
    //     apiResponse.ErrorResponse(res, error)
    // }
}

exports.getCastDetails = async function (req, res) {
    // try {
    await client.connect()
    let db = client.db("bingefeast")

    let dataFromDB = await db.collection("details_cast").findOne({ id: req.body.id })

    if (dataFromDB === null) {
        let externalIDs = await apiCall.axios(apiURL.externalIDURL(req.body))
        let z = { ...req.body, imdb_id: externalIDs.imdb_id }
        let newData = { ...req.body, ...await apiExternal.castDetails(z) }
        let db_cast = await db.collection("details_cast").insertOne(newData)
        console.log(`Doc created in details_cast, id: ${db_cast.insertedId}`)
        await apiResponse.successResponse(res, "Doc Creation Successful.", newData)
    } else {
        await apiResponse.successResponse(res, "Doc Selection Successful.", dataFromDB)
    }

    // } catch (error) {
    //     apiResponse.ErrorResponse(res, error)
    // }
}

exports.getDetails = async function (req, res) {
    console.log("getDetails Params:", req.body)

    await client.connect()
    let db = client.db("bingefeast")

    let collectionSelect =
        req.body.media_type === "movie"
            ? "details_movie"
            : req.body.media_type === "tv"
                ? "details_tv"
                : null
    // try {

    let dbSearch = await db.collection(collectionSelect).findOne({ id: req.body.id })

    if (dbSearch === null) {
        let combinedResult = null
        let details = await apiCall.axios(apiURL.detailsURL(req.body))
        let externalID = await apiCall.axios(apiURL.externalIDURL(req.body))
        combinedResult = {
            media_type: req.body.media_type,
            ...details, ...externalID
        }
        let dbResDetail = await db.collection(collectionSelect).insertOne(combinedResult)
        console.log(`Doc created in details_movie/tv id: ${dbResDetail.insertedId}`)

        await apiResponse.successResponse(res, "Doc Creation Successful.", combinedResult)
    } else {
        await apiResponse.successResponse(res, "Doc Selection Successful.", dbSearch)
    }
    // } catch (error) {
    //     await apiResponse.ErrorResponse(res, error)
    // }
}
