import { useEffect, useState } from 'react';

import { createFormTracker } from '@/lib/form-tracker';
import type { FormTracker } from '@/lib/form-tracker';

export function useFormTracker(slug: string): FormTracker {
  const [tracker] = useState(() => createFormTracker(slug));

  useEffect(() => {
    tracker.trackView();
  }, [tracker]);

  return tracker;
}
