# Universal LLM Conversation Recorder - Plan

## One Line

Auto-capture LLM conversations across supported platforms and export them as organized, searchable Markdown.

## Why

Moving context between LLMs, models, or accounts is hard. Native exports are often delayed, account-specific, incomplete, or too heavy for the moment when you need to continue somewhere else. This project keeps a local, user-controlled record that can be exported immediately.

## Architecture

- Network interceptor: page-context fetch/XHR/WebSocket monitor for supported endpoints.
- DOM observer: visible-message capture fallback and primary reliability layer.
- Stream assembler: turns growing assistant text into one finalized message.
- Conversation detector: URL/title/session boundary detection.
- Storage: IndexedDB runtime storage and Markdown/ZIP export.
- Adapters: provider-specific selectors, URL rules, title extraction, and completion detection.

## Phase Status

### Phase 0 - Project Setup - Complete

- `package.json`, Vite, TypeScript, Manifest V3
- Docker dev environment
- Shared TypeScript types
- Icons and popup entrypoint

### Phase 1 - Core Capture Engine - Complete

- Adapter registry
- ChatGPT adapter
- DOM observer
- Network monitor injection
- Stream assembler
- Content script bridge
- Background conversation manager

### Phase 2 - Storage And Export - Complete

- IndexedDB CRUD
- Markdown export with YAML frontmatter
- ZIP export
- Popup status, recent conversations, tags, projects, pause/resume

### Phase 3 - Claude Adapter - Implemented

- `claude.ai` URL support
- Claude selectors
- Claude API endpoint patterns
- Title/model detection best effort

### Phase 4 - Gemini Adapter - Implemented

- `gemini.google.com` URL support
- Gemini selectors
- Gemini API endpoint patterns
- Title/model detection best effort

### Phase 5 - Generic Adapter - Implemented

- Limited generic support for known LLM hosts:
  - Perplexity
  - Poe
  - DeepSeek Chat
  - Grok
  - Microsoft Copilot
- No broad `<all_urls>` permission

### Phase 6 - Advanced Features - Partially Complete

- ZIP batch export: complete
- Project labels: complete
- Tags: complete
- Model detection: best effort
- Chain links: complete
- Auto-project detection: pending
- Full-text search UI: pending
- Draft recovery: pending
- Edit/delete detection: pending
- Long conversation splitting: detector exists, engine integration pending
- Image/attachment references: pending

### Phase 7 - Outside Browser - Future

- VS Code extension
- CLI tool
- Desktop/system tray app

### Phase 8 - Launch - In Progress

- Icon set: complete
- README: complete
- MIT license: complete
- Security policy: complete
- Chrome Web Store copy/privacy policy: pending

## Test Commands

```bash
npm install
npm test
npm run build
```

Docker:

```bash
docker compose run --rm dev sh -c "npm install && npm test && npm run build"
```

## Load In Chrome

1. Open `chrome://extensions`.
2. Turn Developer mode on.
3. Click Load unpacked.
4. Select the `dist/` folder.
5. Open a supported LLM platform and start chatting.
