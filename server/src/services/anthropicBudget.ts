/**
 * Anthropic monthly call budget — a configured `monthlyBudget` instance.
 *
 * Character-bio generation costs ~$0.003/call (Haiku 4.5, ~1.5k in / ~0.3k out
 * tokens). Results are cached permanently in `character_bios`, so spend only
 * occurs on first-ever views — but a runaway client or scrape could still burn
 * money, so NEW generations are refused at the cap. Cached bios keep serving.
 */
import { createMonthlyBudget } from './monthlyBudget'

/** Max LLM generations per month (~$10 at Haiku 4.5 prices). Override via env. */
const MONTHLY_CAP = Number(process.env.ANTHROPIC_MONTHLY_CAP ?? 3000)

const budget = createMonthlyBudget('anthropic', MONTHLY_CAP)

export const anthropicMonthKey = budget.monthKey
export const getAnthropicMonthlyCount = () => budget.getMonthlyCount()
export const canSpendAnthropic = () => budget.canSpend()
export const incrementAnthropicCounter = () => budget.increment()
