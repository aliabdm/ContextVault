import { useState, useEffect } from 'react'

export default function AutoUpdateBanner() {
  const [status, setStatus] = useState<'idle' | 'available' | 'downloading' | 'downloaded' | 'error'>('idle')
  const [version, setVersion] = useState('')
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    window.contextVault?.onUpdateAvailable((v) => {
      setVersion(v)
      setStatus('available')
    })
    window.contextVault?.onUpdateProgress((p) => {
      setProgress(p)
      setStatus('downloading')
    })
    window.contextVault?.onUpdateDownloaded(() => {
      setStatus('downloaded')
    })
    window.contextVault?.onUpdateError((msg) => {
      setErrorMsg(msg)
      setStatus('error')
    })
    window.contextVault?.checkForUpdate()
  }, [])

  if (status === 'idle') return null

  if (status === 'available') {
    return (
      <div className="flex items-center justify-between border-b border-vault-500/20 bg-vault-500/10 px-4 py-2">
        <span className="text-xs text-vault-300">
          Update available: v{version}
        </span>
        <button
          onClick={() => window.contextVault?.downloadUpdate()}
          className="rounded-md bg-vault-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-vault-600"
        >
          Download
        </button>
      </div>
    )
  }

  if (status === 'downloading') {
    return (
      <div className="border-b border-vault-500/20 bg-vault-500/10 px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-vault-300">Downloading update...</span>
          <span className="text-xs text-vault-300">{Math.round(progress)}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-dark-600">
          <div className="h-full rounded-full bg-vault-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    )
  }

  if (status === 'downloaded') {
    return (
      <div className="flex items-center justify-between border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
        <span className="text-xs text-emerald-300">Update ready to install</span>
        <button
          onClick={() => window.contextVault?.installUpdate()}
          className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-emerald-600"
        >
          Restart to update
        </button>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-between border-b border-red-500/20 bg-red-500/10 px-4 py-2">
        <span className="text-xs text-red-300">Update error: {errorMsg}</span>
        <button
          onClick={() => { setStatus('idle'); window.contextVault?.checkForUpdate() }}
          className="rounded-md border border-red-500/30 px-3 py-1 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/10"
        >
          Retry
        </button>
      </div>
    )
  }

  return null
}
