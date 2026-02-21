import { Request, Response, NextFunction } from 'express'
import { decode } from '@auth/core/jwt'
import logger from '../common/logger'

// Extend Express Request with userId
declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

const AUTH_SECRET = process.env.AUTH_SECRET

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!AUTH_SECRET) {
    logger.error('AUTH_SECRET not configured')
    res.status(500).json({ error: 'Server auth not configured' })
    return
  }

  try {
    // Auth.js v5 cookie names differ by environment
    const cookieName =
      process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token'

    const token = req.cookies?.[cookieName]

    if (!token) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }

    // Decode Auth.js JWE token using shared AUTH_SECRET
    const decoded = await decode({
      token,
      secret: AUTH_SECRET,
      salt: cookieName,
    })

    if (!decoded) {
      res.status(401).json({ error: 'Invalid session' })
      return
    }

    // Extract userId from token (Auth.js stores it as uid or sub)
    const userId = (decoded as Record<string, unknown>).uid as string || decoded.sub
    if (!userId) {
      res.status(401).json({ error: 'Invalid session: no user ID' })
      return
    }

    req.userId = userId
    next()
  } catch (err) {
    logger.error({ err }, 'Auth middleware error')
    res.status(401).json({ error: 'Authentication failed' })
  }
}
