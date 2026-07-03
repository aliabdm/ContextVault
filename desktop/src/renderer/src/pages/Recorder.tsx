import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { announceProjectChange } from '../components/ProjectSwitcher'
import { classifyDesktopEvent, type EventType } from '../lib/event-classifier'

type RecordedEvent = {
  type: EventType
  content: string
  createdAt: string
}

const eventTypes: Array<{ value: EventType; label: string; hint: string }> = [
  { value: 'user', label: 'User', hint: 'Prompt, request, or requirement' },
  { value: 'agent', label: 'Agent', hint: 'AI response, code change, or result' },
  { value: 'decision', label: 'Decision', hint: 'An important choice and why' },
  { value: 'task', label: 'Task', hint: 'A follow-up or action item' },
  { value: 'problem', label: 'Problem', hint: 'A bug, blocker, or failed attempt' },
  { value: 'note', label: 'Note', hint: 'Any other useful context' },
]

type ClassificationMode = 'auto' | EventType

export default function Recorder() {
  const navigate = useNavigate()
  const [projectPath, setProjectPath] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('codex')
  const [recording, setRecording] = useState(false)
  const [recorderId, setRecorderId] = useState('')
  const [cliOutput, setCliOutput] = useState('')
  const [classificationMode, setClassificationMode] = useState<ClassificationMode>('auto')
  const [content, setContent] = useState('')
  const [events, setEvents] = useState<RecordedEvent[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const projectName = projectPath?.split(/[\\/]/).filter(Boolean).pop() || ''
  const automaticClassification = classifyDesktopEvent(content)
  const resolvedEventType = classificationMode === 'auto' ? automaticClassification.type : classificationMode
  const selectedType = eventTypes.find((item) => item.value === resolvedEventType)!

  useEffect(() => {
    window.contextVault?.getProjectPath().then(setProjectPath)
  }, [])

  useEffect(() => {
    const removeOutputListener = window.contextVault?.onRecorderOutput((payload) => {
      if (payload.recorderId === recorderId) setCliOutput((current) => (current + payload.data).slice(-12_000))
    })
    const removeExitListener = window.contextVault?.onRecorderExit((payload) => {
      if (payload.recorderId !== recorderId) return
      setRecording(false)
      setSaving(false)
      setRecorderId('')
      if (payload.exitCode === 0) navigate('/sessions')
      else setError(`The ContextVault recorder exited with code ${payload.exitCode}.`)
    })
    return () => {
      removeOutputListener?.()
      removeExitListener?.()
      if (recorderId) void window.contextVault?.cancelRecorder(recorderId)
    }
  }, [navigate, recorderId])

  const openProject = async () => {
    const nextPath = await window.contextVault?.openProject()
    if (nextPath) {
      setProjectPath(nextPath)
      announceProjectChange()
    }
  }

  const startRecording = async () => {
    if (!title.trim()) {
      setError('Give the session a short title first.')
      return
    }
    setError('')
    setCliOutput('Starting contextvault record...\n')
    const result = await window.contextVault?.startRecorder({ title: title.trim(), source })
    if (!result?.success || !result.recorderId) {
      setError(result?.error || 'Unable to start contextvault record.')
      return
    }
    setRecorderId(result.recorderId)
    setRecording(true)
  }

  const addEvent = async (): Promise<boolean> => {
    if (!content.trim()) {
      setError('Write or paste some context before adding the event.')
      return false
    }
    if (!recorderId) {
      setError('The ContextVault CLI recorder is not active.')
      return false
    }
    const value = content.trim()
    const result = await window.contextVault?.sendRecorderCommand(recorderId, `/${resolvedEventType} ${value}`)
    if (!result?.success) {
      setError(result?.error || 'The CLI recorder rejected this event.')
      return false
    }
    setEvents((current) => [...current, { type: resolvedEventType, content: value, createdAt: new Date().toISOString() }])
    setContent('')
    setError('')
    return true
  }

  const finishRecording = async () => {
    const hasPendingEvent = Boolean(content.trim())
    if (events.length === 0 && !hasPendingEvent) {
      setError('Add at least one event before saving the session.')
      return
    }
    if (hasPendingEvent && !(await addEvent())) return
    if (!recorderId) return

    setSaving(true)
    setError('')
    const result = await window.contextVault?.finishRecorder(recorderId)
    if (!result?.success) {
      setSaving(false)
      setError(result?.error || 'Unable to finish contextvault record.')
      return
    }
    navigate('/sessions')
  }

  if (!projectPath) {
    return (
      <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dark-600 bg-dark-700 text-2xl text-vault-300">●</div>
        <h1 className="mt-5 text-2xl font-bold text-white">Choose a project first</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-400">
          Every recording belongs to a local project vault. Select a folder and ContextVault will create its `.contextvault` storage safely.
        </p>
        <button onClick={openProject} className="mt-6 rounded-xl bg-vault-500 px-6 py-3 text-sm font-semibold text-white hover:bg-vault-600">
          Open project folder
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${recording ? 'animate-pulse bg-red-400' : 'bg-neutral-600'}`} />
            <h1 className="text-2xl font-bold text-white">Session Recorder</h1>
          </div>
          <p className="mt-1 text-sm text-neutral-500">{projectName} · powered by the bundled <code>contextvault record</code> command</p>
        </div>
        {recording && (
          <button
            onClick={finishRecording}
            disabled={saving}
            className="rounded-xl bg-vault-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-vault-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Finish & save'}
          </button>
        )}
      </div>

      <section className="rounded-xl border border-blue-500/25 bg-blue-500/5 px-4 py-3 text-xs leading-5 text-neutral-400">
        <strong className="text-blue-300">What Record captures:</strong> manual events you add here are sent to the bundled ContextVault package recorder. Desktop also watches this project's <code className="text-vault-300">.contextvault</code> files, so sessions written by the CLI or an integrated agent appear automatically. Codex, Claude, and Cursor are not silently intercepted; they must write through ContextVault CLI or compatible watched files.
      </section>

      {!recording ? (
        <div className="rounded-2xl border border-dark-600 bg-dark-700/40 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">Session title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Fix authentication redirect"
                autoFocus
                className="w-full rounded-xl border border-dark-600 bg-dark-800 px-4 py-3 text-sm text-white outline-none focus:border-vault-500/70"
              />
            </label>
            <label>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">Context source</span>
              <select value={source} onChange={(event) => setSource(event.target.value)} className="w-full rounded-xl border border-dark-600 bg-dark-800 px-4 py-3 text-sm text-neutral-200 outline-none focus:border-vault-500/70">
                <option value="codex">Codex</option>
                <option value="claude-code">Claude Code</option>
                <option value="cursor">Cursor</option>
                <option value="terminal">Terminal</option>
                <option value="human">Human notes</option>
                <option value="other">Other</option>
              </select>
            </label>
            <div className="rounded-xl border border-dark-600 bg-dark-800/60 p-4 text-xs leading-5 text-neutral-500">
              This button starts the same interactive recorder shipped in the npm package, with this project as its working directory.
            </div>
          </div>
          {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
          <button onClick={startRecording} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/10 transition-colors hover:bg-red-600">
            <span className="h-2.5 w-2.5 rounded-full bg-white" /> Start recording
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-dark-600 bg-dark-700/40 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-vault-500/20 bg-vault-500/5 px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-vault-300">Automatic classification is on</p>
                <p className="mt-1 text-[11px] text-neutral-500">ContextVault classifies each entry locally. Nothing is sent off-device.</p>
              </div>
              <label className="flex items-center gap-2 text-[11px] text-neutral-500">
                Classification
                <select
                  aria-label="Classification mode"
                  value={classificationMode}
                  onChange={(event) => setClassificationMode(event.target.value as ClassificationMode)}
                  className="rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-xs text-neutral-200 outline-none focus:border-vault-500/70"
                >
                  <option value="auto">Auto (recommended)</option>
                  {eventTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Quick entry</span>
                  <span aria-live="polite" className="rounded-md bg-vault-500/10 px-2 py-1 text-[10px] font-semibold uppercase text-vault-300">
                    {classificationMode === 'auto' ? `Auto: ${selectedType.label}` : `Override: ${selectedType.label}`}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-600">{classificationMode === 'auto' ? automaticClassification.reason : selectedType.hint}</span>
              </div>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                    event.preventDefault()
                    void addEvent()
                  }
                }}
                placeholder="Write or paste context — its type is detected automatically..."
                className="min-h-44 w-full resize-y rounded-xl border border-dark-600 bg-dark-800 px-4 py-3 text-sm leading-6 text-neutral-200 outline-none placeholder:text-neutral-600 focus:border-vault-500/70"
              />
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-[11px] text-neutral-600">Ctrl/Cmd + Enter to classify and add</span>
                <button onClick={addEvent} className="rounded-lg border border-vault-500/30 bg-vault-500/10 px-4 py-2 text-xs font-semibold text-vault-300 hover:bg-vault-500/20">
                  Classify & add
                </button>
              </div>
            </div>
            {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">Captured events</h2>
              <span className="text-xs text-neutral-600">{events.length} added</span>
            </div>
            {events.length === 0 ? (
              <div className="rounded-xl border border-dashed border-dark-600 py-10 text-center text-sm text-neutral-600">Your captured timeline will appear here.</div>
            ) : (
              <div className="space-y-2">
                {events.map((event, index) => (
                  <div key={`${event.createdAt}-${index}`} className="flex items-start gap-3 rounded-xl border border-dark-600 bg-dark-700/40 p-4">
                    <span className="rounded-md bg-vault-500/10 px-2 py-1 text-[10px] font-semibold uppercase text-vault-300">{event.type}</span>
                    <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-6 text-neutral-300">{event.content}</p>
                    <span className="text-[10px] uppercase text-emerald-500/70">sent to CLI</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {recording && cliOutput && (
        <details className="rounded-xl border border-dark-600 bg-dark-900/70 px-4 py-3">
          <summary className="cursor-pointer text-xs font-semibold text-neutral-400">Live package output</summary>
          <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-neutral-500">{cliOutput}</pre>
        </details>
      )}

      <div className="rounded-xl border border-dark-600/70 bg-dark-900/40 px-4 py-3 text-xs leading-5 text-neutral-500">
        Desktop launches the bundled <code className="text-vault-300">contextvault record</code> process; it does not maintain a separate recording format or database.
      </div>
    </div>
  )
}
