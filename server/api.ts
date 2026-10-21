import { Router } from 'express'
import type { Request, Response } from 'express'

const HTTP_NOT_FOUND = 404

function sendUnknownEndpoint(_request: Request, response: Response): void {
  response.status(HTTP_NOT_FOUND).json({ error: 'Not found' })
}

export function createApiRouter(): Router {
  const router = Router()

  router.use(sendUnknownEndpoint)

  return router
}
