import axios from 'axios'
import logger from '../common/logger'
import { CastDetailsParams, OttStreamUtellyParams, OttStreamWatchmodeParams } from '../types'
import { axiosFetch } from './apiCall'
import { actorDetailsURL, castDetailsURL, ottStreamUtellyURL } from './apiURL'

export const ottStreams = async function (params: OttStreamUtellyParams) {
  try {
    let streamAvailablity = null
    await axios
      .get(ottStreamUtellyURL(params), {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_UTELLY_API_KEY,
        },
      })
      .then((res) => {
        streamAvailablity = res.data
      })
      .catch((error) => {
        streamAvailablity = error
      })
    return streamAvailablity.collection.locations
  } catch (error) {
    logger.error(error)
    return error
  }
}

export const watchModeFetch = async (params: OttStreamWatchmodeParams) => {
  const options = {
    method: 'GET',
    url: `https://watchmode.p.rapidapi.com/title/${params.media_type}-${params.id}/sources/`,
    headers: {
      'x-rapidapi-key': '0bec52a219msh0dbe24887102091p1872c7jsnf4a2acdec991',
      'x-rapidapi-host': 'watchmode.p.rapidapi.com',
      'Content-Type': 'application/json',
      regions: params.region,
    },
  }

  try {
    const response = await axios.request(options)
    logger.info('watchmode api called.')
    return response.data
  } catch (error) {
    logger.error(error)
    return error
  }
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
