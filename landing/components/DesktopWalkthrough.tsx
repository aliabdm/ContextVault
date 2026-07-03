'use client'

import { useEffect, useRef, useState } from 'react'

type Step = {
  image: string
  caption: string
  detail: string
}

const STEPS: Step[] = [
  { image: '/demo/desktop-walkthrough/step-01.png', caption: 'Add a project', detail: 'Pick any local folder. ContextVault creates its .contextvault storage there.' },
  { image: '/demo/desktop-walkthrough/step-02.png', caption: 'Start recording', detail: 'Name the session. Choose Codex, Claude Code, Cursor, Terminal, or another source.' },
  { image: '/demo/desktop-walkthrough/step-03.png', caption: 'Capture events', detail: 'The bundled contextvault record runs underneath. Automatic classification is local and private.' },
  { image: '/demo/desktop-walkthrough/step-04.png', caption: 'See captured events', detail: 'Each entry is sent to the real CLI recorder with a visible, explicit action.' },
  { image: '/demo/desktop-walkthrough/step-05.png', caption: 'Open any session', detail: 'Inspect events, metadata, and source without leaving the GUI.' },
  { image: '/demo/desktop-walkthrough/step-06.png', caption: 'Browse sessions', detail: 'Sessions written by the CLI or a compatible agent appear automatically.' },
  { image: '/demo/desktop-walkthrough/step-07.png', caption: 'Filter history', detail: 'Narrow events by source, type, and time window with dedicated History view.' },
  { image: '/demo/desktop-walkthrough/step-08.png', caption: 'Retrieve evidence', detail: 'Rank ranked context for a query and inspect the grouped results.' },
  { image: '/demo/desktop-walkthrough/step-09.png', caption: 'Run any CLI command', detail: 'Every package command is exposed through GUI controls — no terminal required.' },
  { image: '/demo/desktop-walkthrough/step-10.png', caption: 'Switch projects', detail: 'Multiple recent project vaults; switch from the sidebar without deleting data.' },
  { image: '/demo/desktop-walkthrough/step-11.png', caption: 'Ready for the next agent', detail: 'Dashboard with the full project context — prepare and export when you are.' },
]

const STEP_MS = 2600

export default function DesktopWalkthrough() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (paused) return
    timerRef.current = setTimeout(() => {
      setIndex((current) => (current + 1) % STEPS.length)
    }, STEP_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [index, paused])

  const current = STEPS[index]

  return (
    <div
      className="overflow-hidden rounded-2xl border border-vault-500/30 bg-dark-900 p-2 shadow-2xl shadow-vault-500/15"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-dark-800">
        {STEPS.map((step, i) => (
          <img
            key={step.image}
            src={step.image}
            alt={step.caption}
            aria-hidden={i !== index}
            loading={i === 0 ? 'eager' : 'lazy'}
            className="absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-900/95 via-dark-900/70 to-transparent px-5 pb-4 pt-10">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-vault-300">
                Step {index + 1} of {STEPS.length}
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-white">{current.caption}</p>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-neutral-400">{current.detail}</p>
            </div>
            <span className="shrink-0 rounded-full bg-dark-700/80 px-2 py-1 text-[10px] font-medium text-neutral-300">
              {paused ? 'Paused' : 'Auto'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 px-1">
        {STEPS.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to step ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i === index ? 'bg-vault-400' : i < index ? 'bg-dark-500' : 'bg-dark-600 hover:bg-dark-500'
            }`}
          />
        ))}
      </div>
    </div>
  )
}