export const docsPath = (slug = '') => (slug && slug !== 'docs' ? `/docs/${slug}.html` : '/docs.html')

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
