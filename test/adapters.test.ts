import { describe, it, expect, beforeEach } from "vitest";
import { clearAdapterRegistry, registerAdapter, getAdapter, getAdapterForUrl, getPlatformForUrl, getAllAdapters } from "../src/adapters/base";
import { chatgptAdapter } from "../src/adapters/chatgpt";
import { claudeAdapter } from "../src/adapters/claude";
import { geminiAdapter } from "../src/adapters/gemini";
import { genericAdapter } from "../src/adapters/generic";
import type { LLMAdapter } from "../src/types";

const mockClaudeAdapter: LLMAdapter = {
  platform: "claude",
  name: "Claude",
  urlPattern: /^https?:\/\/(www\.)?claude\.ai/,
  apiEndpointPattern: /\/api\/organizations\/.+\/chat_conversations/,
  conversationIdFromUrl: (url: string) => {
    const match = url.match(/\/chat\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  },
  getTitleFromPage: () => "Claude Chat",
  messageContainer: ".chat-container",
  userSelector: ".user-message",
  assistantSelector: ".assistant-message",
  isNewConversation: (oldUrl: string, newUrl: string) => oldUrl !== newUrl,
  isStreamingComplete: () => true,
  detectModel: () => "claude-opus-4-5",
};

describe("Adapter Registry", () => {
  beforeEach(() => {
    clearAdapterRegistry();
    registerAdapter(chatgptAdapter);
    registerAdapter(mockClaudeAdapter);
  });

  it("should register and retrieve adapters by platform", () => {
    const chatgpt = getAdapter("chatgpt");
    const claude = getAdapter("claude");

    expect(chatgpt).toBeDefined();
    expect(chatgpt!.platform).toBe("chatgpt");
    expect(claude).toBeDefined();
    expect(claude!.platform).toBe("claude");
  });

  it("should return undefined for unknown platform", () => {
    const unknown = getAdapter("deepseek" as any);
    expect(unknown).toBeUndefined();
  });

  it("should find adapter by URL pattern", () => {
    const found = getAdapterForUrl("https://chatgpt.com/c/abc-123");
    expect(found).toBeDefined();
    expect(found!.platform).toBe("chatgpt");
  });

  it("should find Claude adapter by URL", () => {
    const found = getAdapterForUrl("https://claude.ai/chat/conv-456");
    expect(found).toBeDefined();
    expect(found!.platform).toBe("claude");
  });

  it("should return undefined for unsupported URL", () => {
    const found = getAdapterForUrl("https://google.com");
    expect(found).toBeUndefined();
  });

  it("should detect platform from URL", () => {
    expect(getPlatformForUrl("https://chatgpt.com/c/abc")).toBe("chatgpt");
    expect(getPlatformForUrl("https://claude.ai/chat/def")).toBe("claude");
    expect(getPlatformForUrl("https://example.com")).toBe("generic");
  });

  it("should return all registered adapters", () => {
    const all = getAllAdapters();
    expect(all).toHaveLength(2);
    expect(all.map((a) => a.platform).sort()).toEqual(["chatgpt", "claude"]);
  });
});

describe("ChatGPT Adapter", () => {
  it("should match chatgpt.com URLs", () => {
    expect(chatgptAdapter.urlPattern.test("https://chatgpt.com/c/abc123")).toBe(true);
    expect(chatgptAdapter.urlPattern.test("https://www.chatgpt.com/")).toBe(true);
    expect(chatgptAdapter.urlPattern.test("http://chatgpt.com/g/g-123")).toBe(true);
  });

  it("should NOT match non-ChatGPT URLs", () => {
    expect(chatgptAdapter.urlPattern.test("https://claude.ai")).toBe(false);
    expect(chatgptAdapter.urlPattern.test("https://chatgpt.com.fake.io")).toBe(false);
  });

  it("should match ChatGPT API endpoints", () => {
    expect(chatgptAdapter.apiEndpointPattern.test("https://chatgpt.com/backend-api/conversation")).toBe(true);
    expect(chatgptAdapter.apiEndpointPattern.test("/backend-api/conversation/abc")).toBe(true);
  });

  it("should extract conversation ID from URL", () => {
    const id = chatgptAdapter.conversationIdFromUrl("https://chatgpt.com/c/abc-123-xyz");
    expect(id).toBe("abc-123-xyz");
  });

  it("should return null for URL without conversation ID", () => {
    const id = chatgptAdapter.conversationIdFromUrl("https://chatgpt.com/");
    expect(id).toBeNull();
  });

  it("should return null for malformed URL", () => {
    const id = chatgptAdapter.conversationIdFromUrl("not-a-url");
    expect(id).toBeNull();
  });

  it("should detect new conversation when URL changes from one convo to another", () => {
    const old = "https://chatgpt.com/c/abc-123";
    const newUrl = "https://chatgpt.com/c/def-456";
    expect(chatgptAdapter.isNewConversation(old, newUrl)).toBe(true);
  });

  it("should detect new conversation when navigating to root", () => {
    const old = "https://chatgpt.com/c/abc-123";
    const newUrl = "https://chatgpt.com/";
    expect(chatgptAdapter.isNewConversation(old, newUrl)).toBe(true);
  });

  it("should NOT flag same URL as new conversation", () => {
    const url = "https://chatgpt.com/c/abc-123";
    expect(chatgptAdapter.isNewConversation(url, url)).toBe(false);
  });
});

describe("Additional Platform Adapters", () => {
  beforeEach(() => {
    clearAdapterRegistry();
    registerAdapter(chatgptAdapter);
    registerAdapter(claudeAdapter);
    registerAdapter(geminiAdapter);
    registerAdapter(genericAdapter);
  });

  it("should match Claude URLs and extract conversation IDs", () => {
    const found = getAdapterForUrl("https://claude.ai/chat/abc-123");
    expect(found?.platform).toBe("claude");
    expect(claudeAdapter.conversationIdFromUrl("https://claude.ai/chat/abc-123")).toBe("abc-123");
  });

  it("should match Gemini URLs and extract conversation IDs", () => {
    const found = getAdapterForUrl("https://gemini.google.com/app/abc123");
    expect(found?.platform).toBe("gemini");
    expect(geminiAdapter.conversationIdFromUrl("https://gemini.google.com/app/abc123")).toBe("abc123");
  });

  it("should match selected generic LLM hosts", () => {
    expect(getAdapterForUrl("https://perplexity.ai/search/example")?.platform).toBe("generic");
    expect(getAdapterForUrl("https://poe.com/chat/abc123456")?.platform).toBe("generic");
    expect(getAdapterForUrl("https://chat.deepseek.com/a/chat/s/abc123456")?.platform).toBe("generic");
    expect(getAdapterForUrl("https://example.com/chat/abc123456")).toBeUndefined();
  });
});
