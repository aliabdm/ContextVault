import { describe, it, expect } from "vitest";
import { StreamAssembler } from "../src/capture/stream-assembler";

describe("StreamAssembler", () => {
  it("should create an assembler with a conversation ID", () => {
    const assembler = new StreamAssembler("conv-123");
    expect(assembler).toBeDefined();
    expect(assembler.getMessages()).toEqual([]);
  });

  it("should extract content from OpenAI-style SSE delta chunks", () => {
    const assembler = new StreamAssembler("conv-1");

    const chunk1 = JSON.stringify({
      choices: [{ delta: { content: "Hello" }, index: 0 }],
    });
    const msg1 = assembler.processNetworkChunk({
      url: "https://chatgpt.com/backend-api/conversation",
      data: chunk1,
      timestamp: "2026-05-25T10:00:00.000Z",
    });
    expect(msg1).toBeNull();

    const chunk2 = JSON.stringify({
      choices: [{ delta: { content: " world!" }, index: 0 }],
    });
    const msg2 = assembler.processNetworkChunk({
      url: "https://chatgpt.com/backend-api/conversation",
      data: chunk2,
      timestamp: "2026-05-25T10:00:01.000Z",
    });
    expect(msg2).toBeNull();

    const done = assembler.finalizeCurrentStream();
    expect(done).toBeDefined();
    expect(done!.role).toBe("assistant");
    expect(done!.content).toBe("Hello world!");
  });

  it("should extract content from Anthropic-style message delta", () => {
    const assembler = new StreamAssembler("conv-2");

    const chunk = JSON.stringify({
      type: "content_block_delta",
      delta: { text: "Sure, let me help with that." },
    });
    const msg = assembler.processNetworkChunk({
      url: "https://claude.ai/api/organizations/org-1/chat_conversations/conv-1",
      data: chunk,
      timestamp: "2026-05-25T11:00:00.000Z",
    });

    expect(msg).toBeNull();

    const done = assembler.finalizeCurrentStream();
    expect(done!.content).toBe("Sure, let me help with that.");
  });

  it("should extract content from Anthropic-style content blocks", () => {
    const assembler = new StreamAssembler("conv-3");

    const chunk = JSON.stringify({
      delta: {
        content: [{ type: "text", text: "Here is the code:" }, { type: "text", text: "```js\nconsole.log(1);\n```" }],
      },
    });
    assembler.processNetworkChunk({
      url: "https://claude.ai/api/organizations/org-1/chat_conversations/conv-1",
      data: chunk,
      timestamp: "2026-05-25T12:00:00.000Z",
    });

    const done = assembler.finalizeCurrentStream();
    expect(done!.content).toBe("Here is the code:```js\nconsole.log(1);\n```");
  });

  it("should detect message completion via finish_reason", () => {
    const assembler = new StreamAssembler("conv-4");

    const chunk = JSON.stringify({
      choices: [{ delta: { content: "Done." }, finish_reason: "stop", index: 0 }],
    });
    const msg = assembler.processNetworkChunk({
      url: "https://chatgpt.com/backend-api/conversation",
      data: chunk,
      timestamp: "2026-05-25T13:00:00.000Z",
    });

    expect(msg).toBeDefined();
    expect(msg!.role).toBe("assistant");
    expect(msg!.content).toBe("Done.");
  });

  it("should detect '[DONE]' as stream end marker and finalize", () => {
    const assembler = new StreamAssembler("conv-5");

    const chunk1 = JSON.stringify({
      choices: [{ delta: { content: "Streaming text" }, index: 0 }],
    });
    assembler.processNetworkChunk({
      url: "https://chatgpt.com/backend-api/conversation",
      data: chunk1,
      timestamp: "2026-05-25T14:00:00.000Z",
    });

    const done = assembler.processNetworkChunk({
      url: "https://chatgpt.com/backend-api/conversation",
      data: "[DONE]",
      timestamp: "2026-05-25T14:00:02.000Z",
    });

    expect(done).toBeDefined();
    expect(done!.content).toBe("Streaming text");
  });

  it("should deduplicate same content chunks from network (SSE)", () => {
    const assembler = new StreamAssembler("conv-6");

    const chunk = JSON.stringify({
      choices: [{ delta: { content: "Duplicate test" }, index: 0 }],
    });

    assembler.processNetworkChunk({
      url: "https://chatgpt.com/backend-api/conversation",
      data: chunk,
      timestamp: "2026-05-25T15:00:00.000Z",
    });

    const duplicate = assembler.processNetworkChunk({
      url: "https://chatgpt.com/backend-api/conversation",
      data: chunk,
      timestamp: "2026-05-25T15:00:01.000Z",
    });

    expect(duplicate).toBeNull();
  });

  it("should track message history across multiple turns", () => {
    const assembler = new StreamAssembler("conv-7");

    const userMsg = assembler.processDOMComplete(
      "user",
      "What is TypeScript?",
      "2026-05-25T16:00:00.000Z"
    );
    expect(userMsg!.role).toBe("user");

    const chunk = JSON.stringify({
      choices: [{ delta: { content: "TypeScript is a typed superset of JavaScript." }, index: 0 }],
    });
    assembler.processNetworkChunk({
      url: "https://chatgpt.com/backend-api/conversation",
      data: chunk,
      timestamp: "2026-05-25T16:00:02.000Z",
    });

    const assistantMsg = assembler.finalizeCurrentStream();
    expect(assistantMsg!.role).toBe("assistant");

    const messages = assembler.getMessages();
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("user");
    expect(messages[1].role).toBe("assistant");
  });

  it("should skip empty messages", () => {
    const assembler = new StreamAssembler("conv-8");

    const chunk = JSON.stringify({
      choices: [{ delta: { content: "" }, finish_reason: "stop", index: 0 }],
    });
    const msg = assembler.processNetworkChunk({
      url: "https://chatgpt.com/backend-api/conversation",
      data: chunk,
      timestamp: "2026-05-25T17:00:00.000Z",
    });

    expect(msg).toBeNull();
    expect(assembler.getMessages()).toHaveLength(0);
  });

  it("should handle DOM-based assistant updates with growing content", () => {
    const assembler = new StreamAssembler("conv-9");

    const partial = assembler.processDOMContent("assistant", "Hel", "2026-05-25T18:00:00.000Z");
    expect(partial).toBeNull();

    const longer = assembler.processDOMContent("assistant", "Hello", "2026-05-25T18:00:01.000Z");
    expect(longer).toBeNull();

    const complete = assembler.processDOMContent("assistant", "Hello World!", "2026-05-25T18:00:02.000Z");
    expect(complete).toBeNull();

    const finalized = assembler.processDOMComplete("assistant", "Hello World!", "2026-05-25T18:00:03.000Z");
    expect(finalized!.content).toBe("Hello World!");
  });

  it("should reset and clear all messages", () => {
    const assembler = new StreamAssembler("conv-10");

    assembler.processDOMComplete("user", "Hello", "2026-05-25T19:00:00.000Z");
    assembler.processDOMComplete("assistant", "Hi there!", "2026-05-25T19:00:01.000Z");

    expect(assembler.getMessages()).toHaveLength(2);

    assembler.reset();
    expect(assembler.getMessages()).toHaveLength(0);
  });

  it("should handle malformed JSON gracefully", () => {
    const assembler = new StreamAssembler("conv-11");

    const msg = assembler.processNetworkChunk({
      url: "https://chatgpt.com/backend-api/conversation",
      data: "not valid json {{{",
      timestamp: "2026-05-25T20:00:00.000Z",
    });

    expect(msg).toBeNull();
  });

  it("should detect message from content field in response", () => {
    const assembler = new StreamAssembler("conv-12");

    const chunk = JSON.stringify({
      content: "Direct content field",
    });
    assembler.processNetworkChunk({
      url: "https://api.example.com/v1/chat",
      data: chunk,
      timestamp: "2026-05-25T21:00:00.000Z",
    });

    const done = assembler.finalizeCurrentStream();
    expect(done!.content).toBe("Direct content field");
  });
});
