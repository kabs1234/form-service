import type { FieldErrors, Resolver } from 'react-hook-form';

import type { Field } from '@shared/form';
import { buildAnswersSchema } from '@shared/response';
import type { Answers } from '@shared/response';

import { buildErrorMap } from '@/lib/validation-errors';
import type { ErrorMap } from '@/lib/validation-errors';

const VALIDATION_ERROR_TYPE = 'validation';

function buildFieldErrors(errors: ErrorMap): FieldErrors<Answers> {
  return Object.fromEntries(
    Object.entries(errors).map(([fieldId, message]) => [
      fieldId,
      { type: VALIDATION_ERROR_TYPE, message },
    ]),
  );
}

export function createAnswersResolver(fields: readonly Field[]): Resolver<Answers> {
  const schema = buildAnswersSchema(fields);

  return (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }

    return { values: {}, errors: buildFieldErrors(buildErrorMap(result.error.issues)) };
  };
}
