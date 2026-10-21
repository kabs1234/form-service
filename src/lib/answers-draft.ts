import { isChoiceFieldType } from '@shared/form';
import type { Field } from '@shared/form';
import { formResponseSchema } from '@shared/response';
import type { Answers, AnswerValue } from '@shared/response';

const DRAFT_KEY_PREFIX = 'form-draft:';
const draftSchema = formResponseSchema.shape.answers;

function buildDraftKey(slug: string): string {
  return `${DRAFT_KEY_PREFIX}${slug}`;
}

function buildEmptyAnswer(field: Field): AnswerValue {
  return field.type === 'checkbox' ? [] : '';
}

function restoreCheckboxAnswer(field: Field, savedValue: AnswerValue): string[] {
  const options = field.options ?? [];
  return Array.isArray(savedValue) ? savedValue.filter((option) => options.includes(option)) : [];
}

function restoreTextAnswer(field: Field, savedValue: AnswerValue): string {
  if (Array.isArray(savedValue)) {
    return '';
  }

  const isRemovedOption = isChoiceFieldType(field.type) && !field.options?.includes(savedValue);
  return isRemovedOption ? '' : savedValue;
}

function restoreAnswer(
  field: Field,
  savedValue: AnswerValue = buildEmptyAnswer(field),
): AnswerValue {
  return field.type === 'checkbox'
    ? restoreCheckboxAnswer(field, savedValue)
    : restoreTextAnswer(field, savedValue);
}

function writeStorageSafely(write: (storage: Storage) => void): boolean {
  try {
    write(window.localStorage);
    return true;
  } catch {
    return false;
  }
}

export function readDraft(slug: string): Answers {
  try {
    const savedText = window.localStorage.getItem(buildDraftKey(slug)) ?? '{}';
    const result = draftSchema.safeParse(JSON.parse(savedText));
    return result.success ? result.data : {};
  } catch {
    return {};
  }
}

export function saveDraft(slug: string, answers: Answers): boolean {
  return writeStorageSafely((storage) =>
    storage.setItem(buildDraftKey(slug), JSON.stringify(answers)),
  );
}

export function clearDraft(slug: string): boolean {
  return writeStorageSafely((storage) => storage.removeItem(buildDraftKey(slug)));
}

export function buildInitialAnswers(fields: readonly Field[], draft: Answers): Answers {
  return Object.fromEntries(
    fields.map((field) => [field.id, restoreAnswer(field, draft[field.id])]),
  );
}
