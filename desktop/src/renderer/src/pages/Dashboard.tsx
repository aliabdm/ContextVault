import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatsCard from '../components/StatsCard'
import { announceProjectChange } from '../components/ProjectSwitcher'

interface Stats {
  sessions: number
  events: number
  decisions: number
  problems: number
  tasks: number
  memoryExists: boolean
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [projectPath, setProjectPath] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const projectName = projectPath?.split(/[\\/]/).filter(Boolean).pop() || ''

  const loadData = async () => {
    setLoading(true)
    const path = await window.contextVault?.getProjectPath()
    setProjectPath(path)
    setStats(path ? await window.contextVault?.getDashboardStats() || null : null)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleOpenProject = async () => {
    const path = await window.contextVault?.openProject()
    if (path) {
      await loadData()
      announceProjectChange()
    }
  }

  if (loading) {
    return <div className="flex h-full items-center justify-center text-sm text-neutral-500">Loading...</div>
  }

  if (!projectPath) {
    return (
      <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dark-600 bg-dark-700 text-2xl text-vault-300">CV</div>
        <h1 className="mt-5 text-2xl font-bold text-white">Welcome to ContextVault</h1>
        <p className="mt-3 max-w-lg text-sm leading-6 text-neutral-400">
          Start by choosing a project folder. ContextVault creates a local `.contextvault` vault there; you can add more projects and switch between them at any time.
        </p>
        <button onClick={handleOpenProject} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-vault-500 px-6 text-sm font-semibold text-white shadow-lg shadow-vault-500/20 transition-all hover:bg-vault-600 active:scale-[0.97]">
          + Add your first project
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500" title={projectPath}>{projectName} <span className="text-neutral-600">· Local project</span></p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleOpenProject} className="inline-flex h-10 items-center gap-2 rounded-xl border border-dark-600 bg-dark-700 px-4 text-xs font-medium text-neutral-300 transition-colors hover:bg-dark-600">
            + Add project
          </button>
          <button onClick={() => navigate('/record')} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white shadow-lg shadow-red-500/10 transition-colors hover:bg-red-600">
            <span className="h-2.5 w-2.5 rounded-full bg-white" /> Start recording
          </button>
        </div>
      </div>

      {(stats?.sessions ?? 0) === 0 && (
        <section className="rounded-2xl border border-vault-500/25 bg-gradient-to-br from-vault-500/10 to-dark-700/40 p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-vault-300">Your first session</span>
              <h2 className="mt-2 text-xl font-bold text-white">Record useful context in three steps</h2>
              <ol className="mt-4 grid gap-3 text-sm text-neutral-400 sm:grid-cols-3">
                <li><strong className="block text-neutral-200">1. Start</strong>Name the session and choose Codex, Claude Code, Cursor, or another source.</li>
                <li><strong className="block text-neutral-200">2. Capture</strong>Add prompts, agent output, decisions, tasks, problems, and notes.</li>
                <li><strong className="block text-neutral-200">3. Save</strong>Finish the session; it appears here and remains local Markdown.</li>
              </ol>
            </div>
            <button onClick={() => navigate('/record')} className="shrink-0 rounded-xl bg-vault-500 px-5 py-3 text-sm font-semibold text-white hover:bg-vault-600">
              Record first session
            </button>
          </div>
          <p className="mt-5 border-t border-dark-600/70 pt-4 text-xs text-neutral-500">
            Terminal workflow also stays available: <code className="text-vault-300">contextvault record</code>
          </p>
        </section>
      )}

      <div className="grid grid-cols-3 gap-4">
        <StatsCard label="Sessions" value={stats?.sessions ?? 0} icon="☰" color="vault" />
        <StatsCard label="Events" value={stats?.events ?? 0} icon="↗" color="blue" />
        <StatsCard label="Decisions" value={stats?.decisions ?? 0} icon="✓" color="green" />
        <StatsCard label="Problems" value={stats?.problems ?? 0} icon="!" color="red" />
        <StatsCard label="Tasks" value={stats?.tasks ?? 0} icon="□" color="orange" />
        <StatsCard label="Memory" value={stats?.memoryExists ? '✓' : '—'} icon="◇" color="purple" />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-400">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <ActionButton icon="●" label="Record Session" onClick={() => navigate('/record')} accent />
          <ActionButton icon="⌕" label="Search" onClick={() => navigate('/search')} />
          <ActionButton icon="⊞" label="Prepare Context" onClick={() => navigate('/prepare')} />
          <ActionButton icon="☰" label="Sessions" onClick={() => navigate('/sessions')} />
          <ActionButton icon="↓" label="Import Browser Export" onClick={async () => { await window.contextVault?.importConversation(); loadData() }} />
          <ActionButton icon="□" label="Tasks" onClick={() => navigate('/search?type=task')} />
          <ActionButton icon="✓" label="Decisions" onClick={() => navigate('/search?type=decision')} />
          <ActionButton icon="!" label="Problems" onClick={() => navigate('/search?type=problem')} />
          <ActionButton icon="◇" label="Vault Tools" onClick={() => navigate('/tools')} />
        </div>
      </div>
    </div>
  )
}

function ActionButton({ icon, label, onClick, accent = false }: { icon: string; label: string; onClick: () => void; accent?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all active:scale-[0.98] ${accent ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10' : 'border-dark-600 bg-dark-700/50 hover:border-dark-500 hover:bg-dark-700'}`}
    >
      <span className={`text-xl ${accent ? 'text-red-400' : ''}`}>{icon}</span>
      <span className="text-sm font-medium text-neutral-200">{label}</span>
    </button>
  )
}
