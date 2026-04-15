import Link from 'next/link'

export default function HomePage(): React.ReactElement {
  return (
    <main className="flex flex-1 flex-col items-center justify-center text-center">
      <h1 className="mb-4 text-4xl font-bold">Guoba Utils</h1>
      <p className="mb-8 text-lg text-fd-muted-foreground">
        A personal TypeScript utility library.
      </p>
      <Link
        href="/docs"
        className="rounded-lg bg-fd-primary px-6 py-3 text-fd-primary-foreground"
      >
        Documentation
      </Link>
    </main>
  )
}
