# CLAUDE.md

This file provides guidance to Claude Code when working with code in this directory.

## Overview

`@guoba-ai/utils` — 个人 TypeScript 工具函数库。Pure ESM，zero dependencies，全量 TSDoc 注释（供 `apps/docs` 生成 API 文档用）。

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

从 monorepo 根目录运行：`pnpm --filter @guoba-ai/utils build` / `pnpm --filter @guoba-ai/utils test`

## Source Structure

```
src/
├── index.ts      # barrel export（从这里统一导出）
├── array.ts      # 数组工具
├── guard.ts      # 类型守卫
├── object.ts     # 对象工具
├── string.ts     # 字符串工具
└── types.ts      # 共享类型（Arrayable、Nullable 等）
test/
├── array.test.ts
├── guard.test.ts
├── object.test.ts
└── string.test.ts
```

## Verification

每次改动后必须通过以下验证，全部通过才算完成：

```bash
pnpm test      # 所有测试必须通过
pnpm build           # 构建必须成功
```

## Conventions

- 每个模块对应一个 `src/*.ts` + `test/*.test.ts`，新功能遵循同样结构
- 所有导出函数必须有完整 TSDoc（`@param`、`@returns`、`@example`），`apps/docs` 的 API 文档由此自动生成
- 修改或新增函数后，需在对应 test 文件中添加测试，遵循 TDD 流程
- 新增函数后记得在 `src/index.ts` 里 re-export
