import { describe, expect, it } from 'vitest'
import { createDesktopSessionDocument, parseSessionEvents } from '../desktop/src/main/session-format'
import { classifyDesktopEvent } from '../desktop/src/renderer/src/lib/event-classifier'

describe('Desktop automatic event classification', () => {
  it('classifies requests, results, decisions, tasks, and problems locally', () => {
    expect(classifyDesktopEvent('Can you add project switching?').type).toBe('user')
    expect(classifyDesktopEvent('Implemented the persistent project switcher.').type).toBe('agent')
    expect(classifyDesktopEvent('We decided to keep the shared Markdown format.').type).toBe('decision')
    expect(classifyDesktopEvent('Publish the Windows and Linux installers.').type).toBe('task')
    expect(classifyDesktopEvent('The metadata parser has a regression.').type).toBe('problem')
  })

  it('honors explicit transcript labels and falls back to a note', () => {
    expect(classifyDesktopEvent('Assistant: The build is green.')).toMatchObject({ type: 'agent', confidence: 'explicit' })
    expect(classifyDesktopEvent('Decision - Ship version 1.6.1.')).toMatchObject({ type: 'decision', confidence: 'explicit' })
    expect(classifyDesktopEvent('Useful context for the next session.').type).toBe('note')
  })

  it('recognizes common Arabic intent without sending text to a service', () => {
    expect(classifyDesktopEvent('بدي تضيف تسجيل أوتوماتيكي').type).toBe('user')
    expect(classifyDesktopEvent('قررنا نخلي التصنيف محلي').type).toBe('decision')
    expect(classifyDesktopEvent('في مشكلة بالبارسر').type).toBe('problem')
  })
})

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
