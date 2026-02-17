import { Router } from 'express'
import {
  filterList,
  getAll,
  getCastDetails,
  getDetails,
  getFeedback,
  getOTTStreams,
  getRecommends,
  getSeasons,
  getTest,
  getVideos,
  searchList,
  trendingList,
  upcomingList,
} from './controller'

const router = Router()

// define routes
router.route('/').get(getAll)

router.route('/test').post(getTest)

//  TRENDING ALL/TV/MOVIE DAY
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

router.route('/info').post(getAll)

router.route('/feedback').post(getFeedback)

// router.route('/login').post(verifyAuthentication)

// router.route('/profile').post(verifyAuthentication)

export default router
