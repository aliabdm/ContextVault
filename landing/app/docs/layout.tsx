import type { Metadata } from 'next'
import DocsShell from '@/components/DocsShell'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: { default: 'Documentation - ContextVault', template: '%s · ContextVault Docs' },
  description: 'Practical guides for ContextVault Terminal, browser capture, Desktop workflows, local search, and prepared context handoffs.',
  alternates: { canonical: '/docs' },
  openGraph: { title: 'ContextVault Documentation', description: 'Guides for capturing, organizing, searching, and reusing your local AI project context.', type: 'website', siteName: 'ContextVault', locale: 'en_US' },
}

export default function DocumentationLayout({ children }: { children: React.ReactNode }) {
  return <><header className="sticky top-0 z-40 border-b border-dark-600 bg-dark-900/90 px-5 backdrop-blur-xl"><div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4"><a href="/" className="flex items-center gap-2 text-xs font-semibold text-white"><img src="/icons/icon.svg" alt="" className="h-7 w-7"/>ContextVault<span className="ml-1 border-l border-dark-500 pl-2 font-normal text-neutral-500">Docs</span></a><nav aria-label="Site navigation" className="flex items-center gap-4 text-[10px] sm:gap-6 sm:text-xs"><a href="/" className="text-neutral-500 transition hover:text-white">Home</a><a href="/faq.html" className="text-neutral-500 transition hover:text-white">Technical FAQ</a><a href="/download.html" className="rounded-lg bg-vault-500 px-3 py-2 font-semibold text-white transition hover:bg-vault-600">Download</a></nav></div></header><DocsShell>{children}</DocsShell><Footer/></>
}
