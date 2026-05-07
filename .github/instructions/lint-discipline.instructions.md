---
description: Lint discipline for NexReel. Use whenever writing or editing JS/TS/JSX/TSX/Python code in this repo.
applyTo: '**/*.{js,jsx,ts,tsx,py}'
---

# Lint Discipline — NO suppression comments

> ⚠️ **Hard rule — no exceptions.** Never add comments that suppress, disable,
> or silence linter / type checker warnings. Fix the underlying cause instead.

## Forbidden patterns

Do **not** introduce any of the following (non-exhaustive):

- `// eslint-disable-next-line ...`
- `// eslint-disable-line ...`
- `/* eslint-disable ... */` and `/* eslint-enable ... */` blocks
- `/* eslint-disable-next-line ... */`
- `// @ts-ignore`, `// @ts-expect-error`, `// @ts-nocheck`
- `// prettier-ignore`
- `# noqa`, `# type: ignore`, `# pylint: disable=...`, `# flake8: noqa`
- Any other inline directive whose purpose is to hide a linter / type checker
  message.

This applies to **new code, edits, and refactors**. If existing suppression
comments are present in the area you are editing, leave them only if removing
them is out of scope; never add new ones.

## Required behavior

When the linter complains, fix the root cause:

- Unused variable / parameter → remove it (and update call sites), or actually
  use it. Do not silence with `eslint-disable no-unused-vars`.
- Unused import → delete the import.
- Missing hook dependency → add the dependency, restructure the effect, or
  hoist the value with `useCallback` / `useMemo`. Do not silence with
  `react-hooks/exhaustive-deps`.
- Type error → fix the type, narrow the value, or adjust the signature. Do not
  silence with `@ts-ignore` / `@ts-expect-error`.

## If suppression seems unavoidable

Stop and ask the user before introducing any disable comment. Provide:

1. The exact rule that fires.
2. Why a real fix is not feasible in this scope.
3. The proposed suppression (rule + scope + justification).

Only add the comment if the user explicitly approves it.
