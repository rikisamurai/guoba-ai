# @guoba-ai/docs

Documentation site for [`@guoba-ai/utils`](../../packages/guoba-utils) and [`@guoba-ai/hook`](../../packages/guoba-hook).

Built with **Next.js 16** (App Router) + **fumadocs** + **TypeDoc**. API reference pages are auto-generated from JSDoc in the source packages.

📖 **Live** → [guoba-ai.vercel.app/docs](https://guoba-ai.vercel.app/docs)

## Development

From the monorepo root:

```bash
pnpm docs:dev     # full pipeline: typedoc -> next dev (via portless)
pnpm docs:build   # production build
```

From this directory (`apps/docs/`):

```bash
pnpm dev          # = typedoc + post-process + dev:fast
pnpm dev:fast     # skip typedoc; just run portless + next dev
pnpm typedoc      # regenerate API docs only
pnpm build        # production build
pnpm start        # serve production build
```

The dev server is exposed at **`https://guoba-docs.localhost`** via [portless](https://github.com/vercel-labs/portless) — the subdomain is inferred from this package's `name`. First run installs a local CA into the system trust store (one-time sudo prompt); reverse with `portless clean`.

Use `pnpm dev:fast` when only `app/`, `lib/`, or CSS changes — it skips the ~5s TypeDoc step. Reach for the full `pnpm dev` after editing TSDoc in `packages/guoba-utils/src/` or `packages/guoba-hook/src/`.

## Content

- `content/docs/index.mdx` — hand-written "Getting Started" page
- `content/docs/meta.json` — controls sidebar ordering
- `content/docs/utils/**` — **generated** by TypeDoc from `packages/guoba-utils/src/`
- `content/docs/hooks/**` — **generated** by TypeDoc from `packages/guoba-hook/src/`

Edits to the generated directories are overwritten on the next `pnpm typedoc` run. To change API content, edit the TSDoc comments in the source package and re-run TypeDoc.

## Architecture notes

See [`AGENT.md`](./AGENT.md) for the two-stage build pipeline, fumadocs source loader, and content conventions.
