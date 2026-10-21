import type { Field } from '@shared/form';
import type { AnswerValue, FormResponse } from '@shared/response';

export const DELETED_FIELD_LABEL = '(deleted field)';
const EMPTY_ANSWER = '—';

export type ResponseColumn = {
  readonly fieldId: string;
  readonly label: string;
  readonly isDeleted: boolean;
};

function buildCurrentColumn(field: Field): ResponseColumn {
  return { fieldId: field.id, label: field.label, isDeleted: false };
}

function buildDeletedColumn(fieldId: string): ResponseColumn {
  return { fieldId, label: DELETED_FIELD_LABEL, isDeleted: true };
}

function collectAnsweredFieldIds(responses: readonly FormResponse[]): Set<string> {
  return new Set(responses.flatMap((response) => Object.keys(response.answers)));
}

export function buildResponseColumns(
  fields: readonly Field[],
  responses: readonly FormResponse[],
): ResponseColumn[] {
  const currentFieldIds = new Set(fields.map((field) => field.id));
  const deletedFieldIds = [...collectAnsweredFieldIds(responses)].filter(
    (fieldId) => !currentFieldIds.has(fieldId),
  );

  return [...fields.map(buildCurrentColumn), ...deletedFieldIds.map(buildDeletedColumn)];
}

export function sortByRecentSubmission(responses: readonly FormResponse[]): FormResponse[] {
  return [...responses].sort((first, second) =>
    second.submittedAt.localeCompare(first.submittedAt),
  );
}

function joinAnswerValue(value: AnswerValue): string {
  return Array.isArray(value) ? value.join(', ') : value;
}

export function formatAnswer(response: FormResponse, fieldId: string): string {
  const text = Object.hasOwn(response.answers, fieldId)
    ? joinAnswerValue(response.answers[fieldId])
    : '';
  return text || EMPTY_ANSWER;
}

export function formatSubmittedAt(submittedAt: string): string {
  return new Date(submittedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
