'use client'

import { useEffect } from 'react'

export default function DownloadPage() {
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes('win')) {
      window.location.href = '/download/windows'
    } else if (ua.includes('mac')) {
      window.location.href = '/download/macos'
    } else {
      window.location.href = '/download/linux'
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-800 px-6">
      <div className="text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-dark-600 bg-dark-700 text-3xl">
          ⏳
        </div>
        <h1 className="text-xl font-bold text-white">Detecting your platform...</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Redirecting to the correct installer.
        </p>
        <div className="mt-6 flex justify-center gap-4 text-sm text-neutral-500">
          <a href="/download/windows" className="text-vault-400 hover:underline">Windows</a>
          <a href="/download/macos" className="text-vault-400 hover:underline">macOS</a>
          <a href="/download/linux" className="text-vault-400 hover:underline">Linux</a>
        </div>
      </div>
    </div>
  )
}
