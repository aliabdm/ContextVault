import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ContextVault — Your portable memory layer for AI conversations',
  description:
    'A local-first Chrome extension that records AI conversations across ChatGPT, Claude, Gemini, and more. Export as Markdown or ZIP. No backend. No tracking.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
