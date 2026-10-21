import { ErrorText } from '@/components/error-text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { FormDetails } from '@/lib/form-draft';
import type { ErrorMap } from '@/lib/validation-errors';

type FormDetailsCardProps = {
  readonly details: FormDetails;
  readonly errors: ErrorMap;
  readonly onChange: (details: FormDetails) => void;
};

export function FormDetailsCard({ details, errors, onChange }: FormDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form details</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="form-title">Title</Label>

          <Input
            id="form-title"
            value={details.title}
            placeholder="e.g. Summer internship 2026"
            aria-invalid={Boolean(errors.title)}
            onChange={(evt) => onChange({ ...details, title: evt.target.value })}
          />

          <ErrorText message={errors.title} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="form-description">Description (optional)</Label>

          <Textarea
            id="form-description"
            value={details.description ?? ''}
            placeholder="What is this form for, and what happens after students apply?"
            onChange={(evt) => onChange({ ...details, description: evt.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
