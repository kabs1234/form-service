import type { Response } from 'express';
import type { ZodError } from 'zod';

export const HttpStatus = {
  Ok: 200,
  Created: 201,
  BadRequest: 400,
  NotFound: 404,
  InternalServerError: 500,
} as const;

export function sendValidationError(response: Response, error: ZodError): void {
  response
    .status(HttpStatus.BadRequest)
    .json({ error: 'Некорректные данные', issues: error.issues });
}

export function sendFormNotFound(response: Response): void {
  response.status(HttpStatus.NotFound).json({ error: 'Форма не найдена' });
}
