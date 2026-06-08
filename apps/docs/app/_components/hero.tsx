import Link from 'next/link'

import { HeroParticles } from './hero-particles'

export function Hero(): React.ReactElement {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-center">
      {/* Canvas particle background */}
      <HeroParticles />

      {/* Glow orbs */}
      <div className="absolute top-[15%] left-[20%] size-[400px] animate-[float_8s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.25)_0%,transparent_70%)] blur-[80px]" />
      <div className="absolute right-[15%] bottom-[20%] size-[350px] animate-[float_8s_ease-in-out_infinite_-4s] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.2)_0%,transparent_70%)] blur-[80px]" />
      <div className="absolute top-[50%] left-[55%] size-[250px] animate-[float_8s_ease-in-out_infinite_-2s] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.12)_0%,transparent_70%)] blur-[80px]" />

      {/* Content */}
      <div className="relative z-10">
        <div className="border-neon-purple/30 mx-auto mb-8 size-20 overflow-hidden rounded-2xl border shadow-[0_0_40px_rgba(139,92,246,0.3),0_0_80px_rgba(139,92,246,0.1)]">
          <img src="/guoba-icon.png" alt="Guoba AI" className="size-full object-cover" />
        </div>

        <h1 className="mb-12 bg-gradient-to-br from-slate-50 via-purple-400 to-blue-400 bg-clip-text text-7xl font-extrabold tracking-tighter text-transparent max-md:text-5xl">
          Guoba AI
        </h1>

        <Link
          href="/docs"
          className="from-neon-purple rounded-xl bg-gradient-to-br to-indigo-500 px-8 py-4 text-base font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.4),0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(139,92,246,0.6),0_6px_20px_rgba(0,0,0,0.4)]"
        >
          Get Started
        </Link>
      </div>

      {/* Bottom glow line */}
      <div className="via-neon-purple/40 absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent" />
    </section>
  )
}
