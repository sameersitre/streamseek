import { Router } from 'express'

const router: Router = Router()

// import routes
import userRouter from '../resources/users/routes'
import interactionRouter from '../resources/interactions/routes'
import portfolioRouter from '../resources/portfolio/portfolio.routes'

// Higher level routes definition
router.use('/v2', userRouter)
router.use('/v2/interactions', interactionRouter)
router.use('/v2/portfolio', portfolioRouter)

export default router
