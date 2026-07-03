interface Event {
  type: string
  content: string
  createdAt?: string
}

interface EventTimelineProps {
  events: Event[]
}

const eventStyles: Record<string, { icon: string; label: string; color: string }> = {
  user: { icon: '💬', label: 'User', color: 'border-blue-500/30 bg-blue-500/5' },
  agent: { icon: '🤖', label: 'Agent', color: 'border-vault-500/30 bg-vault-500/5' },
  assistant: { icon: '🤖', label: 'Assistant', color: 'border-vault-500/30 bg-vault-500/5' },
  decision: { icon: '✅', label: 'Decision', color: 'border-emerald-500/30 bg-emerald-500/5' },
  task: { icon: '📋', label: 'Task', color: 'border-orange-500/30 bg-orange-500/5' },
  problem: { icon: '⚠️', label: 'Problem', color: 'border-red-500/30 bg-red-500/5' },
  note: { icon: '📝', label: 'Note', color: 'border-purple-500/30 bg-purple-500/5' },
}

export default function EventTimeline({ events }: EventTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-dark-600 py-12 text-sm text-neutral-500">
        No events in this session
      </div>
    )
  }

  return (
    <div className="relative space-y-0">
      {events.map((event, idx) => {
        const style = eventStyles[event.type] || eventStyles.note
        return (
          <div key={idx} className="relative flex gap-4 pb-6 pl-8">
            {idx < events.length - 1 && (
              <div className="absolute bottom-0 left-[17px] top-6 w-px bg-dark-600" />
            )}
            <div className="absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full border border-dark-600 bg-dark-800 text-sm">
              {style.icon}
            </div>
            <div className={`min-w-0 flex-1 rounded-xl border ${style.color} p-4`}>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  {style.label}
                </span>
                {event.createdAt && (
                  <span className="text-xs text-neutral-600">
                    {new Date(event.createdAt).toLocaleString()}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-300">
                {event.content}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
