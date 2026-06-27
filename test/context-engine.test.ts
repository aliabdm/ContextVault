import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

// The context engine is intentionally plain ESM so the CLI can run without a build step.
// @ts-ignore No declaration file is needed for the local CLI module.
import {
  buildContextIndex,
  buildTimeline,
  linkSessions,
  normalizeSessionMarkdown,
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
});
