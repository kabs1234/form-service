import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';

import { createAdminRouter } from './admin-routes';
import { HttpStatus } from './http';
import { createPublicRouter } from './public-routes';

type ClientError = Error & { status: number };

const DEFAULT_CLIENT_ERROR_MESSAGE = 'Некорректный запрос';
const CLIENT_ERROR_MESSAGES: Readonly<Partial<Record<number, string>>> = {
  [HttpStatus.BadRequest]: 'Тело запроса не является корректным JSON',
  [HttpStatus.PayloadTooLarge]: 'Слишком большой запрос',
  [HttpStatus.UnsupportedMediaType]: 'Неподдерживаемая кодировка запроса',
};

function isClientError(error: unknown): error is ClientError {
  return (
    error instanceof Error &&
    'status' in error &&
    typeof error.status === 'number' &&
    error.status >= HttpStatus.BadRequest &&
    error.status < HttpStatus.InternalServerError
  );
}

function getClientErrorMessage(status: number): string {
  return CLIENT_ERROR_MESSAGES[status] ?? DEFAULT_CLIENT_ERROR_MESSAGE;
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
    response.status(error.status).json({ error: getClientErrorMessage(error.status) });
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
