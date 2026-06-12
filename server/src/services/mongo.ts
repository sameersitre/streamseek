/**
 * Lazy MongoDB connection singleton + idempotent index creation.
 * Every data-touching code path goes through `connectMongo()`; indexes are
 * (re)declared on first connection of the process — createIndex is a no-op
 * when the index already exists.
 */
import mongoose from 'mongoose'
import { DB_URI } from './db'
import { TITLE_SOURCES_COLLECTION, TITLE_SOURCES_TTL_SECONDS } from '../apiExternal/titleSourcesConfig'
import logger from '../common/logger'

let isConnected = false

// Derive driver types from mongoose's own vendored mongodb — importing them from
// the top-level 'mongodb' package clashes (two driver versions in the tree).
type AppDb = NonNullable<typeof mongoose.connection.db>
type CreateIndexArgs = Parameters<ReturnType<AppDb['collection']>['createIndex']>

interface IndexDecl {
  collection: string
  indexes: Array<{ spec: CreateIndexArgs[0]; options?: CreateIndexArgs[1] }>
}

/**
 * All app-managed indexes, declared in one table.
 * Cache collections that are pure {id, media_type} lookups (details_movie,
 * details_tv, details_cast, media) ride on _id scans + tiny sizes and have
 * no explicit indexes — add them here if they ever grow hot.
 */
const INDEX_DECLS: IndexDecl[] = [
  {
    collection: 'user_interactions',
    indexes: [
      { spec: { userId: 1, mediaId: 1, mediaType: 1 }, options: { unique: true } },
      { spec: { userId: 1, watchlisted: 1, updatedAt: -1 } },
      { spec: { userId: 1, liked: 1, updatedAt: -1 } },
    ],
  },
  {
    collection: 'users',
    indexes: [
      { spec: { userId: 1, provider: 1 }, options: { unique: true } },
      { spec: { email: 1 }, options: { sparse: true } },
    ],
  },
  {
    collection: 'portfolio_content',
    indexes: [{ spec: { type: 1 }, options: { unique: true } }],
  },
  {
    // Per-title Watchmode sources cache:
    // - tkey: unique `${media_type}-${tmdb_id}` for the bulk $in badge lookup + upserts.
    // - fetched_at TTL auto-expires docs after 3 months (the resolver re-fetches on miss).
    //   App-level `fetched_at > cutoff` reads guard against the ~60s TTL-reaper lag.
    collection: TITLE_SOURCES_COLLECTION,
    indexes: [
      { spec: { tkey: 1 }, options: { unique: true } },
      { spec: { fetched_at: 1 }, options: { expireAfterSeconds: TITLE_SOURCES_TTL_SECONDS } },
    ],
  },
  {
    // Monthly budget counters (`watchmode:YYYY-MM`, `anthropic:YYYY-MM`).
    collection: 'counters',
    indexes: [{ spec: { counterName: 1 }, options: { unique: true } }],
  },
  {
    // Character bios (wiki + LLM, permanent cache) — one doc per character per title.
    // Partial TTL on negative-cache docs only: wiki coverage grows over time, so
    // `not_found` heals after ~90 days while real bios stay forever.
    collection: 'character_bios',
    indexes: [
      { spec: { media_id: 1, media_type: 1, character_norm: 1 }, options: { unique: true } },
      {
        spec: { created_at: 1 },
        options: { expireAfterSeconds: 90 * 24 * 60 * 60, partialFilterExpression: { status: 'not_found' } },
      },
    ],
  },
]

async function ensureIndexes(db: AppDb): Promise<void> {
  await Promise.all(
    INDEX_DECLS.flatMap(({ collection, indexes }) =>
      indexes.map(({ spec, options }) => db.collection(collection).createIndex(spec, options ?? {})),
    ),
  )
  logger.info(`indexes ensured for ${INDEX_DECLS.map((d) => d.collection).join(', ')} ✅`)
}

export const connectMongo = async () => {
  if (!isConnected) {
    try {
      await mongoose.connect(DB_URI, {
        dbName: 'bingefeast',
        serverSelectionTimeoutMS: 5000,
      })
      isConnected = true
      logger.info('MongoDB Connected ✅')
      await ensureIndexes(mongoose.connection.db!)
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
