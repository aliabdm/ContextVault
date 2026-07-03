import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { announceProjectChange } from '../components/ProjectSwitcher'

type EventType = 'user' | 'agent' | 'note' | 'decision' | 'task' | 'problem'

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

export default function Recorder() {
  const navigate = useNavigate()
  const [projectPath, setProjectPath] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('codex')
  const [startedAt, setStartedAt] = useState('')
  const [recording, setRecording] = useState(false)
  const [eventType, setEventType] = useState<EventType>('note')
  const [content, setContent] = useState('')
  const [events, setEvents] = useState<RecordedEvent[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const projectName = projectPath?.split(/[\\/]/).filter(Boolean).pop() || ''
  const selectedType = useMemo(() => eventTypes.find((item) => item.value === eventType)!, [eventType])

  useEffect(() => {
    window.contextVault?.getProjectPath().then(setProjectPath)
  }, [])

  const openProject = async () => {
    const nextPath = await window.contextVault?.openProject()
    if (nextPath) {
      setProjectPath(nextPath)
      announceProjectChange()
    }
  }

  const startRecording = () => {
    if (!title.trim()) {
      setError('Give the session a short title first.')
      return
    }
    setError('')
    setStartedAt(new Date().toISOString())
    setRecording(true)
  }

  const addEvent = () => {
    if (!content.trim()) {
      setError('Write or paste some context before adding the event.')
      return
    }
    setEvents((current) => [...current, { type: eventType, content: content.trim(), createdAt: new Date().toISOString() }])
    setContent('')
    setError('')
  }

  const removeEvent = (index: number) => {
    setEvents((current) => current.filter((_, eventIndex) => eventIndex !== index))
  }

  const finishRecording = async () => {
    const finalEvents: RecordedEvent[] = content.trim()
      ? [...events, { type: eventType, content: content.trim(), createdAt: new Date().toISOString() }]
      : events
    if (finalEvents.length === 0) {
      setError('Add at least one event before saving the session.')
      return
    }

    setSaving(true)
    setError('')
    const result = await window.contextVault?.saveSession({ title, source, startedAt, events: finalEvents })
    setSaving(false)
    if (!result?.success) {
      setError(result?.error || 'Unable to save the session.')
      return
    }
    navigate(`/sessions/${encodeURIComponent(result.session.id)}`)
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
          <p className="mt-1 text-sm text-neutral-500">{projectName} · saved locally as compatible ContextVault Markdown</p>
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
              ContextVault records only what you explicitly add. It does not listen to your screen, terminal, microphone, or clipboard.
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
            <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
              <div>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-neutral-400">Event type</span>
                <div className="space-y-1.5">
                  {eventTypes.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setEventType(item.value)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${eventType === item.value ? 'bg-vault-500/15 text-vault-300' : 'text-neutral-400 hover:bg-dark-700 hover:text-neutral-200'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{selectedType.label}</span>
                  <span className="text-[11px] text-neutral-600">{selectedType.hint}</span>
                </div>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  onKeyDown={(event) => {
                    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                      event.preventDefault()
                      addEvent()
                    }
                  }}
                  placeholder="Write or paste the context worth preserving..."
                  className="min-h-44 w-full resize-y rounded-xl border border-dark-600 bg-dark-800 px-4 py-3 text-sm leading-6 text-neutral-200 outline-none placeholder:text-neutral-600 focus:border-vault-500/70"
                />
                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="text-[11px] text-neutral-600">Ctrl/Cmd + Enter to add</span>
                  <button onClick={addEvent} className="rounded-lg border border-vault-500/30 bg-vault-500/10 px-4 py-2 text-xs font-semibold text-vault-300 hover:bg-vault-500/20">
                    Add {selectedType.label}
                  </button>
                </div>
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
                    <button onClick={() => removeEvent(index)} className="text-xs text-neutral-600 hover:text-red-300" aria-label={`Remove ${event.type} event`}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="rounded-xl border border-dark-600/70 bg-dark-900/40 px-4 py-3 text-xs leading-5 text-neutral-500">
        Prefer the terminal? Run <code className="text-vault-300">contextvault record</code> inside this project. Desktop and CLI write the same `.contextvault/sessions/` format.
      </div>
    </div>
  )
}
