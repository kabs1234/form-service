import { cn } from '@/lib/utils';

type PublishStateProps = {
  readonly isPublished: boolean;
};

export function PublishState({ isPublished }: PublishStateProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className={cn(
          'size-2 rounded-full border border-ink',
          isPublished ? 'bg-ink' : 'bg-transparent',
        )}
      />
      {isPublished ? 'Опубликована' : 'Черновик'}
    </span>
  );
}
