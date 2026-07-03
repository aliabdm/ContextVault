import { useEffect, useState } from 'react'

type Project = {
  path: string
  name: string
  active: boolean
}

export function announceProjectChange() {
  window.dispatchEvent(new CustomEvent('contextvault:project-changed'))
}

export default function ProjectSwitcher() {
  const [projects, setProjects] = useState<Project[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const activeProject = projects.find((project) => project.active)

  const load = async () => {
    const nextProjects = await window.contextVault?.listProjects()
    setProjects(nextProjects || [])
  }

  useEffect(() => {
    load()
    const handleProjectChange = () => load()
    window.addEventListener('contextvault:project-changed', handleProjectChange)
    return () => window.removeEventListener('contextvault:project-changed', handleProjectChange)
  }, [])

  const switchProject = async (projectPath: string) => {
    if (!projectPath || projectPath === activeProject?.path) return
    setBusy(true)
    setError('')
    const result = await window.contextVault?.switchProject(projectPath)
    setBusy(false)
    if (!result?.success) {
      setError(result?.error || 'Unable to switch project.')
      await load()
      return
    }
    await load()
    announceProjectChange()
  }

  const addProject = async () => {
    setBusy(true)
    setError('')
    const projectPath = await window.contextVault?.openProject()
    setBusy(false)
    if (projectPath) {
      await load()
      announceProjectChange()
    }
  }

  return (
    <div className="mb-5 rounded-xl border border-dark-600 bg-dark-800/70 p-2.5">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Active project</span>
        <button
          onClick={addProject}
          disabled={busy}
          className="text-xs font-semibold text-vault-400 transition-colors hover:text-vault-300 disabled:opacity-50"
          title="Add another project"
        >
          + Add
        </button>
      </div>
      {projects.length > 0 ? (
        <select
          value={activeProject?.path || ''}
          onChange={(event) => switchProject(event.target.value)}
          disabled={busy}
          className="w-full truncate rounded-lg border border-dark-600 bg-dark-700 px-2.5 py-2 text-xs font-medium text-neutral-200 outline-none transition-colors focus:border-vault-500/60 disabled:opacity-50"
          title={activeProject?.path}
        >
          {projects.map((project) => (
            <option key={project.path} value={project.path}>{project.name}</option>
          ))}
        </select>
      ) : (
        <button
          onClick={addProject}
          disabled={busy}
          className="w-full rounded-lg bg-vault-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-vault-600 disabled:opacity-50"
        >
          {busy ? 'Opening...' : 'Open first project'}
        </button>
      )}
      {error && <p className="mt-2 px-1 text-[10px] leading-4 text-red-300">{error}</p>}
    </div>
  )
}
