# @guoba-ai/utils

[![npm](https://img.shields.io/npm/v/@guoba-ai/utils.svg)](https://www.npmjs.com/package/@guoba-ai/utils)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/rikisamurai/guoba-ai/blob/main/LICENSE)

Pure TypeScript utility functions — ESM-only, zero dependencies, fully typed.

## Installation

```bash
pnpm add @guoba-ai/utils
# or: npm i @guoba-ai/utils / yarn add @guoba-ai/utils
```

## Usage

```ts
import { capitalize, chunk, deepMerge, toArray } from '@guoba-ai/utils'

toArray(1) // [1]
capitalize('hello') // 'Hello'
chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
deepMerge({ a: { x: 1 } }, { a: { y: 2 } }) // { a: { x: 1, y: 2 } }
```

## Modules

- **array** — `chunk`, `flattenDeep`, `group`, `toArray`, `uniq`, `zip`, …
- **guard** — `isString`, `isObject`, `isEmpty`, `notNullish`, …
- **object** — `deepMerge`, `pick`, `omit`, `get`, `set`, `mapValues`, …
- **string** — `camel`, `snake`, `capitalize`, `template`, …
- **types** — `Arrayable`, `Nullable`, `DeepPartial`, …

📖 **Full API reference** → [guoba-ai.vercel.app/docs/utils](https://guoba-ai.vercel.app/docs/utils)

## License

[MIT](https://github.com/rikisamurai/guoba-ai/blob/main/LICENSE)
