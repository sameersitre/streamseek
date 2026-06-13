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
  curatedDiscoverURL,
  SPOTLIGHT_MAX,
  searchURL,
  seasonsURL,
  topRatedURL,
  trendingURL,
  upcomingURL,
  videosURL,
} from '../../apiExternal/apiURL'
import { cacheGet, cacheSet } from '../../services/cache'
import { CAST_SOURCE_AGGREGATE, normalizeCredits } from '../../services/castCredits'
import { enrichCastWithTvmazeImages } from '../../services/tvmazeCharacters'
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
    // Canonical numeric id + media_type key — same fix as details_cast: the TMDB
    // payload's numeric `id` always overwrote req.body's string id in stored docs,
    // so string lookups never hit and this cache was write-only.
    const cacheKey = { id: Number(req.body.id), media_type: req.body.media_type }
    const media = await db.collection('media').findOne(cacheKey)

    if (!media) {
      const externalData = await axiosFetch(videosURL(req.body))
      const newMedia = { ...req.body, ...externalData, ...cacheKey }
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

/**
 * TVmaze image pass on a normalized TV credits payload. Stamps `tvmaze_checked`
 * only when TVmaze definitively answered, so a transient failure retries on the
 * next request instead of freezing the doc imageless forever.
 */
async function applyTvmazeImages(
  castDetails: Record<string, unknown>,
  imdbId: string | undefined,
): Promise<Record<string, unknown>> {
  if (!Array.isArray(castDetails.cast)) return castDetails
  const { cast, checked } = await enrichCastWithTvmazeImages(castDetails.cast, imdbId)
  return checked ? { ...castDetails, cast, tvmaze_checked: true } : { ...castDetails, cast }
}

export const getCastDetails = async (req: Request, res: Response) => {
  try {
    const db = await connectMongo()
    const isTv = req.body.media_type === 'tv'
    // CANONICAL NUMERIC id. The app posts ids as strings, but stored docs have
    // always carried TMDB's own numeric `id` (the TMDB payload is spread last and
    // overwrites req.body.id) — so string lookups never hit and every request
    // re-fetched TMDB and inserted a duplicate doc. Number() heals the cache
    // against all existing prod data. media_type in the key: movie/tv can share an id.
    const mediaId = Number(req.body.id)
    const cacheKey = { id: mediaId, media_type: req.body.media_type }
    const dataFromDB = await db.collection('details_cast').findOne(cacheKey)

    // Fresh title: TMDB external ids + credits, then (TV) TVmaze character images.
    if (!dataFromDB) {
      const externalIDs = await axiosFetch(externalIDURL(req.body))
      let castDetails = normalizeCredits(await axiosFetch(castDetailsURL(req.body)), req.body.media_type)
      if (isTv) castDetails = await applyTvmazeImages(castDetails, externalIDs.imdb_id)
      // cacheKey spread LAST so the TMDB payload can't overwrite the lookup key.
      const newData = { ...req.body, imdb_id: externalIDs.imdb_id, ...castDetails, ...cacheKey }

      await db.collection('details_cast').insertOne(newData)
      return res.status(200).json({ result: 'Doc Creation Successful.', ...newData })
    }

    // TV doc cached from the old `/credits` endpoint — upgrade it once to
    // aggregate_credits (roles[] + episode counts) + TVmaze images. Marker-based,
    // not shape-sniffed, so empty-cast titles don't re-fetch forever. Serve the
    // stale doc if TMDB fails.
    if (isTv && dataFromDB.cast_source !== CAST_SOURCE_AGGREGATE) {
      try {
        // Old docs from the credits era can lack imdb_id (the original backfill
        // didn't store it) — fetch it here, TVmaze needs it as the join key.
        const imdbId: string | undefined = dataFromDB.imdb_id ?? (await axiosFetch(externalIDURL(req.body))).imdb_id
        let castDetails = normalizeCredits(await axiosFetch(castDetailsURL(req.body)), 'tv')
        castDetails = await applyTvmazeImages(castDetails, imdbId)
        const update = { ...castDetails, imdb_id: imdbId ?? null }
        await db.collection('details_cast').updateOne({ _id: dataFromDB._id }, { $set: update })
        return res.status(200).json({ result: 'Doc Selection Successful.', ...dataFromDB, ...update })
      } catch (backfillError) {
        logger.error({ err: backfillError }, 'aggregate_credits backfill failed, serving stale cast doc')
        return res.status(200).json({ result: 'Doc Selection Successful.', ...dataFromDB })
      }
    }

    // Aggregate doc that predates TVmaze enrichment — image-only upgrade, no TMDB refetch.
    if (isTv && !dataFromDB.tvmaze_checked) {
      try {
        const imdbId: string | undefined = dataFromDB.imdb_id ?? (await axiosFetch(externalIDURL(req.body))).imdb_id
        const enriched = await applyTvmazeImages({ cast: dataFromDB.cast }, imdbId)
        if (enriched.tvmaze_checked) {
          const update = { ...enriched, imdb_id: imdbId ?? null }
          await db.collection('details_cast').updateOne({ _id: dataFromDB._id }, { $set: update })
          return res.status(200).json({ result: 'Doc Selection Successful.', ...dataFromDB, ...update })
        }
      } catch (imageError) {
        logger.warn({ err: imageError }, 'TVmaze image backfill failed, serving doc without images')
      }
      return res.status(200).json({ result: 'Doc Selection Successful.', ...dataFromDB })
    }

    res.status(200).json({ result: 'Doc Selection Successful.', ...dataFromDB })
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

    // Canonical numeric id — same fix as details_cast: the TMDB details payload's
    // numeric `id` always overwrote req.body's string id in stored docs, so string
    // lookups never hit and every request re-fetched + inserted a duplicate.
    const mediaId = Number(req.body.id)
    const dbSearch = await db.collection(collectionSelect).findOne({ id: mediaId })
    if (!dbSearch) {
      const details = await axiosFetch(detailsURL(req.body))
      const externalID = await axiosFetch(externalIDURL(req.body))

      const responseData = {
        media_type: req.body.media_type,
        ...details,
        ...externalID,
        id: mediaId, // after the spreads so nothing overwrites the lookup key
      }

      await db.collection(collectionSelect).insertOne(responseData)
      res.status(200).json({ result: 'Doc Creation Successful.', ...responseData })
    } else if (req.body.media_type === 'movie' && !dbSearch.release_dates) {
      // Doc cached before `release_dates` was appended — backfill it once (one TMDB call)
      // so the client gets exact release status. TMDB always returns the block (possibly
      // empty `results`), so this upgrade runs at most once per movie.
      const details = await axiosFetch(detailsURL(req.body))
      const release_dates = details.release_dates ?? { results: [] }
      await db.collection(collectionSelect).updateOne({ id: mediaId }, { $set: { release_dates } })
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

export const discoverByGenreList = createCachedListHandler<{
  region?: string
  media_type: 'movie' | 'tv'
  genre: number
  page: number
}>({
  name: 'discoverByGenre',
  urlBuilder: discoverByGenreURL,
  cacheKeyBuilder: (b) => `discoverByGenre:${regionPart(b)}:${b.media_type}:${b.genre}:${b.page}`,
  // /discover/{movie,tv} omits per-item media_type — inject the requested one so
  // source_ids + Details navigation resolve correctly for both movie and tv genre rows.
  injectMediaType: (b) => b.media_type,
})

/**
 * Curated "Acclaimed & Notable" hero list — popular AND well-rated AND recent,
 * blending movie + TV so the hero has its own identity (the dashboard already
 * shows every prebuilt TMDB list as a row, including trending as "Top 10"). Two
 * /discover calls, interleaved + deduped + capped, with region source_ids.
 */
export const getSpotlight = async (req: Request, res: Response) => {
  try {
    const region = (req.body.region || 'US').toUpperCase()
    const adult = !!req.body.adult
    const cacheKey = `spotlight:${region}:${adult}`

    const cached = cacheGet<Record<string, unknown>>(cacheKey)
    if (cached) {
      res.status(200).json(cached)
      return
    }

    const [movies, tv] = await Promise.all([
      axiosFetch(curatedDiscoverURL('movie', { region, adult })),
      axiosFetch(curatedDiscoverURL('tv', { region, adult })),
    ])
    const movieResults: Result[] = (movies.results ?? []).map((r: Result) => ({ ...r, media_type: 'movie' }))
    const tvResults: Result[] = (tv.results ?? []).map((r: Result) => ({ ...r, media_type: 'tv' }))

    // Interleave [m0, t0, m1, t1, …] for a mixed hero, dedupe by media_type-id, cap.
    const merged: Result[] = []
    const seen = new Set<string>()
    for (let i = 0; i < Math.max(movieResults.length, tvResults.length); i++) {
      for (const r of [movieResults[i], tvResults[i]]) {
        if (!r) continue
        const key = `${r.media_type}-${r.id}`
        if (seen.has(key)) continue
        seen.add(key)
        merged.push(r)
        if (merged.length >= SPOTLIGHT_MAX) break
      }
      if (merged.length >= SPOTLIGHT_MAX) break
    }

    // Items carry their own media_type → no fallback (same as the mixed trending/search paths).
    await attachSourceIds(merged, region)

    const payload = { page: 1, results: merged, total_pages: 1, total_results: merged.length }
    cacheSet(cacheKey, payload)
    res.status(200).json(payload)
  } catch (error) {
    respondError(res, error, 'Error fetching spotlight data', 'Failed to fetch from external API')
  }
}

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
