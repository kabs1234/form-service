import { randomUUID } from 'node:crypto';

import { Router } from 'express';
import type { Request, Response } from 'express';

import { formInputSchema } from '../shared/form';
import type { Form, FormSummary } from '../shared/form';
import { buildFormAnalytics } from './analytics';
import { HttpStatus, sendFormNotFound, sendValidationError } from './http';
import { generateUniqueSlug } from './slug';
import {
  countResponses,
  findFormById,
  listEvents,
  listForms,
  listResponses,
  saveForm,
} from './storage';

type FormParams = { id: string };

function buildFormSummary(form: Form): FormSummary {
  return { ...form, responseCount: countResponses(form.id) };
}

function listFormSummaries(_request: Request, response: Response): void {
  response.json(listForms().map(buildFormSummary));
}

async function createForm(request: Request, response: Response): Promise<void> {
  const result = formInputSchema.safeParse(request.body);
  if (!result.success) {
    sendValidationError(response, result.error);
    return;
  }

  const now = new Date().toISOString();
  const form: Form = {
    ...result.data,
    id: randomUUID(),
    slug: generateUniqueSlug(),
    createdAt: now,
    updatedAt: now,
  };
  await saveForm(form);
  response.status(HttpStatus.Created).json(form);
}

function getForm(request: Request<FormParams>, response: Response): void {
  const form = findFormById(request.params.id);
  if (!form) {
    sendFormNotFound(response);
    return;
  }

  response.json(form);
}

async function updateForm(request: Request<FormParams>, response: Response): Promise<void> {
  const form = findFormById(request.params.id);
  if (!form) {
    sendFormNotFound(response);
    return;
  }

  const result = formInputSchema.safeParse(request.body);
  if (!result.success) {
    sendValidationError(response, result.error);
    return;
  }

  const updatedForm: Form = {
    ...result.data,
    id: form.id,
    slug: form.slug,
    createdAt: form.createdAt,
    updatedAt: new Date().toISOString(),
  };
  await saveForm(updatedForm);
  response.json(updatedForm);
}

async function regenerateSlug(request: Request<FormParams>, response: Response): Promise<void> {
  const form = findFormById(request.params.id);
  if (!form) {
    sendFormNotFound(response);
    return;
  }

  const updatedForm: Form = {
    ...form,
    slug: generateUniqueSlug(),
    updatedAt: new Date().toISOString(),
  };
  await saveForm(updatedForm);
  response.json(updatedForm);
}

function listFormResponses(request: Request<FormParams>, response: Response): void {
  const form = findFormById(request.params.id);
  if (!form) {
    sendFormNotFound(response);
    return;
  }

  response.json(listResponses(form.id));
}

async function getFormAnalytics(request: Request<FormParams>, response: Response): Promise<void> {
  const form = findFormById(request.params.id);
  if (!form) {
    sendFormNotFound(response);
    return;
  }

  const events = await listEvents(form.id);
  response.json(buildFormAnalytics(events));
}

export function createAdminRouter(): Router {
  const router = Router();

  router.get('/', listFormSummaries);
  router.post('/', createForm);
  router.get('/:id', getForm);
  router.put('/:id', updateForm);
  router.post('/:id/regenerate-slug', regenerateSlug);
  router.get('/:id/responses', listFormResponses);
  router.get('/:id/analytics', getFormAnalytics);

  return router;
}
