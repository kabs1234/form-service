import { z } from 'zod';

import type { Field, FieldType } from './form';

const MAX_ANSWER_LENGTH = 5000;
const REQUIRED_MESSAGE = 'This field is required';
const NUMBER_PATTERN = /^-?\d+(\.\d+)?$/;

const answerValueSchema = z.union([z.string(), z.array(z.string())]);

export const formResponseSchema = z.object({
  id: z.string().min(1),
  formId: z.string().min(1),
  answers: z.record(z.string(), answerValueSchema),
  submittedAt: z.iso.datetime(),
});

export type AnswerValue = z.infer<typeof answerValueSchema>;
export type Answers = Record<string, AnswerValue>;
export type FormResponse = z.infer<typeof formResponseSchema>;

type TextFieldType = Exclude<FieldType, 'checkbox'>;

type AnswerRule = {
  readonly isValid: (value: string) => boolean;
  readonly message: string;
};

const ANY_TEXT_RULE: AnswerRule = { isValid: () => true, message: 'Invalid answer' };

function getAnswerRule(type: TextFieldType, options: readonly string[]): AnswerRule {
  switch (type) {
    case 'text':
    case 'textarea':
      return ANY_TEXT_RULE;
    case 'email':
      return { isValid: (value) => z.regexes.email.test(value), message: 'Enter a valid email' };
    case 'number':
      return { isValid: (value) => NUMBER_PATTERN.test(value), message: 'Enter a number' };
    case 'date':
      return { isValid: (value) => z.regexes.date.test(value), message: 'Enter a valid date' };
    case 'select':
    case 'radio':
      return { isValid: (value) => options.includes(value), message: 'Choose one of the options' };
  }
}

function createEmptyOrValidCheck(rule: AnswerRule): (value: string) => boolean {
  return (value) => value === '' || rule.isValid(value);
}

function buildTextAnswerSchema(field: Field, rule: AnswerRule): z.ZodType<string> {
  const text = z.string(REQUIRED_MESSAGE).trim().max(MAX_ANSWER_LENGTH, 'Answer is too long');
  const presentText = field.required ? text.min(1, REQUIRED_MESSAGE) : text;
  const checkedText = presentText.refine(createEmptyOrValidCheck(rule), rule.message);
  return field.required ? checkedText : checkedText.default('');
}

function buildCheckboxAnswerSchema(field: Field): z.ZodType<string[]> {
  const selection = z.array(
    z.enum(field.options ?? [], 'Choose from the options'),
    REQUIRED_MESSAGE,
  );
  return field.required ? selection.min(1, REQUIRED_MESSAGE) : selection.default([]);
}

function buildAnswerSchema(field: Field): z.ZodType<AnswerValue> {
  const { type } = field;
  if (type === 'checkbox') {
    return buildCheckboxAnswerSchema(field);
  }
  return buildTextAnswerSchema(field, getAnswerRule(type, field.options ?? []));
}

export function buildAnswersSchema(fields: readonly Field[]): z.ZodType<Answers> {
  const shape = Object.fromEntries(fields.map((field) => [field.id, buildAnswerSchema(field)]));
  return z.strictObject(shape);
}
