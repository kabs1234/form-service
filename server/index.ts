import express from 'express'
import type { NextFunction, Request, Response } from 'express'

import { createApiRouter, sendApiError } from './api'
import { DIST_DIRECTORY, INDEX_HTML_PATH } from './paths'
import { loadStorage } from './storage'

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

await loadStorage()

const app = express()

app.use(express.json())
app.use('/api', createApiRouter(), sendApiError)
app.use(express.static(DIST_DIRECTORY))
app.use(sendSpaIndex)

const port = readPort()

app.listen(port, (error) => {
  if (error) {
    throw error
  }
  
  console.info(`Form service running at http://localhost:${port}/admin`)
})
