import { FIELD_TYPES } from '@shared/form';
import type { FieldType } from '@shared/form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FIELD_TYPE_LABELS } from '@/lib/form-draft';
import { FIELD_TYPE_ICONS } from '@/lib/field-type-icons';

type AddFieldPanelProps = {
  readonly onAdd: (type: FieldType) => void;
};

export function AddFieldPanel({ onAdd }: AddFieldPanelProps) {
  return (
    <Card className="bg-transparent ring-0 outline-1 -outline-offset-1 outline-input outline-dashed">
      <CardHeader>
        <CardTitle>Добавить вопрос</CardTitle>

        <CardDescription>Выберите, какой ответ вы ждёте от студентов.</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-2">
        {FIELD_TYPES.map((type) => {
          const Icon = FIELD_TYPE_ICONS[type];

          return (
            <Button
              key={type}
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => onAdd(type)}
            >
              <Icon />
              {FIELD_TYPE_LABELS[type]}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
