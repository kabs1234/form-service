import { useCallback } from 'react';
import { InboxIcon, PencilIcon } from 'lucide-react';
import { Link, useParams } from 'react-router';

import type { FormAnalytics } from '@shared/analytics';
import type { Form } from '@shared/form';

import { ConversionCard, DropOffCard, FunnelCard } from '@/components/analytics/analytics-cards';
import { CopyLinkButton } from '@/components/copy-link-button';
import { FormPageHeader } from '@/components/form-page-header';
import { PageMessage } from '@/components/page-message';
import { Button } from '@/components/ui/button';
import { useApiData } from '@/hooks/use-api-data';
import { fetchForm, fetchFormAnalytics, isMissingResourceError } from '@/lib/api-client';
import { buildFormEditPath, buildFormResponsesPath, buildPublicFormUrl, RoutePath } from '@/routes';

type FormWithAnalytics = {
  readonly form: Form;
  readonly analytics: FormAnalytics;
};

type FormAnalyticsProps = {
  readonly formId: string;
};

type FormProps = {
  readonly form: Form;
};

async function loadFormWithAnalytics(formId: string): Promise<FormWithAnalytics> {
  const [form, analytics] = await Promise.all([fetchForm(formId), fetchFormAnalytics(formId)]);
  return { form, analytics };
}

function AnalyticsHeader({ form }: FormProps) {
  return (
    <FormPageHeader title={form.title} summary="Аналитика">
      <Button variant="outline" size="sm" asChild>
        <Link to={buildFormEditPath(form.id)}>
          <PencilIcon />
          Редактировать
        </Link>
      </Button>

      <Button variant="outline" size="sm" asChild>
        <Link to={buildFormResponsesPath(form.id)}>
          <InboxIcon />
          Ответы
        </Link>
      </Button>
    </FormPageHeader>
  );
}

function EmptyAnalytics({ form }: FormProps) {
  return (
    <div className="grid justify-items-center gap-3 rounded-lg border border-dashed px-4 py-16 text-center">
      <p className="font-medium">Посещений пока нет</p>

      {form.published ? (
        <>
          <p className="text-sm text-muted-foreground">
            Отправьте публичную ссылку студентам. Воронка появится после первого посещения.
          </p>

          <CopyLinkButton url={buildPublicFormUrl(form.slug)} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Это черновик. Опубликуйте форму в конструкторе, чтобы начать собирать статистику.
        </p>
      )}
    </div>
  );
}

function FormAnalyticsView({ formId }: FormAnalyticsProps) {
  const load = useCallback(() => loadFormWithAnalytics(formId), [formId]);
  const state = useApiData(load);

  if (state.status === 'loading') {
    return <PageMessage title="Загружаем аналитику…" />;
  }

  if (state.status === 'failed') {
    return (
      <PageMessage
        title={
          isMissingResourceError(state.error)
            ? 'Форма не найдена'
            : 'Не удалось загрузить аналитику'
        }
        description={state.message}
      >
        <Button variant="outline" asChild>
          <Link to={RoutePath.AdminFormList}>К списку форм</Link>
        </Button>
      </PageMessage>
    );
  }

  const { form, analytics } = state.data;
  const hasVisits = analytics.funnel.some((step) => step.sessions > 0);

  return (
    <main className="mx-auto grid max-w-4xl gap-6 px-4 py-10">
      <AnalyticsHeader form={form} />

      {hasVisits ? (
        <>
          <ConversionCard analytics={analytics} />
          <FunnelCard analytics={analytics} />
          <DropOffCard analytics={analytics} fields={form.fields} />
        </>
      ) : (
        <EmptyAnalytics form={form} />
      )}
    </main>
  );
}

export function FormAnalyticsPage() {
  const { id = '' } = useParams();

  return <FormAnalyticsView key={id} formId={id} />;
}
