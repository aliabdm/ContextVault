export default function EngineDemo() {
  return (
    <section className="border-t border-dark-600 bg-dark-800/30 px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-vault-300">Unified Engine Demo</span>
          <h2 className="mt-4 text-balance text-3xl font-bold text-white sm:text-4xl">
            From scattered sessions to usable project evidence
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            See the complete local workflow: export a browser conversation, import it, combine it with agent work,
            investigate decisions and problems, then prepare focused context for the next agent.
          </p>
        </div>

        <video
          className="mt-12 aspect-video w-full border border-dark-500 bg-dark-900"
          controls
          loop
          muted
          playsInline
          preload="metadata"
          poster="/demo/context-engine-demo.gif"
        >
          <source src="/demo/context-engine-demo.mp4" type="video/mp4" />
          <img src="/demo/context-engine-demo.gif" alt="ContextVault unified Context Engine workflow demo" />
        </video>
      </div>
    </section>
  )
}
