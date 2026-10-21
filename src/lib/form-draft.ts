import { FIELD_TYPES, isChoiceFieldType } from '@shared/form';
import type { Field, FieldType, Form, FormInput } from '@shared/form';

export type FormDetails = Pick<FormInput, 'title' | 'description'>;

const FIELD_ID_BYTES = 6;
const DEFAULT_OPTIONS = ['Option 1', 'Option 2'];
const PLACEHOLDER_FIELD_TYPES: readonly FieldType[] = [
  'text',
  'textarea',
  'email',
  'number',
  'select',
];

export const FIELD_TYPE_LABELS: Readonly<Record<FieldType, string>> = {
  text: 'Short text',
  textarea: 'Long text',
  email: 'Email',
  number: 'Number',
  select: 'Dropdown',
  radio: 'Single choice',
  checkbox: 'Multiple choice',
  date: 'Date',
};

export const EMPTY_FORM_INPUT: FormInput = {
  title: '',
  description: '',
  fields: [],
  published: false,
};

function generateFieldId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(FIELD_ID_BYTES));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function isFieldType(value: string): value is FieldType {
  return FIELD_TYPES.some((type) => type === value);
}

export function canHavePlaceholder(type: FieldType): boolean {
  return PLACEHOLDER_FIELD_TYPES.includes(type);
}

export function createField(type: FieldType): Field {
  const field: Field = { id: generateFieldId(), type, label: '', required: false };
  return isChoiceFieldType(type) ? { ...field, options: DEFAULT_OPTIONS } : field;
}

export function changeFieldType(field: Field, type: FieldType): Field {
  const { placeholder, options, ...base } = field;
  return {
    ...base,
    type,
    ...(canHavePlaceholder(type) && { placeholder }),
    ...(isChoiceFieldType(type) && { options: options ?? DEFAULT_OPTIONS }),
  };
}

export function extractFormInput(form: Form): FormInput {
  return {
    title: form.title,
    description: form.description ?? '',
    fields: form.fields,
    published: form.published,
  };
}

export function isSameFormInput(first: FormInput, second: FormInput): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}
