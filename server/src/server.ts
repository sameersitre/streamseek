import app from './app'
import * as os from 'os'
import logger from './common/logger'

// to use env variables
import './common/env'

const PORT = process.env.PORT

app.listen(PORT, () => {
  logger.info(`up and running in ${process.env.NODE_ENV || 'development'} @: ${os.hostname()} on port ${PORT} \n`)
  // Per-title OTT sources are resolved lazily and cached for 3 months — no index to pre-warm.
})
