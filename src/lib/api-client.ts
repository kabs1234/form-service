import { z } from 'zod';

import { formSchema } from '@shared/form';
import type { Form, FormInput, FormSummary } from '@shared/form';

type JsonMethod = 'POST' | 'PUT';

type RequestOptions<TData> = {
  readonly schema: z.ZodType<TData>;
  readonly init?: RequestInit;
};

const formSummarySchema = formSchema.extend({ responseCount: z.number().int() });

const errorBodySchema = z.object({
  error: z.string(),
  issues: z.array(z.object({ message: z.string() })).optional(),
});

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function hasJsonBody(response: Response): boolean {
  return response.headers.get('Content-Type')?.includes('application/json') ?? false;
}

async function readErrorMessage(response: Response): Promise<string> {
  const fallbackMessage = `Request failed with status ${response.status}`;
  if (!hasJsonBody(response)) {
    return fallbackMessage;
  }

  const result = errorBodySchema.safeParse(await response.json());
  if (!result.success) {
    return fallbackMessage;
  }

  const firstIssue = result.data.issues?.[0];
  return firstIssue ? `${result.data.error}: ${firstIssue.message}` : result.data.error;
}

async function requestJson<TData>(
  path: string,
  { schema, init = {} }: RequestOptions<TData>,
): Promise<TData> {
  const response = await fetch(path, init);
  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  const data: unknown = await response.json();
  return schema.parse(data);
}

function buildJsonInit(method: JsonMethod, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function buildFormPath(id: string): string {
  return `/api/forms/${encodeURIComponent(id)}`;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

export function isMissingResourceError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export function listForms(): Promise<FormSummary[]> {
  return requestJson('/api/forms', { schema: z.array(formSummarySchema) });
}

export function fetchForm(id: string): Promise<Form> {
  return requestJson(buildFormPath(id), { schema: formSchema });
}

export function createForm(input: FormInput): Promise<Form> {
  return requestJson('/api/forms', { schema: formSchema, init: buildJsonInit('POST', input) });
}

export function updateForm(id: string, input: FormInput): Promise<Form> {
  return requestJson(buildFormPath(id), { schema: formSchema, init: buildJsonInit('PUT', input) });
}

export function regenerateFormSlug(id: string): Promise<Form> {
  return requestJson(`${buildFormPath(id)}/regenerate-slug`, {
    schema: formSchema,
    init: { method: 'POST' },
  });
}
