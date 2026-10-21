import type { ReactNode } from 'react';

type PageMessageProps = {
  readonly title: string;
  readonly description?: string;
  readonly children?: ReactNode;
};

export function PageMessage({ title, description, children }: PageMessageProps) {
  return (
    <main className="mx-auto grid max-w-md gap-3 px-4 py-24 text-center">
      <h1 className="text-xl font-semibold">{title}</h1>

      {description && <p className="text-muted-foreground">{description}</p>}

      {children && <div className="flex justify-center gap-2">{children}</div>}
    </main>
  );
}
