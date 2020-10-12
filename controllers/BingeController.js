const { MongoClient } = require("mongodb")
const apiResponse = require("../helpers/apiResponse")
const apiExternal = require("../apiExternal/apiExternal")
const restructure = require("../helpers/jsonRestructure")
const uri = `mongodb://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.CLUSTER_URL}/?authMechanism=${process.env.AUTH_MECHANISM}`
const client = new MongoClient(uri, {
    //   useNewUrlParser: true,
    useUnifiedTopology: true,
    //   useMongoClient: true
})

exports.getDetails = async function (req, res) {
    console.log(req.body)
    // try {
    await client.connect()

    let result = await client
        .db("bingefeast")
        .collection(
            req.body.media_type === "movie" ? "details_movie" : "details_tv"
        )
        .findOne(req.body)

    if (result === null) {
        // get data from TMDB and utelly
        let tmdbResult = await apiExternal.tmdbGetDetails(req.body)
        let ottStreamsResult = await apiExternal.ottStreams(req.body)
        let combinedResult = {
            ...tmdbResult,
            ottStreams: [...ottStreamsResult],
        }

        if (tmdbResult.id) {
            await client
                .db("bingefeast")
                .collection(
                    req.body.media_type === "movie"
                        ? "details_movie"
                        : "details_tv"
                )
                .insertOne(combinedResult)
        }

        // let ottMongoCheck = await client
        //     .db("bingefeast")
        //     .collection("ott_streams")
        //     .findOne(req.body)

        // if (ottMongoCheck === null) {
        //     let ottStreamsResult = await apiExternal.ottStreams(req.body)
        //     if (ottStreamsResult) {
        //         await client
        //             .db("bingefeast")
        //             .collection("ott_streams")
        //             .insertOne(ottStreamsResult)
        //     }
        // }

        await apiResponse.successResponse(res, "Success", combinedResult)
    } else {
        await apiResponse.successResponse(res, "Success", result)
    }
    // } catch (error) {
    //     apiResponse.ErrorResponse(res, error)
    // }
}
