'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    title: 'Capture from the browser',
    description:
      'Use ChatGPT, Claude, Gemini, or other LLMs. The extension records conversations in the background.',
  },
  {
    title: 'Capture from the terminal',
    description:
      'Run Vault Terminal when you want to preserve agent work, decisions, tasks, problems, and project notes.',
  },
  {
    title: 'Search and export anytime',
    description:
      'Find saved context by topic and export clean Markdown or ZIP files ready to reuse or archive.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-dark-600 bg-dark-800/30 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">How It Works</span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            One memory layer, two inputs
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            Capture context where it happens, then search it, export it, and carry it into the next tool.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              viewport={{ once: true }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dark-500 bg-dark-700 text-sm font-bold text-vault-300 shadow-lg shadow-vault-500/5">
                0{i + 1}
              </div>
              <div className="mt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-vault-400">Step {i + 1}</span>
                <h3 className="mt-1 text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
