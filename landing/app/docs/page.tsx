import type { Metadata } from 'next'
import DocsLanding from '@/components/DocsLanding'

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Choose a ContextVault guide for Vault Terminal, the browser extension, Desktop, or the local context engine.',
  alternates: { canonical: '/docs/' },
}

export default function DocumentationHome() {
  return <DocsLanding />
}
