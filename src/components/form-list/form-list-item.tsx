import { ChartColumnIcon, InboxIcon, PencilIcon } from 'lucide-react';
import { Link } from 'react-router';

import type { FormSummary } from '@shared/form';

import { CopyLinkButton } from '@/components/copy-link-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  buildFormAnalyticsPath,
  buildFormEditPath,
  buildFormResponsesPath,
  buildPublicFormUrl,
} from '@/routes';

type FormListItemProps = {
  readonly form: FormSummary;
};

export function FormListItem({ form }: FormListItemProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link to={buildFormEditPath(form.id)} className="hover:underline">
            {form.title}
          </Link>
        </CardTitle>

        <CardDescription className="flex items-center gap-2">
          <Badge variant={form.published ? 'default' : 'secondary'}>
            {form.published ? 'Published' : 'Draft'}
          </Badge>

          <span>Responses: {form.responseCount}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-wrap items-center gap-2">
        {form.published ? (
          <CopyLinkButton url={buildPublicFormUrl(form.slug)} />
        ) : (
          <span className="text-xs text-muted-foreground">Publish to get a shareable link</span>
        )}

        <Button variant="outline" size="sm" asChild>
          <Link to={buildFormEditPath(form.id)}>
            <PencilIcon />
            Edit
          </Link>
        </Button>

        <Button variant="outline" size="sm" asChild>
          <Link to={buildFormResponsesPath(form.id)}>
            <InboxIcon />
            Responses
          </Link>
        </Button>

        <Button variant="outline" size="sm" asChild>
          <Link to={buildFormAnalyticsPath(form.id)}>
            <ChartColumnIcon />
            Analytics
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
