import { describe, expect, it } from 'vitest'
import { createDesktopSessionDocument, parseSessionEvents } from '../desktop/src/main/session-format'

describe('Desktop session format', () => {
  it('writes CLI-compatible Markdown and reads metadata without leaking the comment', () => {
    const now = new Date('2026-07-03T08:00:00.000Z')
    const result = createDesktopSessionDocument('C:\\Projects\\ContextVault', {
      title: 'Fix auth redirect',
      source: 'codex',
      startedAt: '2026-07-03T07:55:00.000Z',
      events: [
        { type: 'note', content: 'Inspected middleware order.', createdAt: '2026-07-03T07:56:00.000Z' },
        { type: 'decision', content: 'Keep authentication in middleware.', createdAt: '2026-07-03T07:57:00.000Z' },
      ],
    }, { now, id: 'desktop-test-abc123' })

    expect(result.session).toMatchObject({
      id: 'desktop-test-abc123',
      title: 'Fix auth redirect',
      source: 'codex',
      eventCount: 2,
      startedAt: '2026-07-03T07:55:00.000Z',
      endedAt: '2026-07-03T08:00:00.000Z',
    })
    expect(result.markdown).toContain('event_count: 2')
    expect(result.markdown).toContain('cwd: "C:\\\\Projects\\\\ContextVault"')

    const events = parseSessionEvents(result.markdown)
    expect(events).toEqual([
      { type: 'note', content: 'Inspected middleware order.', createdAt: '2026-07-03T07:56:00.000Z' },
      { type: 'decision', content: 'Keep authentication in middleware.', createdAt: '2026-07-03T07:57:00.000Z' },
    ])
    expect(events.some((event) => event.content.includes('context-event'))).toBe(false)
  })

  it('reads both compact and blank-line metadata layouts used by existing sessions', () => {
    const compact = `## Task
<!-- context-event: {"createdAt":"2026-07-03T08:00:00.000Z"} -->
Add a regression test.`
    const spaced = `## Problem

<!-- context-event: {"createdAt":"2026-07-03T08:01:00.000Z"} -->
Redirect loop reproduced.`

    expect(parseSessionEvents(compact)[0]).toMatchObject({ type: 'task', content: 'Add a regression test.' })
    expect(parseSessionEvents(spaced)[0]).toMatchObject({ type: 'problem', content: 'Redirect loop reproduced.' })
  })

  it('does not leak malformed metadata comments into visible event content', () => {
    const markdown = `## Note

<!-- context-event: {invalid-json} -->
Keep the useful note.`

    expect(parseSessionEvents(markdown)).toEqual([{ type: 'note', content: 'Keep the useful note.' }])
  })

  it('rejects empty or unsupported event collections', () => {
    expect(() => createDesktopSessionDocument('C:\\Project', {
      title: 'Empty',
      events: [{ type: 'unsupported', content: 'Ignored' }],
    })).toThrow('Add at least one event')
  })
})
