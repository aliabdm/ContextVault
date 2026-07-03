# I Built a Local-First Recorder for AI Coding Sessions

Browser AI chats were only half of the problem.

Over the last year, my AI workflow moved from normal ChatGPT conversations into a messy mix of tools:

- ChatGPT and Claude in the browser
- Codex in my editor
- Claude Code in the terminal
- Cursor decisions
- Random debugging notes
- Long sessions that disappear when a context window ends

The problem is not just "chat history".

The problem is continuity.

I kept losing the reasoning behind decisions, the exact bug context, the last thing an agent tried, and the small project constraints that are obvious today but forgotten tomorrow.

So I added a new surface to ContextVault:

## Vault Terminal

Vault Terminal is a local-first terminal context recorder.

It does not call an AI API.
It does not summarize.
It does not upload anything.
It just preserves raw human, AI, and agent work sessions as Markdown.

The idea is simple:

> Git tracks code. ContextVault tracks context.

## Why Terminal Sessions Matter

AI work is no longer only happening in browser tabs.

Developers are now working with terminal-native agents, editor agents, and coding assistants that can inspect files, run commands, and modify projects.

But the context around that work is fragile:

- Why did we choose this approach?
- What did the agent try before the final fix?
- Which problem was still unresolved?
- What tasks should the next agent continue?
- What raw notes should survive beyond the current context window?

When that context disappears, the next session starts from zero.

Vault Terminal is my first step toward fixing that.

## How It Works

Inside any repository, initialize a local vault:

```bash
npm run vault:init
```

This creates:

```text
.contextvault/
  config.json
  memory.md
  sessions/
  exports/
```

Then start recording:

```bash
npm run vault:record
```

The recorder accepts simple commands:

```text
/source codex
/title Fix assistant export
/user The exported Markdown contains the question but not the answer.
/agent Added flushCapture before export so pending assistant text is finalized.
/decision Keep terminal recording independent from browser capture.
/task Run tests and rebuild the Chrome extension.
/problem Screen recording is not available in this environment.
/end
```

It saves a Markdown session under:

```text
.contextvault/sessions/YYYY-MM-DD-HH-mm-source-title.md
```

The file keeps YAML frontmatter and chronological events:

```md
---
id: vt-...
title: Fix assistant export
source: codex
started_at: ...
ended_at: ...
event_count: 5
---

## User

The exported Markdown contains the question but not the answer.

## Agent

Added flushCapture before export so pending assistant text is finalized.

## Decision

Keep terminal recording independent from browser capture.
```

No rewriting.
No AI processing.
No cloud sync.

Just raw context you can keep.

## Exporting Context For The Next Agent

When you want to continue work somewhere else:

```bash
npm run vault:export
```

This creates:

```text
.contextvault/exports/contextvault-terminal-export.md
```

The export combines:

- `memory.md`
- latest terminal sessions
- decisions
- tasks
- problems

That file can be pasted into Codex, Claude Code, Cursor, ChatGPT, or any other agent.

The point is not to replace those tools.

The point is to carry memory between them.

## Why Local-First

Context can be sensitive.

It may include code decisions, architecture notes, customer issues, logs, environment details, or private debugging steps.

So Vault Terminal follows the same principles as the browser extension:

- no backend
- no auth
- no telemetry
- no analytics
- no external AI API calls
- Markdown files you own

The `.contextvault/` folder is ignored by git by default because raw sessions can contain private information.

## What This Unlocks

This is still an MVP, but the direction is bigger:

- browser conversations
- terminal agents
- editor sessions
- project memory
- portable context bundles

All under one idea:

> Your AI workflow should not reset every time you switch tools.

ContextVault started as a browser extension for exporting LLM chats.

Vault Terminal turns it into the beginning of a local memory layer for AI-assisted development.

Git remembers what changed.

ContextVault remembers why.
