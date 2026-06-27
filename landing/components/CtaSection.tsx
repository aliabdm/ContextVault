'use client'

import { motion } from 'framer-motion'

export default function CtaSection() {
  return (
    <section className="border-t border-dark-600 px-6 py-20 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Get Started</span>
        <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Start saving browser and terminal context today
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-neutral-400">
          Install the extension for LLM web apps. Use Vault Terminal for coding agents and project memory.
          Both are free, open source, and local-first.
        </p>

        <a
          href="https://github.com/aliabdm/ContextVault"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex h-12 items-center gap-2.5 rounded-xl bg-vault-500 px-7 text-sm font-semibold text-white shadow-lg shadow-vault-500/30 transition-all hover:bg-vault-600 hover:shadow-vault-500/40 active:scale-[0.97]"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Get ContextVault on GitHub
        </a>

        <p className="mt-4 text-xs text-neutral-600">
          Browser Capture + Terminal Capture - Open source - MIT license
        </p>

        <a href="/faq" className="mt-5 inline-block text-sm font-medium text-vault-300 transition-colors hover:text-white">
          Read the technical FAQ
        </a>
      </motion.div>
    </section>
  )
}
