import { ArrowDownIcon, ArrowUpIcon, Trash2Icon } from 'lucide-react';

import { FIELD_TYPES, isChoiceFieldType } from '@shared/form';
import type { Field } from '@shared/form';

import { OptionsEditor } from '@/components/builder/options-editor';
import { ErrorText } from '@/components/error-text';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  canHavePlaceholder,
  changeFieldType,
  FIELD_TYPE_LABELS,
  isFieldType,
} from '@/lib/form-draft';
import { FIELD_TYPE_ICONS } from '@/lib/field-type-icons';
import type { ErrorMap } from '@/lib/validation-errors';

type FieldEditorProps = {
  readonly field: Field;
  readonly position: number;
  readonly isFirst: boolean;
  readonly isLast: boolean;
  readonly isNew: boolean;
  readonly errors: ErrorMap;
  readonly onChange: (field: Field) => void;
  readonly onMoveUp: () => void;
  readonly onMoveDown: () => void;
  readonly onDelete: () => void;
};

export function FieldEditor({
  field,
  position,
  isFirst,
  isLast,
  isNew,
  errors,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: FieldEditorProps) {
  const editorId = `editor-${field.id}`;

  function handleTypeChange(value: string): void {
    if (isFieldType(value)) {
      onChange(changeFieldType(field, value));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question {position}</CardTitle>

        <CardAction className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Move question up"
            disabled={isFirst}
            onClick={onMoveUp}
          >
            <ArrowUpIcon />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Move question down"
            disabled={isLast}
            onClick={onMoveDown}
          >
            <ArrowDownIcon />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-destructive"
            aria-label="Delete question"
            onClick={onDelete}
          >
            <Trash2Icon />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
          <div className="grid gap-2">
            <Label htmlFor={`${editorId}-label`}>Question</Label>

            <Input
              id={`${editorId}-label`}
              autoFocus={isNew}
              value={field.label}
              placeholder="e.g. Which university do you study at?"
              aria-invalid={Boolean(errors.label)}
              onChange={(evt) => onChange({ ...field, label: evt.target.value })}
            />

            <ErrorText message={errors.label} />
          </div>

          <div className="grid content-start gap-2">
            <Label htmlFor={`${editorId}-type`}>Answer type</Label>

            <Select value={field.type} onValueChange={handleTypeChange}>
              <SelectTrigger id={`${editorId}-type`} className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {FIELD_TYPES.map((type) => {
                  const Icon = FIELD_TYPE_ICONS[type];

                  return (
                    <SelectItem key={type} value={type}>
                      <Icon />
                      {FIELD_TYPE_LABELS[type]}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {canHavePlaceholder(field.type) && (
          <div className="grid gap-2">
            <Label htmlFor={`${editorId}-placeholder`}>Hint inside the field (optional)</Label>

            <Input
              id={`${editorId}-placeholder`}
              value={field.placeholder ?? ''}
              placeholder="e.g. Kazakh National University"
              onChange={(evt) => onChange({ ...field, placeholder: evt.target.value })}
            />
          </div>
        )}

        {isChoiceFieldType(field.type) && (
          <OptionsEditor
            editorId={editorId}
            options={field.options ?? []}
            errors={errors}
            onChange={(options) => onChange({ ...field, options })}
          />
        )}

        <div className="flex items-center gap-2">
          <Switch
            id={`${editorId}-required`}
            checked={field.required}
            onCheckedChange={(isRequired) => onChange({ ...field, required: isRequired })}
          />

          <Label htmlFor={`${editorId}-required`}>Required</Label>
        </div>
      </CardContent>
    </Card>
  );
}
