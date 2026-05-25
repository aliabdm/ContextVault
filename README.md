
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

---

## 🧪 How to test

1. Open **ChatGPT / Claude / Gemini**
2. Start a conversation
3. Open extension popup
4. Verify messages are captured
5. Export as `.md` or `.zip`
6. Confirm clean structured output

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

**Muhammed Ali**

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
