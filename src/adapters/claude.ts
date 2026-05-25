import type { LLMAdapter } from "../types";

export const claudeAdapter: LLMAdapter = {
  platform: "claude",
  name: "Claude",

  urlPattern: /^https?:\/\/(www\.)?claude\.ai(?:\/|$)/,

  apiEndpointPattern: /\/api\/organizations\/.+\/chat_conversations|\/api\/append_message|\/api\/retry_completion/,

  conversationIdFromUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      const match = parsed.pathname.match(/\/chat\/([a-zA-Z0-9_-]+)/);
      return match?.[1] ?? null;
    } catch {
      return null;
    }
  },

  getTitleFromPage(): string {
    const titleButton = document.querySelector('[data-testid="chat-title"], h1, header button');
    const title = titleButton?.textContent?.trim();
    if (title && title.length > 1 && title !== "Claude") return title;

    const clean = document.title.replace(/\s*[-|]\s*Claude\s*$/i, "").trim();
    return clean && clean !== "Claude" ? clean : "Untitled";
  },

  messageContainer: "main, [role='main'], body",

  userSelector: [
    '[data-testid="user-message"]',
    '[data-testid*="human"]',
    '[data-message-author-role="user"]',
    '.font-user-message',
    'div[class*="user-message"]',
  ].join(", "),

  assistantSelector: [
    '[data-testid="assistant-message"]',
    '[data-testid*="assistant"]',
    '[data-message-author-role="assistant"]',
    '.font-claude-message',
    'div[class*="assistant-message"]',
  ].join(", "),

  isNewConversation(oldUrl: string, newUrl: string): boolean {
    if (oldUrl === newUrl) return false;
    const oldId = this.conversationIdFromUrl(oldUrl);
    const newId = this.conversationIdFromUrl(newUrl);
    if (newId && oldId !== newId) return true;

    try {
      const oldParsed = new URL(oldUrl);
      const newParsed = new URL(newUrl);
      return newParsed.pathname === "/new" || (newParsed.pathname === "/" && oldParsed.pathname !== "/");
    } catch {
      return false;
    }
  },

  isStreamingComplete(node: Element): boolean {
    const stop = document.querySelector('button[aria-label*="Stop"], button[data-testid*="stop"]');
    if (stop) return false;

    const actions = node.querySelector(
      'button[aria-label*="Copy"], button[aria-label*="Retry"], button[data-testid*="copy"], button[data-testid*="retry"]'
    );
    return Boolean(actions) || Boolean(node.textContent?.trim());
  },

  detectModel(): string | undefined {
    const candidates = document.querySelectorAll('[data-testid*="model"], button, [aria-label*="model"]');
    for (const el of candidates) {
      const text = el.textContent?.trim();
      if (text && /claude|opus|sonnet|haiku/i.test(text)) return text;
    }
    return undefined;
  },
};
