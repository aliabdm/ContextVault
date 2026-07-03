import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

function exportResults(results: any[]) {
  const body = results.map((entry) => `## ${entry.sessionTitle || 'Context result'}\n\n- Type: ${entry.type}\n- Source: ${entry.platform || entry.source || 'unknown'}\n- Date: ${entry.createdAt || ''}\n\n${entry.content || ''}`).join('\n\n')
  const url = URL.createObjectURL(new Blob([`# ContextVault Search Results\n\n${body}\n`], { type: 'text/markdown' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'contextvault-search.md'
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function Search() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '')
  const [sourceFilter, setSourceFilter] = useState('')
  const [sinceFilter, setSinceFilter] = useState('')
  const [customSince, setCustomSince] = useState('')
  const [limit, setLimit] = useState(20)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    setError('')
    try {
      const filters: any = { limit }
      if (typeFilter) filters.types = [typeFilter]
      if (sourceFilter) filters.sources = sourceFilter === 'manual' ? ['manual', 'human'] : [sourceFilter]
      const resolvedSince = sinceFilter === 'custom' ? customSince : sinceFilter
      if (resolvedSince) filters.since = resolvedSince
      const response = await window.contextVault?.search(query.trim(), filters)
      setResults(response?.results || [])
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Search failed.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const copyResults = async () => {
    await navigator.clipboard.writeText(results.map((entry) => `${entry.type}: ${entry.content}`).join('\n\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Search</h1><p className="mt-1 text-sm text-neutral-500">Search every session and event with package-equivalent filters.</p></div>
      <section className="rounded-2xl border border-dark-600 bg-dark-700/40 p-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <label className="md:col-span-2 lg:col-span-5"><span className="mb-1.5 block text-xs font-medium text-neutral-400">Search query</span><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void handleSearch() }} placeholder="e.g. auth middleware" className="w-full rounded-xl border border-dark-600 bg-dark-800 px-4 py-2.5 text-sm text-neutral-200 outline-none focus:border-vault-500/60" /></label>
          <Filter label="Type"><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="filter-control"><option value="">All types</option><option value="decision">Decision</option><option value="problem">Problem</option><option value="task">Task</option><option value="note">Note</option><option value="user">User</option><option value="agent">Agent</option></select></Filter>
          <Filter label="Source"><select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} className="filter-control"><option value="">All sources</option><option value="codex">Codex</option><option value="claude-code">Claude Code</option><option value="cursor">Cursor</option><option value="chatgpt">ChatGPT</option><option value="manual">Manual</option><option value="terminal">Terminal</option><option value="browser">Browser</option></select></Filter>
          <Filter label="Since"><select value={sinceFilter} onChange={(event) => setSinceFilter(event.target.value)} className="filter-control"><option value="">All time</option><option value="24h">24 hours</option><option value="7d">7 days</option><option value="14d">14 days</option><option value="30d">30 days</option><option value="custom">Custom date</option></select></Filter>
          {sinceFilter === 'custom' && <Filter label="Start date"><input type="date" value={customSince} onChange={(event) => setCustomSince(event.target.value)} className="filter-control" /></Filter>}
          <Filter label="Limit"><input type="number" min="1" max="100" value={limit} onChange={(event) => setLimit(Math.max(1, Math.min(100, Number(event.target.value) || 20)))} className="filter-control" /></Filter>
        </div>
        <button onClick={() => void handleSearch()} disabled={loading || !query.trim()} className="mt-5 rounded-xl bg-vault-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-vault-600 disabled:opacity-50">{loading ? 'Searching...' : 'Search context'}</button>
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      </section>
      {searched && !loading && results.length === 0 && !error && <div className="rounded-xl border border-dashed border-dark-600 py-14 text-center text-sm text-neutral-500">No results found. Try broader filters or record more context.</div>}
      {results.length > 0 && <section className="space-y-3">
        <div className="flex items-center justify-between"><p className="text-sm text-neutral-400">{results.length} results</p><div className="flex gap-2"><button onClick={() => void copyResults()} className="rounded-lg border border-dark-600 px-3 py-2 text-xs text-neutral-300">{copied ? 'Copied' : 'Copy'}</button><button onClick={() => exportResults(results)} className="rounded-lg border border-dark-600 px-3 py-2 text-xs text-neutral-300">Export Markdown</button></div></div>
        {results.map((entry, index) => <article key={entry.id || `${entry.sessionId}-${index}`} className="rounded-xl border border-dark-600 bg-dark-700/45 p-4"><div className="flex flex-wrap gap-2 text-[11px] text-neutral-500"><span className="rounded bg-vault-500/10 px-2 py-1 font-semibold uppercase text-vault-300">{entry.type}</span><span>{entry.platform || entry.source || 'unknown'}</span><span>· {entry.sessionTitle || 'Untitled session'}</span>{entry.score != null && <span className="ml-auto">Score {Number(entry.score).toFixed(1)}</span>}</div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-300">{entry.content}</p></article>)}
      </section>}
    </div>
  )
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return <label><span className="mb-1.5 block text-xs font-medium text-neutral-400">{label}</span>{children}</label>
}
