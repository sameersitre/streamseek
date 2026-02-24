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

  // Trusted internal header from Next.js API proxy (validated via shared AUTH_SECRET)
  const internalSecret = req.headers['x-internal-secret'] as string
  const internalUserId = req.headers['x-user-id'] as string

  if (internalSecret === AUTH_SECRET && internalUserId) {
    req.userId = internalUserId
    next()
    return
  }

  // Mobile app: Google idToken via Bearer header
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const idToken = authHeader.slice(7)
    try {
      const googleRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
      )
      if (!googleRes.ok) {
        res.status(401).json({ error: 'Invalid Google token' })
        return
      }
      const payload = await googleRes.json() as { sub?: string; aud?: string }

      const validAudiences = [
        process.env.GOOGLE_WEB_CLIENT_ID,
        process.env.GOOGLE_CLIENT_ID_IOS,
        process.env.GOOGLE_CLIENT_ID_ANDROID,
      ].filter(Boolean)

      if (!payload.sub || !validAudiences.includes(payload.aud)) {
        res.status(401).json({ error: 'Token audience mismatch' })
        return
      }

      req.userId = payload.sub
      next()
      return
    } catch (err) {
      logger.error({ err }, 'Bearer token verification failed')
      res.status(401).json({ error: 'Bearer token verification failed' })
      return
    }
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

// Lightweight auth for internal server-to-server calls (e.g., Next.js events.signIn).
// Validates only the shared secret header — no user session cookie required.
export const requireInternalAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!AUTH_SECRET) {
    logger.error('AUTH_SECRET not configured')
    res.status(500).json({ error: 'Server auth not configured' })
    return
  }

  const internalSecret = req.headers['x-internal-secret'] as string

  if (internalSecret === AUTH_SECRET) {
    next()
    return
  }

  res.status(401).json({ error: 'Unauthorized: invalid internal secret' })
}
