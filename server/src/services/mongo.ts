import mongoose from 'mongoose'
import { DB_URI } from './db'
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
        collection.createIndex(
          { userId: 1, mediaId: 1, mediaType: 1 },
          { unique: true },
        ),
        collection.createIndex({ userId: 1, watchlisted: 1, updatedAt: -1 }),
        collection.createIndex({ userId: 1, liked: 1, updatedAt: -1 }),
      ])
      logger.info('user_interactions indexes created ✅')

      // Create indexes for users collection (idempotent)
      const usersCollection = db.collection('users')
      await Promise.all([
        usersCollection.createIndex(
          { userId: 1, provider: 1 },
          { unique: true },
        ),
        usersCollection.createIndex(
          { email: 1 },
          { sparse: true },
        ),
      ])
      logger.info('users indexes created ✅')
    } catch (err) {
      logger.error({ err }, `MongoDB connection failed: ${(err as Error).message}`)
      throw err
    }
  }
  return mongoose.connection
}
