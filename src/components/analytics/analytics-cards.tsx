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
        <CardDescription>Conversion rate</CardDescription>
        <CardTitle className="text-4xl tabular-nums">
          {formatPercent(analytics.conversionRate)}
        </CardTitle>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground">
        {submitStep.sessions} of {viewStep.sessions} students who opened the form submitted it.{' '}
        {analytics.abandonedSessions} started answering and quit.
      </CardContent>
    </Card>
  );
}

export function FunnelCard({ analytics }: AnalyticsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel</CardTitle>
        <CardDescription>
          Unique visits at each step. Percentages show conversion from the previous step.
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
    return (
      <p className="text-sm text-muted-foreground">Nobody has quit after starting to answer yet.</p>
    );
  }

  return (
    <p className="text-sm">
      <span className="font-semibold">{formatPercent(topField.shareOfAbandoned)}</span> of students
      who quit stopped at{' '}
      <span className="font-semibold">
        {joinQuotedLabels(topFields.map((field) => findFieldLabel(fields, field.fieldId)))}
      </span>
      {topFields.length > 1 && ' each'}.
    </p>
  );
}

export function DropOffCard({ analytics, fields }: DropOffCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Last field before quitting</CardTitle>
        <CardDescription>
          For students who started but didn’t submit: the field they were on when they left. This
          includes students who may still be filling in the form.
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
