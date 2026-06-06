'use client'

import { motion } from 'framer-motion'

const surfaces = [
  {
    label: 'Browser Capture',
    title: 'Save AI conversations as they happen',
    description:
      'Capture ChatGPT, Claude, Gemini, Perplexity, Poe, DeepSeek, and Copilot conversations from the browser extension.',
    items: ['Real-time capture', 'Markdown export', 'ZIP archive', 'Local browser storage'],
  },
  {
    label: 'Terminal Capture',
    title: 'Record coding-agent context from the CLI',
    description:
      'Use Vault Terminal to capture Codex sessions, Claude Code work, Cursor workflows, human notes, decisions, tasks, and problems.',
    items: ['Local Markdown sessions', 'Search', 'Export', 'Project memory'],
  },
]

export default function CaptureSurfaces() {
  return (
    <section className="border-t border-dark-600 bg-dark-800/30 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Two Capture Surfaces
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Browser chats and terminal sessions belong in the same memory layer
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            ContextVault stores both locally, keeps them searchable, and exports clean files you can reuse across tools.
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          {surfaces.map((surface, i) => (
            <motion.div
              key={surface.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-dark-500 bg-dark-700/60 p-7 backdrop-blur-sm"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-vault-300">
                {surface.label}
              </span>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">{surface.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">{surface.description}</p>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {surface.items.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-dark-500 bg-dark-800 px-4 py-3 text-sm font-medium text-neutral-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="mt-8 overflow-hidden rounded-2xl border border-dark-500 bg-dark-900 shadow-2xl shadow-vault-500/5"
        >
          <div className="flex flex-col gap-3 border-b border-dark-500 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Vault Terminal demo</p>
              <p className="text-xs text-neutral-500">Record decisions, tasks, problems, and agent work locally.</p>
            </div>
            <span className="w-fit rounded-full border border-vault-500/30 bg-vault-500/10 px-3 py-1 text-xs font-medium text-vault-300">
              Local Markdown
            </span>
          </div>
          <img
            src="/demo/vault-terminal-demo.gif"
            alt="Vault Terminal records a coding-agent session and exports local Markdown context"
            className="w-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  )
}
