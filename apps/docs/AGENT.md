# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## Overview

Documentation site for `@guoba-ai/utils` and `@guoba-ai/hook`, built with Next.js 16 (App Router) + fumadocs-ui/fumadocs-mdx. API reference pages are auto-generated from source via TypeDoc.

## Commands

```bash
# Dev server (runs scripts/build-docs.ts → next dev)
pnpm dev

# Production build
pnpm build

# Regenerate API docs only (without starting Next.js)
pnpm typedoc
```

## Verification

All changes to this docs app must be visually verified in the browser before reporting as complete:

1. Start the dev server: `pnpm dev` (from `apps/docs/`) or `pnpm docs:dev` (from monorepo root)
2. Use the `agent-browser` skill to open `http://localhost:3000` and verify:
    - The page renders without errors
    - Changed content displays correctly
    - Sidebar navigation works and reflects any structural changes
    - For API doc changes: check that the relevant `/docs/utils/*` and `/docs/hooks/*` pages render properly
3. If the change affects multiple pages (e.g., layout, styling, sidebar ordering), navigate to each affected page and verify



All commands run from this directory (`apps/docs/`), or use `pnpm docs:dev` / `pnpm docs:build` from the monorepo root.

## Architecture

### Build Pipeline

A single packages table (`lib/packages.ts`) drives the entire docs build. Each row is a `PackageMeta` whose `layout` selects how TypeDoc reads the source and how the postprocess pass reshapes the output:

- **`topical`** — package is a set of topical modules; one TypeDoc entry point per source file; postprocess flattens per-module subdirs and writes per-module `meta.json`. Today: `@guoba-ai/utils` (array, async, guard, object, string, types).
- **`flat`** — package is a single surface; one barrel TypeDoc entry point (`src/index.ts`); postprocess flattens top-level subdirs only. Today: `@guoba-ai/hook`.

(See the root `CONTEXT.md` for the layout vocabulary.)

Every `dev` and `build` runs `scripts/build-docs.ts`, which:

1. Iterates the `packages` table.
2. For each package, invokes TypeDoc programmatically (`lib/docs-pipeline/typedoc.ts`) with the right entry points, tsconfig, and the inline frontmatter listener that adds `title` to every generated page.
3. Runs the layout-aware postprocess (`lib/docs-pipeline/postprocess.ts`): removes stale `modules.mdx`/`globals.mdx`, dispatches to the layout strategy (`lib/docs-pipeline/layout.ts`), and fixes internal links.

**Adding a third package**: add one row to `lib/packages.ts` with the right `srcDir`, `tsconfig`, `layout`, and `outSlug`. Add the slug to `content/docs/meta.json`'s `pages` array for sidebar order. Nothing else.

### App Router Structure

- `app/layout.tsx` — root layout with fumadocs RootProvider
- `app/page.tsx` — homepage hero linking to `/docs`
- `app/docs/layout.tsx` — docs layout with sidebar (from `source.pageTree`)
- `app/docs/[[...slug]]/page.tsx` — catch-all route rendering MDX content via fumadocs components

### Content

- `content/docs/index.mdx` — hand-written "Getting Started" page
- `content/docs/meta.json` — controls root sidebar ordering (uses `---@guoba-ai/utils---` and `---@guoba-ai/hook---` as section dividers)
- `content/docs/utils/` — **entirely generated** by TypeDoc from `@guoba-ai/utils`; do not edit manually
- `content/docs/hooks/` — **entirely generated** by TypeDoc from `@guoba-ai/hook`; do not edit manually

### Key Files

- `lib/source.ts` — fumadocs loader; exports `source` (provides `pageTree`, `getPage()`, `generateParams()`)
- `mdx-components.tsx` — MDX component overrides (currently re-exports fumadocs defaults)
- `layout.config.tsx` — shared fumadocs layout options (nav title)

## Conventions

- **`content/docs/utils/` and `content/docs/hooks/` are generated** — changes will be overwritten on next build. Edit the TSDoc in `packages/guoba-utils/src/` or `packages/guoba-hook/src/` instead, then re-run `pnpm typedoc`
- **`.source/` is generated** — fumadocs runtime files, never edit manually
- Sidebar ordering is controlled by `meta.json` files in content directories
- Path alias: `@/*` maps to this directory root (e.g., `@/lib/source`)
- Styling: Tailwind v4 + fumadocs CSS presets (`neutral` + `preset`), configured in `globals.css` and `postcss.config.mjs`
