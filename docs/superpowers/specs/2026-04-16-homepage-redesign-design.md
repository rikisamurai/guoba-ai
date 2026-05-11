# Homepage Redesign — AI 科技感

**Date:** 2026-04-16
**Status:** Approved

## Goal

重新设计 guoba-ai 官网首页，从当前的极简占位页面升级为具有 AI 科技感的品牌首页，体现"AI 工具生态平台"的定位。

## Design Decisions

| 决策      | 选择                                           | 理由                                    |
| --------- | ---------------------------------------------- | --------------------------------------- |
| 定位      | AI 产品/平台                                   | 未来扩展为更大的 AI 工具生态            |
| 视觉风格  | 霓虹赛博                                       | 深色底 + 紫蓝霓虹光效，大胆前卫有冲击力 |
| 页面板块  | Hero + 特性展示                                | 精简聚焦，不做过多内容                  |
| Hero 文案 | 仅标题 `Guoba AI`，暂无 slogan                 | 用户后续再补                            |
| Hero 背景 | CSS 光晕 + Canvas 粒子动画                     | 动态效果提升科技感，不引入第三方库      |
| 特性卡片  | 抽象亮点（非按模块）                           | 更面向用户价值                          |
| 实现方式  | 纯 CSS/Tailwind + 一个 Canvas client component | 零额外依赖                              |

## Page Structure

### 1. Hero Section

- **背景层**：
  - Canvas 粒子系统（~60 个粒子 + 连线），紫蓝双色
  - 3 个浮动光晕（purple / blue / cyan），CSS `filter: blur` + 缓慢漂浮动画
  - 底部霓虹分割线（紫蓝渐变）
- **内容层**：
  - Logo icon（`/guoba-icon.png`），圆角 + 紫色辉光 box-shadow
  - 主标题 `Guoba AI`，渐变文字（白 → 紫 → 蓝）
  - Slogan 位置预留（当前不显示）
  - CTA 按钮：`Get Started` → 链接到 `/docs`
    - 实心紫色渐变背景 + 辉光 shadow
- **不包含** GitHub 按钮

### 2. Features Section

- 区域标题："为什么选择 Guoba AI" + 副标题 "精心设计的工具，为现代开发而生"
- 3×2 网格布局，6 张特性卡片：

| 特性          | 图标 | 色调   | 描述                                             |
| ------------- | ---- | ------ | ------------------------------------------------ |
| 类型安全      | 🛡️   | purple | 完整的 TypeScript 类型推导，IDE 智能提示开箱即用 |
| 极致轻量      | ⚡   | blue   | 零外部依赖，打包体积极小                         |
| Tree-shakable | 🌲   | cyan   | ESM-only 设计，只打包真正需要的                  |
| 模块化设计    | 🧩   | pink   | 按领域清晰分组，按需引入                         |
| 全面测试      | ✅   | green  | 每个函数都有完整的单元测试覆盖                   |
| 文档驱动      | 📖   | orange | 从源码 JSDoc 自动生成，示例与实现同步            |

- 卡片样式：
  - 深色半透明背景 + 微弱紫色边框
  - 图标带对应颜色辉光
  - Hover：紫色光晕 + 上浮 + 边框加亮 + box-shadow

## File Structure

```
apps/docs/
├── app/
│   ├── page.tsx              — 改写，组合 Hero + Features
│   └── _components/
│       ├── hero.tsx          — Hero section（server component 外壳）
│       ├── hero-particles.tsx — Canvas 粒子动画（'use client'）
│       └── features.tsx      — Features section（server component）
├── app/globals.css           — 追加自定义 CSS 变量和动画
```

## Styling Approach

- 使用 Tailwind CSS 类 + 少量自定义 CSS（光晕动画、渐变文字）
- fumadocs 暗色主题作为基础（已有 `neutral.css` + `preset.css`）
- 自定义 CSS 变量用于霓虹色值复用
- Canvas 粒子系统用原生 JS，不引入第三方库
- 响应式：移动端卡片改为单列，粒子数量减少

## Responsive Behavior

- **Desktop (≥1024px)**：标准布局，3 列特性卡片
- **Tablet (768-1023px)**：2 列卡片
- **Mobile (<768px)**：单列卡片，标题字号缩小，粒子数量减半
