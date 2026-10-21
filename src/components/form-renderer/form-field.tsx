import { ErrorText } from '@/components/error-text';
import { FieldControl } from '@/components/form-renderer/field-control';
import type { FieldControlProps } from '@/components/form-renderer/field-control-props';
import { Label } from '@/components/ui/label';
import { buildControlId, buildLabelId } from '@/lib/control-ids';

type FormFieldProps = Omit<FieldControlProps, 'isInvalid'> & {
  readonly error?: string;
};

const UNTITLED_QUESTION = 'Вопрос без названия';

export function FormField({ field, value, onChange, error }: FormFieldProps) {
  return (
    <div className="grid gap-2">
      <Label id={buildLabelId(field.id)} htmlFor={buildControlId(field.id)}>
        {field.label || UNTITLED_QUESTION}

        {field.required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>

      <FieldControl field={field} value={value} onChange={onChange} isInvalid={Boolean(error)} />

      <ErrorText message={error} />
    </div>
  );
}
