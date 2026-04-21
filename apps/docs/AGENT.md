# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## Overview

Documentation site for `@guoba-ai/utils` and `@guoba-ai/hook`, built with Next.js 16 (App Router) + fumadocs-ui/fumadocs-mdx. API reference pages are auto-generated from source via TypeDoc.

## Commands

```bash
# Dev server (runs TypeDoc → postprocess → next dev)
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

### Two-Stage Build Pipeline

Next.js requires the generated `.mdx` files to exist before it builds. Every `dev` and `build` run executes this pipeline first:

1. **TypeDoc** — runs two configs sequentially:
   - `typedoc-utils.json` reads `../../packages/guoba-utils/src/{array,guard,object,string,types}.ts` → `content/docs/utils/`
   - `typedoc-hooks.json` reads `../../packages/guoba-hook/src/{useToggle,useDebounce,useThrottle,usePrevious,useMount,useUnmount}.ts` → `content/docs/hooks/`
   Both generate `.mdx` files with frontmatter (via `typedoc-plugin-markdown`, `typedoc-plugin-frontmatter`, and custom `typedoc-frontmatter.mjs`)
2. **Post-processing** (`typedoc-postprocess.mjs`) — processes both `content/docs/utils/` and `content/docs/hooks/`: flattens `functions/` and `type-aliases/` subdirectories, fixes internal links, generates `meta.json` sidebar entries per module

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
