import { PlusIcon } from 'lucide-react';
import { Link } from 'react-router';

import type { FormSummary } from '@shared/form';

import { FormListItem } from '@/components/form-list/form-list-item';
import { PageMessage } from '@/components/page-message';
import { Button } from '@/components/ui/button';
import { useApiData } from '@/hooks/use-api-data';
import { listForms } from '@/lib/api-client';
import { RoutePath } from '@/routes';

function sortByRecentUpdate(forms: readonly FormSummary[]): FormSummary[] {
  return [...forms].sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
}

function NewFormButton() {
  return (
    <Button asChild>
      <Link to={RoutePath.AdminFormNew}>
        <PlusIcon />
        New form
      </Link>
    </Button>
  );
}

export function FormListPage() {
  const state = useApiData(listForms);

  if (state.status === 'loading') {
    return <PageMessage title="Loading forms…" />;
  }

  if (state.status === 'failed') {
    return <PageMessage title="Could not load forms" description={state.message} />;
  }

  if (state.data.length === 0) {
    return (
      <PageMessage
        title="No forms yet"
        description="Create an application form, publish it, and share the link with students."
      >
        <NewFormButton />
      </PageMessage>
    );
  }

  return (
    <main className="mx-auto grid max-w-3xl gap-6 px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Forms</h1>

          <p className="text-sm text-muted-foreground">
            Build application forms, share the link, and see where students drop off.
          </p>
        </div>

        <NewFormButton />
      </div>

      <ul className="grid gap-3">
        {sortByRecentUpdate(state.data).map((form) => (
          <li key={form.id}>
            <FormListItem form={form} />
          </li>
        ))}
      </ul>
    </main>
  );
}
