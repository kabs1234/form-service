import { z } from 'zod'

export const EVENT_TYPES = ['view', 'start', 'field_focus', 'submit'] as const

const MAX_SESSION_ID_LENGTH = 64

export type EventType = (typeof EVENT_TYPES)[number]

const sessionIdSchema = z.string().min(1).max(MAX_SESSION_ID_LENGTH)

export const eventInputSchema = z.discriminatedUnion('type', [
  z.object({
    sessionId: sessionIdSchema,
    type: z.literal('field_focus'),
    fieldId: z.string().min(1),
  }),
  z.object({
    sessionId: sessionIdSchema,
    type: z.enum(['view', 'start', 'submit']),
  }),
])

export const analyticsEventSchema = z.intersection(
  eventInputSchema,
  z.object({
    formId: z.string().min(1),
    ts: z.iso.datetime(),
  }),
)

export type EventInput = z.infer<typeof eventInputSchema>
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>
