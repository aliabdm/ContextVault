export default function MacosDownload() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-dark-800 px-6">
      <section className="max-w-lg rounded-2xl border border-dark-600 bg-dark-900 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-vault-500/20 bg-vault-500/10 text-2xl text-vault-300">
          macOS
        </div>
        <h1 className="text-2xl font-bold text-white">Build ContextVault for macOS</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">
          A signed and notarized DMG is not published yet. The Desktop app builds locally from the same open-source code used for Windows and Linux.
        </p>
        <code className="mt-6 block rounded-xl border border-dark-600 bg-dark-800 px-4 py-3 text-sm text-vault-300">
          cd desktop &amp;&amp; npm install &amp;&amp; npm run package:mac
        </code>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="https://github.com/aliabdm/ContextVault#desktop-app-recommended" target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-xl bg-vault-500 px-5 text-sm font-semibold text-white hover:bg-vault-600">
            Build Instructions
          </a>
          <a href="/download" className="inline-flex h-10 items-center rounded-xl border border-dark-600 bg-dark-700 px-5 text-sm font-medium text-neutral-300 hover:bg-dark-600">
            Other Platforms
          </a>
        </div>
      </section>
    </main>
  )
}
