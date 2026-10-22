---
allowed-tools: Bash(git:*), Read, Grep
description: Analyze git changes and organize into logically grouped Conventional Commits, or amend an existing commit message
argument-hint: Optional commit hash to amend (e.g. d0551b2a8b073e57acd7abd6167d23834ab8996d)
---

## Mode detection

If a commit hash argument is provided → go to **Amend mode**.
Otherwise → go to **Create mode**.

---

## CRITICAL: Commit attribution

**NEVER add any of the following to commit messages:**

- `Co-Authored-By: Claude <noreply@anthropic.com>` or any other model variant
- `🤖 Generated with Claude Code`
- Any mention of Claude, Anthropic, AI assistants, or LLMs in trailers

When running `git commit` or `git commit --amend`, pass ONLY the header and (optionally) the body. Do not append an extra `-m` with a co-author trailer.

---

## Commit message rules (apply to BOTH modes)

Messages follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

Format:

```
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
```

### Type

Required. One of:

| Type       | Use for                                                  |
| ---------- | -------------------------------------------------------- |
| `feat`     | A new feature                                            |
| `fix`      | A bug fix                                                |
| `docs`     | Documentation only (README, CLAUDE.md, AI log)           |
| `style`    | Formatting, whitespace, semicolons — no behaviour change |
| `refactor` | Code change that neither fixes a bug nor adds a feature  |
| `perf`     | Performance improvement                                  |
| `test`     | Adding or correcting tests                               |
| `build`    | Build system, Vite/Tailwind config, or dependencies      |
| `ci`       | GitHub Actions configuration                             |
| `chore`    | Housekeeping that doesn't touch app code or tests        |
| `revert`   | Reverts a previous commit                                |

### Scope

Optional. A noun in parentheses naming the affected area, lowercase: `feat(builder):`, `fix(storage):`.

Scopes that fit this repository: `server`, `api`, `storage`, `shared`, `admin`, `builder`, `public-form`, `responses`, `analytics`, `ui`, `deps`, `claude`.

Use a scope when it narrows the change usefully. Omit it when the change is repo-wide or the type alone is clear.

### Description

- Lowercase first letter, unless it starts with a proper noun or identifier (`fix: Express 5 SPA fallback…`)
- Imperative, present tense: `add`, `fix`, `remove` — NOT `added`, `adds`, `adding`
- No trailing period
- Header (type + scope + description) stays within 72 characters
- Says what the change does, specifically — not `update stuff`, not `various fixes`

### Breaking changes

Mark with `!` before the colon, a `BREAKING CHANGE:` footer, or both:

```
feat(api)!: return 404 instead of 403 for unpublished forms

BREAKING CHANGE: clients can no longer tell an unpublished form apart
from an unknown slug.
```

### Body

Optional. Add it only when the header alone is not self-explanatory.

- Separated from the header by one blank line
- Explains **what** changed and **why**, not how — the diff shows how
- Wrapped at ~72 characters; bullet points are fine
- Plain sentences, no `TYPE:` prefixes repeated inside

### Footers

Optional, after a blank line following the body: `BREAKING CHANGE: <description>`, `Refs: #123`, `Reverts: <hash>`. Never an AI attribution trailer (see above).

### Examples

```
feat(builder): add up/down reordering for form fields
```

```
fix(storage): serialize db writes through a single queue

Two submissions arriving together each read the same in-memory state
and the second write overwrote the first. Writes now go through one
promise chain, and each write replaces db.json atomically via rename.
```

```
feat(analytics): show last field before quitting for abandoned sessions
```

```
build(deps): pin vite to v6 for Node 20.0 support
```

```
docs: explain the drop-off analytics in the README
```

Wrong:

- `Added form builder` — past tense, capitalised, no type
- `feat: Add form builder.` — capitalised description, trailing period
- `FEAT: add form builder` — type must be lowercase
- `fix: update stuff` — says nothing about what changed
- `deps: add zod` — `deps` is not a valid type; use `build(deps):`
- `feat(builder): reordering` — noun instead of an imperative verb
- `fix: исправлена отправка формы` — English only

---

## Amend mode

### 1. Read the existing commit

```
git log -1 --format="%B" <COMMIT_HASH>
```

### 2. Analyze the current message

Check the existing header and body against the commit message rules above. Identify what needs to change:

- Wrong, missing, or non-conventional type (`deps:`, `TYPE:`, no type at all)?
- Description not lowercase imperative, or ending in a period?
- Header over 72 characters?
- Scope missing where it would help, or wrong?
- A breaking change not marked with `!` or a `BREAKING CHANGE:` footer?
- Body bullets violating the rules?

### 3. Also read the diff to understand the actual changes

```
git show --stat <COMMIT_HASH>
git show <COMMIT_HASH>
```

### 4. Present the amended message

```
Current message:
<current message as-is>

Proposed message:
<type>(<scope>): <description>

<body line 1>
<body line 2>

Files: file1.ts, file2.tsx

Continue? [y/n]
```

Wait for the user to confirm. If the user says `n` or requests changes, adjust and show again.

### 5. Execute the amend

If the commit is the latest (HEAD):

```
git commit --amend -m "<type>(<scope>): <description>" -m "<body>"
```

If the commit is NOT HEAD, use a non-interactive rebase:

```
GIT_SEQUENCE_EDITOR="sed -i 's/^pick <SHORT_HASH>/reword <SHORT_HASH>/'" git rebase -i <COMMIT_HASH>~1
```

Then when the editor opens, apply the new message.

**Reminder:** do not add `Co-Authored-By` or any AI trailer to `--amend`.

---

## Create mode

### 1. Gather all changes

```
git status
git diff HEAD
git diff --cached
```

### 2. Analyze semantic intent

Read every changed file's diff carefully. For each change ask:

- What feature, fix, or refactor does this serve?
- Is this change coupled to another file's change (they must go together), or is it independent?
- Would splitting produce a more meaningful git history — or just noise?

Grouping rules:

- Changes to the same component, page, or module → likely one commit
- A UI change plus the API endpoint or shared schema it needs → one commit
- An unrelated bugfix alongside a feature → separate commits
- Dependency additions that a feature needs → `build(deps):`, separate from the feature commit
- Exported AI logs in `docs/ai-log/` → their own `docs:` commit
- Do NOT group by file type or technical layer (e.g. don't put all server files together just because they're server files)

One commit per type: a group that would need two types in its header is really two commits.

If all changes logically belong together — make one commit. Never split artificially.

### 3. Present the commit plan

Before touching anything, output the full plan in this format:

```
Proposed commits (N):

[1] feat(storage): add JSON storage with write queue and atomic writes

Files: server/storage.ts

[2] build(deps): add zod

Files: package.json, package-lock.json

Continue? [y/n]
```

Wait for the user to confirm before proceeding. If the user says `n` or requests changes, adjust the plan accordingly and show it again.

### 4. Execute commits

Commit on the current branch. Never create or switch branches — this is a single-developer repository that works directly on `main`.

For each group in order:

1. Stage only the relevant files: `git add <file1> <file2> ...`
2. Commit with the generated message including body:

```
git commit -m "<type>(<scope>): <description>" -m "<body>"
```

**Reminder:** do not add `Co-Authored-By: Claude` or any AI trailer. Pass only `-m` with the header and (optionally) `-m` with the body.
