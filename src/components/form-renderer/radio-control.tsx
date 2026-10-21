import type { FieldControlProps } from '@/components/form-renderer/field-control-props';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { buildControlId, buildLabelId } from '@/lib/control-ids';
import { getFilledOptions, readTextValue } from '@/lib/field-control-utils';

export function RadioControl({ field, value, onChange, isInvalid }: FieldControlProps) {
  const controlId = buildControlId(field.id);
  return (
    <RadioGroup
      value={readTextValue(value)}
      onValueChange={onChange}
      aria-labelledby={buildLabelId(field.id)}
      aria-invalid={isInvalid}
    >
      {getFilledOptions(field).map((option, index) => {
        const optionId = `${controlId}-${index}`;
        return (
          <div key={optionId} className="flex items-center gap-2">
            <RadioGroupItem id={optionId} value={option} />
            <Label htmlFor={optionId} className="font-normal">
              {option}
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}
