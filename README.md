# Universal LLM Conversation Recorder

Auto-capture LLM chats across supported web apps and export them as portable Markdown files.

## Why This Exists

Moving context between LLMs, accounts, or models is still awkward. Native exports are often too large, too delayed, account-bound, or incomplete for the moment when you actually need them. This extension records conversations as they happen, keeps them local, and lets you export clean `.md` files or a ZIP archive that can be searched, shared, versioned, or pasted into another model.

The goal is simple: when you run out of tokens, switch providers, use a different account, or need a second opinion, your working context should move with you.

## Current Status

- ChatGPT capture: working
- Claude adapter: implemented
- Gemini adapter: implemented
- Generic adapter: implemented for selected LLM sites
- Local IndexedDB storage: working
- Markdown export: working
- ZIP export: working
- Popup session view, tags, project labels, pause/resume: working
- Test/build pipeline: working

## Supported Platforms

Primary adapters:

- ChatGPT: `chatgpt.com`
- Claude: `claude.ai`
- Gemini: `gemini.google.com`

Generic adapter targets:

- Perplexity: `perplexity.ai`
- Poe: `poe.com`
- DeepSeek Chat: `chat.deepseek.com`
- Grok: `grok.com`
- Microsoft Copilot: `copilot.microsoft.com`

The extension does not request `<all_urls>` access. It only runs on the explicit host list in `manifest.json`.

## How It Works

The extension uses a hybrid capture engine:

- DOM observer: reliable fallback and primary visible-message capture.
- Network monitor: injected page script that observes fetch, XHR, and WebSocket traffic for supported chat endpoints.
- Stream assembler: merges streaming assistant output into one final message.
- Background service worker: owns tab sessions and persists conversations to IndexedDB.
- Popup UI: shows recording state, current session metadata, recent conversations, and export actions.

### DOM Capture Flow

```text
User types
  -> DOM user element appears
  -> DOMObserver.scanMessages()
  -> onUserMessage(text)
  -> StreamAssembler.processDOMComplete("user", text)
  -> finalized Message
  -> SimpleEngine.onCapture("user", content)
  -> background stores a new user turn

Assistant responds
  -> DOM assistant element appears
  -> onAssistantChunk(text)
  -> StreamAssembler.processDOMContent("assistant", text)
  -> pending message, not stored yet
  -> DOM mutations keep firing while text grows
  -> updated text replaces the pending assistant content

Streaming completes
  -> adapter.isStreamingComplete(element) returns true
  -> StreamAssembler.processDOMComplete("assistant", final_text)
  -> finalized Message
  -> SimpleEngine.onCapture("assistant", content)
  -> background appends or updates the latest assistant turn
```

### Network Capture Flow

```text
Page calls fetch/XHR/WebSocket
  -> network-inject.js detects a supported chat endpoint
  -> request body can capture user text when available
  -> streamed response chunks are posted back to the content script
  -> content-script extracts text from provider-specific payload shapes
  -> SimpleEngine sends text into StreamAssembler
  -> stale timeout finalizes assistant streams that do not expose a clean finish event
```

The DOM path and network path intentionally overlap. Deduplication in the engine and background prevents repeated user messages and prevents a later assistant turn from overwriting an older one.

## Privacy And Security

This project is designed to be local-first:

- No remote backend.
- No analytics.
- No telemetry.
- No third-party upload.
- Conversations are stored in the browser extension's IndexedDB database.
- Export only happens when the user clicks `.md` or `ZIP All`.
- Host permissions are limited to supported LLM domains.
- Network monitoring is injected only on allowed hosts from `manifest.json`.
- The injected script posts events only to the same page window; the content script forwards captured text to the extension background.
- Data URLs are used for downloads, so exported files are generated locally.

Important limitation: by design, this extension captures conversation content you see or send on supported LLM websites. Treat the local browser profile and exported Markdown files as sensitive.

## What Problems It Solves

- Context portability: move a conversation into another LLM without waiting for native exports.
- Account boundaries: keep your own local transcript even when chats live across multiple provider accounts.
- Token overflow: export the useful history and compress or summarize it elsewhere.
- Provider switching: keep ChatGPT, Claude, Gemini, and other LLM sessions in one local archive.
- Research continuity: tag conversations, assign projects, and export Markdown for notes, repos, or knowledge bases.
- Failure recovery: DOM fallback still captures visible messages when provider network formats change.

## Install For Local Testing

Build the extension:

```bash
npm install
npm test
npm run build
```

Or with Docker:

```bash
docker compose run --rm dev sh -c "npm install && npm test && npm run build"
```

Load it in Chrome:

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Click Load unpacked.
4. Select the `dist/` folder.
5. Open a supported LLM website and start a conversation.

After code changes, run `npm run build` again and press Reload on the extension card.

## How To Test Manually

ChatGPT smoke test:

1. Load `dist/` as an unpacked extension.
2. Open `https://chatgpt.com`.
3. Send a short prompt.
4. Wait until the assistant finishes.
5. Open the extension popup.
6. Confirm status says `Recording: chatgpt`.
7. Confirm message count increased.
8. Click `Export .md`.
9. Open the downloaded Markdown and verify it has frontmatter plus User/Assistant sections.

Multi-turn test:

1. Send two user prompts in the same chat.
2. Confirm the conversation has four messages.
3. Export Markdown.
4. Verify older assistant answers were not overwritten by the newest answer.

New conversation test:

1. Start one chat and export it.
2. Click New Chat.
3. Send another prompt.
4. Confirm a second conversation appears in Recent Conversations.

Project/tags test:

1. Add a project and a few tags in the popup.
2. Export Markdown.
3. Verify `project:` and `tags:` appear in YAML frontmatter.

## Automated Tests

The test suite covers:

- Adapter registry and URL matching.
- ChatGPT conversation ID detection.
- Stream assembler behavior for DOM and SSE chunks.
- Markdown frontmatter and filename generation.

Run:

```bash
npm test
```

Build verification:

```bash
npm run build
```

## Technical Architecture

```text
manifest.json
  -> content-script.ts runs on supported LLM hosts
  -> content-script registers platform adapters
  -> network-inject.js is injected into page context

DOMObserver
  -> scans user and assistant selectors
  -> detects growing assistant text
  -> reports user messages, assistant chunks, and assistant completion

StreamAssembler
  -> keeps one pending streaming message
  -> replaces growing DOM content instead of appending duplicates
  -> finalizes clean Message objects

SimpleEngine
  -> coordinates DOM + network capture
  -> emits capture events to background
  -> watches title changes
  -> finalizes stale assistant streams after timeout

background.ts
  -> maps tabId to active conversation session
  -> creates/ends conversations
  -> deduplicates user messages
  -> prevents assistant overwrite across turns
  -> writes IndexedDB records
  -> exports Markdown or ZIP

popup/app.ts
  -> reads capture state from the active tab
  -> reads conversations from background
  -> updates project/tags
  -> triggers downloads
```

## Repository Layout

```text
src/adapters/          Platform-specific selectors and URL rules
src/capture/           DOM observer, stream assembler, engine, network token helper
src/storage/           IndexedDB, Markdown, ZIP export
src/popup/             Extension popup UI
public/network-inject.js Page-context network monitor
test/                  Vitest coverage
manifest.json          Chrome extension permissions and entrypoints
```

## Open Source Notes

Recommended license: MIT for maximum adoption and easy contribution.

Recommended contribution policy:

- Do not add telemetry.
- Do not broaden host permissions without a clear privacy reason.
- Prefer provider-specific adapters over generic page scraping.
- Keep exported data user-controlled.
- Add tests for adapters, stream assembly, and export formatting.
- Document any new supported provider in this README and `manifest.json`.

Good first issues:

- Harden Claude and Gemini selectors against UI changes.
- Add import/export of settings.
- Add full-text search in popup.
- Add optional encrypted backup export.
- Add more provider adapters with narrow host permissions.

## Known Limitations

- Provider UIs change frequently, so DOM selectors may need maintenance.
- Some providers compress or encode network payloads, so DOM capture remains essential.
- Generic capture is best-effort and intentionally limited to known LLM domains.
- Browser extension storage is local to the browser profile.
- This is not a compliance archive; it is a personal context portability tool.

## Project Title

Universal LLM Conversation Recorder
