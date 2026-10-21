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
    <main className="mx-auto grid max-w-3xl gap-6 px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Формы</h1>

          <p className="text-sm text-muted-foreground">
            Создавайте анкеты, делитесь ссылкой и смотрите, где студенты бросают заполнение.
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
