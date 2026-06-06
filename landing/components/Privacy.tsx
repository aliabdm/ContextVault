export default function Privacy() {
  return (
    <section className="border-t border-dark-600 bg-dark-900 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Privacy</span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Local-first by default
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            ContextVault stores captured context locally. Browser conversations stay in the browser, and terminal sessions stay in your project.
          </p>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-4">
          {[
            { icon: '01', label: 'No backend' },
            { icon: '02', label: 'No product telemetry' },
            { icon: '03', label: 'No sync required' },
            { icon: '04', label: 'No accounts' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-dark-500 bg-dark-700/50 px-4 py-3 sm:flex-col sm:items-center sm:gap-2 sm:py-6 sm:text-center"
            >
              <span className="text-sm font-bold text-vault-300">{item.icon}</span>
              <span className="text-sm font-medium text-neutral-300">{item.label}</span>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-lg text-center text-sm leading-relaxed text-neutral-600">
          Captured context is saved to local browser storage or local Markdown files. No ContextVault backend,
          no user accounts, and no third-party API is needed to record or export your data.
        </p>
      </div>
    </section>
  )
}
