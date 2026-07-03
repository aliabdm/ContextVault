'use client'

import { motion } from 'framer-motion'

export default function DesktopSection() {
  return (
    <section className="border-t border-dark-600 px-6 py-20 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mx-auto max-w-6xl"
      >
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Desktop App
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Manage context without the terminal
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-neutral-400">
            Record, inspect history, filter decisions and problems, retrieve evidence, prepare context, link sessions, and manage projects
            through dedicated GUI workflows. The CLI remains the shared engine—not the user experience.
          </p>
        </div>

<div className="mt-12 rounded-2xl border border-vault-500/30 bg-gradient-to-br from-vault-500/10 via-dark-800/40 to-purple-500/5 p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-vault-300">Start in under a minute</span>
              <h3 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Recording is a visible, explicit action
              </h3>
              <p className="mt-4 text-base leading-relaxed text-neutral-300 sm:text-lg">
                ContextVault never watches your screen or terminal in the background. You decide what becomes durable project memory.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span className="rounded-full border border-vault-500/25 bg-vault-500/10 px-3 py-1 font-semibold text-vault-300">No background capture</span>
                <span className="rounded-full border border-dark-500 bg-dark-700/60 px-3 py-1">Local-only</span>
                <span className="rounded-full border border-dark-500 bg-dark-700/60 px-3 py-1">Package-powered</span>
              </div>
            </div>

            <ol className="grid gap-4 sm:grid-cols-3">
              {[
                ['1', 'Add a project', 'Choose a local folder. Add more later and switch from the sidebar.'],
                ['2', 'Start recording', 'Name the session and choose Codex, Claude Code, Cursor, or another source.'],
                ['3', 'Work visually', 'Use filters and result screens; sessions written by CLI or integrated agents appear live.'],
              ].map(([step, title, description]) => (
                <li key={step} className="relative rounded-2xl border border-dark-500 bg-dark-800/80 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-vault-500 text-base font-bold text-white shadow-lg shadow-vault-500/30">{step}</span>
                  <h4 className="mt-4 text-base font-semibold text-white">{title}</h4>
                  <p className="mt-1.5 text-sm leading-6 text-neutral-400">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <figure className="overflow-hidden rounded-2xl border border-dark-500 bg-dark-900 shadow-2xl shadow-vault-500/5">
            <img
              src="/demo/desktop-walkthrough/step-11.png"
              alt="ContextVault Desktop dashboard with full project context — sessions, events, decisions, problems, and tasks"
              className="aspect-video w-full object-cover object-top"
            />
            <figcaption className="border-t border-dark-500 px-5 py-4">
              <p className="text-sm font-semibold text-white">Dashboard with full project context</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">Sessions, events, decisions, problems, and tasks aggregated from the local index — no cloud, no telemetry.</p>
            </figcaption>
          </figure>

          <div className="grid gap-6 lg:grid-cols-2">
            <figure className="overflow-hidden rounded-2xl border border-dark-500 bg-dark-900 shadow-2xl shadow-vault-500/5">
              <img
                src="/demo/contextvault-desktop-recorder.png"
                alt="ContextVault Desktop recorder automatically classifying User, Agent, Decision, Task, and Problem events"
                className="aspect-video w-full object-cover object-top"
              />
              <figcaption className="border-t border-dark-500 px-5 py-4">
                <p className="text-sm font-semibold text-white">The real package recorder</p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">Start launches the bundled `contextvault record`; entries and output flow through the same CLI code.</p>
              </figcaption>
            </figure>

            <figure className="overflow-hidden rounded-2xl border border-dark-500 bg-dark-900 shadow-2xl shadow-vault-500/5">
              <img
                src="/demo/contextvault-desktop-commands.png"
                alt="ContextVault Desktop History screen with source, type, time, and result filters"
                className="aspect-video w-full object-cover object-top"
              />
              <figcaption className="border-t border-dark-500 px-5 py-4">
                <p className="text-sm font-semibold text-white">GUI first, commands optional</p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">Dedicated History, Decisions, Problems, Tasks, Retrieve, Search, and Prepare screens with copy/export. Raw arguments stay under Advanced CLI Mode.</p>
              </figcaption>
            </figure>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 13.5l-5-3v-5" /></svg>
              Windows
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-neutral-400" fill="currentColor" viewBox="0 0 24 24"><path d="M22.527 17.043c-.472 1.068-1.032 2.056-1.683 2.961-.89 1.236-1.618 2.092-2.188 2.57-.873.803-1.809 1.214-2.805 1.232-.718 0-1.585-.205-2.599-.614-1.015-.41-1.949-.613-2.8-.613-.887 0-1.844.203-2.872.613-1.028.409-1.86.625-2.498.646-1.276.043-2.245-.382-2.907-1.275C1.694 21.136.5 19.22.5 16.514c0-1.902.564-3.498 1.693-4.784.886-1.002 2.032-1.516 3.438-1.542 1.04 0 2.044.386 2.996 1.154.266.216.533.324.8.324.23 0 .519-.12.867-.363.345-.243.643-.442.893-.597.981-.62 2.229-.877 3.742-.772 1.868.142 3.296.868 4.276 2.177-1.706 1.014-2.55 2.434-2.533 4.257.016 1.418.557 2.598 1.622 3.537.47.443.999.785 1.587 1.028-.139.394-.28.758-.424 1.092zm-2.65-7.695c0-.91.344-1.897 1.032-2.961.564-.858 1.27-1.564 2.118-2.116.391-.28.845-.524 1.363-.733.215-.07.413-.113.595-.128-.022.246-.034.493-.034.74 0 1.644.585 2.979 1.753 4.004 1.04.883 2.25 1.32 3.646 1.261.059.2.088.402.088.604 0 1.723-.661 3.2-1.984 4.432-1.03.96-2.165 1.457-3.387 1.488-.764 0-1.607-.2-2.53-.6-.923-.399-1.687-.598-2.293-.598-.163 0-.333.017-.51.051.178-.685.268-1.352.268-1.998z" /></svg>
              macOS source
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" /></svg>
              Linux
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/download/windows"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-vault-500 px-6 text-sm font-semibold text-white shadow-lg shadow-vault-500/30 transition-all hover:bg-vault-600 active:scale-[0.97]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 13.5l-5-3v-5" /></svg>
              Download for Windows
            </a>
            <a
              href="/download/macos"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-dark-500 bg-dark-700/50 px-6 text-sm font-semibold text-neutral-200 transition-all hover:bg-dark-600 active:scale-[0.97]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.527 17.043c-.472 1.068-1.032 2.056-1.683 2.961-.89 1.236-1.618 2.092-2.188 2.57-.873.803-1.809 1.214-2.805 1.232-.718 0-1.585-.205-2.599-.614-1.015-.41-1.949-.613-2.8-.613-.887 0-1.844.203-2.872.613-1.028.409-1.86.625-2.498.646-1.276.043-2.245-.382-2.907-1.275C1.694 21.136.5 19.22.5 16.514c0-1.902.564-3.498 1.693-4.784.886-1.002 2.032-1.516 3.438-1.542 1.04 0 2.044.386 2.996 1.154.266.216.533.324.8.324.23 0 .519-.12.867-.363.345-.243.643-.442.893-.597.981-.62 2.229-.877 3.742-.772 1.868.142 3.296.868 4.276 2.177-1.706 1.014-2.55 2.434-2.533 4.257.016 1.418.557 2.598 1.622 3.537.47.443.999.785 1.587 1.028-.139.394-.28.758-.424 1.092z" /></svg>
              Build for macOS
            </a>
            <a
              href="/download/linux"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-dark-500 bg-dark-700/50 px-6 text-sm font-semibold text-neutral-200 transition-all hover:bg-dark-600 active:scale-[0.97]"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" /></svg>
              Linux
            </a>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-neutral-600">
          Windows (.exe) · Linux (.AppImage) · macOS source build
        </p>
      </motion.div>
    </section>
  )
}
