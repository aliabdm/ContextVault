# ContextVault - Project Plan

## Current Vision

ContextVault is a local-first context platform with **Browser Capture** and **Terminal Capture**.

It preserves AI conversations, coding-agent sessions, project decisions, tasks, problems, discoveries, and workflow context as portable local memory.

> Git tracks code. ContextVault tracks context.

## Current Architecture

```text
Browser Capture
  - DOM Observer
  - Network Monitor
  - Stream Assembler
  - Extension Background Storage
        |
        v
Terminal Capture
  - Vault Terminal CLI
  - Raw Context Events
  - Markdown Session Files
        |
        v
Shared Context Layer
  - Provider-agnostic context model
  - Browser/terminal/editor/agent-compatible event concepts
        |
        v
Storage / Export / Search
  - IndexedDB for browser conversations
  - .contextvault/ for terminal sessions
  - Markdown export
  - ZIP export for browser conversations
  - Terminal search
```

## Status Summary

### Implemented

- Browser Capture MVP
- ChatGPT browser capture
- Claude adapter
- Gemini adapter
- Generic browser adapter for selected LLM hosts
- Browser Markdown export
- Browser ZIP export
- Popup UI
- Tags and project labels for browser conversations
- Local browser storage with IndexedDB
- Vault Terminal MVP
- Shared context model
- Local-first storage architecture

### In Progress

- Launch positioning and documentation
- Browser adapter hardening against provider UI changes
- Improved social/demo materials

### Future

- Automatic terminal agent capture
- Claude Code integration
- Codex integration
- Cursor integration
- VS Code extension
- MCP server
- Context retrieval engine
- Context indexing
- Context linking
- Encrypted backups
- Optional self-hosted sync

## Phase History

### Phase 0 - Project Setup - Complete

Completed:

- `package.json`, Vite, TypeScript, Manifest V3
- Docker dev environment
- Shared TypeScript types
- Icons and popup entrypoint

### Phase 1 - Browser Core Capture Engine - Complete

Completed:

- Adapter registry
- ChatGPT adapter
- DOM observer
- Network monitor injection
- Stream assembler
- Content script bridge
- Background conversation manager

### Phase 2 - Browser Storage And Export - Complete

Completed:

- IndexedDB CRUD
- Markdown export with YAML frontmatter
- ZIP export
- Popup status
- Recent conversations
- Tags
- Project labels
- Pause/resume

### Phase 3 - Claude Adapter - Implemented

Completed:

- `claude.ai` URL support
- Claude selectors
- Claude API endpoint patterns
- Title/model detection best effort

Status note:

- Adapter is implemented, but provider UI changes may still require selector maintenance.

### Phase 4 - Gemini Adapter - Implemented

Completed:

- `gemini.google.com` URL support
- Gemini selectors
- Gemini API endpoint patterns
- Title/model detection best effort

Status note:

- Adapter is implemented, but provider UI changes may still require selector maintenance.

### Phase 5 - Generic Browser Adapter - Implemented

Completed:

- Limited generic support for known LLM hosts:
  - Perplexity
  - Poe
  - DeepSeek Chat
  - Grok
  - Microsoft Copilot
- No broad `<all_urls>` permission

Status note:

- Generic support is best-effort and intentionally limited to known LLM domains.

### Phase 6 - Browser Advanced Features - Partially Complete

Completed:

- ZIP batch export
- Project labels
- Tags
- Model detection best effort
- Chain links

Pending:

- Auto-project detection
- Full-text browser search UI
- Draft recovery
- Edit/delete detection
- Long conversation splitting integration
- Image/attachment references

### Phase 7 - Vault Terminal - Implemented

Completed:

- `vault:init`
- `vault:record`
- `vault:list`
- `vault:show`
- `vault:search`
- `vault:export`
- Local Markdown session storage under `.contextvault/sessions/`
- Combined terminal export under `.contextvault/exports/`
- Starter `memory.md`
- Local config file
- Shared context model in `src/shared/context/types.ts`
- Local-first architecture
- Git ignored context storage with `.contextvault/`
- No backend, auth, telemetry, analytics, or external AI API calls

Future:

- Automatic agent capture
- Claude Code integration
- Codex integration
- Cursor integration
- VS Code extension
- MCP server
- Context retrieval engine
- Context indexing
- Context linking
- Encrypted backups
- Optional self-hosted sync

### Phase 8 - Launch - In Progress

Completed:

- Icon set
- README
- MIT license
- Security policy
- Browser + Terminal positioning

Pending:

- Chrome Web Store copy/privacy policy
- Better demo assets
- Launch article series
- Community-specific examples

## Roadmap By State

### Implemented

- Browser Capture
- Terminal Capture MVP
- Local-first browser storage
- Local-first terminal storage
- Markdown export
- Browser ZIP export
- Terminal search
- Shared context model

### In Progress

- Documentation and positioning
- Browser adapter hardening
- Demo/storytelling assets

### Future

- MCP server
- VS Code extension
- Agent integrations
- Context retrieval
- Context indexing
- Context linking
- Automatic agent capture
- Encrypted backups
- Optional self-hosted sync

## Changelog

### 2026-06-06 - Vault Terminal MVP

- Completed Vault Terminal MVP.
- Added local terminal context recorder commands:
  - `vault:init`
  - `vault:record`
  - `vault:list`
  - `vault:show`
  - `vault:search`
  - `vault:export`
- Added `.contextvault/` local storage structure.
- Added shared context model under `src/shared/context/types.ts`.
- Confirmed browser extension remains fully functional.

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

Vault Terminal smoke test:

```bash
npm run vault:init
npm run vault:list
npm run vault:export
```

## Load Browser Extension In Chrome

1. Open `chrome://extensions`.
2. Turn Developer mode on.
3. Click Load unpacked.
4. Select the `dist/` folder.
5. Open a supported LLM platform and start chatting.
