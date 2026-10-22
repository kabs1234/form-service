import type { ReactNode } from 'react';

type PageMessageProps = {
  readonly title: string;
  readonly description?: string;
  readonly children?: ReactNode;
};

export function PageMessage({ title, description, children }: PageMessageProps) {
  return (
    <main className="mx-auto grid max-w-xl gap-4 px-4 py-24">
      <h1 className="text-2xl leading-tight">{title}</h1>

      {description && <p className="leading-relaxed text-muted-foreground">{description}</p>}

      {children && <div className="flex flex-wrap gap-2 pt-2">{children}</div>}
    </main>
  );
}
