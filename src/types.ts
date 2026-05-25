export type Platform = "chatgpt" | "claude" | "gemini" | "generic";

export type MessageRole = "user" | "assistant";

export type CaptureMethod = "network" | "dom";

export interface Message {
  role: MessageRole;
  content: string;
  timestamp: string;
  edited?: boolean;
  deleted?: boolean;
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  platform: Platform;
  title: string;
  url: string;
  model?: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes?: number;
  messageCount: number;
  project?: string;
  tags: string[];
  previousConversationId: string | null;
  nextConversationId: string | null;
  messages: Message[];
  adapterVersion: string;
}

export interface ConversationDraft {
  id: string;
  platform: Platform;
  title: string;
  url: string;
  startedAt: string;
  lastUpdatedAt: string;
  messages: Message[];
  project?: string;
  tags: string[];
}

export interface LLMAdapter {
  platform: Platform;
  name: string;
  urlPattern: RegExp;
  apiEndpointPattern: RegExp;
  conversationIdFromUrl: (url: string) => string | null;
  getTitleFromPage: () => string;
  messageContainer: string;
  userSelector: string;
  assistantSelector: string;
  isNewConversation: (oldUrl: string, newUrl: string) => boolean;
  isStreamingComplete: (node: Element) => boolean;
  detectModel: (pageUrl: string) => string | undefined;
}

export interface CaptureEvent {
  type: "message_chunk" | "message_complete" | "conversation_start" | "conversation_end" | "error";
  platform: Platform;
  conversationId: string;
  role?: MessageRole;
  content?: string;
  timestamp: string;
  captureMethod: CaptureMethod;
  metadata?: Record<string, unknown>;
}

export interface NetworkEventData {
  type: "request" | "response_chunk" | "response_complete";
  url: string;
  method: string;
  requestBody?: string;
  responseBody?: string;
  timestamp: string;
}

export interface Settings {
  autoExportEvery: number;
  idleTimeoutMinutes: number;
  maxMessagesPerFile: number;
  domainBlacklist: string[];
  captureEnabled: boolean;
  debugMode: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  autoExportEvery: 0,
  idleTimeoutMinutes: 10,
  maxMessagesPerFile: 100,
  domainBlacklist: [],
  captureEnabled: true,
  debugMode: false,
};

export interface PopupState {
  isCapturing: boolean;
  currentConversation: Conversation | null;
  recentConversations: Conversation[];
  currentPlatform: Platform | null;
  messageCount: number;
  durationMinutes: number;
}

export interface ChromeMessage {
  action:
    | "startCapture"
    | "stopCapture"
    | "exportConversation"
    | "exportAll"
    | "getState"
    | "updateSettings"
    | "captureEvent"
    | "conversationUpdated"
    | "networkEvent"
    | "getConversations"
    | "deleteConversation"
    | "updateProject"
    | "updateTags"
    | "captureMessage"
    | "newConversation"
    | "endConversation"
    | "updateTitle";
  payload?: unknown;
  tabId?: number;
}
