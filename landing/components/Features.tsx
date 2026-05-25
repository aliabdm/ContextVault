'use client'

import { motion } from 'framer-motion'

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Capture everything',
    description: 'Dual-path capture engine records every message across 7 LLM platforms. Nothing slips through.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    title: 'Export your way',
    description: 'Markdown for notes and LLM prompts. ZIP for backups and archiving. One click, clean output.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Local-first by design',
    description: 'IndexedDB storage. No cloud, no sync, no external APIs. Your conversations never leave your machine.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    title: 'Works across LLMs',
    description: 'ChatGPT, Claude, Gemini, Perplexity, Poe, DeepSeek, Copilot — all in one extension, no config needed.',
  },
]

export default function Features() {
  return (
    <section className="border-t border-dark-600 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Features</span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to own your AI context
          </h2>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              viewport={{ once: true }}
              className="group rounded-2xl border border-dark-500 bg-dark-700/50 p-6 backdrop-blur-sm transition-all hover:border-dark-400 hover:bg-dark-700"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-dark-600 text-neutral-400 transition-colors group-hover:text-vault-300">
                {f.icon}
              </div>
              <h3 className="font-semibold text-neutral-100">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
