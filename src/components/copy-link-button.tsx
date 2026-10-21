import { CheckIcon, CopyIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import type { CopyStatus } from '@/hooks/use-copy-to-clipboard';

type CopyLinkButtonProps = {
  readonly url: string;
};

const COPY_LABELS: Readonly<Record<CopyStatus, string>> = {
  idle: 'Скопировать ссылку',
  copied: 'Скопировано',
  failed: 'Не удалось скопировать',
};

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const { copyStatus, copyText } = useCopyToClipboard();
  const Icon = copyStatus === 'copied' ? CheckIcon : CopyIcon;

  return (
    <Button type="button" variant="outline" size="sm" onClick={() => copyText(url)}>
      <Icon />
      <span aria-live="polite">{COPY_LABELS[copyStatus]}</span>
    </Button>
  );
}
