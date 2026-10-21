import type { FieldControlProps } from '@/components/form-renderer/field-control-props';
import { Textarea } from '@/components/ui/textarea';
import { buildControlId } from '@/lib/control-ids';
import { readTextValue } from '@/lib/field-control-utils';

export function TextareaControl({ field, value, onChange, isInvalid }: FieldControlProps) {
  return (
    <Textarea
      id={buildControlId(field.id)}
      value={readTextValue(value)}
      placeholder={field.placeholder}
      aria-invalid={isInvalid}
      onChange={(evt) => onChange(evt.target.value)}
    />
  );
}
