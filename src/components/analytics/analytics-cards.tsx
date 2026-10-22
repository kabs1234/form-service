import type { FormAnalytics } from '@shared/analytics';
import type { Field } from '@shared/form';

import { HorizontalBarChart } from '@/components/analytics/horizontal-bar-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  buildDropOffBars,
  buildFunnelBars,
  findFieldLabel,
  findTopDropOffFields,
  formatPercent,
  joinQuotedLabels,
} from '@/lib/analytics-view';

type AnalyticsCardProps = {
  readonly analytics: FormAnalytics;
};

type DropOffCardProps = AnalyticsCardProps & {
  readonly fields: readonly Field[];
};

export function ConversionCard({ analytics }: AnalyticsCardProps) {
  const [viewStep, , submitStep] = analytics.funnel;

  return (
    <section
      aria-label="Конверсия"
      className="grid gap-3 py-2 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-8"
    >
      <p className="font-heading text-6xl leading-none font-medium text-ink tabular-nums sm:text-7xl">
        {formatPercent(analytics.conversionRate)}
      </p>

      <p className="max-w-[48ch] leading-relaxed">
        открывших форму отправили её: {submitStep.sessions} из {viewStep.sessions}.{' '}
        <span className="text-muted-foreground">
          Начали заполнять и бросили: {analytics.abandonedSessions}.
        </span>
      </p>
    </section>
  );
}

export function FunnelCard({ analytics }: AnalyticsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Воронка</CardTitle>
        <CardDescription>
          Уникальные посещения на каждом шаге. Проценты — конверсия из предыдущего шага.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <HorizontalBarChart bars={buildFunnelBars(analytics.funnel)} />
      </CardContent>
    </Card>
  );
}

function DropOffHeadline({ analytics, fields }: DropOffCardProps) {
  const topFields = findTopDropOffFields(analytics.dropOffFields);
  const [topField] = topFields;
  if (!topField) {
    return <p className="text-sm text-muted-foreground">Пока никто не бросил заполнение.</p>;
  }

  return (
    <p className="text-base leading-relaxed">
      <span className="font-semibold tabular-nums">{formatPercent(topField.shareOfAbandoned)}</span>{' '}
      бросивших заполнение остановились на {topFields.length > 1 ? 'каждом из полей' : 'поле'}{' '}
      <span className="highlighter font-semibold">
        {joinQuotedLabels(topFields.map((field) => findFieldLabel(fields, field.fieldId)))}
      </span>
      .
    </p>
  );
}

export function DropOffCard({ analytics, fields }: DropOffCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Последнее поле перед уходом</CardTitle>
        <CardDescription>
          Для студентов, которые начали, но не отправили форму: поле, на котором они остановились.
          Сюда входят и те, кто, возможно, ещё заполняет форму.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <DropOffHeadline analytics={analytics} fields={fields} />

        {analytics.dropOffFields.length > 0 && (
          <HorizontalBarChart bars={buildDropOffBars(fields, analytics.dropOffFields)} />
        )}
      </CardContent>
    </Card>
  );
}
