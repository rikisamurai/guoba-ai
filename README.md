# guoba-ai

[![CI](https://github.com/rikisamurai/guoba-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/rikisamurai/guoba-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

A personal TypeScript toolkit monorepo: utility functions and React hooks, fully typed and ESM-only.

📖 **Documentation** → [guoba-ai.vercel.app/docs](https://guoba-ai.vercel.app/docs)

## Packages

| Package                                     | Version                                                                                                   | Description                                                                     |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [`@guoba-ai/utils`](./packages/guoba-utils) | [![npm](https://img.shields.io/npm/v/@guoba-ai/utils.svg)](https://www.npmjs.com/package/@guoba-ai/utils) | Pure TypeScript utilities (array / object / string / guard) — zero dependencies |
| [`@guoba-ai/hook`](./packages/guoba-hook)   | [![npm](https://img.shields.io/npm/v/@guoba-ai/hook.svg)](https://www.npmjs.com/package/@guoba-ai/hook)   | React hooks collection — React 18+ peer dependency                              |

## Quick Start

### Utilities

```bash
pnpm add @guoba-ai/utils
```

```ts
import { capitalize, chunk, toArray } from '@guoba-ai/utils'

toArray(1) // [1]
capitalize('hello world') // 'Hello World'
chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
```

### React Hooks

```bash
pnpm add @guoba-ai/hook
```

```tsx
import { useDebounce, useToggle } from '@guoba-ai/hook'
import { useState } from 'react'

function Search() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const [open, toggle] = useToggle(false)
  // ...
}
```

## Development

Requires **Node ≥ 24** and **pnpm ≥ 10**.

```bash
pnpm install      # install deps
pnpm test         # run all package tests
pnpm lint         # eslint
pnpm build        # build utils + hook + docs
pnpm docs:dev     # run the docs site locally
```

`pnpm docs:dev` serves the docs site at `https://guoba-docs.localhost` via [portless](https://github.com/vercel-labs/portless); first run installs a local CA into the system trust store (one-time sudo). See [`apps/docs/README.md`](./apps/docs/README.md) for the per-app commands.

See [`AGENT.md`](./AGENT.md) for architecture notes and contribution conventions.

## Releasing

Releases are driven locally with [Changesets](https://github.com/changesets/changesets). Versioning, changelog generation, git tagging, and `npm publish` all happen from a maintainer's machine — there is no CI release workflow.

### One-time setup

```bash
npm login                          # authenticate to npmjs.org
npm whoami                         # verify
```

### Per-release flow

1. **Record the change** — in any PR that touches `packages/*`, run:

   ```bash
   pnpm changeset
   ```

   Pick the affected packages (`@guoba-ai/utils` / `@guoba-ai/hook`), choose a bump (`patch` / `minor` / `major`), and write a one-line summary. This creates `.changeset/<random>.md` — commit it with the rest of your PR.

2. **Bump versions on `main`** — once the changeset(s) are merged:

   ```bash
   git checkout main && git pull
   pnpm version                      # bumps package.json + writes CHANGELOG.md + deletes consumed .changeset/*.md
   git commit -am "chore: version packages"
   ```

3. **Publish** — build, publish to npm, and push the tags:

   ```bash
   pnpm release                      # = pnpm -r --filter "./packages/*" build && changeset publish
   git push --follow-tags
   ```

   `changeset publish` only publishes packages whose `package.json` version is ahead of npm; safe to re-run.

### Pre-release / snapshot versions

For ad-hoc test versions (e.g. install a PR build without polluting the release stream):

```bash
pnpm changeset version --snapshot pr123
pnpm -r --filter "./packages/*" run build
pnpm changeset publish --tag pr123 --no-git-tag
# install side: pnpm i @guoba-ai/utils@pr123
```

For an ongoing beta / rc channel, use `pnpm changeset pre enter beta` → `pnpm version` → `pnpm release` → `pnpm changeset pre exit` when ready to ship the stable.

### Notes

- Both packages publish as `access: public`; `dist/` is the only thing in the tarball (`files: ["dist"]`).
- npm provenance is intentionally **off** — it requires GitHub OIDC and would fail on a local publish. Re-enable it in `publishConfig.provenance` if/when releases move back into a CI workflow.
- The docs app (`apps/docs`) is private and excluded via `.changeset/config.json` `ignore`.

## License

[MIT](./LICENSE) © rikisamurai
