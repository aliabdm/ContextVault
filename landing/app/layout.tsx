import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ContextVault - Local-first memory for AI chats and coding agents',
  description:
    'A local-first context platform that captures browser LLM conversations and terminal coding-agent sessions. Export as Markdown or ZIP. No backend. No accounts.',
  icons: {
    icon: '/icons/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
