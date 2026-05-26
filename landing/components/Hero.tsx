'use client'

import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-12 sm:pb-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-vault-500/[0.04] via-transparent to-transparent" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-vault-500/20 bg-vault-500/10 px-3.5 py-1 text-xs font-medium tracking-wide text-vault-300">
            Portable Memory Layer for AI
          </div>

          <h1 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-[3.35rem]">
            Stop losing your{' '}
            <span className="bg-gradient-to-r from-vault-300 via-vault-200 to-vault-300 bg-clip-text text-transparent">
              AI conversations
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-balance text-lg leading-relaxed text-neutral-400 sm:text-xl">
            ContextVault captures every chat across ChatGPT, Claude, Gemini, and more —
            stores them locally, and exports as Markdown or ZIP.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <a
              href="https://github.com/aliabdm/ContextVault"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-12 items-center gap-2.5 rounded-xl bg-vault-500 px-7 text-sm font-semibold text-white shadow-lg shadow-vault-500/30 transition-all hover:bg-vault-600 hover:shadow-vault-500/40 active:scale-[0.97]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Install Extension — Free
            </a>

            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-dark-500 bg-dark-700/50 px-5 text-sm font-medium text-neutral-300 backdrop-blur-sm transition-all hover:bg-dark-600 active:scale-[0.97]"
            >
              How it works
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-600">
            <span>No backend</span>
            <span className="h-1 w-1 rounded-full bg-dark-500" />
            <span>No accounts</span>
            <span className="h-1 w-1 rounded-full bg-dark-500" />
            <span>No tracking</span>
            <span className="h-1 w-1 rounded-full bg-dark-500" />
            <span>Open source</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-12 max-w-5xl"
        >
          <div className="relative overflow-hidden rounded-2xl border border-dark-500 bg-dark-900 shadow-2xl shadow-vault-500/5">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark-900/40 via-transparent to-transparent" />
            <img
              src="/demo/contextvault-demo.gif"
              alt="ContextVault captures AI conversations in real-time and exports them as Markdown"
              className="w-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
