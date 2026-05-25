const problems = [
  {
    title: 'Locked inside platforms',
    description: 'Every LLM keeps your conversations in its own walled garden. You cannot easily move or access them.',
  },
  {
    title: 'Lost when switching',
    description: 'Changing models, hitting token limits, or switching accounts means your context is gone.',
  },
  {
    title: 'No portable memory',
    description: 'There is no universal layer that preserves your AI conversations across different providers.',
  },
]

export default function Problem() {
  return (
    <section id="problem" className="border-t border-dark-600 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">The Problem</span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your AI conversations are trapped
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            Every chat you have with an AI is valuable. But today, that context is scattered across platforms,
            accounts, and sessions — with no way to own it.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {problems.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-dark-500 bg-dark-700 p-6"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-dark-500 text-lg text-vault-300">
                ⚡
              </div>
              <h3 className="font-semibold text-neutral-100">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
