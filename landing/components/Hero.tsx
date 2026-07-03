'use client'

import { motion } from 'framer-motion'

const demos = [
  {
    label: 'Browser Capture',
    title: 'Record LLM chats',
    detail: 'ChatGPT, Claude, Gemini, Perplexity, Poe, DeepSeek, Copilot',
    image: '/demo/contextvault-demo.gif',
    alt: 'ContextVault captures browser AI conversations in real time and exports them as Markdown',
    accent: 'from-vault-500/20 to-blue-500/10',
  },
  {
    label: 'Vault Terminal',
    title: 'Record agent work',
    detail: 'Codex, Claude Code, Cursor workflows, notes, decisions, tasks',
    image: '/demo/vault-terminal-demo.gif',
    alt: 'Vault Terminal records a coding-agent session and exports local Markdown context',
    accent: 'from-orange-500/20 to-vault-500/10',
  },
  {
    label: 'Desktop App',
    title: 'Visual context manager',
    detail: 'Windows, macOS, Linux — manage sessions, search, and prepare context',
    image: null,
    alt: 'ContextVault Desktop app provides a visual interface for project context',
    accent: 'from-green-500/20 to-vault-500/10',
  },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-12 sm:pb-16">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-vault-500/[0.05] via-transparent to-transparent" />

      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-vault-500/20 bg-vault-500/10 px-3.5 py-1 text-xs font-medium tracking-wide text-vault-300">
            Local-first context platform
          </div>

          <h1 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-[3.35rem]">
            One memory layer for AI chats,{' '}
            <span className="bg-gradient-to-r from-vault-300 via-vault-200 to-orange-200 bg-clip-text text-transparent">
              coding agents, and terminals
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-balance text-lg leading-relaxed text-neutral-400 sm:text-xl">
            ContextVault captures browser conversations and terminal work sessions, combines them in one local
            index, and prepares portable context for the next model or coding agent.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/download"
              className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-vault-500 px-7 text-sm font-semibold text-white shadow-lg shadow-vault-500/30 transition-all hover:bg-vault-600 hover:shadow-vault-500/40 active:scale-[0.97]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 13.5l-5-3v-5" />
              </svg>
              Download Desktop App
            </a>
            <a
              href="#capture-surfaces"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-dark-500 bg-dark-700/50 px-5 text-sm font-medium text-neutral-300 backdrop-blur-sm transition-all hover:bg-dark-600 active:scale-[0.97]"
            >
              See both captures
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-600">
            <span>No backend</span>
            <span className="h-1 w-1 rounded-full bg-dark-500" />
            <span>No accounts</span>
            <span className="h-1 w-1 rounded-full bg-dark-500" />
            <span>No tracking</span>
            <span className="h-1 w-1 rounded-full bg-dark-500" />
            <span>Open source</span>
          </div>

          <div className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.npmjs.com/package/@aliabdm/contextvault"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-fit rounded-lg border border-dark-500 bg-dark-900 px-4 py-2 font-mono text-sm text-neutral-300 transition-colors hover:border-vault-500/50 hover:text-white"
            >
              npx @aliabdm/contextvault init
            </a>
            <a
              href="https://github.com/aliabdm/ContextVault"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-fit rounded-lg border border-dark-500 bg-dark-900 px-4 py-2 text-sm text-neutral-300 transition-colors hover:border-vault-500/50 hover:text-white"
            >
              Browser Extension
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {demos.map((demo) => (
            <div
              key={demo.label}
              className="overflow-hidden rounded-2xl border border-dark-500 bg-dark-900 shadow-2xl shadow-vault-500/5"
            >
              <div className={`border-b border-dark-500 bg-gradient-to-r ${demo.accent} px-4 py-3`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-vault-300">{demo.label}</p>
                    <h2 className="mt-1 text-lg font-bold tracking-tight text-white">{demo.title}</h2>
                  </div>
                  <span className="rounded-full border border-dark-400 bg-dark-800/70 px-3 py-1 text-xs font-medium text-neutral-300">
                    Local
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-neutral-400">{demo.detail}</p>
              </div>
              {demo.image ? (
                <img src={demo.image} alt={demo.alt} className="aspect-video w-full object-cover" />
              ) : (
                <DesktopMockup />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function DesktopMockup() {
  return (
    <div className="flex aspect-video w-full items-center justify-center bg-dark-800 p-3">
      <div className="flex h-full w-full overflow-hidden rounded-lg border border-dark-600">
        <div className="flex w-1/4 flex-col border-r border-dark-600 bg-dark-900 p-2">
          <div className="mb-3 flex items-center gap-1.5 px-1">
            <div className="flex h-4 w-4 items-center justify-center rounded bg-vault-500 text-[8px] font-bold text-white">CV</div>
            <span className="text-[9px] font-semibold text-white">ContextVault</span>
          </div>
          {['◉ Dashboard', '☰ Sessions', '⌕ Search', '⊞ Prepare', '⚙ Settings'].map((item) => (
            <div key={item} className="rounded-md px-2 py-1 text-[9px] text-neutral-500 hover:text-neutral-300">
              {item}
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col bg-dark-800 p-2">
          <div className="mb-2 text-[10px] font-bold text-white">Dashboard</div>
          <div className="mb-2 grid grid-cols-3 gap-1">
            {[{ label: 'Sessions', value: '12', c: 'text-violet-300' }, { label: 'Events', value: '43', c: 'text-blue-300' }, { label: 'Decisions', value: '8', c: 'text-emerald-300' }].map((s) => (
              <div key={s.label} className="rounded-md border border-dark-600 p-1.5">
                <div className={`text-xs font-bold ${s.c}`}>{s.value}</div>
                <div className="text-[7px] uppercase text-neutral-500">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {['⌕ Search', '⊞ Prepare', '📥 Import', '⚙ Settings'].map((a) => (
              <div key={a} className="rounded-md border border-dark-600 bg-dark-700/50 px-2 py-1.5 text-[8px] text-neutral-400">
                {a}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
