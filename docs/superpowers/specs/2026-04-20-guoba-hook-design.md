# @guoba-ai/hook — Design Spec

**Date:** 2026-04-20
**Status:** Approved

## Overview

新增 `@guoba-ai/hook` 子包，专门用于 React Hook。镜像 `@guoba-ai/utils` 的项目结构和工具链，保持 monorepo 内一致的开发体验。

## Scope

- 通用状态/生命周期 Hook（不含 DOM/浏览器 Hook）
- SSR 安全（支持 Next.js 等服务端渲染场景）
- React 18+ 作为 peerDependency

## Directory Structure

```
packages/guoba-hook/
├── src/
│   ├── index.ts           # barrel export 所有 Hook
│   ├── useToggle.ts
│   ├── useDebounce.ts
│   ├── useThrottle.ts
│   ├── usePrevious.ts
│   ├── useMount.ts
│   └── useUnmount.ts
├── test/
│   ├── useToggle.test.ts
│   ├── useDebounce.test.ts
│   ├── useThrottle.test.ts
│   ├── usePrevious.test.ts
│   ├── useMount.test.ts
│   └── useUnmount.test.ts
├── package.json
├── tsconfig.json
├── tsdown.config.ts
├── vitest.config.ts
└── CLAUDE.md
```

## Package Configuration

### package.json

- `name`: `@guoba-ai/hook`
- `type`: `module`
- `version`: `0.0.1`
- `exports`: `{ ".": { "types": "./dist/index.d.mts", "import": "./dist/index.mjs" } }`
- `files`: `["dist"]`
- `peerDependencies`: `{ "react": ">=18" }`
- `devDependencies`: `tsdown`, `typescript`, `@testing-library/react`, `react`, `react-dom`, `jsdom`
- Scripts mirror `@guoba-ai/utils`: `build`, `dev`, `release`, `test`, `test:watch`

### tsdown.config.ts

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

### tsconfig.json

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

### vitest.config.ts

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'jsdom',
  },
})
```

## Hook API Specifications

### 1. useToggle

```ts
function useToggle(initialValue?: boolean): [boolean, (next?: boolean) => void]
```

- 切换布尔值，可传入指定值强制设置
- SSR 安全：纯 useState，无副作用

### 2. useDebounce

```ts
function useDebounce<T>(value: T, delay?: number): T
```

- 返回延迟后的值（默认 delay 500ms）
- 内部用 `useEffect` + `setTimeout`，组件卸载时清理 timer

### 3. useThrottle

```ts
function useThrottle<T>(value: T, interval?: number): T
```

- 返回节流后的值（默认 interval 500ms）
- 在 interval 内最多更新一次

### 4. usePrevious

```ts
function usePrevious<T>(value: T): T | undefined
```

- 返回上一次渲染的值
- 内部用 `useRef` + `useEffect`

### 5. useMount

```ts
function useMount(fn: () => void): void
```

- 组件挂载时执行回调（等价于 `useEffect(fn, [])`）
- 语义化封装

### 6. useUnmount

```ts
function useUnmount(fn: () => void): void
```

- 组件卸载时执行回调
- 内部用 `useRef` 保持 fn 最新引用，避免闭包陷阱

## Conventions

- 每个 Hook 一个 `src/useXxx.ts` + `test/useXxx.test.ts`
- 所有导出函数必须有完整 TSDoc（`@param`、`@returns`、`@example`）
- 新增 Hook 后在 `src/index.ts` 里 re-export
- 测试文件使用 `.ts` 扩展名（非 `.tsx`），通过 `renderHook` 测试

## Testing Strategy

**环境：** vitest + `@testing-library/react` + jsdom

**测试覆盖：**

| Hook | 关键测试点 |
|------|-----------|
| useToggle | 初始值（默认 false）、toggle 切换、传入指定值 |
| useDebounce | 延迟更新、快速连续更新只保留最后一个、卸载清理 timer |
| useThrottle | 节流间隔内不更新、间隔结束后更新 |
| usePrevious | 初始 undefined、值变化后返回前一个值 |
| useMount | 挂载时调用一次、重渲染不重复调用 |
| useUnmount | 卸载时调用、回调引用保持最新（闭包安全） |

**时间相关测试：** useDebounce 和 useThrottle 使用 `vi.useFakeTimers()` 控制时间。

## Monorepo Integration

- 目录位于 `packages/guoba-hook/`，由 `pnpm-workspace.yaml` 的 `packages/*` glob 自动识别
- ESLint 配置无需修改（已覆盖 `packages/*`）
- 根目录 `pnpm build` / `pnpm test` 自动包含此包
