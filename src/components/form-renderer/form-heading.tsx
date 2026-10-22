import type { FormInput } from '@shared/form';

type FormHeadingProps = Pick<FormInput, 'title' | 'description'>;

const UNTITLED_FORM = 'Форма без названия';

export function FormHeading({ title, description }: FormHeadingProps) {
  return (
    <div className="grid max-w-[60ch] gap-2 pb-2">
      <h2 className="text-xl leading-snug font-normal sm:text-2xl">{title || UNTITLED_FORM}</h2>

      {description && (
        <p className="leading-relaxed whitespace-pre-line text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
