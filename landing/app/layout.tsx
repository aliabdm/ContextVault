import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ContextVault - Local-first context engine for AI work',
  description:
    'Capture browser LLM chats and terminal agent sessions, index them locally, retrieve relevant memory, and prepare portable context packages. No backend. No accounts.',
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
