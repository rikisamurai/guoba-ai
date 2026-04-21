# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

guoba-ai is a pnpm monorepo containing a TypeScript utility library (`@guoba-ai/utils`) and its documentation site. The npm package name is `@guoba-ai/utils`.

## Commands

```bash
# Build all packages
pnpm build

# Lint (uses @antfu/eslint-config, lib mode)
pnpm lint
pnpm lint:fix

# Tests (vitest, root-level)
pnpm test                              # run all tests (watch mode)
pnpm test -- --run                     # run all tests once
pnpm test -- --run packages/guoba-utils/test/array.test.ts  # single file

# Docs site (Next.js + fumadocs)
pnpm docs:dev     # runs typedoc + postprocess, then next dev
pnpm docs:build   # runs typedoc + postprocess, then next build
```

## Architecture

**Monorepo layout** (pnpm workspaces):

- `packages/guoba-utils/` — the utility library (`@guoba-ai/utils`)
  - Source modules: `src/{array,guard,object,string,types}.ts`, re-exported via `src/index.ts`
  - Built with **tsdown** (ESM-only, with .d.mts declarations)
  - Tests live in `test/` (vitest, config in `vitest.config.ts`)
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

## Key Conventions

- ESM-only (`"type": "module"` everywhere), Node >= 24, TypeScript with `verbatimModuleSyntax`
- ESLint config: `@antfu/eslint-config` in lib mode — no semicolons, single quotes, no trailing commas in most places
- The docs site is excluded from linting (`docs/**` in eslint ignores)
- Source uses JSDoc comments with `@example` blocks — these feed into TypeDoc-generated API docs
