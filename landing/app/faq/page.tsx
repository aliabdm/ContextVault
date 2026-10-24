import type { Metadata } from 'next'
import TechnicalFaq from '@/components/TechnicalFaq'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Technical FAQ - ContextVault',
  description: 'How ContextVault captures, imports, indexes, retrieves, and protects local AI project context.',
}

export default function FaqPage() {
  return (
    <>
      <div className="border-b border-dark-600 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <a href="/" className="text-sm font-semibold text-white">ContextVault</a>
          <div className="flex items-center gap-4">
            <a href="/docs.html" className="text-sm font-semibold text-vault-200 transition-colors hover:text-white">Documentation</a>
            <a href="/" className="text-sm text-neutral-400 transition-colors hover:text-white">Back to overview</a>
          </div>
        </div>
      </div>
      <TechnicalFaq />
      <Footer />
    </>
  )
}
