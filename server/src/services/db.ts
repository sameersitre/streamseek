/** MongoDB connection URI + connection-lifecycle logging (connection itself is lazy — see mongo.ts). */
import mongoose from 'mongoose'
import logger from '../common/logger'

// to use env variables
import '../common/env'

export const DB_URI =
  process.env.MONGO_URI ||
  `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.CLUSTER_URL}/?authSource=${process.env.AUTH_SOURCE}&authMechanism=${process.env.AUTH_MECHANISM}`

// Never log the full URI — it embeds credentials in production (mongodb+srv://user:pass@…).
const redactedUri = DB_URI.replace(/\/\/[^@/]+@/, '//<redacted>@')
logger.info(`DB_URI: ${redactedUri}`)

// Connection-lifecycle notifications (connection established lazily via connectMongo)
const db = mongoose.connection
db.on('error', (err) => logger.error({ err }, `MongoDB connection error (${redactedUri})`))
db.on('close', () => logger.info(`MongoDB connection closed (${redactedUri})`))
db.once('open', () => logger.info(`MongoDB connection open (${redactedUri})`))
