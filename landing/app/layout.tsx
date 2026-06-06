import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ContextVault - Browser and terminal memory for AI work',
  description:
    'A local-first context platform with Browser Capture for LLM chats and Vault Terminal for coding-agent sessions. Export Markdown or ZIP. No backend. No accounts.',
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
