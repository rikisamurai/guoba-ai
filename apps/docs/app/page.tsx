import { Features } from './_components/features'
import { Hero } from './_components/hero'

export default function HomePage(): React.ReactElement {
  return (
    <main className="bg-[#09090b]">
      <Hero />
      <Features />
    </main>
  )
}
