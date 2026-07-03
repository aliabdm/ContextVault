import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function PrepareContext() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('id') || ''
  const [query, setQuery] = useState('')
  const [types, setTypes] = useState({ decision: true, problem: true, task: true })
  const [source, setSource] = useState('')
  const [since, setSince] = useState('')
  const [customSince, setCustomSince] = useState('')
  const [limit, setLimit] = useState(20)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    window.contextVault?.getSession(decodeURIComponent(sessionId)).then((session) => {
      const title = session?.frontmatter?.title
      if (title) setQuery(`Continue work from: ${title}`)
    })
  }, [sessionId])

  const generate = async () => {
    if (!query.trim() && !sessionId) return
    setLoading(true)
    setOutput('')
    const selectedTypes = Object.entries(types).filter(([, enabled]) => enabled).map(([type]) => type)
    const filters: any = { limit, types: selectedTypes }
    if (source) filters.sources = source === 'manual' ? ['manual', 'human'] : [source]
    const resolvedSince = since === 'custom' ? customSince : since
    if (resolvedSince) filters.since = resolvedSince
    const result = await window.contextVault?.prepareContext(query || 'context', filters)
    setOutput(result?.success ? (result.output || 'No matching context was generated.') : `Error: ${result?.error || 'Unable to prepare context.'}`)
    setLoading(false)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([output], { type: 'text/markdown' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'contextvault-prepared-context.md'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Prepare AI Context</h1><p className="mt-1 text-sm text-neutral-500">Build a focused, portable context package for your next agent.</p></div>
      <section className="rounded-2xl border border-dark-600 bg-dark-700/40 p-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <label className="md:col-span-2 lg:col-span-4"><span className="mb-1.5 block text-xs font-medium text-neutral-400">Next task or topic</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="e.g. Fix authentication redirect" className="filter-control" /></label>
          <label><span className="mb-1.5 block text-xs font-medium text-neutral-400">Source</span><select value={source} onChange={(event) => setSource(event.target.value)} className="filter-control"><option value="">All sources</option><option value="codex">Codex</option><option value="claude-code">Claude Code</option><option value="cursor">Cursor</option><option value="chatgpt">ChatGPT</option><option value="manual">Manual</option><option value="terminal">Terminal</option><option value="browser">Browser</option></select></label>
          <label><span className="mb-1.5 block text-xs font-medium text-neutral-400">Since</span><select value={since} onChange={(event) => setSince(event.target.value)} className="filter-control"><option value="">All time</option><option value="24h">24 hours</option><option value="7d">7 days</option><option value="14d">14 days</option><option value="30d">30 days</option><option value="custom">Custom date</option></select></label>
          {since === 'custom' && <label><span className="mb-1.5 block text-xs font-medium text-neutral-400">Start date</span><input type="date" value={customSince} onChange={(event) => setCustomSince(event.target.value)} className="filter-control" /></label>}
          <label><span className="mb-1.5 block text-xs font-medium text-neutral-400">Maximum results</span><input type="number" min="1" max="100" value={limit} onChange={(event) => setLimit(Math.max(1, Math.min(100, Number(event.target.value) || 20)))} className="filter-control" /></label>
        </div>
        <fieldset className="mt-5"><legend className="text-xs font-medium text-neutral-400">Include event types</legend><div className="mt-2 flex flex-wrap gap-4">{Object.entries(types).map(([type, checked]) => <label key={type} className="flex items-center gap-2 text-sm capitalize text-neutral-300"><input type="checkbox" checked={checked} onChange={(event) => setTypes((current) => ({ ...current, [type]: event.target.checked }))} />{type}s</label>)}</div></fieldset>
        {sessionId && <p className="mt-4 rounded-lg border border-vault-500/20 bg-vault-500/5 px-4 py-2 text-xs text-vault-300">Starting from session: {decodeURIComponent(sessionId)}</p>}
        <button onClick={() => void generate()} disabled={loading || (!query.trim() && !sessionId)} className="mt-5 rounded-xl bg-vault-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-vault-600 disabled:opacity-50">{loading ? 'Generating...' : 'Generate context package'}</button>
      </section>
      {output && <section className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-neutral-300">Generated context</h2><div className="flex gap-2"><button onClick={() => void copy()} className="rounded-lg border border-dark-600 px-3 py-2 text-xs text-neutral-300">{copied ? 'Copied' : 'Copy'}</button><button onClick={download} className="rounded-lg border border-dark-600 px-3 py-2 text-xs text-neutral-300">Export Markdown</button></div></div><pre className="max-h-[500px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-dark-600 bg-dark-900 p-4 text-xs leading-relaxed text-neutral-300">{output}</pre></section>}
    </div>
  )
}
