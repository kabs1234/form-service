import fs from 'node:fs/promises'
import path from 'node:path'

import { z } from 'zod'

import { analyticsEventSchema } from '../shared/event'
import type { AnalyticsEvent } from '../shared/event'
import { formSchema } from '../shared/form'
import type { Form } from '../shared/form'
import { formResponseSchema } from '../shared/response'
import type { FormResponse } from '../shared/response'
import { DATA_DIR } from './paths'

const DATABASE_PATH = path.join(DATA_DIR, 'db.json')
const DATABASE_TEMP_PATH = `${DATABASE_PATH}.tmp`
const EVENTS_PATH = path.join(DATA_DIR, 'events.jsonl')
const JSON_INDENT = 2

const databaseSchema = z.object({
  forms: z.array(formSchema),
  responses: z.array(formResponseSchema),
})

type Database = z.infer<typeof databaseSchema>

const EMPTY_DATABASE: Database = { forms: [], responses: [] }

let database: Database = EMPTY_DATABASE
let writeQueue: Promise<void> = Promise.resolve()

function isFileMissing(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT'
}

async function readDatabaseFile(): Promise<Database> {
  try {
    const content = await fs.readFile(DATABASE_PATH, 'utf8')
    return databaseSchema.parse(JSON.parse(content))
  } catch (error: unknown) {
    if (isFileMissing(error)) {
      return EMPTY_DATABASE
    }
    
    throw error
  }
}

async function writeDatabaseFile(): Promise<void> {
  const content = JSON.stringify(database, null, JSON_INDENT)
  await fs.writeFile(DATABASE_TEMP_PATH, content, 'utf8')
  await fs.rename(DATABASE_TEMP_PATH, DATABASE_PATH)
}

function continueAfterFailedWrite(): void {}

function persistDatabase(): Promise<void> {
  const write = writeQueue.then(writeDatabaseFile)
  writeQueue = write.catch(continueAfterFailedWrite)
  return write
}

function replaceById<TItem extends { readonly id: string }>(
  items: readonly TItem[],
  item: TItem,
): TItem[] {
  const exists = items.some((existing) => existing.id === item.id)
  return exists ? items.map((existing) => (existing.id === item.id ? item : existing)) : [...items, item]
}

function parseEventLine(line: string): AnalyticsEvent | undefined {
  try {
    const result = analyticsEventSchema.safeParse(JSON.parse(line))
    if (result.success) {
      return result.data
    }
  } catch {
    return
  }
}

async function readEventsFile(): Promise<string> {
  try {
    return await fs.readFile(EVENTS_PATH, 'utf8')
  } catch (error: unknown) {
    if (isFileMissing(error)) {
      return ''
    }
    throw error
  }
}

export async function loadStorage(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  database = await readDatabaseFile()
}

export function listForms(): readonly Form[] {
  return database.forms
}

export function findFormById(id: string): Form | undefined {
  return database.forms.find((form) => form.id === id)
}

export function findFormBySlug(slug: string): Form | undefined {
  return database.forms.find((form) => form.slug === slug)
}

export function saveForm(form: Form): Promise<void> {
  database = { ...database, forms: replaceById(database.forms, form) }
  return persistDatabase()
}

export function listResponses(formId: string): readonly FormResponse[] {
  return database.responses.filter((response) => response.formId === formId)
}

export function countResponses(formId: string): number {
  return listResponses(formId).length
}

export function addResponse(response: FormResponse): Promise<void> {
  database = { ...database, responses: [...database.responses, response] }
  return persistDatabase()
}

export async function appendEvent(event: AnalyticsEvent): Promise<void> {
  await fs.appendFile(EVENTS_PATH, `${JSON.stringify(event)}\n`, 'utf8')
}

export async function listEvents(formId: string): Promise<AnalyticsEvent[]> {
  const content = await readEventsFile()
  return content
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map(parseEventLine)
    .filter((event): event is AnalyticsEvent => event?.formId === formId)
}
