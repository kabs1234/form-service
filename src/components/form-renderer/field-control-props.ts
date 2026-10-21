import type { Field } from '@shared/form';
import type { AnswerValue } from '@shared/response';

export type FieldControlProps = {
  readonly field: Field;
  readonly value?: AnswerValue;
  readonly onChange: (value: AnswerValue) => void;
  readonly isInvalid?: boolean;
};
