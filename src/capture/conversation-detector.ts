import type { LLMAdapter } from "../types";

export interface ConversationDetectorCallbacks {
  onNewConversation: (previousId?: string | null) => void;
  onConversationEnd: (conversationId: string) => void;
  onTitleChange: (title: string) => void;
}

export class ConversationDetector {
  private adapter: LLMAdapter;
  private currentUrl: string;
  private currentConversationId: string | null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private idleTimeoutMinutes: number;
  private messageCount = 0;
  private maxMessagesPerFile: number;
  private titleCheckInterval: ReturnType<typeof setInterval> | null = null;
  private urlPollInterval: ReturnType<typeof setInterval> | null = null;
  private previousTitle: string;
  private callbacks: ConversationDetectorCallbacks;
  private isRunning = false;

  constructor(
    adapter: LLMAdapter,
    callbacks: ConversationDetectorCallbacks,
    idleTimeoutMinutes = 10,
    maxMessagesPerFile = 100
  ) {
    this.adapter = adapter;
    this.currentUrl = window.location.href;
    this.currentConversationId = adapter.conversationIdFromUrl(this.currentUrl);
    this.idleTimeoutMinutes = idleTimeoutMinutes;
    this.maxMessagesPerFile = maxMessagesPerFile;
    this.previousTitle = document.title;
    this.callbacks = callbacks;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    this.watchURL();
    this.watchTitle();
    this.startIdleTimer();
    this.startURLPoller();

    console.log(`[LLM Observer] Conversation detector started for ${this.adapter.platform}`);
  }

  stop(): void {
    this.isRunning = false;
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.titleCheckInterval) clearInterval(this.titleCheckInterval);
    if (this.urlPollInterval) clearInterval(this.urlPollInterval);
  }

  onMessage(): void {
    this.messageCount++;
    this.resetIdleTimer();

    if (this.maxMessagesPerFile > 0 && this.messageCount >= this.maxMessagesPerFile) {
      if (this.currentConversationId) {
        this.callbacks.onConversationEnd(this.currentConversationId);
      }
      this.messageCount = 0;
      this.callbacks.onNewConversation(this.currentConversationId);
    }
  }

  getConversationId(): string | null {
    return this.currentConversationId;
  }

  updateAdapter(adapter: LLMAdapter): void {
    this.stop();
    this.adapter = adapter;
    this.currentUrl = window.location.href;
    this.currentConversationId = adapter.conversationIdFromUrl(this.currentUrl);
    this.previousTitle = document.title;
    this.messageCount = 0;
    this.start();
  }

  setIdleTimeout(minutes: number): void {
    this.idleTimeoutMinutes = minutes;
    this.resetIdleTimer();
  }

  private startURLPoller(): void {
    this.urlPollInterval = setInterval(() => {
      if (window.location.href !== this.currentUrl) {
        console.log(`[LLM Observer] URL poll detected change: ${window.location.href}`);
        this.onURLChange();
      }
    }, 1000);
  }

  private watchURL(): void {
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = (...args) => {
      originalPushState(...args);
      this.onURLChange();
    };

    history.replaceState = (...args) => {
      originalReplaceState(...args);
      this.onURLChange();
    };

    window.addEventListener("popstate", () => this.onURLChange());
  }

  private onURLChange(): void {
    const newUrl = window.location.href;
    if (newUrl === this.currentUrl) return;

    const isNew = this.adapter.isNewConversation(this.currentUrl, newUrl);

    if (isNew && this.currentConversationId) {
      this.callbacks.onConversationEnd(this.currentConversationId);
    }

    this.currentUrl = newUrl;
    this.currentConversationId = this.adapter.conversationIdFromUrl(newUrl);
    this.messageCount = 0;

    if (isNew) {
      this.callbacks.onNewConversation(null);
    }
  }

  private watchTitle(): void {
    this.titleCheckInterval = setInterval(() => {
      const newTitle = document.title;
      if (newTitle !== this.previousTitle && newTitle.trim() !== "") {
        this.previousTitle = newTitle;
        this.callbacks.onTitleChange(newTitle);
      }
    }, 2000);
  }

  private watchNavigation(): void {
    document.addEventListener("click", (e) => {
      const target = e.target as Element;
      const link = target.closest("a");
      if (
        link &&
        (link.getAttribute("href") === "/" || link.getAttribute("aria-label")?.includes("New chat"))
      ) {
        setTimeout(() => this.onURLChange(), 500);
      }
    });
  }

  private startIdleTimer(): void {
    this.resetIdleTimer();

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => {
      document.addEventListener(evt, () => this.resetIdleTimer(), { passive: true });
    });
  }

  private resetIdleTimer(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      if (this.currentConversationId && this.messageCount > 0) {
        this.callbacks.onConversationEnd(this.currentConversationId);
        this.messageCount = 0;
      }
    }, this.idleTimeoutMinutes * 60 * 1000);
  }
}
