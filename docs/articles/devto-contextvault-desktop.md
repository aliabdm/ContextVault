---
title: "The Code Was in Git. The AI Reasoning Was Gone."
published: false
description: "How a lost trail of AI decisions became ContextVault—and how I rebuilt its Electron app without creating a second product."
tags: electron, node, opensource, ai
cover_image: https://context-vault-two.vercel.app/demo/desktop-walkthrough/step-11.png
---

I reopened an old project and found a working authentication implementation.

What I could not find was the reason it looked that way.

The commits showed the final code, but not:

- Why one approach had been chosen
- Which fixes had already failed
- What the coding agent warned me about
- Which tasks had been postponed

The answers were scattered across a ChatGPT thread, a Codex session, and a terminal that no longer existed.

This is not only a documentation problem. It is a structural problem in AI-assisted development.

We use several tools to produce one project, but every tool keeps a separate, temporary memory.

That experience became ContextVault.

## First: what is ContextVault?

ContextVault is an open-source, local-first memory layer for AI work.

It preserves useful context from browser LLM conversations, terminals, and coding-agent sessions, then makes that context searchable and reusable in later sessions.

Think of the distinction this way:

```text
Git:          what changed in the code?
ContextVault: why did we change it, what failed, and what should happen next?
```

ContextVault has three user-facing surfaces:

1. **Browser Capture** — a Chrome extension that stores supported LLM conversations locally and exports Markdown or ZIP.
2. **Vault Terminal** — an npm CLI for recording agent work, decisions, tasks, problems, and notes inside a project.
3. **ContextVault Desktop** — a visual app for recording, browsing, retrieving, preparing, and exporting that project context.

There is no required account or ContextVault backend. Browser data stays in the browser. Project sessions stay in local Markdown.

## A concrete example

Initialize ContextVault inside a repository:

```bash
npx @aliabdm/contextvault init
contextvault record
```

During the session, preserve only the context that may matter later:

```text
/title Fix authentication callback
/source codex
/user The login redirects back to the sign-in page.
/agent The session cookie is missing during the callback.
/decision Keep authentication checks in middleware.
/problem The previous SameSite change did not fix the callback.
/task Add a regression test for the redirect loop.
/end
```

The result is readable Markdown under:

```text
.contextvault/sessions/
```

Later, a developer or agent can ask for evidence:

```bash
contextvault history --since 2w
contextvault decisions auth --source codex
contextvault problems auth --since 30d
contextvault retrieve "authentication callback"
contextvault prepare "fix authentication callback"
```

`retrieve` ranks relevant local events. `prepare` creates a focused Markdown package for the next agent.

The current engine is deterministic and lexical. It does not send the project to an LLM or generate an ungrounded answer.

## Why build a Desktop app?

The CLI proved the model, but it limited the audience.

Someone who simply wants “authentication decisions from the last month” should not need to know this syntax:

```bash
contextvault decisions auth --source codex --since 30d
```

So I built an Electron app over the package.

The first version exposed command buttons and a raw arguments field.

Technically, this preserved package compatibility. From a UX perspective, it was still asking users to think like a shell parser.

The app was a GUI, but not yet a Desktop product.

The redesign goal became similar to Docker CLI and Docker Desktop:

> Share the engine and data model, but give each surface a complete experience.

## The dangerous shortcut: implementing everything twice

The easiest way to build the GUI would have been to give Desktop its own recorder and database:

```text
CLI      -> Markdown
Desktop  -> SQLite or custom JSON
```

That would immediately create two versions of ContextVault.

Sessions, migrations, bug fixes, and indexing behavior would eventually drift. Existing CLI users would need imports or conversions before using Desktop.

Instead, the architecture keeps one source of truth:

```text
Browser exports       CLI / agents       Desktop recorder
       \                   |                    /
        \                  |                   /
                 .contextvault Markdown
                           |
                    local Context Engine
                           |
       History · Search · Retrieve · Prepare · Memory
```

Desktop is a GUI over the same engine and files—not a second implementation.

## How recording works inside Electron

When the user clicks **Start recording**, the Electron main process launches the bundled package recorder with the selected project as its working directory.

The renderer only receives a narrow preload API:

```ts
startRecorder({ title, source })
sendRecorderCommand(recorderId, command)
finishRecorder(recorderId)
cancelRecorder(recorderId)
```

An entry created in the GUI is sent to the real recorder:

```ts
await window.contextVault.sendRecorderCommand(
  recorderId,
  `/decision ${content}`,
)
```

The package writes the final session Markdown.

This means a session created in Desktop is visible to:

```bash
contextvault list
contextvault show <session-id>
```

No conversion step is required.

![ContextVault Desktop recorder](https://context-vault-two.vercel.app/demo/contextvault-desktop-recorder.png)

## How CLI sessions appear live in Desktop

Compatibility also needs to work in the opposite direction.

The main process watches the active project’s session directory:

```ts
vaultWatcher = watch(sessionsPath, () => {
  if (vaultRefreshTimer) clearTimeout(vaultRefreshTimer)

  vaultRefreshTimer = setTimeout(async () => {
    const engine = await getEngine()
    engine.buildContextIndex(projectPath)
    mainWindow?.webContents.send('contextvault:vault-changed')
  }, 250)
})
```

The delay debounces bursts of file events. After rebuilding the index, open renderer views refresh.

The UI exposes the watcher state:

- Watching project
- Last updated
- Events found
- Sources detected

For the integration test, I kept Desktop open and recorded a session from the external CLI. Without reopening the app, the session count increased from 3 to 4, the event count increased from 14 to 16, and `terminal` appeared as a detected source.

That was the moment the CLI and GUI stopped feeling like separate products.

## Turning commands into actual workflows

The redesign replaced the default arguments field with screens based on user intent.

| What the user wants | Desktop workflow |
| --- | --- |
| Capture project context | Recorder |
| Browse or export a session | Sessions / Session Detail |
| Understand recent activity | History |
| Find previous choices | Decisions |
| Review bugs and failed attempts | Problems |
| Review follow-up work | Tasks |
| Rank evidence for a question | Retrieve |
| Find matching text | Search |
| Build context for another agent | Prepare |
| Connect related sessions | Link Sessions |
| Maintain the local vault | Index, Memory, Timeline, Export |

History, for example, supports:

- Since: 24 hours, 7, 14, or 30 days, all time, or a custom date
- Source: Codex, Claude Code, Cursor, ChatGPT, manual, terminal, or browser
- Event type: decision, problem, task, note, user, or agent
- Maximum results

Results are grouped, readable, copyable, and exportable.

![History filters and results](https://context-vault-two.vercel.app/demo/contextvault-desktop-commands.png)

The raw runner still exists inside collapsed **Advanced CLI Mode** for uncommon flags. It is no longer the normal experience.

## Search, Retrieve, and Prepare are different

These features can sound interchangeable, so the UI and documentation separate them:

### Search

Find matching events and sessions using text and filters.

### Retrieve

Rank the local evidence most relevant to a task. The deterministic scorer considers exact phrases, tokens, event importance, recency, and filters.

### Prepare

Turn retrieved evidence into a portable Markdown context package for the next model or agent.

ContextVault does not currently pretend to answer a project question using an AI model. It retrieves inspectable evidence and lets the user decide where to send it next.

## What “automatic” does and does not mean

ContextVault Desktop automatically notices compatible sessions written into the watched vault.

It does **not** silently intercept every unrelated Codex, Claude Code, Cursor, VS Code, terminal, screen, clipboard, or microphone process.

An external tool currently appears automatically only if it:

1. Records through the ContextVault CLI, or
2. Writes a compatible session file into `.contextvault`.

Direct agent adapters and an MCP server are future integrations.

This boundary is intentional. Local-first software should not hide its capture behavior behind vague marketing language.

## Verification beyond “it builds”

The release was checked across the entire compatibility story:

```text
Package and extension tests          63 passed
Browser extension production build  passed
Desktop renderer type-check          passed
Desktop production build            passed
Windows installer packaging         passed
GitHub Actions Windows build         passed
GitHub Actions Linux build           passed
CLI -> open Desktop live refresh     passed
```

The Desktop release became v1.8.0. The npm package remained v1.3.0 because the Desktop-only changes did not modify the published package code.

## Next: collaborative context repositories

The next phase is Git-like collaboration for context:

- Push a selected vault to a repository
- Invite collaborators
- Pull shared context
- Review diffs and history
- Edit locally
- Push reviewed changes
- Resolve conflicts

The difficult part is not remote storage. It is preserving provenance, reviewability, and user ownership while several humans and agents modify shared project memory.

## Try ContextVault

```bash
npx @aliabdm/contextvault init
contextvault record
```

- GitHub: https://github.com/aliabdm/ContextVault
- Desktop: https://context-vault-two.vercel.app/download
- Product walkthrough: https://context-vault-two.vercel.app/
- npm: https://www.npmjs.com/package/@aliabdm/contextvault
- Technical FAQ: https://context-vault-two.vercel.app/faq

If you are building a GUI over an existing CLI, I am curious: when do you keep spawning the command, and when do you call the underlying library directly?
