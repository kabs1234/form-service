import type { DropOffField, FunnelStep, FunnelStepName } from '@shared/analytics';
import type { Field } from '@shared/form';

import { APP_LOCALE } from '@/lib/locale';
import { DELETED_FIELD_LABEL } from '@/lib/response-table';

const MAX_AXIS_LABEL_LENGTH = 16;

const FUNNEL_STEP_LABELS: Readonly<Record<FunnelStepName, string>> = {
  view: 'Открыли форму',
  start: 'Начали заполнять',
  submit: 'Отправили',
};

const percentFormat = new Intl.NumberFormat(APP_LOCALE, {
  style: 'percent',
  maximumFractionDigits: 0,
});

const listFormat = new Intl.ListFormat(APP_LOCALE, { type: 'conjunction' });

export type ChartBar = {
  readonly key: string;
  readonly label: string;
  readonly sessions: number;
  readonly valueLabel: string;
  readonly isHighlighted: boolean;
};

export function formatPercent(rate: number): string {
  return percentFormat.format(rate);
}

export function truncateAxisLabel(label: string): string {
  return label.length > MAX_AXIS_LABEL_LENGTH
    ? `${label.slice(0, MAX_AXIS_LABEL_LENGTH - 1)}…`
    : label;
}

function buildFunnelValueLabel({ step, sessions, rateFromPrevious }: FunnelStep): string {
  return step === 'view' ? String(sessions) : `${sessions} · ${formatPercent(rateFromPrevious)}`;
}

export function buildFunnelBars(funnel: readonly FunnelStep[]): ChartBar[] {
  return funnel.map((step) => ({
    key: step.step,
    label: FUNNEL_STEP_LABELS[step.step],
    sessions: step.sessions,
    valueLabel: buildFunnelValueLabel(step),
    isHighlighted: true,
  }));
}

export function findFieldLabel(fields: readonly Field[], fieldId: string): string {
  return fields.find((field) => field.id === fieldId)?.label ?? DELETED_FIELD_LABEL;
}

export function findTopDropOffFields(dropOffFields: readonly DropOffField[]): DropOffField[] {
  const topSessions = Math.max(...dropOffFields.map((dropOffField) => dropOffField.sessions));
  return dropOffFields.filter((dropOffField) => dropOffField.sessions === topSessions);
}

export function joinQuotedLabels(labels: readonly string[]): string {
  return listFormat.format(labels.map((label) => `«${label}»`));
}

export function buildDropOffBars(
  fields: readonly Field[],
  dropOffFields: readonly DropOffField[],
): ChartBar[] {
  const topFields = findTopDropOffFields(dropOffFields);

  return dropOffFields.map((dropOffField) => ({
    key: dropOffField.fieldId,
    label: findFieldLabel(fields, dropOffField.fieldId),
    sessions: dropOffField.sessions,
    valueLabel: `${dropOffField.sessions} · ${formatPercent(dropOffField.shareOfAbandoned)}`,
    isHighlighted: topFields.includes(dropOffField),
  }));
}
