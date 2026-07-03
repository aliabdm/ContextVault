import { useState } from 'react'

type Status = { kind: 'idle' | 'working' | 'success' | 'error'; message: string }

function downloadMarkdown(content: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export default function VaultTools() {
  const [status, setStatus] = useState<Status>({ kind: 'idle', message: 'All operations stay on this device.' })
  const [preview, setPreview] = useState('')

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

      <div className={`rounded-xl border px-4 py-3 text-xs ${status.kind === 'error' ? 'border-red-500/30 bg-red-500/5 text-red-300' : status.kind === 'success' ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' : 'border-dark-600 text-neutral-500'}`}>
        {status.message}
      </div>

      {preview && <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-dark-600 bg-dark-900 p-4 text-xs leading-relaxed text-neutral-300">{preview}</pre>}
    </div>
  )
}
