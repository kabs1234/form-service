import { z } from './zod';

export const FIELD_TYPES = [
  'text',
  'textarea',
  'email',
  'number',
  'select',
  'radio',
  'checkbox',
  'date',
] as const;

export const CHOICE_FIELD_TYPES = ['select', 'radio', 'checkbox'] as const;

const MAX_ID_LENGTH = 64;
const MAX_LABEL_LENGTH = 200;
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_OPTIONS = 50;

export type FieldType = (typeof FIELD_TYPES)[number];
export type ChoiceFieldType = (typeof CHOICE_FIELD_TYPES)[number];

export function isChoiceFieldType(type: FieldType): type is ChoiceFieldType {
  return CHOICE_FIELD_TYPES.some((choiceType) => choiceType === type);
}

export function hasUniqueValues(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

function hasFieldsWhenPublished(form: {
  readonly published: boolean;
  readonly fields: readonly unknown[];
}): boolean {
  return !form.published || form.fields.length > 0;
}

const idSchema = z.string().min(1).max(MAX_ID_LENGTH);

const optionsSchema = z
  .array(z.string().trim().min(1, 'Вариант не может быть пустым').max(MAX_LABEL_LENGTH))
  .max(MAX_OPTIONS)
  .refine(hasUniqueValues, 'Варианты не должны повторяться');

export const fieldSchema = z
  .object({
    id: idSchema,
    type: z.enum(FIELD_TYPES),
    label: z.string().trim().min(1, 'Введите текст вопроса').max(MAX_LABEL_LENGTH),
    required: z.boolean(),
    placeholder: z.string().trim().max(MAX_LABEL_LENGTH).optional(),
    options: optionsSchema.optional(),
  })
  .refine((field) => !isChoiceFieldType(field.type) || (field.options?.length ?? 0) > 0, {
    message: 'Добавьте хотя бы один вариант',
    path: ['options'],
  });

const fieldsSchema = z
  .array(fieldSchema)
  .refine(
    (fields) => hasUniqueValues(fields.map((field) => field.id)),
    'Идентификаторы полей должны быть уникальными',
  );

const formContentSchema = z.object({
  title: z.string().trim().min(1, 'Введите название формы').max(MAX_TITLE_LENGTH),
  description: z.string().trim().max(MAX_DESCRIPTION_LENGTH).optional(),
  fields: fieldsSchema,
  published: z.boolean(),
});

export const formInputSchema = formContentSchema.refine(hasFieldsWhenPublished, {
  message: 'Добавьте хотя бы один вопрос, чтобы опубликовать форму',
  path: ['fields'],
});

export const formSchema = formContentSchema.extend({
  id: idSchema,
  slug: idSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const publicFormSchema = formSchema.pick({
  slug: true,
  title: true,
  description: true,
  fields: true,
});

export type Field = z.infer<typeof fieldSchema>;
export type FormInput = z.infer<typeof formInputSchema>;
export type Form = z.infer<typeof formSchema>;
export type FormSummary = Form & { readonly responseCount: number };
export type PublicForm = z.infer<typeof publicFormSchema>;
