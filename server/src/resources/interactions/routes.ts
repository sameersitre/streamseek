import { Router } from 'express'
import { requireAuth } from '../../middlewares/authMiddleware'
import { toggleRateLimiter } from '../../middlewares/rateLimiter'
import { getAllInteractions, toggleLike, toggleWatchlist, getWatchlist, getLikes } from './controller'

const router: Router = Router()

// All interaction routes require authentication
router.use(requireAuth)

// Get all user interactions at once (powers client-side like/watchlist checks)
router.post('/all', getAllInteractions)

// Toggle endpoints (rate limited)
router.post('/toggle-like', toggleRateLimiter, toggleLike)
router.post('/toggle-watchlist', toggleRateLimiter, toggleWatchlist)

// Paginated list endpoints (for dedicated pages)
router.post('/watchlist', getWatchlist)
router.post('/likes', getLikes)

export default router
