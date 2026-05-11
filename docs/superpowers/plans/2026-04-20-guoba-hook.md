# @guoba-ai/hook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a new `@guoba-ai/hook` package with 6 foundational React Hooks, mirroring the structure and tooling of `@guoba-ai/utils`.

**Architecture:** Flat file structure under `packages/guoba-hook/` — one file per Hook in `src/`, one test file per Hook in `test/`. Built with tsdown (ESM-only), tested with vitest + jsdom + @testing-library/react. React 18+ as peerDependency, not bundled.

**Tech Stack:** TypeScript, React 18+, tsdown, vitest, @testing-library/react, jsdom

---

## File Map

| Action | Path                                           | Responsibility                                  |
| ------ | ---------------------------------------------- | ----------------------------------------------- |
| Create | `packages/guoba-hook/package.json`             | Package metadata, scripts, peer/dev deps        |
| Create | `packages/guoba-hook/tsconfig.json`            | TS config extending root, adds `jsx: react-jsx` |
| Create | `packages/guoba-hook/tsdown.config.ts`         | Build config: ESM, dts, external react          |
| Create | `packages/guoba-hook/vitest.config.ts`         | Test config: jsdom environment                  |
| Create | `packages/guoba-hook/CLAUDE.md`                | Package-level dev guidance                      |
| Create | `packages/guoba-hook/src/index.ts`             | Barrel re-export of all Hooks                   |
| Create | `packages/guoba-hook/src/useToggle.ts`         | useToggle Hook                                  |
| Create | `packages/guoba-hook/src/useDebounce.ts`       | useDebounce Hook                                |
| Create | `packages/guoba-hook/src/useThrottle.ts`       | useThrottle Hook                                |
| Create | `packages/guoba-hook/src/usePrevious.ts`       | usePrevious Hook                                |
| Create | `packages/guoba-hook/src/useMount.ts`          | useMount Hook                                   |
| Create | `packages/guoba-hook/src/useUnmount.ts`        | useUnmount Hook                                 |
| Create | `packages/guoba-hook/test/useToggle.test.ts`   | useToggle tests                                 |
| Create | `packages/guoba-hook/test/useDebounce.test.ts` | useDebounce tests                               |
| Create | `packages/guoba-hook/test/useThrottle.test.ts` | useThrottle tests                               |
| Create | `packages/guoba-hook/test/usePrevious.test.ts` | usePrevious tests                               |
| Create | `packages/guoba-hook/test/useMount.test.ts`    | useMount tests                                  |
| Create | `packages/guoba-hook/test/useUnmount.test.ts`  | useUnmount tests                                |

---

### Task 1: Package Scaffold

**Files:**

- Create: `packages/guoba-hook/package.json`
- Create: `packages/guoba-hook/tsconfig.json`
- Create: `packages/guoba-hook/tsdown.config.ts`
- Create: `packages/guoba-hook/vitest.config.ts`
- Create: `packages/guoba-hook/CLAUDE.md`
- Create: `packages/guoba-hook/src/index.ts`

- [ ] **Step 1: Create `packages/guoba-hook/package.json`**

```json
{
  "name": "@guoba-ai/hook",
  "type": "module",
  "version": "0.0.1",
  "homepage": "https://guoba-ai.vercel.app/docs",
  "repository": {
    "type": "git",
    "url": "https://github.com/rikisamurai/guoba-ai",
    "directory": "packages/guoba-hook"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.mts",
      "import": "./dist/index.mjs"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsdown",
    "dev": "tsdown --watch",
    "release": "pnpm build && pnpm publish",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "publishConfig": {
    "access": "public"
  },
  "peerDependencies": {
    "react": ">=18"
  },
  "devDependencies": {
    "@testing-library/react": "^16.3.0",
    "jsdom": "^26.1.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "tsdown": "^0.21.8",
    "typescript": "^6.0.2"
  }
}
```

- [ ] **Step 2: Create `packages/guoba-hook/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `packages/guoba-hook/tsdown.config.ts`**

```ts
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: 'esm',
  dts: true,
  clean: true,
  external: ['react'],
})
```

- [ ] **Step 4: Create `packages/guoba-hook/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'jsdom',
  },
})
```

- [ ] **Step 5: Create `packages/guoba-hook/CLAUDE.md`**

````markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with code in this directory.

## Overview

`@guoba-ai/hook` — React Hook 库。Pure ESM，React 18+ peerDependency，全量 TSDoc 注释。

## Commands

\```bash

# 构建（输出到 dist/）

pnpm build

# 监听模式构建

pnpm dev

# 运行测试

pnpm vitest run

# 监听模式测试

pnpm vitest
\```

从 monorepo 根目录运行：`pnpm --filter @guoba-ai/hook build` / `pnpm --filter @guoba-ai/hook test`

## Source Structure

\```
src/
├── index.ts # barrel export（从这里统一导出）
├── useToggle.ts # 布尔值切换
├── useDebounce.ts # 值防抖
├── useThrottle.ts # 值节流
├── usePrevious.ts # 上一次渲染的值
├── useMount.ts # 挂载回调
└── useUnmount.ts # 卸载回调
test/
├── useToggle.test.ts
├── useDebounce.test.ts
├── useThrottle.test.ts
├── usePrevious.test.ts
├── useMount.test.ts
└── useUnmount.test.ts
\```

## Conventions

- 每个 Hook 对应一个 `src/useXxx.ts` + `test/useXxx.test.ts`，新 Hook 遵循同样结构
- 所有导出函数必须有完整 TSDoc（`@param`、`@returns`、`@example`）
- 修改或新增 Hook 后，需在对应 test 文件中添加测试，遵循 TDD 流程
- 新增 Hook 后记得在 `src/index.ts` 里 re-export
- 测试使用 `@testing-library/react` 的 `renderHook` + `act`
````

- [ ] **Step 6: Create empty barrel export `packages/guoba-hook/src/index.ts`**

```ts
// Hook exports will be added as each Hook is implemented
```

- [ ] **Step 7: Install dependencies**

Run: `pnpm install`
Expected: dependencies resolve, `node_modules` populated in `packages/guoba-hook/`

- [ ] **Step 8: Verify build works with empty barrel**

Run: `pnpm --filter @guoba-ai/hook build`
Expected: Build succeeds, `dist/index.mjs` and `dist/index.d.mts` generated

- [ ] **Step 9: Commit**

```bash
git add packages/guoba-hook/package.json packages/guoba-hook/tsconfig.json packages/guoba-hook/tsdown.config.ts packages/guoba-hook/vitest.config.ts packages/guoba-hook/CLAUDE.md packages/guoba-hook/src/index.ts
git commit -m "feat(hook): scaffold @guoba-ai/hook package"
```

---

### Task 2: useToggle

**Files:**

- Create: `packages/guoba-hook/test/useToggle.test.ts`
- Create: `packages/guoba-hook/src/useToggle.ts`
- Modify: `packages/guoba-hook/src/index.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/guoba-hook/test/useToggle.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useToggle } from '../src'

describe('useToggle', () => {
  it('should default to false', () => {
    const { result } = renderHook(() => useToggle())
    expect(result.current[0]).toBe(false)
  })

  it('should accept an initial value', () => {
    const { result } = renderHook(() => useToggle(true))
    expect(result.current[0]).toBe(true)
  })

  it('should toggle the value', () => {
    const { result } = renderHook(() => useToggle())
    act(() => result.current[1]())
    expect(result.current[0]).toBe(true)
    act(() => result.current[1]())
    expect(result.current[0]).toBe(false)
  })

  it('should set a specific value', () => {
    const { result } = renderHook(() => useToggle())
    act(() => result.current[1](true))
    expect(result.current[0]).toBe(true)
    act(() => result.current[1](true))
    expect(result.current[0]).toBe(true)
    act(() => result.current[1](false))
    expect(result.current[0]).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @guoba-ai/hook test`
Expected: FAIL — `useToggle` is not exported from `../src`

- [ ] **Step 3: Write implementation**

Create `packages/guoba-hook/src/useToggle.ts`:

````ts
import { useCallback, useState } from 'react'

/**
 * Toggle a boolean value.
 *
 * @param initialValue - The initial boolean value (defaults to `false`)
 * @returns A tuple of `[value, toggle]` where `toggle` flips the value or sets it to a specific boolean
 * @example
 * ```ts
 * const [isOpen, toggleOpen] = useToggle()
 * toggleOpen()     // true
 * toggleOpen()     // false
 * toggleOpen(true) // true
 * ```
 */
export function useToggle(initialValue = false): [boolean, (next?: boolean) => void] {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback((next?: boolean) => {
    setValue(prev => (next === undefined ? !prev : next))
  }, [])
  return [value, toggle]
}
````

- [ ] **Step 4: Add export to barrel**

Update `packages/guoba-hook/src/index.ts`:

```ts
export { useToggle } from './useToggle'
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @guoba-ai/hook test`
Expected: All 4 tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/guoba-hook/src/useToggle.ts packages/guoba-hook/test/useToggle.test.ts packages/guoba-hook/src/index.ts
git commit -m "feat(hook): add useToggle"
```

---

### Task 3: useDebounce

**Files:**

- Create: `packages/guoba-hook/test/useDebounce.test.ts`
- Create: `packages/guoba-hook/src/useDebounce.ts`
- Modify: `packages/guoba-hook/src/index.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/guoba-hook/test/useDebounce.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useDebounce } from '../src'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500))
    expect(result.current).toBe('hello')
  })

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'b' })
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toBe('b')
  })

  it('should only keep the last value on rapid updates', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(100))
    rerender({ value: 'c' })
    act(() => vi.advanceTimersByTime(100))
    rerender({ value: 'd' })
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('d')
  })

  it('should use 500ms as the default delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(499))
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('b')
  })

  it('should cleanup timer on unmount', () => {
    const { result, rerender, unmount } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'b' })
    unmount()
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toBe('a')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @guoba-ai/hook test`
Expected: FAIL — `useDebounce` is not exported from `../src`

- [ ] **Step 3: Write implementation**

Create `packages/guoba-hook/src/useDebounce.ts`:

````ts
import { useEffect, useState } from 'react'

/**
 * Debounce a value. The returned value only updates after the specified delay
 * has passed without any new changes.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (defaults to `500`)
 * @returns The debounced value
 * @example
 * ```ts
 * const [text, setText] = useState('')
 * const debouncedText = useDebounce(text, 300)
 * // debouncedText updates 300ms after the last setText call
 * ```
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
````

- [ ] **Step 4: Add export to barrel**

Append to `packages/guoba-hook/src/index.ts`:

```ts
export { useToggle } from './useToggle'
export { useDebounce } from './useDebounce'
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @guoba-ai/hook test`
Expected: All tests PASS (useToggle + useDebounce)

- [ ] **Step 6: Commit**

```bash
git add packages/guoba-hook/src/useDebounce.ts packages/guoba-hook/test/useDebounce.test.ts packages/guoba-hook/src/index.ts
git commit -m "feat(hook): add useDebounce"
```

---

### Task 4: useThrottle

**Files:**

- Create: `packages/guoba-hook/test/useThrottle.test.ts`
- Create: `packages/guoba-hook/src/useThrottle.ts`
- Modify: `packages/guoba-hook/src/index.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/guoba-hook/test/useThrottle.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useThrottle } from '../src'

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useThrottle('hello', 500))
    expect(result.current).toBe('hello')
  })

  it('should not update within the throttle interval', () => {
    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 500), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'b' })
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('a')
  })

  it('should update after the throttle interval', () => {
    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 500), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toBe('b')
  })

  it('should use 500ms as the default interval', () => {
    const { result, rerender } = renderHook(({ value }) => useThrottle(value), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(499))
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('b')
  })

  it('should take the latest value after interval', () => {
    const { result, rerender } = renderHook(({ value }) => useThrottle(value, 300), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(100))
    rerender({ value: 'c' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('c')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @guoba-ai/hook test`
Expected: FAIL — `useThrottle` is not exported from `../src`

- [ ] **Step 3: Write implementation**

Create `packages/guoba-hook/src/useThrottle.ts`:

````ts
import { useEffect, useRef, useState } from 'react'

/**
 * Throttle a value. The returned value updates at most once per interval.
 *
 * @param value - The value to throttle
 * @param interval - Minimum time between updates in milliseconds (defaults to `500`)
 * @returns The throttled value
 * @example
 * ```ts
 * const [position, setPosition] = useState({ x: 0, y: 0 })
 * const throttledPosition = useThrottle(position, 100)
 * // throttledPosition updates at most once every 100ms
 * ```
 */
export function useThrottle<T>(value: T, interval = 500): T {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastUpdated = useRef(Date.now())

  useEffect(() => {
    const now = Date.now()
    const elapsed = now - lastUpdated.current

    if (elapsed >= interval) {
      lastUpdated.current = now
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now()
        setThrottledValue(value)
      }, interval - elapsed)
      return () => clearTimeout(timer)
    }
  }, [value, interval])

  return throttledValue
}
````

- [ ] **Step 4: Add export to barrel**

Update `packages/guoba-hook/src/index.ts`:

```ts
export { useToggle } from './useToggle'
export { useDebounce } from './useDebounce'
export { useThrottle } from './useThrottle'
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @guoba-ai/hook test`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/guoba-hook/src/useThrottle.ts packages/guoba-hook/test/useThrottle.test.ts packages/guoba-hook/src/index.ts
git commit -m "feat(hook): add useThrottle"
```

---

### Task 5: usePrevious

**Files:**

- Create: `packages/guoba-hook/test/usePrevious.test.ts`
- Create: `packages/guoba-hook/src/usePrevious.ts`
- Modify: `packages/guoba-hook/src/index.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/guoba-hook/test/usePrevious.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePrevious } from '../src'

describe('usePrevious', () => {
  it('should return undefined on initial render', () => {
    const { result } = renderHook(() => usePrevious('hello'))
    expect(result.current).toBeUndefined()
  })

  it('should return the previous value after update', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'a' },
    })
    expect(result.current).toBeUndefined()
    rerender({ value: 'b' })
    expect(result.current).toBe('a')
    rerender({ value: 'c' })
    expect(result.current).toBe('b')
  })

  it('should work with numbers', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 },
    })
    rerender({ value: 2 })
    expect(result.current).toBe(1)
    rerender({ value: 3 })
    expect(result.current).toBe(2)
  })

  it('should work with objects', () => {
    const obj1 = { name: 'Alice' }
    const obj2 = { name: 'Bob' }
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: obj1 },
    })
    rerender({ value: obj2 })
    expect(result.current).toBe(obj1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @guoba-ai/hook test`
Expected: FAIL — `usePrevious` is not exported from `../src`

- [ ] **Step 3: Write implementation**

Create `packages/guoba-hook/src/usePrevious.ts`:

````ts
import { useEffect, useRef } from 'react'

/**
 * Track the previous value of a variable across renders.
 *
 * @param value - The current value to track
 * @returns The value from the previous render, or `undefined` on the first render
 * @example
 * ```ts
 * const [count, setCount] = useState(0)
 * const prevCount = usePrevious(count)
 * // After setCount(1): prevCount === 0
 * // After setCount(2): prevCount === 1
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}
````

- [ ] **Step 4: Add export to barrel**

Update `packages/guoba-hook/src/index.ts`:

```ts
export { useToggle } from './useToggle'
export { useDebounce } from './useDebounce'
export { useThrottle } from './useThrottle'
export { usePrevious } from './usePrevious'
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @guoba-ai/hook test`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/guoba-hook/src/usePrevious.ts packages/guoba-hook/test/usePrevious.test.ts packages/guoba-hook/src/index.ts
git commit -m "feat(hook): add usePrevious"
```

---

### Task 6: useMount

**Files:**

- Create: `packages/guoba-hook/test/useMount.test.ts`
- Create: `packages/guoba-hook/src/useMount.ts`
- Modify: `packages/guoba-hook/src/index.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/guoba-hook/test/useMount.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMount } from '../src'

describe('useMount', () => {
  it('should call the callback on mount', () => {
    const fn = vi.fn()
    renderHook(() => useMount(fn))
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should not call the callback on re-render', () => {
    const fn = vi.fn()
    const { rerender } = renderHook(() => useMount(fn))
    rerender()
    rerender()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should not call the callback after unmount', () => {
    const fn = vi.fn()
    const { unmount } = renderHook(() => useMount(fn))
    unmount()
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @guoba-ai/hook test`
Expected: FAIL — `useMount` is not exported from `../src`

- [ ] **Step 3: Write implementation**

Create `packages/guoba-hook/src/useMount.ts`:

````ts
import { useEffect } from 'react'

/**
 * Run a callback once when the component mounts.
 *
 * @param fn - The callback to run on mount
 * @example
 * ```ts
 * useMount(() => {
 *   console.log('Component mounted!')
 * })
 * ```
 */
export function useMount(fn: () => void): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fn, [])
}
````

- [ ] **Step 4: Add export to barrel**

Update `packages/guoba-hook/src/index.ts`:

```ts
export { useToggle } from './useToggle'
export { useDebounce } from './useDebounce'
export { useThrottle } from './useThrottle'
export { usePrevious } from './usePrevious'
export { useMount } from './useMount'
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @guoba-ai/hook test`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/guoba-hook/src/useMount.ts packages/guoba-hook/test/useMount.test.ts packages/guoba-hook/src/index.ts
git commit -m "feat(hook): add useMount"
```

---

### Task 7: useUnmount

**Files:**

- Create: `packages/guoba-hook/test/useUnmount.test.ts`
- Create: `packages/guoba-hook/src/useUnmount.ts`
- Modify: `packages/guoba-hook/src/index.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/guoba-hook/test/useUnmount.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUnmount } from '../src'

describe('useUnmount', () => {
  it('should not call the callback on mount', () => {
    const fn = vi.fn()
    renderHook(() => useUnmount(fn))
    expect(fn).not.toHaveBeenCalled()
  })

  it('should call the callback on unmount', () => {
    const fn = vi.fn()
    const { unmount } = renderHook(() => useUnmount(fn))
    unmount()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should not call the callback on re-render', () => {
    const fn = vi.fn()
    const { rerender } = renderHook(() => useUnmount(fn))
    rerender()
    rerender()
    expect(fn).not.toHaveBeenCalled()
  })

  it('should use the latest callback reference', () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    const { rerender, unmount } = renderHook(({ fn }) => useUnmount(fn), {
      initialProps: { fn: fn1 },
    })
    rerender({ fn: fn2 })
    unmount()
    expect(fn1).not.toHaveBeenCalled()
    expect(fn2).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @guoba-ai/hook test`
Expected: FAIL — `useUnmount` is not exported from `../src`

- [ ] **Step 3: Write implementation**

Create `packages/guoba-hook/src/useUnmount.ts`:

````ts
import { useEffect, useRef } from 'react'

/**
 * Run a callback when the component unmounts. The latest callback reference
 * is always used, avoiding stale closure issues.
 *
 * @param fn - The callback to run on unmount
 * @example
 * ```ts
 * useUnmount(() => {
 *   console.log('Component unmounted!')
 * })
 * ```
 */
export function useUnmount(fn: () => void): void {
  const fnRef = useRef(fn)
  fnRef.current = fn

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => fnRef.current(), [])
}
````

- [ ] **Step 4: Add export to barrel**

Update `packages/guoba-hook/src/index.ts`:

```ts
export { useToggle } from './useToggle'
export { useDebounce } from './useDebounce'
export { useThrottle } from './useThrottle'
export { usePrevious } from './usePrevious'
export { useMount } from './useMount'
export { useUnmount } from './useUnmount'
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @guoba-ai/hook test`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/guoba-hook/src/useUnmount.ts packages/guoba-hook/test/useUnmount.test.ts packages/guoba-hook/src/index.ts
git commit -m "feat(hook): add useUnmount"
```

---

### Task 8: Final Build & Lint Verification

**Files:**

- No new files

- [ ] **Step 1: Run full build**

Run: `pnpm --filter @guoba-ai/hook build`
Expected: Build succeeds. `dist/` contains `index.mjs` and `index.d.mts` with all 6 Hook exports.

- [ ] **Step 2: Run all tests**

Run: `pnpm --filter @guoba-ai/hook test`
Expected: All tests PASS (6 test files, all green)

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: No errors from `packages/guoba-hook/`

- [ ] **Step 4: Fix any lint errors if present**

If lint reports issues, fix them and re-run `pnpm lint`.

- [ ] **Step 5: Run monorepo-wide tests to ensure no regressions**

Run: `pnpm test -- --run`
Expected: All existing tests still pass, new hook tests pass

- [ ] **Step 6: Commit any lint fixes**

If lint fixes were needed:

```bash
git add packages/guoba-hook/
git commit -m "fix(hook): resolve lint errors"
```
