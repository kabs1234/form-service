import express from 'express'
import type { NextFunction, Request, Response } from 'express'

import { createApiRouter } from './api'
import { DIST_DIR, INDEX_HTML_PATH } from './paths'

const DEFAULT_PORT = 3000

function readPort(): number {
  return Number(process.env.PORT) || DEFAULT_PORT
}

function sendSpaIndex(request: Request, response: Response, next: NextFunction): void {
  if (request.method !== 'GET') {
    next()
    return
  }
  response.sendFile(INDEX_HTML_PATH)
}

const app = express()

app.use(express.json())
app.use('/api', createApiRouter())
app.use(express.static(DIST_DIR))
app.use(sendSpaIndex)

const port = readPort()

app.listen(port, (error) => {
  if (error) {
    throw error
  }
  
  console.info(`Form service running at http://localhost:${port}/admin`)
})
