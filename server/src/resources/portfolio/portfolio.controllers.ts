// Portfolio content controller — handles public read and internal-auth upsert
// of experiences, skillCategories, and projects stored in the portfolio_content collection.

import { Request, Response } from 'express'
import logger from '../../common/logger'
import { getPortfolioCollection } from '../../services/mongo'

const VALID_TYPES = ['experiences', 'skillCategories', 'projects'] as const
type ContentType = (typeof VALID_TYPES)[number]

// Default empty shape — ensures the response is always well-typed even when
// the DB has not been seeded yet for a given type (never throws 404).
const EMPTY_CONTENT: Record<ContentType, unknown[]> = {
  experiences: [],
  skillCategories: [],
  projects: [],
}

/**
 * GET all portfolio content (public).
 * Fetches all seeded content types in a single query and returns a merged object.
 * Returns empty arrays for any type not yet seeded.
 */
export const getPortfolioContent = async (_req: Request, res: Response) => {
  try {
    const collection = await getPortfolioCollection()

    const docs = await collection
      .find({ type: { $in: VALID_TYPES } })
      .project({ type: 1, data: 1, _id: 0 })
      .toArray()

    const result: Record<ContentType, unknown[]> = { ...EMPTY_CONTENT }
    for (const doc of docs) {
      result[doc.type as ContentType] = doc.data as unknown[]
    }

    res.json(result)
  } catch (err) {
    logger.error({ err }, 'Failed to get portfolio content')
    res.status(500).json({ error: 'Failed to get portfolio content' })
  }
}

/**
 * Upsert one content type (internal auth only).
 * Body: { type: ContentType, data: unknown[] }
 * Idempotent — repeated seeds overwrite data without duplicating documents.
 */
export const seedPortfolioContent = async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body

    if (!VALID_TYPES.includes(type)) {
      res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` })
      return
    }

    if (!Array.isArray(data)) {
      res.status(400).json({ error: 'data must be an array' })
      return
    }

    const collection = await getPortfolioCollection()
    const now = new Date()

    await collection.findOneAndUpdate(
      { type },
      {
        $set: { data, updatedAt: now },
        $setOnInsert: { createdAt: now }, // only written on first insert
      },
      { upsert: true },
    )

    res.json({ ok: true, type, count: data.length })
  } catch (err) {
    logger.error({ err }, 'Failed to seed portfolio content')
    res.status(500).json({ error: 'Failed to seed portfolio content' })
  }
}
