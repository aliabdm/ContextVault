export const docsPath = (slug = '') => (slug && slug !== 'docs' ? `/docs/${slug}/` : '/docs/')

export const docsSlugs = [
  'quickstart',
  'cli',
  'commands',
  'extension',
  'import-search',
  'desktop',
  'desktop-tabs',
  'storage',
  'troubleshooting',
] as const
