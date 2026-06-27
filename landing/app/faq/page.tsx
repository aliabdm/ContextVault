import type { Metadata } from 'next'
import Link from 'next/link'
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
          <Link href="/" className="text-sm font-semibold text-white">ContextVault</Link>
          <Link href="/" className="text-sm text-neutral-400 transition-colors hover:text-white">Back to overview</Link>
        </div>
      </div>
      <TechnicalFaq />
      <Footer />
    </>
  )
}
