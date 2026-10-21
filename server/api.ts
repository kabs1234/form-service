import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';

import { createAdminRouter } from './admin-routes';
import { HttpStatus } from './http';
import { createPublicRouter } from './public-routes';

type ClientError = Error & { status: number };

function isClientError(error: unknown): error is ClientError {
  return (
    error instanceof Error &&
    'status' in error &&
    typeof error.status === 'number' &&
    error.status >= HttpStatus.BadRequest &&
    error.status < HttpStatus.InternalServerError
  );
}

function sendUnknownEndpoint(_request: Request, response: Response): void {
  response.status(HttpStatus.NotFound).json({ error: 'Не найдено' });
}

export function sendApiError(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void {
  if (isClientError(error)) {
    response.status(error.status).json({ error: error.message });
    return;
  }

  console.error(error);
  response.status(HttpStatus.InternalServerError).json({ error: 'Внутренняя ошибка сервера' });
}

export function createApiRouter(): Router {
  const router = Router();

  router.use('/forms', createAdminRouter());
  router.use('/public', createPublicRouter());
  router.use(sendUnknownEndpoint);

  return router;
}
