import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import type { PublicForm as PublicFormDefinition } from '@shared/form';
import type { Answers } from '@shared/response';

import { ErrorText } from '@/components/error-text';
import { FormField } from '@/components/form-renderer/form-field';
import { FormHeading } from '@/components/form-renderer/form-heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDraftAutosave } from '@/hooks/use-draft-autosave';
import { getErrorMessage, submitFormResponse } from '@/lib/api-client';
import { buildInitialAnswers, clearDraft, readDraft } from '@/lib/answers-draft';
import { createAnswersResolver } from '@/lib/answers-resolver';

type PublicFormProps = {
  readonly form: PublicFormDefinition;
  readonly onSubmitted: () => void;
};

export function PublicForm({ form, onSubmitted }: PublicFormProps) {
  const [initialAnswers] = useState(() => buildInitialAnswers(form.fields, readDraft(form.slug)));
  const resolver = useMemo(() => createAnswersResolver(form.fields), [form.fields]);
  const { control, handleSubmit, setError, subscribe, formState } = useForm<Answers>({
    defaultValues: initialAnswers,
    resolver,
  });

  useDraftAutosave(form.slug, subscribe);

  async function submitAnswers(answers: Answers): Promise<void> {
    try {
      await submitFormResponse(form.slug, answers);
      clearDraft(form.slug);
      onSubmitted();
    } catch (error: unknown) {
      setError('root.server', { message: getErrorMessage(error) });
    }
  }

  return (
    <Card>
      <CardContent>
        <form noValidate className="grid gap-6" onSubmit={handleSubmit(submitAnswers)}>
          <FormHeading title={form.title} description={form.description} />

          {form.fields.map((field) => (
            <Controller
              key={field.id}
              name={field.id}
              control={control}
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <FormField field={field} value={value} onChange={onChange} error={error?.message} />
              )}
            />
          ))}

          <div className="grid gap-2">
            <ErrorText message={formState.errors.root?.server?.message} />

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Button type="submit" disabled={formState.isSubmitting}>
                {formState.isSubmitting ? 'Sending…' : 'Submit'}
              </Button>

              <p className="text-sm text-muted-foreground">
                Your answers are saved in this browser until you submit.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
