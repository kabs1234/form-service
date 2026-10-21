import type { MouseEvent } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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

const LEAVE_CONFIRMATION = 'Leave without saving? Your changes will be lost.';

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
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to={RoutePath.AdminFormList} onClick={handleBackClick}>
            <ArrowLeftIcon />
            Forms
          </Link>
        </Button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold">{title}</h1>

          <p
            aria-live="polite"
            className={cn(
              'truncate text-xs',
              saveStatus.isError ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {saveStatus.text}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="form-published"
            checked={isPublished}
            disabled={isSaving}
            onCheckedChange={(isChecked) => (isChecked ? onPublish() : onUnpublish())}
          />

          <Label htmlFor="form-published">{isPublished ? 'Published' : 'Draft'}</Label>
        </div>

        <Button type="button" disabled={isSaving || !hasUnsavedChanges} onClick={onSave}>
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </header>
  );
}
