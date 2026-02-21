import mongoose from 'mongoose'
import logger from '../common/logger'

// to use env variables
import '../common/env'

// MongoDB connection URI
export const DB_URI = process.env.MONGO_URI ||
  `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.CLUSTER_URL}/?authSource=${process.env.AUTH_SOURCE}&authMechanism=${process.env.AUTH_MECHANISM}`
logger.info(`DB_URI: ${DB_URI}`)

// Get current connected Database (connection established lazily via connectMongo)
const db = mongoose.connection

// Notify on error or success
db.on('error', (err) => logger.error(`Connection with db error; DB URI: \n ${DB_URI}`, err))
db.on('close', () => logger.info(`Connection closed to db; DB URI: \n ${DB_URI}`))
db.once('open', () => logger.info(`Connected to the database instance on \n ${DB_URI}`))

export default {
  Connection: db,
}
