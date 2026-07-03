import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ContextVault - Local-first context engine for AI work',
  description:
    'Capture browser LLM chats and terminal agent sessions, combine them in one local index, retrieve relevant memory, and prepare portable context packages. No backend. No accounts.',
  icons: {
    icon: '/icons/icon.svg',
  },
  openGraph: {
    title: 'ContextVault - Local-first context engine for AI work',
    description:
      'Capture browser LLM chats and terminal agent sessions, combine them in one local index, retrieve relevant memory, and prepare portable context packages. No backend. No accounts.',
    type: 'website',
    siteName: 'ContextVault',
    locale: 'en_US',
    images: [
      {
        url: 'https://context-vault-two.vercel.app/icons/icon128.png',
        width: 128,
        height: 128,
        alt: 'ContextVault logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'ContextVault - Local-first context engine for AI work',
    description:
      'Capture browser LLM chats and terminal agent sessions, combine them in one local index, retrieve relevant memory, and prepare portable context packages.',
    images: ['https://context-vault-two.vercel.app/icons/icon128.png'],
  },
  robots: {
    index: true,
    follow: true,
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
