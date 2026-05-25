import type { LLMAdapter } from "../types";

export const chatgptAdapter: LLMAdapter = {
  platform: "chatgpt",
  name: "ChatGPT",

  urlPattern: /^https?:\/\/(www\.)?chatgpt\.com(?:\/|$)/,

  apiEndpointPattern: /\/backend-api\//,

  conversationIdFromUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      const pathMatch = parsed.pathname.match(/\/c\/([a-zA-Z0-9_-]+)/);
      if (pathMatch) return pathMatch[1];
    } catch {
      return null;
    }
    return null;
  },

  getTitleFromPage(): string {
    const sidebarTitle = document.querySelector(
      'nav[aria-label="Chat history"] a[class*="truncate"]'
    );
    if (sidebarTitle) {
      const text = sidebarTitle.textContent?.trim() ?? "";
      if (text && text !== "ChatGPT" && text !== "New chat" && text.length > 1) {
        return text;
      }
    }

    const h1 = document.querySelector("h1");
    if (h1) {
      const text = h1.textContent?.trim() ?? "";
      if (text && text !== "ChatGPT" && text !== "New chat") {
        return text;
      }
    }

    const docTitle = document.title;
    if (docTitle && docTitle !== "ChatGPT") {
      const clean = docTitle.replace(/\s*[-–—]\s*ChatGPT\s*$/, "").replace(/^ChatGPT\s*[-–—]\s*/, "");
      if (clean && clean !== "ChatGPT" && clean !== "New chat") {
        return clean;
      }
    }

    return "Untitled";
  },

  messageContainer: "main, [role='main'], body",

  userSelector: [
    '[data-message-author-role="user"]',
    'article:has([data-message-author-role="user"])',
    'div[class*="text-user"]',
    '[class*="message-user"]',
  ].join(", "),

  assistantSelector: [
    '[data-message-author-role="assistant"]',
    'article:has([data-message-author-role="assistant"])',
    'div[class*="text-assistant"]',
    '[class*="message-assistant"]',
  ].join(", "),

  isNewConversation(oldUrl: string, newUrl: string): boolean {
    if (oldUrl === newUrl) return false;

    const oldId = this.conversationIdFromUrl(oldUrl);
    const newId = this.conversationIdFromUrl(newUrl);

    if (newId && oldId !== newId) return true;

    try {
      const oldParsed = new URL(oldUrl);
      const newParsed = new URL(newUrl);
      if (newParsed.pathname === "/" && oldParsed.pathname !== "/") return true;
    } catch {
      // ignore
    }

    return false;
  },

  isStreamingComplete(node: Element): boolean {
    const stopIndicator = node.querySelector(
      'button[aria-label="Stop streaming"], button[data-testid="stop-button"], [class*="stop-button"]'
    );
    if (stopIndicator) return false;

    const regenerateButton = node.querySelector(
      'button[aria-label*="Regenerate"], button[data-testid*="regenerate"]'
    );
    if (regenerateButton) return true;

    const copyButton = node.querySelector(
      'button[aria-label="Copy"], button[data-testid="copy-turn-action-button"]'
    );
    if (copyButton) return true;

    const prose = node.querySelector('[class*="prose"]');
    if (prose && prose.textContent && prose.textContent.trim().length > 0) {
      const cursor = node.querySelector('[class*="cursor"], [class*="typing"]');
      if (!cursor) return true;
    }

    return false;
  },

  detectModel(_pageUrl: string): string | undefined {
    const indicators = document.querySelectorAll(
      '[data-testid="model-switcher-dropdown-button"] span, [class*="model"] span, [aria-label*="model"]'
    );
    for (const el of indicators) {
      const text = el.textContent?.trim();
      if (text && (text.includes("GPT") || text.includes("o3") || text.includes("o4"))) return text;
    }
    return undefined;
  },
};
