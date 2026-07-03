import { useState, useEffect } from 'react'

export default function Settings() {
  const [projectPath, setProjectPath] = useState<string | null>(null)
  const [indexingMode, setIndexingMode] = useState('manual')
  const [version, setVersion] = useState('1.0.0')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      const settings = await window.contextVault?.getSettings()
      if (settings) {
        setProjectPath(settings.projectPath || null)
        setIndexingMode(settings.indexingMode || 'manual')
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
    await window.contextVault?.updateSettings({ indexingMode })
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
              <div className="rounded-lg bg-dark-700 px-3 py-2 font-mono text-xs text-neutral-400">
                {projectPath}
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
          <h2 className="mb-3 text-sm font-semibold text-neutral-200">Indexing</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="indexing"
                value="manual"
                checked={indexingMode === 'manual'}
                onChange={() => setIndexingMode('manual')}
                className="text-vault-500 focus:ring-vault-500/50"
              />
              <div>
                <span className="text-sm text-neutral-200">Manual</span>
                <p className="text-xs text-neutral-500">Rebuild index when you click "Index"</p>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="indexing"
                value="watcher"
                checked={indexingMode === 'watcher'}
                onChange={() => setIndexingMode('watcher')}
                className="text-vault-500 focus:ring-vault-500/50"
              />
              <div>
                <span className="text-sm text-neutral-200">File Watcher</span>
                <p className="text-xs text-neutral-500">Auto-index when files change</p>
              </div>
            </label>
          </div>
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
                  window.contextVault?.openExternal('https://github.com/aliabdm')
                }}
                className="text-xs text-vault-400 transition-colors hover:text-vault-300"
              >
                Author
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
