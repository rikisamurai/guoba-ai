# Docs Build Pipeline Deepening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 5-file-conspiracy docs build pipeline (`typedoc-utils.json`, `typedoc-hooks.json`, `typedoc-postprocess.mjs`, `typedoc-frontmatter.mjs`, and the chained `package.json` scripts) with a single source-of-truth `packages` table that drives programmatic TypeDoc invocation plus a layout-aware postprocess pass.

**Architecture:** A central `apps/docs/lib/packages.ts` table is the seam. Each row is a `PackageMeta` whose `layout: 'topical' | 'flat'` selects an entry-point resolver and a postprocess strategy. `scripts/build-docs.ts` reads the table and invokes TypeDoc programmatically (no JSON configs, no separate plugin file), then runs the layout-specific postprocess. Adding a third package = one row in the table.

**Tech Stack:** TypeScript (Node 24, native ESM), TypeDoc 0.28 programmatic API, `typedoc-plugin-markdown` v4, `typedoc-plugin-frontmatter`, vitest 4 for unit tests, `tsx` to run TS build scripts.

**Vocabulary (see `CONTEXT.md`):** `topical` layout = package is a set of topical modules, each rendered as its own page (today: utils). `flat` layout = package is a single surface rendered as one list (today: hooks).

---

## Files

**Create:**

- `apps/docs/lib/packages.ts` — the table (source of truth)
- `apps/docs/lib/docs-pipeline/types.ts` — `PackageMeta`, `Layout`
- `apps/docs/lib/docs-pipeline/layout.ts` — `resolveEntryPoints` + `reshapeOutputDirFor` (per-layout strategies)
- `apps/docs/lib/docs-pipeline/postprocess.ts` — shared link-fix + stale-file cleanup + dispatch to layout
- `apps/docs/lib/docs-pipeline/typedoc.ts` — programmatic TypeDoc invocation with folded-in frontmatter listener
- `apps/docs/lib/docs-pipeline/index.ts` — public surface: `buildPackageDocs`, `buildAllDocs`
- `apps/docs/lib/docs-pipeline/__tests__/layout.test.ts`
- `apps/docs/lib/docs-pipeline/__tests__/postprocess.test.ts`
- `apps/docs/scripts/build-docs.ts` — entry script invoked by npm scripts
- `apps/docs/vitest.config.ts`

**Modify:**

- `apps/docs/package.json` — add `tsx` + `vitest` devDeps, add `test` script, replace 3× chained typedoc invocations with `tsx scripts/build-docs.ts`
- `apps/docs/CLAUDE.md` — update architecture section to describe the new pipeline

**Delete (in final task only, after byte-for-byte verification):**

- `apps/docs/typedoc-utils.json`
- `apps/docs/typedoc-hooks.json`
- `apps/docs/typedoc-postprocess.mjs`
- `apps/docs/typedoc-frontmatter.mjs`

**Schema note:** The `PackageMeta` schema is intentionally minimal (5 fields). I considered `displayName` and `npmName` and dropped both as YAGNI — `displayName` would either be dead schema or force a sidebar-title UX change (per-package `meta.json` doesn't exist today), and `npmName` has no current consumer (`sourceLinkTemplate` is repo-wide, not per-package).

---

## Task 1: Vitest + tsx setup in apps/docs

**Files:**

- Modify: `apps/docs/package.json`
- Create: `apps/docs/vitest.config.ts`

- [ ] **Step 1: Add devDependencies**

Run from `/Users/shanyulong/riki/repo/guoba-ai/apps/docs`:

```bash
pnpm add -D tsx@^4.19.2 vitest@^4.1.5
```

Expected: `package.json` updated, `pnpm-lock.yaml` updated, no install errors.

- [ ] **Step 2: Add test script**

Edit `apps/docs/package.json`, in the `scripts` block add a `test` entry after `lint:fix`:

```json
    "test": "vitest --run",
```

- [ ] **Step 3: Create vitest config**

Create `apps/docs/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['lib/**/*.test.ts'],
  },
})
```

- [ ] **Step 4: Verify vitest runs (with zero tests)**

Run from `apps/docs`:

```bash
pnpm test
```

Expected: vitest starts, reports "No test files found", exit code is non-zero. That's fine for this step — we just verified the binary works.

- [ ] **Step 5: Commit**

```bash
git add apps/docs/package.json apps/docs/vitest.config.ts pnpm-lock.yaml
git commit -m "chore(docs): add vitest + tsx for docs build pipeline tests"
```

---

## Task 2: Types and packages table

**Files:**

- Create: `apps/docs/lib/docs-pipeline/types.ts`
- Create: `apps/docs/lib/packages.ts`

- [ ] **Step 1: Create types**

Create `apps/docs/lib/docs-pipeline/types.ts`:

```ts
export type Layout = 'topical' | 'flat'

export interface PackageMeta {
  name: string
  srcDir: string
  tsconfig: string
  layout: Layout
  outSlug: string
}
```

- [ ] **Step 2: Create the table**

Create `apps/docs/lib/packages.ts`:

```ts
import type { PackageMeta } from './docs-pipeline/types'

export const packages: PackageMeta[] = [
  {
    name: 'utils',
    srcDir: '../../packages/guoba-utils/src',
    tsconfig: '../../packages/guoba-utils/tsconfig.json',
    layout: 'topical',
    outSlug: 'utils',
  },
  {
    name: 'hook',
    srcDir: '../../packages/guoba-hook/src',
    tsconfig: '../../packages/guoba-hook/tsconfig.json',
    layout: 'flat',
    outSlug: 'hooks',
  },
]
```

Paths are relative to `apps/docs` (the CWD when build scripts run), matching the existing convention in `typedoc-utils.json`.

- [ ] **Step 3: Type-check passes**

Run from `apps/docs`:

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/docs/lib/docs-pipeline/types.ts apps/docs/lib/packages.ts
git commit -m "feat(docs): introduce packages table as source of truth for docs build"
```

---

## Task 3: Layout strategies (TDD)

**Files:**

- Test: `apps/docs/lib/docs-pipeline/__tests__/layout.test.ts`
- Create: `apps/docs/lib/docs-pipeline/layout.ts`

- [ ] **Step 1: Write failing test for resolveEntryPoints**

Create `apps/docs/lib/docs-pipeline/__tests__/layout.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { resolveEntryPoints } from '../layout'
import type { PackageMeta } from '../types'

const utilsPkg: PackageMeta = {
  name: 'utils',
  srcDir: '../../packages/guoba-utils/src',
  tsconfig: '../../packages/guoba-utils/tsconfig.json',
  layout: 'topical',
  outSlug: 'utils',
}

const hookPkg: PackageMeta = {
  name: 'hook',
  srcDir: '../../packages/guoba-hook/src',
  tsconfig: '../../packages/guoba-hook/tsconfig.json',
  layout: 'flat',
  outSlug: 'hooks',
}

describe('resolveEntryPoints', () => {
  it('flat layout returns only the barrel index.ts', () => {
    expect(resolveEntryPoints(hookPkg)).toEqual(['../../packages/guoba-hook/src/index.ts'])
  })

  it('topical layout returns every src/*.ts except index.ts, sorted', () => {
    const result = resolveEntryPoints(utilsPkg)
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(f => f.endsWith('.ts'))).toBe(true)
    expect(result.some(f => f.endsWith('/index.ts'))).toBe(false)
    expect(result.some(f => f.endsWith('/array.ts'))).toBe(true)
    expect(result.some(f => f.endsWith('/async.ts'))).toBe(true)
    expect([...result].sort()).toEqual(result)
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run from `apps/docs`:

```bash
pnpm test
```

Expected: FAIL with "Cannot find module '../layout'" or similar.

- [ ] **Step 3: Write minimal layout.ts**

Create `apps/docs/lib/docs-pipeline/layout.ts`:

```ts
import { existsSync, globSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Layout, PackageMeta } from './types'

const FLATTENABLE_SUBDIRS = ['functions', 'type-aliases'] as const

export function resolveEntryPoints(pkg: PackageMeta): string[] {
  if (pkg.layout === 'flat') return [`${pkg.srcDir}/index.ts`]
  return globSync(`${pkg.srcDir}/*.ts`)
    .filter(f => !f.endsWith('/index.ts'))
    .sort()
}

interface LayoutStrategy {
  reshapeOutputDir: (outDir: string) => void
}

const topical: LayoutStrategy = {
  reshapeOutputDir(outDir) {
    const modules = readdirSync(outDir, { withFileTypes: true }).filter(d => d.isDirectory())
    for (const mod of modules) {
      const modDir = join(outDir, mod.name)
      flattenSubdirs(modDir)
      writeMetaJson(modDir, capitalize(mod.name))
    }
  },
}

const flat: LayoutStrategy = {
  reshapeOutputDir(outDir) {
    flattenSubdirs(outDir)
  },
}

const strategies: Record<Layout, LayoutStrategy> = { topical, flat }

export function reshapeOutputDirFor(pkg: PackageMeta, outDir: string): void {
  strategies[pkg.layout].reshapeOutputDir(outDir)
}

function flattenSubdirs(dir: string): void {
  for (const sub of FLATTENABLE_SUBDIRS) {
    const subDir = join(dir, sub)
    if (!existsSync(subDir)) continue
    for (const file of readdirSync(subDir)) renameSync(join(subDir, file), join(dir, file))
    rmSync(subDir, { recursive: true })
  }
}

function writeMetaJson(dir: string, title: string): void {
  writeFileSync(join(dir, 'meta.json'), `${JSON.stringify({ title }, null, 2)}\n`)
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
```

- [ ] **Step 4: Run tests, verify pass**

Run from `apps/docs`:

```bash
pnpm test
```

Expected: both `resolveEntryPoints` tests PASS.

- [ ] **Step 5: Lint**

Run from monorepo root:

```bash
pnpm lint:fix
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/lib/docs-pipeline/layout.ts apps/docs/lib/docs-pipeline/__tests__/layout.test.ts
git commit -m "feat(docs): add topical/flat layout strategies for docs pipeline"
```

---

## Task 4: Postprocess (TDD)

**Files:**

- Test: `apps/docs/lib/docs-pipeline/__tests__/postprocess.test.ts`
- Create: `apps/docs/lib/docs-pipeline/postprocess.ts`

- [ ] **Step 1: Write failing tests**

Create `apps/docs/lib/docs-pipeline/__tests__/postprocess.test.ts`:

```ts
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { postprocess } from '../postprocess'
import type { PackageMeta } from '../types'

const flatPkg: PackageMeta = {
  name: 'hook',
  srcDir: 'x',
  tsconfig: 'y',
  layout: 'flat',
  outSlug: 'hooks',
}

const topicalPkg: PackageMeta = {
  name: 'utils',
  srcDir: 'x',
  tsconfig: 'y',
  layout: 'topical',
  outSlug: 'utils',
}

let tmpRoot: string
let originalCwd: string

beforeEach(() => {
  originalCwd = process.cwd()
  tmpRoot = mkdtempSync(join(tmpdir(), 'docs-pipeline-test-'))
  process.chdir(tmpRoot)
  mkdirSync(join(tmpRoot, 'content', 'docs'), { recursive: true })
})

afterEach(() => {
  process.chdir(originalCwd)
  rmSync(tmpRoot, { recursive: true, force: true })
})

describe('postprocess flat layout', () => {
  it('flattens functions/ and type-aliases/, removes stale top-level files, fixes links', () => {
    const outDir = 'content/docs/hooks'
    mkdirSync(join(outDir, 'functions'), { recursive: true })
    mkdirSync(join(outDir, 'type-aliases'), { recursive: true })
    writeFileSync(
      join(outDir, 'functions', 'useToggle.mdx'),
      'see [useDebounce](/functions/useDebounce.mdx)',
    )
    writeFileSync(
      join(outDir, 'type-aliases', 'ToggleSetter.mdx'),
      'see [Other](/type-aliases/Other.mdx)',
    )
    writeFileSync(join(outDir, 'modules.mdx'), '')
    writeFileSync(join(outDir, 'globals.mdx'), '')

    postprocess(flatPkg)

    expect(existsSync(join(outDir, 'modules.mdx'))).toBe(false)
    expect(existsSync(join(outDir, 'globals.mdx'))).toBe(false)
    expect(existsSync(join(outDir, 'functions'))).toBe(false)
    expect(existsSync(join(outDir, 'type-aliases'))).toBe(false)
    expect(existsSync(join(outDir, 'useToggle.mdx'))).toBe(true)
    expect(existsSync(join(outDir, 'ToggleSetter.mdx'))).toBe(true)
    expect(readFileSync(join(outDir, 'useToggle.mdx'), 'utf-8')).toBe(
      'see [useDebounce](/useDebounce)',
    )
    expect(readFileSync(join(outDir, 'ToggleSetter.mdx'), 'utf-8')).toBe('see [Other](/Other)')
  })
})

describe('postprocess topical layout', () => {
  it('flattens per-module subdirs, writes capitalized meta.json, fixes links', () => {
    const outDir = 'content/docs/utils'
    mkdirSync(join(outDir, 'array', 'functions'), { recursive: true })
    writeFileSync(join(outDir, 'array', 'index.mdx'), 'see [chunk](/array/functions/chunk.mdx)')
    writeFileSync(join(outDir, 'array', 'functions', 'chunk.mdx'), '# chunk')
    writeFileSync(join(outDir, 'modules.mdx'), '')

    postprocess(topicalPkg)

    expect(existsSync(join(outDir, 'modules.mdx'))).toBe(false)
    expect(existsSync(join(outDir, 'array', 'functions'))).toBe(false)
    expect(existsSync(join(outDir, 'array', 'chunk.mdx'))).toBe(true)
    expect(readFileSync(join(outDir, 'array', 'meta.json'), 'utf-8')).toBe(
      '{\n  "title": "Array"\n}\n',
    )
    expect(readFileSync(join(outDir, 'array', 'index.mdx'), 'utf-8')).toBe(
      'see [chunk](/array/chunk)',
    )
  })

  it('is a no-op if outDir does not exist', () => {
    expect(() => postprocess(topicalPkg)).not.toThrow()
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run from `apps/docs`:

```bash
pnpm test
```

Expected: FAIL with "Cannot find module '../postprocess'".

- [ ] **Step 3: Write postprocess.ts**

Create `apps/docs/lib/docs-pipeline/postprocess.ts`:

```ts
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { reshapeOutputDirFor } from './layout'
import type { PackageMeta } from './types'

const STALE_TOP_LEVEL_FILES = ['modules.mdx', 'globals.mdx'] as const

export function postprocess(pkg: PackageMeta): void {
  const outDir = `content/docs/${pkg.outSlug}`
  if (!existsSync(outDir)) return

  removeStaleFiles(outDir)
  reshapeOutputDirFor(pkg, outDir)
  fixLinksRecursively(outDir)
}

function removeStaleFiles(dir: string): void {
  for (const stale of STALE_TOP_LEVEL_FILES) {
    const path = join(dir, stale)
    if (existsSync(path)) rmSync(path)
  }
}

function fixLinksRecursively(dir: string): void {
  for (const file of collectMdxFiles(dir)) {
    const content = readFileSync(file, 'utf-8')
    const updated = content
      .replace(/\/functions\//g, '/')
      .replace(/\/type-aliases\//g, '/')
      .replace(/\.mdx\)/g, ')')
      .replace(/\/index\)/g, ')')
    if (updated !== content) writeFileSync(file, updated)
  }
}

function collectMdxFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...collectMdxFiles(full))
    else if (entry.name.endsWith('.mdx')) out.push(full)
  }
  return out
}
```

- [ ] **Step 4: Run tests, verify pass**

Run from `apps/docs`:

```bash
pnpm test
```

Expected: all 4 tests PASS (2 layout + 3 postprocess; the previous resolveEntryPoints tests still pass).

- [ ] **Step 5: Lint**

```bash
pnpm lint:fix
```

- [ ] **Step 6: Commit**

```bash
git add apps/docs/lib/docs-pipeline/postprocess.ts apps/docs/lib/docs-pipeline/__tests__/postprocess.test.ts
git commit -m "feat(docs): add layout-dispatching postprocess for docs pipeline"
```

---

## Task 5: Programmatic TypeDoc invocation

**Files:**

- Create: `apps/docs/lib/docs-pipeline/typedoc.ts`

No unit test — TypeDoc invocation is exercised end-to-end in Task 7's byte-for-byte diff against the existing pipeline output.

- [ ] **Step 1: Create typedoc.ts**

Create `apps/docs/lib/docs-pipeline/typedoc.ts`:

```ts
import { Application, TSConfigReader } from 'typedoc'
import { MarkdownPageEvent } from 'typedoc-plugin-markdown'
import { resolveEntryPoints } from './layout'
import type { PackageMeta } from './types'

export async function runTypedoc(pkg: PackageMeta): Promise<void> {
  const app = await Application.bootstrapWithPlugins(
    {
      entryPoints: resolveEntryPoints(pkg),
      tsconfig: pkg.tsconfig,
      plugin: ['typedoc-plugin-markdown', 'typedoc-plugin-frontmatter'],
      out: `content/docs/${pkg.outSlug}`,
      publicPath: `/docs/${pkg.outSlug}/`,
      cleanOutputDir: true,
      fileExtension: '.mdx',
      entryFileName: 'index',
      flattenOutputFiles: false,
      hidePageHeader: true,
      hidePageTitle: false,
      useCodeBlocks: true,
      sanitizeComments: true,
      gitRevision: 'main',
      sourceLinkTemplate:
        'https://github.com/rikisamurai/guoba-ai/blob/{gitRevision}/{path}#L{line}',
      excludeScopesInPaths: true,
      frontmatterGlobals: { layout: 'docs' },
    } as Parameters<typeof Application.bootstrapWithPlugins>[0],
    [new TSConfigReader()],
  )

  app.renderer.on(MarkdownPageEvent.BEGIN, page => {
    page.frontmatter = {
      ...page.frontmatter,
      title: page.model?.name ?? 'API Reference',
    }
  })

  const project = await app.convert()
  if (!project) throw new Error(`TypeDoc failed to convert package "${pkg.name}"`)
  await app.generateOutputs(project)
}
```

The `as Parameters<...>[0]` cast is needed because plugin-specific options (`hidePageHeader`, `useCodeBlocks`, `frontmatterGlobals`, etc.) come from `typedoc-plugin-markdown` / `typedoc-plugin-frontmatter` module augmentations that aren't always picked up before bootstrap.

The frontmatter listener replaces `typedoc-frontmatter.mjs` — same body, attached directly to the in-memory renderer instead of via plugin loader.

- [ ] **Step 2: Type-check passes**

Run from `apps/docs`:

```bash
pnpm exec tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Lint**

```bash
pnpm lint:fix
```

- [ ] **Step 4: Commit**

```bash
git add apps/docs/lib/docs-pipeline/typedoc.ts
git commit -m "feat(docs): add programmatic TypeDoc invocation with inline frontmatter listener"
```

---

## Task 6: Public surface + build script

**Files:**

- Create: `apps/docs/lib/docs-pipeline/index.ts`
- Create: `apps/docs/scripts/build-docs.ts`

- [ ] **Step 1: Create the public surface**

Create `apps/docs/lib/docs-pipeline/index.ts`:

```ts
import { postprocess } from './postprocess'
import { runTypedoc } from './typedoc'
import type { PackageMeta } from './types'

export type { Layout, PackageMeta } from './types'

export async function buildPackageDocs(pkg: PackageMeta): Promise<void> {
  await runTypedoc(pkg)
  postprocess(pkg)
}

export async function buildAllDocs(pkgs: PackageMeta[]): Promise<void> {
  for (const pkg of pkgs) await buildPackageDocs(pkg)
}
```

- [ ] **Step 2: Create the build script**

Create `apps/docs/scripts/build-docs.ts`:

```ts
import { buildAllDocs } from '../lib/docs-pipeline'
import { packages } from '../lib/packages'

await buildAllDocs(packages)
console.warn('✅ TypeDoc + postprocess complete.')
```

The `console.warn` (not `console.log`) matches the existing convention in `typedoc-postprocess.mjs` — `@antfu/eslint-config` allows `console.warn` but flags `console.log` in lib mode.

- [ ] **Step 3: Type-check + lint**

```bash
pnpm exec tsc --noEmit
pnpm lint:fix
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/docs/lib/docs-pipeline/index.ts apps/docs/scripts/build-docs.ts
git commit -m "feat(docs): add docs-pipeline public surface and build-docs entry script"
```

---

## Task 7: Switch the build, verify byte-for-byte, delete old files

This is the cutover. Verification first; deletion only after diff is clean.

**Files:**

- Modify: `apps/docs/package.json`
- Delete: `apps/docs/typedoc-utils.json`
- Delete: `apps/docs/typedoc-hooks.json`
- Delete: `apps/docs/typedoc-postprocess.mjs`
- Delete: `apps/docs/typedoc-frontmatter.mjs`

- [ ] **Step 1: Snapshot the current generated output**

Run from monorepo root:

```bash
pnpm --filter guoba-docs typedoc
git add apps/docs/content/docs/utils apps/docs/content/docs/hooks
git diff --cached --stat
```

Expected: either no changes (nothing drifted since last commit) or a small set of changes. Note the file count. Now stash the staged state for comparison:

```bash
git stash push -m "docs-pipeline-baseline" -- apps/docs/content/docs/utils apps/docs/content/docs/hooks
```

(Or skip stash; we'll diff against committed state after the new pipeline runs.)

- [ ] **Step 2: Swap package.json scripts**

Edit `apps/docs/package.json`. Replace these three script entries:

```json
    "typedoc": "typedoc --options typedoc-utils.json && typedoc --options typedoc-hooks.json && node typedoc-postprocess.mjs",
    "dev": "typedoc --options typedoc-utils.json && typedoc --options typedoc-hooks.json && node typedoc-postprocess.mjs && pnpm dev:fast",
    "dev:fast": "portless run next dev",
    "build": "typedoc --options typedoc-utils.json && typedoc --options typedoc-hooks.json && node typedoc-postprocess.mjs && next build",
```

With:

```json
    "typedoc": "tsx scripts/build-docs.ts",
    "dev": "pnpm typedoc && pnpm dev:fast",
    "dev:fast": "portless run next dev",
    "build": "pnpm typedoc && next build",
```

- [ ] **Step 3: Pop the stash (restore baseline), run the new pipeline, diff**

```bash
git stash pop  # restores baseline content/docs/{utils,hooks} into the working tree
pnpm --filter guoba-docs typedoc
git diff --stat apps/docs/content/docs/utils apps/docs/content/docs/hooks
```

Expected: **no diff**. The new pipeline produces byte-for-byte identical output.

If the diff is non-empty, inspect with `git diff` — common causes: (a) ordering of `entryPoints` changed (fix in `resolveEntryPoints`'s sort), (b) a plugin option was omitted from `typedoc.ts`, (c) the frontmatter listener attaches at a different event. Do **not** proceed to Step 4 until the diff is empty.

- [ ] **Step 4: Delete old pipeline files**

```bash
rm apps/docs/typedoc-utils.json apps/docs/typedoc-hooks.json apps/docs/typedoc-postprocess.mjs apps/docs/typedoc-frontmatter.mjs
```

- [ ] **Step 5: Re-run the build, re-verify diff still empty**

```bash
pnpm --filter guoba-docs typedoc
git diff --stat apps/docs/content/docs/utils apps/docs/content/docs/hooks
```

Expected: no diff (re-runs are idempotent and don't depend on the deleted files).

- [ ] **Step 6: Run the full build to catch Next.js breakage**

```bash
pnpm --filter guoba-docs build
```

Expected: build succeeds. If `lib/packages.ts` accidentally got included in Next's runtime bundle and breaks at build, that's a real problem (it's a server-only module). The current import graph keeps it out of pages — Next only sees `lib/source.ts` — but verify.

- [ ] **Step 7: Run all tests + lint**

```bash
pnpm test
pnpm lint
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add apps/docs/package.json
git rm apps/docs/typedoc-utils.json apps/docs/typedoc-hooks.json apps/docs/typedoc-postprocess.mjs apps/docs/typedoc-frontmatter.mjs
git commit -m "refactor(docs): switch docs build to packages-table-driven pipeline

Replaces typedoc-{utils,hooks}.json + typedoc-postprocess.mjs +
typedoc-frontmatter.mjs with a single source-of-truth table
(lib/packages.ts) and a programmatic build script
(scripts/build-docs.ts). Adding a third package is now one row in
the table instead of edits across five files. Generated output is
byte-for-byte identical."
```

---

## Task 8: Update CLAUDE.md

**Files:**

- Modify: `apps/docs/CLAUDE.md`

- [ ] **Step 1: Replace the architecture section**

In `apps/docs/CLAUDE.md`, replace the entire `### Two-Stage Build Pipeline` subsection (and its body) with:

```markdown
### Build Pipeline

A single packages table (`lib/packages.ts`) drives the entire docs build. Each row is a `PackageMeta` whose `layout` selects how TypeDoc reads the source and how the postprocess pass reshapes the output:

- **`topical`** — package is a set of topical modules; one TypeDoc entry point per source file; postprocess flattens per-module subdirs and writes per-module `meta.json`. Today: `@guoba-ai/utils` (array, async, guard, object, string, types).
- **`flat`** — package is a single surface; one barrel TypeDoc entry point (`src/index.ts`); postprocess flattens top-level subdirs only. Today: `@guoba-ai/hook`.

(See `CONTEXT.md` for the layout vocabulary.)

Every `dev` and `build` runs `scripts/build-docs.ts`, which:

1. Iterates the `packages` table.
2. For each package, invokes TypeDoc programmatically (`lib/docs-pipeline/typedoc.ts`) with the right entry points, tsconfig, and the inline frontmatter listener that adds `title` to every generated page.
3. Runs the layout-aware postprocess (`lib/docs-pipeline/postprocess.ts`): removes stale `modules.mdx`/`globals.mdx`, dispatches to the layout strategy (`lib/docs-pipeline/layout.ts`), and fixes internal links.

**Adding a third package**: add one row to `lib/packages.ts` with the right `srcDir`, `tsconfig`, `layout`, and `outSlug`. Add the slug to `content/docs/meta.json`'s `pages` array for sidebar order. Nothing else.
```

- [ ] **Step 2: Commit**

```bash
git add apps/docs/CLAUDE.md
git commit -m "docs(claude): document packages-table-driven docs build pipeline"
```

---

## Task 9: Browser verification

Per `apps/docs/CLAUDE.md` and the user's memory: docs changes must be verified in the browser before claiming complete.

- [ ] **Step 1: Start the dev server**

Run from monorepo root:

```bash
pnpm docs:dev
```

Wait until Next.js prints its ready URL (typically `http://localhost:3000`). Leave the server running.

- [ ] **Step 2: Visual check via agent-browser**

Use the `agent-browser` skill to open and verify each of these pages renders without errors and matches the pre-refactor look:

- `http://localhost:3000/docs` — Getting Started page renders, sidebar shows `Packages` divider with `utils` and `hooks` entries.
- `http://localhost:3000/docs/utils` — `@guoba-ai/utils` overview page renders.
- `http://localhost:3000/docs/utils/array` — array module page renders, sidebar shows `Array` (capitalized from `meta.json`).
- `http://localhost:3000/docs/utils/array/chunk` — function detail page renders, internal links (e.g. "see also") resolve.
- `http://localhost:3000/docs/hooks` — `@guoba-ai/hook` overview renders.
- `http://localhost:3000/docs/hooks/useDebounce` — hook detail page renders.

- [ ] **Step 3: Stop the dev server**

Ctrl+C in the dev server terminal.

- [ ] **Step 4: No commit needed**

This task is verification only. If anything looks wrong, that's a bug in an earlier task — fix and amend the relevant commit (or add a fixup commit).

---

## Self-Review

**Spec coverage:**

- ✅ Central `packages` table → Task 2 (`lib/packages.ts`)
- ✅ `topical` / `flat` named in `CONTEXT.md` → already written before this plan
- ✅ Programmatic TypeDoc → Task 5 (`typedoc.ts`)
- ✅ Drop JSON configs + plugin file → Task 7
- ✅ Collapse `package.json` script chain → Task 7 Step 2
- ✅ Tests at the new interface (layout, postprocess) → Tasks 3 and 4
- ✅ Byte-for-byte verification of new vs old pipeline → Task 7 Steps 3 and 5
- ✅ CLAUDE.md updated → Task 8
- ✅ Browser verification (per project convention) → Task 9

**Placeholder scan:** none. Every code block and command is concrete.

**Type consistency:**

- `PackageMeta` defined in Task 2 with `{ name, srcDir, tsconfig, layout, outSlug }` — every later task uses these fields and no others.
- `Layout = 'topical' | 'flat'` — only these two literals appear in `strategies` (Task 3) and as the discriminant in `resolveEntryPoints` (Task 3) and `reshapeOutputDirFor` (Task 3).
- `resolveEntryPoints` signature `(pkg: PackageMeta) => string[]` — matches Task 5's usage in `typedoc.ts`.
- `postprocess` signature `(pkg: PackageMeta) => void` — matches Task 6's usage in `index.ts`.
- `buildPackageDocs` / `buildAllDocs` signatures — Task 6 matches Task 7's `pnpm typedoc` script call chain.
- `FLATTENABLE_SUBDIRS` (in `layout.ts`) and `STALE_TOP_LEVEL_FILES` (in `postprocess.ts`) — different concerns, intentionally not shared.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-19-docs-build-pipeline-deepening.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
