import type { Conversation } from "../types";

function escapeYamlValue(value: string): string {
  if (/[:"{}[\],&#*?|>!%@`]/.test(value) || value.includes("'") || value.includes("\n")) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toISOString();
  } catch {
    return dateStr;
  }
}

function formatTags(tags: string[]): string {
  return `[${tags.map((t) => escapeYamlValue(t)).join(", ")}]`;
}

export function buildMarkdown(conversation: Conversation): string {
  const lines: string[] = [];

  lines.push("---");
  lines.push(`title: ${escapeYamlValue(conversation.title)}`);
  lines.push(`platform: ${conversation.platform}`);

  if (conversation.model) {
    lines.push(`model: ${escapeYamlValue(conversation.model)}`);
  }

  lines.push(`date: ${formatDate(conversation.startedAt)}`);

  if (conversation.durationMinutes != null) {
    lines.push(`duration_minutes: ${conversation.durationMinutes}`);
  }

  lines.push(`message_count: ${conversation.messageCount}`);

  if (conversation.project) {
    lines.push(`project: ${escapeYamlValue(conversation.project)}`);
  }

  if (conversation.tags.length > 0) {
    lines.push(`tags: ${formatTags(conversation.tags)}`);
  }

  lines.push(`conversation_id: ${escapeYamlValue(conversation.id)}`);

  if (conversation.url) {
    lines.push(`url: ${escapeYamlValue(conversation.url)}`);
  }

  lines.push(`previous_conversation: ${conversation.previousConversationId ?? "null"}`);
  lines.push(`next_conversation: ${conversation.nextConversationId ?? "null"}`);
  lines.push("---");
  lines.push("");

  for (const message of conversation.messages) {
    const role = message.role === "user" ? "User" : "Assistant";
    lines.push(`## ${role}`);
    lines.push("");

    if (message.edited) {
      lines.push(`*[Edited]*`);
    }

    if (message.deleted) {
      lines.push(`*[Deleted]*`);
    }

    lines.push(message.content);
    lines.push("");
  }

  return lines.join("\n");
}

export function generateFilename(conversation: Conversation): string {
  const date = new Date(conversation.startedAt);
  const dateStr =
    date.getUTCFullYear().toString() +
    "-" +
    (date.getUTCMonth() + 1).toString().padStart(2, "0") +
    "-" +
    date.getUTCDate().toString().padStart(2, "0");

  const timeStr =
    date.getUTCHours().toString().padStart(2, "0") +
    "-" +
    date.getUTCMinutes().toString().padStart(2, "0");

  const safeTitle = conversation.title
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "") || "untitled";

  return `${conversation.platform}_${dateStr}_${timeStr}_${safeTitle}.md`;
}
