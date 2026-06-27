import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import JSZip from "jszip";

// The context engine is intentionally plain ESM so the CLI can run without a build step.
// @ts-ignore No declaration file is needed for the local CLI module.
import {
  buildContextIndex,
  buildTimeline,
  importBrowserExports,
  linkSessions,
  listContextEvents,
  normalizeSessionMarkdown,
  parseSince,
  prepareContext,
  retrieveContext,
  updateProjectMemory,
} from "../scripts/context-engine.mjs";

const roots: string[] = [];

function tempVault() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "contextvault-engine-"));
  roots.push(root);
  const sessions = path.join(root, ".contextvault", "sessions");
  fs.mkdirSync(sessions, { recursive: true });
  fs.writeFileSync(path.join(root, ".contextvault", "memory.md"), "# Project Memory\n\nManual rule: keep auth in middleware.\n", "utf8");
  return { root, sessions };
}

function writeSession(directory: string, name: string, markdown: string) {
  fs.writeFileSync(path.join(directory, name), markdown.trim() + "\n", "utf8");
}

afterEach(() => {
  while (roots.length) fs.rmSync(roots.pop()!, { recursive: true, force: true });
});

describe("Context Engine", () => {
  it("normalizes legacy snake_case sessions and event timestamps", () => {
    const session = normalizeSessionMarkdown(`---
id: legacy-1
title: Legacy auth session
source: codex
started_at: 2026-06-01T10:00:00.000Z
ended_at: 2026-06-01T10:10:00.000Z
git_branch: main
---

## Decision

Keep authentication checks in middleware.
`);

    expect(session.startedAt).toBe("2026-06-01T10:00:00.000Z");
    expect(session.endedAt).toBe("2026-06-01T10:10:00.000Z");
    expect(session.metadata.gitBranch).toBe("main");
    expect(session.events[0]).toMatchObject({
      type: "decision",
      content: "Keep authentication checks in middleware.",
      createdAt: "2026-06-01T10:00:00.000Z",
    });
  });

  it("normalizes browser exports into the shared context model", () => {
    const session = normalizeSessionMarkdown(`---
title: Auth discussion
platform: chatgpt
model: ChatGPT
date: 2026-06-10T10:00:00.000Z
message_count: 2
conversation_id: conv-auth
url: "https://chatgpt.com/c/conv-auth"
---

## User

Why does the login redirect loop?

## Assistant

The authentication middleware order is incorrect.
`);

    expect(session).toMatchObject({
      id: "browser-conv-auth",
      title: "Auth discussion",
      source: "browser",
      startedAt: "2026-06-10T10:00:00.000Z",
      metadata: { platform: "chatgpt", model: "ChatGPT" },
    });
    expect(session.events).toHaveLength(2);
    expect(session.events[0]).toMatchObject({ type: "user", metadata: { platform: "chatgpt", role: "user" } });
    expect(session.events[1]).toMatchObject({ type: "agent", metadata: { platform: "chatgpt", role: "assistant" } });
  });

  it("imports browser Markdown idempotently and retrieves browser and terminal context together", async () => {
    const { root, sessions } = tempVault();
    writeSession(sessions, "terminal-auth.md", `---
id: terminal-auth
title: Implement auth fix
source: codex
started_at: 2026-06-11T10:00:00.000Z
---

## Decision

Keep auth checks in middleware.
`);
    const exportPath = path.join(root, "chatgpt-auth.md");
    fs.writeFileSync(exportPath, `---
title: Diagnose auth redirect
platform: chatgpt
date: 2026-06-10T10:00:00.000Z
message_count: 2
conversation_id: conv-auth
---

## User

Why does auth redirect loop?

## Assistant

Check the middleware order before the login callback.
`, "utf8");

    const first = await importBrowserExports(root, exportPath);
    const second = await importBrowserExports(root, exportPath);
    const index = buildContextIndex(root);
    const retrieval = retrieveContext(root, "auth middleware");

    expect(first).toMatchObject({ imported: 1, updated: 0, skipped: 0 });
    expect(second).toMatchObject({ imported: 0, updated: 0, skipped: 1 });
    expect(index.sessionCount).toBe(2);
    expect(index.events.filter((event: { sessionId: string }) => event.sessionId === "browser-conv-auth")).toHaveLength(2);
    expect(retrieval.sessions.map((session: { id: string }) => session.id).sort()).toEqual(["browser-conv-auth", "terminal-auth"]);
    expect(retrieval.results.some((event: { source: string; platform?: string }) => event.source === "browser" && event.platform === "chatgpt")).toBe(true);
  });

  it("imports browser conversations from ZIP exports", async () => {
    const { root } = tempVault();
    const zip = new JSZip();
    zip.file("llm-history/chat.md", `---
title: Redis browser research
platform: claude
date: 2026-06-10T10:00:00.000Z
message_count: 2
conversation_id: zip-redis
---

## User

How should Redis invalidation work?

## Assistant

Use explicit cache tags and measure stale reads.
`);
    zip.file("llm-history/readme.txt", "not an export");
    const zipPath = path.join(root, "browser-export.zip");
    fs.writeFileSync(zipPath, await zip.generateAsync({ type: "nodebuffer" }));

    const result = await importBrowserExports(root, zipPath);
    const index = buildContextIndex(root);

    expect(result).toMatchObject({ imported: 1, updated: 0, skipped: 0, errors: [] });
    expect(index.sessions[0]).toMatchObject({ id: "browser-zip-redis", source: "browser", platform: "claude" });
    expect(index.eventCount).toBe(2);
  });

  it("rejects oversized browser Markdown imports", async () => {
    const { root } = tempVault();
    const exportPath = path.join(root, "oversized.md");
    fs.writeFileSync(exportPath, `---
title: Oversized
platform: chatgpt
date: 2026-06-10T10:00:00.000Z
conversation_id: oversized
---

## User

${"x".repeat(10 * 1024 * 1024)}
`, "utf8");

    await expect(importBrowserExports(root, exportPath)).rejects.toThrow("10 MB Markdown import limit");
  });

  it("indexes sessions and ranks relevant decisions, tasks, and problems", () => {
    const { root, sessions } = tempVault();
    writeSession(sessions, "auth.md", `---
id: auth-1
title: Fix auth middleware
source: codex
started_at: 2026-06-01T10:00:00.000Z
---

## Decision

<!-- context-event: {"createdAt":"2026-06-01T10:03:00.000Z"} -->
Keep auth checks in middleware.

## Task

Add an auth redirect regression test.

## Problem

Login redirect loop is caused by middleware order.
`);
    writeSession(sessions, "redis.md", `---
id: redis-1
title: Redis cache work
source: human
started_at: 2026-05-01T10:00:00.000Z
---

## Note

Redis cache invalidation needs metrics.
`);

    const index = buildContextIndex(root);
    const retrieval = retrieveContext(root, "auth middleware");

    expect(index.sessionCount).toBe(2);
    expect(index.eventCount).toBe(4);
    expect(retrieval.results).toHaveLength(3);
    expect(retrieval.results[0]).toMatchObject({ sessionId: "auth-1", type: "decision" });
    expect(retrieval.results[0].content).toBe("Keep auth checks in middleware.");
    expect(retrieval.results[0].content).not.toContain("context-event");
    expect(retrieval.sessions.map((session: { id: string }) => session.id)).toEqual(["auth-1"]);
  });

  it("prepares query-specific context while preserving project memory", () => {
    const { root, sessions } = tempVault();
    writeSession(sessions, "auth.md", `---
id: auth-1
title: Fix auth middleware
source: codex
started_at: 2026-06-01T10:00:00.000Z
---

## Decision

Keep auth checks in middleware.
`);

    const result = prepareContext(root, "auth middleware");
    const output = fs.readFileSync(result.outputPath, "utf8");

    expect(output).toContain("# ContextVault Prepared Context");
    expect(output).toContain("Manual rule: keep auth in middleware.");
    expect(output).toContain("Keep auth checks in middleware.");
    expect(result.retrieval.results).toHaveLength(1);
  });

  it("maintains a generated memory block without replacing manual memory", () => {
    const { root, sessions } = tempVault();
    writeSession(sessions, "auth.md", `---
id: auth-1
title: Fix auth middleware
source: codex
started_at: 2026-06-01T10:00:00.000Z
---

## Decision

Keep auth checks in middleware.

## Task

Add a regression test.
`);

    updateProjectMemory(root);
    updateProjectMemory(root);
    const memory = fs.readFileSync(path.join(root, ".contextvault", "memory.md"), "utf8");

    expect(memory).toContain("Manual rule: keep auth in middleware.");
    expect(memory).toContain("## Generated Context Memory");
    expect(memory.match(/contextvault:generated-memory:start/g)).toHaveLength(1);
    expect(memory).toContain("[Fix auth middleware] Add a regression test.");
  });

  it("links sessions and generates a chronological timeline", () => {
    const { root, sessions } = tempVault();
    writeSession(sessions, "discover.md", `---
id: discover-1
title: Discover redirect bug
source: codex
started_at: 2026-06-01T10:00:00.000Z
---

## Problem

Login redirect loops.
`);
    writeSession(sessions, "fix.md", `---
id: fix-1
title: Fix redirect bug
source: claude-code
started_at: 2026-06-02T10:00:00.000Z
---

## Decision

Reorder authentication middleware.
`);

    linkSessions(root, "discover-1", "fix-1", "fixed by");
    const timeline = buildTimeline(root);
    const output = fs.readFileSync(timeline.outputPath, "utf8");

    expect(output.indexOf("Discover redirect bug")).toBeLessThan(output.indexOf("Fix redirect bug"));
    expect(output).toContain("discover-1 -> fix-1: fixed by");
    expect(timeline.eventCount).toBe(2);
  });

  it("lists focused tasks, decisions, and problems from the unified index", async () => {
    const { root, sessions } = tempVault();
    writeSession(sessions, "work.md", `---
id: work-1
title: Auth follow-up
source: human
started_at: 2026-06-12T10:00:00.000Z
---

## Task

Add a login regression test.

## Decision

Keep redirects in middleware.

## Problem

Callback can loop.
`);

    expect(listContextEvents(root, "task").map((event: { content: string }) => event.content)).toEqual(["Add a login regression test."]);
    expect(listContextEvents(root, "decision")).toHaveLength(1);
    expect(listContextEvents(root, "problem")).toHaveLength(1);
  });

  it("filters project evidence by query, source, type, and time", async () => {
    const { root, sessions } = tempVault();
    writeSession(sessions, "codex-auth.md", `---
id: codex-auth
title: Auth architecture
source: codex
started_at: 2026-06-20T10:00:00.000Z
---

## Decision

Keep authentication in middleware.
`);
    writeSession(sessions, "human-redis.md", `---
id: human-redis
title: Redis investigation
source: human
started_at: 2026-05-01T10:00:00.000Z
---

## Problem

Redis invalidation attempt failed under concurrent writes.
`);

    const decisions = listContextEvents(root, "decision", {
      query: "auth",
      sources: ["codex"],
      since: "2026-06-15T00:00:00.000Z",
    });
    const oldProblems = listContextEvents(root, "problem", { query: "redis", since: "2026-06-01" });
    const typedHistory = listContextEvents(root, undefined, { types: ["decision"], sources: ["codex"] });
    const retrieval = retrieveContext(root, "auth", { types: ["decision"], sources: ["codex"] });

    expect(decisions.map((event: { sessionId: string }) => event.sessionId)).toEqual(["codex-auth"]);
    expect(oldProblems).toHaveLength(0);
    expect(typedHistory.map((event: { type: string }) => event.type)).toEqual(["decision"]);
    expect(retrieval.results).toHaveLength(1);
    expect(parseSince("2w", Date.parse("2026-06-27T00:00:00.000Z"))).toBe("2026-06-13T00:00:00.000Z");
  });
});
