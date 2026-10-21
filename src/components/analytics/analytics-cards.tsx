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
    <Card>
      <CardHeader>
        <CardDescription>Конверсия</CardDescription>
        <CardTitle className="text-4xl tabular-nums">
          {formatPercent(analytics.conversionRate)}
        </CardTitle>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground">
        Отправили форму {submitStep.sessions} из {viewStep.sessions} открывших. Начали заполнять и
        бросили: {analytics.abandonedSessions}.
      </CardContent>
    </Card>
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
    <p className="text-sm">
      <span className="font-semibold">{formatPercent(topField.shareOfAbandoned)}</span> бросивших
      заполнение остановились на {topFields.length > 1 ? 'каждом из полей' : 'поле'}{' '}
      <span className="font-semibold">
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
