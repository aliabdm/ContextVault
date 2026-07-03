import { useState } from 'react'
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

      <section className="rounded-2xl border border-vault-500/25 bg-vault-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Every package command</h2>
            <p className="mt-1 text-xs leading-5 text-neutral-500">These buttons execute the bundled <code>contextvault</code> CLI in the active project. Arguments use the same syntax as the terminal package.</p>
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

      <div className={`rounded-xl border px-4 py-3 text-xs ${status.kind === 'error' ? 'border-red-500/30 bg-red-500/5 text-red-300' : status.kind === 'success' ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' : 'border-dark-600 text-neutral-500'}`}>
        {status.message}
      </div>

      {preview && <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-dark-600 bg-dark-900 p-4 text-xs leading-relaxed text-neutral-300">{preview}</pre>}
    </div>
  )
}
