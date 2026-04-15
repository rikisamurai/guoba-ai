# guoba-utils Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal TypeScript utility library (`@guoba/core`) with pnpm monorepo, tsdown build, ESLint (antfu config), Vitest tests, and Fumadocs documentation site.

**Architecture:** pnpm workspace monorepo with `packages/core` (publishable utility library) and `apps/docs` (Fumadocs Next.js documentation site). Pure ESM throughout. All utility functions have full TSDoc annotations for auto-generated API documentation via `fumadocs-typescript`.

**Tech Stack:** Node.js >= 24, TypeScript ~6.0, tsdown ^0.21, pnpm workspaces, @antfu/eslint-config (flat config), Vitest, Fumadocs + fumadocs-typescript

---

### Task 1: Monorepo Root Scaffolding

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `.npmrc`

- [ ] **Step 1: Create root `package.json`**

```json
{
  "name": "guoba-utils",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@10.8.1",
  "engines": {
    "node": ">=24"
  },
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

- [ ] **Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - packages/*
  - apps/*
```

- [ ] **Step 3: Create root `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUncheckedIndexedAccess": true
  },
  "exclude": ["node_modules", "dist", ".next"]
}
```

- [ ] **Step 4: Create `.gitignore`**

```
node_modules
dist
.next
.source
*.tsbuildinfo
.turbo
coverage
.DS_Store
```

- [ ] **Step 5: Create `.npmrc`**

```ini
shamefully-hoist=false
strict-peer-dependencies=false
```

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.json .gitignore .npmrc
git commit -m "chore: scaffold monorepo root"
```

---

### Task 2: ESLint Configuration

**Files:**
- Create: `eslint.config.mjs`

- [ ] **Step 1: Install ESLint and @antfu/eslint-config**

Run: `pnpm add -D -w eslint @antfu/eslint-config`

- [ ] **Step 2: Create `eslint.config.mjs`**

```js
import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
})
```

- [ ] **Step 3: Verify ESLint runs without error**

Run: `pnpm lint`
Expected: No errors (no source files yet, should exit cleanly)

- [ ] **Step 4: Commit**

```bash
git add eslint.config.mjs pnpm-lock.yaml
git commit -m "chore: add eslint with @antfu/eslint-config"
```

---

### Task 3: @guoba/core Package Scaffolding

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/tsdown.config.ts`
- Create: `packages/core/src/index.ts`

- [ ] **Step 1: Create directory structure**

Run: `mkdir -p packages/core/src packages/core/test`

- [ ] **Step 2: Create `packages/core/package.json`**

```json
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
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown --watch"
  }
}
```

- [ ] **Step 3: Create `packages/core/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create `packages/core/tsdown.config.ts`**

```ts
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: 'esm',
  dts: true,
  clean: true,
})
```

- [ ] **Step 5: Create placeholder `packages/core/src/index.ts`**

```ts
export {}
```

- [ ] **Step 6: Install tsdown and typescript in core package**

Run: `pnpm add -D tsdown typescript --filter @guoba/core`

- [ ] **Step 7: Verify build works**

Run: `pnpm --filter @guoba/core build`
Expected: Build succeeds, `packages/core/dist/index.mjs` and `packages/core/dist/index.d.mts` are generated.

- [ ] **Step 8: Commit**

```bash
git add packages/core/
git commit -m "chore: scaffold @guoba/core package with tsdown"
```

---

### Task 4: Vitest Setup

**Files:**
- Create: `packages/core/vitest.config.ts`

- [ ] **Step 1: Install vitest at root**

Run: `pnpm add -D -w vitest`

- [ ] **Step 2: Create `packages/core/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
  },
})
```

- [ ] **Step 3: Create a smoke test `packages/core/test/smoke.test.ts`**

```ts
import { describe, expect, it } from 'vitest'

describe('smoke test', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 4: Run test to verify setup works**

Run: `pnpm vitest run --config packages/core/vitest.config.ts`
Expected: 1 test passed

- [ ] **Step 5: Commit**

```bash
git add packages/core/vitest.config.ts packages/core/test/smoke.test.ts pnpm-lock.yaml
git commit -m "chore: add vitest setup for @guoba/core"
```

---

### Task 5: Type Utilities

**Files:**
- Create: `packages/core/src/types.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Create `packages/core/src/types.ts`**

```ts
/**
 * A value that can be either a single item or an array of items.
 *
 * @example
 * ```ts
 * type Input = Arrayable<string> // string | string[]
 * ```
 */
export type Arrayable<T> = T | T[]

/**
 * A value that can be null.
 *
 * @example
 * ```ts
 * type MaybeNull = Nullable<string> // string | null
 * ```
 */
export type Nullable<T> = T | null

/**
 * A value that can be null or undefined.
 *
 * @example
 * ```ts
 * type MaybeNullish = Nullish<string> // string | null | undefined
 * ```
 */
export type Nullish<T> = T | null | undefined

/**
 * Recursively makes all properties optional.
 *
 * @example
 * ```ts
 * type Partial = DeepPartial<{ a: { b: number } }> // { a?: { b?: number } }
 * ```
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * A nested array type that can contain values or other nested arrays.
 *
 * @example
 * ```ts
 * const nested: NestedArray<number> = [1, [2, [3, 4]], 5]
 * ```
 */
export type NestedArray<T> = (T | NestedArray<T>)[]
```

- [ ] **Step 2: Export types from `packages/core/src/index.ts`**

Replace the content of `packages/core/src/index.ts` with:

```ts
export type { Arrayable, DeepPartial, NestedArray, Nullable, Nullish } from './types'
```

- [ ] **Step 3: Verify build succeeds with types**

Run: `pnpm --filter @guoba/core build`
Expected: Build succeeds, types are exported in `.d.mts`

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/types.ts packages/core/src/index.ts
git commit -m "feat(core): add type utilities"
```

---

### Task 6: Guard Module (TDD)

**Files:**
- Create: `packages/core/src/guard.ts`
- Create: `packages/core/test/guard.test.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Write tests `packages/core/test/guard.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import {
  isBoolean,
  isDef,
  isEmpty,
  isFunction,
  isNull,
  isNullOrUndef,
  isNumber,
  isObject,
  isString,
  isUndef,
  notNullish,
} from '../src'

describe('guard', () => {
  describe('isString', () => {
    it('should return true for strings', () => {
      expect(isString('hello')).toBe(true)
      expect(isString('')).toBe(true)
    })
    it('should return false for non-strings', () => {
      expect(isString(123)).toBe(false)
      expect(isString(null)).toBe(false)
      expect(isString(undefined)).toBe(false)
    })
  })

  describe('isNumber', () => {
    it('should return true for numbers', () => {
      expect(isNumber(42)).toBe(true)
      expect(isNumber(0)).toBe(true)
      expect(isNumber(Number.NaN)).toBe(true)
    })
    it('should return false for non-numbers', () => {
      expect(isNumber('42')).toBe(false)
      expect(isNumber(null)).toBe(false)
    })
  })

  describe('isBoolean', () => {
    it('should return true for booleans', () => {
      expect(isBoolean(true)).toBe(true)
      expect(isBoolean(false)).toBe(true)
    })
    it('should return false for non-booleans', () => {
      expect(isBoolean(0)).toBe(false)
      expect(isBoolean('true')).toBe(false)
    })
  })

  describe('isObject', () => {
    it('should return true for plain objects', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ a: 1 })).toBe(true)
    })
    it('should return false for arrays, null, and primitives', () => {
      expect(isObject([])).toBe(false)
      expect(isObject(null)).toBe(false)
      expect(isObject('string')).toBe(false)
    })
  })

  describe('isFunction', () => {
    it('should return true for functions', () => {
      expect(isFunction(() => {})).toBe(true)
      expect(isFunction(Math.round)).toBe(true)
    })
    it('should return false for non-functions', () => {
      expect(isFunction({})).toBe(false)
      expect(isFunction(42)).toBe(false)
    })
  })

  describe('isDef', () => {
    it('should return true for defined values', () => {
      expect(isDef(0)).toBe(true)
      expect(isDef(null)).toBe(true)
      expect(isDef('')).toBe(true)
    })
    it('should return false for undefined', () => {
      expect(isDef(undefined)).toBe(false)
    })
  })

  describe('isUndef', () => {
    it('should return true for undefined', () => {
      expect(isUndef(undefined)).toBe(true)
    })
    it('should return false for defined values', () => {
      expect(isUndef(null)).toBe(false)
      expect(isUndef(0)).toBe(false)
    })
  })

  describe('isNull', () => {
    it('should return true for null', () => {
      expect(isNull(null)).toBe(true)
    })
    it('should return false for non-null', () => {
      expect(isNull(undefined)).toBe(false)
      expect(isNull(0)).toBe(false)
    })
  })

  describe('isNullOrUndef', () => {
    it('should return true for null and undefined', () => {
      expect(isNullOrUndef(null)).toBe(true)
      expect(isNullOrUndef(undefined)).toBe(true)
    })
    it('should return false for other values', () => {
      expect(isNullOrUndef(0)).toBe(false)
      expect(isNullOrUndef('')).toBe(false)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty values', () => {
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
      expect(isEmpty('')).toBe(true)
    })
    it('should return true for null and undefined', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
    })
    it('should return false for non-empty values', () => {
      expect(isEmpty([1])).toBe(false)
      expect(isEmpty({ a: 1 })).toBe(false)
      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty(0)).toBe(false)
    })
  })

  describe('notNullish', () => {
    it('should return true for non-nullish values', () => {
      expect(notNullish(0)).toBe(true)
      expect(notNullish('')).toBe(true)
      expect(notNullish(false)).toBe(true)
    })
    it('should return false for null and undefined', () => {
      expect(notNullish(null)).toBe(false)
      expect(notNullish(undefined)).toBe(false)
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run --config packages/core/vitest.config.ts test/guard.test.ts`
Expected: FAIL — imports not found

- [ ] **Step 3: Create `packages/core/src/guard.ts`**

```ts
/**
 * Check if a value is a string.
 *
 * @param val - The value to check
 * @returns `true` if the value is a string
 * @example
 * ```ts
 * isString('hello') // true
 * isString(123) // false
 * ```
 */
export function isString(val: unknown): val is string {
  return typeof val === 'string'
}

/**
 * Check if a value is a number.
 *
 * @param val - The value to check
 * @returns `true` if the value is a number
 * @example
 * ```ts
 * isNumber(42) // true
 * isNumber('42') // false
 * ```
 */
export function isNumber(val: unknown): val is number {
  return typeof val === 'number'
}

/**
 * Check if a value is a boolean.
 *
 * @param val - The value to check
 * @returns `true` if the value is a boolean
 * @example
 * ```ts
 * isBoolean(true) // true
 * isBoolean(0) // false
 * ```
 */
export function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean'
}

/**
 * Check if a value is a plain object (not an array or null).
 *
 * @param val - The value to check
 * @returns `true` if the value is a plain object
 * @example
 * ```ts
 * isObject({ a: 1 }) // true
 * isObject([1, 2]) // false
 * isObject(null) // false
 * ```
 */
export function isObject(val: unknown): val is Record<string, any> {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

/**
 * Check if a value is a function.
 *
 * @param val - The value to check
 * @returns `true` if the value is a function
 * @example
 * ```ts
 * isFunction(() => {}) // true
 * isFunction({}) // false
 * ```
 */
// eslint-disable-next-line ts/no-unsafe-function-type
export function isFunction(val: unknown): val is Function {
  return typeof val === 'function'
}

/**
 * Check if a value is defined (not undefined).
 *
 * @param val - The value to check
 * @returns `true` if the value is not undefined
 * @example
 * ```ts
 * isDef(0) // true
 * isDef(null) // true
 * isDef(undefined) // false
 * ```
 */
export function isDef<T>(val: T | undefined): val is T {
  return val !== undefined
}

/**
 * Check if a value is undefined.
 *
 * @param val - The value to check
 * @returns `true` if the value is undefined
 * @example
 * ```ts
 * isUndef(undefined) // true
 * isUndef(null) // false
 * ```
 */
export function isUndef(val: unknown): val is undefined {
  return val === undefined
}

/**
 * Check if a value is null.
 *
 * @param val - The value to check
 * @returns `true` if the value is null
 * @example
 * ```ts
 * isNull(null) // true
 * isNull(undefined) // false
 * ```
 */
export function isNull(val: unknown): val is null {
  return val === null
}

/**
 * Check if a value is null or undefined.
 *
 * @param val - The value to check
 * @returns `true` if the value is null or undefined
 * @example
 * ```ts
 * isNullOrUndef(null) // true
 * isNullOrUndef(undefined) // true
 * isNullOrUndef(0) // false
 * ```
 */
export function isNullOrUndef(val: unknown): val is null | undefined {
  return val === null || val === undefined
}

/**
 * Check if a value is empty. Returns `true` for:
 * - `null` and `undefined`
 * - Empty strings (`''`)
 * - Empty arrays (`[]`)
 * - Empty objects (`{}`)
 *
 * @param val - The value to check
 * @returns `true` if the value is considered empty
 * @example
 * ```ts
 * isEmpty([]) // true
 * isEmpty({}) // true
 * isEmpty('') // true
 * isEmpty(null) // true
 * isEmpty([1]) // false
 * isEmpty(0) // false
 * ```
 */
export function isEmpty(val: unknown): boolean {
  if (val === null || val === undefined)
    return true
  if (typeof val === 'string')
    return val.length === 0
  if (Array.isArray(val))
    return val.length === 0
  if (typeof val === 'object')
    return Object.keys(val).length === 0
  return false
}

/**
 * Check if a value is not null or undefined (type narrowing).
 *
 * @param val - The value to check
 * @returns `true` if the value is not null or undefined
 * @example
 * ```ts
 * const values = [1, null, 2, undefined, 3]
 * const filtered = values.filter(notNullish) // [1, 2, 3] typed as number[]
 * ```
 */
export function notNullish<T>(val: T | null | undefined): val is NonNullable<T> {
  return val !== null && val !== undefined
}
```

- [ ] **Step 4: Add guard exports to `packages/core/src/index.ts`**

Add this line to `packages/core/src/index.ts`:

```ts
export { isBoolean, isDef, isEmpty, isFunction, isNull, isNullOrUndef, isNumber, isObject, isString, isUndef, notNullish } from './guard'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run --config packages/core/vitest.config.ts test/guard.test.ts`
Expected: All 20 tests pass

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/guard.ts packages/core/test/guard.test.ts packages/core/src/index.ts
git commit -m "feat(core): add guard module with type guards and assertions"
```

---

### Task 7: Array Module (TDD)

**Files:**
- Create: `packages/core/src/array.ts`
- Create: `packages/core/test/array.test.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Write tests `packages/core/test/array.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { chunk, flattenDeep, last, remove, shuffle, toArray, uniq } from '../src'

describe('array', () => {
  describe('toArray', () => {
    it('should wrap non-array values', () => {
      expect(toArray(1)).toEqual([1])
      expect(toArray('hello')).toEqual(['hello'])
    })
    it('should return arrays as-is', () => {
      const arr = [1, 2, 3]
      expect(toArray(arr)).toBe(arr)
    })
    it('should wrap null and undefined', () => {
      expect(toArray(null)).toEqual([null])
      expect(toArray(undefined)).toEqual([undefined])
    })
  })

  describe('uniq', () => {
    it('should remove duplicates', () => {
      expect(uniq([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
    })
    it('should handle empty arrays', () => {
      expect(uniq([])).toEqual([])
    })
    it('should preserve order', () => {
      expect(uniq([3, 1, 2, 1, 3])).toEqual([3, 1, 2])
    })
  })

  describe('flattenDeep', () => {
    it('should flatten nested arrays', () => {
      expect(flattenDeep([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4])
    })
    it('should handle flat arrays', () => {
      expect(flattenDeep([1, 2, 3])).toEqual([1, 2, 3])
    })
    it('should handle empty arrays', () => {
      expect(flattenDeep([])).toEqual([])
    })
  })

  describe('chunk', () => {
    it('should split array into chunks', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    })
    it('should handle exact divisions', () => {
      expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]])
    })
    it('should handle empty arrays', () => {
      expect(chunk([], 2)).toEqual([])
    })
    it('should handle chunk size larger than array', () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]])
    })
  })

  describe('shuffle', () => {
    it('should return a new array with same elements', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = shuffle(arr)
      expect(result).not.toBe(arr)
      expect(result.sort()).toEqual(arr.sort())
    })
    it('should handle empty arrays', () => {
      expect(shuffle([])).toEqual([])
    })
    it('should handle single element', () => {
      expect(shuffle([1])).toEqual([1])
    })
  })

  describe('last', () => {
    it('should return the last element', () => {
      expect(last([1, 2, 3])).toBe(3)
    })
    it('should return undefined for empty arrays', () => {
      expect(last([])).toBeUndefined()
    })
  })

  describe('remove', () => {
    it('should remove matching elements in-place', () => {
      const arr = [1, 2, 3, 4, 5]
      const removed = remove(arr, v => v % 2 === 0)
      expect(arr).toEqual([1, 3, 5])
      expect(removed).toEqual([2, 4])
    })
    it('should return empty array when nothing matches', () => {
      const arr = [1, 2, 3]
      const removed = remove(arr, v => v > 10)
      expect(arr).toEqual([1, 2, 3])
      expect(removed).toEqual([])
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run --config packages/core/vitest.config.ts test/array.test.ts`
Expected: FAIL — imports not found

- [ ] **Step 3: Create `packages/core/src/array.ts`**

```ts
import type { Arrayable, NestedArray } from './types'

/**
 * Wrap a value as an array. If the value is already an array, return it as-is.
 *
 * @param value - The value to wrap
 * @returns The value wrapped in an array, or the original array
 * @example
 * ```ts
 * toArray(1) // [1]
 * toArray([1, 2]) // [1, 2]
 * ```
 */
export function toArray<T>(value: Arrayable<T>): T[] {
  return Array.isArray(value) ? value : [value]
}

/**
 * Remove duplicate elements from an array.
 *
 * @param array - The input array
 * @returns A new array with duplicates removed, preserving order
 * @example
 * ```ts
 * uniq([1, 2, 2, 3]) // [1, 2, 3]
 * ```
 */
export function uniq<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * Deeply flatten a nested array.
 *
 * @param array - The nested array to flatten
 * @returns A new flat array
 * @example
 * ```ts
 * flattenDeep([1, [2, [3, [4]]]]) // [1, 2, 3, 4]
 * ```
 */
export function flattenDeep<T>(array: NestedArray<T>): T[] {
  return array.flat(Number.POSITIVE_INFINITY) as T[]
}

/**
 * Split an array into chunks of the given size.
 *
 * @param array - The array to split
 * @param size - The size of each chunk
 * @returns An array of chunks
 * @example
 * ```ts
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size)
    result.push(array.slice(i, i + size))
  return result
}

/**
 * Randomly shuffle an array. Returns a new array.
 *
 * @param array - The array to shuffle
 * @returns A new shuffled array
 * @example
 * ```ts
 * shuffle([1, 2, 3, 4, 5]) // [3, 1, 5, 2, 4] (random order)
 * ```
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

/**
 * Get the last element of an array.
 *
 * @param array - The input array
 * @returns The last element, or `undefined` if empty
 * @example
 * ```ts
 * last([1, 2, 3]) // 3
 * last([]) // undefined
 * ```
 */
export function last<T>(array: T[]): T | undefined {
  return array.at(-1)
}

/**
 * Remove elements from an array in-place that match the predicate.
 *
 * @param array - The array to modify
 * @param predicate - Function that returns `true` for elements to remove
 * @returns An array of removed elements
 * @example
 * ```ts
 * const arr = [1, 2, 3, 4, 5]
 * remove(arr, v => v % 2 === 0) // [2, 4]
 * // arr is now [1, 3, 5]
 * ```
 */
export function remove<T>(array: T[], predicate: (v: T) => boolean): T[] {
  const removed: T[] = []
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i]!)) {
      removed.unshift(array.splice(i, 1)[0]!)
    }
  }
  return removed
}
```

- [ ] **Step 4: Add array exports to `packages/core/src/index.ts`**

Add this line to `packages/core/src/index.ts`:

```ts
export { chunk, flattenDeep, last, remove, shuffle, toArray, uniq } from './array'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run --config packages/core/vitest.config.ts test/array.test.ts`
Expected: All 14 tests pass

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/array.ts packages/core/test/array.test.ts packages/core/src/index.ts
git commit -m "feat(core): add array utilities"
```

---

### Task 8: String Module (TDD)

**Files:**
- Create: `packages/core/src/string.ts`
- Create: `packages/core/test/string.test.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Write tests `packages/core/test/string.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { capitalize, ensurePrefix, ensureSuffix, slash, template } from '../src'

describe('string', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
    })
    it('should handle empty string', () => {
      expect(capitalize('')).toBe('')
    })
    it('should handle already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello')
    })
    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A')
    })
  })

  describe('ensurePrefix', () => {
    it('should add prefix if missing', () => {
      expect(ensurePrefix('world', 'hello ')).toBe('hello world')
    })
    it('should not duplicate prefix', () => {
      expect(ensurePrefix('hello world', 'hello ')).toBe('hello world')
    })
  })

  describe('ensureSuffix', () => {
    it('should add suffix if missing', () => {
      expect(ensureSuffix('hello', ' world')).toBe('hello world')
    })
    it('should not duplicate suffix', () => {
      expect(ensureSuffix('hello world', ' world')).toBe('hello world')
    })
  })

  describe('template', () => {
    it('should replace placeholders', () => {
      expect(template('Hello {name}!', { name: 'World' })).toBe('Hello World!')
    })
    it('should handle multiple placeholders', () => {
      expect(template('{a} + {b} = {c}', { a: '1', b: '2', c: '3' })).toBe('1 + 2 = 3')
    })
    it('should leave unmatched placeholders', () => {
      expect(template('Hello {name}!', {})).toBe('Hello {name}!')
    })
  })

  describe('slash', () => {
    it('should convert backslashes to forward slashes', () => {
      expect(slash('foo\\bar\\baz')).toBe('foo/bar/baz')
    })
    it('should leave forward slashes unchanged', () => {
      expect(slash('foo/bar/baz')).toBe('foo/bar/baz')
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run --config packages/core/vitest.config.ts test/string.test.ts`
Expected: FAIL — imports not found

- [ ] **Step 3: Create `packages/core/src/string.ts`**

```ts
/**
 * Capitalize the first letter of a string.
 *
 * @param str - The string to capitalize
 * @returns The string with its first letter uppercased
 * @example
 * ```ts
 * capitalize('hello') // 'Hello'
 * ```
 */
export function capitalize<T extends string>(str: T): Capitalize<T> {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>
}

/**
 * Ensure a string starts with a given prefix.
 *
 * @param str - The input string
 * @param prefix - The prefix to ensure
 * @returns The string with the prefix prepended if it was missing
 * @example
 * ```ts
 * ensurePrefix('/path', '/') // '/path'
 * ensurePrefix('path', '/') // '/path'
 * ```
 */
export function ensurePrefix(str: string, prefix: string): string {
  return str.startsWith(prefix) ? str : prefix + str
}

/**
 * Ensure a string ends with a given suffix.
 *
 * @param str - The input string
 * @param suffix - The suffix to ensure
 * @returns The string with the suffix appended if it was missing
 * @example
 * ```ts
 * ensureSuffix('file.ts', '.ts') // 'file.ts'
 * ensureSuffix('file', '.ts') // 'file.ts'
 * ```
 */
export function ensureSuffix(str: string, suffix: string): string {
  return str.endsWith(suffix) ? str : str + suffix
}

/**
 * Simple template string replacement. Replaces `{key}` placeholders
 * with values from the data object.
 *
 * @param str - The template string with `{key}` placeholders
 * @param data - Object with replacement values
 * @returns The string with placeholders replaced
 * @example
 * ```ts
 * template('Hello {name}!', { name: 'World' }) // 'Hello World!'
 * ```
 */
export function template(str: string, data: Record<string, string>): string {
  return str.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in data ? data[key]! : match,
  )
}

/**
 * Convert backslashes to forward slashes.
 *
 * @param str - The input string
 * @returns The string with all backslashes replaced by forward slashes
 * @example
 * ```ts
 * slash('foo\\bar\\baz') // 'foo/bar/baz'
 * ```
 */
export function slash(str: string): string {
  return str.replace(/\\/g, '/')
}
```

- [ ] **Step 4: Add string exports to `packages/core/src/index.ts`**

Add this line to `packages/core/src/index.ts`:

```ts
export { capitalize, ensurePrefix, ensureSuffix, slash, template } from './string'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run --config packages/core/vitest.config.ts test/string.test.ts`
Expected: All 10 tests pass

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/string.ts packages/core/test/string.test.ts packages/core/src/index.ts
git commit -m "feat(core): add string utilities"
```

---

### Task 9: Object Module (TDD)

**Files:**
- Create: `packages/core/src/object.ts`
- Create: `packages/core/test/object.test.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Write tests `packages/core/test/object.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { deepClone, deepMerge, objectEntries, objectKeys, omit, pick } from '../src'

describe('object', () => {
  describe('objectKeys', () => {
    it('should return typed keys', () => {
      const keys = objectKeys({ a: 1, b: 2, c: 3 })
      expect(keys).toEqual(['a', 'b', 'c'])
    })
    it('should handle empty objects', () => {
      expect(objectKeys({})).toEqual([])
    })
  })

  describe('objectEntries', () => {
    it('should return typed entries', () => {
      const entries = objectEntries({ a: 1, b: 2 })
      expect(entries).toEqual([['a', 1], ['b', 2]])
    })
  })

  describe('deepClone', () => {
    it('should deep clone objects', () => {
      const obj = { a: { b: { c: 1 } } }
      const cloned = deepClone(obj)
      expect(cloned).toEqual(obj)
      expect(cloned).not.toBe(obj)
      expect(cloned.a).not.toBe(obj.a)
    })
    it('should clone arrays', () => {
      const arr = [1, [2, [3]]]
      const cloned = deepClone(arr)
      expect(cloned).toEqual(arr)
      expect(cloned).not.toBe(arr)
    })
  })

  describe('omit', () => {
    it('should omit specified keys', () => {
      const result = omit({ a: 1, b: 2, c: 3 }, ['b', 'c'])
      expect(result).toEqual({ a: 1 })
    })
    it('should handle empty keys array', () => {
      const obj = { a: 1, b: 2 }
      expect(omit(obj, [])).toEqual({ a: 1, b: 2 })
    })
  })

  describe('pick', () => {
    it('should pick specified keys', () => {
      const result = pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])
      expect(result).toEqual({ a: 1, c: 3 })
    })
    it('should handle empty keys array', () => {
      expect(pick({ a: 1, b: 2 }, [])).toEqual({})
    })
  })

  describe('deepMerge', () => {
    it('should deeply merge objects', () => {
      const target = { a: 1, b: { c: 2, d: 3 } }
      const source = { b: { c: 4, e: 5 } }
      const result = deepMerge(target, source)
      expect(result).toEqual({ a: 1, b: { c: 4, d: 3, e: 5 } })
    })
    it('should override primitives', () => {
      const result = deepMerge({ a: 1 }, { a: 2 })
      expect(result).toEqual({ a: 2 })
    })
    it('should handle arrays by replacement', () => {
      const result = deepMerge({ a: [1, 2] }, { a: [3, 4, 5] })
      expect(result).toEqual({ a: [3, 4, 5] })
    })
    it('should merge multiple sources', () => {
      const result = deepMerge({ a: 1 }, { b: 2 }, { c: 3 })
      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })
    it('should not mutate target', () => {
      const target = { a: 1, b: { c: 2 } }
      const result = deepMerge(target, { b: { c: 3 } })
      expect(target.b.c).toBe(2)
      expect(result.b.c).toBe(3)
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run --config packages/core/vitest.config.ts test/object.test.ts`
Expected: FAIL — imports not found

- [ ] **Step 3: Create `packages/core/src/object.ts`**

```ts
import type { DeepPartial } from './types'
import { isObject } from './guard'

/**
 * Type-safe `Object.keys`.
 *
 * @param obj - The object to get keys from
 * @returns An array of the object's own enumerable keys
 * @example
 * ```ts
 * objectKeys({ a: 1, b: 2 }) // ['a', 'b'] typed as ('a' | 'b')[]
 * ```
 */
export function objectKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

/**
 * Type-safe `Object.entries`.
 *
 * @param obj - The object to get entries from
 * @returns An array of [key, value] pairs
 * @example
 * ```ts
 * objectEntries({ a: 1, b: 2 }) // [['a', 1], ['b', 2]]
 * ```
 */
export function objectEntries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

/**
 * Deep clone a value using `structuredClone`.
 *
 * @param obj - The value to clone
 * @returns A deep copy of the value
 * @example
 * ```ts
 * const original = { a: { b: 1 } }
 * const copy = deepClone(original)
 * copy.a.b = 2
 * original.a.b // still 1
 * ```
 */
export function deepClone<T>(obj: T): T {
  return structuredClone(obj)
}

/**
 * Create a new object with specified keys omitted.
 *
 * @param obj - The source object
 * @param keys - Keys to omit
 * @returns A new object without the specified keys
 * @example
 * ```ts
 * omit({ a: 1, b: 2, c: 3 }, ['b', 'c']) // { a: 1 }
 * ```
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  for (const key of keys)
    delete result[key]
  return result as Omit<T, K>
}

/**
 * Create a new object with only the specified keys.
 *
 * @param obj - The source object
 * @param keys - Keys to pick
 * @returns A new object with only the specified keys
 * @example
 * ```ts
 * pick({ a: 1, b: 2, c: 3 }, ['a', 'c']) // { a: 1, c: 3 }
 * ```
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys)
    result[key] = obj[key]
  return result
}

/**
 * Deep merge objects. Arrays are replaced, not merged.
 * Does not mutate the target — returns a new object.
 *
 * @param target - The target object
 * @param sources - Source objects to merge into target
 * @returns A new deeply merged object
 * @example
 * ```ts
 * deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 } })
 * // { a: 1, b: { c: 2, d: 3 } }
 * ```
 */
export function deepMerge<T extends object>(target: T, ...sources: DeepPartial<T>[]): T {
  const result = structuredClone(target)

  for (const source of sources) {
    for (const key of Object.keys(source) as (keyof T)[]) {
      const sourceVal = source[key as keyof typeof source]
      const targetVal = result[key]

      if (isObject(sourceVal) && isObject(targetVal)) {
        ;(result as any)[key] = deepMerge(targetVal, sourceVal as any)
      }
      else {
        ;(result as any)[key] = sourceVal
      }
    }
  }

  return result
}
```

- [ ] **Step 4: Add object exports to `packages/core/src/index.ts`**

Add this line to `packages/core/src/index.ts`:

```ts
export { deepClone, deepMerge, objectEntries, objectKeys, omit, pick } from './object'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run --config packages/core/vitest.config.ts test/object.test.ts`
Expected: All 10 tests pass

- [ ] **Step 6: Commit**

```bash
git add packages/core/src/object.ts packages/core/test/object.test.ts packages/core/src/index.ts
git commit -m "feat(core): add object utilities"
```

---

### Task 10: Full Build & Test Verification

**Files:**
- Delete: `packages/core/test/smoke.test.ts` (no longer needed)

- [ ] **Step 1: Delete smoke test**

Run: `rm packages/core/test/smoke.test.ts`

- [ ] **Step 2: Run all tests**

Run: `pnpm vitest run --config packages/core/vitest.config.ts`
Expected: All tests pass (guard, array, string, object modules)

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: No lint errors. If there are any, fix them with `pnpm lint:fix` and review changes.

- [ ] **Step 4: Run build**

Run: `pnpm --filter @guoba/core build`
Expected: Build succeeds. Verify outputs exist:

Run: `ls packages/core/dist/`
Expected: `index.mjs` and `index.d.mts` present

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(core): full build and test verification pass"
```

---

### Task 11: Fumadocs Documentation Site Setup

**Files:**
- Create: `apps/docs/package.json`
- Create: `apps/docs/next.config.mjs`
- Create: `apps/docs/source.config.ts`
- Create: `apps/docs/tsconfig.json`
- Create: `apps/docs/lib/source.ts`
- Create: `apps/docs/app/layout.tsx`
- Create: `apps/docs/app/layout.config.tsx`
- Create: `apps/docs/app/globals.css`
- Create: `apps/docs/app/page.tsx`
- Create: `apps/docs/app/docs/layout.tsx`
- Create: `apps/docs/app/docs/[[...slug]]/page.tsx`
- Create: `apps/docs/mdx-components.tsx`

- [ ] **Step 1: Create directory structure**

Run: `mkdir -p apps/docs/app/docs/\[\[...slug\]\] apps/docs/lib apps/docs/content/docs`

- [ ] **Step 2: Create `apps/docs/package.json`**

```json
{
  "name": "docs",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

- [ ] **Step 3: Install dependencies for docs**

Run: `pnpm add next react react-dom fumadocs-core fumadocs-ui fumadocs-mdx fumadocs-typescript --filter docs`

Run: `pnpm add -D @types/react @types/react-dom tailwindcss @tailwindcss/postcss postcss typescript --filter docs`

- [ ] **Step 4: Create `apps/docs/next.config.mjs`**

```js
import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {}

export default withMDX(config)
```

- [ ] **Step 5: Create `apps/docs/source.config.ts`**

```ts
import {
  createFileSystemGeneratorCache,
  createGenerator,
  remarkAutoTypeTable,
} from 'fumadocs-typescript'
import { defineConfig } from 'fumadocs-mdx/config'

const generator = createGenerator({
  cache: createFileSystemGeneratorCache('.next/fumadocs-typescript'),
})

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [[remarkAutoTypeTable, { generator }]],
  },
})
```

- [ ] **Step 6: Create `apps/docs/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "jsx": "preserve",
    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [
      { "name": "next" }
    ]
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".source/**/*.ts",
    "mdx-components.tsx"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 7: Create `apps/docs/postcss.config.mjs`**

```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
```

- [ ] **Step 8: Create `apps/docs/app/globals.css`**

```css
@import 'tailwindcss';
@import 'fumadocs-ui/css/neutral.css';
@import 'fumadocs-ui/css/preset.css';

@source '../node_modules/fumadocs-ui/dist/**/*.js';
```

- [ ] **Step 9: Create `apps/docs/lib/source.ts`**

```ts
import { docs } from '@/.source/server'
import { loader } from 'fumadocs-core/source'

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
})
```

- [ ] **Step 10: Create `apps/docs/app/layout.tsx`**

```tsx
import type { ReactNode } from 'react'
import { RootProvider } from 'fumadocs-ui/provider/next'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 11: Create `apps/docs/app/layout.config.tsx`**

```tsx
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: 'Guoba Utils',
  },
}
```

- [ ] **Step 12: Create `apps/docs/app/page.tsx`**

```tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-4xl font-bold">Guoba Utils</h1>
      <p className="mb-8 text-lg text-fd-muted-foreground">
        A personal TypeScript utility library.
      </p>
      <Link
        href="/docs"
        className="rounded-lg bg-fd-primary px-6 py-3 text-fd-primary-foreground"
      >
        Documentation
      </Link>
    </main>
  )
}
```

- [ ] **Step 13: Create `apps/docs/app/docs/layout.tsx`**

```tsx
import type { ReactNode } from 'react'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { baseOptions } from '@/app/layout.config'
import { source } from '@/lib/source'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source.pageTree} {...baseOptions}>
      {children}
    </DocsLayout>
  )
}
```

- [ ] **Step 14: Create `apps/docs/app/docs/[[...slug]]/page.tsx`**

```tsx
import defaultMdxComponents from 'fumadocs-ui/mdx'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'
import { source } from '@/lib/source'

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page)
    notFound()

  const MDX = page.data.body

  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents }} />
      </DocsBody>
    </DocsPage>
  )
}

export function generateStaticParams() {
  return source.generateParams()
}
```

- [ ] **Step 15: Create `apps/docs/mdx-components.tsx`**

```tsx
import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...components,
  }
}
```

- [ ] **Step 16: Commit**

```bash
git add apps/docs/
git commit -m "feat(docs): scaffold fumadocs documentation site"
```

---

### Task 12: Documentation Content Pages

**Files:**
- Create: `apps/docs/content/docs/index.mdx`
- Create: `apps/docs/content/docs/array.mdx`
- Create: `apps/docs/content/docs/object.mdx`
- Create: `apps/docs/content/docs/string.mdx`
- Create: `apps/docs/content/docs/guard.mdx`
- Create: `apps/docs/content/docs/types.mdx`
- Create: `apps/docs/content/docs/meta.json`

- [ ] **Step 1: Create `apps/docs/content/docs/meta.json`**

This file controls the sidebar navigation order:

```json
{
  "title": "API Reference",
  "pages": [
    "---Getting Started---",
    "index",
    "---API Reference---",
    "guard",
    "array",
    "string",
    "object",
    "types"
  ]
}
```

- [ ] **Step 2: Create `apps/docs/content/docs/index.mdx`**

```mdx
---
title: Getting Started
description: A personal TypeScript utility library.
---

## Installation

```bash
pnpm add @guoba/core
```

## Usage

```ts
import { toArray, isString, capitalize } from '@guoba/core'

toArray(1) // [1]
isString('hello') // true
capitalize('hello') // 'Hello'
```

## Features

- Pure ESM, tree-shakable
- Fully typed with TSDoc
- Zero dependencies
```

- [ ] **Step 3: Create `apps/docs/content/docs/guard.mdx`**

```mdx
---
title: Guard
description: Type guards and assertions for runtime type checking.
---

## Type Guards

<auto-type-table path="../../../packages/core/src/guard.ts" />
```

- [ ] **Step 4: Create `apps/docs/content/docs/array.mdx`**

```mdx
---
title: Array
description: Array utility functions.
---

## Array Utilities

<auto-type-table path="../../../packages/core/src/array.ts" />
```

- [ ] **Step 5: Create `apps/docs/content/docs/string.mdx`**

```mdx
---
title: String
description: String utility functions.
---

## String Utilities

<auto-type-table path="../../../packages/core/src/string.ts" />
```

- [ ] **Step 6: Create `apps/docs/content/docs/object.mdx`**

```mdx
---
title: Object
description: Object utility functions.
---

## Object Utilities

<auto-type-table path="../../../packages/core/src/object.ts" />
```

- [ ] **Step 7: Create `apps/docs/content/docs/types.mdx`**

```mdx
---
title: Types
description: Shared type utilities.
---

## Type Utilities

<auto-type-table path="../../../packages/core/src/types.ts" />
```

- [ ] **Step 8: Verify docs site starts**

Run: `pnpm docs:dev`
Expected: Dev server starts at http://localhost:3000. Visit http://localhost:3000/docs to see the documentation. Verify sidebar navigation and auto-generated type tables render. Stop the dev server with Ctrl+C.

- [ ] **Step 9: Commit**

```bash
git add apps/docs/content/
git commit -m "feat(docs): add documentation content pages with auto-generated API docs"
```

---

### Task 13: Final Verification & Cleanup

**Files:**
- No new files

- [ ] **Step 1: Run full test suite**

Run: `pnpm vitest run --config packages/core/vitest.config.ts`
Expected: All tests pass

- [ ] **Step 2: Run lint on entire project**

Run: `pnpm lint`
Expected: No errors. Fix any issues with `pnpm lint:fix`.

- [ ] **Step 3: Build core package**

Run: `pnpm --filter @guoba/core build`
Expected: Build succeeds

- [ ] **Step 4: Build docs site**

Run: `pnpm docs:build`
Expected: Build succeeds

- [ ] **Step 5: Commit any remaining changes**

If there are any fix-up changes from lint or build:

```bash
git add -A
git commit -m "chore: final cleanup and verification"
```
