import { Request, Response } from 'express'
import mongoose from 'mongoose'
import logger from '../../common/logger'

const getCollection = () => mongoose.connection.db!.collection('user_interactions')

// Get ALL user interactions at once (powers client-side checks)
export const getAllInteractions = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!
    const collection = getCollection()

    const docs = await collection
      .find({
        userId,
        $or: [{ liked: true }, { watchlisted: true }],
      })
      .project({ mediaId: 1, mediaType: 1, liked: 1, watchlisted: 1, _id: 0 })
      .toArray()

    res.json({ interactions: docs })
  } catch (err) {
    logger.error({ err }, 'Failed to get all interactions')
    res.status(500).json({ error: 'Failed to get interactions' })
  }
}

// Toggle like on/off
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!
    const { mediaId, mediaType, title, posterPath, voteAverage } = req.body

    if (!mediaId || !mediaType) {
      res.status(400).json({ error: 'mediaId and mediaType are required' })
      return
    }

    const collection = getCollection()
    const now = new Date()

    // Find existing doc to determine current state
    const existing = await collection.findOne({ userId, mediaId, mediaType })
    const currentLiked = existing?.liked ?? false

    const result = await collection.findOneAndUpdate(
      { userId, mediaId, mediaType },
      {
        $set: {
          liked: !currentLiked,
          title: title || existing?.title,
          posterPath: posterPath ?? existing?.posterPath ?? null,
          voteAverage: voteAverage ?? existing?.voteAverage ?? 0,
          updatedAt: now,
        },
        $setOnInsert: {
          watchlisted: false,
          createdAt: now,
        },
      },
      { upsert: true, returnDocument: 'after' },
    )

    res.json({
      liked: result?.liked ?? !currentLiked,
      watchlisted: result?.watchlisted ?? false,
    })
  } catch (err) {
    logger.error({ err }, 'Failed to toggle like')
    res.status(500).json({ error: 'Failed to toggle like' })
  }
}

// Toggle watchlist on/off
export const toggleWatchlist = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!
    const { mediaId, mediaType, title, posterPath, voteAverage } = req.body

    if (!mediaId || !mediaType) {
      res.status(400).json({ error: 'mediaId and mediaType are required' })
      return
    }

    const collection = getCollection()
    const now = new Date()

    const existing = await collection.findOne({ userId, mediaId, mediaType })
    const currentWatchlisted = existing?.watchlisted ?? false

    const result = await collection.findOneAndUpdate(
      { userId, mediaId, mediaType },
      {
        $set: {
          watchlisted: !currentWatchlisted,
          title: title || existing?.title,
          posterPath: posterPath ?? existing?.posterPath ?? null,
          voteAverage: voteAverage ?? existing?.voteAverage ?? 0,
          updatedAt: now,
        },
        $setOnInsert: {
          liked: false,
          createdAt: now,
        },
      },
      { upsert: true, returnDocument: 'after' },
    )

    res.json({
      liked: result?.liked ?? false,
      watchlisted: result?.watchlisted ?? !currentWatchlisted,
    })
  } catch (err) {
    logger.error({ err }, 'Failed to toggle watchlist')
    res.status(500).json({ error: 'Failed to toggle watchlist' })
  }
}

// Get user's watchlist (paginated, with denormalized data for rendering)
export const getWatchlist = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!
    const page = Math.max(1, Number(req.body.page) || 1)
    const limit = 20

    const collection = getCollection()

    const [docs, total] = await Promise.all([
      collection
        .find({ userId, watchlisted: true })
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .project({ mediaId: 1, mediaType: 1, title: 1, posterPath: 1, voteAverage: 1, updatedAt: 1, _id: 0 })
        .toArray(),
      collection.countDocuments({ userId, watchlisted: true }),
    ])

    res.json({
      results: docs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    logger.error({ err }, 'Failed to get watchlist')
    res.status(500).json({ error: 'Failed to get watchlist' })
  }
}

// Get user's likes (paginated, with denormalized data for rendering)
export const getLikes = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!
    const page = Math.max(1, Number(req.body.page) || 1)
    const limit = 20

    const collection = getCollection()

    const [docs, total] = await Promise.all([
      collection
        .find({ userId, liked: true })
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .project({ mediaId: 1, mediaType: 1, title: 1, posterPath: 1, voteAverage: 1, updatedAt: 1, _id: 0 })
        .toArray(),
      collection.countDocuments({ userId, liked: true }),
    ])

    res.json({
      results: docs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    logger.error({ err }, 'Failed to get likes')
    res.status(500).json({ error: 'Failed to get likes' })
  }
}
