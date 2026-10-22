# Error Handling Reference

## Always throw Error objects, never strings

Bad:
```ts
function calculateTotal(items: readonly Item[]): number {
  throw 'Not implemented.';
}

function get(): Promise<Item[]> {
  return Promise.reject('Not implemented.');
}
```

Good:
```ts
function calculateTotal(items: readonly Item[]): number {
  throw new Error('Not implemented.');
}

function get(): Promise<Item[]> {
  return Promise.reject(new Error('Not implemented.'));
}

// Or with async/await:
async function get(): Promise<Item[]> {
  throw new Error('Not implemented.');
}
```

Why: `Error` objects carry a `.stack` trace. Thrown strings are impossible to trace.

---

## Type caught errors as `unknown` and narrow

With `useUnknownInCatchVariables` (part of `strict`), `error` is `unknown` — narrow it before use rather than casting.

Bad:
```ts
try {
  doSomething();
} catch (error) {
  logger.error((error as Error).message);   // lies when a non-Error is thrown
}
```

Good:
```ts
try {
  doSomething();
} catch (error: unknown) {
  logger.error(error instanceof Error ? error.message : String(error));
  throw error;
}
```

---

## Subclass Error for domain failures

Custom error types let callers distinguish failures without string-matching messages.

```ts
class NotFoundError extends Error {
  constructor(public readonly resourceId: string) {
    super(`Resource ${resourceId} not found.`);
    this.name = 'NotFoundError';
  }
}

try {
  await loadResource(id);
} catch (error: unknown) {
  if (error instanceof NotFoundError) {
    renderEmptyState(error.resourceId);
    return;
  }
  throw error;
}
```

---

## Never swallow caught errors

Bad:
```ts
try {
  doSomething();
} catch (error) {
  console.log(error);   // disappears in log noise
}

try {
  doSomething();
} catch (error) {
  // ignored completely
}
```

Good:
```ts
import { logger } from './logging';

try {
  doSomething();
} catch (error: unknown) {
  logger.error(error);   // surfaces to monitoring
  throw error;           // or re-throw if the caller needs to handle it
}
```

---

## Never ignore rejected promises

Bad:
```ts
getUser()
  .then((user) => sendEmail(user.email, 'Welcome!'))
  .catch((error) => console.log(error));   // buried in the console
```

Good:
```ts
import { logger } from './logging';

getUser()
  .then((user) => sendEmail(user.email, 'Welcome!'))
  .catch((error: unknown) => logger.error(error));

// Or with async/await:
try {
  const user = await getUser();
  await sendEmail(user.email, 'Welcome!');
} catch (error: unknown) {
  logger.error(error);
}
```

---

## Optional: Result type pattern (typed failures, no exceptions)

For *expected* failures, a discriminated union makes the failure part of the signature — the compiler forces callers to handle it.

```ts
type Result<TValue, TError = string> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };

function calculateTotal(items: readonly Item[]): Result<number, 'empty'> {
  if (items.length === 0) {
    return { ok: false, error: 'empty' };
  }
  return { ok: true, value: items.reduce((sum, item) => sum + item.price, 0) };
}

const result = calculateTotal(cart);
if (!result.ok) {
  handleEmpty();
} else {
  displayTotal(result.value);   // narrowed to number
}
```

Reserve `throw` for genuinely exceptional conditions — bugs, broken invariants, unreachable states.
