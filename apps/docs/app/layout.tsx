import type { ReactNode } from 'react'
import { RootProvider } from 'fumadocs-ui/provider/next'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
