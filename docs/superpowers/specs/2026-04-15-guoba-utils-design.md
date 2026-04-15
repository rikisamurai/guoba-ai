# guoba-utils Design Spec

## Overview

A personal TypeScript utility library, inspired by [@antfu/utils](https://github.com/antfu/utils). Pure ESM, pnpm workspace monorepo, with auto-generated API documentation from TSDoc.

## Monorepo Structure

```
guoba-utils/
├── packages/
│   └── core/                  # @guoba/core
│       ├── src/
│       │   ├── array.ts
│       │   ├── object.ts
│       │   ├── string.ts
│       │   ├── guard.ts
│       │   ├── types.ts       # shared type utilities
│       │   └── index.ts       # barrel export
│       ├── tsdown.config.ts
│       ├── tsconfig.json
│       └── package.json
├── apps/
│   └── docs/                  # Fumadocs documentation site (Next.js)
│       ├── app/
│       ├── content/docs/      # MDX documentation pages
│       ├── next.config.mjs
│       └── package.json
├── package.json               # root workspace config
├── pnpm-workspace.yaml        # workspace definition
├── tsconfig.json              # root tsconfig with project references
└── eslint.config.mjs          # shared ESLint config
```

- `packages/` — publishable npm packages; new packages added here over time
- `apps/` — non-publishable applications (Fumadocs documentation site)
- Root-level ESLint config shared across all packages

## Tech Stack

| Layer        | Choice                  | Version    |
|-------------|-------------------------|------------|
| Runtime     | Node.js                 | >= 24.x    |
| Package mgr | pnpm                    | latest     |
| Language    | TypeScript              | ~6.0       |
| Build       | tsdown                  | ^0.21      |
| Lint        | @antfu/eslint-config    | latest     |
| Test        | vitest                  | latest     |
| Docs        | Fumadocs + fumadocs-typescript | latest |
| Module      | Pure ESM                | `"type": "module"` |

## @guoba/core — API Design

All functions have full TSDoc annotations (`@param`, `@returns`, `@example`) for Fumadocs auto-generation.

### array.ts

| Function | Signature | Description |
|----------|-----------|-------------|
| `toArray` | `<T>(value: Arrayable<T>) => T[]` | Wrap value as array; return as-is if already array |
| `uniq` | `<T>(array: T[]) => T[]` | Deduplicate array elements |
| `flattenDeep` | `<T>(array: NestedArray<T>) => T[]` | Deep flatten nested arrays |
| `chunk` | `<T>(array: T[], size: number) => T[][]` | Split array into chunks of given size |
| `shuffle` | `<T>(array: T[]) => T[]` | Randomly shuffle array (returns new array) |
| `last` | `<T>(array: T[]) => T \| undefined` | Get the last element |
| `remove` | `<T>(array: T[], predicate: (v: T) => boolean) => T[]` | Remove matching elements in-place, return removed |

### object.ts

| Function | Signature | Description |
|----------|-----------|-------------|
| `objectKeys` | `<T extends object>(obj: T) => (keyof T)[]` | Type-safe `Object.keys` |
| `objectEntries` | `<T extends object>(obj: T) => [keyof T, T[keyof T]][]` | Type-safe `Object.entries` |
| `deepClone` | `<T>(obj: T) => T` | Deep clone using `structuredClone` |
| `omit` | `<T, K extends keyof T>(obj: T, keys: K[]) => Omit<T, K>` | Exclude specified keys |
| `pick` | `<T, K extends keyof T>(obj: T, keys: K[]) => Pick<T, K>` | Pick specified keys |
| `deepMerge` | `<T extends object>(target: T, ...sources: DeepPartial<T>[]) => T` | Deep merge objects |

### string.ts

| Function | Signature | Description |
|----------|-----------|-------------|
| `capitalize` | `<T extends string>(str: T) => Capitalize<T>` | Capitalize first letter |
| `ensurePrefix` | `(str: string, prefix: string) => string` | Ensure string starts with prefix |
| `ensureSuffix` | `(str: string, suffix: string) => string` | Ensure string ends with suffix |
| `template` | `(str: string, data: Record<string, string>) => string` | Simple `{key}` template replacement |
| `slash` | `(str: string) => string` | Convert backslashes to forward slashes |

### guard.ts

| Function | Signature | Description |
|----------|-----------|-------------|
| `isString` | `(val: unknown) => val is string` | Check if value is string |
| `isNumber` | `(val: unknown) => val is number` | Check if value is number |
| `isBoolean` | `(val: unknown) => val is boolean` | Check if value is boolean |
| `isObject` | `(val: unknown) => val is Record<string, any>` | Check if value is plain object |
| `isFunction` | `(val: unknown) => val is Function` | Check if value is function |
| `isDef` | `<T>(val: T \| undefined) => val is T` | Check if value is defined |
| `isUndef` | `(val: unknown) => val is undefined` | Check if value is undefined |
| `isNull` | `(val: unknown) => val is null` | Check if value is null |
| `isNullOrUndef` | `(val: unknown) => val is null \| undefined` | Check if value is null or undefined |
| `isEmpty` | `(val: unknown) => boolean` | Check if value is empty (empty array/object/string) |
| `notNullish` | `<T>(val: T \| null \| undefined) => val is NonNullable<T>` | Non-nullish type guard |

### Type Utilities (exported from index.ts)

```typescript
type Arrayable<T> = T | T[]
type Nullable<T> = T | null
type Nullish<T> = T | null | undefined
type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] }
type NestedArray<T> = (T | NestedArray<T>)[]
```

## Build Configuration

### tsdown.config.ts

- Entry: `src/index.ts`
- Output format: ESM only (`.mjs`)
- Declaration files: `.d.mts` via `--dts`
- Clean output directory before build

### Package exports

```jsonc
{
  "name": "@guoba/core",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.mts"
    }
  },
  "files": ["dist"]
}
```

## ESLint Configuration

Root-level `eslint.config.mjs` using `@antfu/eslint-config`:

```js
import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
})
```

Style: single quotes, no semicolons, 2-space indent, sorted imports, dangling commas.

## Documentation (Fumadocs)

- Fumadocs (Next.js-based) deployed as `apps/docs`
- Uses `fumadocs-typescript` with `remarkAutoTypeTable` to auto-generate API docs from TSDoc comments
- Documentation pages organized by module: array, object, string, guard
- Each page uses MDX with auto-rendered type tables from source code

## Testing (Vitest)

- Test files co-located: `packages/core/test/*.test.ts`
- One test file per module: `array.test.ts`, `object.test.ts`, `string.test.ts`, `guard.test.ts`
- Per-package `vitest.config.ts` in `packages/core/`

## Scripts (root package.json)

```jsonc
{
  "scripts": {
    "build": "pnpm -r run build",
    "dev": "pnpm -r run dev",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "vitest",
    "docs:dev": "pnpm --filter docs dev",
    "docs:build": "pnpm --filter docs build"
  }
}
```
