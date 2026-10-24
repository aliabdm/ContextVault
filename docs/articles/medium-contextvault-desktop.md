# The Code Survived. The Reasoning Disappeared.

## Why I built a local memory layer for AI work—and why I had to rebuild its Desktop app

A few weeks ago, I reopened a project I had built with an AI coding agent.

The feature was there. The commits were there. The tests were there.

But I could not answer three simple questions:

- Why did we choose this authentication flow?
- Which Redis fix had already failed?
- What did the agent warn me not to change?

Git could show me **what** changed. It could not show me the conversation that produced the change.

Some of that reasoning was in an old ChatGPT thread. Some was inside a Codex session. A useful error message had appeared in a terminal I had already closed. Another decision was probably buried in Claude or Cursor.

The code had survived.

The context had not.

That was the beginning of ContextVault.

![ContextVault Desktop dashboard](https://context-vault-two.vercel.app/demo/desktop-walkthrough/step-11.png)

## AI work has a memory problem

Modern development is no longer one developer, one editor, and one terminal.

A normal task can move through several surfaces:

1. You explore the idea in ChatGPT.
2. You ask Claude to challenge the architecture.
3. Codex or Cursor changes the repository.
4. A terminal session reveals the real bug.
5. You open a fresh agent session because the old context window is full.

Each tool remembers its own fragment. None of them remembers the project.

This creates a strange situation: we are generating more reasoning than ever, but preserving less of it than we preserve code.

The valuable part is not every token. It is the durable context hidden inside the noise:

- Decisions and their reasons
- Failed attempts
- Constraints
- Tasks that were postponed
- Problems that remain unresolved
- Instructions the next agent should know

When that context disappears, the cost is not sentimental. We repeat investigations, undo good decisions, retry failed fixes, and spend the first part of every new AI session reconstructing what the previous one knew.

## What ContextVault is

ContextVault is an open-source, local-first memory layer for AI-assisted work.

It captures or imports context from browser conversations and terminal or coding-agent sessions, stores it locally, and makes it searchable and reusable across tools.

The simplest way to think about it is:

> Git tracks the evolution of code. ContextVault tracks the reasoning around it.

It has three surfaces:

### Browser Capture

A Chrome extension records supported LLM conversations locally in the browser. Users can export useful conversations as Markdown or ZIP.

### Vault Terminal

An npm package records project work from terminals and coding-agent sessions:

```bash
npx @aliabdm/contextvault init
contextvault record
```

During a session, entries can be preserved as user prompts, agent output, decisions, tasks, problems, or notes.

### ContextVault Desktop

A Windows and Linux app provides a visual workflow for recording, browsing sessions, inspecting history, finding decisions and problems, retrieving evidence, preparing context for another agent, and exporting the vault.

All three are designed around local ownership. There is no required ContextVault account, backend, telemetry pipeline, or AI API.

## The first useful version was a terminal tool

I started with the terminal because it forced the storage model to remain simple.

A recorded session becomes readable Markdown inside the project:

```text
.contextvault/
  sessions/
  imports/
  index/
  exports/
  memory.md
  links.json
```

From those files, ContextVault can answer practical evidence questions:

```bash
# What happened during the last two weeks?
contextvault history --since 2w

# What did Codex decide about authentication?
contextvault decisions auth --source codex

# Which Redis problems did we capture this month?
contextvault problems redis --since 30d

# Retrieve the most relevant evidence for the next task.
contextvault retrieve "auth middleware"

# Prepare a focused Markdown package for another agent.
contextvault prepare "auth middleware"
```

This worked for developers comfortable with a CLI.

But if the product was really about continuity across AI tools, asking everyone to memorize commands was an unnecessary barrier.

So I built a Desktop app.

And I made a very predictable mistake.

## I built a GUI that still thought like a CLI

The first Desktop version had buttons for package commands, an arguments box, and a Run button.

It was technically honest. The buttons really executed the package. Existing `.contextvault` files really opened in the app. Nothing was mocked.

But the experience still asked questions like:

> Which command do you need? Which flags? In what order?

If a user wanted authentication decisions from the last month, the graphical app still expected them to understand something close to:

```bash
contextvault decisions auth --source codex --since 30d
```

I had not built a Desktop product. I had decorated a terminal.

The comparison that clarified the mistake was Docker.

Docker Desktop and Docker CLI control the same underlying system. But Docker Desktop does not make a raw arguments field the main way to inspect containers, images, logs, or volumes.

That became the new goal:

> ContextVault CLI and ContextVault Desktop should be two complete experiences over one engine.

## Rebuilding the app around user intent

I removed command syntax from the normal workflow.

Instead of asking users to construct arguments, the Desktop app now asks what they want to know.

### History

Choose a time range, source, event type, and result limit. Custom dates are supported. The result is a readable project timeline—not stdout pasted into a box.

### Decisions

Enter a topic, choose the source and time range, and review decisions grouped with their project and date context.

### Problems and Tasks

Inspect captured blockers, failed attempts, and follow-up work without searching entire session transcripts.

### Retrieve

Describe the context you need, narrow it by source, type, and time, then copy or export the ranked evidence.

### Search and Prepare

Search explores the vault. Prepare turns the most relevant local evidence into a focused Markdown package that can be handed to the next model or coding agent.

![ContextVault History filters and results](https://context-vault-two.vercel.app/demo/contextvault-desktop-commands.png)

Initialization, imports, session linking, index rebuilds, project memory, timelines, and full export also received real controls and result states.

The raw command runner still exists for uncommon flags, but it is collapsed under **Advanced CLI Mode**. It is an escape hatch, not the product homepage.

## One engine—not a Desktop fork

Making the GUI easier could have created a worse technical problem.

If Desktop had its own recorder and database, ContextVault would become two products:

- CLI sessions would behave one way.
- Desktop sessions would behave another way.
- Fixes and migrations would slowly diverge.

So the GUI uses the real package engine.

When the user clicks Record, Desktop launches the bundled `contextvault record` process for the selected project. Entries created in the interface are sent to that recorder and saved in the same Markdown format as terminal sessions.

![ContextVault package-backed recorder](https://context-vault-two.vercel.app/demo/contextvault-desktop-recorder.png)

This creates an important promise:

- Record from Desktop, then find the session with the CLI.
- Record from the CLI, then find the session in Desktop.
- Move the project folder, and the context moves with it.
- Stop using the app, and the Markdown remains readable.

## The test that made it feel like one product

I opened Desktop on the Sessions screen.

Then, outside the app, I started the package recorder and created a new terminal session.

Without reopening Desktop:

- The session count changed from 3 to 4.
- The event count changed from 14 to 16.
- `terminal` appeared as a detected source.
- The new session appeared in the list.

Desktop watches the active project’s `.contextvault` session files, rebuilds the local index when they change, and refreshes open views.

The app exposes that state instead of hiding it. Users can see whether the project is being watched, when it last changed, how many events were found, and which sources exist.

That small test proved more than a hundred screenshots could: the package and GUI were finally two views of the same vault.

## What ContextVault does not do

There is an important boundary.

Clicking Record does not silently spy on every terminal, agent, screen, clipboard, or microphone.

Desktop records the entries a user adds through its package-backed recorder. It also notices sessions written by the ContextVault CLI or compatible integrations.

For unrelated Codex, Claude Code, Cursor, or VS Code activity to appear automatically, those tools need a direct adapter or must write through ContextVault.

I prefer stating that clearly. “Automatic capture” should mean a real integration, not an ambiguous promise of background surveillance.

ContextVault also does not currently use an LLM to invent answers about the project. Retrieval is deterministic and local. It ranks source evidence using text matches, event importance, recency, and filters. Prepare packages that evidence for another agent.

Semantic retrieval and grounded answer generation may come later as optional local or explicitly configured adapters—not invisible network calls.

## Shipping the whole story

The redesign was not complete when the React screens compiled.

I updated the onboarding, README, technical FAQ, screenshots, product walkthrough, landing page, download flow, portfolio, and release notes. Then I verified the compatibility story:

- 63 package and browser-extension tests passed.
- The extension production build passed.
- The Desktop type-check and build passed.
- The Windows installer packaged successfully.
- Native GitHub Actions builds succeeded for Windows and Linux.
- Public download links resolved to the new release assets.
- The published website reflected the current GUI and its real limitations.

The result is ContextVault Desktop v1.8.0.

## The next problem is collaboration

Today, ContextVault is strongest as a local project memory.

The next phase is **Collaborative Context Repositories**: select a context vault, push it to a repository, invite a team, pull changes, inspect diffs, edit locally, and push reviewed updates with history and conflict handling.

In other words: Git-like collaboration for project context.

The design constraint will remain the same. Local Markdown should stay the source of truth. Collaboration should extend ownership, not replace it with another closed silo.

## Try it

- Product walkthrough: https://context-vault-two.vercel.app/
- Desktop downloads: https://context-vault-two.vercel.app/download
- GitHub: https://github.com/aliabdm/ContextVault
- npm: https://www.npmjs.com/package/@aliabdm/contextvault
- Technical FAQ: https://context-vault-two.vercel.app/faq

If you use AI across several tools, I would love to know: which pieces of context do you repeatedly lose, and which ones are actually worth preserving?

---

**Suggested Medium subtitle:** *I could recover the code, but not the decisions that produced it. Here is how that problem became a local-first CLI, and why its first Desktop interface had to be rebuilt.*

**Suggested Medium topics:** Artificial Intelligence, Programming, Open Source, Developer Tools, Software Development
