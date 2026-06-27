export type ContextSource =
  | "browser"
  | "codex"
  | "claude-code"
  | "cursor"
  | "terminal"
  | "human"
  | "other";

export type ContextEventType =
  | "user"
  | "agent"
  | "note"
  | "decision"
  | "task"
  | "problem";

export interface ContextEvent {
  type: ContextEventType;
  content: string;
  createdAt: string;
  fingerprint?: string;
  platform?: string;
  metadata?: Record<string, unknown>;
}

export interface ContextSession {
  id: string;
  title: string;
  source: ContextSource | string;
  startedAt: string;
  endedAt?: string;
  events: ContextEvent[];
  metadata?: {
    cwd?: string;
    gitBranch?: string;
    collection?: "browser" | "terminal";
    platform?: string;
    model?: string;
    url?: string;
    project?: string;
    tags?: string[];
    importedFrom?: string;
    [key: string]: unknown;
  };
}

export interface ContextMemory {
  version: number;
  project?: string;
  summary?: string;
  updatedAt: string;
  sessions: ContextSession[];
}

export interface ContextLink {
  from: string;
  to: string;
  relationship: string;
  createdAt: string;
}

export interface ContextIndexEntry {
  id: string;
  sessionId: string;
  sessionTitle: string;
  source: ContextSource | string;
  type: ContextEventType;
  content: string;
  createdAt: string;
  file?: string;
  platform?: string;
  fingerprint?: string;
  terms: string[];
}

export interface ContextIndex {
  version: number;
  generatedAt: string;
  sessionCount: number;
  eventCount: number;
  sessions: Array<{
    id: string;
    title: string;
    source: ContextSource | string;
    startedAt: string;
    endedAt?: string;
    eventCount: number;
    file?: string;
    platform?: string;
    terms: string[];
  }>;
  events: ContextIndexEntry[];
  links: ContextLink[];
}

export interface ContextRetrievalResult {
  query: string;
  generatedAt: string;
  results: Array<ContextIndexEntry & { score: number }>;
  sessions: ContextIndex["sessions"];
  links: ContextLink[];
}
