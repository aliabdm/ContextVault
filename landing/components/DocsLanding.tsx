import { docsPath } from '@/lib/docs-links'

const tracks = [
  { href: '/docs/quickstart', number: '01', title: 'Get your first vault running', text: 'Choose a project folder, initialize local storage, and decide whether to start in Desktop or in a terminal.', label: 'Start here', icon: '↗' },
  { href: '/docs/cli', number: '02', title: 'Capture work with Vault Terminal', text: 'Record a real coding task with source, decisions, problems, and follow-ups. Learn the interactive recorder.', label: 'Terminal & npm package', icon: '>_' },
  { href: '/docs/extension', number: '03', title: 'Bring browser conversations along', text: 'Capture in supported AI websites, export Markdown or ZIP, and import conversations into a project.', label: 'Chrome extension', icon: '◈' },
  { href: '/docs/desktop', number: '04', title: 'Work visually in Desktop', text: 'Install the app, add projects, start recording, explore history, and prepare context without command syntax.', label: 'Desktop app', icon: '▣' },
]

const principles = [
  ['Local files are the source', 'Terminal sessions and imported browser conversations are readable Markdown inside each project vault.'],
  ['Capture stays explicit', 'Browser capture happens in supported tabs; Desktop recording starts only when you choose to record.'],
  ['Handoffs stay portable', 'Retrieve matching evidence, then prepare a focused Markdown package for any agent or model.'],
]

export default function DocsLanding() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <div className="mb-4 flex items-center gap-2 text-[11px] text-neutral-600"><a href="/" className="hover:text-white">ContextVault</a><span>/</span><span className="text-vault-300">Documentation</span></div>
      <div className="grid gap-8 border-b border-dark-600 pb-10 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
        <div><span className="inline-flex rounded-full border border-vault-500/20 bg-vault-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-vault-200">Documentation · v1</span><h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">A clear path through<br/><span className="bg-gradient-to-r from-vault-300 to-blue-200 bg-clip-text text-transparent">your project context.</span></h1><p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400 sm:text-base">Choose a guide from the sidebar. Each one covers a single part of the workflow, from the first local vault to a complete context handoff.</p></div>
        <div className="rounded-2xl border border-dark-500 bg-dark-900 p-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600">A simple workflow</p><p className="mt-3 font-mono text-xs leading-6 text-neutral-300">Capture <span className="text-vault-400">→</span> Import <span className="text-vault-400">→</span> Retrieve <span className="text-vault-400">→</span> Prepare</p><p className="mt-2 text-[10px] text-neutral-600">Your files stay on your device.</p></div>
      </div>

      <section className="mt-10" aria-labelledby="guides-title"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-vault-300">Pick up where you are</p><h2 id="guides-title" className="mt-2 text-xl font-bold text-white">Product guides</h2></div><p className="text-xs text-neutral-600">Four paths · one shared local vault</p></div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">{tracks.map((track) => <a key={track.href} href={docsPath(track.href.split('/').at(-1))} className="group rounded-2xl border border-dark-500 bg-dark-900/65 p-5 transition hover:-translate-y-0.5 hover:border-vault-500/35 hover:bg-dark-900"><div className="flex items-start justify-between gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-dark-500 bg-dark-800 font-mono text-sm text-vault-200">{track.icon}</span><span className="font-mono text-[10px] text-neutral-700">{track.number}</span></div><p className="mt-5 text-[10px] font-semibold uppercase tracking-wider text-vault-300">{track.label}</p><h3 className="mt-2 text-base font-semibold text-white group-hover:text-vault-100">{track.title}</h3><p className="mt-2 text-xs leading-6 text-neutral-500">{track.text}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-vault-300">Open guide <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span></span></a>)}</div>
      </section>

      <section className="mt-12 grid gap-3 border-t border-dark-600 pt-8 md:grid-cols-3" aria-label="Product principles">{principles.map(([title, text]) => <div key={title} className="pr-3"><h3 className="text-xs font-semibold text-neutral-200">{title}</h3><p className="mt-2 text-xs leading-5 text-neutral-600">{text}</p></div>)}</section>
      <div className="mt-10 flex flex-wrap gap-4 border-t border-dark-600 pt-6"><a href={docsPath('commands')} className="text-xs font-medium text-vault-300 hover:text-white">Command reference →</a><a href={docsPath('desktop-tabs')} className="text-xs font-medium text-vault-300 hover:text-white">Desktop screen reference →</a><a href={docsPath('troubleshooting')} className="text-xs font-medium text-vault-300 hover:text-white">Troubleshooting →</a></div>
    </main>
  )
}
