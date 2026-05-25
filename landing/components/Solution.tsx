export default function Solution() {
  return (
    <section id="solution" className="border-t border-dark-600 bg-dark-800/50 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">The Solution</span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Own every conversation. Across every LLM.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            ContextVault captures your chats in real-time, stores them locally, and lets you export
            everything as clean Markdown or ZIP files — whenever you want.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-dark-500 bg-dark-700 p-8">
            <div className="mb-4 text-3xl text-vault-300">🔄</div>
            <h3 className="font-semibold text-neutral-100">Real-time capture</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              Records conversations automatically as they happen — no manual saving, no extra clicks.
            </p>
          </div>

          <div className="rounded-2xl border border-dark-500 bg-dark-700 p-8">
            <div className="mb-4 text-3xl text-vault-300">🌐</div>
            <h3 className="font-semibold text-neutral-100">Multi-platform</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              Works across ChatGPT, Claude, Gemini, Perplexity, Poe, DeepSeek, and Copilot — all in one extension.
            </p>
          </div>

          <div className="rounded-2xl border border-dark-500 bg-dark-700 p-8">
            <div className="mb-4 text-3xl text-vault-300">📦</div>
            <h3 className="font-semibold text-neutral-100">Export any time</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              Download individual conversations or bulk export as Markdown or ZIP. Structured, clean, ready to use.
            </p>
          </div>

          <div className="rounded-2xl border border-dark-500 bg-dark-700 p-8">
            <div className="mb-4 text-3xl text-vault-300">💾</div>
            <h3 className="font-semibold text-neutral-100">Local-first</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">
              Everything stays in your browser&apos;s IndexedDB. No cloud, no sync, no third-party access.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
