'use client'

import { motion } from 'framer-motion'

const points = [
  {
    number: '01',
    title: 'Captures in real-time',
    description: 'DOM + Network hybrid engine records every message as it streams — across all major LLM platforms.',
  },
  {
    number: '02',
    title: 'Stays local, stays yours',
    description: 'IndexedDB stores everything in your browser. No cloud, no sync, no third party ever touches your data.',
  },
  {
    number: '03',
    title: 'Exports in one click',
    description: 'Download any conversation as Markdown or ZIP. Structured, clean, ready to reuse anywhere.',
  },
]

export default function Solution() {
  return (
    <section className="border-t border-dark-600 bg-dark-800/30 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">The Solution</span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Meet your portable memory layer
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            ContextVault sits quietly in your browser, capturing AI conversations as they happen — so you never lose context again.
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
              <span className="absolute right-4 top-3 text-[2.5rem] font-black leading-none text-dark-500">0{i + 1}</span>
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
