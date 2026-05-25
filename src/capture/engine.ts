import type { LLMAdapter, Message } from "../types";
import { DOMObserver } from "./dom-observer";
import { StreamAssembler } from "./stream-assembler";

export interface SimpleEngineCallbacks {
  onCapture: (role: "user" | "assistant", content: string) => void;
  onTitleChange: (title: string) => void;
}

export class SimpleEngine {
  private adapter: LLMAdapter;
  private domObserver: DOMObserver;
  private streamAssembler: StreamAssembler;
  private callbacks: SimpleEngineCallbacks;
  private titleCheckInterval: ReturnType<typeof setInterval> | null = null;
  private lastTitle = "";
  private lastFiredAssistantContent = "";
  private staleTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(adapter: LLMAdapter, callbacks: SimpleEngineCallbacks) {
    this.adapter = adapter;
    this.callbacks = callbacks;
    this.streamAssembler = new StreamAssembler("session");

    this.domObserver = new DOMObserver(adapter, {
      onUserMessage: (content: string, ts: string) => {
        const finalized = this.streamAssembler.finalizeCurrentStream();
        if (finalized && finalized.role === "assistant") {
          this.callbacks.onCapture("assistant", finalized.content);
        }
        const msg = this.streamAssembler.processDOMComplete("user", content, ts);
        if (msg) {
          this.callbacks.onCapture("user", msg.content);
        }
      },
      onAssistantChunk: (content: string, ts: string) => {
        if (content === this.lastFiredAssistantContent) return;
        this.lastFiredAssistantContent = content;
        this.streamAssembler.processDOMContent("assistant", content, ts);
        this.resetStaleTimeout();
      },
      onStreamingComplete: (finalContent: string, ts: string) => {
        if (!finalContent) return;
        this.lastFiredAssistantContent = finalContent;
        this.clearStaleTimeout();
        const msg = this.streamAssembler.processDOMComplete("assistant", finalContent, ts);
        if (msg) {
          this.callbacks.onCapture("assistant", msg.content);
        }
      },
      onNewConversation: () => {},
      onMessageEdited: () => {},
    });
  }

  start(): void {
    this.domObserver.start();
    this.startTitleWatch();
    console.log(`[LLM Observer] Simple engine started for ${this.adapter.platform}`);
  }

  stop(): void {
    this.domObserver.stop();
    this.clearStaleTimeout();
    if (this.titleCheckInterval) clearInterval(this.titleCheckInterval);
  }

  processNetworkMessage(role: "user" | "assistant", content: string): void {
    if (role === "assistant") {
      if (content === this.lastFiredAssistantContent) return;
      if (content.length < this.lastFiredAssistantContent.length * 0.8) return;
      this.lastFiredAssistantContent = content;
      this.streamAssembler.processDOMContent("assistant", content, new Date().toISOString());
      this.resetStaleTimeout();
    } else {
      const finalized = this.streamAssembler.finalizeCurrentStream();
      if (finalized && finalized.role === "assistant") {
        this.callbacks.onCapture("assistant", finalized.content);
      }
      const msg = this.streamAssembler.processDOMContent("user", content, new Date().toISOString());
      if (msg) {
        this.callbacks.onCapture("user", msg.content);
      }
    }
  }

  finalizeAssistant(): void {
    this.clearStaleTimeout();
    const msg = this.streamAssembler.finalizeCurrentStream();
    if (msg && msg.role === "assistant") {
      this.lastFiredAssistantContent = msg.content;
      this.callbacks.onCapture("assistant", msg.content);
    }
  }

  getStreamAssembler(): StreamAssembler {
    return this.streamAssembler;
  }

  private resetStaleTimeout(): void {
    this.clearStaleTimeout();
    this.staleTimeout = setTimeout(() => {
      const msg = this.streamAssembler.finalizeCurrentStream();
      if (msg && msg.role === "assistant") {
        console.log(`[LLM Observer] Stale timeout: finalizing assistant message`);
        this.lastFiredAssistantContent = msg.content;
        this.callbacks.onCapture("assistant", msg.content);
      }
    }, 5000);
  }

  private clearStaleTimeout(): void {
    if (this.staleTimeout) {
      clearTimeout(this.staleTimeout);
      this.staleTimeout = null;
    }
  }

  private startTitleWatch(): void {
    this.lastTitle = document.title;
    this.titleCheckInterval = setInterval(() => {
      const newTitle = document.title;
      if (newTitle !== this.lastTitle && newTitle.trim()) {
        this.lastTitle = newTitle;
        const clean = this.adapter.getTitleFromPage();
        if (clean && clean !== "Untitled" && clean !== "New chat" && clean !== "ChatGPT") {
          this.callbacks.onTitleChange(clean);
        }
      }
    }, 2000);
  }
}
