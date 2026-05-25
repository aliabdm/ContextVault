export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-sm text-neutral-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          v1.0.0 — Open Source
        </div>

        <h1 className="text-balance text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl">
          <span className="bg-gradient-to-r from-vault-600 to-vault-400 bg-clip-text text-transparent">
            ContextVault
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-balance text-xl leading-relaxed text-neutral-500 sm:text-2xl">
          Your portable memory layer for AI conversations.
        </p>

        <p className="mx-auto mt-4 max-w-xl text-balance text-neutral-400">
          A local-first Chrome extension that records chats with ChatGPT, Claude, Gemini, and more.
          Export as Markdown or ZIP. Fully private.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <a
            href="https://github.com/aliabdm/llmHistoryObserver"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-neutral-900 px-6 text-sm font-semibold text-white shadow-lg shadow-neutral-900/20 transition-all hover:bg-neutral-800 active:scale-[0.98]"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Install Extension
          </a>

          <a
            href="#features"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-[0.98]"
          >
            Learn More
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-neutral-400">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            No backend
          </span>
          <span className="mx-2 h-1 w-1 rounded-full bg-neutral-300" />
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            No accounts
          </span>
          <span className="mx-2 h-1 w-1 rounded-full bg-neutral-300" />
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            No tracking
          </span>
        </div>

        <div className="mx-auto mt-14 max-w-5xl overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-950 shadow-2xl shadow-neutral-900/20">
          <img
            src="/demo/contextvault-demo.gif"
            alt="ContextVault records an AI chat and exports it as Markdown"
            className="aspect-video w-full bg-neutral-950 object-cover"
          />
        </div>
      </div>
    </section>
  )
}
