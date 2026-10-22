import { ChartColumnIcon, InboxIcon, PencilIcon } from 'lucide-react';
import { Link } from 'react-router';

import type { FormSummary } from '@shared/form';

import { CopyLinkButton } from '@/components/copy-link-button';
import { PublishState } from '@/components/publish-state';
import { Button } from '@/components/ui/button';
import {
  buildFormAnalyticsPath,
  buildFormEditPath,
  buildFormResponsesPath,
  buildPublicFormUrl,
} from '@/routes';

type FormListItemProps = {
  readonly form: FormSummary;
};

const ACTION_LINK_CLASS_NAME =
  'h-auto flex-col gap-1 px-1 py-2 text-xs md:h-7 md:flex-row md:px-2.5 md:py-0 md:text-[0.8rem]';

export function FormListItem({ form }: FormListItemProps) {
  return (
    <div className="grid gap-3 px-4 py-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6">
      <div className="grid min-w-0 gap-1.5">
        <Link
          to={buildFormEditPath(form.id)}
          className="truncate text-lg font-medium underline-offset-4 hover:text-ink hover:underline"
        >
          {form.title}
        </Link>

        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <PublishState isPublished={form.published} />

          <span className="tabular-nums">Ответов: {form.responseCount}</span>
        </p>
      </div>

      <div className="grid gap-2 md:flex md:items-center md:justify-end md:gap-1">
        {form.published && <CopyLinkButton url={buildPublicFormUrl(form.slug)} />}

        <div className="flex justify-between md:justify-end md:gap-1">
          <Button variant="ghost" size="sm" className={ACTION_LINK_CLASS_NAME} asChild>
            <Link to={buildFormEditPath(form.id)}>
              <PencilIcon />
              Редактировать
            </Link>
          </Button>

          <Button variant="ghost" size="sm" className={ACTION_LINK_CLASS_NAME} asChild>
            <Link to={buildFormResponsesPath(form.id)}>
              <InboxIcon />
              Ответы
            </Link>
          </Button>

          <Button variant="ghost" size="sm" className={ACTION_LINK_CLASS_NAME} asChild>
            <Link to={buildFormAnalyticsPath(form.id)}>
              <ChartColumnIcon />
              Аналитика
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
