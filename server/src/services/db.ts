import mongoose from 'mongoose'
import logger from '../common/logger'

// to use env variables
import '../common/env'

// MongoDB connection URI
export const DB_URI = process.env.MONGO_URI ||
  `mongodb://${process.env.USERNAME}:${process.env.PASSWORD}@${process.env.CLUSTER_URL}:27017/?authSource=${process.env.AUTH_SOURCE}&authMechanism=${process.env.AUTH_MECHANISM}`
logger.info({DB_URI})

// Connect to MongoDB
 mongoose.connect(DB_URI, { dbName: 'bingefeast' })

mongoose.Promise = global.Promise

// Get current connected Database
const db = mongoose.connection

// Notify on error or success
db.on('error', (err) => logger.error(`Connection with db error; DB URI: \n ${DB_URI}`, err))
db.on('close', () => logger.info(`Connection closed to db; DB URI: \n ${DB_URI}`))
db.once('open', () => logger.info(`Connected to the database instance on \n ${DB_URI}`))

export default {
  Connection: db,
}
