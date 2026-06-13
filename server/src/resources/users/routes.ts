import { Router, Request, Response } from 'express'
import {
  airingTodayList,
  discoverByGenreList,
  filterList,
  getCastDetails,
  getCharacterInfo,
  getDetails,
  getFeedback,
  getOTTStreams,
  getOttSourceLogos,
  getRecommends,
  getSeasons,
  getVideos,
  nowPlayingList,
  onTheAirList,
  getSpotlight,
  popularList,
  searchList,
  topRatedList,
  trendingList,
  trendingPeopleList,
  upcomingList,
} from './controller'
import { syncProfile } from './profileController'
import { requireInternalAuth } from '../../middlewares/authMiddleware'
import { characterBioRateLimiter } from '../../middlewares/rateLimiter'

const router = Router()

// health check
router.route('/').get((_req: Request, res: Response) => {
  res.status(200).json({ 'health-check': 'OK: api v2 working' })
})

// TRENDING ALL/TV/MOVIE DAY
router.route('/trending').post(trendingList)

router.route('/search').post(searchList)

router.route('/filter').post(filterList)

router.route('/upcoming').post(upcomingList)

router.route('/getDetails').post(getDetails)

router.route('/getVideos').post(getVideos)

router.route('/getRecommendations').post(getRecommends)

router.route('/getSeasons').post(getSeasons)

router.route('/getOTTPlatforms').post(getOTTStreams)

router.route('/getSourceLogos').post(getOttSourceLogos)

router.route('/getCastDetails').post(getCastDetails)

// Character bio (wiki + LLM, permanently cached) — rate limited: uncached calls cost money
router.route('/getCharacterInfo').post(characterBioRateLimiter, getCharacterInfo)

router.route('/feedback').post(getFeedback)

// Dashboard endpoints
router.route('/popular').post(popularList)
router.route('/topRated').post(topRatedList)
router.route('/nowPlaying').post(nowPlayingList)
router.route('/airingToday').post(airingTodayList)
router.route('/onTheAir').post(onTheAirList)
router.route('/trendingPeople').post(trendingPeopleList)
router.route('/discoverByGenre').post(discoverByGenreList)
// Curated "Acclaimed & Notable" hero list (movie+TV blend, distinct from trending/Top 10)
router.route('/spotlight').post(getSpotlight)

// User profile sync — internal server-to-server only (from Next.js events.signIn)
router.route('/users/sync-profile').post(requireInternalAuth, syncProfile)

export default router
