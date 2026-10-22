# Testing Reference

Testing is more important than shipping. No tests means every deploy is a guess. Aim for high coverage of behavior, not of lines.

## The three laws of TDD

1. Write no production code until you have a failing test.
2. Write no more of a test than is sufficient to fail — a compile error counts as a failure.
3. Write no more production code than is sufficient to pass the current failing test.

## F.I.R.S.T. rules

- **Fast** — slow tests get skipped, and skipped tests rot.
- **Independent** — no shared state, any order, any subset.
- **Repeatable** — same result on CI, on a plane, on a Friday. No wall clock, no network, no random.
- **Self-validating** — pass or fail, never "read the log and decide".
- **Timely** — written alongside the code, not after the bug ships.

---

## Single concept per test

Bad:
```ts
import { AwesomeDate } from './awesomeDate';

describe('AwesomeDate', () => {
  it('handles date boundaries', () => {
    let date = new AwesomeDate('1/1/2015');
    expect(date.addDays(30).toString()).toBe('1/31/2015');

    date = new AwesomeDate('2/1/2016');
    expect(date.addDays(28).toString()).toBe('2/29/2016');

    date = new AwesomeDate('2/1/2015');
    expect(date.addDays(28).toString()).toBe('3/1/2015');
  });
});
```

Good — each failure names its own cause:
```ts
import { AwesomeDate } from './awesomeDate';

describe('AwesomeDate', () => {
  it('adds 30 days across a month boundary', () => {
    const date = new AwesomeDate('1/1/2015');
    expect(date.addDays(30).toString()).toBe('1/31/2015');
  });

  it('handles leap years', () => {
    const date = new AwesomeDate('2/1/2016');
    expect(date.addDays(28).toString()).toBe('2/29/2016');
  });

  it('handles non-leap years', () => {
    const date = new AwesomeDate('2/1/2015');
    expect(date.addDays(28).toString()).toBe('3/1/2015');
  });
});
```

---

## The name of the test should reveal the intent

A failing test's name should tell you what broke without opening the file.

Bad:
```ts
describe('Calendar', () => {
  it('2/29/2020', () => { /*...*/ });
  it('throws', () => { /*...*/ });
});
```

Good:
```ts
describe('Calendar', () => {
  it('accepts February 29th in a leap year', () => { /*...*/ });
  it('rejects a date before the epoch with a RangeError', () => { /*...*/ });
});
```

---

## Arrange, Act, Assert

Keep the three phases visually separate; one blank line is enough.

```ts
it('applies the discount to the cart total', () => {
  // Arrange
  const cart = createCart([{ price: 100 }, { price: 50 }]);
  const discount = new PercentageDiscount(10);

  // Act
  const total = discount.applyTo(cart);

  // Assert
  expect(total).toBe(135);
});
```

---

## Type your test doubles

A fake typed against the real interface breaks at compile time when the interface changes — which is the whole point.

Bad:
```ts
const repository: any = { findById: () => Promise.resolve(user) };
```

Good:
```ts
const repository: Repository<User> = {
  findById: () => Promise.resolve(user),
  save: () => Promise.resolve(),
};
```

With `jest.Mocked<T>` when you need assertions on the calls:
```ts
const repository = {
  findById: jest.fn<Promise<User | undefined>, [string]>(),
  save: jest.fn<Promise<void>, [User]>(),
} satisfies Repository<User>;
```

---

## Test behavior, not implementation

Assert on what a caller can observe — the return value, the rendered output, the message sent. A test that asserts on private fields or call order breaks on every refactor while catching nothing.
