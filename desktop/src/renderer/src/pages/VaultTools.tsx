import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Status = { kind: 'idle' | 'working' | 'success' | 'error'; message: string }

const cliCommands = [
  ['record', 'Interactive recorder', 'Runs the real package recorder inside Desktop.'],
  ['init', 'Initialize vault', 'Create the package storage structure.'],
  ['list', 'List sessions', 'Print every saved package session.'],
  ['show', 'Show session', 'Show latest or a session ID.'],
  ['export', 'Export context', 'Run the package Markdown export.'],
  ['search', 'Search', 'Search package sessions.'],
  ['import', 'Import', 'Import a Markdown or ZIP path.'],
  ['index', 'Build index', 'Run the package index command.'],
  ['retrieve', 'Retrieve', 'Retrieve ranked project evidence.'],
  ['prepare', 'Prepare', 'Generate agent-ready context.'],
  ['memory', 'Memory', 'Refresh durable project memory.'],
  ['link', 'Link sessions', 'Link two session IDs.'],
  ['timeline', 'Timeline', 'Generate the project timeline.'],
  ['history', 'History', 'Render chronological history.'],
  ['tasks', 'Tasks', 'List captured tasks.'],
  ['decisions', 'Decisions', 'List captured decisions.'],
  ['problems', 'Problems', 'List captured problems.'],
] as const

function parseCliArgs(value: string): string[] {
  return (value.match(/"[^"]*"|'[^']*'|\S+/g) || []).map((part) => part.replace(/^("|')|("|')$/g, ''))
}

function downloadMarkdown(content: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function VaultTools() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>({ kind: 'idle', message: 'All operations stay on this device.' })
  const [preview, setPreview] = useState('')
  const [selectedCommand, setSelectedCommand] = useState('list')
  const [cliArgs, setCliArgs] = useState('')
  const [sessions, setSessions] = useState<any[]>([])
  const [linkFrom, setLinkFrom] = useState('')
  const [linkTo, setLinkTo] = useState('')
  const [relationship, setRelationship] = useState('related')

  useEffect(() => {
    window.contextVault?.listSessions().then((items) => {
      const list = items || []
      setSessions(list)
      setLinkFrom(list[0]?.id || '')
      setLinkTo(list[1]?.id || '')
    })
  }, [])

  const run = async (label: string, action: () => Promise<any>, onSuccess?: (result: any) => void) => {
    setStatus({ kind: 'working', message: `${label}...` })
    setPreview('')
    try {
      const result = await action()
      if (!result?.success) throw new Error(result?.error || `${label} failed`)
      onSuccess?.(result)
      setStatus({ kind: 'success', message: `${label} completed.` })
    } catch (error) {
      setStatus({ kind: 'error', message: error instanceof Error ? error.message : String(error) })
    }
  }

  const tools = [
    {
      title: 'Initialize / repair vault',
      description: 'Create any missing package folders and verify the active project is ready.',
      action: () => run('Initializing vault', () => window.contextVault!.runCli('init'), (r) => setPreview(r.output || 'Vault is ready.')),
      label: 'Initialize Vault',
    },
    {
      title: 'Import conversation export',
      description: 'Choose a supported Markdown or ZIP export and add it to this project.',
      action: () => run('Importing conversation', () => window.contextVault!.importConversation(), (r) => setPreview(JSON.stringify(r, null, 2))),
      label: 'Choose Import File',
    },
    {
      title: 'Rebuild unified index',
      description: 'Normalize terminal sessions and browser imports into one searchable index.',
      action: () => run('Rebuilding index', () => window.contextVault!.rebuildIndex(), (r) => setStatus({ kind: 'success', message: `Indexed ${r.sessions} sessions and ${r.events} events.` })),
      label: 'Rebuild Index',
    },
    {
      title: 'Refresh project memory',
      description: 'Update durable memory from recorded decisions, tasks, and unresolved problems.',
      action: () => run('Updating memory', () => window.contextVault!.updateMemory(), (r) => setPreview(r.content)),
      label: 'Update Memory',
    },
    {
      title: 'Generate timeline',
      description: 'Create a chronological Markdown history across every captured surface.',
      action: () => run('Generating timeline', () => window.contextVault!.buildTimeline(), (r) => setPreview(r.content)),
      label: 'Build Timeline',
    },
    {
      title: 'Export complete vault',
      description: 'Download project memory and all sessions as one portable Markdown file.',
      action: () => run('Preparing full export', () => window.contextVault!.exportAll(), (r) => downloadMarkdown(r.content, r.filename)),
      label: 'Export All',
    },
  ]

  const copyPreview = async () => {
    await navigator.clipboard.writeText(preview)
    setStatus({ kind: 'success', message: 'Result copied to clipboard.' })
  }

  const runPackageCommand = async () => {
    if (selectedCommand === 'record') {
      navigate('/record')
      return
    }
    setStatus({ kind: 'working', message: `Running contextvault ${selectedCommand}...` })
    setPreview('')
    const result = await window.contextVault?.runCli(selectedCommand, parseCliArgs(cliArgs))
    if (!result?.success) {
      setStatus({ kind: 'error', message: result?.error || `${selectedCommand} failed.` })
      setPreview(result?.output || '')
      return
    }
    setStatus({ kind: 'success', message: `contextvault ${selectedCommand} completed.` })
    setPreview(result.output || '(command completed without text output)')
  }

  const linkSessions = async () => {
    if (!linkFrom || !linkTo || linkFrom === linkTo) {
      setStatus({ kind: 'error', message: 'Choose two different sessions to link.' })
      return
    }
    await run('Linking sessions', () => window.contextVault!.runCli('link', [linkFrom, linkTo, relationship]), (result) => setPreview(result.output || `Linked ${linkFrom} to ${linkTo}.`))
  }

  const workflows = [
    ['/record', 'Record', 'Capture a package-backed session'], ['/sessions', 'Sessions', 'List, inspect, show, and export'],
    ['/history', 'History', 'Chronological project activity'], ['/decisions', 'Decisions', 'Filter durable choices'],
    ['/problems', 'Problems', 'Inspect blockers and failures'], ['/tasks', 'Tasks', 'Review follow-up work'],
    ['/retrieve', 'Retrieve', 'Rank relevant evidence'], ['/search', 'Search', 'Search with structured filters'],
    ['/prepare', 'Prepare', 'Build agent-ready context'],
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vault Tools</h1>
          <p className="mt-1 text-sm text-neutral-500">The desktop control surface for the ContextVault engine.</p>
        </div>
        <button onClick={() => window.contextVault?.openVaultFolder()} className="rounded-lg border border-dark-600 bg-dark-700 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-dark-600">
          Open .contextvault
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {tools.map((tool) => (
          <section key={tool.title} className="flex min-h-44 flex-col rounded-xl border border-dark-600 bg-dark-700/40 p-5">
            <h2 className="text-sm font-semibold text-white">{tool.title}</h2>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-neutral-500">{tool.description}</p>
            <button disabled={status.kind === 'working'} onClick={tool.action} className="mt-4 w-fit rounded-lg bg-vault-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-vault-600 disabled:opacity-50">
              {tool.label}
            </button>
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-dark-600 bg-dark-700/25 p-5">
        <h2 className="text-sm font-semibold text-white">GUI workflows</h2>
        <p className="mt-1 text-xs text-neutral-500">Common package features have dedicated screens, filters, results, and export actions.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {workflows.map(([path, label, description]) => <button key={path} onClick={() => navigate(path)} className="rounded-xl border border-dark-600 bg-dark-800/60 p-3 text-left hover:border-vault-500/40"><span className="block text-xs font-semibold text-neutral-200">{label}</span><span className="mt-1 block text-[11px] text-neutral-600">{description}</span></button>)}
        </div>
      </section>

      <section className="rounded-2xl border border-dark-600 bg-dark-700/25 p-5">
        <h2 className="text-sm font-semibold text-white">Link sessions</h2>
        <p className="mt-1 text-xs text-neutral-500">Create an explicit relationship without typing session IDs or command arguments.</p>
        {sessions.length < 2 ? <p className="mt-4 rounded-xl border border-dashed border-dark-600 py-6 text-center text-xs text-neutral-500">Record at least two sessions before linking them.</p> : <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label><span className="mb-1.5 block text-xs text-neutral-400">From session</span><select value={linkFrom} onChange={(event) => setLinkFrom(event.target.value)} className="filter-control">{sessions.map((session) => <option key={session.id} value={session.id}>{session.title || session.id}</option>)}</select></label>
          <label><span className="mb-1.5 block text-xs text-neutral-400">To session</span><select value={linkTo} onChange={(event) => setLinkTo(event.target.value)} className="filter-control">{sessions.map((session) => <option key={session.id} value={session.id}>{session.title || session.id}</option>)}</select></label>
          <label><span className="mb-1.5 block text-xs text-neutral-400">Relationship</span><input value={relationship} onChange={(event) => setRelationship(event.target.value)} className="filter-control" /></label>
          <button disabled={status.kind === 'working'} onClick={() => void linkSessions()} className="w-fit rounded-xl bg-vault-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-vault-600 disabled:opacity-50">Link sessions</button>
        </div>}
      </section>

      <details className="rounded-2xl border border-dark-600 bg-dark-900/40 p-5">
        <summary className="cursor-pointer text-sm font-semibold text-neutral-300">Advanced CLI Mode</summary>
        <p className="mt-2 text-xs leading-5 text-neutral-600">Optional power-user fallback. The main product workflows above do not require command syntax.</p>
        <section className="mt-4 border-t border-dark-600 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Raw package command runner</h2>
            <p className="mt-1 text-xs leading-5 text-neutral-500">Execute the bundled <code>contextvault</code> CLI directly when you need an uncommon flag.</p>
          </div>
          <code className="rounded-lg border border-dark-600 bg-dark-900 px-3 py-2 text-xs text-vault-300">contextvault {selectedCommand} {cliArgs}</code>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {cliCommands.map(([command, label, description]) => (
            <button
              key={command}
              onClick={() => {
                setSelectedCommand(command)
                setStatus({ kind: 'idle', message: description })
                if (command === 'record') navigate('/record')
              }}
              className={`rounded-xl border px-3 py-3 text-left transition-colors ${selectedCommand === command ? 'border-vault-500/50 bg-vault-500/15' : 'border-dark-600 bg-dark-800/60 hover:border-dark-500'}`}
            >
              <span className="block text-xs font-semibold text-neutral-200">{label}</span>
              <span className="mt-1 block font-mono text-[10px] text-neutral-600">{command}</span>
            </button>
          ))}
        </div>

        {selectedCommand !== 'record' && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={cliArgs}
              onChange={(event) => setCliArgs(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') void runPackageCommand() }}
              placeholder='Arguments, e.g. "auth middleware" --since 14d'
              aria-label="Package command arguments"
              className="min-w-0 flex-1 rounded-xl border border-dark-600 bg-dark-900 px-4 py-2.5 font-mono text-xs text-neutral-200 outline-none placeholder:text-neutral-700 focus:border-vault-500/60"
            />
            <button disabled={status.kind === 'working'} onClick={() => void runPackageCommand()} className="rounded-xl bg-vault-500 px-5 py-2.5 text-xs font-semibold text-white hover:bg-vault-600 disabled:opacity-50">
              Run command
            </button>
          </div>
        )}
        </section>
      </details>

      <div className={`rounded-xl border px-4 py-3 text-xs ${status.kind === 'error' ? 'border-red-500/30 bg-red-500/5 text-red-300' : status.kind === 'success' ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' : 'border-dark-600 text-neutral-500'}`}>
        {status.message}
      </div>

      {preview && <section className="space-y-2"><div className="flex justify-end gap-2"><button onClick={() => void copyPreview()} className="rounded-lg border border-dark-600 px-3 py-2 text-xs text-neutral-300">Copy result</button><button onClick={() => downloadMarkdown(preview, 'contextvault-tool-result.md')} className="rounded-lg border border-dark-600 px-3 py-2 text-xs text-neutral-300">Export result</button></div><pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-dark-600 bg-dark-900 p-4 text-xs leading-relaxed text-neutral-300">{preview}</pre></section>}
    </div>
  )
}
