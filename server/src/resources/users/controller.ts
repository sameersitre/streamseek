import { Request, Response } from 'express'
import { axiosFetch } from '../../apiExternal/apiCall'
import { getSourceLogos } from '../../apiExternal/apiExternal'
import { attachSourceIds, resolveTitleSources } from '../../apiExternal/titleSources'
import type { Result } from '../../types'
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
import { CAST_SOURCE_AGGREGATE, normalizeCredits } from '../../services/castCredits'
import { resolveCharacterBio } from '../../services/characterBio'
import { connectMongo } from '../../services/mongo'
import logger from '../../common/logger'

interface HttpErrorShape {
  response?: { status?: number; data?: unknown }
}

/** A paginated TMDB list payload (results + page metadata) as returned by axiosFetch. */
type ListPayload = { results?: Result[] } & Record<string, unknown>

/** Safely extract HTTP status, response body, and message from an unknown catch value. */
function extractError(e: unknown) {
  const err = e as HttpErrorShape
  const status = err.response?.status
  const data = err.response?.data
  const message = e instanceof Error ? e.message : String(e)
  return { status, data, message }
}

/**
 * Uniform catch-block tail for every handler: log with the full error object
 * (pino serializes the stack via `err`) and answer with the upstream status when
 * there is one. `clientMessage` is the stable, user-safe string the app may show.
 */
function respondError(res: Response, error: unknown, logMessage: string, clientMessage: string) {
  const { status, data, message } = extractError(error)
  logger.error({ err: error, status, data }, logMessage)
  res.status(status || 500).json({ message: clientMessage, error: data || message })
}

export const searchList = async (req: Request, res: Response) => {
  try {
    const data = await axiosFetch(searchURL(req.body))
    // /search/multi returns mixed media_type (movie/tv/person); the index lookup
    // skips persons automatically (no source_id mapping for media_type='person').
    await attachSourceIds(data.results, req.body.region)
    res.status(200).json(data)
  } catch (error) {
    respondError(res, error, 'Error fetching search data', 'Failed to fetch from external API')
  }
}

export const filterList = async (req: Request, res: Response) => {
  try {
    const data = await axiosFetch(filterURL(req.body))
    await attachSourceIds(data.results, req.body.region, req.body.media_type)
    res.status(200).json(data)
  } catch (error) {
    respondError(res, error, 'Error fetching filter data', 'Failed to fetch from external API')
  }
}

export const upcomingList = async (req: Request, res: Response) => {
  try {
    const data = await axiosFetch(upcomingURL(req.body))
    await attachSourceIds(data.results, req.body.region, req.body.media_type)
    res.status(200).json(data)
  } catch (error) {
    respondError(res, error, 'Error fetching upcoming data', 'Failed to fetch from external API')
  }
}

export const getRecommends = async (req: Request, res: Response) => {
  try {
    const data = await axiosFetch(recommendationsURL(req.body))
    await attachSourceIds(data.results, req.body.region, req.body.media_type)
    res.status(200).json(data)
  } catch (error) {
    respondError(res, error, 'Error fetching recommendations data', 'Failed to fetch from external API')
  }
}

export const getSeasons = async (req: Request, res: Response) => {
  try {
    const data = await axiosFetch(seasonsURL(req.body))
    res.status(200).json(data)
  } catch (error) {
    respondError(res, error, 'Error fetching seasons data', 'Failed to fetch from external API')
  }
}

export const getVideos = async (req: Request, res: Response) => {
  try {
    const db = await connectMongo()
    // media_type in the key: a movie and a TV show can share a TMDB id (same
    // collision class fixed for details_cast). Old docs carry media_type because
    // req.body is spread into the stored doc; a wrong-type doc is simply ignored
    // and a correct one created alongside it.
    const media = await db.collection('media').findOne({ id: req.body.id, media_type: req.body.media_type })

    if (!media) {
      const externalData = await axiosFetch(videosURL(req.body))
      const newMedia = { ...req.body, ...externalData }
      await db.collection('media').insertOne(newMedia)
      res.status(200).json({ result: 'Doc Creation Successful.', ...newMedia })
    } else {
      res.status(200).json({ result: 'Doc Selection Successful.', ...media })
    }
  } catch (error) {
    respondError(res, error, 'Error fetching or storing videos data', 'Failed to fetch or store data')
  }
}

export const getOTTStreams = async (req: Request, res: Response) => {
  try {
    const { id, media_type } = req.body
    // Single source of truth: the per-title cache (3-month TTL, monthly budget guard).
    // Keyed by (media_type, tmdb_id) — no more {id}-only collision between movie/tv.
    const doc = await resolveTitleSources(media_type, id)
    res.status(200).json({ result: 'OK', id, media_type, platforms: doc?.platforms ?? [] })
  } catch (error) {
    respondError(res, error, 'Error fetching or storing OTT streams data', 'Failed to fetch or store data')
  }
}

/**
 * Watchmode source-id → remote logo URL catalogue. The dashboard OTT badge fetches this
 * once and uses it as a fallback for sources without a bundled local logo, so badges
 * never hide a platform the Details screen would show. Backed by the in-memory
 * `getSourceLogos` cache — no Watchmode credit after the first server-lifetime call.
 */
export const getOttSourceLogos = async (_req: Request, res: Response) => {
  try {
    const logos = await getSourceLogos()
    res.status(200).json({ logos })
  } catch (error) {
    respondError(res, error, 'Error fetching source logos', 'Failed to fetch source logos')
  }
}

export const getCastDetails = async (req: Request, res: Response) => {
  try {
    const db = await connectMongo()
    // media_type in the key: a movie and a TV show can share a TMDB id.
    // Old docs were keyed by id alone but contain media_type (req.body was spread
    // in), so they still match; a wrong-type collision doc is simply ignored.
    const dataFromDB = await db.collection('details_cast').findOne({ id: req.body.id, media_type: req.body.media_type })
    if (!dataFromDB) {
      const externalIDs = await axiosFetch(externalIDURL(req.body))
      const castDetails = normalizeCredits(await axiosFetch(castDetailsURL(req.body)), req.body.media_type)
      const newData = { ...req.body, imdb_id: externalIDs.imdb_id, ...castDetails }

      await db.collection('details_cast').insertOne(newData)
      res.status(200).json({ result: 'Doc Creation Successful.', ...newData })
    } else if (req.body.media_type === 'tv' && dataFromDB.cast_source !== CAST_SOURCE_AGGREGATE) {
      // TV doc cached from the old `/credits` endpoint — upgrade it once to
      // aggregate_credits (roles[] + episode counts). Marker-based, not shape-sniffed,
      // so empty-cast titles don't re-fetch forever. Serve the stale doc if TMDB fails.
      try {
        const castDetails = normalizeCredits(await axiosFetch(castDetailsURL(req.body)), req.body.media_type)
        await db.collection('details_cast').updateOne({ _id: dataFromDB._id }, { $set: { ...castDetails } })
        res.status(200).json({ result: 'Doc Selection Successful.', ...dataFromDB, ...castDetails })
      } catch (backfillError) {
        logger.error({ err: backfillError }, 'aggregate_credits backfill failed, serving stale cast doc')
        res.status(200).json({ result: 'Doc Selection Successful.', ...dataFromDB })
      }
    } else {
      res.status(200).json({ result: 'Doc Selection Successful.', ...dataFromDB })
    }
  } catch (error) {
    respondError(res, error, 'Error fetching or storing cast details data', 'Failed to fetch or store data')
  }
}

/**
 * On-demand character bio: permanent Mongo cache → Wikipedia/Fandom extract →
 * Haiku spoiler-light summary. `{bio: null}` is a valid success response (no
 * wiki coverage / budget hit / transient failure) — the app hides the section.
 */
export const getCharacterInfo = async (req: Request, res: Response) => {
  try {
    const { id, media_type, character, title_name, actor } = req.body
    if (!id || !character || !title_name || (media_type !== 'movie' && media_type !== 'tv')) {
      return res.status(400).json({ message: 'id, media_type (movie|tv), character and title_name are required' })
    }
    const result = await resolveCharacterBio({
      mediaId: id,
      mediaType: media_type,
      character,
      titleName: title_name,
      actorName: actor,
    })
    res.status(200).json(result)
  } catch (error) {
    respondError(res, error, 'Error resolving character bio', 'Failed to resolve character bio')
  }
}

export const getDetails = async (req: Request, res: Response) => {
  try {
    const db = await connectMongo()

    const collectionSelect =
      req.body.media_type === 'movie' ? 'details_movie' : req.body.media_type === 'tv' ? 'details_tv' : null

    if (!collectionSelect) {
      return res.status(400).json({ message: 'Invalid media_type — must be movie or tv' })
    }

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
    } else if (req.body.media_type === 'movie' && !dbSearch.release_dates) {
      // Doc cached before `release_dates` was appended — backfill it once (one TMDB call)
      // so the client gets exact release status. TMDB always returns the block (possibly
      // empty `results`), so this upgrade runs at most once per movie.
      const details = await axiosFetch(detailsURL(req.body))
      const release_dates = details.release_dates ?? { results: [] }
      await db.collection(collectionSelect).updateOne({ id: req.body.id }, { $set: { release_dates } })
      res.status(200).json({ result: 'Doc Selection Successful.', ...dbSearch, release_dates })
    } else {
      res.status(200).json({ result: 'Doc Selection Successful.', ...dbSearch })
    }
  } catch (error) {
    respondError(res, error, 'Error fetching or storing details data', 'Failed to fetch or store data')
  }
}

/**
 * Factory for cached TMDB list endpoints. Handles cache lookup, TMDB fetch,
 * optional media_type injection (TMDB omits it on curated endpoints), per-title
 * source_ids attachment (via the title_sources cache), and error response.
 *
 * The 5-min cache holds the RAW TMDB payload; region-specific source_ids are attached
 * on every response from the per-title cache (a fast indexed Mongo lookup), so the
 * region-scoped cache key never bakes one region's availability into another's.
 */
function createCachedListHandler<TBody extends { region?: string }>(config: {
  name: string
  urlBuilder: (body: TBody) => string
  cacheKeyBuilder: (body: TBody) => string
  /**
   * When set, overwrites `media_type` on every result. Used by curated TMDB
   * endpoints that omit it (nowPlaying, airingToday, …). For trending-`all`
   * (which already returns a per-item `media_type`), the function form may
   * return `undefined` to skip the overwrite.
   */
  injectMediaType?: string | ((body: TBody) => string | undefined)
  /**
   * Set true for endpoints whose results can never have source_ids (e.g. people).
   * Skips the Watchmode index lookup entirely and always caches the response,
   * avoiding the cold-start penalty where people results bypass the cache until
   * the Watchmode index finishes warming.
   */
  skipSourceIds?: boolean
}) {
  return async (req: Request, res: Response) => {
    const body = req.body as TBody
    const cacheKey = config.cacheKeyBuilder(body)
    const fallbackMediaType = config.injectMediaType
      ? typeof config.injectMediaType === 'function'
        ? config.injectMediaType(body)
        : config.injectMediaType
      : undefined
    try {
      // The 5-min in-memory cache holds the RAW TMDB payload (no source_ids). Decoupling
      // it from the 3-month per-title source cache lets background-filled badges show up on
      // the very next request instead of being frozen out for the full list-cache TTL.
      let data = cacheGet<ListPayload>(cacheKey)
      if (!data) {
        const fetched = (await axiosFetch(config.urlBuilder(body))) as ListPayload
        if (fallbackMediaType) {
          fetched.results = (fetched.results as Result[]).map((item) => ({ ...item, media_type: fallbackMediaType }))
        }
        cacheSet(cacheKey, fetched)
        data = fetched
      }

      if (config.skipSourceIds) {
        res.status(200).json(data)
        return
      }

      // Attach region-specific source_ids on every response via the fast indexed Mongo
      // lookup. Clone results so per-region source_ids never leak into the shared cached payload.
      const response = { ...data, results: (data.results ?? []).map((r) => ({ ...r })) }
      await attachSourceIds(response.results, body.region, fallbackMediaType)
      res.status(200).json(response)
    } catch (error) {
      respondError(res, error, `Error fetching ${config.name} data`, 'Failed to fetch from external API')
    }
  }
}

// --- Dashboard cached list endpoints ---

/** Default region used in cache keys when the client didn't specify one. */
const regionPart = (b: { region?: string }) => (b.region || 'US').toUpperCase()

export const trendingList = createCachedListHandler({
  name: 'trending',
  urlBuilder: trendingURL,
  cacheKeyBuilder: (b) => `trending:${regionPart(b)}:${b.media_type}:${b.page}`,
  // /trending/all returns mixed media_type per item — must NOT overwrite. For
  // /trending/movie | /trending/tv, fall back to the requested media_type so
  // the index lookup succeeds even when TMDB omits it on the item.
  injectMediaType: (b) => (b.media_type !== 'all' ? b.media_type : undefined),
})

export const popularList = createCachedListHandler({
  name: 'popular',
  urlBuilder: popularURL,
  cacheKeyBuilder: (b) => `popular:${regionPart(b)}:${b.media_type}:${b.page}`,
  injectMediaType: (b) => b.media_type,
})

export const topRatedList = createCachedListHandler({
  name: 'topRated',
  urlBuilder: topRatedURL,
  cacheKeyBuilder: (b) => `topRated:${regionPart(b)}:${b.media_type}:${b.page}`,
  injectMediaType: (b) => b.media_type,
})

export const nowPlayingList = createCachedListHandler({
  name: 'nowPlaying',
  urlBuilder: nowPlayingURL,
  cacheKeyBuilder: (b) => `nowPlaying:${regionPart(b)}:${b.page}`,
  injectMediaType: 'movie',
})

export const airingTodayList = createCachedListHandler({
  name: 'airingToday',
  urlBuilder: airingTodayURL,
  cacheKeyBuilder: (b) => `airingToday:${regionPart(b)}:${b.page}`,
  injectMediaType: 'tv',
})

export const onTheAirList = createCachedListHandler({
  name: 'onTheAir',
  urlBuilder: onTheAirURL,
  cacheKeyBuilder: (b) => `onTheAir:${regionPart(b)}:${b.page}`,
  injectMediaType: 'tv',
})

export const trendingPeopleList = createCachedListHandler({
  name: 'trendingPeople',
  urlBuilder: trendingPeopleURL,
  cacheKeyBuilder: (b) => `trendingPeople:${b.page}`,
  skipSourceIds: true, // people results never have streaming platform data
})

export const discoverByGenreList = createCachedListHandler({
  name: 'discoverByGenre',
  urlBuilder: discoverByGenreURL,
  cacheKeyBuilder: (b) => `discoverByGenre:${regionPart(b)}:${b.genre}:${b.page}`,
  injectMediaType: 'movie',
})

export const getFeedback = async (req: Request, res: Response) => {
  try {
    const db = await connectMongo()
    await db.collection('feedbacks').insertOne(req.body)
    res.status(200).json(req.body)
  } catch (error) {
    // Feedback deliberately answers 500 + message-only (no upstream involved).
    const { message } = extractError(error)
    logger.error({ err: error }, 'Error storing feedback')
    res.status(500).json({ message: 'Failed to store feedback', error: message })
  }
}
