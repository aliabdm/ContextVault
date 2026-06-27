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
Context Engine
  - Terminal session normalization
  - Local event index
  - Query-ranked retrieval
  - Prepared context composer
  - Project memory maintenance
  - Session links and timeline
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
- Context Engine MVP
- Terminal context normalization
- Local context index
- Query-based retrieval
- Prepared context packages
- Project memory maintenance
- Session linking
- Context timeline

### In Progress

- Launch positioning and documentation
- Browser adapter hardening against provider UI changes
- Improved social/demo materials

### Future

- Browser context normalization
- Optional local semantic retrieval
- Automatic context-link suggestions
- Stale task and memory conflict detection
- Automatic terminal agent capture
- Claude Code integration
- Codex integration
- Cursor integration
- VS Code extension
- MCP server
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

### Phase 9 - Context Engine MVP - Implemented

Goal:

Move ContextVault from a context recorder into a context engine.

Completed:

- Browser Capture
- Terminal Capture
- Context Events
- Context Sessions
- Local Storage
- Search
- Export
- Terminal session normalization
- Local event index
- Query-based retrieval
- Prepared agent context packages
- Generated memory maintenance
- Explicit session links
- Context timeline export

Important principle:

Do not prioritize integrations before the Context Engine exists.

The engine is the product. Integrations are adapters.

#### Context Normalization

Goal:

Represent all context sources using the same internal model.

Future sources:

- Browser conversations
- Codex
- Claude Code
- Cursor
- VS Code agents
- MCP integrations
- Human notes

Target:

All sources should emit:

- `ContextSource`
- `ContextSession`
- `ContextEvent`

Status:

- Implemented for terminal Markdown sessions, including backward-compatible snake_case metadata.
- Browser capture has not been migrated to the normalized engine yet.

#### Context Indexing

Goal:

Build a searchable knowledge index across all captured context.

Examples:

- Find all auth-related decisions
- Find all sessions mentioning Redis
- Find all open tasks
- Find all unresolved problems

Implemented command:

```bash
npm run vault:index
```

Status:

- Implemented. The index is stored at `.contextvault/index/context-index.json`.
- Existing `vault:search` remains available for direct Markdown text search.

#### Context Retrieval

Goal:

Automatically retrieve relevant context for a task.

Example query:

```text
auth middleware
```

Expected output:

- Related sessions
- Related decisions
- Related tasks
- Related problems
- Related notes

Implemented command:

```bash
npm run vault:retrieve -- "auth middleware"
```

Status:

- Implemented with local deterministic ranking based on phrase matches, token matches, event type, and recency.
- Semantic embeddings remain future work.

#### Context Composer

Goal:

Generate ready-to-use context packages for AI tools.

Examples:

- Codex context package
- Claude Code context package
- Cursor context package

Expected output:

```text
prepared-context.md
```

Containing:

- Relevant memory
- Decisions
- Tasks
- Problems
- Recent sessions

Implemented command:

```bash
npm run vault:prepare -- "auth middleware"
```

Status:

- Implemented. Query-specific output is written to `.contextvault/exports/prepared-context.md`.
- Existing `vault:export` remains the broad terminal export.

#### Context Linking

Goal:

Create relationships between sessions.

Examples:

- Session A discovered a bug.
- Session B fixed the bug.
- Session C introduced a regression.

Status:

- Implemented through explicit local links:

```bash
npm run vault:link -- <from-session-id> <to-session-id> "fixed by"
```

- Automatic link suggestions remain future work.

#### Context Memory

Goal:

Maintain long-term project memory.

Examples:

- Architectural decisions
- Coding standards
- Known limitations
- Important discoveries
- Lessons learned

Stored in:

```text
.contextvault/memory.md
```

Status:

- Implemented through `npm run vault:memory`.
- Manual memory content is preserved; ContextVault only replaces its marked generated block.

#### Context Timeline

Goal:

Track project history as context evolves.

Examples:

- What changed?
- When was a decision made?
- Who made it?
- Which agent worked on it?

Status:

- Implemented through `npm run vault:timeline`.
- Output is written to `.contextvault/exports/context-timeline.md`.

#### Future Integrations

After Context Engine is mature:

- MCP server
- VS Code extension
- Claude Code integration
- Codex integration
- Cursor integration
- Self-hosted sync
- Encrypted backups

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
- Terminal context normalization
- Local context index
- Context retrieval
- Context composer
- Context memory maintenance
- Explicit session linking
- Context timeline

### In Progress

- Context Engine hardening
- Browser normalization design
- Browser adapter hardening
- Demo/storytelling assets

### Future

- Browser context migration to the shared engine
- Optional local semantic indexing
- Automatic context-link suggestions
- Stale task and memory conflict detection
- Automatic agent capture
- MCP server
- VS Code extension
- Agent integrations
- Encrypted backups
- Optional self-hosted sync

## Changelog

### 2026-06-27 - Context Engine MVP

- Added terminal session normalization into `ContextSession` and `ContextEvent`.
- Added `vault:index` with a local JSON index.
- Added query-ranked `vault:retrieve`.
- Added `vault:prepare` and `prepared-context.md`.
- Added generated long-term memory maintenance with `vault:memory`.
- Added explicit session relationships with `vault:link`.
- Added chronological context export with `vault:timeline`.
- Added backward compatibility for legacy snake_case session metadata.
- Confirmed browser extension behavior remains unchanged.

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
npm run vault:index
npm run vault:retrieve -- "auth middleware"
npm run vault:prepare -- "auth middleware"
npm run vault:memory
npm run vault:timeline
```

Automated Docker smoke test:

```bash
docker compose run --rm dev sh test/context-engine-smoke.sh
```

## Load Browser Extension In Chrome

1. Open `chrome://extensions`.
2. Turn Developer mode on.
3. Click Load unpacked.
4. Select the `dist/` folder.
5. Open a supported LLM platform and start chatting.
