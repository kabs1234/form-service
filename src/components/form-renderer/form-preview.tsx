import { useState } from 'react';

import type { FormInput } from '@shared/form';
import type { Answers, AnswerValue } from '@shared/response';

import { FormField } from '@/components/form-renderer/form-field';
import { Button } from '@/components/ui/button';

type FormPreviewProps = {
  readonly form: FormInput;
};

const UNTITLED_FORM = 'Untitled form';

export function FormPreview({ form }: FormPreviewProps) {
  const [answers, setAnswers] = useState<Answers>({});

  function handleAnswerChange(fieldId: string, value: AnswerValue): void {
    setAnswers((current) => ({ ...current, [fieldId]: value }));
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h2 className="text-xl font-semibold">{form.title || UNTITLED_FORM}</h2>
        {form.description && (
          <p className="whitespace-pre-line text-muted-foreground">{form.description}</p>
        )}
      </div>
      {form.fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add a question to see it here.</p>
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
        Submit
      </Button>
    </div>
  );
}
