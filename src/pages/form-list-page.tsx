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
    <Button size="lg" className="px-4" asChild>
      <Link to={RoutePath.AdminFormNew}>
        <PlusIcon />
        Новая форма
      </Link>
    </Button>
  );
}

export function FormListPage() {
  const state = useApiData(listForms);

  if (state.status === 'loading') {
    return <PageMessage title="Загружаем формы…" />;
  }

  if (state.status === 'failed') {
    return <PageMessage title="Не удалось загрузить формы" description={state.message} />;
  }

  if (state.data.length === 0) {
    return (
      <PageMessage
        title="Форм пока нет"
        description="Создайте анкету, опубликуйте её и отправьте ссылку студентам."
      >
        <NewFormButton />
      </PageMessage>
    );
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:py-14">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="text-3xl leading-tight">Формы</h1>

          <NewFormButton />
        </div>

        <p className="max-w-[60ch] text-muted-foreground">
          Создавайте анкеты, делитесь ссылкой и смотрите, где студенты бросают заполнение.
        </p>
      </div>

      <ul className="divide-y rounded-sm border bg-sheet">
        {sortByRecentUpdate(state.data).map((form) => (
          <li key={form.id}>
            <FormListItem form={form} />
          </li>
        ))}
      </ul>
    </main>
  );
}
