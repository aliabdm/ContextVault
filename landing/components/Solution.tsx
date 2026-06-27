'use client'

import { motion } from 'framer-motion'

const points = [
  {
    number: '01',
    title: 'Captures from two surfaces',
    description:
      'Browser Capture records LLM chats. Terminal Capture records agent work, notes, decisions, tasks, and problems.',
  },
  {
    number: '02',
    title: 'Stays local, stays yours',
    description:
      'Browser data stays in IndexedDB. Terminal sessions stay in local Markdown. No cloud account required.',
  },
  {
    number: '03',
    title: 'Becomes reusable memory',
    description:
      'Import browser exports, index both sources, and prepare focused context for the next agent.',
  },
]

export default function Solution() {
  return (
    <section className="border-t border-dark-600 bg-dark-800/30 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">The Solution</span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Meet your local-first context platform
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            ContextVault gives browser chats and terminal sessions a shared local memory layer, so context survives tool switches.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {points.map((pt, i) => (
            <motion.div
              key={pt.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative rounded-2xl border border-dark-500 bg-dark-700 p-8 pt-10"
            >
              <span className="absolute right-4 top-3 text-[2.5rem] font-black leading-none text-dark-500">
                0{i + 1}
              </span>
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white">{pt.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{pt.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
