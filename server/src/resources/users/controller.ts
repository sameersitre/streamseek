import { Request, Response } from 'express'
import { axiosFetch } from '../../apiExternal/apiCall'
import { fetchOTTPlatforms } from '../../apiExternal/apiExternal'
import {
  airingTodayURL,
  castDetailsURL,
  detailsURL,
  discoverByGenreURL,
  externalIDURL,
  filterURL,
  nowPlayingURL,
  onTheAirURL,
  popularURL,
  recommendationsURL,
  searchURL,
  seasonsURL,
  topRatedURL,
  trendingPeopleURL,
  trendingURL,
  upcomingURL,
  videosURL,
} from '../../apiExternal/apiURL'
import { cacheGet, cacheSet } from '../../services/cache'
import { connectMongo } from '../../services/mongo'
import logger from '../../common/logger'

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
      const platforms = await fetchOTTPlatforms(req.body.media_type, req.body.id)

      await db.collection('counters').updateOne({ counterName: 'watchmode' }, { $inc: { counts: 1 } }, { upsert: true })

      const newData = {
        id: req.body.id,
        media_type: req.body.media_type,
        platforms,
      }

      await db.collection('ott_streams').insertOne(newData)
      res.status(200).json({ result: 'Doc Creation Successful.', ...newData })
    } else {
      res.status(200).json({ result: 'Doc Selection Successful.', ...dataFromDB })
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    const axiosStatus = (error as any)?.response?.status
    const axiosData = (error as any)?.response?.data
    logger.error({ error: errMsg, status: axiosStatus, data: axiosData }, 'Error fetching or storing OTT streams data')
    res.status(axiosStatus || 500).json({
      message: 'Failed to fetch or store data',
      error: axiosData || errMsg,
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

/**
 * Factory for cached TMDB list endpoints. Handles cache lookup, TMDB fetch,
 * optional media_type injection (TMDB omits it on curated endpoints), and error response.
 */
function createCachedListHandler(config: {
  name: string
  urlBuilder: (body: any) => string
  cacheKeyBuilder: (body: any) => string
  injectMediaType?: string | ((body: any) => string)
}) {
  return async (req: Request, res: Response) => {
    const cacheKey = config.cacheKeyBuilder(req.body)
    const cached = cacheGet(cacheKey)
    if (cached) return res.status(200).json(cached)
    try {
      const data = await axiosFetch(config.urlBuilder(req.body))
      if (config.injectMediaType) {
        const mt = typeof config.injectMediaType === 'function'
          ? config.injectMediaType(req.body)
          : config.injectMediaType
        data.results = data.results.map((item: any) => ({ ...item, media_type: mt }))
      }
      cacheSet(cacheKey, data)
      res.status(200).json(data)
    } catch (error) {
      logger.error(`Error fetching ${config.name} data:`, error)
      res.status(error?.response?.status || 500).json({
        message: 'Failed to fetch from external API',
        error: error?.response?.data || error.message,
      })
    }
  }
}

// --- Dashboard cached list endpoints ---

export const popularList = createCachedListHandler({
  name: 'popular',
  urlBuilder: popularURL,
  cacheKeyBuilder: (b) => `popular:${b.media_type}:${b.page}`,
  injectMediaType: (b) => b.media_type,
})

export const topRatedList = createCachedListHandler({
  name: 'topRated',
  urlBuilder: topRatedURL,
  cacheKeyBuilder: (b) => `topRated:${b.media_type}:${b.page}`,
  injectMediaType: (b) => b.media_type,
})

export const nowPlayingList = createCachedListHandler({
  name: 'nowPlaying',
  urlBuilder: nowPlayingURL,
  cacheKeyBuilder: (b) => `nowPlaying:${b.page}`,
  injectMediaType: 'movie',
})

export const airingTodayList = createCachedListHandler({
  name: 'airingToday',
  urlBuilder: airingTodayURL,
  cacheKeyBuilder: (b) => `airingToday:${b.page}`,
  injectMediaType: 'tv',
})

export const onTheAirList = createCachedListHandler({
  name: 'onTheAir',
  urlBuilder: onTheAirURL,
  cacheKeyBuilder: (b) => `onTheAir:${b.page}`,
  injectMediaType: 'tv',
})

export const trendingPeopleList = createCachedListHandler({
  name: 'trendingPeople',
  urlBuilder: trendingPeopleURL,
  cacheKeyBuilder: (b) => `trendingPeople:${b.page}`,
})

export const discoverByGenreList = createCachedListHandler({
  name: 'discoverByGenre',
  urlBuilder: discoverByGenreURL,
  cacheKeyBuilder: (b) => `discoverByGenre:${b.genre}:${b.page}`,
  injectMediaType: 'movie',
})

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
