import { Router, Request, Response } from 'express'
import {
  filterList,
  getCastDetails,
  getDetails,
  getFeedback,
  getOTTStreams,
  getRecommends,
  getSeasons,
  getVideos,
  searchList,
  trendingList,
  upcomingList,
} from './controller'
import { syncProfile } from './profileController'
import { requireInternalAuth } from '../../middlewares/authMiddleware'

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

router.route('/getCastDetails').post(getCastDetails)

router.route('/feedback').post(getFeedback)

// User profile sync — internal server-to-server only (from Next.js events.signIn)
router.route('/users/sync-profile').post(requireInternalAuth, syncProfile)

export default router
