import { randomUUID } from 'node:crypto';

import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';

import { eventInputSchema } from '../shared/event';
import type { EventInput } from '../shared/event';
import type { Field, Form, PublicForm } from '../shared/form';
import { buildAnswersSchema } from '../shared/response';
import type { FormResponse } from '../shared/response';
import { HttpStatus, sendFormNotFound, sendValidationError } from './http';
import { addResponse, appendEvent, listForms } from './storage';

type SlugParams = { slug: string };

function findPublishedForm(slug: string): Form | undefined {
  return listForms().find((form) => form.slug === slug && form.published);
}

function pickPublicFields({ slug, title, description, fields }: Form): PublicForm {
  return { slug, title, description, fields };
}

function buildSubmissionSchema(fields: readonly Field[]) {
  return z.object({ answers: buildAnswersSchema(fields) });
}

function hasKnownField(event: EventInput, form: Form): boolean {
  return event.type !== 'field_focus' || form.fields.some((field) => field.id === event.fieldId);
}

function getPublicForm(request: Request<SlugParams>, response: Response): void {
  const form = findPublishedForm(request.params.slug);
  if (!form) {
    sendFormNotFound(response);
    return;
  }

  response.json(pickPublicFields(form));
}

async function submitResponse(request: Request<SlugParams>, response: Response): Promise<void> {
  const form = findPublishedForm(request.params.slug);
  if (!form) {
    sendFormNotFound(response);
    return;
  }

  const result = buildSubmissionSchema(form.fields).safeParse(request.body);
  if (!result.success) {
    sendValidationError(response, result.error);
    return;
  }

  const formResponse: FormResponse = {
    id: randomUUID(),
    formId: form.id,
    answers: result.data.answers,
    submittedAt: new Date().toISOString(),
  };
  await addResponse(formResponse);
  response.status(HttpStatus.Created).json({ id: formResponse.id });
}

async function recordEvent(request: Request<SlugParams>, response: Response): Promise<void> {
  const form = findPublishedForm(request.params.slug);
  if (!form) {
    sendFormNotFound(response);
    return;
  }

  const result = eventInputSchema.safeParse(request.body);
  if (!result.success) {
    sendValidationError(response, result.error);
    return;
  }

  if (!hasKnownField(result.data, form)) {
    response.status(HttpStatus.BadRequest).json({ error: 'Field does not belong to this form' });
    return;
  }

  await appendEvent({ ...result.data, formId: form.id, ts: new Date().toISOString() });
  response.status(HttpStatus.Created).end();
}

export function createPublicRouter(): Router {
  const router = Router();

  router.get('/:slug', getPublicForm);
  router.post('/:slug/responses', submitResponse);
  router.post('/:slug/events', recordEvent);

  return router;
}
