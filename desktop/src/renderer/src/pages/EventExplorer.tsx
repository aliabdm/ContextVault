import { useState } from 'react'

type ExplorerMode = 'history' | 'decisions' | 'problems' | 'tasks' | 'retrieve'

type EventExplorerProps = {
  mode: ExplorerMode
}

const modeConfig = {
  history: { title: 'Project History', description: 'Review what happened across every recorded source.', fixedType: '' },
  decisions: { title: 'Decisions', description: 'Find durable choices and the context behind them.', fixedType: 'decision' },
  problems: { title: 'Problems', description: 'Inspect captured bugs, blockers, and failed attempts.', fixedType: 'problem' },
  tasks: { title: 'Tasks', description: 'Review follow-ups and action items captured across the project.', fixedType: 'task' },
  retrieve: { title: 'Retrieve Context', description: 'Rank the most relevant project evidence for a task.', fixedType: '' },
} as const

const sources = [
  ['', 'All sources'], ['codex', 'Codex'], ['claude-code', 'Claude Code'], ['cursor', 'Cursor'],
  ['chatgpt', 'ChatGPT'], ['manual', 'Manual'], ['terminal', 'Terminal'], ['browser', 'Browser'],
] as const

const eventTypes = [
  ['', 'All types'], ['decision', 'Decision'], ['problem', 'Problem'], ['task', 'Task'],
  ['note', 'Note'], ['user', 'User'], ['agent', 'Agent'],
] as const

function downloadResults(title: string, entries: any[]) {
  const lines = [`# ${title}`, '', `Exported: ${new Date().toISOString()}`, '']
  for (const entry of entries) {
    lines.push(`## ${entry.sessionTitle || 'Untitled session'}`, '')
    lines.push(`- source: ${entry.platform || entry.source || 'unknown'}`)
    lines.push(`- type: ${entry.type || 'event'}`)
    lines.push(`- date: ${entry.createdAt || ''}`, '')
    lines.push(entry.content || '', '')
  }
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/markdown' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${title.toLowerCase().replace(/\s+/g, '-')}.md`
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function EventExplorer({ mode }: EventExplorerProps) {
  const config = modeConfig[mode]
  const [query, setQuery] = useState('')
  const [source, setSource] = useState('')
  const [type, setType] = useState<string>(config.fixedType)
  const [since, setSince] = useState('14d')
  const [customSince, setCustomSince] = useState('')
  const [limit, setLimit] = useState(20)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [ran, setRan] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const run = async () => {
    if (mode === 'retrieve' && !query.trim()) {
      setError('Enter a query to retrieve relevant context.')
      return
    }
    setLoading(true)
    setRan(true)
    setError('')
    const filters: any = { limit, query: query.trim() }
    const resolvedSince = since === 'custom' ? customSince : since
    if (resolvedSince) filters.since = resolvedSince
    if (source) filters.sources = source === 'manual' ? ['manual', 'human'] : [source]
    if (type) filters.types = [type]

    if (mode === 'retrieve') {
      const response = await window.contextVault?.search(query.trim(), filters)
      setResults(response?.results || [])
    } else {
      const response = await window.contextVault?.listEvents(config.fixedType, filters)
      if (!response?.success) setError(response?.error || 'Unable to load events.')
      setResults((response?.events || []).slice(0, limit))
    }
    setLoading(false)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(results.map((entry) => `${entry.type}: ${entry.content}`).join('\n\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const grouped = results.reduce<Record<string, any[]>>((groups, entry) => {
    const date = entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'Unknown date'
    groups[date] = [...(groups[date] || []), entry]
    return groups
  }, {})

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{config.title}</h1>
        <p className="mt-1 text-sm text-neutral-500">{config.description}</p>
      </div>

      <section className="rounded-2xl border border-dark-600 bg-dark-700/40 p-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="lg:col-span-2">
            <span className="mb-1.5 block text-xs font-medium text-neutral-400">{mode === 'retrieve' ? 'What context do you need?' : 'Keyword or topic'}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={mode === 'retrieve' ? 'e.g. authentication decisions' : 'Optional topic filter'} className="w-full rounded-xl border border-dark-600 bg-dark-800 px-4 py-2.5 text-sm text-neutral-200 outline-none focus:border-vault-500/60" />
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-medium text-neutral-400">Source</span>
            <select value={source} onChange={(event) => setSource(event.target.value)} className="w-full rounded-xl border border-dark-600 bg-dark-800 px-3 py-2.5 text-sm text-neutral-200 outline-none">
              {sources.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          {(mode === 'history' || mode === 'retrieve') && (
            <label>
              <span className="mb-1.5 block text-xs font-medium text-neutral-400">Event type</span>
              <select value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-xl border border-dark-600 bg-dark-800 px-3 py-2.5 text-sm text-neutral-200 outline-none">
                {eventTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          )}
          <label>
            <span className="mb-1.5 block text-xs font-medium text-neutral-400">Since</span>
            <select value={since} onChange={(event) => setSince(event.target.value)} className="w-full rounded-xl border border-dark-600 bg-dark-800 px-3 py-2.5 text-sm text-neutral-200 outline-none">
              <option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option><option value="14d">Last 14 days</option><option value="30d">Last 30 days</option><option value="">All time</option><option value="custom">Custom date</option>
            </select>
          </label>
          {since === 'custom' && (
            <label>
              <span className="mb-1.5 block text-xs font-medium text-neutral-400">Start date</span>
              <input type="date" value={customSince} onChange={(event) => setCustomSince(event.target.value)} className="w-full rounded-xl border border-dark-600 bg-dark-800 px-3 py-2.5 text-sm text-neutral-200 outline-none" />
            </label>
          )}
          <label>
            <span className="mb-1.5 block text-xs font-medium text-neutral-400">Maximum results</span>
            <input type="number" min="1" max="100" value={limit} onChange={(event) => setLimit(Math.max(1, Math.min(100, Number(event.target.value) || 20)))} className="w-full rounded-xl border border-dark-600 bg-dark-800 px-3 py-2.5 text-sm text-neutral-200 outline-none" />
          </label>
          {mode === 'problems' && (
            <label>
              <span className="mb-1.5 block text-xs font-medium text-neutral-400">Status</span>
              <select disabled className="w-full rounded-xl border border-dark-600 bg-dark-800 px-3 py-2.5 text-sm text-neutral-500"><option>All (status not tracked yet)</option></select>
            </label>
          )}
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button onClick={() => void run()} disabled={loading} className="rounded-xl bg-vault-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-vault-600 disabled:opacity-50">{loading ? 'Loading...' : `View ${config.title}`}</button>
          <span className="text-xs text-neutral-600">No command syntax required</span>
        </div>
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </section>

      {ran && !loading && results.length === 0 && !error && <div className="rounded-xl border border-dashed border-dark-600 py-14 text-center text-sm text-neutral-500">No matching context yet. Adjust the filters or record more project context.</div>}

      {results.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-400">{results.length} result{results.length === 1 ? '' : 's'}</p>
            <div className="flex gap-2">
              <button onClick={() => void copy()} className="rounded-lg border border-dark-600 px-3 py-2 text-xs text-neutral-300 hover:bg-dark-700">{copied ? 'Copied' : 'Copy results'}</button>
              <button onClick={() => downloadResults(config.title, results)} className="rounded-lg border border-dark-600 px-3 py-2 text-xs text-neutral-300 hover:bg-dark-700">Export Markdown</button>
            </div>
          </div>
          {Object.entries(grouped).map(([date, entries]) => (
            <div key={date} className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{date}</h2>
              {entries.map((entry) => (
                <article key={entry.id || `${entry.sessionId}-${entry.createdAt}-${entry.type}`} className="rounded-xl border border-dark-600 bg-dark-700/45 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                    <span className="rounded-md bg-vault-500/10 px-2 py-1 font-semibold uppercase text-vault-300">{entry.type}</span>
                    <span>{entry.platform || entry.source || 'unknown source'}</span>
                    <span>·</span><span>{entry.sessionTitle || 'Untitled session'}</span>
                    {entry.score != null && <span className="ml-auto">Relevance {Number(entry.score).toFixed(1)}</span>}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-300">{entry.content}</p>
                </article>
              ))}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
