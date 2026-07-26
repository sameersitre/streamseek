/**
 * Watchmode monthly request budget — a configured `monthlyBudget` instance.
 *
 * The Watchmode plan allows 2,500 requests/month. Every successful
 * /title/{id}/sources fetch costs credits, so NEW fetches are refused near the
 * cap — serving cache-only. User-triggered Details fetches are prioritized over
 * background badge fills: badge fills stop at BADGE_CAP, leaving headroom up to
 * MONTHLY_CAP for Details. A small read-then-$inc overshoot (≤ background
 * concurrency) is acceptable given the 100-credit gap below the real 2,500
 * ceiling; the $inc write itself is atomic.
 */
import { createMonthlyBudget } from './monthlyBudget'

/** Hard ceiling for any Watchmode call this month (100 credits headroom under 2,500). */
const MONTHLY_CAP = 2400

/** Lower ceiling for background badge fills — reserves ~400 credits for user Details. */
const BADGE_CAP = 2000

export type WatchmodeSpendPurpose = 'details' | 'badge'

const budget = createMonthlyBudget('watchmode', MONTHLY_CAP)

export const currentMonthKey = budget.monthKey
export const getMonthlyCount = () => budget.getMonthlyCount()

/** Whether a Watchmode fetch of the given purpose is allowed under the monthly budget. */
export const canSpendWatchmode = (purpose: WatchmodeSpendPurpose) =>
  budget.canSpend(purpose === 'details' ? MONTHLY_CAP : BADGE_CAP)

export const incrementMonthlyCounter = () => budget.increment()
