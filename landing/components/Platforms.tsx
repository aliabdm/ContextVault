const platforms = [
  { name: 'ChatGPT', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { name: 'Claude', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { name: 'Gemini', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { name: 'Perplexity', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { name: 'Poe', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { name: 'DeepSeek', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { name: 'Copilot', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
]

export default function Platforms() {
  return (
    <section id="platforms" className="border-t border-dark-600 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Supported Platforms</span>
        <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Works where you work
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-neutral-400">
          One extension covers all major LLM platforms. No configuration needed.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {platforms.map((p) => (
            <span
              key={p.name}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium ${p.color}`}
            >
              <span className="h-2 w-2 rounded-full currentColor opacity-60" />
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
