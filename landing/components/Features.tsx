'use client'

import { motion } from 'framer-motion'

const features = [
  {
    title: 'Browser Capture',
    description:
      'A Chrome extension surface for recording LLM conversations across ChatGPT, Claude, Gemini, Perplexity, Poe, DeepSeek, and Copilot.',
  },
  {
    title: 'Terminal Capture',
    description:
      'A CLI surface for preserving Codex work, Claude Code sessions, Cursor workflows, human notes, decisions, and tasks.',
  },
  {
    title: 'Local-first by design',
    description:
      'IndexedDB for browser conversations and local Markdown for terminal sessions. Your context stays on your machine.',
  },
  {
    title: 'Export and search',
    description:
      'Search terminal memory and export structured Markdown or ZIP files for prompts, handoffs, archives, and future context packages.',
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
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-dark-600 text-sm font-bold text-vault-300">
                0{i + 1}
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
