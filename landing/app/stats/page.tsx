import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/Footer'
import { getDesktopDownloadStats, type DesktopDownloadStats } from '@/lib/github-download-stats'

export const metadata: Metadata = {
  title: 'Desktop Download Stats - ContextVault',
  description: 'Public, privacy-friendly download statistics for ContextVault Desktop releases.',
}

export const revalidate = 3600

const number = new Intl.NumberFormat('en-US')

function formatDate(value: string | null) {
  if (!value) return 'Unknown date'
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))
}

function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

async function loadStats(): Promise<DesktopDownloadStats | null> {
  try {
    return await getDesktopDownloadStats()
  } catch (error) {
    console.error('Unable to render GitHub download statistics', error)
    return null
  }
}

export default async function StatsPage() {
  const stats = await loadStats()

  return (
    <>
      <header className="border-b border-dark-600 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold text-white">ContextVault</Link>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/download" className="font-medium text-vault-400 transition-colors hover:text-vault-300">Download</Link>
            <Link href="/" className="text-neutral-400 transition-colors hover:text-white">Back to overview</Link>
          </div>
        </div>
      </header>

      <main className="min-h-[75vh] px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-vault-500/30 bg-vault-500/10 px-3 py-1 text-xs font-semibold text-vault-300">
              <span className="h-1.5 w-1.5 rounded-full bg-vault-400" />
              Live public metrics
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Desktop downloads</h1>
            <p className="mt-5 text-lg leading-relaxed text-neutral-400">
              Installer download events reported by GitHub Releases. Updated at most once per hour, with no telemetry inside the app.
            </p>
          </div>

          {stats ? (
            <>
              <section className="mt-10 grid gap-4 sm:grid-cols-3" aria-label="Download totals">
                <MetricCard label="All desktop downloads" value={stats.totalDownloads} primary />
                <MetricCard label="Windows installer" value={stats.windowsDownloads} />
                <MetricCard label="Linux AppImage" value={stats.linuxDownloads} />
              </section>

              <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 text-sm leading-relaxed text-amber-100/80">
                <strong className="font-semibold text-amber-100">What this number means:</strong>{' '}
                it counts installer downloads, not unique people or active installations. A person downloading again can be counted again.
              </div>

              <section className="mt-14">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Downloads by release</h2>
                    <p className="mt-2 text-sm text-neutral-500">Only Desktop installers are included. Extension ZIPs and npm downloads are excluded.</p>
                  </div>
                  <a
                    href="https://github.com/aliabdm/ContextVault/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-vault-400 hover:text-vault-300"
                  >
                    View GitHub releases ↗
                  </a>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-dark-600 bg-dark-700/50">
                  {stats.releases.map((release, releaseIndex) => (
                    <div key={release.tag} className={releaseIndex > 0 ? 'border-t border-dark-600' : ''}>
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-dark-700 px-5 py-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <a href={release.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:text-vault-300">
                            {release.tag}
                          </a>
                          <span className="text-xs text-neutral-500">{formatDate(release.publishedAt)}</span>
                        </div>
                        <span className="rounded-full bg-dark-600 px-3 py-1 text-sm font-semibold text-neutral-200">
                          {number.format(release.downloads)} total
                        </span>
                      </div>
                      <div className="divide-y divide-dark-600/70">
                        {release.assets.map((asset) => (
                          <a
                            key={asset.name}
                            href={asset.url}
                            className="grid gap-2 px-5 py-4 transition-colors hover:bg-dark-600/40 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-6"
                          >
                            <span className="min-w-0 truncate text-sm font-medium text-neutral-200">{asset.name}</span>
                            <span className="text-xs text-neutral-500">{asset.platform} · {formatSize(asset.size)}</span>
                            <span className="text-sm font-semibold text-vault-300">{number.format(asset.downloads)} downloads</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-10 rounded-2xl border border-dark-600 bg-dark-700/40 p-6">
                <h2 className="font-semibold text-white">Privacy by design</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-400">
                  These totals come from public GitHub release assets. ContextVault does not send device IDs, fingerprints, usage events, project data, or background analytics from the Desktop app.
                </p>
                <a href="/api/download-stats" className="mt-4 inline-block text-sm font-medium text-vault-400 hover:text-vault-300">
                  View the public JSON endpoint →
                </a>
              </section>
            </>
          ) : (
            <div className="mt-10 rounded-2xl border border-dark-600 bg-dark-700 p-8">
              <h2 className="text-lg font-semibold text-white">Statistics are temporarily unavailable</h2>
              <p className="mt-2 text-sm text-neutral-400">GitHub did not return the release data. Please try again shortly.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function MetricCard({ label, value, primary = false }: { label: string; value: number; primary?: boolean }) {
  return (
    <div className={`rounded-2xl border p-6 ${primary ? 'border-vault-500/40 bg-vault-500/10' : 'border-dark-600 bg-dark-700/60'}`}>
      <div className={`text-4xl font-bold tracking-tight ${primary ? 'text-vault-300' : 'text-white'}`}>{number.format(value)}</div>
      <div className="mt-2 text-sm text-neutral-400">{label}</div>
    </div>
  )
}
