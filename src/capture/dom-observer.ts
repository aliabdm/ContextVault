import type { LLMAdapter } from "../types";

export interface DOMObserverCallbacks {
  onUserMessage: (content: string, timestamp: string) => void;
  onAssistantChunk: (content: string, timestamp: string) => void;
  onStreamingComplete: (finalContent: string, timestamp: string) => void;
  onNewConversation: (previousId?: string | null) => void;
  onMessageEdited: (index: number, newContent: string) => void;
}

export class DOMObserver {
  private adapter: LLMAdapter;
  private observer: MutationObserver | null = null;
  private callbacks: DOMObserverCallbacks;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private previousUserCount = 0;
  private previousAssistantCount = 0;
  private previousUserTexts: string[] = [];
  private previousAssistantTexts: string[] = [];
  private previousAssistantContents = new Map<number, string>();
  private lastAssistantContent = "";
  private lastAssistantElement: Element | null = null;
  private isRunning = false;
  private retryCount = 0;
  private maxRetries = 10;

  constructor(adapter: LLMAdapter, callbacks: DOMObserverCallbacks) {
    this.adapter = adapter;
    this.callbacks = callbacks;
  }

  start(): void {
    if (this.isRunning) return;

    const container = this.findContainer();
    if (!container) {
      this.retryCount++;
      if (this.retryCount < this.maxRetries) {
        console.log(
          `[LLM Observer] DOM container retry ${this.retryCount}/${this.maxRetries} for ${this.adapter.platform}`
        );
        setTimeout(() => this.start(), 2000);
      } else {
        console.warn(`[LLM Observer] DOM container not found after ${this.maxRetries} retries, using body`);
        this.startOnBody();
      }
      return;
    }

    this.isRunning = true;
    this.retryCount = 0;
    console.log(`[LLM Observer] DOM observer started on container for ${this.adapter.platform}`);

    this.observer = new MutationObserver(() => {
      this.handleMutations();
    });

    this.observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    this.detectNewConversationButton();

    setTimeout(() => this.scanMessages(), 1000);
  }

  stop(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.isRunning = false;
  }

  flush(): void {
    this.scanMessages();
  }

  private startOnBody(): void {
    if (!document.body) {
      setTimeout(() => this.startOnBody(), 500);
      return;
    }
    this.isRunning = true;
    this.observer = new MutationObserver(() => this.handleMutations());
    this.observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    console.log(`[LLM Observer] DOM observer started on body (fallback)`);
    this.detectNewConversationButton();
    setTimeout(() => this.scanMessages(), 1000);
  }

  private findContainer(): Element | null {
    const selectors = [
      this.adapter.messageContainer,
      "article",
      "main",
      '[role="main"]',
      ".react-scroll-to-bottom--css",
    ];

    for (const selector of selectors) {
      try {
        const el = document.querySelector(selector);
        if (el && el.children.length > 0) return el;
      } catch {
        // skip
      }
    }
    return null;
  }

  private detectNewConversationButton(): void {
    // URL change detection in ConversationDetector handles new conversation triggers.
  }

  private handleMutations(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.scanMessages(), 800);
  }

  private scanMessages(): void {
    const userElements = this.findElements(this.adapter.userSelector);
    const assistantElements = this.findElements(this.adapter.assistantSelector);

    const newUserTexts: string[] = [];
    for (const el of userElements) {
      const content = this.extractText(el);
      if (content) newUserTexts.push(content);
    }

    const newAssistantTexts: string[] = [];
    for (const el of assistantElements) {
      const content = this.extractText(el);
      if (content) newAssistantTexts.push(content);
    }

    if (newUserTexts.length > this.previousUserTexts.length) {
      for (let i = this.previousUserTexts.length; i < newUserTexts.length; i++) {
        const content = newUserTexts[i];
        if (content && !this.previousUserTexts.includes(content)) {
          this.callbacks.onUserMessage(content, new Date().toISOString());
        }
      }
    }

    if (newAssistantTexts.length > this.previousAssistantTexts.length) {
      for (let i = this.previousAssistantTexts.length; i < newAssistantTexts.length; i++) {
        const content = newAssistantTexts[i];
        if (content && !this.previousAssistantTexts.includes(content)) {
          this.callbacks.onAssistantChunk(content, new Date().toISOString());
          const latestEl = assistantElements[i];
          if (latestEl && this.adapter.isStreamingComplete(latestEl)) {
            this.callbacks.onStreamingComplete(content, new Date().toISOString());
          }
        }
      }
    } else if (newAssistantTexts.length > 0 && newAssistantTexts.length === this.previousAssistantTexts.length) {
      const lastIndex = newAssistantTexts.length - 1;
      const newContent = newAssistantTexts[lastIndex];
      const oldContent = this.previousAssistantTexts[lastIndex];

      if (newContent && newContent !== oldContent) {
        if (newContent.length > (oldContent?.length || 0)) {
          this.callbacks.onAssistantChunk(newContent, new Date().toISOString());
        }

        const latestEl = assistantElements[lastIndex];
        if (this.adapter.isStreamingComplete(latestEl)) {
          this.callbacks.onStreamingComplete(newContent, new Date().toISOString());
        }
      }
    }

    this.previousUserTexts = newUserTexts;
    this.previousAssistantTexts = newAssistantTexts;
    this.previousUserCount = userElements.length;
    this.previousAssistantCount = assistantElements.length;
    if (newAssistantTexts.length > 0) {
      this.lastAssistantContent = newAssistantTexts[newAssistantTexts.length - 1];
      this.lastAssistantElement = assistantElements[assistantElements.length - 1];
    }
  }

  private findElements(selector: string): Element[] {
    const results: Element[] = [];
    try {
      const parts = selector.split(", ");
      for (const part of parts) {
        try {
          const found = document.querySelectorAll(part);
          results.push(...Array.from(found));
        } catch {
          // skip invalid
        }
      }
    } catch {
      // skip
    }
    return [...new Set(results)];
  }

  private extractText(el: Element): string {
    const text = el.textContent?.trim() ?? "";
    if (text) return text.slice(0, 50000);
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const parts: string[] = [];
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const t = node.textContent?.trim();
      if (t) parts.push(t);
    }
    return parts.join(" ").slice(0, 50000);
  }

  setAdapter(adapter: LLMAdapter): void {
    const wasRunning = this.isRunning;
    this.stop();
    this.adapter = adapter;
    this.previousUserCount = 0;
    this.previousAssistantCount = 0;
    this.previousUserTexts = [];
    this.previousAssistantTexts = [];
    this.previousAssistantContents.clear();
    this.lastAssistantContent = "";
    this.lastAssistantElement = null;
    if (wasRunning) this.start();
  }
}
