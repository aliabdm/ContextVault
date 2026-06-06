'use client'

import { motion } from 'framer-motion'

const pains = [
  {
    title: 'Switch tools, lose context',
    description:
      'Every switch between ChatGPT, Claude, Gemini, Codex, Cursor, or a terminal session can reset the working memory.',
  },
  {
    title: 'Context windows erase work',
    description:
      'Long chats and agent sessions get truncated. Important insights vanish before they become reusable memory.',
  },
  {
    title: 'Scattered across surfaces',
    description:
      'Your context lives across browsers, terminals, accounts, providers, agents, and sessions with no source of truth.',
  },
]

export default function Problem() {
  return (
    <section className="border-t border-dark-600 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">The Problem</span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your most valuable AI context is disappearing
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            Every chat, terminal session, and agent run contains decisions you might need again. Today, that knowledge is scattered or lost.
          </p>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-3">
          {pains.map((pain, i) => (
            <motion.div
              key={pain.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group rounded-2xl border border-dark-500 bg-dark-700/50 p-6 backdrop-blur-sm transition-colors hover:border-dark-400"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-dark-600 text-sm font-bold text-vault-300">
                0{i + 1}
              </div>
              <h3 className="text-sm font-semibold text-neutral-100">{pain.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{pain.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
