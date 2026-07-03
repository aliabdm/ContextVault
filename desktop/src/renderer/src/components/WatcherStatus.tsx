import { useCallback, useEffect, useState } from 'react'

type WatcherState = {
  watching: boolean
  projectPath: string | null
  lastUpdatedAt: string | null
  events: number
  sources: string[]
}

export default function WatcherStatus() {
  const [status, setStatus] = useState<WatcherState | null>(null)

  const refresh = useCallback(async () => {
    const next = await window.contextVault?.getWatcherStatus()
    if (next) setStatus(next)
  }, [])

  useEffect(() => {
    void refresh()
    const removeListener = window.contextVault?.onVaultChanged(() => void refresh())
    return () => removeListener?.()
  }, [refresh])

  if (!status?.projectPath) return null

  return (
    <section aria-label="Vault watcher status" className="grid gap-3 rounded-xl border border-dark-600 bg-dark-900/45 p-4 sm:grid-cols-4">
      <StatusItem label="Sync status" value={status.watching ? 'Watching project' : 'Watcher paused'} active={status.watching} />
      <StatusItem label="Last updated" value={status.lastUpdatedAt ? new Date(status.lastUpdatedAt).toLocaleString() : 'Waiting for changes'} />
      <StatusItem label="Events found" value={String(status.events)} />
      <StatusItem label="Sources detected" value={status.sources.length ? status.sources.join(', ') : 'None yet'} />
    </section>
  )
}

function StatusItem({ label, value, active = false }: { label: string; value: string; active?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600">{label}</p>
      <p className={`mt-1 truncate text-xs font-medium ${active ? 'text-emerald-300' : 'text-neutral-300'}`} title={value}>
        {active && <span aria-hidden="true" className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />}
        {value}
      </p>
    </div>
  )
}
