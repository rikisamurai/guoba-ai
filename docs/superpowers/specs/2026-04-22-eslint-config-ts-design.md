---
title: Per-workspace eslint.config.ts refactor
date: 2026-04-22
status: approved
---

# Per-workspace `eslint.config.ts` Refactor

## Goal

Replace the single root `eslint.config.mjs` with a TypeScript-based ESLint flat config split into one config per workspace, plus a shared root factory. Bring `apps/docs` into lint coverage. Keep both root-level and per-workspace lint commands working.

## Background

Current state (as of 2026-04-22, branch `worktree-eslint-config-ts`):

- Single root config: `eslint.config.mjs` calling `antfu({ type: 'lib', typescript: true, ignores: ['docs/**', '**/next-env.d.ts'] })`
- Three workspaces: `packages/guoba-utils` (pure TS lib), `packages/guoba-hook` (React hook lib, React 18+ peerDep), `apps/docs` (Next.js 16 + fumadocs + Tailwind v4)
- Root `pnpm lint` = `eslint .`; no per-workspace lint scripts
- `apps/docs` is currently excluded from lint
- Toolchain: ESLint v10.2.0, `@antfu/eslint-config` v8.2.0, Node >= 24, ESM-only, `verbatimModuleSyntax`

ESLint flat config does **not** auto-merge configs from subdirectories — only the nearest `eslint.config.*` to the CLI's CWD is loaded per run. Any "per-workspace config" design must work with that constraint.

## Decisions

1. **Sharing strategy**: a root factory `eslint.base.ts` exports `createConfig()`; each workspace's `eslint.config.ts` imports it and layers package-specific options/rules. No internal `@guoba-ai/eslint-config` package — overkill for current scale.
2. **`apps/docs` is in scope**: gets its own config with React/Next-friendly rules; ignores TypeDoc-generated mdx and fumadocs `.source/`.
3. **Both lint command shapes**: root `pnpm lint` runs `pnpm -r --parallel run lint && eslint .`; each workspace also has its own `lint` / `lint:fix` script (`eslint .`).
4. **TS loader**: add `jiti` to root `devDependencies`. ESLint v10 picks it up automatically for `eslint.config.ts`. No reliance on experimental Node TS support.
5. **Aggregation pattern**: rejected — flat config aggregation requires `files:` scoping on every imported block, which fights the antfu composer. Per-workspace independence + a multi-step root script is cleaner.

## File Layout

```
guoba-ai/
├── eslint.base.ts                    # NEW: createConfig() factory
├── eslint.config.ts                  # REPLACES .mjs: lints root files only
├── package.json                      # update lint scripts, add jiti
├── packages/
│   ├── guoba-utils/
│   │   ├── eslint.config.ts          # NEW
│   │   └── package.json              # add lint / lint:fix
│   └── guoba-hook/
│       ├── eslint.config.ts          # NEW
│       └── package.json              # add lint / lint:fix
└── apps/
    └── docs/
        ├── eslint.config.ts          # NEW
        └── package.json              # add lint / lint:fix
```

Deleted: `eslint.config.mjs`.

## Components

### `eslint.base.ts`

```ts
import antfu from '@antfu/eslint-config'

type AntfuOptions = Parameters<typeof antfu>[0]

const sharedIgnores = [
  '**/dist/**',
  '**/.next/**',
  '**/.source/**',
  '**/node_modules/**',
  '**/next-env.d.ts',
]

export function createConfig(options: AntfuOptions = {}) {
  return antfu({
    type: 'lib',
    typescript: true,
    ...options,
    ignores: [...sharedIgnores, ...(options.ignores ?? [])],
  })
}
```

Returns antfu's `FlatConfigComposer`, so callers can chain `.append(...)` / `.override(...)` if a workspace later needs custom flat-config blocks. `type: 'lib'` is the default; apps override to `'app'`.

### Root `eslint.config.ts`

```ts
import { createConfig } from './eslint.base'

export default createConfig({
  ignores: ['packages/**', 'apps/**'],
})
```

Lints only files at the repo root (this file, `eslint.base.ts`, root scripts, `.changeset` if added later). Workspaces are excluded so they don't get double-linted by the root run.

### `packages/guoba-utils/eslint.config.ts`

```ts
import { createConfig } from '../../eslint.base'

export default createConfig({ type: 'lib' })
```

### `packages/guoba-hook/eslint.config.ts`

```ts
import { createConfig } from '../../eslint.base'

export default createConfig({
  type: 'lib',
  react: true,
})
```

`react: true` enables antfu's React rule pack (React + react-hooks).

### `apps/docs/eslint.config.ts`

```ts
import { createConfig } from '../../../eslint.base'

export default createConfig({
  type: 'app',
  react: true,
  ignores: ['content/docs/utils/**', 'content/docs/hooks/**'],
})
```

`type: 'app'` loosens lib-only rules. Generated TypeDoc mdx is ignored explicitly here; fumadocs `.source/` is covered by `sharedIgnores`. No `@next/eslint-plugin-next` for now — antfu's React preset is sufficient and adding the Next plugin would be a follow-up if `next/*` rules become wanted.

### Root `package.json` changes

```json
{
  "scripts": {
    "lint": "pnpm -r --parallel run lint && eslint .",
    "lint:fix": "pnpm -r --parallel run lint:fix && eslint . --fix"
  },
  "devDependencies": {
    "@antfu/eslint-config": "^8.2.0",
    "eslint": "^10.2.0",
    "jiti": "^2.4.2",
    "vitest": "^4.1.5"
  }
}
```

### Each workspace `package.json` adds

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

## Data Flow

1. CI / local dev runs `pnpm lint` at repo root.
2. pnpm dispatches `lint` to each workspace in parallel; each workspace runs `eslint .` against itself, picking up its local `eslint.config.ts`.
3. After workspaces finish, root `eslint .` runs against root-only files (workspaces are ignored in root config).
4. IDE integrations naturally pick up the closest `eslint.config.ts` per file.

## Error Handling & Edge Cases

- **Failing one workspace lint should fail the whole root command** — `pnpm -r --parallel` exits non-zero on any failure; `&&` then short-circuits. CI sees a non-zero exit.
- **Run from a subdirectory**: `cd packages/guoba-utils && pnpm lint` works because that workspace owns its config and lint script.
- **ESLint can't find jiti**: install fails surface immediately on `pnpm install`; covered by step 1 of verification.
- **Duplicate diagnostics**: avoided because root config explicitly ignores `packages/**` and `apps/**`; each workspace lints itself exactly once.
- **`apps/docs` content/ generated files**: ignored at the docs config level so TypeDoc output doesn't trigger lint errors after every regen.

## Testing / Verification

Implementation is complete only after all of these pass:

1. `pnpm install` — jiti installed at root.
2. `pnpm lint` from repo root — succeeds; touches all four configs.
3. `pnpm --filter @guoba-ai/utils lint`, `pnpm --filter @guoba-ai/hook lint`, `pnpm --filter docs lint` — each runs independently and succeeds.
4. **Negative test**: temporarily add a clearly-violating line (e.g., `var x = 1` plus trailing whitespace) to a source file in each workspace; confirm both the per-workspace command and the root command report the error. Revert.
5. Delete `eslint.config.mjs` only after the four `eslint.config.ts` files are in place and verified.

## Out of Scope

- Introducing `@next/eslint-plugin-next` or other Next-specific rule packs.
- Type-aware linting (`typescript: { tsconfigPath: ... }` in antfu) — current setup doesn't use it; not changing here.
- Extracting an internal `packages/eslint-config` workspace package — revisit if a fourth workspace appears.
- Pre-commit hooks / lint-staged — separate concern.
- Auto-fixing existing lint violations surfaced by enabling docs — handled as part of verification, not as a design decision.
