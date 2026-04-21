# Hook TypeDoc Auto-Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add TypeDoc auto-generation for `@guoba-ai/hook`, making it a top-level sibling to `@guoba-ai/utils` in the docs sidebar.

**Architecture:** Two separate TypeDoc configs — `typedoc-utils.json` (renamed from `typedoc.json`) outputs to `content/docs/utils/`, new `typedoc-hooks.json` outputs to `content/docs/hooks/`. The existing post-process script is updated to handle both directories. The root `meta.json` is updated so both packages appear as top-level sidebar sections.

**Tech Stack:** TypeDoc, typedoc-plugin-markdown, typedoc-plugin-frontmatter, fumadocs-mdx, Next.js

---

### Task 1: Rename typedoc.json to typedoc-utils.json and update output paths

**Files:**
- Delete: `apps/docs/typedoc.json`
- Create: `apps/docs/typedoc-utils.json`

- [ ] **Step 1: Create typedoc-utils.json**

Create `apps/docs/typedoc-utils.json` with the same content as `typedoc.json` but with updated `out` and `publicPath`:

```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": [
    "../../packages/guoba-utils/src/array.ts",
    "../../packages/guoba-utils/src/guard.ts",
    "../../packages/guoba-utils/src/object.ts",
    "../../packages/guoba-utils/src/string.ts",
    "../../packages/guoba-utils/src/types.ts"
  ],
  "tsconfig": "../../packages/guoba-utils/tsconfig.json",
  "plugin": [
    "typedoc-plugin-markdown",
    "typedoc-plugin-frontmatter",
    "./typedoc-frontmatter.mjs"
  ],
  "out": "content/docs/utils",
  "publicPath": "/docs/utils/",
  "cleanOutputDir": true,
  "fileExtension": ".mdx",
  "entryFileName": "index",
  "flattenOutputFiles": false,
  "hidePageHeader": true,
  "hidePageTitle": false,
  "useCodeBlocks": true,
  "sanitizeComments": true,
  "gitRevision": "main",
  "sourceLinkTemplate": "https://github.com/rikisamurai/guoba-ai/blob/{gitRevision}/{path}#L{line}",
  "excludeScopesInPaths": true,
  "frontmatterGlobals": {
    "layout": "docs"
  }
}
```

- [ ] **Step 2: Delete old typedoc.json**

```bash
rm apps/docs/typedoc.json
```

- [ ] **Step 3: Verify typedoc-utils.json generates correctly**

```bash
cd apps/docs && npx typedoc --options typedoc-utils.json
```

Expected: TypeDoc generates `.mdx` files into `content/docs/utils/` with subdirectories `array/`, `guard/`, `object/`, `string/`, `types/`.

- [ ] **Step 4: Commit**

```bash
git add apps/docs/typedoc-utils.json
git rm apps/docs/typedoc.json
git commit -m "refactor(docs): rename typedoc.json to typedoc-utils.json, output to utils/"
```

---

### Task 2: Create typedoc-hooks.json

**Files:**
- Create: `apps/docs/typedoc-hooks.json`

- [ ] **Step 1: Create typedoc-hooks.json**

Create `apps/docs/typedoc-hooks.json`:

```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": [
    "../../packages/guoba-hook/src/useToggle.ts",
    "../../packages/guoba-hook/src/useDebounce.ts",
    "../../packages/guoba-hook/src/useThrottle.ts",
    "../../packages/guoba-hook/src/usePrevious.ts",
    "../../packages/guoba-hook/src/useMount.ts",
    "../../packages/guoba-hook/src/useUnmount.ts"
  ],
  "tsconfig": "../../packages/guoba-hook/tsconfig.json",
  "plugin": [
    "typedoc-plugin-markdown",
    "typedoc-plugin-frontmatter",
    "./typedoc-frontmatter.mjs"
  ],
  "out": "content/docs/hooks",
  "publicPath": "/docs/hooks/",
  "cleanOutputDir": true,
  "fileExtension": ".mdx",
  "entryFileName": "index",
  "flattenOutputFiles": false,
  "hidePageHeader": true,
  "hidePageTitle": false,
  "useCodeBlocks": true,
  "sanitizeComments": true,
  "gitRevision": "main",
  "sourceLinkTemplate": "https://github.com/rikisamurai/guoba-ai/blob/{gitRevision}/{path}#L{line}",
  "excludeScopesInPaths": true,
  "frontmatterGlobals": {
    "layout": "docs"
  }
}
```

- [ ] **Step 2: Verify typedoc-hooks.json generates correctly**

```bash
cd apps/docs && npx typedoc --options typedoc-hooks.json
```

Expected: TypeDoc generates `.mdx` files into `content/docs/hooks/` with subdirectories per hook module (e.g., `useToggle/`, `useDebounce/`, etc.).

- [ ] **Step 3: Commit**

```bash
git add apps/docs/typedoc-hooks.json
git commit -m "feat(docs): add typedoc-hooks.json for @guoba-ai/hook"
```

---

### Task 3: Update typedoc-postprocess.mjs to handle both directories

**Files:**
- Modify: `apps/docs/typedoc-postprocess.mjs`

- [ ] **Step 1: Update the script to process both utils and hooks**

Replace the entire content of `apps/docs/typedoc-postprocess.mjs` with:

```js
// @ts-check
import { existsSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const API_DIRS = ['content/docs/utils', 'content/docs/hooks']

/**
 * Post-process TypeDoc output:
 * 1. Move files from functions/ and type-aliases/ up to the module directory
 * 2. Fix links in all generated .mdx files
 * 3. Add meta.json for each module directory with capitalized title
 */

for (const API_DIR of API_DIRS) {
  if (!existsSync(API_DIR))
    continue

  const modules = readdirSync(API_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())

  for (const mod of modules) {
    const modDir = join(API_DIR, mod.name)
    const subdirs = ['functions', 'type-aliases']

    for (const sub of subdirs) {
      const subDir = join(modDir, sub)
      if (!existsSync(subDir))
        continue

      const files = readdirSync(subDir)
      for (const file of files) {
        renameSync(join(subDir, file), join(modDir, file))
      }
      rmSync(subDir, { recursive: true })
    }

    // Add meta.json with capitalized title
    const title = mod.name.charAt(0).toUpperCase() + mod.name.slice(1)
    writeFileSync(
      join(modDir, 'meta.json'),
      `${JSON.stringify({ title }, null, 2)}\n`,
    )
  }

  // Fix links in all .mdx files
  const allFiles = []
  function collectMdx(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory())
        collectMdx(full)
      else if (entry.name.endsWith('.mdx'))
        allFiles.push(full)
    }
  }
  collectMdx(API_DIR)

  for (const file of allFiles) {
    const content = readFileSync(file, 'utf-8')
    const updated = content
      .replace(/\/functions\//g, '/')
      .replace(/\/type-aliases\//g, '/')
      .replace(/\.mdx\)/g, ')')
      .replace(/\/index\)/g, ')')
    if (updated !== content) {
      writeFileSync(file, updated)
    }
  }
}

console.warn('✅ TypeDoc post-processing complete.')
```

- [ ] **Step 2: Run both TypeDoc configs and then postprocess to verify**

```bash
cd apps/docs && npx typedoc --options typedoc-utils.json && npx typedoc --options typedoc-hooks.json && node typedoc-postprocess.mjs
```

Expected: `✅ TypeDoc post-processing complete.` — no errors. Both `content/docs/utils/` and `content/docs/hooks/` contain flattened `.mdx` files with `meta.json` per module.

- [ ] **Step 3: Verify the flattened structure**

```bash
ls content/docs/utils/array/
ls content/docs/hooks/
```

Expected for utils: `.mdx` files directly in `array/`, no `functions/` subdirectory.
Expected for hooks: each hook module directory (e.g., `useToggle/`) OR flattened `.mdx` files depending on TypeDoc output structure. Either way, no `functions/` or `type-aliases/` subdirs remain.

- [ ] **Step 4: Commit**

```bash
git add apps/docs/typedoc-postprocess.mjs
git commit -m "refactor(docs): update postprocess to handle utils and hooks dirs"
```

---

### Task 4: Update build scripts in package.json

**Files:**
- Modify: `apps/docs/package.json`

- [ ] **Step 1: Update the scripts**

In `apps/docs/package.json`, replace the `scripts` section:

```json
{
  "typedoc": "typedoc --options typedoc-utils.json && typedoc --options typedoc-hooks.json && node typedoc-postprocess.mjs",
  "dev": "typedoc --options typedoc-utils.json && typedoc --options typedoc-hooks.json && node typedoc-postprocess.mjs && next dev",
  "build": "typedoc --options typedoc-utils.json && typedoc --options typedoc-hooks.json && node typedoc-postprocess.mjs && next build",
  "start": "next start"
}
```

- [ ] **Step 2: Test the typedoc script**

```bash
cd apps/docs && pnpm typedoc
```

Expected: Both TypeDoc runs succeed, postprocess runs, `✅ TypeDoc post-processing complete.` printed.

- [ ] **Step 3: Commit**

```bash
git add apps/docs/package.json
git commit -m "feat(docs): update build scripts for dual TypeDoc configs"
```

---

### Task 5: Update content/docs/meta.json for top-level sidebar

**Files:**
- Modify: `apps/docs/content/docs/meta.json`

- [ ] **Step 1: Update root meta.json**

Replace the content of `apps/docs/content/docs/meta.json` with:

```json
{
  "title": "Guoba AI",
  "pages": [
    "index",
    "---@guoba-ai/utils---",
    "utils",
    "---@guoba-ai/hook---",
    "hooks"
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/docs/content/docs/meta.json
git commit -m "feat(docs): update sidebar to show utils and hooks as top-level siblings"
```

---

### Task 6: Update .gitignore for new generated directories

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Replace the old api/ ignore with utils/ and hooks/**

In the root `.gitignore`, replace line `apps/docs/content/docs/api/` with:

```
apps/docs/content/docs/utils/
apps/docs/content/docs/hooks/
```

- [ ] **Step 2: Remove old generated api/ directory from git tracking**

```bash
git rm -r --cached apps/docs/content/docs/api/ 2>/dev/null || true
rm -rf apps/docs/content/docs/api/
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: update .gitignore for new docs output dirs (utils/, hooks/)"
```

---

### Task 7: Update CLAUDE.md files

**Files:**
- Modify: `CLAUDE.md` (root)
- Modify: `apps/docs/CLAUDE.md`

- [ ] **Step 1: Update root CLAUDE.md**

In the root `CLAUDE.md`, update the Architecture section. Replace:

```
- `apps/docs/` — documentation site
  - **Next.js** + **fumadocs-ui/fumadocs-mdx** for rendering
  - API docs auto-generated: **TypeDoc** (with markdown + frontmatter plugins) → `content/docs/api/` → post-processed by `typedoc-postprocess.mjs` (flattens subdirectories, fixes links, adds `meta.json`)
  - The typedoc step runs automatically before `dev` and `build`
```

with:

```
- `packages/guoba-hook/` — React hook library (`@guoba-ai/hook`)
  - Source modules: `src/{useToggle,useDebounce,useThrottle,usePrevious,useMount,useUnmount}.ts`, re-exported via `src/index.ts`
  - Built with **tsdown** (ESM-only, with .d.mts declarations)
  - Tests live in `test/` (vitest, config in `vitest.config.ts`)
- `apps/docs/` — documentation site
  - **Next.js** + **fumadocs-ui/fumadocs-mdx** for rendering
  - API docs auto-generated via two TypeDoc configs:
    - `typedoc-utils.json` → `content/docs/utils/` (for `@guoba-ai/utils`)
    - `typedoc-hooks.json` → `content/docs/hooks/` (for `@guoba-ai/hook`)
  - Post-processed by `typedoc-postprocess.mjs` (flattens subdirectories, fixes links, adds `meta.json`)
  - The typedoc step runs automatically before `dev` and `build`
```

- [ ] **Step 2: Update apps/docs/CLAUDE.md**

In `apps/docs/CLAUDE.md`:

a) Update the Overview line. Replace:

```
Documentation site for `@guoba-ai/utils`, built with Next.js 16 (App Router) + fumadocs-ui/fumadocs-mdx. API reference pages are auto-generated from source via TypeDoc.
```

with:

```
Documentation site for `@guoba-ai/utils` and `@guoba-ai/hook`, built with Next.js 16 (App Router) + fumadocs-ui/fumadocs-mdx. API reference pages are auto-generated from source via TypeDoc.
```

b) Update the Two-Stage Build Pipeline section. Replace:

```
1. **TypeDoc** — reads source from `../../packages/guoba-utils/src/{array,guard,object,string,types}.ts`, generates `.mdx` files into `content/docs/api/` with frontmatter (via `typedoc-plugin-markdown`, `typedoc-plugin-frontmatter`, and custom `typedoc-frontmatter.mjs`)
2. **Post-processing** (`typedoc-postprocess.mjs`) — flattens `functions/` and `type-aliases/` subdirectories up into each module directory, fixes internal links, and generates `meta.json` sidebar entries per module
```

with:

```
1. **TypeDoc** — runs two configs sequentially:
   - `typedoc-utils.json` reads `../../packages/guoba-utils/src/{array,guard,object,string,types}.ts` → `content/docs/utils/`
   - `typedoc-hooks.json` reads `../../packages/guoba-hook/src/{useToggle,useDebounce,useThrottle,usePrevious,useMount,useUnmount}.ts` → `content/docs/hooks/`
   Both generate `.mdx` files with frontmatter (via `typedoc-plugin-markdown`, `typedoc-plugin-frontmatter`, and custom `typedoc-frontmatter.mjs`)
2. **Post-processing** (`typedoc-postprocess.mjs`) — processes both `content/docs/utils/` and `content/docs/hooks/`: flattens `functions/` and `type-aliases/` subdirectories, fixes internal links, generates `meta.json` sidebar entries per module
```

c) Update the Content section. Replace:

```
- `content/docs/meta.json` — controls root sidebar ordering (uses `---API Reference---` as section divider)
- `content/docs/api/` — **entirely generated** by TypeDoc; do not edit manually
```

with:

```
- `content/docs/meta.json` — controls root sidebar ordering (uses `---@guoba-ai/utils---` and `---@guoba-ai/hook---` as section dividers)
- `content/docs/utils/` — **entirely generated** by TypeDoc from `@guoba-ai/utils`; do not edit manually
- `content/docs/hooks/` — **entirely generated** by TypeDoc from `@guoba-ai/hook`; do not edit manually
```

d) Update the Conventions section. Replace:

```
- **`content/docs/api/` is generated** — changes will be overwritten on next build. Edit the JSDoc in `packages/guoba-utils/src/` instead, then re-run `pnpm typedoc`
```

with:

```
- **`content/docs/utils/` and `content/docs/hooks/` are generated** — changes will be overwritten on next build. Edit the TSDoc in `packages/guoba-utils/src/` or `packages/guoba-hook/src/` instead, then re-run `pnpm typedoc`
```

e) Update the Verification section. Replace:

```
    - For API doc changes: check that the relevant `/docs/api/*` pages render properly
```

with:

```
    - For API doc changes: check that the relevant `/docs/utils/*` and `/docs/hooks/*` pages render properly
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md apps/docs/CLAUDE.md
git commit -m "docs: update CLAUDE.md files for dual TypeDoc setup"
```

---

### Task 8: Full pipeline verification

- [ ] **Step 1: Clean and regenerate everything**

```bash
cd apps/docs && rm -rf content/docs/utils content/docs/hooks && pnpm typedoc
```

Expected: Both TypeDoc runs succeed, postprocess runs, `✅ TypeDoc post-processing complete.` printed.

- [ ] **Step 2: Verify generated structure**

```bash
ls content/docs/utils/
ls content/docs/hooks/
```

Expected for utils: `array/`, `guard/`, `object/`, `string/`, `types/`, `index.mdx`, `meta.json`
Expected for hooks: hook `.mdx` files or subdirectories, `index.mdx`, `meta.json`

- [ ] **Step 3: Start dev server and verify in browser**

```bash
cd apps/docs && pnpm dev
```

Use the `agent-browser` skill to open `http://localhost:3000/docs` and verify:
- Sidebar shows "Getting Started", then `@guoba-ai/utils` section with utils modules, then `@guoba-ai/hook` section with hook pages
- Click a utils page (e.g., Array) — renders correctly
- Click a hooks page (e.g., useToggle) — renders correctly with TSDoc content
- All internal links work

- [ ] **Step 4: Stop dev server**
