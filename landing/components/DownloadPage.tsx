'use client'

import { useEffect, useState } from 'react'

const assetFilters: Record<string, (name: string) => boolean> = {
  windows: (name: string) => name.includes('.exe') && !name.includes('.exe.'),
  macos: (name: string) => name.includes('.dmg'),
  linux: (name: string) => name.includes('.AppImage'),
}

const platformNames: Record<string, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
}

export default function DownloadPage({ platform }: { platform: string }) {
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading')
  const [error, setError] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    const fn = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/aliabdm/ContextVault/releases/latest')
        if (!res.ok) throw new Error(`GitHub API returned ${res.status}`)
        const release = await res.json()
        const filter = assetFilters[platform]
        const asset = release.assets?.find((a: any) => filter(a.name))
        if (!asset) throw new Error(`No ${platformNames[platform]} installer found in the latest release`)
        const downloadUrl = asset.browser_download_url
        setUrl(downloadUrl)
        setStatus('redirecting')
        setTimeout(() => { window.location.href = downloadUrl }, 500)
      } catch (err: any) {
        setError(err.message)
        setStatus('error')
      }
    }
    fn()
  }, [platform])

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-800 px-6">
      <div className="max-w-md text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-dark-600 bg-dark-700 text-3xl">
          {status === 'loading' ? '⏳' : status === 'redirecting' ? '⬇' : '⚠'}
        </div>

        {status === 'loading' && (
          <>
            <h1 className="text-xl font-bold text-white">Preparing download...</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Fetching the latest ContextVault installer for {platformNames[platform]}.
            </p>
          </>
        )}

        {status === 'redirecting' && (
          <>
            <h1 className="text-xl font-bold text-white">Download starting...</h1>
            <p className="mt-2 text-sm text-neutral-400">
              If the download does not start automatically,{' '}
              <a href={url} className="text-vault-400 underline-offset-2 hover:underline">
                click here
              </a>.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-xl font-bold text-white">Download unavailable</h1>
            <p className="mt-2 text-sm text-neutral-400">{error}</p>
            <div className="mt-6 flex justify-center gap-3">
              <a
                href={`https://github.com/aliabdm/ContextVault/releases`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center rounded-xl bg-vault-500 px-5 text-sm font-semibold text-white transition-all hover:bg-vault-600"
              >
                Browse Releases
              </a>
              <a
                href="/"
                className="inline-flex h-10 items-center rounded-xl border border-dark-600 bg-dark-700 px-5 text-sm font-medium text-neutral-300 transition-colors hover:bg-dark-600"
              >
                Back Home
              </a>
            </div>
          </>
        )}

        {status !== 'error' && (
          <div className="mt-6 flex justify-center gap-3">
            <a
              href="/"
              className="inline-flex h-10 items-center rounded-xl border border-dark-600 bg-dark-700 px-5 text-sm font-medium text-neutral-300 transition-colors hover:bg-dark-600"
            >
              ← Back to ContextVault
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
