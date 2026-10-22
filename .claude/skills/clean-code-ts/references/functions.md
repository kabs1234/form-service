# Functions Reference

## Max 2 arguments — use a named options type for more

Bad:
```ts
function createMenu(title: string, body: string, buttonText: string, cancellable: boolean): void { }
createMenu('Foo', 'Bar', 'Baz', true);
```

Good:
```ts
type MenuOptions = {
  title: string;
  body: string;
  buttonText: string;
  cancellable: boolean;
};

function createMenu({ title, body, buttonText, cancellable }: MenuOptions): void { }
createMenu({ title: 'Foo', body: 'Bar', buttonText: 'Baz', cancellable: true });
```

Even better — mark it `readonly` if you don't mutate it:
```ts
function createMenu(options: Readonly<MenuOptions>): void { }
```

---

## Functions should do one thing

Bad:
```ts
function emailActiveClients(clients: Client[]): void {
  clients.forEach((client) => {
    const record = db.lookup(client);
    if (record.isActive()) {
      email(client);
    }
  });
}
```

Good:
```ts
function emailActiveClients(clients: readonly Client[]): void {
  clients.filter(isActiveClient).forEach(email);
}

function isActiveClient(client: Client): boolean {
  return db.lookup(client).isActive();
}
```

---

## Function names say what they do

Bad:
```ts
function addToDate(date: Date, month: number): Date { /*...*/ } // What is added?
addToDate(date, 1);
```

Good:
```ts
function addMonthToDate(date: Date, month: number): Date { /*...*/ }
addMonthToDate(date, 1);
```

---

## One level of abstraction per function

Bad:
```ts
function parseCode(code: string): void {
  const REGEXES = [/*...*/];
  const statements = code.split(' ');
  const tokens: Token[] = [];
  REGEXES.forEach((regex) => {
    statements.forEach((statement) => { tokens.push(/*...*/); });
  });
  const ast: Node[] = [];
  tokens.forEach((token) => { /* lex */ });
  ast.forEach((node) => { /* parse */ });
}
```

Good:
```ts
function parseCode(code: string): void {
  const tokens = tokenize(code);
  const syntaxTree = parse(tokens);
  syntaxTree.forEach((node) => { /* parse */ });
}

function tokenize(code: string): Token[] { /*...*/ }
function parse(tokens: readonly Token[]): Node[] { /*...*/ }
```

---

## No duplicate code — abstract shared logic

Bad:
```ts
function showDeveloperList(developers: Developer[]): void {
  developers.forEach((developer) => {
    render({
      salary: developer.calculateSalary(),
      experience: developer.getExperience(),
      github: developer.getGithubLink(),
    });
  });
}

function showManagerList(managers: Manager[]): void {
  managers.forEach((manager) => {
    render({
      salary: manager.calculateSalary(),
      experience: manager.getExperience(),
      portfolio: manager.getMBAProjects(),
    });
  });
}
```

Good — a shared abstraction plus a polymorphic hook:
```ts
type Employee = {
  calculateSalary(): number;
  getExperience(): number;
  getExtraDetails(): Record<string, unknown>;
};

function showEmployeeList(employees: readonly Employee[]): void {
  employees.forEach((employee) => {
    render({
      salary: employee.calculateSalary(),
      experience: employee.getExperience(),
      extra: employee.getExtraDetails(),
    });
  });
}
```

---

## Set defaults with spread or destructuring

Bad:
```ts
function createMenu(config: MenuConfig): void {
  config.title = config.title || 'Foo';
  config.body = config.body || 'Bar';
}
```

Good:
```ts
function createMenu(config: Partial<MenuConfig>): void {
  const settings: MenuConfig = { title: 'Foo', body: 'Bar', ...config };
}

// Or with destructuring defaults:
function createMenu({ title = 'Foo', body = 'Bar' }: Partial<MenuConfig> = {}): void { }
```

---

## No boolean flag params

Bad:
```ts
function createFile(name: string, temp: boolean): void {
  if (temp) {
    fs.create(`./temp/${name}`);
  } else {
    fs.create(name);
  }
}
```

Good:
```ts
function createTempFile(name: string): void { fs.create(`./temp/${name}`); }
function createFile(name: string): void { fs.create(name); }
```

---

## No side effects — don't mutate inputs

Bad:
```ts
function addItemToCart(cart: CartItem[], item: Item): void {
  cart.push({ item, date: Date.now() }); // mutates the caller's array
}
```

Good — `readonly` makes the compiler enforce it:
```ts
function addItemToCart(cart: readonly CartItem[], item: Item): CartItem[] {
  return [...cart, { item, date: Date.now() }];
}
```

---

## Don't write to global prototypes

Bad:
```ts
declare global {
  interface Array<T> {
    diff(other: T[]): T[];
  }
}

Array.prototype.diff = function <T>(other: T[]): T[] { /*...*/ };
```

Good:
```ts
class MyArray<T> extends Array<T> {
  diff(other: readonly T[]): T[] { /*...*/ }
}
```

---

## Favor functional programming

Bad:
```ts
let total = 0;
for (let i = 0; i < contributions.length; i++) {
  total += contributions[i].linesOfCode;
}
```

Good:
```ts
const total = contributions.reduce((sum, contribution) => sum + contribution.linesOfCode, 0);
```

---

## Encapsulate conditionals

Bad:
```ts
if (subscription.isTrial || account.balance > 0) { /*...*/ }
```

Good:
```ts
function canActivateService(subscription: Subscription, account: Account): boolean {
  return subscription.isTrial || account.balance > 0;
}

if (canActivateService(subscription, account)) { /*...*/ }
```

---

## Avoid negative conditionals

Bad:
```ts
function isEmailNotUsed(email: string): boolean { /*...*/ }
if (isEmailNotUsed(email)) { /*...*/ }
```

Good:
```ts
function isEmailUsed(email: string): boolean { /*...*/ }
if (!isEmailUsed(email)) { /*...*/ }
```

---

## Avoid type-checking — use polymorphism or discriminated unions

Bad:
```ts
function travelToTexas(vehicle: Bicycle | Car): void {
  if (vehicle instanceof Bicycle) {
    vehicle.pedal(currentLocation, new Location('texas'));
  } else if (vehicle instanceof Car) {
    vehicle.drive(currentLocation, new Location('texas'));
  }
}
```

Good — a common interface:
```ts
type Vehicle = {
  move(from: Location, to: Location): void;
};

function travelToTexas(vehicle: Vehicle): void {
  vehicle.move(currentLocation, new Location('texas'));
}
```

When the variants really are data, use a discriminated union and let the compiler check exhaustiveness:
```ts
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'square': return shape.side ** 2;
    default: {
      const exhaustive: never = shape;
      throw new Error(`Unhandled shape: ${JSON.stringify(exhaustive)}`);
    }
  }
}
```

---

## Don't over-optimize — let the type system and the engine work

Bad:
```ts
// The engine already caches `list.length`.
for (let i = 0, length = list.length; i < length; i++) { /*...*/ }
```

Good:
```ts
for (let i = 0; i < list.length; i++) { /*...*/ }
```

---

## Remove dead code

Bad:
```ts
function oldRequestModule(url: string): void { }
function requestModule(url: string): void { }
const request = requestModule;
```

Good:
```ts
function requestModule(url: string): void { }
const request = requestModule;
```

---

## Use generics instead of `any` for reusable helpers

Bad:
```ts
function first(items: any[]): any {
  return items[0];
}
```

Good:
```ts
function first<TItem>(items: readonly TItem[]): TItem | undefined {
  return items[0];
}
```

Constrain the parameter when the helper depends on shape:
```ts
function byId<TEntity extends { id: string }>(entities: readonly TEntity[]): Map<string, TEntity> {
  return new Map(entities.map((entity) => [entity.id, entity]));
}
```

---

## Use generators for lazy streams

Bad:
```ts
function fibonacci(n: number): number[] {
  const items = [0, 1];
  while (items.length < n) {
    items.push(items[items.length - 2] + items[items.length - 1]);
  }
  return items;
}
```

Good:
```ts
function* fibonacci(): Generator<number, void, unknown> {
  let [current, next] = [0, 1];
  while (true) {
    yield current;
    [current, next] = [next, current + next];
  }
}
```