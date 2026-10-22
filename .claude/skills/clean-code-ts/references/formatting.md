# Formatting & Comments Reference

## Capitalization conventions

| Kind | Convention | Example |
|---|---|---|
| Variables, functions | `camelCase` | `getUserById`, `totalCount` |
| Classes, interfaces, types, enums | `PascalCase` | `UserService`, `HttpClient`, `Genre` |
| React components | `PascalCase` | `ProjectCard`, `Header` |
| Enum members | `PascalCase` | `Genre.Romantic` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| Generic type params | `T`-prefixed `PascalCase` | `TItem`, `TResult` |

Bad:
```ts
const DAYS_IN_WEEK = 7;
const daysInMonth = 30;              // inconsistent
const Artists = ['ACDC'];            // wrong case
function restore_database(): void {} // snake_case in TS
type user = { name: string };        // types are PascalCase
interface IUser { name: string }     // no Hungarian prefix
```

Good:
```ts
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30;
const ARTISTS = ['ACDC'];
function restoreDatabase(): void {}
type User = { name: string };
```

---

## Caller functions above callees

Code reads top-to-bottom like a newspaper. The caller should appear above the callee.

Bad:
```ts
function lookupPeers(employeeId: string): Peer[] { return db.lookup(employeeId, 'peers'); }
function lookupManager(employee: Employee): Manager { return db.lookup(employee, 'manager'); }

function getPeerReviews(employee: Employee): Review[] { const peers = lookupPeers(employee.id); /*...*/ }

export function review(employee: Employee): void {
  getPeerReviews(employee);
  getManagerReview(employee);
}

function getManagerReview(employee: Employee): Review { const manager = lookupManager(employee); /*...*/ }
```

Good — the entry point first, then each helper in the order it is called:
```ts
export function review(employee: Employee): void {
  getPeerReviews(employee);
  getManagerReview(employee);
}

function getPeerReviews(employee: Employee): Review[] { const peers = lookupPeers(employee.id); /*...*/ }
function lookupPeers(employeeId: string): Peer[] { return db.lookup(employeeId, 'peers'); }

function getManagerReview(employee: Employee): Review { const manager = lookupManager(employee); /*...*/ }
function lookupManager(employee: Employee): Manager { return db.lookup(employee, 'manager'); }
```

The same holds inside a React module: the exported component on top, its hooks and render helpers below it.

---

## Import organization

Order:
1. Polyfills / side-effect imports
2. Node built-ins (`fs`, `path`, `util`)
3. External packages (`react`, `express`, `lodash`)
4. Internal path-alias imports (`@/components/...`)
5. Parent-directory relative (`../foo`)
6. Same-directory relative (`./bar`)

Alphabetize within each group. Remove unused imports. Keep `import type` separate from value imports when the distinction matters for bundling:

```ts
import type { ReactNode } from 'react';
import { useState } from 'react';
```

Bad:
```ts
import { TypeDefinition } from '../types/typeDefinition';
import { Customer } from '../model/types';
import fs from 'fs';
import { Container } from 'inversify';
import 'reflect-metadata';
```

Good:
```ts
import 'reflect-metadata';

import fs from 'fs';

import { Container } from 'inversify';

import { Customer } from '../model/types';
import { TypeDefinition } from '../types/typeDefinition';
```

---

## Use typescript path aliases

Deep relative chains are unreadable and break on every file move. Declare an alias in `tsconfig.json` (and mirror it in the bundler config) and use it.

Bad:
```ts
import { UserService } from '../../../services/UserService';
```

Good:
```ts
import { UserService } from '@/services/UserService';
```

---

## Comments: prefer self-explanatory code

Comments are an apology, not a requirement. Good code mostly documents itself.

Bad:
```ts
// Check if subscription is active
if (subscription.endDate > Date.now()) { /*...*/ }
```

Good:
```ts
const isSubscriptionActive = subscription.endDate > Date.now();
if (isSubscriptionActive) { /*...*/ }
```

A type annotation is often the comment you were about to write — write the type instead.

---

## No commented-out code

Bad:
```ts
const user = {
  name: 'Bob',
  email: 'bob@example.com',
  // age: 42,
  // role: 'admin',
};
```

Good:
```ts
const user = {
  name: 'Bob',
  email: 'bob@example.com',
};
```

Use `git` history instead.

---

## No journal comments

Bad:
```ts
/**
 * 2024-01-10: Added retry logic (AK)
 * 2023-11-05: Fixed race condition (JD)
 */
function fetchWithRetry(url: string): Promise<Response> { /*...*/ }
```

Good:
```ts
function fetchWithRetry(url: string): Promise<Response> { /*...*/ }
```

Use `git log` instead.

---

## No positional markers

Bad:
```ts
// =====================
// Public Methods
// =====================
```

Good: just write clean, ordered code. Your IDE handles folding.

---

## No `@ts-ignore`

`@ts-ignore` silences the next line forever, including errors that appear later. If you truly must suppress, use `@ts-expect-error` with a reason — it fails the build once the underlying error is gone.

Bad:
```ts
// @ts-ignore
legacyGlobal.doThing();
```

Good:
```ts
// @ts-expect-error — untyped legacy global, remove once `legacy.d.ts` lands
legacyGlobal.doThing();
```

---

## TODO comments are acceptable

```ts
function getActiveSubscriptions(): Promise<Subscription[]> {
  // TODO: ensure `dueDate` is indexed before deploying
  return db.subscriptions.find({ dueDate: { $lte: new Date() } });
}
```

A TODO is not a license for bad code — it's a tracked, visible flag.
