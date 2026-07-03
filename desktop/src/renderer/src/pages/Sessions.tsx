import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SessionRow from '../components/SessionRow'

export default function Sessions() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const list = await window.contextVault?.listSessions()
      setSessions(list || [])
      setFiltered(list || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(sessions)
      return
    }
    const q = search.toLowerCase()
    setFiltered(sessions.filter((s) => s.title?.toLowerCase().includes(q) || s.source?.toLowerCase().includes(q)))
  }, [search, sessions])

  const handleExport = async (id: string) => {
    const result = await window.contextVault?.exportMarkdown(id)
    if (result?.content) {
      const blob = new Blob([result.content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename || `session-${id}.md`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-neutral-500">Loading sessions...</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sessions</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => navigate('/record')} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-600">
          <span className="h-2.5 w-2.5 rounded-full bg-white" /> Start recording
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter sessions..."
          className="w-full rounded-xl border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 outline-none transition-colors focus:border-vault-500/50"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dark-600 py-14 text-center">
          <p className="text-sm text-neutral-500">{sessions.length === 0 ? 'No sessions yet. Start a recording or import a browser export.' : 'No matches'}</p>
          {sessions.length === 0 && (
            <button onClick={() => navigate('/record')} className="mt-4 text-sm font-semibold text-vault-400 hover:text-vault-300">Record your first session →</button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-dark-600">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600 bg-dark-900 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-3">Title</th>
                <th className="px-3 py-3">Source</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3 text-center">Events</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((session) => (
                <SessionRow
                  key={session.id}
                  session={session}
                  onOpen={(id) => navigate(`/sessions/${encodeURIComponent(id)}`)}
                  onExport={handleExport}
                  onPrepare={(id) => navigate(`/prepare?id=${encodeURIComponent(id)}`)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
