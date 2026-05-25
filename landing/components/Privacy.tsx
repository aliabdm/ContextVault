export default function Privacy() {
  return (
    <section className="border-t border-dark-600 bg-dark-900 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Privacy</span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Zero trust. Zero compromise.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            ContextVault never sends data anywhere. Your conversations live in your browser, period.
          </p>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-4">
          {[
            { icon: '🚫', label: 'No backend' },
            { icon: '📡', label: 'No telemetry' },
            { icon: '📊', label: 'No analytics' },
            { icon: '🔑', label: 'No accounts' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-dark-500 bg-dark-700/50 px-4 py-3 sm:flex-col sm:items-center sm:gap-2 sm:py-6 sm:text-center"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium text-neutral-300">{item.label}</span>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-lg text-center text-sm leading-relaxed text-neutral-600">
          No data leaves your browser. No servers. No tracking scripts. No third-party APIs.
          This is a local-first tool, built with privacy as a hard requirement — not an afterthought.
        </p>
      </div>
    </section>
  )
}
