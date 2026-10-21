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
        <CardTitle>Public link</CardTitle>

        <CardDescription>
          {form.published
            ? 'Anyone with this link can fill in the form.'
            : 'Students see "form not found" at this link until you publish the form.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-2">
        <Input
          readOnly
          value={url}
          aria-label="Public link"
          className="font-mono text-xs"
          onFocus={(evt) => evt.target.select()}
        />

        <div className="flex flex-wrap gap-2">
          <CopyLinkButton url={url} />

          <Button variant="outline" size="sm" asChild>
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLinkIcon />
              Open
            </a>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" size="sm" disabled={isRegenerating}>
                <RefreshCwIcon />
                {isRegenerating ? 'Generating…' : 'Generate new link'}
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Generate a new link?</AlertDialogTitle>

                <AlertDialogDescription>
                  The current link stops working immediately, so anyone you already sent it to will
                  see "form not found". Responses collected so far are kept.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction onClick={onRegenerate}>Generate new link</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
