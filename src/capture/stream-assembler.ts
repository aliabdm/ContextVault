import type { Message, MessageRole, NetworkEventData } from "../types";

interface PendingMessage {
  id: string;
  role: MessageRole;
  contentParts: string[];
  startedAt: string;
  endedAt?: string;
}

interface NetworkChunk {
  url: string;
  data: string;
  timestamp: string;
}

export class StreamAssembler {
  private conversationId: string;
  private messages: Message[] = [];
  private pendingMessage: PendingMessage | null = null;
  private messageIndex = 0;
  private seenChunks = new Set<string>();
  private messageEndMarkers = ['[DONE]', 'stop', 'finish_reason": "stop"'];
  private domMessageCache = new Map<string, { content: string; timestamp: string }>();

  constructor(conversationId: string) {
    this.conversationId = conversationId;
  }

  processNetworkChunk(chunk: NetworkChunk): Message | null {
    if (chunk.data === '[DONE]' || !chunk.data) {
      if (this.pendingMessage) {
        return this.finalizeMessage();
      }
      return null;
    }

    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(chunk.data);
    } catch {
      parsed = null;
    }

    const content = this.extractContent(parsed, chunk.data);
    if (!content) return null;

    const dedupKey = content.slice(0, 100);
    if (this.seenChunks.has(dedupKey)) return null;
    this.seenChunks.add(dedupKey);

    const role = this.detectRole(chunk.url, parsed);

    if (!this.pendingMessage) {
      this.pendingMessage = {
        id: `${this.conversationId}-${this.messageIndex++}`,
        role,
        contentParts: [content],
        startedAt: chunk.timestamp,
      };
    } else {
      this.pendingMessage.contentParts.push(content);
    }

    if (this.isMessageComplete(parsed)) {
      return this.finalizeMessage();
    }

    return null;
  }

  processDOMContent(role: MessageRole, content: string, timestamp: string): Message | null {
    const cacheKey = `${role}-${content.slice(0, 200)}`;
    const cached = this.domMessageCache.get(cacheKey);
    if (cached && cached.content === content) return null;

    this.domMessageCache.set(cacheKey, { content, timestamp });

    if (this.pendingMessage && this.pendingMessage.role !== role) {
      const finalized = this.finalizeMessage();
      this.startPending(role, content, timestamp);
      return finalized;
    }

    if (!this.pendingMessage) {
      this.startPending(role, content, timestamp);
      return null;
    }

    const lastPartIdx = this.pendingMessage.contentParts.length - 1;
    const lastPart = this.pendingMessage.contentParts[lastPartIdx];
    if (content.startsWith(lastPart) && content.length > lastPart.length) {
      this.pendingMessage.contentParts[lastPartIdx] = content;
    } else if (content !== lastPart) {
      this.pendingMessage.contentParts.push(content);
    }

    return null;
  }

  processDOMComplete(role: MessageRole, content: string, timestamp: string): Message | null {
    if (this.pendingMessage) {
      if (this.pendingMessage.role !== role) {
        this.finalizeMessage();
        this.startPending(role, content, timestamp);
        return this.finalizeMessage();
      }
      const lastPartIdx = this.pendingMessage.contentParts.length - 1;
      const lastPart = this.pendingMessage.contentParts[lastPartIdx];
      if (content.length > lastPart.length || !lastPart.includes(content)) {
        this.pendingMessage.contentParts[lastPartIdx] = content;
      }
      return this.finalizeMessage();
    }

    this.startPending(role, content, timestamp);
    return this.finalizeMessage();
  }

  finalizeCurrentStream(): Message | null {
    if (this.pendingMessage) {
      return this.finalizeMessage();
    }
    return null;
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  reset(): void {
    this.messages = [];
    this.pendingMessage = null;
    this.seenChunks.clear();
    this.domMessageCache.clear();
    this.messageIndex = 0;
  }

  private startPending(role: MessageRole, content: string, timestamp: string): void {
    this.pendingMessage = {
      id: `${this.conversationId}-${this.messageIndex++}`,
      role,
      contentParts: [content],
      startedAt: timestamp,
    };
  }

  private finalizeMessage(): Message | null {
    if (!this.pendingMessage) return null;

    const message: Message = {
      role: this.pendingMessage.role,
      content: this.pendingMessage.contentParts.join(""),
      timestamp: this.pendingMessage.startedAt,
    };

    if (message.content.trim().length === 0) {
      this.pendingMessage = null;
      return null;
    }

    this.pendingMessage.endedAt = new Date().toISOString();
    this.messages.push(message);
    this.pendingMessage = null;

    return message;
  }

  private extractContent(parsed: Record<string, unknown> | null, _raw: string): string {
    if (!parsed) return "";

    const p = parsed as Record<string, unknown>;

    const choices = p.choices as Array<Record<string, unknown>> | undefined;
    if (choices?.[0]) {
      const delta = choices[0].delta as Record<string, unknown> | undefined;
      const message = choices[0].message as Record<string, unknown> | undefined;
      if (typeof delta?.content === "string") return delta.content as string;
      if (typeof message?.content === "string") return message.content as string;
    }

    if (typeof p.content === "string") return p.content as string;

    const delta = p.delta as Record<string, unknown> | undefined;
    if (typeof delta?.text === "string") return delta.text as string;
    if (Array.isArray(delta?.content)) {
      const parts = (delta!.content as Array<{ type: string; text: string }>)
        .filter((c) => c.type === "text")
        .map((c) => c.text);
      return parts.join("");
    }

    const message = p.message as Record<string, unknown> | undefined;
    if (typeof message?.content === "string") return message.content as string;
    if (Array.isArray(message?.content)) {
      const parts = (message!.content as Array<{ type: string; text: string }>)
        .filter((c) => c.type === "text")
        .map((c) => c.text);
      return parts.join("");
    }

    return "";
  }

  private detectRole(_url: string, parsed: Record<string, unknown> | null): MessageRole {
    if (!parsed) return "assistant";

    const p = parsed as Record<string, unknown>;
    const choices = p.choices as Array<Record<string, unknown>> | undefined;
    const message = p.message as Record<string, unknown> | undefined;

    const role =
      (choices?.[0]?.message as Record<string, unknown>)?.role ??
      (choices?.[0]?.delta as Record<string, unknown>)?.role ??
      message?.role;

    if (role === "assistant") return "assistant";
    if (role === "user") return "user";
    return "assistant";
  }

  private isMessageComplete(parsed: Record<string, unknown> | null): boolean {
    if (!parsed) return false;

    const p = parsed as Record<string, unknown>;
    const choices = p.choices as Array<Record<string, unknown>> | undefined;

    if (choices?.[0]?.finish_reason === "stop") return true;
    if (choices?.[0]?.finish_reason === "end_turn") return true;

    const delta = choices?.[0]?.delta as Record<string, unknown> | undefined;
    const message = p.message as Record<string, unknown> | undefined;
    const stopReason = delta?.stop_reason ?? message?.stop_reason;

    if (stopReason && stopReason !== "null" && stopReason !== null) return true;

    return false;
  }
}
