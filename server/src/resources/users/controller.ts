import { Request, Response } from 'express'
import { axiosFetch } from '../../apiExternal/apiCall'
import { ottStreams, watchModeFetch } from '../../apiExternal/apiExternal'
import {
  castDetailsURL,
  detailsURL,
  externalIDURL,
  filterURL,
  recommendationsURL,
  searchURL,
  seasonsURL,
  testURL,
  trendingURL,
  upcomingURL,
  videosURL,
} from '../../apiExternal/apiURL'
import { connectMongo } from '../../services/mongo'
import { restruct_watchmode_ott_streams } from '../../utils/utils'
import logger from '../../common/logger'

export const getAll = async (req: Request, res: Response) => {
  try {
    const users = ['John Doe', 'Jane Doe', 'John Smith', 'Jane Smith']
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message })
  }
}

export const getTest = async (req: Request, res: Response) => {
  try {
    const data = await axiosFetch(testURL())
    res.status(200).json(data)
  } catch (error) {
    logger.error('Error fetching test data:', error)
    // If the error has a response, use its status and data, otherwise default to 500
    res.status(error?.response?.status || 500).json({
      message: 'Failed to fetch from external API',
      error: error?.response?.data || error.message,
    })
  }
}

export const trendingList = async (req: Request, res: Response) => {
  try {
    const data = await axiosFetch(trendingURL(req.body))
    res.status(200).json(data)
  } catch (error) {
    logger.error('Error fetching trending data:', error)
    res.status(error?.response?.status || 500).json({
      message: 'Failed to fetch from external API',
      error: error?.response?.data || error.message,
    })
  }
}

export const getVideosExt = async (req: Request, res: Response) => {
  try {
    const data = await axiosFetch(videosURL(req.body))
    res.status(200).json(data)
  } catch (error) {
    logger.error('Error fetching videos data:', error)
    res.status(error?.response?.status || 500).json({
      message: 'Failed to fetch from external API',
      error: error?.response?.data || error.message,
    })
  }
}

export const searchList = async (req: Request, res: Response) => {
  try {
    const data = await axiosFetch(searchURL(req.body))
    res.status(200).json(data)
  } catch (error) {
    logger.error('Error fetching search data:', error)
    res.status(error?.response?.status || 500).json({
      message: 'Failed to fetch from external API',
      error: error?.response?.data || error.message,
    })
  }
}

export const filterList = async (req: Request, res: Response) => {
  try {
    const data = await axiosFetch(filterURL(req.body))
    res.status(200).json(data)
  } catch (error) {
    logger.error('Error fetching filter data:', error)
    res.status(error?.response?.status || 500).json({
      message: 'Failed to fetch from external API',
      error: error?.response?.data || error.message,
    })
  }
}

export const upcomingList = async (req: Request, res: Response) => {
  try {
    const data = await axiosFetch(upcomingURL(req.body))
    res.status(200).json(data)
  } catch (error) {
    logger.error('Error fetching upcoming data:', error)
    res.status(error?.response?.status || 500).json({
      message: 'Failed to fetch from external API',
      error: error?.response?.data || error.message,
    })
  }
}

export const getRecommends = async (req: Request, res: Response) => {
  try {
    const data = await axiosFetch(recommendationsURL(req.body))
    res.status(200).json(data)
  } catch (error) {
    logger.error('Error fetching recommendations data:', error)
    res.status(error?.response?.status || 500).json({
      message: 'Failed to fetch from external API',
      error: error?.response?.data || error.message,
    })
  }
}

export const getSeasons = async (req: Request, res: Response) => {
  try {
    const data = await axiosFetch(seasonsURL(req.body))
    res.status(200).json(data)
  } catch (error) {
    logger.error('Error fetching seasons data:', error)
    res.status(error?.response?.status || 500).json({
      message: 'Failed to fetch from external API',
      error: error?.response?.data || error.message,
    })
  }
}

export const getVideos = async (req: Request, res: Response) => {
  try {
    const db = await connectMongo()
    const media = await db.collection('media').findOne({ id: req.body.id })

    if (!media) {
      const externalData = await axiosFetch(videosURL(req.body))
      const newMedia = { ...req.body, ...externalData }
      await db.collection('media').insertOne(newMedia)
      res.status(200).json({ result: 'Doc Creation Successful.', ...newMedia })
    } else {
      res.status(200).json({ result: 'Doc Selection Successful.', ...media })
    }
  } catch (error) {
    logger.error('Error fetching or storing videos data:', error)
    res.status(error?.response?.status || 500).json({
      message: 'Failed to fetch or store data',
      error: error?.response?.data || error.message,
    })
  }
}

export const getOTTStreams = async (req: Request, res: Response) => {
  try {
    const db = await connectMongo()
    const dataFromDB = await db.collection('ott_streams').findOne({ id: req.body.id })
    if (!dataFromDB) {
      const utellyResponse = await ottStreams(req.body)
      const watchmodResponse = await watchModeFetch(req.body)
      const refactoredData = restruct_watchmode_ott_streams(watchmodResponse)

      await db.collection('counters').updateOne({ counterName: 'utelly' }, { $inc: { counts: 1 } })
      await db.collection('counters').updateOne({ counterName: 'watchmode' }, { $inc: { counts: 1 } })

      const newData = {
        id: req.body.id,
        media_type: req.body.media_type,
        platforms: [...utellyResponse, ...refactoredData],
      }

      await db.collection('ott_streams').insertOne(newData)
      res.status(200).json({ result: 'Doc Creation Successful.', ...newData })
    } else {
      res.status(200).json({ result: 'Doc Selection Successful.', ...dataFromDB })
    }
  } catch (error) {
  logger.error('Error fetching or storing OTT streams data:', error)
    res.status(error?.response?.status || 500).json({
      message: 'Failed to fetch or store data',
      error: error?.response?.data || error.message,
    })
  }
}

export const getCastDetails = async (req: Request, res: Response) => {
  try {
    const db = await connectMongo()
    const dataFromDB = await db.collection('details_cast').findOne({ id: req.body.id })
    if (!dataFromDB) {
      const externalIDs = await axiosFetch(externalIDURL(req.body))
      const castDetails = await axiosFetch(castDetailsURL(req.body))
      const newData = { ...req.body, imdb_id: externalIDs.imdb_id, ...castDetails }

      await db.collection('details_cast').insertOne(newData)
      res.status(200).json({ result: 'Doc Creation Successful.', ...newData })
    } else {
      res.status(200).json({ result: 'Doc Selection Successful.', ...dataFromDB })
    }
  } catch (error) {
  logger.error('Error fetching or storing cast details data:', error)
    res.status(error?.response?.status || 500).json({
      message: 'Failed to fetch or store data',
      error: error?.response?.data || error.message,
    })
  }
}

export const getDetails = async (req: Request, res: Response) => {
  try {
    const db = await connectMongo()

    const collectionSelect =
      req.body.media_type === 'movie' ? 'details_movie' : req.body.media_type === 'tv' ? 'details_tv' : null

    const dbSearch = await db.collection(collectionSelect).findOne({ id: req.body.id })
    if (!dbSearch) {
      const details = await axiosFetch(detailsURL(req.body))
      const externalID = await axiosFetch(externalIDURL(req.body))

      const responseData = {
        id: req.body.id,
        media_type: req.body.media_type,
        ...details,
        ...externalID,
      }

      await db.collection(collectionSelect).insertOne(responseData)
      res.status(200).json({ result: 'Doc Creation Successful.', ...responseData })
    } else {
      res.status(200).json({ result: 'Doc Selection Successful.', ...dbSearch })
    }
  } catch (error) {
  logger.error('Error fetching or storing details data:', error)
    res.status(error?.response?.status || 500).json({
      message: 'Failed to fetch or store data',
      error: error?.response?.data || error.message,
    })
  }
}

export const getFeedback = async (req: Request, res: Response) => {
  try {
    const db = await connectMongo()
    await db.collection('feedbacks').insertOne(req.body)
    res.status(200).json(req.body)
  } catch (error) {
  logger.error('Error storing feedback:', error)
    res.status(500).json({
      message: 'Failed to store feedback',
      error: error?.response?.data || error.message,
    })
  }
}
