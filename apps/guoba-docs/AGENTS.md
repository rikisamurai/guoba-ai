# AGENTS.md

Guidance for Codex and compatible coding agents working in `apps/guoba-docs`.

## Harness Scope

This is the Next.js + fumadocs documentation app for `@guoba-ai/utils` and `@guoba-ai/hook`.

The docs harness owns:

- TypeDoc generation from package TSDoc into `content/docs/{utils,hooks}/`
- Layout-aware post-processing in `lib/docs-pipeline/**`
- fumadocs source loading via `.source/`, `source.config.ts`, and `lib/source.ts`
- Next.js routes under `/` and `/docs/**`
- Browser verification for docs UI, sidebar, generated pages, and source links

It does not own package runtime behavior, package tests, release/versioning, or manual edits to generated docs. If a docs change requires editing `packages/*`, follow that package's `AGENTS.md` too.

## Commands

Run app commands from `apps/guoba-docs/`:

- `pnpm dev` - run TypeDoc, then start the portless dev server
- `pnpm dev:fast` - start the dev server without regenerating TypeDoc
- `pnpm typedoc` - regenerate generated API docs only
- `pnpm test` - run docs pipeline tests
- `pnpm build` - run TypeDoc, then build the Next.js app

From the repo root, use `pnpm dev:docs` and `pnpm build:docs`.

## Verification

- For `lib/docs-pipeline/**`, `lib/packages.ts`, or `scripts/build-docs.ts`: run `pnpm test` and `pnpm typedoc`.
- For routes, layouts, styling, search, source loading, or sidebar changes: run `pnpm build`, then verify in browser.
- For TSDoc changes in `packages/*`: run the relevant package checks, then run `pnpm typedoc` here.
- Browser verification uses portless at `https://guoba-docs.localhost`; do not assume `localhost:3000`.
- When browser-verifying shared layout, sidebar, source loading, or generated docs, check `/docs`, one `/docs/utils/*` page, and one `/docs/hooks/*` page.

If Turbopack reports stale paths or `Next.js package not found` after a rename, dependency change, or branch switch, clear the ignored `.next/` cache before changing source code.

## Generated Content

- Do not manually edit `content/docs/utils/` or `content/docs/hooks/`; TypeDoc overwrites them.
- To change generated API content, edit TSDoc in `packages/guoba-utils/src/` or `packages/guoba-hook/src/`, then run `pnpm typedoc`.
- Do not edit `.source/` or `.next/`; both are generated.

## Architecture Rules

- `lib/packages.ts` is the source of truth for documented packages.
- `layout: 'topical'` means one docs page per source topic.
- `layout: 'flat'` means one package-level surface with exports flattened for scanning.
- Adding a documented package should require one `lib/packages.ts` row plus sidebar ordering in `content/docs/meta.json`.
- Path alias `@/*` maps to `apps/guoba-docs/*`.
