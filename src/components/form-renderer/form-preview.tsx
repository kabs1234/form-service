import { useState } from 'react';

import type { FormInput } from '@shared/form';
import type { Answers, AnswerValue } from '@shared/response';

import { FormField } from '@/components/form-renderer/form-field';
import { FormHeading } from '@/components/form-renderer/form-heading';
import { Button } from '@/components/ui/button';

type FormPreviewProps = {
  readonly form: FormInput;
};

export function FormPreview({ form }: FormPreviewProps) {
  const [answers, setAnswers] = useState<Answers>({});

  function handleAnswerChange(fieldId: string, value: AnswerValue): void {
    setAnswers((current) => ({ ...current, [fieldId]: value }));
  }

  return (
    <div className="sheet grid gap-8">
      <FormHeading title={form.title} description={form.description} />
      {form.fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">Добавьте вопрос, и он появится здесь.</p>
      ) : (
        form.fields.map((field) => (
          <FormField
            key={field.id}
            field={field}
            value={answers[field.id]}
            onChange={(value) => handleAnswerChange(field.id, value)}
          />
        ))
      )}
      <Button type="button" className="justify-self-start" disabled>
        Отправить
      </Button>
    </div>
  );
}
