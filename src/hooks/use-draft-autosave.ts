import { useEffect } from 'react';
import type { UseFormSubscribe } from 'react-hook-form';

import type { Answers } from '@shared/response';

import { saveDraft } from '@/lib/answers-draft';

export function useDraftAutosave(slug: string, subscribe: UseFormSubscribe<Answers>): void {
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values }) => saveDraft(slug, values),
      }),
    [slug, subscribe],
  );
}
