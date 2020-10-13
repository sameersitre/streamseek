const { MongoClient } = require("mongodb")
const apiResponse = require("../helpers/apiResponse")
const apiExternal = require("../apiExternal/apiExternal")
const restructure = require("../helpers/jsonRestructure")
const uri = `mongodb://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.CLUSTER_URL}/?authMechanism=${process.env.AUTH_MECHANISM}`
const client = new MongoClient(uri, {
    useUnifiedTopology: true,
    //   useNewUrlParser: true,
    //   useMongoClient: true
})

exports.trendingList = async function (req, res) {
    try {
        let trending = await apiExternal.trending(req.body)
        await apiResponse.successResponse(res, "Success.", trending)
    } catch (error) {
        await apiResponse.ErrorResponse(res, error)
    }
}

exports.searchList = async function (req, res) {
    try {
        await apiResponse.successResponse(
            res,
            "Success.",
            await apiExternal.search(req.body)
        )
    } catch (error) {
        await apiResponse.ErrorResponse(res, error)
    }
}

exports.filterList = async function (req, res) {
    try {
        await apiResponse.successResponse(
            res,
            "Success.",
            await apiExternal.filter(req.body)
        )
    } catch (error) {
        await apiResponse.ErrorResponse(res, error)
    }
}

exports.getDetails = async function (req, res) {
    console.log(req.body)
    try {
        await client.connect()
        let collectionSelect =
            req.body.media_type === "movie"
                ? "details_movie"
                : req.body.media_type === "tv"
                ? "details_tv"
                : null

        let dbSearch = await client
            .db("bingefeast")
            .collection(collectionSelect)
            .findOne(req.body)
        console.log(`checked ${JSON.stringify(req.body)} in collection`)

        if (dbSearch === null) {
            // get data from TMDB and utelly
            let tmdbResult = await apiExternal.tmdbGetDetails(req.body)
            let ottStreamsResult = await apiExternal.ottStreams(req.body)
            let externalID = await apiExternal.externalID(req.body)
            let combinedResult = {
                ...tmdbResult,
                imdb_id: externalID.imdb_id,
                ottStreams: [...ottStreamsResult],
            }

            if (tmdbResult.id) {
                let dbResDetail = await client
                    .db("bingefeast")
                    .collection(collectionSelect)
                    .insertOne(combinedResult)
                console.log(`Doc created id: ${dbResDetail.insertedId}`)

                let dbCount = await client
                    .db("bingefeast")
                    .collection("counters")
                    .updateOne(
                        {
                            counterName: "utelly",
                        },
                        { $inc: { counts: +1 } }
                    )
                console.log(`${dbCount.matchedCount} docs matched query`)
                console.log(`${dbCount.modifiedCount} docs updated.`)
            }

            await apiResponse.successResponse(
                res,
                "Success, data added to db",
                combinedResult
            )
        } else {
            await apiResponse.successResponse(res, "Success.", dbSearch)
        }
    } catch (error) {
        await apiResponse.ErrorResponse(res, error)
    }
}
