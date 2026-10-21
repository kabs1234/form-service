import type { ReactNode } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { RoutePath } from '@/routes';

type FormPageHeaderProps = {
  readonly title: string;
  readonly summary: string;
  readonly children: ReactNode;
};

export function FormPageHeader({ title, summary, children }: FormPageHeaderProps) {
  return (
    <div className="grid gap-4">
      <Button variant="ghost" size="sm" className="justify-self-start" asChild>
        <Link to={RoutePath.AdminFormList}>
          <ArrowLeftIcon />
          Формы
        </Link>
      </Button>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">{title}</h1>

          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>

        <div className="flex flex-wrap gap-2">{children}</div>
      </div>
    </div>
  );
}
