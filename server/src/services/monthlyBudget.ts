/**
 * Generic monthly spend guard backed by a `counters` doc per (service, month).
 *
 * Both metered upstreams (Watchmode credits, Anthropic LLM calls) share the same
 * needs: count spend per UTC month, refuse NEW spend at a cap, never block reads
 * of already-cached data. Reads fail CLOSED (treat as exhausted) so a Mongo
 * hiccup can't trigger a spending spree; the `$inc` write is atomic so
 * concurrent requests can't lose counts.
 */
import { connectMongo } from './mongo'
import logger from '../common/logger'

export interface MonthlyBudget {
  /** Current-month counter key in UTC, e.g. `watchmode:2026-06`. */
  monthKey(): string
  /** Read this month's spend count (0 if no doc yet). Fail-closed: Infinity on read error. */
  getMonthlyCount(): Promise<number>
  /** Whether new spend is allowed under the given cap (defaults to the service cap). */
  canSpend(cap?: number): Promise<boolean>
  /** Atomically record one unit of spend this month. Never throws. */
  increment(): Promise<void>
}

export function createMonthlyBudget(service: string, defaultCap: number): MonthlyBudget {
  const monthKey = () => `${service}:${new Date().toISOString().slice(0, 7)}`

  return {
    monthKey,

    async getMonthlyCount() {
      try {
        const db = await connectMongo()
        const doc = await db.collection('counters').findOne({ counterName: monthKey() })
        return (doc?.counts as number | undefined) ?? 0
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        logger.warn({ err: error, error: message }, `${service} budget read failed; treating as exhausted`)
        return Number.POSITIVE_INFINITY
      }
    },

    async canSpend(cap = defaultCap) {
      return (await this.getMonthlyCount()) < cap
    },

    async increment() {
      try {
        const db = await connectMongo()
        await db
          .collection('counters')
          .updateOne({ counterName: monthKey() }, { $inc: { counts: 1 } }, { upsert: true })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        logger.warn({ err: error, error: message }, `${service} budget increment failed`)
      }
    },
  }
}
