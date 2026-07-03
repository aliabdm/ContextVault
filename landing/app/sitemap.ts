import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://context-vault-two.vercel.app'
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/download`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/download/windows`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/download/macos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/download/linux`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ]
}
