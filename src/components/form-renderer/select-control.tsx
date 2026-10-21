import type { FieldControlProps } from '@/components/form-renderer/field-control-props';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { buildControlId } from '@/lib/control-ids';
import { getFilledOptions, readTextValue } from '@/lib/field-control-utils';

const DEFAULT_PLACEHOLDER = 'Выберите вариант';

export function SelectControl({ field, value, onChange, isInvalid }: FieldControlProps) {
  return (
    <Select value={readTextValue(value)} onValueChange={onChange}>
      <SelectTrigger id={buildControlId(field.id)} className="w-full" aria-invalid={isInvalid}>
        <SelectValue placeholder={field.placeholder || DEFAULT_PLACEHOLDER} />
      </SelectTrigger>
      <SelectContent>
        {getFilledOptions(field).map((option, index) => (
          <SelectItem key={`${index}-${option}`} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
