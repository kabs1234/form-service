import { useCallback } from 'react';
import { Link, useParams } from 'react-router';

import { FormBuilder } from '@/components/builder/form-builder';
import { PageMessage } from '@/components/page-message';
import { Button } from '@/components/ui/button';
import { useApiData } from '@/hooks/use-api-data';
import { fetchForm, isMissingResourceError } from '@/lib/api-client';
import { RoutePath } from '@/routes';

type SavedFormBuilderProps = {
  readonly formId: string;
};

function SavedFormBuilder({ formId }: SavedFormBuilderProps) {
  const loadForm = useCallback(() => fetchForm(formId), [formId]);
  const state = useApiData(loadForm);

  if (state.status === 'loading') {
    return <PageMessage title="Загружаем форму…" />;
  }

  if (state.status === 'failed') {
    return (
      <PageMessage
        title={
          isMissingResourceError(state.error) ? 'Форма не найдена' : 'Не удалось загрузить форму'
        }
        description={state.message}
      >
        <Button variant="outline" asChild>
          <Link to={RoutePath.AdminFormList}>К списку форм</Link>
        </Button>
      </PageMessage>
    );
  }

  return <FormBuilder initialForm={state.data} />;
}

export function FormBuilderPage() {
  const { id = '' } = useParams();

  return id ? <SavedFormBuilder key={id} formId={id} /> : <FormBuilder key="new" />;
}
