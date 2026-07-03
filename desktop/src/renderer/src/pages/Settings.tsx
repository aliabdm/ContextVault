import { useEffect, useState } from 'react'
import { announceProjectChange } from '../components/ProjectSwitcher'

type Project = {
  path: string
  name: string
  active: boolean
}

export default function Settings() {
  const [projects, setProjects] = useState<Project[]>([])
  const [version, setVersion] = useState('1.6.0')
  const [status, setStatus] = useState('')

  const load = async () => {
    const settings = await window.contextVault?.getSettings()
    if (settings) {
      setProjects(settings.recentProjects || [])
      setVersion(settings.version || '1.6.0')
    }
  }

  useEffect(() => { load() }, [])

  const addProject = async () => {
    const path = await window.contextVault?.openProject()
    if (path) {
      await load()
      announceProjectChange()
      setStatus('Project added and selected.')
    }
  }

  const switchProject = async (path: string) => {
    const result = await window.contextVault?.switchProject(path)
    if (!result?.success) {
      setStatus(result?.error || 'Unable to switch project.')
      return
    }
    await load()
    announceProjectChange()
    setStatus('Active project changed.')
  }

  const removeProject = async (path: string) => {
    const result = await window.contextVault?.removeProject(path)
    if (!result?.success) {
      setStatus(result?.error || 'Unable to remove project.')
      return
    }
    await load()
    announceProjectChange()
    setStatus('Project removed from this list. Its files were not deleted.')
  }

  const openExternal = (url: string) => window.contextVault?.openExternal(url)

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">Projects, local indexing, and product information</p>
      </div>

      <div className="space-y-6">
        <section className="rounded-xl border border-dark-600 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-neutral-200">Projects</h2>
              <p className="mt-1 text-xs leading-5 text-neutral-500">Add multiple local vaults and switch from the sidebar. Removing a project here never deletes its folder or `.contextvault` data.</p>
            </div>
            <button onClick={addProject} className="shrink-0 rounded-lg bg-vault-500 px-4 py-2 text-xs font-semibold text-white hover:bg-vault-600">+ Add project</button>
          </div>

          <div className="mt-5 space-y-2">
            {projects.length === 0 ? (
              <div className="rounded-lg border border-dashed border-dark-600 py-8 text-center text-sm text-neutral-500">No projects added yet.</div>
            ) : projects.map((project) => (
              <div key={project.path} className={`flex items-center gap-3 rounded-xl border p-3 ${project.active ? 'border-vault-500/40 bg-vault-500/5' : 'border-dark-600 bg-dark-700/30'}`}>
                <div className={`h-2 w-2 shrink-0 rounded-full ${project.active ? 'bg-vault-400' : 'bg-neutral-700'}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-200">{project.name}</p>
                  <p className="truncate text-[11px] text-neutral-600" title={project.path}>{project.path}</p>
                </div>
                {project.active ? (
                  <span className="rounded-full bg-vault-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-vault-300">Active</span>
                ) : (
                  <button onClick={() => switchProject(project.path)} className="rounded-lg border border-dark-600 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-dark-600">Switch</button>
                )}
                <button onClick={() => removeProject(project.path)} className="px-2 py-1.5 text-xs text-neutral-600 hover:text-red-300">Remove</button>
              </div>
            ))}
          </div>
          {status && <p className="mt-3 text-xs text-neutral-400">{status}</p>}
        </section>

        <section className="rounded-xl border border-dark-600 p-5">
          <h2 className="mb-2 text-sm font-semibold text-neutral-200">Recording and indexing</h2>
          <p className="text-xs leading-5 text-neutral-500">
            The Desktop Recorder and <code className="text-vault-300">contextvault record</code> both save compatible Markdown under the active project's `.contextvault/sessions/`. The index rebuilds after a Desktop save; Vault Tools can rebuild it explicitly after external file changes.
          </p>
        </section>

        <section className="rounded-xl border border-dark-600 p-5">
          <h2 className="mb-3 text-sm font-semibold text-neutral-200">About</h2>
          <div className="space-y-2 text-sm text-neutral-400">
            <p>ContextVault Desktop <span className="rounded-md bg-dark-700 px-2 py-0.5 font-mono text-xs text-neutral-300">v{version}</span></p>
            <p className="text-xs text-neutral-500">Mohammad Ali Abdul Wahed · MIT License</p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button onClick={() => openExternal('https://github.com/aliabdm/ContextVault')} className="text-xs text-vault-400 hover:text-vault-300">GitHub</button>
              <button onClick={() => openExternal('https://senior-mohammad-ali.vercel.app/')} className="text-xs text-vault-400 hover:text-vault-300">Portfolio</button>
              <button onClick={() => openExternal('https://context-vault-two.vercel.app/faq')} className="text-xs text-vault-400 hover:text-vault-300">FAQ</button>
              <button onClick={() => openExternal('https://context-vault-two.vercel.app/stats')} className="text-xs text-vault-400 hover:text-vault-300">Download stats</button>
              <button onClick={() => openExternal('https://www.linkedin.com/in/mohammad-ali-abdul-wahed-1533b9171/')} className="text-xs text-vault-400 hover:text-vault-300">LinkedIn</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
