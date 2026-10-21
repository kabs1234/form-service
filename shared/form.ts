import { z } from 'zod';

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

function hasUniqueValues(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

const idSchema = z.string().min(1).max(MAX_ID_LENGTH);

const optionsSchema = z
  .array(z.string().trim().min(1, 'Option cannot be empty').max(MAX_LABEL_LENGTH))
  .max(MAX_OPTIONS)
  .refine(hasUniqueValues, 'Options must be unique');

export const fieldSchema = z
  .object({
    id: idSchema,
    type: z.enum(FIELD_TYPES),
    label: z.string().trim().min(1, 'Label is required').max(MAX_LABEL_LENGTH),
    required: z.boolean(),
    placeholder: z.string().trim().max(MAX_LABEL_LENGTH).optional(),
    options: optionsSchema.optional(),
  })
  .refine((field) => !isChoiceFieldType(field.type) || (field.options?.length ?? 0) > 0, {
    message: 'Add at least one option',
    path: ['options'],
  });

const fieldsSchema = z
  .array(fieldSchema)
  .refine((fields) => hasUniqueValues(fields.map((field) => field.id)), 'Field ids must be unique');

export const formInputSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(MAX_TITLE_LENGTH),
  description: z.string().trim().max(MAX_DESCRIPTION_LENGTH).optional(),
  fields: fieldsSchema,
  published: z.boolean(),
});

export const formSchema = formInputSchema.extend({
  id: idSchema,
  slug: idSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type Field = z.infer<typeof fieldSchema>;
export type FormInput = z.infer<typeof formInputSchema>;
export type Form = z.infer<typeof formSchema>;
export type FormSummary = Form & { readonly responseCount: number };
export type PublicForm = Pick<Form, 'slug' | 'title' | 'description' | 'fields'>;
