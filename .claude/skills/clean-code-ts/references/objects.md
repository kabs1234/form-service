# Objects & Data Structures Reference

## Prefer immutability: `readonly`, `ReadonlyArray`, `as const`

Bad:
```ts
type Config = {
  host: string;
  port: number;
};

const config: Config = { host: 'localhost', port: 3000 };
config.host = 'production.example.com'; // mutated silently
```

Good:
```ts
type Config = {
  readonly host: string;
  readonly port: number;
};

const config: Config = { host: 'localhost', port: 3000 };
// config.host = '...'  → compile error
```

For arrays:
```ts
// Bad — mutates the caller's data
function addItem(cart: CartItem[], item: CartItem): void {
  cart.push(item);
}

// Good — the signature forbids mutation, returns a new array
function addItem(cart: readonly CartItem[], item: CartItem): CartItem[] {
  return [...cart, item];
}
```

Freeze whole literal structures with `as const`, and derive the type from the data instead of repeating it:
```ts
const ROUTES = {
  home: '/',
  projects: '/projects',
} as const;

type Route = (typeof ROUTES)[keyof typeof ROUTES]; // '/' | '/projects'
```

`Readonly<T>` and `ReadonlyArray<T>` wrap existing types without rewriting them — useful for props:
```ts
function ProjectCard(props: Readonly<ProjectCardProps>): JSX.Element { /*...*/ }
```

---

## Validate at the boundary, not at every call site

Without classes to hold getters and setters, the equivalent discipline is a single named function that owns the rule — then nothing downstream re-checks it.

Bad — the same validation copy-pasted wherever a balance is set:
```ts
if (value < 0) {
  throw new Error('Cannot set negative balance.');
}
const account = { ...previous, balance: value };
```

Good — one factory owns the invariant, and the type says the result is safe:
```ts
type Account = {
  readonly balance: number;
};

function withBalance(account: Account, value: number): Account {
  if (value < 0) {
    throw new Error('Cannot set negative balance.');
  }
  return { ...account, balance: value };
}
```

---

## `type` vs `interface`

Default to `type`. It expresses everything object shapes need plus unions, intersections, tuples, and mapped and conditional types:
```ts
type EmailConfig = { email: string };
type DbConfig = { databaseUrl: string };
type Config = EmailConfig | DbConfig;

type Callback<TResult> = (error: Error | null, result: TResult) => void;

type ProjectCardProps = {
  readonly title: string;
  readonly tags: readonly string[];
};
```

Reach for `interface` only when you need declaration merging — mainly to augment a library's types:
```ts
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof en };
  }
}
```

Pick one and stay consistent within a file. Don't declare the same shape both ways.

---

## Don't add unneeded context to object properties

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
