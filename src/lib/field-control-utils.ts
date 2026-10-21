import type { Field } from '@shared/form';
import type { AnswerValue } from '@shared/response';

export function readTextValue(value: AnswerValue = ''): string {
  return typeof value === 'string' ? value : '';
}

export function readSelectedOptions(value: AnswerValue = []): readonly string[] {
  return Array.isArray(value) ? value : [];
}

export function toggleOption(selected: readonly string[], option: string): string[] {
  return selected.includes(option)
    ? selected.filter((current) => current !== option)
    : [...selected, option];
}

export function getFilledOptions(field: Field): readonly string[] {
  return (field.options ?? []).filter((option) => option.trim() !== '');
}
