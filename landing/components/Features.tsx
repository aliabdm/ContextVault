const features = [
  {
    icon: '🧠',
    title: 'Real-time capture engine',
    description: 'Hybrid DOM + Network monitoring captures every message as it streams in.',
  },
  {
    icon: '🌍',
    title: 'Multi-LLM support',
    description: 'Works with ChatGPT, Claude, Gemini, Perplexity, Poe, DeepSeek, and Copilot.',
  },
  {
    icon: '📝',
    title: 'Markdown & ZIP export',
    description: 'Clean, structured Markdown files or ZIP archives — ready for notes, repos, or LLM prompts.',
  },
  {
    icon: '🔒',
    title: 'Local-only storage',
    description: 'IndexedDB keeps everything in your browser. No cloud, no sync, no data leaves your machine.',
  },
  {
    icon: '🛡️',
    title: 'Privacy-first design',
    description: 'No backend. No telemetry. No analytics. No accounts. Zero data collection.',
  },
]

export default function Features() {
  return (
    <section id="features" className="border-t border-dark-600 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Features</span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need, nothing you don&apos;t
          </h2>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-dark-500 bg-dark-700 p-6 transition-shadow hover:shadow-lg hover:shadow-vault-500/5"
            >
              <div className="mb-3 text-2xl">{feature.icon}</div>
              <h3 className="font-semibold text-neutral-100">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
