'use client'

import { motion } from 'framer-motion'

const stages = [
  {
    number: '01',
    title: 'Normalize',
    description: 'Convert terminal sessions into shared ContextSession and ContextEvent records.',
    command: 'vault:index',
  },
  {
    number: '02',
    title: 'Index',
    description: 'Build a local knowledge index across decisions, tasks, problems, notes, and messages.',
    command: '.contextvault/index',
  },
  {
    number: '03',
    title: 'Retrieve',
    description: 'Rank relevant project context for a task without sending data to an external model.',
    command: 'vault:retrieve -- "auth"',
  },
  {
    number: '04',
    title: 'Prepare',
    description: 'Create a focused Markdown context package ready for the next coding agent.',
    command: 'vault:prepare -- "auth"',
  },
]

export default function ContextEngine() {
  return (
    <section className="border-t border-dark-600 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-vault-300">
            Context Engine
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Capture is the input. Reusable context is the product.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            ContextVault turns raw terminal sessions into indexed project memory, retrieves what matters,
            and prepares focused context packages for Codex, Claude Code, Cursor, or another agent.
          </p>
        </div>

        <div className="mt-14 grid gap-3 md:grid-cols-4">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="relative border-t border-dark-400 bg-dark-800/40 px-5 py-6"
            >
              <span className="text-xs font-bold text-vault-300">{stage.number}</span>
              <h3 className="mt-3 text-lg font-semibold text-white">{stage.title}</h3>
              <p className="mt-2 min-h-[5rem] text-sm leading-relaxed text-neutral-500">{stage.description}</p>
              <code className="mt-4 block overflow-hidden text-ellipsis whitespace-nowrap border border-dark-500 bg-dark-900 px-3 py-2 text-xs text-neutral-300">
                {stage.command}
              </code>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-px overflow-hidden border border-dark-500 bg-dark-500 sm:grid-cols-3">
          <div className="bg-dark-900 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-600">Storage</p>
            <p className="mt-1 text-sm font-medium text-neutral-300">Local Markdown + JSON index</p>
          </div>
          <div className="bg-dark-900 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-600">Retrieval</p>
            <p className="mt-1 text-sm font-medium text-neutral-300">Deterministic and private</p>
          </div>
          <div className="bg-dark-900 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-600">Output</p>
            <p className="mt-1 text-sm font-medium text-neutral-300">Agent-ready context packages</p>
          </div>
        </div>
      </div>
    </section>
  )
}
