const steps = [
  {
    number: '01',
    title: 'DOM Observer + Network Monitor',
    description: 'Dual-path capture tracks both visible DOM changes and network traffic for maximum reliability.',
    color: 'bg-dark-600 text-vault-300 border-dark-500',
    arrow: true,
  },
  {
    number: '02',
    title: 'Stream Assembler',
    description: 'Merges streaming chunks into complete messages, deduplicating overlapping DOM and network data.',
    color: 'bg-dark-600 text-vault-300 border-dark-500',
    arrow: true,
  },
  {
    number: '03',
    title: 'Local Storage (IndexedDB)',
    description: 'Every conversation is persisted locally in your browser. No cloud, no servers.',
    color: 'bg-dark-600 text-vault-300 border-dark-500',
    arrow: true,
  },
  {
    number: '04',
    title: 'Export Engine',
    description: 'Export any conversation as clean Markdown or ZIP with a single click.',
    color: 'bg-vault-500/20 text-vault-300 border-vault-500/30',
    arrow: false,
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-dark-600 bg-dark-800/50 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">How It Works</span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A simple capture pipeline
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            Four stages transform live chat streams into exportable files you own.
          </p>
        </div>

        <div className="mt-14">
          <div className="relative">
            <div className="absolute left-[18px] top-0 hidden h-full w-0.5 bg-dark-500 sm:block" />

            <div className="space-y-6">
              {steps.map((step, i) => (
                <div key={step.number} className="relative flex items-start gap-6 sm:flex-row">
                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${step.color}`}
                  >
                    {step.number}
                  </div>

                  <div className="min-w-0 flex-1 rounded-2xl border border-dark-500 bg-dark-700 p-5">
                    <h3 className="font-semibold text-neutral-100">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-400">{step.description}</p>
                  </div>

                  {step.arrow && (
                    <div className="hidden items-center sm:flex">
                      <svg className="h-6 w-6 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
