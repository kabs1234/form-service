import { useCallback, useEffect, useState } from 'react';

const STATUS_RESET_DELAY_MS = 2000;

export type CopyStatus = 'idle' | 'copied' | 'failed';

type CopyToClipboard = {
  readonly copyStatus: CopyStatus;
  readonly copyText: (text: string) => Promise<void>;
};

export function useCopyToClipboard(): CopyToClipboard {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

  useEffect(() => {
    if (copyStatus === 'idle') {
      return;
    }

    const timeoutId = setTimeout(() => setCopyStatus('idle'), STATUS_RESET_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [copyStatus]);

  const copyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  }, []);

  return { copyStatus, copyText };
}
