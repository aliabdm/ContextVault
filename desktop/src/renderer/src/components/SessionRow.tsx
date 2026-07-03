import { useState } from 'react'

interface Session {
  id: string
  title: string
  source: string
  startedAt: string
  eventCount: number
  file: string
}

interface SessionRowProps {
  session: Session
  onOpen: (id: string) => void
  onExport: (id: string) => void
  onPrepare: (id: string) => void
}

export default function SessionRow({ session, onOpen, onExport, onPrepare }: SessionRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const date = session.startedAt
    ? new Date(session.startedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-'

  const sourceColors: Record<string, string> = {
    terminal: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    browser: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    codex: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    'claude-code': 'bg-green-500/10 text-green-300 border-green-500/20',
  }
  const sourceColor = sourceColors[session.source] || 'bg-neutral-500/10 text-neutral-300 border-neutral-500/20'

  return (
    <tr className="border-b border-dark-600 transition-colors hover:bg-dark-700/50">
      <td className="py-3 pl-4 pr-3">
        <div className="max-w-xs truncate text-sm font-medium text-white">{session.title}</div>
      </td>
      <td className="px-3 py-3">
        <span
          className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium uppercase ${sourceColor}`}
        >
          {session.source}
        </span>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-xs text-neutral-400">{date}</td>
      <td className="px-3 py-3 text-center text-sm text-neutral-400">{session.eventCount}</td>
      <td className="relative px-3 py-3 text-right">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-dark-600 hover:text-neutral-200"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-3 top-10 z-20 w-44 rounded-xl border border-dark-600 bg-dark-800 py-1 shadow-xl">
              <button
                onClick={() => { onOpen(session.id); setMenuOpen(false) }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-neutral-300 transition-colors hover:bg-dark-700"
              >
                ⌕ Open
              </button>
              <button
                onClick={() => { onPrepare(session.id); setMenuOpen(false) }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-neutral-300 transition-colors hover:bg-dark-700"
              >
                ⊞ Prepare context
              </button>
              <button
                onClick={() => { onExport(session.id); setMenuOpen(false) }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-neutral-300 transition-colors hover:bg-dark-700"
              >
                ↧ Export
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  )
}
