import type { FormInput } from '@shared/form';

type FormHeadingProps = Pick<FormInput, 'title' | 'description'>;

const UNTITLED_FORM = 'Форма без названия';

export function FormHeading({ title, description }: FormHeadingProps) {
  return (
    <div className="grid gap-1">
      <h2 className="text-xl font-semibold">{title || UNTITLED_FORM}</h2>

      {description && <p className="whitespace-pre-line text-muted-foreground">{description}</p>}
    </div>
  );
}
