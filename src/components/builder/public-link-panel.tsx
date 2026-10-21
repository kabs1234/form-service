import { ExternalLinkIcon, RefreshCwIcon } from 'lucide-react';

import type { Form } from '@shared/form';

import { CopyLinkButton } from '@/components/copy-link-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { buildPublicFormUrl } from '@/routes';

type PublicLinkPanelProps = {
  readonly form: Form;
  readonly isRegenerating: boolean;
  readonly onRegenerate: () => void;
};

export function PublicLinkPanel({ form, isRegenerating, onRegenerate }: PublicLinkPanelProps) {
  const url = buildPublicFormUrl(form.slug);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Публичная ссылка</CardTitle>

        <CardDescription>
          {form.published
            ? 'Любой, у кого есть ссылка, может заполнить форму.'
            : 'Пока форма не опубликована, по этой ссылке студенты увидят «Форма недоступна».'}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-2">
        <Input
          readOnly
          value={url}
          aria-label="Публичная ссылка"
          className="font-mono text-xs"
          onFocus={(evt) => evt.target.select()}
        />

        <div className="flex flex-wrap gap-2">
          <CopyLinkButton url={url} />

          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLinkIcon />
              Открыть
            </a>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" size="sm" disabled={isRegenerating}>
                <RefreshCwIcon />
                {isRegenerating ? 'Создаём…' : 'Новая ссылка'}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Создать новую ссылку?</AlertDialogTitle>

                <AlertDialogDescription>
                  Текущая ссылка сразу перестанет работать: все, кому вы её уже отправили, увидят
                  «Форма недоступна». Собранные ответы сохранятся.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>

                <AlertDialogAction onClick={onRegenerate}>Создать новую ссылку</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
