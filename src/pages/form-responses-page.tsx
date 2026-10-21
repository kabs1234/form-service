import { useCallback } from 'react';
import { ArrowLeftIcon, ChartColumnIcon, PencilIcon } from 'lucide-react';
import { Link, useParams } from 'react-router';

import type { Form } from '@shared/form';
import type { FormResponse } from '@shared/response';

import { CopyLinkButton } from '@/components/copy-link-button';
import { PageMessage } from '@/components/page-message';
import { ResponsesTable } from '@/components/responses/responses-table';
import { Button } from '@/components/ui/button';
import { useApiData } from '@/hooks/use-api-data';
import { fetchForm, isMissingResourceError, listFormResponses } from '@/lib/api-client';
import { buildFormAnalyticsPath, buildFormEditPath, buildPublicFormUrl, RoutePath } from '@/routes';

type FormWithResponses = {
  readonly form: Form;
  readonly responses: readonly FormResponse[];
};

type FormResponsesProps = {
  readonly formId: string;
};

type ResponsesHeaderProps = {
  readonly form: Form;
  readonly responseCount: number;
};

type EmptyResponsesProps = {
  readonly form: Form;
};

async function loadFormWithResponses(formId: string): Promise<FormWithResponses> {
  const [form, responses] = await Promise.all([fetchForm(formId), listFormResponses(formId)]);
  return { form, responses };
}

function ResponsesHeader({ form, responseCount }: ResponsesHeaderProps) {
  return (
    <div className="grid gap-4">
      <Button variant="ghost" size="sm" className="justify-self-start" asChild>
        <Link to={RoutePath.AdminFormList}>
          <ArrowLeftIcon />
          Forms
        </Link>
      </Button>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">{form.title}</h1>

          <p className="text-sm text-muted-foreground">Responses: {responseCount}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={buildFormEditPath(form.id)}>
              <PencilIcon />
              Edit
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link to={buildFormAnalyticsPath(form.id)}>
              <ChartColumnIcon />
              Analytics
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyResponses({ form }: EmptyResponsesProps) {
  return (
    <div className="grid justify-items-center gap-3 rounded-lg border border-dashed px-4 py-16 text-center">
      <p className="font-medium">No responses yet</p>

      {form.published ? (
        <>
          <p className="text-sm text-muted-foreground">
            Share the public link with students. Submissions will appear here.
          </p>

          <CopyLinkButton url={buildPublicFormUrl(form.slug)} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          This form is a draft. Publish it in the builder to get a shareable link.
        </p>
      )}
    </div>
  );
}

function FormResponses({ formId }: FormResponsesProps) {
  const load = useCallback(() => loadFormWithResponses(formId), [formId]);
  const state = useApiData(load);

  if (state.status === 'loading') {
    return <PageMessage title="Loading responses…" />;
  }

  if (state.status === 'failed') {
    return (
      <PageMessage
        title={isMissingResourceError(state.error) ? 'Form not found' : 'Could not load responses'}
        description={state.message}
      >
        <Button variant="outline" asChild>
          <Link to={RoutePath.AdminFormList}>Back to forms</Link>
        </Button>
      </PageMessage>
    );
  }

  const { form, responses } = state.data;

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-10">
      <ResponsesHeader form={form} responseCount={responses.length} />

      {responses.length === 0 ? (
        <EmptyResponses form={form} />
      ) : (
        <ResponsesTable fields={form.fields} responses={responses} />
      )}
    </main>
  );
}

export function FormResponsesPage() {
  const { id = '' } = useParams();

  return <FormResponses key={id} formId={id} />;
}
