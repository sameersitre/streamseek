import { Request, Response } from 'express'
import logger from '../../common/logger'
import { connectMongo } from '../../services/mongo'

const getCollection = async () => {
  const connection = await connectMongo()
  return connection.db!.collection('users')
}

// Upsert user profile on login (called from Next.js events.signIn)
export const syncProfile = async (req: Request, res: Response) => {
  try {
    const { userId, provider, name, email, image } = req.body

    if (!userId || !provider) {
      res.status(400).json({ error: 'userId and provider are required' })
      return
    }

    const collection = await getCollection()
    const now = new Date()

    await collection.updateOne(
      { userId, provider },
      {
        $set: {
          name: name || null,
          email: email || null,
          image: image || null,
          lastLoginAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
        $inc: {
          loginCount: 1,
        },
      },
      { upsert: true },
    )

    res.status(200).json({ success: true })
  } catch (err) {
    logger.error({ err }, 'Failed to sync user profile')
    res.status(500).json({ error: 'Failed to sync user profile' })
  }
}
