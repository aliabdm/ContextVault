import { useState, useEffect } from 'react'

export default function Settings() {
  const [projectPath, setProjectPath] = useState<string | null>(null)
  const [version, setVersion] = useState('1.0.0')
  const [saved, setSaved] = useState(false)
  const projectName = projectPath?.split(/[\\/]/).filter(Boolean).pop() || ''

  useEffect(() => {
    const load = async () => {
      const settings = await window.contextVault?.getSettings()
      if (settings) {
        setProjectPath(settings.projectPath || null)
        setVersion(settings.version || '1.0.0')
      }
    }
    load()
  }, [])

  const handleOpenProject = async () => {
    const path = await window.contextVault?.openProject()
    if (path) setProjectPath(path)
  }

  const handleSave = async () => {
    await window.contextVault?.updateSettings({ projectPath })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">Configure ContextVault Desktop</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-dark-600 p-5">
          <h2 className="mb-3 text-sm font-semibold text-neutral-200">Project Location</h2>
          {projectPath ? (
            <div className="space-y-2">
              <div className="rounded-lg bg-dark-700 px-3 py-2 text-xs text-neutral-400" title={projectPath || ''}>
                <span className="font-medium text-neutral-200">{projectName}</span> <span className="text-neutral-600">· Stored locally</span>
              </div>
              <button
                onClick={handleOpenProject}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-dark-600 bg-dark-700 px-4 text-xs font-medium text-neutral-300 transition-colors hover:bg-dark-600"
              >
                ◉ Change Project
              </button>
            </div>
          ) : (
            <div>
              <p className="mb-3 text-sm text-neutral-500">No project selected</p>
              <button
                onClick={handleOpenProject}
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-vault-500 px-4 text-xs font-semibold text-white transition-colors hover:bg-vault-600"
              >
                ◉ Open Project
              </button>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-dark-600 p-5">
          <h2 className="mb-2 text-sm font-semibold text-neutral-200">Indexing</h2>
          <p className="text-xs leading-relaxed text-neutral-500">Indexing is explicit and local. Use Vault Tools to rebuild the unified browser and terminal index whenever your source files change.</p>
          <button
            onClick={handleSave}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-vault-500 px-4 text-xs font-semibold text-white transition-all hover:bg-vault-600 active:scale-[0.97]"
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>

        <div className="rounded-xl border border-dark-600 p-5">
          <h2 className="mb-3 text-sm font-semibold text-neutral-200">About</h2>
          <div className="space-y-2 text-sm text-neutral-400">
            <p>
              ContextVault Desktop{' '}
              <span className="rounded-md bg-dark-700 px-2 py-0.5 font-mono text-xs text-neutral-300">
                v{version}
              </span>
            </p>
            <p className="text-xs text-neutral-500">
              Mohammad Ali Abdul Wahed &middot; MIT License
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  window.contextVault?.openExternal('https://github.com/aliabdm/ContextVault')
                }}
                className="text-xs text-vault-400 transition-colors hover:text-vault-300"
              >
                GitHub
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                window.contextVault?.openExternal('https://senior-mohammad-ali.vercel.app/')
                }}
                className="text-xs text-vault-400 transition-colors hover:text-vault-300"
              >
                Portfolio
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  window.contextVault?.openExternal('https://context-vault-two.vercel.app/faq')
                }}
                className="text-xs text-vault-400 transition-colors hover:text-vault-300"
              >
                FAQ
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); window.contextVault?.openExternal('https://www.linkedin.com/in/mohammad-ali-abdul-wahed-1533b9171/') }} className="text-xs text-vault-400 transition-colors hover:text-vault-300">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
