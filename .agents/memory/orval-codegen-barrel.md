---
name: Orval codegen barrel collision fix
description: After every codegen run, lib/api-zod/src/index.ts must be manually overwritten or builds fail with TS2308 name collision errors.
---

## The rule
After running `pnpm --filter @workspace/api-spec run codegen`, immediately overwrite `lib/api-zod/src/index.ts`:

```ts
export * from "./generated/api";
```

Do NOT include `export * from "./generated/types"`.

**Why:** Orval in split mode generates TypeScript interfaces in `generated/types/` AND Zod schemas in `generated/api.ts`, both named the same thing (e.g. `ListCompletedLessonsParams`). The default barrel re-exports both, causing TS2308 collision. Orval also regenerates the barrel file on each run, so the fix must be re-applied every time codegen runs.

**How to apply:** Run codegen via `pnpm exec orval --config ./orval.config.ts` (orval only, no typecheck), then overwrite the barrel, then run `pnpm run typecheck:libs`. Alternatively run the full codegen script and immediately fix the barrel before any typecheck.
