import type { MouseEvent } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Link } from 'react-router';

import { PublishState } from '@/components/publish-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RoutePath } from '@/routes';

export type SaveStatus = {
  readonly text: string;
  readonly isError: boolean;
};

type BuilderHeaderProps = {
  readonly title: string;
  readonly saveStatus: SaveStatus;
  readonly isPublished: boolean;
  readonly isSaving: boolean;
  readonly hasUnsavedChanges: boolean;
  readonly onPublish: () => void;
  readonly onUnpublish: () => void;
  readonly onSave: () => void;
};

const LEAVE_CONFIRMATION = 'Уйти без сохранения? Изменения будут потеряны.';

export function BuilderHeader({
  title,
  saveStatus,
  isPublished,
  isSaving,
  hasUnsavedChanges,
  onPublish,
  onUnpublish,
  onSave,
}: BuilderHeaderProps) {
  function handleBackClick(evt: MouseEvent<HTMLAnchorElement>): void {
    if (hasUnsavedChanges && !window.confirm(LEAVE_CONFIRMATION)) {
      evt.preventDefault();
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-6xl gap-2 px-4 py-3 md:flex md:items-center md:gap-4">
        <Button variant="ghost" size="sm" className="-ml-2.5 justify-self-start" asChild>
          <Link to={RoutePath.AdminFormList} onClick={handleBackClick}>
            <ArrowLeftIcon />
            Формы
          </Link>
        </Button>

        <div className="min-w-0 md:flex-1">
          <h1 className="truncate text-base">{title}</h1>

          <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
            <PublishState isPublished={isPublished} />

            <span
              aria-live="polite"
              className={cn('min-w-0 truncate', saveStatus.isError && 'text-destructive')}
            >
              {saveStatus.text}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={isPublished ? onUnpublish : onPublish}
          >
            {isPublished ? 'Снять с публикации' : 'Опубликовать'}
          </Button>

          <Button type="button" disabled={isSaving || !hasUnsavedChanges} onClick={onSave}>
            {isSaving ? 'Сохраняем…' : 'Сохранить'}
          </Button>
        </div>
      </div>
    </header>
  );
}
