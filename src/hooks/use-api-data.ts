import { useEffect, useState } from 'react';

import { getErrorMessage } from '@/lib/api-client';

export type ApiDataState<TData> =
  | { readonly status: 'loading' }
  | { readonly status: 'failed'; readonly error: unknown; readonly message: string }
  | { readonly status: 'loaded'; readonly data: TData };

export function useApiData<TData>(load: () => Promise<TData>): ApiDataState<TData> {
  const [state, setState] = useState<ApiDataState<TData>>({ status: 'loading' });

  useEffect(() => {
    let isCurrent = true;

    async function loadData(): Promise<void> {
      try {
        const data = await load();
        if (isCurrent) {
          setState({ status: 'loaded', data });
        }
      } catch (error: unknown) {
        if (isCurrent) {
          setState({ status: 'failed', error, message: getErrorMessage(error) });
        }
      }
    }

    loadData();

    return () => {
      isCurrent = false;
    };
  }, [load]);

  return state;
}
