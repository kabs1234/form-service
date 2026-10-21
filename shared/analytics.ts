import { z } from './zod';

export const FUNNEL_STEPS = ['view', 'start', 'submit'] as const;

const countSchema = z.number().int().nonnegative();
const rateSchema = z.number().min(0).max(1);

export const funnelStepSchema = z.object({
  step: z.enum(FUNNEL_STEPS),
  sessions: countSchema,
  rateFromPrevious: rateSchema,
});

export const dropOffFieldSchema = z.object({
  fieldId: z.string().min(1),
  sessions: countSchema,
  shareOfAbandoned: rateSchema,
});

export const formAnalyticsSchema = z.object({
  funnel: z.tuple([funnelStepSchema, funnelStepSchema, funnelStepSchema]),
  conversionRate: rateSchema,
  abandonedSessions: countSchema,
  dropOffFields: z.array(dropOffFieldSchema),
});

export type FunnelStepName = (typeof FUNNEL_STEPS)[number];
export type FunnelStep = z.infer<typeof funnelStepSchema>;
export type Funnel = z.infer<typeof formAnalyticsSchema>['funnel'];
export type DropOffField = z.infer<typeof dropOffFieldSchema>;
export type FormAnalytics = z.infer<typeof formAnalyticsSchema>;
