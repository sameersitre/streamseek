import app from './app'
import * as os from 'os'
import logger from './common/logger'
import { prewarmIndex } from './apiExternal/watchmodeIndex'

// to use env variables
import './common/env'

const PORT = process.env.PORT

app.listen(PORT, () => {
  logger.info(`up and running in ${process.env.NODE_ENV || 'development'} @: ${os.hostname()} on port ${PORT} \n`)
  // Pre-warm the Watchmode reverse-source index so the first dashboard request
  // has source_ids available immediately. DB-cached data loads in ~ms.
  prewarmIndex('US')
})
