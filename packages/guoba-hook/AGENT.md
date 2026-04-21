# CLAUDE.md

This file provides guidance to Claude Code when working with code in this directory.

## Overview

`@guoba-ai/hook` — React Hook 库。Pure ESM，React 18+ peerDependency，全量 TSDoc 注释。

## Commands

```bash
# 构建（输出到 dist/）
pnpm build

# 监听模式构建
pnpm dev

# 运行测试
pnpm vitest run

# 监听模式测试
pnpm vitest
```

从 monorepo 根目录运行：`pnpm --filter @guoba-ai/hook build` / `pnpm --filter @guoba-ai/hook test`

## Source Structure

```
src/
├── index.ts          # barrel export（从这里统一导出）
├── useToggle.ts      # 布尔值切换
├── useDebounce.ts    # 值防抖
├── useThrottle.ts    # 值节流
├── usePrevious.ts    # 上一次渲染的值
├── useMount.ts       # 挂载回调
└── useUnmount.ts     # 卸载回调
test/
├── useToggle.test.ts
├── useDebounce.test.ts
├── useThrottle.test.ts
├── usePrevious.test.ts
├── useMount.test.ts
└── useUnmount.test.ts
```

## Verification

每次改动后必须通过以下验证，全部通过才算完成：

```bash
pnpm test      # 所有测试必须通过
pnpm build           # 构建必须成功
```

## Conventions

- 每个 Hook 对应一个 `src/useXxx.ts` + `test/useXxx.test.ts`，新 Hook 遵循同样结构
- 所有导出函数必须有完整 TSDoc（`@param`、`@returns`、`@example`）
- 修改或新增 Hook 后，需在对应 test 文件中添加测试，遵循 TDD 流程
- 新增 Hook 后记得在 `src/index.ts` 里 re-export
- 测试使用 `@testing-library/react` 的 `renderHook` + `act`
