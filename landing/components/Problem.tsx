'use client'

import { motion } from 'framer-motion'

const pains = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    title: 'Switch models, lose context',
    description: 'Every time you switch between ChatGPT, Claude, or Gemini, your working context resets. You start from zero.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Token limits erase your work',
    description: 'Long conversations get truncated. The most important insights vanish before you can save them.',
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    title: 'Locked inside platforms',
    description: 'Your conversations are scattered across accounts, providers, and sessions. No single source of truth.',
  },
]

export default function Problem() {
  return (
    <section className="border-t border-dark-600 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">The Problem</span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your most valuable AI conversations are disappearing
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            Every chat contains insights, code, or ideas you might need again. But today, that knowledge is scattered, locked, or lost.
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
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-dark-600 text-neutral-400 transition-colors group-hover:text-vault-300">
                {pain.icon}
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
