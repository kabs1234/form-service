import type { DropOffField, FormAnalytics, Funnel } from '../shared/analytics';
import type { AnalyticsEvent, EventType } from '../shared/event';

type SessionEvents = readonly AnalyticsEvent[];

type FunnelCounts = {
  readonly viewed: number;
  readonly started: number;
  readonly submitted: number;
};

function groupEventsBySession(events: readonly AnalyticsEvent[]): SessionEvents[] {
  const eventsBySession = new Map<string, AnalyticsEvent[]>();
  for (const event of events) {
    const sessionEvents = eventsBySession.get(event.sessionId) ?? [];
    sessionEvents.push(event);
    eventsBySession.set(event.sessionId, sessionEvents);
  }
  return [...eventsBySession.values()];
}

function hasEventType(events: SessionEvents, type: EventType): boolean {
  return events.some((event) => event.type === type);
}

function hasSubmitted(events: SessionEvents): boolean {
  return hasEventType(events, 'submit');
}

function hasStarted(events: SessionEvents): boolean {
  return hasEventType(events, 'start') || hasSubmitted(events);
}

function hasAbandoned(events: SessionEvents): boolean {
  return hasStarted(events) && !hasSubmitted(events);
}

function calculateRate(part: number, whole: number): number {
  return whole === 0 ? 0 : part / whole;
}

function countFunnelSessions(sessions: readonly SessionEvents[]): FunnelCounts {
  return {
    viewed: sessions.length,
    started: sessions.filter(hasStarted).length,
    submitted: sessions.filter(hasSubmitted).length,
  };
}

function buildFunnelSteps({ viewed, started, submitted }: FunnelCounts): Funnel {
  return [
    { step: 'view', sessions: viewed, rateFromPrevious: 1 },
    { step: 'start', sessions: started, rateFromPrevious: calculateRate(started, viewed) },
    { step: 'submit', sessions: submitted, rateFromPrevious: calculateRate(submitted, started) },
  ];
}

function listFocusedFieldIds(events: SessionEvents): string[] {
  return events.flatMap((event) => (event.type === 'field_focus' ? [event.fieldId] : []));
}

function countByValue(values: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

function buildDropOffFields(abandonedSessions: readonly SessionEvents[]): DropOffField[] {
  const lastFieldIds = abandonedSessions.flatMap((events) => listFocusedFieldIds(events).slice(-1));

  return [...countByValue(lastFieldIds)]
    .map(([fieldId, sessions]) => ({
      fieldId,
      sessions,
      shareOfAbandoned: calculateRate(sessions, abandonedSessions.length),
    }))
    .sort((first, second) => second.sessions - first.sessions);
}

export function buildFormAnalytics(events: readonly AnalyticsEvent[]): FormAnalytics {
  const sessions = groupEventsBySession(events);
  const counts = countFunnelSessions(sessions);
  const abandonedSessions = sessions.filter(hasAbandoned);

  return {
    funnel: buildFunnelSteps(counts),
    conversionRate: calculateRate(counts.submitted, counts.viewed),
    abandonedSessions: abandonedSessions.length,
    dropOffFields: buildDropOffFields(abandonedSessions),
  };
}
