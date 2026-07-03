import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatsCard from '../components/StatsCard'

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
    if (path) {
      const s = await window.contextVault?.getDashboardStats()
      setStats(s)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleOpenProject = async () => {
    const path = await window.contextVault?.openProject()
    if (path) loadData()
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-neutral-500">Loading...</div>
      </div>
    )
  }

  if (!projectPath) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dark-600 bg-dark-700 text-3xl">
          ◉
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome to ContextVault</h1>
        <p className="max-w-md text-center text-sm text-neutral-400">
          Open a project folder to start managing your AI chats, coding agent sessions, and project memory.
        </p>
        <button
          onClick={handleOpenProject}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-vault-500 px-6 text-sm font-semibold text-white shadow-lg shadow-vault-500/20 transition-all hover:bg-vault-600 active:scale-[0.97]"
        >
          ◉ Open Project
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500" title={projectPath}>{projectName} <span className="text-neutral-600">· Local project</span></p>
        </div>
        <button
          onClick={handleOpenProject}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-dark-600 bg-dark-700 px-4 text-xs font-medium text-neutral-300 transition-colors hover:bg-dark-600"
        >
          ◉ Change Project
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard label="Sessions" value={stats?.sessions ?? 0} icon="☰" color="vault" />
        <StatsCard label="Events" value={stats?.events ?? 0} icon="↗" color="blue" />
        <StatsCard label="Decisions" value={stats?.decisions ?? 0} icon="✅" color="green" />
        <StatsCard label="Problems" value={stats?.problems ?? 0} icon="⚠️" color="red" />
        <StatsCard label="Tasks" value={stats?.tasks ?? 0} icon="📋" color="orange" />
        <StatsCard label="Memory" value={stats?.memoryExists ? '✓' : '—'} icon="🧠" color="purple" />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-400">
          Quick Actions
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <ActionButton icon="⌕" label="Search" onClick={() => navigate('/search')} />
          <ActionButton icon="⊞" label="Prepare Context" onClick={() => navigate('/prepare')} />
          <ActionButton icon="☰" label="Sessions" onClick={() => navigate('/sessions')} />
          <ActionButton icon="📥" label="Import" onClick={async () => {
            await window.contextVault?.importConversation()
            loadData()
          }} />
          <ActionButton icon="📋" label="Tasks" onClick={() => navigate('/search?type=task')} />
          <ActionButton icon="✅" label="Decisions" onClick={() => navigate('/search?type=decision')} />
          <ActionButton icon="⚠️" label="Problems" onClick={() => navigate('/search?type=problem')} />
          <ActionButton icon="⚙" label="Settings" onClick={() => navigate('/settings')} />
          <ActionButton icon="◇" label="Vault Tools" onClick={() => navigate('/tools')} />
        </div>
      </div>
    </div>
  )
}

function ActionButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-dark-600 bg-dark-700/50 p-4 text-left transition-all hover:border-dark-500 hover:bg-dark-700 active:scale-[0.98]"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium text-neutral-200">{label}</span>
    </button>
  )
}
