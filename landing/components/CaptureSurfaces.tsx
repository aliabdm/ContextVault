'use client'

import { motion } from 'framer-motion'

const surfaces = [
  {
    label: 'Browser Capture',
    title: 'Use it when the work happens in an LLM web app',
    description:
      'Install the extension, chat normally, and export structured Markdown or ZIP files when the conversation becomes useful context.',
    steps: ['Capture a supported LLM conversation locally', 'Export Markdown or ZIP from the popup', 'Import it with contextvault import'],
    proof: 'Best for prompts, answers, research threads, model comparisons, and account/platform switching.',
  },
  {
    label: 'Terminal Capture',
    title: 'Use it when the work happens in a coding-agent session',
    description:
      'Run Vault Terminal inside a project and record the raw context that usually disappears from terminals and coding tools.',
    steps: ['npm run vault:init', 'npm run vault:record', 'npm run vault:search -- auth'],
    proof: 'Best for Codex sessions, Claude Code notes, Cursor workflows, decisions, tasks, bugs, and project memory.',
  },
]

export default function CaptureSurfaces() {
  return (
    <section id="capture-surfaces" className="border-t border-dark-600 bg-dark-800/30 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Two Capture Surfaces
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Capture context where it actually happens
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            Browser exports and Terminal Capture feed the same local-first Context Engine.
            One preserves conversations. The other preserves agent work and project decisions.
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

              <div className="mt-6 space-y-2">
                {surface.steps.map((step, stepIndex) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 rounded-xl border border-dark-500 bg-dark-800 px-4 py-3"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vault-500/10 text-xs font-bold text-vault-300">
                      {stepIndex + 1}
                    </span>
                    <span className="text-sm font-medium text-neutral-300">{step}</span>
                  </div>
                ))}
              </div>

              <p className="mt-5 rounded-xl border border-dark-500 bg-dark-900 px-4 py-3 text-sm leading-relaxed text-neutral-500">
                {surface.proof}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
