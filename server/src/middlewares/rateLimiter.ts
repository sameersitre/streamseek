import rateLimit from 'express-rate-limit'

// 30 requests per minute per IP for toggle endpoints
export const toggleRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

// 10/min per IP for character bios — each uncached request can cost an LLM call.
// (Carrier NAT can pool users behind one IP; revisit keying if legit 429s show up.)
export const characterBioRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many character info requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})
