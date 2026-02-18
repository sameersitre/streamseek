import axios from 'axios'
import logger from '../common/logger'
import { CastDetailsParams } from '../types'
import { axiosFetch } from './apiCall'
import { actorDetailsURL, castDetailsURL } from './apiURL'

// Cache source logos from /sources/ reference endpoint (source_id -> logo_100px)
let sourceLogos: Record<number, string> = {}

const getSourceLogos = async () => {
  if (Object.keys(sourceLogos).length > 0) return sourceLogos
  const res = await axios.get(`https://api.watchmode.com/v1/sources/?apiKey=${process.env.WATCHMODE_API_KEY}`)
  for (const s of res.data) {
    sourceLogos[s.id] = s.logo_100px
  }
  logger.info(`Watchmode sources cached: ${Object.keys(sourceLogos).length} providers`)
  return sourceLogos
}

export const fetchOTTPlatforms = async (mediaType: string, tmdbId: string | number) => {
  const titleId = `${mediaType}-${tmdbId}` // e.g. "movie-550" or "tv-1396"
  const url = `https://api.watchmode.com/v1/title/${titleId}/sources/?apiKey=${process.env.WATCHMODE_API_KEY}`

  const [response, logos] = await Promise.all([axios.get(url), getSourceLogos()])
  logger.info(`Watchmode API called for ${titleId}, got ${response.data?.length ?? 0} sources`)

  return (response.data ?? []).map((s) => ({
    name: s.name ?? 'Unknown',
    url: s.web_url ?? '',
    icon: logos[s.source_id] ?? '',
    type: s.type,
    price: s.price,
    region: s.region,
  }))
}

export const castDetailsv2 = async function (params: CastDetailsParams) {
  const allDetails = []
  await axios
    .get(castDetailsURL(params), {
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_UTELLY_API_KEY,
      },
    })
    .then((res) => {
      logger.info('rapidapi-imdb api called.')
      return res.data.cast
    })
    .then(async (res) => {
      for (let i = 0; i < res.length; i++) {
        let fullActorDetails = {}
        const actorDetails = await axiosFetch(actorDetailsURL(res[i]))
        fullActorDetails = {
          ...res[i],
          profile_path: actorDetails.person_results[0].profile_path,
        }

        allDetails.push(fullActorDetails)
      }
    })
    .catch((error) => {
      logger.error(error)
      return error
    })
  return { ...params, cast: allDetails }
}
