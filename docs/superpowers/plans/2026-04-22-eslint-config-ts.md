# Per-workspace `eslint.config.ts` Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single root `eslint.config.mjs` with a TypeScript-based ESLint flat config split into one config per workspace, plus a shared root factory; bring `apps/docs` into lint coverage.

**Architecture:** A root `eslint.base.ts` exports a `createConfig()` factory wrapping `@antfu/eslint-config`. Each workspace owns an `eslint.config.ts` that calls the factory with workspace-specific options. Root `eslint.config.ts` ignores workspaces and lints only root-level files. Root `pnpm lint` dispatches per-workspace lints in parallel, then runs root lint.

**Tech Stack:** ESLint v10, `@antfu/eslint-config` v8, `jiti` v2 (TS loader), pnpm v10 workspaces, Node ≥ 24.

**Spec:** `docs/superpowers/specs/2026-04-22-eslint-config-ts-design.md`

---

## File Map

| Path                                    | Action | Purpose                                        |
| --------------------------------------- | ------ | ---------------------------------------------- |
| `eslint.base.ts`                        | create | `createConfig()` factory + shared ignores      |
| `eslint.config.ts`                      | create | Root config (ignores workspaces)               |
| `eslint.config.mjs`                     | delete | Old config, replaced                           |
| `package.json`                          | modify | Add `jiti`, update `lint` / `lint:fix` scripts |
| `packages/guoba-utils/eslint.config.ts` | create | Lib config                                     |
| `packages/guoba-utils/package.json`     | modify | Add `lint` / `lint:fix` scripts                |
| `packages/guoba-hook/eslint.config.ts`  | create | React hook lib config                          |
| `packages/guoba-hook/package.json`      | modify | Add `lint` / `lint:fix` scripts                |
| `apps/docs/eslint.config.ts`            | create | Next.js app config                             |
| `apps/docs/package.json`                | modify | Add `lint` / `lint:fix` scripts                |

---

## Notes for the implementing engineer

- **No traditional unit tests here.** ESLint configs are verified by running `eslint .` and observing the result. "Failing test" in this plan means: deliberately introduce a violation and confirm the configured ESLint reports it. "Passing test" means: run lint on the real source and confirm exit code 0 with no errors.
- **Root `eslint.config.mjs` stays in place until the very end** (Task 6). While both per-workspace `eslint.config.ts` and root `.mjs` co-exist, ESLint resolves the closest config to its CWD — so per-workspace lint uses the new TS config, while root `eslint .` keeps using the old `.mjs`. They don't collide.
- **`apps/docs` was previously excluded from lint.** Step 5 may surface real lint errors when docs is first linted. The plan handles this: lint the docs source, fix the issues with `--fix`, then commit.
- All commands run from the repo root unless stated otherwise. Worktree path: `/Users/shanyulong/riki/repo/guoba-ai/.claude/worktrees/eslint-config-ts/`.

---

## Task 1: Install `jiti` so ESLint can load `eslint.config.ts`

**Files:**

- Modify: root `package.json`

- [ ] **Step 1: Add `jiti` to root `devDependencies`**

Edit root `package.json` so `devDependencies` becomes:

```json
"devDependencies": {
  "@antfu/eslint-config": "^8.2.0",
  "eslint": "^10.2.0",
  "jiti": "^2.4.2",
  "vitest": "^4.1.5"
}
```

- [ ] **Step 2: Install**

```bash
pnpm install
```

Expected: lockfile updates, no errors. `node_modules/jiti` exists.

- [ ] **Step 3: Verify nothing broke**

```bash
pnpm lint
```

Expected: same output as before (uses existing `eslint.config.mjs`). Exit code 0.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add jiti for eslint.config.ts loading"
```

---

## Task 2: Create root factory `eslint.base.ts`

**Files:**

- Create: `eslint.base.ts`

- [ ] **Step 1: Create `eslint.base.ts`**

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

- [ ] **Step 2: Confirm root lint still passes (also lints the new file)**

```bash
pnpm lint
```

Expected: exit code 0. (`eslint.base.ts` is now a root file; the existing `eslint.config.mjs` will lint it. If antfu's TS rules flag anything in the file, fix it now.)

- [ ] **Step 3: Commit**

```bash
git add eslint.base.ts
git commit -m "feat(eslint): add createConfig() factory in eslint.base.ts"
```

---

## Task 3: Add `eslint.config.ts` for `@guoba-ai/utils`

**Files:**

- Create: `packages/guoba-utils/eslint.config.ts`
- Modify: `packages/guoba-utils/package.json`

- [ ] **Step 1: Create `packages/guoba-utils/eslint.config.ts`**

```ts
import { createConfig } from '../../eslint.base'

export default createConfig({ type: 'lib' })
```

- [ ] **Step 2: Add lint scripts to `packages/guoba-utils/package.json`**

Insert into the `scripts` block (preserve existing scripts; add these two):

```json
"lint": "eslint .",
"lint:fix": "eslint . --fix"
```

The full `scripts` block becomes:

```json
"scripts": {
  "build": "tsdown",
  "dev": "tsdown --watch",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "release": "pnpm build && pnpm publish",
  "test": "vitest run",
  "test:type": "tsc --noEmit",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Run lint in the workspace; expect PASS**

```bash
pnpm --filter @guoba-ai/utils lint
```

Expected: exit code 0. ESLint loads `packages/guoba-utils/eslint.config.ts` (closest to CWD), uses `jiti` to compile it, runs antfu rules on `src/` and `test/`. No errors.

- [ ] **Step 4: Negative check — confirm the new config actually fires**

Append a deliberate violation to a temp file:

```bash
printf '\nvar _x = 1\n' > packages/guoba-utils/src/_lint_probe.ts
pnpm --filter @guoba-ai/utils lint
```

Expected: lint FAILS with `no-var` (or similar antfu rule). If it passes, the config is not being picked up — stop and investigate (jiti install, file path, antfu version).

Then clean up:

```bash
rm packages/guoba-utils/src/_lint_probe.ts
pnpm --filter @guoba-ai/utils lint
```

Expected: PASS again.

- [ ] **Step 5: Commit**

```bash
git add packages/guoba-utils/eslint.config.ts packages/guoba-utils/package.json
git commit -m "feat(eslint): per-package config for @guoba-ai/utils"
```

---

## Task 4: Add `eslint.config.ts` for `@guoba-ai/hook`

**Files:**

- Create: `packages/guoba-hook/eslint.config.ts`
- Modify: `packages/guoba-hook/package.json`

- [ ] **Step 1: Create `packages/guoba-hook/eslint.config.ts`**

```ts
import { createConfig } from '../../eslint.base'

export default createConfig({
  type: 'lib',
  react: true,
})
```

- [ ] **Step 2: Add lint scripts to `packages/guoba-hook/package.json`**

Insert into the `scripts` block:

```json
"lint": "eslint .",
"lint:fix": "eslint . --fix"
```

Full `scripts` block becomes:

```json
"scripts": {
  "build": "tsdown",
  "dev": "tsdown --watch",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "release": "pnpm build && pnpm publish",
  "test": "vitest run",
  "test:type": "tsc --noEmit",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Run lint in the workspace; expect PASS**

```bash
pnpm --filter @guoba-ai/hook lint
```

Expected: exit code 0. If antfu can't find its react sub-config, you'll get a clear error — install whatever it asks for (e.g., `@eslint-react/eslint-plugin`). Re-check antfu v8 release notes for required peer plugins.

- [ ] **Step 4: Negative check**

```bash
printf '\nvar _x = 1\n' > packages/guoba-hook/src/_lint_probe.ts
pnpm --filter @guoba-ai/hook lint
```

Expected: FAIL.

```bash
rm packages/guoba-hook/src/_lint_probe.ts
pnpm --filter @guoba-ai/hook lint
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/guoba-hook/eslint.config.ts packages/guoba-hook/package.json
git commit -m "feat(eslint): per-package config for @guoba-ai/hook"
```

If a peer plugin had to be installed, also `git add package.json pnpm-lock.yaml` and mention it in the commit body.

---

## Task 5: Add `eslint.config.ts` for `apps/docs`

**Files:**

- Create: `apps/docs/eslint.config.ts`
- Modify: `apps/docs/package.json`

> **Heads up:** docs was previously excluded from lint. First run is likely to surface real violations. Plan: try `--fix` first; for anything `--fix` can't resolve, fix by hand or add a narrowly-scoped ignore. Don't disable rules globally.

- [ ] **Step 1: Create `apps/docs/eslint.config.ts`**

```ts
import { createConfig } from '../../../eslint.base'

export default createConfig({
  type: 'app',
  react: true,
  ignores: ['content/docs/utils/**', 'content/docs/hooks/**'],
})
```

- [ ] **Step 2: Add lint scripts to `apps/docs/package.json`**

Insert into the `scripts` block:

```json
"lint": "eslint .",
"lint:fix": "eslint . --fix"
```

Full `scripts` block becomes:

```json
"scripts": {
  "typedoc": "typedoc --options typedoc-utils.json && typedoc --options typedoc-hooks.json && node typedoc-postprocess.mjs",
  "dev": "typedoc --options typedoc-utils.json && typedoc --options typedoc-hooks.json && node typedoc-postprocess.mjs && next dev",
  "build": "typedoc --options typedoc-utils.json && typedoc --options typedoc-hooks.json && node typedoc-postprocess.mjs && next build",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "start": "next start"
}
```

- [ ] **Step 3: Run lint in docs; observe errors**

```bash
pnpm --filter docs lint
```

Expected: probably FAILS with a list of issues. Capture the output.

- [ ] **Step 4: Auto-fix what's auto-fixable**

```bash
pnpm --filter docs lint:fix
```

Then re-run `pnpm --filter docs lint`. Expected after fix: zero or only a few remaining errors.

- [ ] **Step 5: Hand-fix remaining errors**

For each remaining error:

- If it's a real bug → fix it.
- If it's in generated code we missed in `ignores` (e.g., another fumadocs/typedoc artifact) → add the path to the `ignores` array in `apps/docs/eslint.config.ts`.
- If it's a stylistic rule that genuinely doesn't apply to Next.js app code → narrow with file-scoped `eslint-disable-next-line` comment, **not** a global rule disable.

Re-run `pnpm --filter docs lint` until exit code 0.

- [ ] **Step 6: Negative check**

```bash
printf '\nvar _x = 1\n' > apps/docs/_lint_probe.ts
pnpm --filter docs lint
```

Expected: FAIL.

```bash
rm apps/docs/_lint_probe.ts
pnpm --filter docs lint
```

Expected: PASS.

- [ ] **Step 7: Verify dev server still boots**

```bash
pnpm --filter docs build
```

Expected: build succeeds. (Confirms any auto-fix didn't break anything semantic.)

- [ ] **Step 8: Commit**

```bash
git add apps/docs/eslint.config.ts apps/docs/package.json
# Plus any source files modified by lint:fix or hand-fix
git add -u apps/docs/
git commit -m "feat(eslint): per-package config for apps/docs"
```

If lint surfaced enough fixes to be worth a separate commit, split: first commit `apps/docs/eslint.config.ts` + `package.json` + auto-fixes, second commit hand-fixes with a message explaining each.

---

## Task 6: Replace root `eslint.config.mjs` with `eslint.config.ts`; update root scripts

**Files:**

- Create: `eslint.config.ts`
- Delete: `eslint.config.mjs`
- Modify: root `package.json`

- [ ] **Step 1: Create root `eslint.config.ts`**

```ts
import { createConfig } from './eslint.base'

export default createConfig({
  ignores: ['packages/**', 'apps/**'],
})
```

- [ ] **Step 2: Delete `eslint.config.mjs` in the same change**

```bash
rm eslint.config.mjs
```

(ESLint errors if both `eslint.config.ts` and `eslint.config.mjs` exist at the same level. Do this immediately after creating the `.ts` file.)

- [ ] **Step 3: Update root `scripts` in `package.json`**

Replace the `lint` and `lint:fix` lines so the `scripts` block becomes:

```json
"scripts": {
  "build": "pnpm -r run build",
  "dev": "pnpm -r run dev",
  "lint": "pnpm -r --parallel run lint && eslint .",
  "lint:fix": "pnpm -r --parallel run lint:fix && eslint . --fix",
  "test": "pnpm -r run test",
  "docs:dev": "pnpm --filter docs dev",
  "docs:build": "pnpm --filter docs build"
}
```

- [ ] **Step 4: Run root lint; expect PASS**

```bash
pnpm lint
```

Expected: pnpm dispatches `lint` to all three workspaces in parallel, each succeeds; then root `eslint .` runs (linting `eslint.base.ts`, `eslint.config.ts`, and any other root-level files), exit code 0.

- [ ] **Step 5: Confirm root config ignores workspaces**

```bash
pnpm exec eslint --print-config packages/guoba-utils/src/index.ts
```

Expected: ESLint exits non-zero with a message like `File ignored because of a matching ignore pattern. Use "--no-ignore" to disable file ignore settings or use "--no-warn-ignored" to suppress this warning.` That confirms the root config's `ignores: ['packages/**', 'apps/**']` is in effect — workspaces aren't double-linted by the root pass.

- [ ] **Step 6: Commit**

```bash
git add eslint.config.ts package.json
git rm eslint.config.mjs
git commit -m "feat(eslint): root config in TS; aggregate per-workspace lint

- Root eslint.config.ts ignores workspaces (each owns its config)
- Root \`pnpm lint\` runs per-workspace lints in parallel, then root
- Removes legacy eslint.config.mjs"
```

---

## Task 7: Final end-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Clean install to confirm no missing deps**

```bash
rm -rf node_modules packages/*/node_modules apps/*/node_modules
pnpm install
```

Expected: clean install, no warnings about missing peer deps for ESLint plugins.

- [ ] **Step 2: Root lint, fresh state**

```bash
pnpm lint
```

Expected: exit code 0.

- [ ] **Step 3: Each workspace lint, standalone**

```bash
pnpm --filter @guoba-ai/utils lint
pnpm --filter @guoba-ai/hook lint
pnpm --filter docs lint
```

Expected: each exits 0.

- [ ] **Step 4: Root negative test (ensure aggregate command catches workspace failures)**

```bash
printf '\nvar _x = 1\n' > packages/guoba-utils/src/_lint_probe.ts
pnpm lint
```

Expected: root command FAILS (non-zero exit). The failure originates from the parallel workspace lint and short-circuits before the root `eslint .` step.

```bash
rm packages/guoba-utils/src/_lint_probe.ts
pnpm lint
```

Expected: PASS.

- [ ] **Step 5: Confirm build pipeline still works**

```bash
pnpm build
pnpm --filter docs build
```

Expected: both succeed.

- [ ] **Step 6: No stray probe files / no `eslint.config.mjs`**

```bash
ls eslint.config.* 2>/dev/null
git status
```

Expected: only `eslint.base.ts` and `eslint.config.ts` exist at root; `git status` clean.

- [ ] **Step 7: Done — no commit needed for this verification task.**

If anything in steps 1–7 fails, stop and treat it as a real bug — don't paper over it.
