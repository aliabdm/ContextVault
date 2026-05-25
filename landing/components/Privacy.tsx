const guarantees = [
  { label: 'No backend', icon: '🚫' },
  { label: 'No telemetry', icon: '📡' },
  { label: 'No analytics', icon: '📊' },
  { label: 'No accounts', icon: '🔑' },
  { label: 'No data leaves your browser', icon: '🔒' },
]

export default function Privacy() {
  return (
    <section id="privacy" className="border-t border-dark-600 bg-dark-900 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Privacy</span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built for privacy, by design
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            ContextVault is local-first and zero-trust. Your conversations never leave your browser
            unless you explicitly export them.
          </p>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-5">
          {guarantees.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-dark-500 bg-dark-700 px-4 py-3 sm:flex-col sm:items-center sm:gap-2 sm:py-6 sm:text-center"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium text-neutral-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
