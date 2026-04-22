# guoba-ai

[![CI](https://github.com/rikisamurai/guoba-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/rikisamurai/guoba-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

A personal TypeScript toolkit monorepo: utility functions and React hooks, fully typed and ESM-only.

📖 **Documentation** → [guoba-ai.vercel.app/docs](https://guoba-ai.vercel.app/docs)

## Packages

| Package | Version | Description |
| --- | --- | --- |
| [`@guoba-ai/utils`](./packages/guoba-utils) | [![npm](https://img.shields.io/npm/v/@guoba-ai/utils.svg)](https://www.npmjs.com/package/@guoba-ai/utils) | Pure TypeScript utilities (array / object / string / guard) — zero dependencies |
| [`@guoba-ai/hook`](./packages/guoba-hook)   | [![npm](https://img.shields.io/npm/v/@guoba-ai/hook.svg)](https://www.npmjs.com/package/@guoba-ai/hook)   | React hooks collection — React 18+ peer dependency |

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

See [`AGENT.md`](./AGENT.md) for architecture notes and contribution conventions.

## License

[MIT](./LICENSE) © rikisamurai
