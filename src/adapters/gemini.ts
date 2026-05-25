import type { LLMAdapter } from "../types";

export const geminiAdapter: LLMAdapter = {
  platform: "gemini",
  name: "Gemini",

  urlPattern: /^https?:\/\/gemini\.google\.com(?:\/|$)/,

  apiEndpointPattern: /\/_\//,

  conversationIdFromUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      const match = parsed.pathname.match(/\/app\/([a-zA-Z0-9_-]+)/);
      return match?.[1] ?? null;
    } catch {
      return null;
    }
  },

  getTitleFromPage(): string {
    const heading = document.querySelector("h1, .conversation-title, [data-test-id*='conversation-title']");
    const title = heading?.textContent?.trim();
    if (title && title !== "Gemini") return title;

    const clean = document.title.replace(/\s*[-|]\s*Gemini\s*$/i, "").trim();
    return clean && clean !== "Gemini" ? clean : "Untitled";
  },

  messageContainer: "main, [role='main'], body",

  userSelector: [
    "user-query",
    ".user-query",
    '[data-message-author-role="user"]',
    '[class*="user-query"]',
    '[class*="query-text"]',
  ].join(", "),

  assistantSelector: [
    "model-response",
    ".model-response-text",
    '[data-message-author-role="assistant"]',
    '[class*="model-response"]',
    '[class*="response-container"]',
  ].join(", "),

  isNewConversation(oldUrl: string, newUrl: string): boolean {
    if (oldUrl === newUrl) return false;
    const oldId = this.conversationIdFromUrl(oldUrl);
    const newId = this.conversationIdFromUrl(newUrl);
    if (newId && oldId !== newId) return true;

    try {
      const oldParsed = new URL(oldUrl);
      const newParsed = new URL(newUrl);
      return newParsed.pathname === "/app" && oldParsed.pathname !== "/app";
    } catch {
      return false;
    }
  },

  isStreamingComplete(node: Element): boolean {
    const stop = document.querySelector('button[aria-label*="Stop"], button[data-test-id*="stop"]');
    if (stop) return false;

    const actions = node.querySelector(
      'button[aria-label*="Copy"], button[aria-label*="Share"], button[data-test-id*="copy"]'
    );
    return Boolean(actions) || Boolean(node.textContent?.trim());
  },

  detectModel(): string | undefined {
    const candidates = document.querySelectorAll("button, [aria-label*='model'], [class*='model']");
    for (const el of candidates) {
      const text = el.textContent?.trim();
      if (text && /gemini|pro|flash/i.test(text)) return text;
    }
    return undefined;
  },
};
