import { Router } from 'express'
import { getPortfolioContent, seedPortfolioContent } from './portfolio.controllers'
import { requireInternalAuth } from '../../middlewares/authMiddleware'

const portfolioRouter: Router = Router()

portfolioRouter.post('/content', getPortfolioContent)
portfolioRouter.post('/seed', requireInternalAuth, seedPortfolioContent)

export default portfolioRouter
