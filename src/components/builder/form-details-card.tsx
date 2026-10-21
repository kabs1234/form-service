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
        <CardTitle>О форме</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="form-title">Название</Label>

          <Input
            id="form-title"
            value={details.title}
            placeholder="Например, Летняя стажировка 2026"
            aria-invalid={Boolean(errors.title)}
            onChange={(evt) => onChange({ ...details, title: evt.target.value })}
          />

          <ErrorText message={errors.title} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="form-description">Описание (необязательно)</Label>

          <Textarea
            id="form-description"
            value={details.description ?? ''}
            placeholder="Для чего эта форма и что будет после того, как студент подаст заявку?"
            onChange={(evt) => onChange({ ...details, description: evt.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
