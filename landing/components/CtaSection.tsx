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
          Install the extension for LLM web apps. Use Vault Terminal for coding agents, or the Desktop app for a visual interface.
          All are free, open source, and local-first.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="https://www.npmjs.com/package/@aliabdm/contextvault"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center rounded-xl bg-vault-500 px-7 font-mono text-sm font-semibold text-white shadow-lg shadow-vault-500/30 transition-all hover:bg-vault-600 active:scale-[0.97]"
          >
            npx @aliabdm/contextvault init
          </a>
          <a
            href="https://github.com/aliabdm/ContextVault"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center rounded-xl border border-dark-500 bg-dark-700/50 px-6 text-sm font-semibold text-neutral-200 transition-all hover:bg-dark-600 active:scale-[0.97]"
          >
            Browser extension
          </a>
          <a
            href="https://github.com/aliabdm/ContextVault/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center rounded-xl border border-vault-500/30 bg-vault-500/10 px-6 text-sm font-semibold text-vault-200 transition-all hover:bg-vault-500/20 active:scale-[0.97]"
          >
            Desktop app
          </a>
        </div>

        <p className="mt-4 text-xs text-neutral-600">
          Browser Capture + Terminal Capture + Desktop App - Open source - MIT license
        </p>

        <a href="/faq" className="mt-5 inline-block text-sm font-medium text-vault-300 transition-colors hover:text-white">
          Read the technical FAQ
        </a>
      </motion.div>
    </section>
  )
}
