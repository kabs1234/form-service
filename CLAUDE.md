# Form Service — project brief for Claude Code

## What we're building

A test assignment for a student career platform. Managers (non-technical) build application forms for internships/events themselves and publish them by link; students open the link and submit answers; managers view responses.

There is a second problem in the brief that matters as much as the first: **students abandon forms halfway and nobody knows why.** We solve that with funnel analytics (overall funnel + "last field before quitting") and draft autosave.

"Thoughtfulness of the solution matters more than the number of features." Prefer fewer, well-reasoned features.

## Language

All user-facing text is in **Russian**: UI copy, aria-labels, validation messages (zod uses its `ru` locale via `shared/zod.ts`), API error messages, and the README. Code, identifiers, comments, commit messages and server logs stay in English.

## Hard constraints (the submission is rejected if any of these fail)

- Node.js 20+ (any Node 20, not just 20.19+). Do not use APIs that only exist in Node 22+ (no `node:sqlite`, no native TS type stripping). Check the `engines` field of every dependency we add — it must accept Node 20.0.
- Runs with exactly two commands from the repo root: `npm install` then `npm start`.
- Serves on `http://localhost:3000`; port configurable via the `PORT` env variable.
- No external dependencies: no API keys, no cloud services, no separately installed database.
- **Nothing that compiles on install** (no node-gyp, no `better-sqlite3`). Prebuilt platform binaries shipped as optional dependencies (esbuild, Rollup, Lightning CSS) are fine.
- Admin at `/admin` without auth. Public form at a link generated in the admin.
- Data stored inside the project.

## Stack

| Layer             | Choice                                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Backend           | Express 5, TypeScript, run with `tsx`                                                                                         |
| Frontend          | React + **Vite 6 (pinned)** + TypeScript, React Router                                                                        |
| UI components     | shadcn/ui, **Radix variant** (`-b radix`)                                                                                     |
| Styling           | Tailwind v4 via `@tailwindcss/vite`                                                                                           |
| Validation        | zod, one schema shared by client and server                                                                                   |
| Public form state | react-hook-form                                                                                                               |
| Storage           | `data/db.json` for forms and responses (atomic writes, one write at a time) + `data/events.jsonl` for analytics (append-only) |
| Public links      | 8-character slug via `crypto.randomBytes(6).toString('base64url')`, separate from the internal form ID                        |
| Analytics chart   | shadcn Chart (Recharts), horizontal bar funnel                                                                                |
| Dev runner        | `concurrently` (pre-approved, dev script only)                                                                                |

- Vite is pinned to v6 because Vite 7+ requires Node 20.19+. Vite plugins must be versions compatible with Vite 6 **and** Node 20.0 (e.g. `@vitejs/plugin-react` v4, not v5).
- Do not add other dependencies without asking first.

## Structure

```
/server     Express app: index.ts, routes, storage
/src        React app (admin + public form)
/shared     zod schemas and types used by both sides
/data       created on first run, git-ignored
/docs/ai-log  exported AI session logs
```

- `@/*` alias points to `/src` only (required by shadcn), configured in tsconfig and vite config.
- Frontend imports `/shared` through the `@shared/*` alias (tsconfig.app.json paths + vite `resolve.alias`) and its own files through `@/*`. The server imports `/shared` with **relative paths**, so tsx needs no path-alias config.

## package.json requirements

```json
"engines": { "node": ">=20" },
"scripts": {
  "dev": "concurrently \"vite\" \"tsx watch server/index.ts\"",
  "build": "vite build",
  "prestart": "vite build",
  "start": "tsx server/index.ts"
}
```

- **All packages go in `dependencies`** (including vite, plugins, tailwind, tsx, typescript). Reason: `prestart` builds the frontend, and with `NODE_ENV=production` npm skips devDependencies, which would break the build. State this in the README.
- **Exception: lint tooling lives in `devDependencies`** (`eslint`, `@eslint/js`, `typescript-eslint`, React ESLint plugins, `globals`). ESLint 9 and typescript-eslint 8 require Node 20.9+, which breaks the "accept Node 20.0" rule. They aren't needed by `npm start`, so on Node 20.0–20.8 `npm install` only prints an EBADENGINE warning. Prettier accepts Node 14+ and stays in `dependencies`.
- In dev, Vite proxies `/api` to `http://localhost:3000` (`server.proxy` in vite config).
- Commit `package-lock.json`.

## Data model (define in /shared with zod)

- **Field**: `id`, `type` (`text` | `textarea` | `email` | `number` | `select` | `radio` | `checkbox` | `date`), `label`, `required`, `placeholder?`, `options?` (for select/radio/checkbox).
- **Form**: `id`, `slug`, `title`, `description?`, `fields: Field[]`, `published: boolean`, `createdAt`, `updatedAt`.
- **Response**: `id`, `formId`, `answers: Record<fieldId, value>`, `submittedAt`. Checkbox values are `string[]`.
- **Event**: `formId`, `sessionId`, `type` (`view` | `start` | `field_focus` | `submit`), `fieldId?`, `ts`.
- Forms can be edited after they have responses. Answers keyed by a field ID that no longer exists are shown as **"(deleted field)"** in the responses table. No field versioning.

## API

Admin:

- `POST /api/forms` create
- `GET /api/forms` list (include response count)
- `GET /api/forms/:id` get one
- `PUT /api/forms/:id` update fields, title, publish toggle
- `POST /api/forms/:id/regenerate-slug` new public link
- `GET /api/forms/:id/responses` list responses
- `GET /api/forms/:id/analytics` funnel data

Public:

- `GET /api/public/:slug` form definition (only if published)
- `POST /api/public/:slug/responses` submit answers
- `POST /api/public/:slug/events` analytics event

Rules:

- Status codes: 200, 201 on create, 400 on invalid input (return zod error details), 404 for unknown id/slug.
- Unknown slug and unpublished form return the **same** 404.
- **Server-side validation of submissions**: build a zod schema dynamically from the form's field definitions (required, email format, number, options must be one of the allowed values). Never trust client validation alone.
- **Validate events too**: only for published forms; `type` must be valid; `fieldId`, if present, must belong to the form. Otherwise 400/404.
- **Slug collisions**: when generating a slug, regenerate until it doesn't match an existing one.

## Server rules

- Order in `server/index.ts`: `express.json()` → `/api` routes → `express.static('dist')` → SPA fallback that sends `dist/index.html` for any other GET (so `/admin` and `/f/:slug` work on refresh).
- **Express 5 note**: the `'*'` path pattern no longer works. Implement the fallback as a final `app.use` middleware (GET only, skip `/api`), or use `'/{*splat}'`.
- Resolve `dist` and `data` paths from the project root with `path.resolve`, not relative to cwd.
- `app.listen(Number(process.env.PORT) || 3000)`.
- Create `data/` on startup if missing. No demo data is seeded: the app starts empty and the reviewer creates their own form (decided deliberately to keep the app simple).

## Storage rules

- Load `db.json` into memory at startup; mutate in memory; persist through a **single write queue** so writes never interleave (prevents lost updates on concurrent submissions).
- Atomic write: write to a temp file, then `fs.rename` over `db.json`.
- Events: `fs.appendFile` one JSON object per line to `events.jsonl`. Never rewrite this file.
- Keep all file access behind a small storage module so it could be swapped for a real DB.

## Frontend routes

- `/admin` — list of forms (title, published state, response count, copy-link button)
- `/admin/forms/new` and `/admin/forms/:id` — builder
- `/admin/forms/:id/responses` — responses table
- `/admin/forms/:id/analytics` — funnel
- `/f/:slug` — public form

## Builder (keep it simple)

- Add field by type, edit label / required / placeholder / options, delete.
- Reorder with **up/down buttons**, not drag-and-drop.
- Live preview using the same renderer as the public form.
- Publish toggle, copy public link, regenerate link.

## Public form

- Rendered from the form definition with react-hook-form + the shared zod schema.
- **Draft autosave** to `localStorage` keyed by slug; restore on return; clear on successful submit.
- Clear success screen after submit. Friendly 404 for unknown/unpublished links.

## Analytics (the differentiator)

- `sessionId` generated per visit and kept in `sessionStorage`.
- Send events: `view` on load (once), `start` on first input (once), `field_focus` when focus moves to a field different from the last focused one, `submit` on successful submission (once).
- Use `fetch` with `keepalive: true` and JSON body.
- Server computes two things:
  1. **Overall funnel**: unique sessions with `view` → `start` → `submit`, with conversion % between steps.
  2. **Last field before quitting**: for abandoned sessions (have `start`, no `submit`), take the field of the latest `field_focus` event; count per field. This shows the field where students get stuck. We don't use "completed each field in order", because students skip optional fields and fill out of order, which creates fake drop-offs.
- Admin view: conversion rate headline + horizontal bar funnel + "last field before quitting" bar chart, highlighting the top field ("X% of students who quit stopped at this field").

## Out of scope (do not build)

Auth, multi-page forms, conditional logic, file uploads, theming, drag-and-drop, email notifications, field versioning.

## How to work with me

- I'm a frontend developer and new to backend. When writing server code, **work one endpoint or module at a time and explain what each part does and why** (routing, status codes, validation, the write queue, atomic writes). I need to be able to explain every line in the interview.
- Don't generate the whole app in one go. Follow the work order below and stop after each step so I can review.
- The AI conversation log is part of the submission. Do not delete or rewrite it. After each step, remind me to export the session (`/export`) into `docs/ai-log/`.
- Priority if time runs short: core scenario first, analytics second, CI and polish last. Cut CI before cutting "last field before quitting".

## Work order

1. Scaffold: `git init`, Vite 6 + React + TS, Tailwind v4, shadcn init (`-b radix`, `@` alias in tsconfig and vite config), Express server, `.gitignore` (`node_modules`, `dist`, `data`).
2. Shared zod schemas.
3. Storage module (in-memory + write queue + atomic write + events append).
4. API routes.
5. Admin: forms list + builder.
6. Public form (+ draft autosave).
7. Responses view.
8. Event tracking + analytics endpoint + funnel view.
9. README.
10. Verification (below).
11. GitHub Actions CI: matrix ubuntu + windows × Node 20 + 22; `npm install`, start the server, curl `/admin` and `/api/forms`.

## README must include

- How to run (`npm install`, `npm start`; first start takes a moment because it builds the frontend).
- What was built and the main scenario.
- How the drop-off analytics work and why (overall funnel + last field before quitting).
- Decisions and trade-offs: JSON storage + write queue, separate append-only events, server-side validation, slug separate from ID, all packages in `dependencies`, Vite pinned to 6.
- What was deliberately cut and why.
- What would change for production (real DB like Postgres, auth for admin, rate limiting on public endpoints).

## Definition of done

- Fresh clone into a new folder → `npm install && npm start` works on Node 20 and on the latest Node, on Windows and Linux.
- `PORT=4000 npm start` serves on 4000 (PowerShell: `$env:PORT=4000; npm start`).
- Full scenario works in the `npm start` build (not just `npm run dev`): create form → publish → open link → submit → see response and funnel in admin.
- Refreshing `/admin/...` and `/f/:slug` doesn't 404.
- `data/` is git-ignored; app starts cleanly with no `data/` folder.
