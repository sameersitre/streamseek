import mongoose from 'mongoose'
import { DB_URI } from './db'
import logger from '../common/logger'

let isConnected = false

export const connectMongo = async () => {
  if (!isConnected) {
    await mongoose.connect(DB_URI, {
      dbName: 'bingefeast',
    })
    isConnected = true
    logger.info('MongoDB Connected ✅')
  }
  return mongoose.connection
}
export const disconnectMongo = async () => {
  if (isConnected) {
    await mongoose.disconnect()
    isConnected = false
    logger.error('MongoDB Disconnected ❌')
  }
}
export const getMongoConnection = () => {
  if (isConnected) {
    return mongoose.connection
  } else {
    throw new Error('MongoDB is not connected')
  }
}
