import mongoose from 'mongoose'
import { DB_URI } from './db'
import { TITLE_SOURCES_COLLECTION, TITLE_SOURCES_TTL_SECONDS } from '../apiExternal/titleSourcesConfig'
import logger from '../common/logger'

let isConnected = false

export const connectMongo = async () => {
  if (!isConnected) {
    try {
      await mongoose.connect(DB_URI, {
        dbName: 'bingefeast',
        serverSelectionTimeoutMS: 5000,
      })
      isConnected = true
      logger.info('MongoDB Connected ✅')

      // Create indexes for user_interactions collection (idempotent)
      const db = mongoose.connection.db!
      const collection = db.collection('user_interactions')
      await Promise.all([
        collection.createIndex({ userId: 1, mediaId: 1, mediaType: 1 }, { unique: true }),
        collection.createIndex({ userId: 1, watchlisted: 1, updatedAt: -1 }),
        collection.createIndex({ userId: 1, liked: 1, updatedAt: -1 }),
      ])
      logger.info('user_interactions indexes created ✅')

      // Create indexes for users collection (idempotent)
      const usersCollection = db.collection('users')
      await Promise.all([
        usersCollection.createIndex({ userId: 1, provider: 1 }, { unique: true }),
        usersCollection.createIndex({ email: 1 }, { sparse: true }),
      ])
      logger.info('users indexes created ✅')

      // Create indexes for portfolio_content collection (idempotent)
      const portfolioCollection = db.collection('portfolio_content')
      await portfolioCollection.createIndex({ type: 1 }, { unique: true })
      logger.info('portfolio_content indexes created ✅')

      // Per-title Watchmode sources cache (idempotent).
      // - tkey: unique `${media_type}-${tmdb_id}` for the bulk $in badge lookup + upserts.
      // - fetched_at TTL index auto-expires docs after 3 months (the resolver re-fetches on miss).
      //   App-level `fetched_at > cutoff` reads guard against the ~60s TTL-reaper lag.
      const titleSourcesCollection = db.collection(TITLE_SOURCES_COLLECTION)
      await Promise.all([
        titleSourcesCollection.createIndex({ tkey: 1 }, { unique: true }),
        titleSourcesCollection.createIndex({ fetched_at: 1 }, { expireAfterSeconds: TITLE_SOURCES_TTL_SECONDS }),
      ])
      logger.info('title_sources indexes created ✅')

      // Watchmode monthly budget counters keyed by `watchmode:YYYY-MM` (idempotent).
      const countersCollection = db.collection('counters')
      await countersCollection.createIndex({ counterName: 1 }, { unique: true })
      logger.info('counters indexes created ✅')
    } catch (err) {
      logger.error({ err }, `MongoDB connection failed: ${(err as Error).message}`)
      throw err
    }
  }
  return mongoose.connection
}

// Lazy helper that ensures a live connection before returning the collection.
// Mirrors the inline getCollection() pattern used in interactions/controller.ts.
export const getPortfolioCollection = async () => {
  const connection = await connectMongo()
  return connection.db!.collection('portfolio_content')
}
