
<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" alt="version" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="license" />
  <img src="https://img.shields.io/badge/build-passing-brightgreen?style=flat-square" alt="build" />
  <img src="https://img.shields.io/badge/privacy-local-8A2BE2?style=flat-square" alt="privacy" />
  <img src="https://img.shields.io/badge/LLM-ChatGPT%20%7C%20Claude%20%7C%20Gemini-orange?style=flat-square" alt="llm" />
</p>

<h1 align="center">🧠 ContextVault</h1>
<p align="center"><em>Your portable memory layer for AI chats.</em></p>

<p align="center">
  A local-first Chrome extension that records conversations with ChatGPT, Claude, Gemini, and other LLMs<br />
  — and lets you export them instantly as Markdown or ZIP.
</p>

<p align="center">
  <strong>No backend. No accounts. No tracking.</strong>
</p>

---

## ⚡ What it does

ContextVault automatically captures your AI conversations in real-time and turns them into clean, structured files you own.

| Platform     | Support |
|--------------|---------|
| ChatGPT      | ✅      |
| Claude       | ✅      |
| Gemini       | ✅      |
| Perplexity   | ✅      |
| Poe          | ✅      |
| DeepSeek     | ✅      |
| Copilot      | ✅      |

All in one place.

---

## 🚀 Why it exists

AI chats are powerful — but your context is locked inside each platform.

| Problem                     | Consequence                        |
|-----------------------------|------------------------------------|
| Switch models               | Lose thread continuity             |
| Hit token limits            | Forced truncation                  |
| Change accounts             | Orphaned conversations             |
| Revisit old ideas later     | No search, no access               |

ContextVault fixes this by making your conversations **portable, local, and reusable**.

---

## ✨ Features

| Feature                        | Description                                  |
|--------------------------------|----------------------------------------------|
| 🧠 Real-time capture           | Records as you chat, automatically           |
| 🔄 Hybrid tracking engine      | DOM + Network dual-path reliability          |
| 💾 Local-first storage         | IndexedDB — stays in your browser            |
| 📦 Export to Markdown / ZIP    | Clean structured files, one click away       |
| 🏷️ Tags & project grouping     | Organise conversations your way              |
| ⚡ Multi-LLM support           | 7 platforms, one extension                   |
| 🔒 Fully private               | No backend, no analytics, no telemetry       |

---

## 🏗️ How it works

```
DOM Observer + Network Monitor
         ↓
    Stream Assembler
         ↓
    Capture Engine
         ↓
Background Service Worker
         ↓
   IndexedDB Storage
         ↓
  Markdown / ZIP Export
```

Key idea:
- **DOM** = source of truth
- **Network** = enhancement layer
- **Stream Assembler** = final message builder

---

## 🔒 Privacy by design

ContextVault is built around strict privacy principles:

| ❌ | ✅ |
|---|---|
| No backend        | Everything stays local |
| No analytics      | You control your data  |
| No telemetry      | Export when *you* choose |
| No external APIs  | Full offline operation  |
| No data leaving your browser | Zero trust required    |

---

## 📦 Installation (Dev Mode)

```bash
npm install
npm run build
```

Then:

1. Open `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the `dist/` folder

### 🐳 Or use Docker

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

## 🧪 How to test

1. Open **ChatGPT / Claude / Gemini**
2. Start a conversation
3. Open extension popup
4. Verify messages are captured
5. Export as `.md` or `.zip`
6. Confirm clean structured output

---

## Vault Terminal MVP

ContextVault now has two local-first capture surfaces:

1. **Browser Capture**  
   Captures LLM chats from ChatGPT, Claude, Gemini, and other supported browser platforms.

2. **Terminal Capture**  
   Captures human, AI, and coding-agent work sessions from the terminal as raw Markdown context.

Vision:

> Git tracks code. ContextVault tracks context.

Vault Terminal is useful for:

- Preserving Codex sessions
- Preserving Claude Code sessions
- Capturing Cursor decisions
- Keeping project memory outside limited context windows
- Continuing work across agents without starting from zero

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

The `.contextvault/` folder is ignored by git by default because sessions may contain raw private context.

### Technical Key Points

- Vault Terminal is a plain Node.js CLI in `scripts/vault-terminal.mjs`.
- It uses only local filesystem storage. There is no backend, auth, telemetry, analytics, or AI API call.
- It writes Markdown sessions to `.contextvault/sessions/`.
- It writes combined exports to `.contextvault/exports/contextvault-terminal-export.md`.
- It keeps browser capture separate from terminal capture, so the Chrome extension adapters, popup, permissions, and IndexedDB export flow stay intact.
- It preserves raw input exactly as typed for `/user`, `/agent`, `/note`, `/decision`, `/task`, `/problem`, and `/paste` blocks.
- It adds a provider-agnostic context model under `src/shared/context/types.ts` for future browser, terminal, editor, or agent integrations.
- `.contextvault/` is git-ignored by default because terminal sessions can contain private prompts, logs, paths, secrets, or customer context.

---

## 🧭 Roadmap

- 🔍 Full-text search inside conversations
- 🧠 Auto-tagging system
- 🔄 Draft recovery
- 💻 VS Code extension
- ⚙️ CLI tool
- 🔐 Encrypted backup exports
- 🌐 Optional sync layer (self-hosted)

---

## ⚠️ Known limitations

- Provider UI changes may require selector updates
- Generic adapter is best-effort only
- Storage is local-only (no cross-device sync yet)

---

## 👤 Author

**Mohammad Ali Abdul Wahed**

| | |
|---|---|
| 🐙 GitHub    | [aliabdm](https://github.com/aliabdm) |
| 🌐 Portfolio | [senior-mohammad-ali.vercel.app](https://senior-mohammad-ali.vercel.app/) |
| ✍️ Dev.to    | [@maliano63717738](https://dev.to/maliano63717738) |
| 📝 Medium    | [@aliabdm](https://medium.com/@aliabdm) |
| 🐦 X (Twitter) | [@Maliano63717738](https://x.com/Maliano63717738) |
| 💼 LinkedIn  | [Mohammad Ali Abdul Wahed](https://www.linkedin.com/in/mohammad-ali-abdul-wahed-1533b9171/) |

---

## 💡 Philosophy

> *“Your conversations with AI should not be trapped inside platforms.”*

ContextVault is a step toward a portable memory layer for all LLMs.
