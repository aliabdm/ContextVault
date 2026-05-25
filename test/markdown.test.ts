import { describe, it, expect } from "vitest";
import { buildMarkdown, generateFilename } from "../src/storage/markdown";
import type { Conversation, Message } from "../src/types";

function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  const messages: Message[] = [
    { role: "user", content: "How do I center a div?", timestamp: "2026-05-25T10:00:00.000Z" },
    { role: "assistant", content: 'Use `display: flex; justify-content: center; align-items: center;`', timestamp: "2026-05-25T10:00:05.000Z" },
  ];

  return {
    id: "chatgpt-abc123",
    platform: "chatgpt",
    title: "CSS Centering Explained",
    url: "https://chatgpt.com/c/abc123",
    model: "gpt-5",
    startedAt: "2026-05-25T10:00:00.000Z",
    endedAt: "2026-05-25T10:12:00.000Z",
    durationMinutes: 12,
    messageCount: 2,
    project: "my-startup",
    tags: ["css", "frontend", "layout"],
    previousConversationId: null,
    nextConversationId: null,
    messages,
    adapterVersion: "1.0.0",
    ...overrides,
  };
}

describe("buildMarkdown", () => {
  it("should generate valid YAML frontmatter with all fields", () => {
    const conv = makeConversation();
    const md = buildMarkdown(conv);
    const lines = md.split("\n");

    expect(lines[0]).toBe("---");
    expect(lines[1]).toContain("title:");
    expect(lines[2]).toContain("platform: chatgpt");
    expect(lines[3]).toContain("model: gpt-5");
    expect(lines[4]).toContain("date: 2026-05-25T10:00:00.000Z");
    expect(lines[5]).toContain("duration_minutes: 12");
    expect(lines[6]).toContain("message_count: 2");
    expect(lines[7]).toContain("project: my-startup");
    expect(lines[8]).toContain("tags:");
    expect(lines[9]).toContain("conversation_id:");
    expect(lines[10]).toContain("url:");
    expect(lines[11]).toContain("previous_conversation: null");
    expect(lines[12]).toContain("next_conversation: null");
    expect(lines[13]).toBe("---");
  });

  it("should generate User and Assistant sections", () => {
    const conv = makeConversation();
    const md = buildMarkdown(conv);

    expect(md).toContain("## User\n");
    expect(md).toContain("How do I center a div?");
    expect(md).toContain("## Assistant\n");
    expect(md).toContain("display: flex; justify-content: center");
  });

  it("should mark edited messages", () => {
    const conv = makeConversation({
      messages: [
        { role: "user", content: "Hello", timestamp: "2026-05-25T10:00:00.000Z", edited: true },
        { role: "assistant", content: "Hi", timestamp: "2026-05-25T10:00:05.000Z" },
      ],
    });
    const md = buildMarkdown(conv);

    expect(md).toContain("*[Edited]*");
  });

  it("should mark deleted messages", () => {
    const conv = makeConversation({
      messages: [
        { role: "user", content: "Secret", timestamp: "2026-05-25T10:00:00.000Z", deleted: true },
      ],
    });
    const md = buildMarkdown(conv);

    expect(md).toContain("*[Deleted]*");
  });

  it("should handle empty tags gracefully", () => {
    const conv = makeConversation({ tags: [] });
    const md = buildMarkdown(conv);

    expect(md).not.toContain("tags:");
  });

  it("should handle missing model field", () => {
    const conv = makeConversation({ model: undefined });
    const md = buildMarkdown(conv);

    expect(md).not.toContain("model:");
  });

  it("should handle missing project field", () => {
    const conv = makeConversation({ project: undefined });
    const md = buildMarkdown(conv);

    expect(md).not.toContain("project:");
  });

  it("should escape YAML values with special characters", () => {
    const conv = makeConversation({
      title: 'Title with "quotes" and : colons',
    });
    const md = buildMarkdown(conv);

    expect(md).toContain("title:");
    expect(md).toContain("quotes");
  });

  it("should handle code blocks in messages", () => {
    const conv = makeConversation({
      messages: [
        { role: "user", content: "Write code", timestamp: "2026-05-25T10:00:00.000Z" },
        { role: "assistant", content: "```python\nprint('hello')\n```", timestamp: "2026-05-25T10:00:05.000Z" },
      ],
    });
    const md = buildMarkdown(conv);

    expect(md).toContain("```python");
    expect(md).toContain("print('hello')");
  });
});

describe("generateFilename", () => {
  it("should generate a filename with date, time and title", () => {
    const conv = makeConversation();
    const filename = generateFilename(conv);

    expect(filename).toContain("chatgpt_");
    expect(filename).toContain("2026-05-25");
    expect(filename).toContain("10-00");
    expect(filename).toContain("css-centering-explained");
    expect(filename).toMatch(/\.md$/);
  });

  it("should sanitize special characters in title", () => {
    const conv = makeConversation({ title: "Hello! World? Test: 1/2" });
    const filename = generateFilename(conv);

    expect(filename).toContain("hello-world-test-12");
    expect(filename).not.toContain("!");
    expect(filename).not.toContain("?");
    expect(filename).not.toContain(":");
  });

  it("should use 'untitled' when title is empty", () => {
    const conv = makeConversation({ title: "" });
    const filename = generateFilename(conv);

    expect(filename).toContain("untitled");
  });

  it("should truncate long titles to 60 chars", () => {
    const conv = makeConversation({
      title: "a".repeat(100) + " b".repeat(100),
    });
    const filename = generateFilename(conv);

    const namePart = filename.replace(/\.md$/, "");
    const titlePart = namePart.split("_").slice(3).join("_");
    expect(titlePart.length).toBeLessThanOrEqual(60);
  });
});
