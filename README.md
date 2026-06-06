<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" alt="version" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license" />
  <img src="https://img.shields.io/badge/build-passing-brightgreen?style=flat-square" alt="build" />
  <img src="https://img.shields.io/badge/privacy-local-8A2BE2?style=flat-square" alt="privacy" />
  <img src="https://img.shields.io/badge/capture-browser%20%2B%20terminal-orange?style=flat-square" alt="capture surfaces" />
</p>

<h1 align="center">ContextVault</h1>
<p align="center"><em>Your local-first memory layer for AI chats, coding agents, and project context.</em></p>

<p align="center">
  ContextVault captures context from browsers and terminals, stores it locally, and exports it as portable Markdown.
  It helps preserve LLM conversations, coding-agent sessions, project decisions, tasks, problems, and workflow context
  across tools.
</p>

<p align="center">
  <strong>No backend. No accounts. No tracking.</strong>
</p>

---

## What It Does

ContextVault is a local-first context platform with two first-class capture surfaces:

- **Browser Capture** records conversations from supported LLM web apps.
- **Terminal Capture** records human, AI, and coding-agent work sessions from the terminal.

Both surfaces store context locally. Both can be exported. Both are designed to help you continue work without losing memory when you switch models, platforms, accounts, tools, agents, or context windows.

---

## Two Capture Surfaces

### Browser Capture

Captures conversations from:

- ChatGPT
- Claude
- Gemini
- Perplexity
- Poe
- DeepSeek
- Copilot

Browser Capture uses a hybrid DOM + network capture engine and exports conversations as structured Markdown or ZIP files.

### Terminal Capture

Captures:

- Codex sessions
- Claude Code sessions
- Cursor workflows
- Human notes
- Decisions
- Tasks
- Problems
- Project context

Terminal Capture stores everything as local Markdown memory under `.contextvault/`.

---

## Why It Exists

AI work is powerful, but context is fragmented across too many places:

| Problem | Consequence |
| --- | --- |
| Switch models | Lose thread continuity |
| Hit token limits | Forced truncation |
| Change accounts | Orphaned conversations |
| Switch platforms | Context gets trapped in one tool |
| Switch coding agents | Decisions and attempts disappear |
| Work in terminals | Agent sessions are hard to preserve |
| Revisit old ideas later | No portable memory or search surface |

ContextVault fixes this by making browser conversations and terminal work sessions **portable, local, and reusable**.

---

## Vision

Git tracks code.

ContextVault tracks context.

The goal is to preserve knowledge, decisions, discussions, tasks, discoveries, and agent work across tools.

Context should survive:

- model switching
- platform switching
- account switching
- agent switching
- context window limits

---

## Features

| Feature | Description |
| --- | --- |
| Browser Capture | Captures LLM conversations from supported browser platforms |
| Terminal Capture | Captures coding-agent, human, and project-context sessions from the terminal |
| Hybrid browser engine | DOM + network capture for browser reliability |
| Local-first storage | Browser chats stay in IndexedDB; terminal sessions stay in `.contextvault/` |
| Markdown export | Browser and terminal context can be exported as Markdown |
| ZIP export | Browser conversations can be exported in bulk as ZIP |
| Tags and project grouping | Organize captured browser conversations |
| Raw terminal memory | Preserve `/user`, `/agent`, `/decision`, `/task`, `/problem`, and `/paste` blocks without rewriting |
| Shared context model | Provider-agnostic context types for future browser, terminal, editor, and agent integrations |
| Private by default | No backend, no accounts, no telemetry, no external AI API calls |

---

## Architecture

```text
Browser Capture                         Terminal Capture
DOM Observer + Network Monitor          Vault Terminal CLI
        |                                      |
Stream Assembler                       Raw Context Events
        |                                      |
Capture Engine                         Markdown Sessions
        |                                      |
Background Service Worker              .contextvault/
        |                                      |
IndexedDB Storage                      Local Filesystem Storage
        \                                      /
         \                                    /
          -------- Shared Context Layer ------
                          |
                  Markdown / ZIP Export
```

Browser key idea:

- **DOM** = source of truth
- **Network** = enhancement layer
- **Stream Assembler** = final message builder

Terminal key idea:

- **Raw input** = source of truth
- **Markdown files** = durable memory
- **No summarization** = no context loss

---

## Privacy By Design

ContextVault is built around strict privacy principles:

| No | Yes |
| --- | --- |
| No backend | Everything stays local |
| No accounts | You control your own context |
| No telemetry | Export when you choose |
| No external AI APIs | Terminal capture works without calling AI services |
| No automatic cloud sync | Local files and local browser storage by default |

The `.contextvault/` folder is ignored by git by default because terminal sessions may contain raw private context, paths, prompts, logs, secrets, or customer information.

---

## Installation (Dev Mode)

```bash
npm install
npm run build
```

Then:

1. Open `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the `dist/` folder

### Or Use Docker

```bash
docker compose up dev
```

This runs the extension in dev mode on `http://localhost:5173` with hot-reload.

After building, load `dist/` into Chrome as an unpacked extension.

To run the mock test server:

```bash
docker compose --profile testing up dev test-server
```

This starts both the dev server and an Nginx container serving the ChatGPT mock HTML at `http://localhost:8080`.

---

## How To Test Browser Capture

1. Open **ChatGPT / Claude / Gemini**
2. Start a conversation
3. Open the extension popup
4. Verify messages are captured
5. Export as `.md` or `.zip`
6. Confirm clean structured output

---

## Vault Terminal MVP

Vault Terminal captures terminal-based human, AI, and coding-agent work sessions as raw Markdown context.

It is intentionally independent from the Chrome extension so browser adapters, popup behavior, permissions, IndexedDB storage, Markdown export, and ZIP export remain intact.

### Terminal Commands

Initialize local terminal memory:

```bash
npm run vault:init
```

Start an interactive recorder:

```bash
npm run vault:record
```

Inside the recorder:

```text
/source codex
/title Fix auth middleware
/user The login redirect is broken.
/agent I found the issue in middleware order.
/decision Keep auth checks in middleware and policy checks in controllers.
/task Add regression test for redirect loop.
/problem Session cookie is missing on callback.
/paste
Raw multiline content goes here.
/endpaste
/end
```

List saved sessions:

```bash
npm run vault:list
```

Show the latest session or a specific session:

```bash
npm run vault:show -- latest
npm run vault:show -- <session-id>
```

Export project memory and recent sessions:

```bash
npm run vault:export
```

Search saved terminal sessions:

```bash
npm run vault:search -- auth
npm run vault:search -- "Claude Code"
```

Vault Terminal writes local files under `.contextvault/`:

```text
.contextvault/
  config.json
  memory.md
  sessions/
  exports/
```

### Technical Key Points

- Vault Terminal is a plain Node.js CLI in `scripts/vault-terminal.mjs`.
- It uses only local filesystem storage.
- It writes Markdown sessions to `.contextvault/sessions/`.
- It writes combined exports to `.contextvault/exports/contextvault-terminal-export.md`.
- It preserves raw input exactly as typed for `/user`, `/agent`, `/note`, `/decision`, `/task`, `/problem`, and `/paste` blocks.
- It adds a provider-agnostic context model under `src/shared/context/types.ts` for future browser, terminal, editor, or agent integrations.
- It does not add backend, auth, telemetry, analytics, or external AI API calls.

---

## Roadmap

- Full-text search inside browser conversations
- Auto-tagging system
- Draft recovery
- MCP server
- VS Code extension
- Agent integrations
- Context retrieval
- Encrypted backups
- Optional self-hosted sync

---

## Known Limitations

- Provider UI changes may require selector updates.
- Generic browser adapter is best-effort only.
- Browser storage is local to the browser profile.
- Terminal storage is local to the repository where `.contextvault/` is initialized.
- Terminal capture records explicitly entered context; it does not automatically intercept every shell process.

---

## Author

**Mohammad Ali Abdul Wahed**

| | |
| --- | --- |
| GitHub | [aliabdm](https://github.com/aliabdm) |
| Portfolio | [senior-mohammad-ali.vercel.app](https://senior-mohammad-ali.vercel.app/) |
| Dev.to | [@maliano63717738](https://dev.to/maliano63717738) |
| Medium | [@aliabdm](https://medium.com/@aliabdm) |
| X (Twitter) | [@Maliano63717738](https://x.com/Maliano63717738) |
| LinkedIn | [Mohammad Ali Abdul Wahed](https://www.linkedin.com/in/mohammad-ali-abdul-wahed-1533b9171/) |

---

## Philosophy

ContextVault is a step toward Git for Context: a portable, local-first memory layer for conversations, coding agents, project decisions, and future AI workflows.
