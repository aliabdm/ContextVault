import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function Search() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '')
  const [sourceFilter, setSourceFilter] = useState('')
  const [sinceFilter, setSinceFilter] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    const filters: any = {}
    if (typeFilter) filters.types = [typeFilter]
    if (sourceFilter) filters.sources = [sourceFilter]
    if (sinceFilter) filters.since = sinceFilter
    const res = await window.contextVault?.search(query, filters)
    setResults(res)
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Search</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Retrieve relevant context across sessions and events.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search query e.g. 'auth middleware'..."
            className="flex-1 rounded-xl border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 outline-none transition-colors focus:border-vault-500/50"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-vault-500 px-5 text-sm font-semibold text-white transition-all hover:bg-vault-600 disabled:opacity-50 active:scale-[0.97]"
          >
            {loading ? '...' : '⌕ Search'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-dark-600 bg-dark-700 px-3 py-1.5 text-xs text-neutral-300 outline-none"
          >
            <option value="">All types</option>
            <option value="decision">Decision</option>
            <option value="task">Task</option>
            <option value="problem">Problem</option>
            <option value="note">Note</option>
            <option value="user">User</option>
            <option value="agent">Agent</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-lg border border-dark-600 bg-dark-700 px-3 py-1.5 text-xs text-neutral-300 outline-none"
          >
            <option value="">All sources</option>
            <option value="codex">Codex</option>
            <option value="claude-code">Claude Code</option>
            <option value="terminal">Terminal</option>
            <option value="browser">Browser</option>
            <option value="human">Human</option>
          </select>
          <select
            value={sinceFilter}
            onChange={(e) => setSinceFilter(e.target.value)}
            className="rounded-lg border border-dark-600 bg-dark-700 px-3 py-1.5 text-xs text-neutral-300 outline-none"
          >
            <option value="">All time</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="14d">Last 14 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-neutral-500">Searching...</div>
        </div>
      )}

      {searched && !loading && !results?.results?.length && (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-dark-600 py-16 text-sm text-neutral-500">
          No results found
        </div>
      )}

      {results?.results?.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-neutral-500">
            {results.results.length} result{results.results.length !== 1 ? 's' : ''}
          </p>
          {results.results.map((entry: any, idx: number) => (
            <div
              key={entry.id || idx}
              className="rounded-xl border border-dark-600 bg-dark-700/50 p-4 transition-colors hover:border-dark-500"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-md bg-vault-500/10 px-2 py-0.5 text-xs font-medium text-vault-300">
                  {entry.type}
                </span>
                <span className="text-xs text-neutral-500">Score: {entry.score?.toFixed(1)}</span>
                {entry.sessionTitle && (
                  <span className="text-xs text-neutral-500">— {entry.sessionTitle}</span>
                )}
                {entry.platform && (
                  <span className="text-xs text-neutral-500">({entry.platform})</span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-neutral-300">
                {entry.content?.length > 300
                  ? entry.content.slice(0, 300) + '...'
                  : entry.content}
              </p>
              {entry.createdAt && (
                <p className="mt-1 text-xs text-neutral-600">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
