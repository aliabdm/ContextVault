'use client'

import { docsPath } from '@/lib/docs-links'

const commands = [
  ['init', 'Initialize the project vault and create missing local storage folders.'],
  ['record', 'Start the interactive recorder for raw work notes, decisions, and follow-ups.'],
  ['list', 'List saved sessions with IDs, dates, sources, titles, and event counts.'],
  ['show latest', 'Print the latest session; pass a session ID in place of latest to inspect another.'],
  ['export', 'Write a combined Markdown export of memory, recent sessions, decisions, tasks, and problems.'],
  ['search "redirect loop"', 'Find literal text in saved session Markdown.'],
  ['import ./browser-export.zip', 'Import a Markdown export, ZIP archive, or directory of browser exports.'],
  ['index', 'Rebuild the unified local context index from project sessions and imports.'],
  ['retrieve "auth middleware"', 'Rank relevant project evidence for a topic or task.'],
  ['prepare "auth middleware"', 'Generate an agent-ready context handoff under .contextvault/exports.'],
  ['memory', 'Update generated project memory from decisions, tasks, and problems.'],
  ['link <from-id> <to-id> "related"', 'Record an explicit relationship between two sessions.'],
  ['timeline', 'Generate a chronological Markdown timeline from indexed project events.'],
  ['history --since 14d', 'Review recent project activity and filter it with query/source/type options.'],
  ['tasks --since 2w', 'List captured follow-up tasks.'],
  ['decisions auth --source codex', 'Search decisions by query and source.'],
  ['problems redis --since 30d', 'Search problems and failed attempts by query and date.'],
]

const desktopTabs = [
  ['Dashboard', 'Project overview with session, event, decision, problem, and task counts. Watcher status shows active project sync. Quick Actions open common workflows. Add a project here to select a folder and initialize its vault.'],
  ['Record Session', 'Create a titled session, choose a source such as Codex, Claude Code, Cursor, Terminal, or another tool, then add user, agent, decision, task, problem, or note events. Automatic classification is local; you can override it before saving.'],
  ['Sessions', 'Browse saved sessions, filter by title or source, open session details, review event timelines, copy or export Markdown, and use a session as the starting point for Prepare.'],
  ['History', 'Read captured project activity in time order. Narrow the list by date, source, event type, and query.'],
  ['Decisions', 'Review choices and rationale so a future session can understand why the project follows a particular direction.'],
  ['Problems', 'Find bugs, blockers, and failed attempts. Pair with a query or time filter to avoid repeating earlier investigation.'],
  ['Tasks', 'See captured follow-up work. Use sources and dates to find which items are still relevant to the next task.'],
  ['Retrieve', 'Rank relevant evidence for a question or task, grouped with its source session and event details. Retrieval is local and deterministic.'],
  ['Search', 'Search local sessions and events with structured source, type, and date filters. Inspect and export matching evidence.'],
  ['Prepare', 'Choose a task, event types, source, time range, and result limit. Generate a focused Markdown handoff, then copy or download it for your next coding agent.'],
  ['Vault Tools', 'Initialize or repair storage, import a browser export, rebuild the index, refresh project memory, generate a timeline, export the vault, link sessions, or open Advanced CLI Mode.'],
  ['Settings', 'Add or switch recent project folders and view app information. Removing a folder from this list does not erase the folder or its vault data.'],
]

const meta: Record<string, { parent: string; title: string; summary: string }> = {
  quickstart: { parent: 'Start here', title: 'Quick start', summary: 'Choose a first project and get a local vault ready in a few minutes.' },
  cli: { parent: 'Vault Terminal', title: 'CLI guide', summary: 'Capture project work in the terminal, then review it as searchable local Markdown.' },
  commands: { parent: 'Vault Terminal', title: 'Command reference', summary: 'A concise reference for every published Vault Terminal command and its common filters.' },
  extension: { parent: 'Capture', title: 'Browser extension', summary: 'Capture AI conversations in Chrome, organize them, and export portable files.' },
  'import-search': { parent: 'Capture', title: 'Import & search', summary: 'Join browser exports and terminal sessions in one project index, then prepare a focused handoff.' },
  desktop: { parent: 'Desktop app', title: 'Desktop guide', summary: 'Install the app, choose a project, and start using the local context workflow.' },
  'desktop-tabs': { parent: 'Desktop app', title: 'Screen reference', summary: 'Learn what every Desktop screen is for and when to use it.' },
  storage: { parent: 'Reference', title: 'Storage & privacy', summary: 'Understand where extension records, Markdown sessions, indexes, and exports live.' },
  troubleshooting: { parent: 'Reference', title: 'Troubleshooting', summary: 'Diagnose common capture, import, project selection, and search issues.' },
}

function Heading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return <div className="mb-7 max-w-3xl"><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-vault-300">{eyebrow}</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h1>{children && <p className="mt-3 text-sm leading-7 text-neutral-400 sm:text-base">{children}</p>}</div>
}

function Code({ children, language = 'bash' }: { children: string; language?: string }) {
  return <div className="overflow-hidden rounded-xl border border-dark-500 bg-[#080812]"><div className="border-b border-dark-600 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-neutral-600">{language}</div><pre className="overflow-x-auto p-4 text-[11px] leading-6 text-vault-100 sm:text-xs"><code>{children}</code></pre></div>
}

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-xl border border-vault-500/20 bg-vault-500/[0.06] p-4"><h3 className="text-xs font-semibold text-vault-100">{title}</h3><div className="mt-1.5 text-xs leading-6 text-neutral-400">{children}</div></div>
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-xl border border-dark-500 bg-dark-900/65 p-4"><h3 className="text-xs font-semibold text-neutral-100">{title}</h3><div className="mt-2 text-xs leading-6 text-neutral-500">{children}</div></div>
}

function Quickstart() {
  return <><Heading eyebrow="Start here · 5 minutes" title="Create your first project vault">A vault belongs to a project folder. Desktop can initialize it for you; from a terminal, initialize the folder you are working in.</Heading><div className="space-y-7"><section><h2 className="mb-3 text-sm font-semibold text-white">Option A · Start with Desktop</h2><ol className="grid gap-3 sm:grid-cols-2">{[['Download', 'Get the Windows installer or Linux AppImage from the download page. macOS currently requires a source build.'], ['Choose a folder', 'Launch ContextVault Desktop and select the codebase or project folder you want to remember.'], ['Record a short session', 'Open Record Session, give it a title, select a source, add one or two useful events, then choose Finish & save.'], ['Review the result', 'Open Sessions, then Search or Prepare to explore and reuse the new context.']].map(([title, text], index) => <li key={title} className="rounded-xl border border-dark-500 bg-dark-900/60 p-4"><span className="font-mono text-[10px] text-vault-300">0{index + 1}</span><h3 className="mt-2 text-xs font-semibold text-white">{title}</h3><p className="mt-1.5 text-xs leading-5 text-neutral-500">{text}</p></li>)}</ol></section><section><h2 className="mb-3 text-sm font-semibold text-white">Option B · Start from your project terminal</h2><Code>{`cd path/to/your-project
npx @aliabdm/contextvault init
npx @aliabdm/contextvault record`}</Code></section><Callout title="What initialization changes">It creates a <code>.contextvault/</code> folder in the current project. Your files remain local; initialization does not upload source code or conversations.</Callout><div className="grid gap-3 sm:grid-cols-2"><Card title="Already have browser chats?">Capture and export a conversation with the extension, then import its Markdown or ZIP into this same project.</Card><Card title="Already use Desktop?">The sidebar project selector is the active storage boundary. Terminal and Desktop should point to the same project folder to share sessions.</Card></div><a href={docsPath('cli')} className="inline-flex rounded-lg bg-vault-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-vault-600">Continue to the CLI guide →</a></div></>
}

function CliGuide() {
  return <><Heading eyebrow="Vault Terminal · Workflow" title="Capture a coding session from the terminal">The CLI writes session events to Markdown in the current project's `.contextvault/sessions/` folder. Capture decisions and failures while they are fresh; search and prepare handoffs later.</Heading><div className="space-y-7"><section><h2 className="mb-3 text-sm font-semibold text-white">1. Install and initialize</h2><Code>{`# Run without a global install
npx @aliabdm/contextvault init

# Optional: install a reusable global command
npm install --global @aliabdm/contextvault
cd my-project
contextvault init`}</Code><p className="mt-2 text-[11px] leading-5 text-neutral-600">Global install is optional. With npx, replace <code>contextvault</code> with <code>npx @aliabdm/contextvault</code>.</p></section><section><h2 className="mb-3 text-sm font-semibold text-white">2. Record the work</h2><Code>{`contextvault record

/source codex
/title Fix authentication callback
/user Callback redirects users back to sign-in.
/agent Cookie is read before the callback writes it.
/problem Session cookie is missing after OAuth callback.
/decision Keep authentication checks in middleware.
/task Add regression coverage for redirect loop.
/end`}</Code><div className="mt-3 grid gap-3 sm:grid-cols-2"><Card title="Supported event types"><code>/user</code>, <code>/agent</code>, <code>/note</code>, <code>/decision</code>, <code>/task</code>, and <code>/problem</code> each record a dated event.</Card><Card title="Recorder controls"><code>/source</code> sets the source; <code>/title</code> sets the title; <code>/paste</code> captures multiline text until <code>/endpaste</code>; <code>/help</code> lists the commands; <code>/end</code> saves and exits.</Card></div></section><section><h2 className="mb-3 text-sm font-semibold text-white">3. Review and search</h2><Code>{`contextvault list
contextvault show latest
contextvault search "OAuth callback"
contextvault history --since 14d
contextvault decisions authentication --source codex
contextvault problems callback --since 30d`}</Code></section><section><h2 className="mb-3 text-sm font-semibold text-white">4. Retrieve evidence and prepare the next handoff</h2><Code>{`contextvault retrieve "authentication callback" --type decision,problem --source codex --since 30d --limit 10
contextvault prepare "Fix callback redirect and add regression coverage" --source codex --since 30d
contextvault memory
contextvault timeline`}</Code><p className="mt-2 text-xs leading-5 text-neutral-500">Prepare writes an agent-ready Markdown file under <code>.contextvault/exports/</code>. Give that file to the next agent; the CLI does not call an AI provider.</p></section><Callout title="Keep the project consistent">Run CLI commands from the intended project directory. Desktop displays these sessions when its active project points at that same folder.</Callout><a href={docsPath('commands')} className="inline-flex rounded-lg border border-dark-500 bg-dark-900 px-4 py-2.5 text-xs font-semibold text-neutral-200 hover:border-vault-500/40">Browse the complete command reference →</a></div></>
}

function CommandReference() {
  return <><Heading eyebrow="Vault Terminal · Reference" title="Command reference">All commands operate on the current project's local `.contextvault/` directory. Run `contextvault help` for the compact terminal overview.</Heading><div className="overflow-hidden rounded-xl border border-dark-500"><div className="grid grid-cols-[minmax(130px,0.8fr)_minmax(0,1.5fr)] gap-3 border-b border-dark-600 bg-dark-900 px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-neutral-600"><span>Command</span><span>Use it to</span></div>{commands.map(([command, summary], index) => <div key={command} className={`grid grid-cols-[minmax(130px,0.8fr)_minmax(0,1.5fr)] gap-3 px-4 py-3 ${index % 2 ? 'bg-dark-900/30' : ''}`}><code className="break-all text-[10px] text-vault-200">contextvault {command}</code><p className="text-[11px] leading-5 text-neutral-500">{summary}</p></div>)}</div><section className="mt-7"><h2 className="mb-3 text-sm font-semibold text-white">Shared query filters</h2><div className="grid gap-3 sm:grid-cols-2"><Card title="--type decision,problem">Filter by event types: user, agent, note, decision, task, problem.</Card><Card title="--source codex">Filter by source, such as codex, claude-code, cursor, terminal, browser, or manual.</Card><Card title="--since 24h / 14d / 2w">Limit results by relative age or provide a fixed ISO date.</Card><Card title="--limit 10">Cap the number of ranked results returned.</Card></div></section><div className="mt-7"><h2 className="mb-3 text-sm font-semibold text-white">A useful retrieval example</h2><Code>{`contextvault retrieve "payment webhook retry" --type decision,problem --source codex --since 30d --limit 10`}</Code></div><p className="mt-4 text-[11px] leading-5 text-neutral-600">Retrieval uses local phrase/token matching, event-type weighting, and recency. It does not run embeddings or semantic model calls.</p></>
}

function ExtensionGuide() {
  const platforms = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Poe', 'DeepSeek', 'Grok', 'Microsoft Copilot']
  return <><Heading eyebrow="Browser capture · Chrome" title="Keep useful conversations from the browser">The extension observes supported AI conversation tabs and stores captured conversations in that browser profile. Export is the explicit bridge into a project vault.</Heading><div className="space-y-7"><div className="flex flex-wrap gap-2">{platforms.map((platform) => <span key={platform} className="rounded-full border border-dark-500 bg-dark-900 px-3 py-1.5 text-[10px] text-neutral-300">{platform}</span>)}</div><section><h2 className="mb-3 text-sm font-semibold text-white">Install from a local build</h2><Code>{`# From the repository root
npm ci
npm run build

# In Chrome, open:
chrome://extensions
# Turn on Developer mode → Load unpacked → choose dist/`}</Code><p className="mt-2 text-[11px] leading-5 text-neutral-600">A Chrome Web Store listing may provide direct installation. Loading unpacked is for local development or testing.</p></section><section><h2 className="mb-3 text-sm font-semibold text-white">Use the popup</h2><div className="grid gap-3 sm:grid-cols-2">{[['Current session', 'Shows the detected platform, conversation title, message count, duration, and whether capture is active.'], ['Pause', 'Stops capture in the active tab temporarily. Click Resume to continue.'], ['Organization', 'Choose a project label and add tags to keep browser conversations organized in the extension.'], ['Export .md', 'Downloads the active conversation as readable Markdown.'], ['ZIP All', 'Downloads the saved conversation collection as one ZIP archive.'], ['Settings', 'Set automatic export frequency, idle timeout, message limit per file, and whether capture is enabled.']].map(([title, summary]) => <Card key={title} title={title}>{summary}</Card>)}</div></section><section><h2 className="mb-3 text-sm font-semibold text-white">Import an export into your project</h2><Code>{`npx @aliabdm/contextvault import ./chatgpt-export.md
npx @aliabdm/contextvault import ./contextvault-export.zip
npx @aliabdm/contextvault index`}</Code><p className="mt-2 text-[11px] leading-5 text-neutral-600">The extension archive remains in browser storage. Import copies the content into the project vault without removing the original conversation.</p></section><Callout title="Data boundary">Browser records stay in browser IndexedDB until you export them. They are not automatically synced into Desktop or terminal storage.</Callout></div></>
}

function ImportSearchGuide() {
  return <><Heading eyebrow="Context Engine · Workflow" title="Unify sources and prepare a context handoff">Combine explicit browser exports with terminal or Desktop sessions. Rebuild the local index after import, query for source evidence, and prepare only what is relevant to the next task.</Heading><div className="space-y-7"><section><h2 className="mb-3 text-sm font-semibold text-white">CLI flow</h2><Code>{`contextvault import ./browser-export.zip
contextvault index
contextvault retrieve "payment webhook retry" --source codex --since 30d
contextvault prepare "Implement webhook retries safely" --source codex --since 30d`}</Code></section><section><h2 className="mb-3 text-sm font-semibold text-white">Desktop flow</h2><ol className="grid gap-3 sm:grid-cols-2">{[['Import', 'Open Vault Tools → Import conversation export and select a Markdown or ZIP file.'], ['Index', 'Choose Rebuild Index so imported files and recorded sessions are in the unified local index.'], ['Search or Retrieve', 'Use the dedicated Search or Retrieve tabs. Narrow evidence by query, source, type, or date.'], ['Prepare', 'Open Prepare, describe the next task, choose filters, generate the Markdown package, then copy or download it.']].map(([title, text], index) => <li key={title} className="rounded-xl border border-dark-500 bg-dark-900/60 p-4"><span className="font-mono text-[10px] text-vault-300">0{index + 1}</span><h3 className="mt-1 text-xs font-semibold text-white">{title}</h3><p className="mt-1 text-[11px] leading-5 text-neutral-500">{text}</p></li>)}</ol></section><section><h2 className="mb-3 text-sm font-semibold text-white">What does Prepare produce?</h2><p className="text-xs leading-6 text-neutral-500">A Markdown handoff containing selected source events and context. It is grounded in project evidence and designed to be pasted or supplied to a separate AI tool. ContextVault does not generate a model answer or send source material to a provider.</p></section><Callout title="If a result is missing">Check that the file was imported into the active project, rebuild the index, and check that source/type/date filters are not excluding it.</Callout><a href={docsPath('commands')} className="inline-flex rounded-lg border border-dark-500 bg-dark-900 px-4 py-2.5 text-xs font-semibold text-neutral-200 hover:border-vault-500/40">See filters in the command reference →</a></div></>
}

function DesktopGuide() {
  return <><Heading eyebrow="Desktop app · Getting started" title="Set up Desktop for a project">ContextVault Desktop gives you visual controls for the same local engine and Markdown vault used by the package. Start with a folder, then capture or inspect context at your own pace.</Heading><div className="space-y-7"><div className="overflow-hidden rounded-2xl border border-dark-500 bg-dark-900"><img src="/demo/desktop-walkthrough/step-01.png" alt="Selecting a project folder in ContextVault Desktop" className="max-h-[380px] w-full object-cover object-top"/><p className="border-t border-dark-600 px-4 py-2.5 text-[10px] text-neutral-600">Step 1 · Select the project folder.</p></div><section><h2 className="mb-3 text-sm font-semibold text-white">First launch</h2><ol className="space-y-2">{[['Install the app', 'Download the current Windows installer or Linux AppImage. macOS packaging is currently a local source build.'], ['Choose a project', 'Use Open first project or + Add. Select the repository or working folder whose context you want to keep.'], ['Initialize local storage', 'Desktop creates missing .contextvault folders in the selected project.'], ['Record explicitly', 'Open Record Session, enter a title and source, capture events, then choose Finish & save. The app does not silently record another terminal process.'], ['Review and prepare', 'Use Sessions, Search, Retrieve, or Prepare to find evidence and create a handoff.']].map(([title, text], index) => <li key={title} className="flex gap-3 rounded-xl border border-dark-500 bg-dark-900/50 p-4"><span className="mt-0.5 font-mono text-[10px] text-vault-300">0{index + 1}</span><div><h3 className="text-xs font-semibold text-white">{title}</h3><p className="mt-1 text-[11px] leading-5 text-neutral-500">{text}</p></div></li>)}</ol></section><section><h2 className="mb-3 text-sm font-semibold text-white">Multiple projects</h2><p className="text-xs leading-6 text-neutral-500">Use Active project → + Add in the sidebar to register another folder. Switch active folders from the selector. Settings can switch or remove a recent entry; Remove only clears the recent list and does not delete project data.</p></section><Callout title="Sharing storage with the CLI">Point Desktop and your terminal at the exact same folder. Desktop watches that folder's `.contextvault/` files and refreshes when sessions change.</Callout><a href={docsPath('desktop-tabs')} className="inline-flex rounded-lg bg-vault-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-vault-600">Explore all Desktop tabs →</a></div></>
}

function DesktopTabsGuide() {
  return <><Heading eyebrow="Desktop app · Screen reference" title="Every screen and what it is for">The sidebar keeps the active project selected while you move between capture, browsing, retrieval, and maintenance workflows.</Heading><div className="space-y-2">{desktopTabs.map(([title, summary], index) => <article key={title} className="grid gap-2 rounded-xl border border-dark-500 bg-dark-900/55 p-4 sm:grid-cols-[150px_1fr]"><div className="flex items-start gap-2"><span className="font-mono text-[9px] text-neutral-700">{String(index + 1).padStart(2, '0')}</span><h2 className="text-xs font-semibold text-white">{title}</h2></div><p className="text-[11px] leading-5 text-neutral-500">{summary}</p></article>)}</div><div className="mt-6"><Callout title="Where to begin">For a new project, use Dashboard → Add project. To bring browser chats into the app, use Vault Tools → Import conversation export, then Rebuild Index.</Callout></div></>
}

function StorageGuide() {
  return <><Heading eyebrow="Reference · Data" title="Understand storage and privacy">Browser capture and project files remain distinct until you explicitly export and import. Markdown is durable; the generated index can be rebuilt.</Heading><div className="space-y-7"><section><h2 className="mb-3 text-sm font-semibold text-white">Project vault layout</h2><Code language="text">{`.contextvault/
├── config.json
├── memory.md
├── links.json
├── sessions/          # terminal and Desktop Markdown
├── imports/browser/   # imported browser conversations
├── index/             # generated local JSON index
└── exports/           # prepared context and timeline output`}</Code></section><div className="grid gap-3 sm:grid-cols-2"><Card title="Browser extension">Conversation captures live in the browser profile's IndexedDB until the user downloads an export.</Card><Card title="Vault Terminal and Desktop">Sessions, imports, project memory, links, indexes, and prepared context stay under the project's `.contextvault/` directory.</Card><Card title="No automatic cloud sync">The product does not require a ContextVault account, backend, or automatic remote synchronization.</Card><Card title="Inspect before sharing">Markdown is readable and can include prompts, agent output, project details, paths, or customer context. Review exports before sharing.</Card></div><Callout title="Source of truth">Markdown sessions and imports are durable. The generated search index can be rebuilt; prepared handoffs and timelines can be regenerated.</Callout></div></>
}

function TroubleshootingGuide() {
  const items = [
    ['The CLI says command not found', 'Use npx @aliabdm/contextvault init, or install with npm install -g @aliabdm/contextvault. Check that Node.js is installed and reopen the terminal after a global install.'],
    ['No sessions appear in Desktop', 'Check Active project. Terminal and Desktop must use the same folder; each project has its own .contextvault directory.'],
    ['An extension conversation is missing', 'Extension captures are in browser IndexedDB. Export the conversation or ZIP from the popup and import the downloaded file into the intended project.'],
    ['Imported content is missing from Search', 'Rebuild the index from Vault Tools, or run contextvault index from the project root. Verify filters and query text.'],
    ['A session was saved to the wrong project', 'The CLI uses the current working directory. Desktop uses the selected Active project.'],
    ['Remove Project made my project disappear', 'Remove clears only the Desktop recent list. It does not delete the folder or .contextvault data; add the folder again to reopen it.'],
  ]
  return <><Heading eyebrow="Reference · Help" title="Troubleshoot the common paths">Missing context usually means a source has not been exported/imported, the active folder differs, or the index needs rebuilding.</Heading><div className="space-y-2">{items.map(([question, answer], index) => <details key={question} className="group rounded-xl border border-dark-500 bg-dark-900/55 p-4"><summary className="flex cursor-pointer list-none items-start gap-3 text-xs font-semibold text-neutral-200"><span className="font-mono text-[9px] text-vault-300">0{index + 1}</span><span className="flex-1">{question}</span><span className="text-neutral-600 transition group-open:rotate-45">+</span></summary><p className="ml-7 mt-3 text-[11px] leading-6 text-neutral-500">{answer}</p></details>)}</div><div className="mt-6 flex flex-wrap gap-4"><a href="/faq" className="text-xs font-medium text-vault-300 hover:text-white">Read the technical FAQ →</a><a href="https://github.com/aliabdm/ContextVault/issues" target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-vault-300 hover:text-white">Report an issue →</a></div></>
}

const content: Record<string, () => React.ReactNode> = {
  quickstart: Quickstart,
  cli: CliGuide,
  commands: CommandReference,
  extension: ExtensionGuide,
  'import-search': ImportSearchGuide,
  desktop: DesktopGuide,
  'desktop-tabs': DesktopTabsGuide,
  storage: StorageGuide,
  troubleshooting: TroubleshootingGuide,
}

export default function DocsArticle({ slug }: { slug: string }) {
  const Article = content[slug]
  const details = meta[slug]
  if (!Article || !details) return null
  const sequence = ['quickstart', 'cli', 'commands', 'extension', 'import-search', 'desktop', 'desktop-tabs', 'storage', 'troubleshooting']
  const index = sequence.indexOf(slug)
  const previous = sequence[Math.max(index - 1, 0)]
  const next = sequence[Math.min(index + 1, sequence.length - 1)]

  return <main className="mx-auto max-w-4xl px-5 py-8 sm:px-9 sm:py-11 xl:px-12"><div className="mb-7 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-[10px] text-neutral-600"><a href={docsPath()} className="hover:text-white">Documentation</a><span>/</span><span>{details.parent}</span><span>/</span><span className="text-vault-300">{details.title}</span></div><a href={docsPath()} className="text-[10px] font-medium text-neutral-500 transition hover:text-white">← All guides</a></div><div className="mb-8 border-b border-dark-600 pb-7"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-vault-300">{details.parent}</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{details.title}</h1><p className="mt-2 text-xs leading-6 text-neutral-500">{details.summary}</p></div><article className="min-w-0"><Article /></article><nav aria-label="Documentation page navigation" className="mt-10 flex items-center justify-between border-t border-dark-600 pt-5"><a href={docsPath(previous === 'quickstart' && slug === 'quickstart' ? '' : previous)} className="text-[10px] text-neutral-500 hover:text-white">← Previous guide</a><a href={docsPath(next)} className="text-[10px] font-semibold text-vault-300 hover:text-white">Next guide →</a></nav></main>
}
