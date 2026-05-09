import axios from 'axios'
import logger from '../common/logger'

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
    logger.fatal(URL, error)
    throw error // Rethrow so the caller can handle and respond
  }
}
