const questions = [
  {
    question: 'Does ContextVault use an AI model to answer questions?',
    answer:
      'Not today. The engine retrieves source evidence deterministically from your local index. It does not send context to an API or generate a confident-sounding answer that is not grounded in your files. An optional local-model or provider adapter belongs in a later phase.',
  },
  {
    question: 'How do browser and terminal context become one history?',
    answer:
      'The extension keeps capturing to browser IndexedDB exactly as before. You export Markdown or ZIP, then contextvault import stores the original Markdown under .contextvault/imports/browser/. Terminal sessions already live under .contextvault/sessions/. Both are normalized into ContextSession and ContextEvent records when the local index is built.',
  },
  {
    question: 'What happens if I import the same conversation twice?',
    answer:
      'Browser session identity is derived from conversation_id. Identical content is skipped. A changed export for the same conversation updates the imported source file. ContextVault does not delete your external export.',
  },
  {
    question: 'Where is my data stored?',
    answer:
      'Browser capture stays in local IndexedDB. Project memory, imported browser exports, terminal sessions, links, indexes, and prepared packages stay inside the local .contextvault directory. There is no ContextVault backend, account, telemetry pipeline, or required sync service.',
  },
  {
    question: 'Is importing an untrusted ZIP safe?',
    answer:
      'ZIP entries are read as Markdown and are never extracted to their embedded filesystem paths. Generated filenames are sanitized. Imports are limited to 100 MB per archive, 10 MB per Markdown file, and 1,000 Markdown files. You should still treat the captured text itself as untrusted context.',
  },
  {
    question: 'How does retrieval rank results?',
    answer:
      'The current engine uses exact phrase matches, token matches, event-type importance, and recency. Filters can narrow by event type, source or browser platform, and time. Retrieval is lexical and deterministic; embeddings and semantic search are not silently running in the background.',
  },
  {
    question: 'Does it automatically record every terminal or coding agent?',
    answer:
      'No. Vault Terminal records the context you explicitly enter. Automatic Codex, Claude Code, Cursor, VS Code, and MCP adapters are future integrations. This boundary avoids hidden interception and keeps the current behavior predictable.',
  },
  {
    question: 'What is the source of truth?',
    answer:
      'Markdown is the durable source of truth. The JSON index, project timeline, generated memory block, and prepared context packages can be rebuilt from local Markdown sessions and imports.',
  },
]

const examples = [
  {
    question: 'What happened in the project during the last two weeks?',
    command: 'contextvault history --since 2w',
  },
  {
    question: 'What did Codex decide about authentication?',
    command: 'contextvault decisions auth --source codex',
  },
  {
    question: 'Show Redis problems and failed attempts captured this month.',
    command: 'contextvault problems redis --since 30d',
  },
  {
    question: 'Prepare the relevant auth context for the next agent.',
    command: 'contextvault prepare "auth middleware" --since 30d',
  },
]

export default function TechnicalFaq() {
  return (
    <main>
      <section className="border-b border-dark-600 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-vault-300">Technical FAQ</span>
          <h1 className="mt-4 text-balance text-4xl font-bold text-white sm:text-5xl">How ContextVault works</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-neutral-400">
            ContextVault is a local evidence engine for project context. It captures or imports source material,
            normalizes it into a shared model, and retrieves the relevant history without requiring a backend or AI API.
          </p>

          <div className="mt-10 overflow-x-auto border border-dark-500 bg-dark-900 p-5 font-mono text-sm leading-7 text-neutral-300">
            <pre>{`Browser export + Terminal sessions
                |
      ContextSession / ContextEvent
                |
        Local deterministic index
                |
 History / Retrieve / Prepare / Memory`}</pre>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Questions you can investigate today</h2>
          <div className="mt-8 divide-y divide-dark-500 border-y border-dark-500">
            {examples.map((example) => (
              <div key={example.command} className="grid gap-3 py-5 md:grid-cols-[1fr_1.1fr] md:items-center">
                <p className="text-sm font-medium text-neutral-300">{example.question}</p>
                <code className="overflow-x-auto border border-dark-500 bg-dark-900 px-4 py-3 text-sm text-vault-200">
                  {example.command}
                </code>
              </div>
            ))}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-neutral-500">
            These commands return dated source evidence. They do not fabricate a summary. Use <code>contextvault prepare</code>{' '}
            when you want to hand the retrieved evidence to a coding agent.
          </p>
        </div>
      </section>

      <section className="border-t border-dark-600 bg-dark-800/30 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Architecture, privacy, and limits</h2>
          <div className="mt-8 divide-y divide-dark-500 border-y border-dark-500">
            {questions.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="cursor-pointer list-none pr-8 text-base font-semibold text-neutral-200 marker:hidden">
                  {item.question}
                </summary>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-500">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
