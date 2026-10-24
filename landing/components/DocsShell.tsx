'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { docsPath } from '@/lib/docs-links'

const groups = [
  {
    title: 'Start here',
    items: [
      { href: '/docs', label: 'Overview', description: 'Product map and first steps', icon: '⌂' },
      { href: '/docs/quickstart', label: 'Quick start', description: 'Set up your first project', icon: '↗' },
    ],
  },
  {
    title: 'Vault Terminal',
    items: [
      { href: '/docs/cli', label: 'CLI guide', description: 'Record and query a project', icon: '›_' },
      { href: '/docs/commands', label: 'Command reference', description: 'Flags and examples', icon: '{ }' },
    ],
  },
  {
    title: 'Capture',
    items: [
      { href: '/docs/extension', label: 'Browser extension', description: 'Capture and export chats', icon: '◈' },
      { href: '/docs/import-search', label: 'Import & search', description: 'Build a context handoff', icon: '⌕' },
    ],
  },
  {
    title: 'Desktop app',
    items: [
      { href: '/docs/desktop', label: 'Desktop guide', description: 'Install and select projects', icon: '▣' },
      { href: '/docs/desktop-tabs', label: 'Screen reference', description: 'Every tab explained', icon: '☷' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { href: '/docs/storage', label: 'Storage & privacy', description: 'Files and data boundaries', icon: '◇' },
      { href: '/docs/troubleshooting', label: 'Troubleshooting', description: 'Fix common issues', icon: '?' },
    ],
  },
]

export default function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-[calc(100vh-56px)] bg-dark-800">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-14 hidden h-[calc(100vh-56px)] w-[285px] shrink-0 flex-col border-r border-dark-600 bg-dark-900/70 lg:flex">
          <div className="border-b border-dark-600 px-6 py-5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-vault-300">ContextVault handbook</span>
            <p className="mt-2 text-xs leading-5 text-neutral-500">Guides for your browser, terminal, and Desktop workflows.</p>
          </div>
          <nav aria-label="Documentation sidebar" className="flex-1 overflow-y-auto px-3 py-4">
            {groups.map((group) => (
              <div key={group.title} className="mb-5">
                <h2 className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-600">{group.title}</h2>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = pathname === item.href
                    return (
                      <a key={item.href} href={docsPath(item.href.split('/').at(-1))} aria-current={active ? 'page' : undefined} className={`group flex items-start gap-3 rounded-xl px-3 py-2.5 transition ${active ? 'border border-vault-500/20 bg-vault-500/10 text-white' : 'border border-transparent text-neutral-400 hover:bg-dark-700 hover:text-white'}`}>
                        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] ${active ? 'bg-vault-500/15 text-vault-200' : 'bg-dark-700 text-neutral-500 group-hover:text-neutral-300'}`}>{item.icon}</span>
                        <span className="min-w-0"><span className={`block text-xs font-semibold ${active ? 'text-vault-100' : ''}`}>{item.label}</span><span className="mt-1 block text-[10px] leading-4 text-neutral-600">{item.description}</span></span>
                      </a>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="border-t border-dark-600 p-4">
            <div className="mb-3 grid grid-cols-3 gap-1 rounded-lg border border-dark-600 bg-dark-800 p-1">
              <a href="/" className="rounded-md px-2 py-1.5 text-center text-[10px] font-medium text-neutral-500 transition hover:bg-dark-700 hover:text-white">Home</a>
              <a href="/faq" className="rounded-md px-2 py-1.5 text-center text-[10px] font-medium text-neutral-500 transition hover:bg-dark-700 hover:text-white">FAQ</a>
              <a href={docsPath()} aria-current="page" className="rounded-md bg-vault-500/10 px-2 py-1.5 text-center text-[10px] font-semibold text-vault-200">Docs</a>
            </div>
            <a href="/faq" className="flex items-center justify-between rounded-xl border border-dark-500 bg-dark-800 px-3 py-2.5 text-xs text-neutral-400 transition hover:border-dark-400 hover:text-white"><span>Read the technical FAQ</span><span aria-hidden="true">↗</span></a>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="sticky top-14 z-30 border-b border-dark-600 bg-dark-800/95 px-5 py-3 backdrop-blur lg:hidden">
            <button type="button" aria-expanded={mobileOpen} aria-controls="docs-mobile-navigation" onClick={() => setMobileOpen((open) => !open)} className="flex w-full items-center justify-between rounded-lg border border-dark-500 bg-dark-900 px-3 py-2 text-left text-xs font-semibold text-neutral-200">
              <span>{groups.flatMap((group) => group.items).find((item) => item.href === pathname)?.label || 'Documentation menu'}</span><span aria-hidden="true">{mobileOpen ? '−' : '+'}</span>
            </button>
            {mobileOpen && <nav id="docs-mobile-navigation" aria-label="Documentation navigation" className="mt-3 grid gap-4 rounded-xl border border-dark-600 bg-dark-900 p-4 sm:grid-cols-2">
              {groups.map((group) => <div key={group.title}><h2 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-600">{group.title}</h2><div className="space-y-1">{group.items.map((item) => { const active = pathname === item.href; return <a key={item.href} onClick={() => setMobileOpen(false)} href={docsPath(item.href.split('/').at(-1))} aria-current={active ? 'page' : undefined} className={`block rounded-md px-2 py-2 text-xs ${active ? 'bg-vault-500/10 text-vault-200' : 'text-neutral-400 hover:bg-dark-700 hover:text-white'}`}>{item.label}<span className="ml-2 text-[10px] text-neutral-600">{item.description}</span></a>})}</div></div>)}
            </nav>}
          </div>
          <div className="min-h-[calc(100vh-56px)]">{children}</div>
        </div>
      </div>
    </div>
  )
}
