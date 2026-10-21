import type { FieldControlProps } from '@/components/form-renderer/field-control-props';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { buildControlId, buildLabelId } from '@/lib/control-ids';
import { getFilledOptions, readSelectedOptions, toggleOption } from '@/lib/field-control-utils';

export function CheckboxControl({ field, value, onChange, isInvalid }: FieldControlProps) {
  const controlId = buildControlId(field.id);
  const selected = readSelectedOptions(value);

  return (
    <div role="group" aria-labelledby={buildLabelId(field.id)} className="grid gap-3">
      {getFilledOptions(field).map((option, index) => {
        const optionId = `${controlId}-${index}`;

        return (
          <div key={optionId} className="flex items-center gap-2">
            <Checkbox
              id={optionId}
              checked={selected.includes(option)}
              aria-invalid={isInvalid}
              onCheckedChange={() => onChange(toggleOption(selected, option))}
            />

            <Label htmlFor={optionId} className="font-normal">
              {option}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
