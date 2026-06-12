import axios from 'axios'
import logger from '../common/logger'

// `any` default is load-bearing: callers destructure TMDB payloads untyped
// (`data.results`, `.imdb_id`, …). Tightening to `unknown` breaks every call
// site — migrate by passing explicit <T> per call, then drop the default.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const axiosFetch = async <T = any>(URL: string): Promise<T> => {
  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: URL,
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      accept: 'application/json',
    },
  }

  try {
    const response = await axios.request<T>(config)
    return response.data
  } catch (error) {
    // `err` key so pino serializes status + stack; previously the error object
    // was passed as a (dropped) interpolation arg and never reached the log line.
    logger.fatal({ err: error, url: URL }, 'External API fetch failed')
    throw error // Rethrow so the caller can handle and respond
  }
}
