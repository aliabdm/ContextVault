import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import EventTimeline from '../components/EventTimeline'

export default function SessionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      setLoading(true)
      const s = await window.contextVault?.getSession(decodeURIComponent(id))
      setSession(s)
      setLoading(false)
    }
    load()
  }, [id])

  const handleExport = async () => {
    if (!id || !session) return
    const result = await window.contextVault?.exportMarkdown(decodeURIComponent(id))
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

  const handleCopy = async () => {
    if (!id) return
    const result = await window.contextVault?.exportMarkdown(decodeURIComponent(id))
    if (result?.content) await navigator.clipboard.writeText(result.content)
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-neutral-500">Loading session...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="text-4xl">☰</div>
        <p className="text-sm text-neutral-500">Session not found</p>
        <button
          onClick={() => navigate('/sessions')}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-dark-600 bg-dark-700 px-4 text-xs font-medium text-neutral-300 transition-colors hover:bg-dark-600"
        >
          ← Back to sessions
        </button>
      </div>
    )
  }

  const fm = session.frontmatter || {}
  const events = session.events || []

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/sessions')}
            className="mb-2 text-xs text-neutral-500 transition-colors hover:text-neutral-300"
          >
            ← Sessions
          </button>
          <h1 className="text-xl font-bold text-white">{fm.title || 'Untitled'}</h1>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500">
            <span>Source: <span className="font-medium text-neutral-300">{fm.source || '-'}</span></span>
            <span>ID: <span className="font-mono text-neutral-400">{fm.id || '-'}</span></span>
            {fm.started_at && (
              <span>
                Started:{' '}
                <span className="text-neutral-300">
                  {new Date(fm.started_at).toLocaleString()}
                </span>
              </span>
            )}
            <span>Events: <span className="font-medium text-neutral-300">{events.length}</span></span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void handleCopy()}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-dark-600 bg-dark-700 px-4 text-xs font-medium text-neutral-300 transition-colors hover:bg-dark-600"
          >
            Copy
          </button>
          <button
            onClick={() => navigate(`/prepare?id=${encodeURIComponent(id || '')}`)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-dark-600 bg-dark-700 px-4 text-xs font-medium text-neutral-300 transition-colors hover:bg-dark-600"
          >
            ⊞ AI Context
          </button>
          <button
            onClick={handleExport}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-dark-600 bg-dark-700 px-4 text-xs font-medium text-neutral-300 transition-colors hover:bg-dark-600"
          >
            ↧ Export
          </button>
        </div>
      </div>

      <EventTimeline events={events} />
    </div>
  )
}
