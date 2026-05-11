# guoba-ai 仓库优化清单

## Context

`guoba-ai` 是一个 pnpm monorepo，包含两个 ESM-only 包（`@guoba-ai/utils`、`@guoba-ai/hook`）和一个 Next.js + fumadocs 文档站。本次 review 通过：

- 两个 Explore subagent 并行扫描了 packages 源码/测试/构建配置 与 docs 站/根级配置
- agent-browser 实地查看了 https://guoba-ai.vercel.app 的落地页、`/docs`、`/docs/utils`、`/docs/utils/array/chunk`、`/docs/hooks`

整理出按优先级排序的可执行优化点。**本文件仅是清单，不是直接执行单**。可挑选 P0/P1/P2 中具体条目下次开会话执行。

---

## P0 — 正确性 / 安全 / 阻塞性 Bug

### P0-1. `useThrottle` 未取消 trailing timer ✅

- 文件：`packages/guoba-hook/src/useThrottle.ts:20-35`
- 问题：当 `elapsed < interval` 走 `setTimeout` 分支后，effect 没有返回 cleanup，pending 的 timer 在下一次 prop 变化时不会被取消，会导致竞态触发
- 改：始终用 `useRef` 保存当前 timer id，effect 内 `return () => clearTimeout(...)`；同时补充 trailing-call 测试（`packages/guoba-hook/test/useThrottle.test.ts`）

### P0-2. 原型污染防御 ✅

- 文件：`packages/guoba-utils/src/object.ts:311` (`set`)、`object.ts:366` (`construct`)
- 问题：`set(obj, '__proto__.polluted', 1)` 会写入 `Object.prototype`
- 改：在路径切分后白名单校验，遇到 `__proto__` / `constructor` / `prototype` 直接跳过或抛错；补 `test/object.test.ts` 反污染用例

### P0-3. `test:type` 脚本语义损坏 ✅

- 文件：`packages/guoba-utils/package.json:25`
- 问题：用了不存在的 `--ignoreConfig` 参数（应为 `tsc --noEmit` 不带配置 flag）；与 `packages/guoba-hook/package.json:25` 的写法不一致，导致 utils 包的类型检查实际未运行
- 改：与 hook 包对齐为 `tsc --noEmit`

### P0-4. `useSyncState` JSDoc 与导入风格不达标

- 文件：`packages/guoba-hook/src/useSyncState.ts`
- 问题：JSDoc 单行，无 `@param`/`@returns`/fenced `@example`；返回类型引用 `React.Dispatch` 但只 import 了 `useState`，根 `tsconfig.json:15` 启用了 `verbatimModuleSyntax`，可能在严格类型导入下编译失败
- 改：补全 JSDoc（与其他 hook 保持一致风格）；显式 `import type { Dispatch, SetStateAction } from 'react'`

---

## P1 — 高 ROI 工程化

### P1-1. 完整的 GitHub Actions CI ✅

- 现状：`.github/` 目录完全缺失，无任何 PR 检查
- 改：新建 `.github/workflows/ci.yml`，跑 `pnpm install --frozen-lockfile` + `pnpm lint` + `pnpm test --run` + 各包 `tsc --noEmit` + `pnpm build`；matrix Node 24
- 同时新增 `.github/dependabot.yml`（Next 16/React 19/TS 6/ESLint 10 都很新，需要持续盯版本）

### P1-2. 引入 Changesets（本地发版）✅

- 已接入 `@changesets/cli`，`.changeset/config.json` 配置 `access: public` / `baseBranch: main` / `ignore: ["docs"]`
- root `package.json` 提供 `changeset` / `version` / `release` 三个脚本
- **当前选择本地手动发版**（`pnpm version` → commit → `pnpm release` → `git push --follow-tags`），未启用 GitHub Action
- 后续若想切回自动发布：恢复两包 `publishConfig.provenance: true` + 新增 `.github/workflows/release.yml`（用 `changesets/action@v1`）+ 加 `NPM_TOKEN` secret

### P1-3. 包元信息缺失 ✅

- 文件：`packages/guoba-utils/package.json`、`packages/guoba-hook/package.json`
- 全部字段已补齐：`description`、`keywords`、`author`、`bugs`、`sideEffects: false`、`./package.json` 子路径 export

### P1-4. 根级缺失基础脚本

- 文件：`package.json:9-17`
- 缺：`type-check`（聚合调用各包 `tsc --noEmit`）、`format`、`clean`、`test:coverage`
- 改：在根 `package.json` 添加这四个脚本（`type-check` 用 `pnpm -r --parallel exec tsc --noEmit`）

### P1-5. 消除 GitHub URL 硬编码重复

- 文件：`apps/docs/app/docs/[[...slug]]/page.tsx:30`、`apps/docs/typedoc-utils.json:27`、`apps/docs/typedoc-hooks.json:27`、`apps/docs/app/layout.config.tsx:24`
- 改：在 `apps/docs/lib/site-config.ts`（新建）集中导出 `GITHUB_REPO = 'rikisamurai/guoba-ai'`；TypeDoc 的 `gitRemote` 字段无法引用变量，可在 `typedoc-postprocess.mjs` 里读 root `package.json.repository.url`

### P1-6. `deepMerge` 类型安全 & 边界

- 文件：`packages/guoba-utils/src/object.ts:145-163`
- 问题：`structuredClone(target)` 遇到函数/类实例直接抛；内部 `(result as any)[key]` 失去类型；`mapValues` 同样有 `as any`（`object.ts:222`）
- 改：抽取 `assignTyped<T,K>(o, k, v)` 工具替代 `as any`；`structuredClone` 前先检测可克隆性，否则降级用浅复制 + 显式抛出可读错误

---

## P2 — 测试覆盖增强

### P2-1. 补 `useThrottle` trailing-call 与 delay 变化测试（部分完成）

- 文件：`packages/guoba-hook/test/useThrottle.test.ts`
- ✅ 已补：cleanup timer on unmount（第 75 行）
- 仍缺：单次 prop 变化后是否触发尾调用；mid-flight 改 `interval` 是否重新计时

### P2-2. 补 `useDebounce` delay 中途变化测试（部分完成）

- 文件：`packages/guoba-hook/test/useDebounce.test.ts`
- ✅ 已补：cleanup timer on unmount（第 55 行）
- 仍缺：delay 中途变化用例

### P2-3. 补 `useMount`/`useUnmount` 的 cleanup 返回值测试

- 文件：`packages/guoba-hook/test/{useMount,useUnmount}.test.ts`
- 还应补一条 React 18 StrictMode 双调用的注释或测试

### P2-4. utils 边界用例（部分完成）

- `deepMerge`：嵌套数组对象、`null` override、不可克隆值
- `template`：转义 `{name}` 字面量、`data` 缺失、value 非 string
- ✅ `set`/`construct`：原型污染用例已补（`object.test.ts:309,358`）
- `crush`：嵌套数组对象作为叶子的边界

---

## P2 — 文档站 UI / SEO / 性能

### P2-5. 落地页缺乏内容感（agent-browser 验证）

- 截图观察：`/`（landing）只有 logo + Get Started 按钮 + 6 个 Feature 卡，首屏大量空白；硬编码 `bg-[#09090b]` 不响应主题切换
- 改建议（优先级低）：
  - 首屏加一个最小可执行 demo（代码块 + 输出对比），或加 npm install 一键复制的代码片段
  - 首屏增加 npm version badge / GitHub stars
  - 让 landing 页接入 fumadocs 主题，提供浅色主题
  - 添加 footer（links、license、版本号）

### P2-6. metadata / SEO 全面缺失

- 文件：`apps/docs/app/layout.tsx:6-8`
- 现状：只有 `metadataBase`，缺 `title` template、`description`、`openGraph`、`twitter`、`icons`
- 改：补齐 `metadata` 对象；新建 `apps/docs/app/sitemap.ts` 与 `apps/docs/app/robots.ts`（fumadocs 提供 helper）

### P2-7. TypeDoc 流程优化

- 文件：`apps/docs/package.json:6-9`、`apps/docs/typedoc-postprocess.mjs`
- 问题：`docs:dev` 每次都全量跑 typedoc，慢
- 改：包装一层脚本，比对 `packages/*/src/**` 与 `content/docs/{utils,hooks}/` 的 mtime，源码未变则跳过；CI 里加一步「diff 检查」防止生成内容与源码不一致被合入

### P2-8. `mdx-components.tsx` 是空 pass-through

- 改：注入 fumadocs 的 Callout/Tabs/CodeGroup 组件，并在 Getting Started 页面用上去，提升观感

---

## P2 — 仓库治理

### P2-9. 缺 LICENSE / README / CONTRIBUTING / PR 模板（部分完成）

- ✅ 已补：`LICENSE`、`README.md`
- 仍缺：`CONTRIBUTING.md`、`.github/PULL_REQUEST_TEMPLATE.md`、`.github/ISSUE_TEMPLATE/{bug,feature}.yml`

### P2-10. `.idea/` 是否真未入库需确认

- 文件：`.gitignore:9` 已忽略，但需 `git ls-files .idea` 验证历史是否有遗留追踪

---

## 关键文件速查表

| 模块          | 路径                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| Hook 源码     | `packages/guoba-hook/src/{useDebounce,useThrottle,useToggle,useMount,useUnmount,usePrevious,useSyncState}.ts`    |
| Utils 源码    | `packages/guoba-utils/src/{array,object,string,guard,types,index}.ts`                                            |
| 包 build 配置 | `packages/*/tsdown.config.ts`、`packages/*/vitest.config.ts`                                                     |
| 包 manifest   | `packages/guoba-utils/package.json`、`packages/guoba-hook/package.json`                                          |
| 文档站 layout | `apps/docs/app/layout.tsx`、`apps/docs/app/layout.config.tsx`                                                    |
| 文档站构建    | `apps/docs/typedoc-{utils,hooks}.json`、`apps/docs/typedoc-postprocess.mjs`、`apps/docs/typedoc-frontmatter.mjs` |
| 根配置        | `package.json`、`pnpm-workspace.yaml`、`tsconfig.json`、`eslint.config.mjs`                                      |

---

## 验证（挑选条目执行后）

每完成一组改动，按以下顺序验证：

1. `pnpm install`（如改动了 manifest）
2. `pnpm lint && pnpm -r exec tsc --noEmit`
3. `pnpm test -- --run`（root vitest 跑全部 package 测试）
4. `pnpm build`（确认 tsdown 产物正常）
5. `pnpm docs:build`（确认 typedoc 生成 + Next 构建无报错）
6. UI 改动：`pnpm docs:dev` 后用 agent-browser 打开 `http://localhost:3000`、`/docs`、`/docs/utils/array/chunk`、`/docs/hooks/useSyncState`，截图对比改动前后
7. CI/CD 改动：开 draft PR 触发 workflow 跑通后再合入

---

## 不在本次 review 范围

- 跨语言/跨平台分发（CJS、deno、bun-specific）— 当前 ESM-only 是明确决策
- 性能 benchmark（仅在 `flattenDeep`/`deepMerge`/`crush` 等递归热点处建议加 vitest bench，未单独立项）
- i18n / 多语言文档站（fumadocs 支持，但未观察到需求）
