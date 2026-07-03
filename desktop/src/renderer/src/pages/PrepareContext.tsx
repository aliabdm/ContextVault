import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function PrepareContext() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('id') || ''

  const [query, setQuery] = useState('')
  const [includeDecisions, setIncludeDecisions] = useState(true)
  const [includeProblems, setIncludeProblems] = useState(true)
  const [includeTasks, setIncludeTasks] = useState(true)
  const [since, setSince] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!query.trim() && !sessionId) return
    setLoading(true)
    setOutput('')
    setCopied(false)

    const filters: any = { limit: 20 }
    if (includeDecisions) filters.type = filters.type ? filters.type + ',decision' : 'decision'
    if (includeProblems) filters.type = filters.type ? filters.type + ',problem' : 'problem'
    if (includeTasks) filters.type = filters.type ? filters.type + ',task' : 'task'
    if (since) filters.since = since

    const result = await window.contextVault?.prepareContext(query || 'context', filters)
    if (result?.success) {
      setOutput(result.output || 'No output generated.')
    } else {
      setOutput(`Error: ${result?.error || 'Unknown error'}`)
    }
    setLoading(false)
  }

  const handleCopy = async () => {
    if (output) {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Prepare AI Context</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Generate a focused context package for your next AI agent.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-400">Search query</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What is your next task? e.g. 'Fix auth redirect'"
            className="w-full rounded-xl border border-dark-600 bg-dark-700 px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 outline-none transition-colors focus:border-vault-500/50"
          />
        </div>

        {sessionId && (
          <div className="rounded-lg border border-vault-500/20 bg-vault-500/5 px-4 py-2 text-xs text-vault-300">
            Session selected: {decodeURIComponent(sessionId)}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-400">Include in context</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={includeDecisions}
                onChange={(e) => setIncludeDecisions(e.target.checked)}
                className="rounded border-dark-500 bg-dark-700 text-vault-500 focus:ring-vault-500/50"
              />
              ✅ Decisions
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={includeProblems}
                onChange={(e) => setIncludeProblems(e.target.checked)}
                className="rounded border-dark-500 bg-dark-700 text-vault-500 focus:ring-vault-500/50"
              />
              ⚠️ Problems
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={includeTasks}
                onChange={(e) => setIncludeTasks(e.target.checked)}
                className="rounded border-dark-500 bg-dark-700 text-vault-500 focus:ring-vault-500/50"
              />
              📋 Tasks
            </label>
            <select
              value={since}
              onChange={(e) => setSince(e.target.value)}
              className="rounded-lg border border-dark-600 bg-dark-700 px-3 py-1.5 text-xs text-neutral-300 outline-none"
            >
              <option value="">All time</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="14d">Last 14 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || (!query.trim() && !sessionId)}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-vault-500 px-5 text-sm font-semibold text-white transition-all hover:bg-vault-600 disabled:opacity-50 active:scale-[0.97]"
        >
          {loading ? 'Generating...' : '⊞ Generate Context Package'}
        </button>
      </div>

      {output && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-300">Generated Context</h2>
            <button
              onClick={handleCopy}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-dark-600 bg-dark-700 px-3 text-xs font-medium text-neutral-300 transition-colors hover:bg-dark-600"
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
          <pre className="max-h-[500px] overflow-y-auto rounded-xl border border-dark-600 bg-dark-900 p-4 text-xs leading-relaxed text-neutral-300">
            {output}
          </pre>
        </div>
      )}
    </div>
  )
}
