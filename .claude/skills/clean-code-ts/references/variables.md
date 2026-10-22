# Variables & Naming Reference

## Use meaningful variable names

Bad:
```ts
function between<T>(a1: T, a2: T, a3: T): boolean {
  return a2 <= a1 && a1 <= a3;
}
```

Good:
```ts
function between<T>(value: T, left: T, right: T): boolean {
  return left <= value && value <= right;
}
```

---

## Use pronounceable names

Bad:
```ts
type DtaRcrd = {
  genymdhms: Date;
  modymdhms: Date;
  pszqint: number;
};
```

Good:
```ts
type Customer = {
  generationTimestamp: Date;
  modificationTimestamp: Date;
  recordId: number;
};
```

---

## Use same vocabulary for same type

Bad:
```ts
function getUserInfo(): User { /*...*/ }
function getUserDetails(): User { /*...*/ }
function getUserData(): User { /*...*/ }
```

Good:
```ts
function getUser(): User { /*...*/ }
```

---

## Use searchable names (no magic numbers)

Bad:
```ts
setTimeout(restart, 86_400_000);
```

Good:
```ts
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
setTimeout(restart, MILLISECONDS_PER_DAY);
```

---

## Use explanatory variables / destructure

Bad:
```ts
declare const users: Map<string, User>;
for (const keyValue of users) { /*...*/ }
```

Good:
```ts
for (const [id, user] of users) { /*...*/ }
```

---

## Avoid mental mapping (explicit over implicit)

Bad:
```ts
const u = getUser();
const s = getSubscription();
const t = charge(u, s);
```

Good:
```ts
const user = getUser();
const subscription = getSubscription();
const transaction = charge(user, subscription);
```

---

## Don't add unneeded context

Bad:
```ts
type Car = {
  carMake: string;
  carModel: string;
  carColor: string;
};
```

Good:
```ts
type Car = {
  make: string;
  model: string;
  color: string;
};
```

Same for type names — don't prefix interfaces with `I` (`User`, not `IUser`).

---

## Use default parameters

Bad:
```ts
function loadPages(count?: number): void {
  const loadCount = count !== undefined ? count : 10;
}
```

Good:
```ts
function loadPages(count: number = 10): void { /*...*/ }
```

---

## Use enums (or `as const`) to document intent

Bad:
```ts
const GENRE = { ROMANTIC: 'romantic', DRAMA: 'drama' };

if (movie.genre === 'romantic') { /* typo-prone, no autocomplete */ }
```

Good:
```ts
enum Genre {
  Romantic = 'romantic',
  Drama = 'drama',
}

if (movie.genre === Genre.Romantic) { /*...*/ }
```

Or, when you want a plain-object shape with no runtime enum:
```ts
const GENRE = {
  Romantic: 'romantic',
  Drama: 'drama',
} as const;

type Genre = (typeof GENRE)[keyof typeof GENRE]; // 'romantic' | 'drama'
```

---

## Never `any` — use `unknown` and narrow

Bad:
```ts
function parse(payload: any) {
  return payload.data.items;   // no safety at all
}
```

Good:
```ts
function parse(payload: unknown): Item[] {
  if (!isApiResponse(payload)) {
    throw new Error('Unexpected payload shape.');
  }
  return payload.data.items;
}

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === 'object' && value !== null && 'data' in value;
}
```

---

## Model absence explicitly, don't assert it away

Bad:
```ts
const user = users.find((candidate) => candidate.id === id)!;
console.log(user.name); // crashes at runtime when not found
```

Good:
```ts
const user = users.find((candidate) => candidate.id === id);
if (!user) {
  throw new Error(`No user with id ${id}.`);
}
console.log(user.name);
```