const platforms = [
  { name: 'ChatGPT', url: '#', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'Claude', url: '#', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Gemini', url: '#', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Perplexity', url: '#', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Poe', url: '#', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { name: 'DeepSeek', url: '#', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { name: 'Copilot', url: '#', color: 'bg-violet-50 text-violet-700 border-violet-200' },
]

export default function Platforms() {
  return (
    <section id="platforms" className="border-t border-neutral-100 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Supported Platforms</span>
        <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Works where you work
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-neutral-500">
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
