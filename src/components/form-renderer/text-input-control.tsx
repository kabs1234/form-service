import type { FieldControlProps } from '@/components/form-renderer/field-control-props';
import { Input } from '@/components/ui/input';
import { buildControlId } from '@/lib/control-ids';
import { readTextValue } from '@/lib/field-control-utils';

export function TextInputControl({ field, value, onChange, isInvalid }: FieldControlProps) {
  return (
    <Input
      id={buildControlId(field.id)}
      type={field.type}
      value={readTextValue(value)}
      placeholder={field.placeholder}
      aria-invalid={isInvalid}
      onChange={(evt) => onChange(evt.target.value)}
    />
  );
}
