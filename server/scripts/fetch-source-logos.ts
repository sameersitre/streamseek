/**
 * Regenerate the Watchmode source-logo snapshot (provider id → logo URL).
 *
 * The runtime catalogue (`getSourceLogos` in src/apiExternal/apiExternal.ts) auto-persists on
 * its first successful live fetch, but that only survives within a deploy's filesystem. Run
 * this with a HEALTHY (non-over-quota) Watchmode key and COMMIT the resulting
 * `server/data/sourceLogos.snapshot.json` so production is permanently immune to the key's
 * plan quota — even a fully dead key then still serves logos from the committed snapshot.
 *
 * Usage:  cd server && npx ts-node scripts/fetch-source-logos.ts
 */
import '../src/common/env' // loads .env (dotenv.config())
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import type { WatchmodeSourceInfo } from '../src/types'

const SNAPSHOT_PATH = path.resolve(process.cwd(), 'data', 'sourceLogos.snapshot.json')

const main = async (): Promise<void> => {
  const { WATCHMODE_API_URL, WATCHMODE_API_KEY } = process.env
  if (!WATCHMODE_API_URL || !WATCHMODE_API_KEY) {
    throw new Error('WATCHMODE_API_URL / WATCHMODE_API_KEY must be set (check server/.env)')
  }

  const res = await axios.get(`${WATCHMODE_API_URL}/sources/?apiKey=${WATCHMODE_API_KEY}`)
  const map: Record<number, string> = {}
  for (const s of res.data as WatchmodeSourceInfo[]) map[s.id] = s.logo_100px

  if (Object.keys(map).length === 0) {
    throw new Error('Watchmode returned 0 sources — refusing to overwrite snapshot with an empty map')
  }

  fs.mkdirSync(path.dirname(SNAPSHOT_PATH), { recursive: true })
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(map, null, 2))
  // eslint-disable-next-line no-console
  console.log(`Wrote ${Object.keys(map).length} providers → ${SNAPSHOT_PATH}`)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(`Failed to regenerate source-logo snapshot: ${(err as Error).message}`)
  process.exit(1)
})
