/**
 * Watchmode monthly request budget guard.
 *
 * The Watchmode plan allows 2,500 requests/month. Every successful /title/{id}/sources
 * fetch costs credits, so we track spend in a per-month `counters` doc
 * (`watchmode:YYYY-MM`) and refuse NEW fetches near the cap — serving cache-only.
 *
 * User-triggered Details fetches are prioritized over background badge fills: badge
 * fills stop at BADGE_CAP, leaving headroom up to MONTHLY_CAP for Details. A small
 * read-then-$inc overshoot (≤ background concurrency) is acceptable given the 100-credit
 * gap below the real 2,500 ceiling; the $inc write itself is atomic.
 */
import { connectMongo } from './mongo'
import logger from '../common/logger'

/** Hard ceiling for any Watchmode call this month (100 credits headroom under 2,500). */
const MONTHLY_CAP = 2400

/** Lower ceiling for background badge fills — reserves ~400 credits for user Details. */
const BADGE_CAP = 2000

export type WatchmodeSpendPurpose = 'details' | 'badge'

/** Current-month counter key in UTC, e.g. `watchmode:2026-06`. */
export function currentMonthKey(): string {
  return `watchmode:${new Date().toISOString().slice(0, 7)}`
}

/** Read this month's Watchmode call count (0 if no doc yet). */
export async function getMonthlyCount(): Promise<number> {
  try {
    const db = await connectMongo()
    const doc = await db.collection('counters').findOne({ counterName: currentMonthKey() })
    return (doc?.counts as number | undefined) ?? 0
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.warn({ error: message }, 'Watchmode budget read failed; treating as exhausted')
    // Fail closed: if we can't read the budget, don't spend credits.
    return Number.POSITIVE_INFINITY
  }
}

/** Whether a Watchmode fetch of the given purpose is allowed under the monthly budget. */
export async function canSpendWatchmode(purpose: WatchmodeSpendPurpose): Promise<boolean> {
  const count = await getMonthlyCount()
  const cap = purpose === 'details' ? MONTHLY_CAP : BADGE_CAP
  return count < cap
}

/** Atomically record one Watchmode credit spent this month. */
export async function incrementMonthlyCounter(): Promise<void> {
  try {
    const db = await connectMongo()
    await db
      .collection('counters')
      .updateOne({ counterName: currentMonthKey() }, { $inc: { counts: 1 } }, { upsert: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.warn({ error: message }, 'Watchmode budget increment failed')
  }
}
