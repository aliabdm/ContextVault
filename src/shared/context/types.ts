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
