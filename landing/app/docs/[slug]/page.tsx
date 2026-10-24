import type { Metadata } from 'next'
import DocsArticle from '@/components/DocsArticle'
import { docsSlugs } from '@/lib/docs-links'

const titles: Record<string, string> = {
  quickstart: 'Quick start',
  cli: 'CLI guide',
  commands: 'Command reference',
  extension: 'Browser extension',
  'import-search': 'Import and search',
  desktop: 'Desktop guide',
  'desktop-tabs': 'Desktop screen reference',
  storage: 'Storage and privacy',
  troubleshooting: 'Troubleshooting',
}

export function generateStaticParams() {
  return docsSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (!titles[slug]) return {}
  return {
    title: titles[slug],
    description: `ContextVault documentation: ${titles[slug]} guide and step-by-step examples.`,
    alternates: { canonical: `/docs/${slug}/` },
  }
}

export default async function DocumentationArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!titles[slug]) return null
  return <DocsArticle slug={slug} />
}
