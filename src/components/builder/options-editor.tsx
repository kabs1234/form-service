import { PlusIcon, XIcon } from 'lucide-react';

import { ErrorText } from '@/components/error-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { removeItemAt, replaceItemAt } from '@/lib/array';
import { selectNestedErrors } from '@/lib/validation-errors';
import type { ErrorMap } from '@/lib/validation-errors';

type OptionsEditorProps = {
  readonly editorId: string;
  readonly options: readonly string[];
  readonly errors: ErrorMap;
  readonly onChange: (options: string[]) => void;
};

export function OptionsEditor({ editorId, options, errors, onChange }: OptionsEditorProps) {
  const optionErrors = selectNestedErrors(errors, 'options');
  const canRemoveOption = options.length > 1;

  function addOption(): void {
    onChange([...options, `Вариант ${options.length + 1}`]);
  }

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-2 text-sm font-medium">Варианты ответа</legend>

      {options.map((option, index) => {
        const position = index + 1;
        const error = optionErrors[String(index)];

        return (
          <div key={`${editorId}-option-${index}`} className="grid gap-1">
            <div className="flex gap-2">
              <Input
                aria-label={`Вариант ${position}`}
                value={option}
                aria-invalid={Boolean(error)}
                onChange={(evt) =>
                  onChange(replaceItemAt(options, { index, item: evt.target.value }))
                }
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Удалить вариант ${position}`}
                disabled={!canRemoveOption}
                onClick={() => onChange(removeItemAt(options, index))}
              >
                <XIcon />
              </Button>
            </div>

            <ErrorText message={error} />
          </div>
        );
      })}

      <ErrorText message={errors.options} />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="justify-self-start"
        onClick={addOption}
      >
        <PlusIcon />
        Добавить вариант
      </Button>
    </fieldset>
  );
}
