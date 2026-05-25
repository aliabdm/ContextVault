import type { LLMAdapter } from "../types";

const SUPPORTED_GENERIC_HOSTS = [
  "perplexity.ai",
  "www.perplexity.ai",
  "poe.com",
  "www.poe.com",
  "chat.deepseek.com",
  "grok.com",
  "www.grok.com",
  "copilot.microsoft.com",
];

export const genericAdapter: LLMAdapter = {
  platform: "generic",
  name: "Generic LLM",

  urlPattern: /^https?:\/\/(?:(?:www\.)?(?:perplexity\.ai|poe\.com|grok\.com)|chat\.deepseek\.com|copilot\.microsoft\.com)(?:\/|$)/,

  apiEndpointPattern: /\/(api|chat|conversation|message|completion|graphql)\b/i,

  conversationIdFromUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      if (!SUPPORTED_GENERIC_HOSTS.includes(parsed.hostname)) return null;
      const segments = parsed.pathname.split("/").filter(Boolean);
      return segments.find((part) => /^[a-zA-Z0-9_-]{8,}$/.test(part)) ?? null;
    } catch {
      return null;
    }
  },

  getTitleFromPage(): string {
    const heading = document.querySelector("h1, [role='heading']");
    const title = heading?.textContent?.trim();
    if (title && title.length > 1) return title;

    const clean = document.title.replace(/\s*[-|]\s*(Perplexity|Poe|DeepSeek|Grok|Copilot).*$/i, "").trim();
    return clean || "Untitled";
  },

  messageContainer: "main, [role='main'], body",

  userSelector: [
    '[data-message-author-role="user"]',
    '[data-role="user"]',
    '[class*="user-message"]',
    '[class*="human-message"]',
    '[class*="query"]',
  ].join(", "),

  assistantSelector: [
    '[data-message-author-role="assistant"]',
    '[data-role="assistant"]',
    '[class*="assistant-message"]',
    '[class*="bot-message"]',
    '[class*="answer"]',
    '[class*="response"]',
  ].join(", "),

  isNewConversation(oldUrl: string, newUrl: string): boolean {
    if (oldUrl === newUrl) return false;
    const oldId = this.conversationIdFromUrl(oldUrl);
    const newId = this.conversationIdFromUrl(newUrl);
    return Boolean(newId && oldId !== newId);
  },

  isStreamingComplete(node: Element): boolean {
    const globalStop = document.querySelector('button[aria-label*="Stop"], button[title*="Stop"]');
    if (globalStop) return false;
    return Boolean(node.textContent?.trim());
  },

  detectModel(): string | undefined {
    const candidates = document.querySelectorAll("button, [aria-label*='model'], [class*='model']");
    for (const el of candidates) {
      const text = el.textContent?.trim();
      if (text && /gpt|claude|gemini|deepseek|llama|mistral|grok|sonar/i.test(text)) return text;
    }
    return undefined;
  },
};
