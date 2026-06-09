const features = [
  {
    icon: '🛡️',
    title: 'Type Safe',
    description:
      'Complete TypeScript inference from input to output, with end-to-end type safety and IDE hints out of the box',
    color: 'bg-neon-purple/15 shadow-[0_0_20px_rgba(139,92,246,0.15)]',
  },
  {
    icon: '⚡',
    title: 'Lightweight',
    description:
      'Zero external dependencies, independently usable functions, and a tiny bundle footprint that keeps projects fast',
    color: 'bg-neon-blue/15 shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  },
  {
    icon: '🌲',
    title: 'Tree-shakable',
    description:
      'ESM-only by design, so build tools can remove unused code and ship only what you actually need',
    color: 'bg-neon-cyan/15 shadow-[0_0_20px_rgba(34,211,238,0.15)]',
  },
  {
    icon: '🧩',
    title: 'Modular Design',
    description:
      'Array, Object, String, Guard, and Types utilities are grouped by domain and ready to import on demand',
    color: 'bg-pink-500/15 shadow-[0_0_20px_rgba(236,72,153,0.15)]',
  },
  {
    icon: '✅',
    title: 'Fully Tested',
    description:
      'Every function is covered by focused unit tests, keeping behavior predictable and reliable',
    color: 'bg-emerald-400/15 shadow-[0_0_20px_rgba(52,211,153,0.15)]',
  },
  {
    icon: '📖',
    title: 'Documentation Driven',
    description:
      'API docs are generated from source JSDoc, keeping examples and implementation in sync',
    color: 'bg-orange-400/15 shadow-[0_0_20px_rgba(251,146,60,0.15)]',
  },
]

export function Features(): React.ReactElement {
  return (
    <section className="mx-auto max-w-[1100px] px-6 py-20">
      <div className="mb-16 text-center">
        <h2 className="mb-3 bg-gradient-to-br from-slate-100 to-slate-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent max-md:text-3xl">
          Why Choose Guoba AI
        </h2>
        <p className="text-base text-slate-500">
          Thoughtfully designed tools for modern development
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map(feature => (
          <div
            key={feature.title}
            className="group border-neon-purple/[0.12] hover:border-neon-purple/30 relative overflow-hidden rounded-2xl border bg-[rgba(15,15,30,0.6)] p-8 transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(139,92,246,0.1),0_8px_24px_rgba(0,0,0,0.3)]"
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
