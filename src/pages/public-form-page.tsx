import { useCallback, useState } from 'react';
import { useParams } from 'react-router';

import type { PublicForm as PublicFormDefinition } from '@shared/form';

import { PageMessage } from '@/components/page-message';
import { PublicForm } from '@/components/public-form/public-form';
import { useApiData } from '@/hooks/use-api-data';
import { fetchPublicForm, isMissingResourceError } from '@/lib/api-client';

type LoadedPublicFormProps = {
  readonly form: PublicFormDefinition;
};

type PublicFormLoaderProps = {
  readonly slug: string;
};

function LoadedPublicForm({ form }: LoadedPublicFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isSubmitted) {
    return (
      <PageMessage
        title="Thank you! Your answers were sent"
        description={`We received your response to “${form.title}”. You can close this page.`}
      />
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <PublicForm form={form} onSubmitted={() => setIsSubmitted(true)} />
    </main>
  );
}

function PublicFormLoader({ slug }: PublicFormLoaderProps) {
  const loadForm = useCallback(() => fetchPublicForm(slug), [slug]);
  const state = useApiData(loadForm);

  if (state.status === 'loading') {
    return <PageMessage title="Loading form…" />;
  }

  if (state.status === 'failed') {
    return isMissingResourceError(state.error) ? (
      <PageMessage
        title="This form isn’t available"
        description="The link may be mistyped, or the form is no longer accepting answers. Check the link with whoever shared it."
      />
    ) : (
      <PageMessage title="Could not load the form" description={state.message} />
    );
  }

  return <LoadedPublicForm form={state.data} />;
}

export function PublicFormPage() {
  const { slug = '' } = useParams();

  return <PublicFormLoader key={slug} slug={slug} />;
}
