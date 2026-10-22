---
name: clean-code-ts
description: >
  Enforce clean code principles when writing, reviewing, or refactoring TypeScript.
  Use this skill whenever writing new TS/TSX functions, components, types, modules,
  or reviewing existing code. Triggers on: "write a function", "refactor this",
  "clean up", "review my code", "how should I structure", "best way to write",
  or any TS code generation task. Always apply these rules proactively — don't
  wait to be asked.
---

# Clean Code TypeScript

Adapted from [labs42io/clean-code-typescript](https://github.com/labs42io/clean-code-typescript).

Apply these rules to every `.ts` / `.tsx` file you write or touch. They are not optional style preferences — they are the standard. If generated code violates any of these, rewrite before delivering.

Read the full rule reference when you need examples or edge case guidance:

- **Variables & Naming** → `references/variables.md`
- **Functions** → `references/functions.md`
- **Objects & Data Structures** → `references/objects.md`
- **Error Handling** → `references/errors.md`
- **Concurrency** → `references/concurrency.md`
- **Testing** → `references/testing.md`
- **Formatting & Comments** → `references/formatting.md`

---

## Non-Negotiable Rules (memorize these)

### Types

- **Never `any`** — use `unknown` and narrow, or write the real type
- Default to `type` (unions, intersections, mapped types); reach for `interface` only when you need declaration merging
- Use `enum` (or a `const` object + `as const`) to document intent instead of bare string literals
- Mark everything you don't mutate `readonly` / `ReadonlyArray<T>` / `as const`
- Let inference do its job for locals; annotate function params, return types, and exported values
- Use generics with meaningful names (`TItem`, not `T2`) and constrain them (`<T extends { id: string }>`)
- Keep `strict` (especially `strictNullChecks`) on — model absence with `| undefined`, not with lies
- No non-null assertions (`!`) or `as` casts to silence the compiler — narrow properly

### Naming

- Names must be **meaningful, pronounceable, and searchable**
- No single-letter vars (`a`, `u`, `s`) outside loop counters and short generic params
- No cryptic abbreviations (`genymdhms`, `DtaRcrd`)
- Use the **same word** for the same concept (`getUser`, not `getUserInfo` / `getUserData` / `getUserDetails`)
- Named constants for magic numbers: `const MILLISECONDS_PER_DAY = 86_400_000`
- No redundant context: `car.make` not `car.carMake`
- No Hungarian/type prefixes: `User` not `IUser`, `props` not `oProps`
- Destructure iterables: `for (const [id, user] of users)` not `for (const kv of users)`

### Functions

- **Max 2 arguments** — use a named options `type` if you need more
- **Do one thing only** — if you can describe what it does with "and", split it
- **One level of abstraction per function** — no mixing high-level orchestration with low-level detail
- **No boolean flag params** — split into two functions instead
- **No side effects** — don't mutate inputs; return new values
- **No global pollution** — never write to `Array.prototype` or other globals
- Favor `map/filter/reduce` over imperative loops
- Encapsulate complex conditionals into named functions: `if (canActivateService(sub, account))`
- Prefer discriminated unions + `switch` over `instanceof` / `typeof` chains
- Avoid negative conditionals: `isEmailUsed` not `isEmailNotUsed`
- Use default parameters: `function load(count = 10)` not `count !== undefined ? count : 10`
- Use spread for default config objects

### Objects & Data

- Prefer immutability: `readonly` fields, `const arr = [...old, newItem]` not `arr.push(newItem)`
- Prefer `as const` / `Object.freeze` for config objects
- Keep data shapes flat and named — a `type` beats an inline object literal repeated twice

### Error Handling

- Always `throw new Error('...')` — never throw strings or plain objects
- `catch (error: unknown)` — narrow with `instanceof Error` before touching `.message`
- Never swallow errors with empty catch blocks
- Never `console.log` errors — use a logger or re-throw
- Handle rejected promises — never leave `.catch` off a promise chain

### Concurrency

- Prefer `async/await` over raw promise chains
- Prefer Promises over callbacks
- Type async functions as `Promise<T>`, never `Promise<any>`

### Formatting & Comments

- `camelCase` for vars/functions, `PascalCase` for classes/types/interfaces/enums/components, `SCREAMING_SNAKE_CASE` for constants
- Caller functions immediately above callees
- Alphabetize and group imports (polyfills → node builtins → external → internal alias → relative)
- Use path aliases (`@/`) over deep `../../..` chains
- No commented-out code — use git
- No journal comments — use `git log`
- No positional markers (`// ===== section =====`)
- No comments explaining _what_ the code does — rename instead
- `// TODO:` is acceptable for tracked future work
- No `@ts-ignore` — use `@ts-expect-error` with a reason, and only as a last resort

### Dead Code

- Delete unused functions, variables, types, and imports immediately
- No `oldRequestModule` sitting next to `requestModule`

---

## Quick Self-Check Before Delivering Code

Before outputting any TS, ask yourself:

1. Is there an `any`, a `!`, or a silencing `as` cast? → type it properly
2. Would a teammate understand every name without context?
3. Does each function do exactly one thing?
4. Are there more than 2 params? → use a named options type
5. Did I mutate any input? → return a new value, mark params `readonly`
6. Is there a magic number or bare string literal? → named constant or enum
7. Is there an empty or `console.log`-only catch block? → fix it
8. Is there commented-out code? → delete it
9. Are there boolean flag params? → split into separate functions

If any answer is "yes", fix it before delivering.