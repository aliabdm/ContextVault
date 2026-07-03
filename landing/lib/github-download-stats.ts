export const GITHUB_RELEASES_URL = 'https://api.github.com/repos/aliabdm/ContextVault/releases?per_page=100'

export type GitHubAsset = {
  name: string
  browser_download_url: string
  download_count: number
  size: number
}

export type GitHubRelease = {
  tag_name: string
  html_url: string
  published_at: string | null
  draft: boolean
  prerelease: boolean
  assets: GitHubAsset[]
}

export type DesktopPlatform = 'Windows' | 'Linux' | 'macOS'

export type DesktopDownloadAsset = {
  name: string
  url: string
  platform: DesktopPlatform
  downloads: number
  size: number
}

export type DesktopReleaseStats = {
  tag: string
  url: string
  publishedAt: string | null
  downloads: number
  assets: DesktopDownloadAsset[]
}

export type DesktopDownloadStats = {
  repository: string
  totalDownloads: number
  windowsDownloads: number
  linuxDownloads: number
  macDownloads: number
  latestRelease: DesktopReleaseStats | null
  releases: DesktopReleaseStats[]
  measuredBy: 'github-release-asset-downloads'
}

function getDesktopPlatform(name: string): DesktopPlatform | null {
  if (/\.(?:exe|msi)$/i.test(name)) return 'Windows'
  if (/\.AppImage$/i.test(name)) return 'Linux'
  if (/\.dmg$/i.test(name)) return 'macOS'
  return null
}

export function summarizeDesktopDownloads(githubReleases: GitHubRelease[]): DesktopDownloadStats {
  const releases = githubReleases
    .filter((release) => !release.draft && !release.prerelease)
    .map((release): DesktopReleaseStats => {
      const assets = release.assets.flatMap((asset): DesktopDownloadAsset[] => {
        const platform = getDesktopPlatform(asset.name)
        return platform
          ? [{
              name: asset.name,
              url: asset.browser_download_url,
              platform,
              downloads: asset.download_count,
              size: asset.size,
            }]
          : []
      })

      return {
        tag: release.tag_name,
        url: release.html_url,
        publishedAt: release.published_at,
        downloads: assets.reduce((total, asset) => total + asset.downloads, 0),
        assets,
      }
    })
    .filter((release) => release.assets.length > 0)

  const allAssets = releases.flatMap((release) => release.assets)
  const downloadsFor = (platform: DesktopPlatform) => allAssets
    .filter((asset) => asset.platform === platform)
    .reduce((total, asset) => total + asset.downloads, 0)

  return {
    repository: 'aliabdm/ContextVault',
    totalDownloads: allAssets.reduce((total, asset) => total + asset.downloads, 0),
    windowsDownloads: downloadsFor('Windows'),
    linuxDownloads: downloadsFor('Linux'),
    macDownloads: downloadsFor('macOS'),
    latestRelease: releases[0] ?? null,
    releases,
    measuredBy: 'github-release-asset-downloads',
  }
}
