# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the guoba-ai docs homepage from a minimal placeholder to a neon-cyber AI-branded landing page with animated particle background and feature cards.

**Architecture:** Split into 3 components under `apps/docs/app/_components/`: a Canvas particle animation client component, a Hero server component wrapping it, and a Features server component. The root `page.tsx` composes them. Custom CSS variables and keyframes go into `globals.css`.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS v4, fumadocs-ui, native Canvas API (no third-party libs)

---

### Task 1: Add custom CSS variables and keyframes to globals.css

**Files:**

- Modify: `apps/docs/app/globals.css`

- [ ] **Step 1: Add neon theme variables and float animation**

Append after the existing imports in `apps/docs/app/globals.css`:

```css
@theme {
  --color-neon-purple: oklch(0.541 0.281 293.009);
  --color-neon-blue: oklch(0.623 0.214 259.815);
  --color-neon-cyan: oklch(0.789 0.154 211.53);
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0);
  }
  33% {
    transform: translate(20px, -15px);
  }
  66% {
    transform: translate(-15px, 10px);
  }
}
```

- [ ] **Step 2: Verify CSS is valid**

Run: `cd /Users/shanyulong/riki/repo/guoba-ai && pnpm docs:build`
Expected: Build succeeds without CSS errors.

- [ ] **Step 3: Commit**

```bash
git add apps/docs/app/globals.css
git commit -m "feat(docs): add neon theme variables and float animation"
```

---

### Task 2: Create the Canvas particle animation client component

**Files:**

- Create: `apps/docs/app/_components/hero-particles.tsx`

- [ ] **Step 1: Create the \_components directory and hero-particles.tsx**

Create `apps/docs/app/_components/hero-particles.tsx`:

```tsx
'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
  alpha: number
}

export function HeroParticles(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const isMobile = window.innerWidth < 768
    const count = isMobile ? 30 : 60

    function resize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth * devicePixelRatio
      canvas.height = canvas.offsetHeight * devicePixelRatio
      ctx!.scale(devicePixelRatio, devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      color: Math.random() > 0.5 ? 'rgba(139,92,246,' : 'rgba(96,165,250,',
      alpha: Math.random() * 0.5 + 0.2,
    }))

    function draw() {
      if (!canvas || !ctx) return
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight

      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.15
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(139,92,246,${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.alpha})`
        ctx.fill()

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
      }

      animationId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 size-full" />
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/shanyulong/riki/repo/guoba-ai && pnpm docs:build`
Expected: Build succeeds (component not yet used, but must compile).

- [ ] **Step 3: Commit**

```bash
git add apps/docs/app/_components/hero-particles.tsx
git commit -m "feat(docs): add canvas particle animation client component"
```

---

### Task 3: Create the Hero server component

**Files:**

- Create: `apps/docs/app/_components/hero.tsx`

- [ ] **Step 1: Create hero.tsx**

Create `apps/docs/app/_components/hero.tsx`:

```tsx
import Link from 'next/link'
import { HeroParticles } from './hero-particles'

export function Hero(): React.ReactElement {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-center">
      {/* Canvas particle background */}
      <HeroParticles />

      {/* Glow orbs */}
      <div className="animate-[float_8s_ease-in-out_infinite] absolute top-[15%] left-[20%] size-[400px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.25)_0%,transparent_70%)] blur-[80px]" />
      <div className="animate-[float_8s_ease-in-out_infinite_-4s] absolute right-[15%] bottom-[20%] size-[350px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.2)_0%,transparent_70%)] blur-[80px]" />
      <div className="animate-[float_8s_ease-in-out_infinite_-2s] absolute top-[50%] left-[55%] size-[250px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.12)_0%,transparent_70%)] blur-[80px]" />

      {/* Content */}
      <div className="relative z-10">
        <div className="mx-auto mb-8 size-20 overflow-hidden rounded-2xl border border-neon-purple/30 shadow-[0_0_40px_rgba(139,92,246,0.3),0_0_80px_rgba(139,92,246,0.1)]">
          <img src="/guoba-icon.png" alt="Guoba AI" className="size-full object-cover" />
        </div>

        <h1 className="mb-12 bg-gradient-to-br from-slate-50 via-purple-400 to-blue-400 bg-clip-text text-7xl font-extrabold tracking-tighter text-transparent max-md:text-5xl">
          Guoba AI
        </h1>

        <Link
          href="/docs"
          className="rounded-xl bg-gradient-to-br from-neon-purple to-indigo-500 px-8 py-4 text-base font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.4),0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(139,92,246,0.6),0_6px_20px_rgba(0,0,0,0.4)]"
        >
          Get Started
        </Link>
      </div>

      {/* Bottom glow line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neon-purple/40 to-transparent" />
    </section>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/shanyulong/riki/repo/guoba-ai && pnpm docs:build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add apps/docs/app/_components/hero.tsx
git commit -m "feat(docs): add hero section with neon glow effects"
```

---

### Task 4: Create the Features server component

**Files:**

- Create: `apps/docs/app/_components/features.tsx`

- [ ] **Step 1: Create features.tsx**

Create `apps/docs/app/_components/features.tsx`:

```tsx
const features = [
  {
    icon: '🛡️',
    title: '类型安全',
    description: '完整的 TypeScript 类型推导，从输入到输出全链路类型安全，IDE 智能提示开箱即用',
    color: 'bg-neon-purple/15 shadow-[0_0_20px_rgba(139,92,246,0.15)]',
  },
  {
    icon: '⚡',
    title: '极致轻量',
    description: '零外部依赖，每个函数独立可用，打包体积极小，不拖慢你的项目',
    color: 'bg-neon-blue/15 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  },
  {
    icon: '🌲',
    title: 'Tree-shakable',
    description: 'ESM-only 设计，构建工具可自动移除未使用的代码，只打包你真正需要的',
    color: 'bg-neon-cyan/15 shadow-[0_0_20px_rgba(34,211,238,0.15)]',
  },
  {
    icon: '🧩',
    title: '模块化设计',
    description: 'Array、Object、String、Guard、Types — 按领域清晰分组，按需引入',
    color: 'bg-pink-500/15 shadow-[0_0_20px_rgba(236,72,153,0.15)]',
  },
  {
    icon: '✅',
    title: '全面测试',
    description: '每个函数都有完整的单元测试覆盖，确保行为可预测、可信赖',
    color: 'bg-emerald-400/15 shadow-[0_0_20px_rgba(52,211,153,0.15)]',
  },
  {
    icon: '📖',
    title: '文档驱动',
    description: '从源码 JSDoc 自动生成 API 文档，示例代码与实现始终保持同步',
    color: 'bg-orange-400/15 shadow-[0_0_20px_rgba(251,146,60,0.15)]',
  },
]

export function Features(): React.ReactElement {
  return (
    <section className="mx-auto max-w-[1100px] px-6 py-20">
      <div className="mb-16 text-center">
        <h2 className="mb-3 bg-gradient-to-br from-slate-100 to-slate-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent max-md:text-3xl">
          为什么选择 Guoba AI
        </h2>
        <p className="text-base text-slate-500">精心设计的工具，为现代开发而生</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map(feature => (
          <div
            key={feature.title}
            className="group relative overflow-hidden rounded-2xl border border-neon-purple/[0.12] bg-[rgba(15,15,30,0.6)] p-8 transition-all duration-400 hover:-translate-y-0.5 hover:border-neon-purple/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.1),0_8px_24px_rgba(0,0,0,0.3)]"
          >
            {/* Hover glow overlay */}
            <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.08)_0%,transparent_60%)] opacity-0 transition-opacity duration-400 group-hover:opacity-100" />

            <div
              className={`relative mb-5 flex size-12 items-center justify-center rounded-xl text-[22px] ${feature.color}`}
            >
              {feature.icon}
            </div>
            <h3 className="relative mb-2 text-lg font-semibold text-slate-200">{feature.title}</h3>
            <p className="relative text-sm leading-relaxed text-slate-400">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd /Users/shanyulong/riki/repo/guoba-ai && pnpm docs:build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add apps/docs/app/_components/features.tsx
git commit -m "feat(docs): add features section with neon-styled cards"
```

---

### Task 5: Rewrite page.tsx to compose Hero + Features

**Files:**

- Modify: `apps/docs/app/page.tsx`

- [ ] **Step 1: Replace page.tsx contents**

Replace the full contents of `apps/docs/app/page.tsx` with:

```tsx
import { Hero } from './_components/hero'
import { Features } from './_components/features'

export default function HomePage(): React.ReactElement {
  return (
    <main className="bg-[#09090b]">
      <Hero />
      <Features />
    </main>
  )
}
```

- [ ] **Step 2: Build and verify**

Run: `cd /Users/shanyulong/riki/repo/guoba-ai && pnpm docs:build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Visual verification**

Run: `cd /Users/shanyulong/riki/repo/guoba-ai/apps/docs && pnpm dev`
Open `http://localhost:3000` in the browser and verify:

- Hero section renders with particle animation, glowing orbs, Guoba icon, gradient title, and CTA button
- Features section renders with 6 cards in a 3-column grid
- Hover effects work on feature cards
- Page is responsive (check at mobile width)

- [ ] **Step 4: Commit**

```bash
git add apps/docs/app/page.tsx
git commit -m "feat(docs): compose homepage with hero and features sections"
```

---

### Task 6: Lint check and fix

**Files:**

- Potentially modify: all new files in `apps/docs/app/_components/`

- [ ] **Step 1: Run lint**

Run: `cd /Users/shanyulong/riki/repo/guoba-ai && pnpm lint`
Expected: No lint errors in new files (docs is excluded from linting per CLAUDE.md, but verify).

- [ ] **Step 2: Fix any issues if needed**

If lint errors appear in the new files, fix them.

- [ ] **Step 3: Final commit if fixes were needed**

```bash
git add -A
git commit -m "fix(docs): lint fixes for homepage components"
```
