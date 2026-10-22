# Concurrency Reference

## Prefer Promises over callbacks

Bad:
```ts
function downloadPage(
  url: string,
  saveTo: string,
  callback: (error: Error | null, content?: string) => void,
): void {
  get(url, (error, response) => {
    if (error) { callback(error); return; }
    writeFile(saveTo, response.body, (error) => {
      if (error) { callback(error); return; }
      callback(null, response.body);
    });
  });
}
```

Good:
```ts
import { promisify } from 'util';

const write = promisify(writeFile);

function downloadPage(url: string, saveTo: string): Promise<string> {
  return get(url).then((response) => write(saveTo, response.body).then(() => response.body));
}
```

---

## Prefer async/await over promise chains

Bad:
```ts
function downloadPage(url: string, saveTo: string): Promise<string> {
  return get(url).then((response) => write(saveTo, response));
}

downloadPage(url, 'article.html')
  .then((content) => console.log(content))
  .catch((error) => console.error(error));
```

Good:
```ts
async function downloadPage(url: string, saveTo: string): Promise<string> {
  const response = await get(url);
  await write(saveTo, response);
  return response;
}

try {
  const content = await downloadPage(url, 'article.html');
  console.log(content);
} catch (error: unknown) {
  logger.error(error);
}
```

---

## Always type the resolved value

Never `Promise<any>`. An async function's return type is the contract every caller reads.

Bad:
```ts
async function fetchUser(id: string): Promise<any> {
  const response = await fetch(`/users/${id}`);
  return response.json();
}
```

Good:
```ts
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/users/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to load user ${id}: ${response.status}`);
  }
  return (await response.json()) as User;
}
```

Better still, validate the shape at the boundary rather than casting (see `variables.md` — "Never `any`").

---

## Don't await in a loop when the work is independent

Bad:
```ts
const users: User[] = [];
for (const id of ids) {
  users.push(await fetchUser(id));   // serial round-trips
}
```

Good:
```ts
const users = await Promise.all(ids.map((id) => fetchUser(id)));
```

---

## Promise helpers worth knowing

| Helper | Use case | Resolved type |
|---|---|---|
| `Promise.resolve(value)` | Wrap a value in a resolved promise | `Promise<T>` |
| `Promise.reject(error)` | Wrap an error in a rejected promise | `Promise<never>` |
| `Promise.all(promises)` | Run in parallel, fail fast | `Promise<T[]>` (tuple-typed for tuples) |
| `Promise.allSettled(promises)` | Run in parallel, collect every outcome | `Promise<PromiseSettledResult<T>[]>` |
| `Promise.race(promises)` | First settled wins (useful for timeouts) | `Promise<T>` |
| `Promise.any(promises)` | First *fulfilled* wins | `Promise<T>` |
