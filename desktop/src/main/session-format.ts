export const SESSION_EVENT_TYPES = ['user', 'agent', 'note', 'decision', 'task', 'problem'] as const

export type SessionEventType = typeof SESSION_EVENT_TYPES[number]

export type DesktopSessionInput = {
  title?: string
  source?: string
  startedAt?: string
  events?: Array<{
    type?: string
    content?: string
    createdAt?: string
  }>
}

export type DesktopSessionDocument = {
  session: {
    id: string
    title: string
    source: string
    eventCount: number
    filename: string
    startedAt: string
    endedAt: string
  }
  markdown: string
}

function yamlValue(value: unknown): string {
  const text = String(value ?? '')
  if (!text) return '""'
  if (/[:#{}[\],&*?|>!%@`"'\n]/.test(text)) {
    return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }
  return text
}

function slug(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || 'untitled'
}

function sessionFilename(date: Date, source: string, title: string, id: string): string {
  const stamp = date.toISOString().slice(0, 16).replace('T', '-').replace(':', '-')
  return `${stamp}-${slug(source)}-${slug(title)}-${id.slice(-6)}.md`
}

export function createDesktopSessionDocument(
  projectPath: string,
  input: DesktopSessionInput,
  options: { now?: Date; id?: string } = {},
): DesktopSessionDocument {
  const now = options.now ?? new Date()
  const nowIso = now.toISOString()
  const allowedTypes = new Set<string>(SESSION_EVENT_TYPES)
  const events = Array.isArray(input?.events)
    ? input.events
      .filter((event) => allowedTypes.has(event?.type || '') && typeof event?.content === 'string' && event.content.trim())
      .slice(0, 1000)
      .map((event) => ({
        type: event.type as SessionEventType,
        content: event.content!.trim().slice(0, 1_000_000),
        createdAt: typeof event.createdAt === 'string' && !Number.isNaN(new Date(event.createdAt).getTime())
          ? new Date(event.createdAt).toISOString()
          : nowIso,
      }))
    : []

  if (events.length === 0) throw new Error('Add at least one event before saving the session.')

  const requestedStart = typeof input?.startedAt === 'string' ? input.startedAt : nowIso
  const startedDate = new Date(requestedStart)
  const startedAt = Number.isNaN(startedDate.getTime()) ? nowIso : startedDate.toISOString()
  const endedAt = nowIso
  const title = String(input?.title || '').trim().slice(0, 200) || 'Untitled desktop session'
  const source = String(input?.source || '').trim().slice(0, 80) || 'human'
  const id = options.id ?? `desktop-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  const filename = sessionFilename(new Date(startedAt), source, title, id)
  const lines = [
    '---',
    `id: ${yamlValue(id)}`,
    `title: ${yamlValue(title)}`,
    `source: ${yamlValue(source)}`,
    `started_at: ${yamlValue(startedAt)}`,
    `ended_at: ${yamlValue(endedAt)}`,
    `cwd: ${yamlValue(projectPath)}`,
    'git_branch: ""',
    `event_count: ${events.length}`,
    '---',
    '',
  ]

  for (const event of events) {
    lines.push(`## ${event.type.charAt(0).toUpperCase()}${event.type.slice(1)}`)
    lines.push('')
    lines.push(`<!-- context-event: ${JSON.stringify({ createdAt: event.createdAt })} -->`)
    lines.push(event.content)
    lines.push('')
  }

  return {
    session: { id, title, source, eventCount: events.length, filename, startedAt, endedAt },
    markdown: lines.join('\n'),
  }
}

export function parseSessionEvents(content: string): any[] {
  const events: any[] = []
  const headingRegex = /^##\s+(.+)$/
  const lines = content.split('\n')
  let currentType = ''
  let currentContent: string[] = []
  let currentMeta: any = {}

  const pushCurrentEvent = () => {
    const normalizedContent = currentContent.join('\n').trim()
    if (!currentType || !normalizedContent) return
    events.push({ type: currentType, content: normalizedContent, ...currentMeta })
  }

  for (let i = 0; i < lines.length; i++) {
    const headingMatch = lines[i].match(headingRegex)
    if (headingMatch) {
      pushCurrentEvent()
      currentType = headingMatch[1].trim().toLowerCase()
      currentContent = []
      currentMeta = {}

      let metadataLine = i + 1
      while (metadataLine < lines.length && !lines[metadataLine].trim()) metadataLine++
      const metadataMatch = lines[metadataLine]?.match(/^<!--\s*context-event:\s*(\{.*?\})\s*-->$/)
      if (metadataMatch) {
        i = metadataLine
        try {
          currentMeta = JSON.parse(metadataMatch[1])
        } catch { /* keep malformed metadata as non-content */ }
      }
    } else if (currentType) {
      currentContent.push(lines[i])
    }
  }

  pushCurrentEvent()
  return events
}
