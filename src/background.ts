import { getAdapterForUrl } from "./adapters/base";
import { registerDefaultAdapters } from "./adapters";
import type { ChromeMessage, Conversation, Message, Platform, Settings } from "./types";
import { saveConversation, getConversation, getAllConversations, deleteConversation, getSettings, saveSettings } from "./storage/index";
import { buildMarkdown, generateFilename } from "./storage/markdown";
import { downloadAllAsZip } from "./storage/export";

registerDefaultAdapters();

interface TabSession {
  tabId: number;
  conversationId: string;
  platform: string;
  lastActivity: number;
  previousConversationId: string | null;
}

const sessions = new Map<number, TabSession>();

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `conv-${ts}-${rand}`;
}

async function newConversationAsync(tabId: number, platform: string, url: string): Promise<TabSession> {
  const oldSession = sessions.get(tabId);
  let previousConversationId: string | null = null;
  if (oldSession) {
    previousConversationId = oldSession.conversationId;
    const oldConv = await getConversation(oldSession.conversationId);
    if (oldConv && !oldConv.endedAt) {
      oldConv.endedAt = new Date().toISOString();
      if (oldConv.startedAt) {
        const start = new Date(oldConv.startedAt).getTime();
        const end = new Date(oldConv.endedAt).getTime();
        oldConv.durationMinutes = Math.round((end - start) / 60000);
      }
      await saveConversation(oldConv);
    }
  }

  const conversationId = generateId();
  if (previousConversationId) {
    const previous = await getConversation(previousConversationId);
    if (previous) {
      previous.nextConversationId = conversationId;
      await saveConversation(previous);
    }
  }

  const session: TabSession = {
    tabId,
    conversationId,
    platform,
    lastActivity: Date.now(),
    previousConversationId,
  };
  sessions.set(tabId, session);
  return session;
}

function updateLastAssistantMessage(conv: Conversation, content: string, timestamp: string): boolean {
  if (conv.messages.length === 0) return false;
  const last = conv.messages[conv.messages.length - 1];
  if (last.role !== "assistant") return false;
  const now = new Date(timestamp).getTime();
  const lastTime = new Date(last.timestamp).getTime();
  if (now - lastTime > 120000) return false;
  const sameGrowingMessage = content.startsWith(last.content) || last.content.startsWith(content);
  if (!sameGrowingMessage) return false;
  if (content.length > last.content.length || content === last.content) {
    last.content = content;
    last.timestamp = timestamp;
    return true;
  }
  return false;
}

function isDuplicateUserMessage(conv: Conversation, content: string, timestamp: string): boolean {
  const last = conv.messages[conv.messages.length - 1];
  if (!last || last.role !== "user") return false;
  const now = new Date(timestamp).getTime();
  const lastTime = new Date(last.timestamp).getTime();
  return last.content === content && now - lastTime < 120000;
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("[LLM Observer] Extension installed");
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.url) return;
  if (changeInfo.status === "complete") {
    const adapter = getAdapterForUrl(tab.url);
    if (adapter) {
      console.log(`[LLM Observer] Detected ${adapter.platform} on tab ${tabId}`);
      chrome.tabs.sendMessage(tabId, { action: "startCapture" }).catch(() => {});
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  sessions.delete(tabId);
});

async function captureMessage(
  tabId: number,
  platform: string,
  url: string,
  role: "user" | "assistant",
  content: string,
  title?: string,
  model?: string
): Promise<void> {
  let session = sessions.get(tabId);

  if (!session) {
    session = await newConversationAsync(tabId, platform, url);
    console.log(`[BG] New session: ${session.conversationId.slice(0,14)}... for tab ${tabId}`);
  }

  session.lastActivity = Date.now();

  let conv = await getConversation(session.conversationId);

  const message: Message = {
    role,
    content,
    timestamp: new Date().toISOString(),
  };

  if (conv) {
    if (role === "user") {
      if (!isDuplicateUserMessage(conv, content, message.timestamp)) {
        conv.messages.push(message);
        conv.messageCount = conv.messages.length;
      }
    } else if (role === "assistant") {
      const updated = updateLastAssistantMessage(conv, content, message.timestamp);
      if (!updated) {
        conv.messages.push(message);
        conv.messageCount = conv.messages.length;
      }
    }
    if (title && title !== conv.title && title !== "New chat" && title !== "ChatGPT") {
      conv.title = title;
      console.log(`[BG] Title: "${conv.title}"`);
    }
    if (model) conv.model = model;
  } else {
    conv = {
      id: session.conversationId,
      platform: platform as Platform,
      title: title || "New chat",
      url,
      model,
      startedAt: new Date().toISOString(),
      messageCount: 1,
      tags: [],
      previousConversationId: session.previousConversationId,
      nextConversationId: null,
      messages: [message],
      adapterVersion: "1.3.0",
    };
  }

  await saveConversation(conv);
}

async function getActiveOrLatestConversation(tabId?: number): Promise<Conversation | undefined> {
  if (tabId) {
    const session = sessions.get(tabId);
    if (session) return getConversation(session.conversationId);
  }

  const convs = await getAllConversations();
  return convs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];
}

async function updateConversationMetadata(
  tabId: number | undefined,
  metadata: { project?: string; tags?: string[] }
): Promise<Conversation | undefined> {
  const conv = await getActiveOrLatestConversation(tabId);
  if (!conv) return undefined;

  if ("project" in metadata) {
    const project = metadata.project?.trim();
    if (project) conv.project = project;
    else delete conv.project;
  }

  if (metadata.tags) {
    conv.tags = [...new Set(metadata.tags.map((tag) => tag.trim()).filter(Boolean))];
  }

  await saveConversation(conv);
  return conv;
}

async function updateTitle(
  tabId: number,
  platform: string,
  title: string
): Promise<void> {
  const session = sessions.get(tabId);
  if (!session) return;

  let conv = await getConversation(session.conversationId);
  if (conv && title !== conv.title) {
    conv.title = title;
    await saveConversation(conv);
  }
}

async function endConversation(tabId: number): Promise<void> {
  const session = sessions.get(tabId);
  if (!session) return;
  const conv = await getConversation(session.conversationId);
  if (conv) {
    conv.endedAt = new Date().toISOString();
    if (conv.startedAt) {
      const start = new Date(conv.startedAt).getTime();
      const end = new Date(conv.endedAt).getTime();
      conv.durationMinutes = Math.round((end - start) / 60000);
    }
    await saveConversation(conv);
  }
}

chrome.runtime.onMessage.addListener((message: ChromeMessage, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true;
});

async function handleMessage(
  message: ChromeMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (r: unknown) => void
): Promise<void> {
  try {
    const tabId = sender.tab?.id;

    switch (message.action) {
      case "getState":
      case "getConversations": {
        const convs = await getAllConversations();
        sendResponse({ conversations: convs });
        break;
      }

      case "exportConversation": {
        const p = message.payload as { conversationId: string };
        const conv = await getConversation(p.conversationId);
        if (conv) {
          const md = buildMarkdown(conv);
          const filename = generateFilename(conv);
          const base64 = btoa(unescape(encodeURIComponent(md)));
          const dataUrl = `data:text/markdown;charset=utf-8;base64,${base64}`;
          await chrome.downloads.download({ url: dataUrl, filename: `llm-history/${filename}`, saveAs: false });
          sendResponse({ success: true });
        } else {
          sendResponse({ error: "not found" });
        }
        break;
      }

      case "exportAll": {
        const convs = await getAllConversations();
        await downloadAllAsZip(convs);
        sendResponse({ success: true, count: convs.length });
        break;
      }

      case "deleteConversation": {
        const p = message.payload as { conversationId: string };
        await deleteConversation(p.conversationId);
        sendResponse({ success: true });
        break;
      }

      case "updateSettings": {
        const p = message.payload as Partial<Settings> & { project?: string; tags?: string[] };
        const existing = (await getSettings()) ?? {
          autoExportEvery: 0,
          idleTimeoutMinutes: 10,
          maxMessagesPerFile: 100,
          domainBlacklist: [],
          captureEnabled: true,
          debugMode: false,
        };
        const { project, tags, ...settingsPatch } = p;
        await saveSettings({ ...existing, ...settingsPatch });
        if (project !== undefined || tags !== undefined) {
          await updateConversationMetadata(tabId, { project, tags });
        }
        sendResponse({ success: true });
        break;
      }

      case "updateProject": {
        const p = message.payload as { project: string };
        const conv = await updateConversationMetadata(tabId, { project: p.project });
        sendResponse({ success: Boolean(conv), conversation: conv });
        break;
      }

      case "updateTags": {
        const p = message.payload as { tags: string[] };
        const conv = await updateConversationMetadata(tabId, { tags: p.tags });
        sendResponse({ success: Boolean(conv), conversation: conv });
        break;
      }

      case "captureMessage": {
        if (!tabId) { sendResponse({ error: "no tab" }); return; }
        const p = message.payload as {
          platform: string;
          role: "user" | "assistant";
          content: string;
          title?: string;
          model?: string;
        };
        if (!p.content) { sendResponse({ success: true }); break; }
        await captureMessage(tabId, p.platform, sender.tab?.url ?? "", p.role, p.content, p.title, p.model);
        sendResponse({ success: true });
        break;
      }

      case "updateTitle": {
        if (!tabId) { sendResponse({ error: "no tab" }); return; }
        const p = message.payload as { platform: string; title: string };
        await updateTitle(tabId, p.platform, p.title);
        sendResponse({ success: true });
        break;
      }

      case "newConversation": {
        if (!tabId) { sendResponse({ error: "no tab" }); return; }
        const p = message.payload as { platform: string };
        await endConversation(tabId);
        await newConversationAsync(tabId, p.platform, sender.tab?.url ?? "");
        sendResponse({ success: true });
        break;
      }

      case "endConversation": {
        if (!tabId) { sendResponse({ error: "no tab" }); return; }
        await endConversation(tabId);
        sessions.delete(tabId);
        sendResponse({ success: true });
        break;
      }

      default:
        sendResponse({ error: "unknown action" });
    }
  } catch (e) {
    console.error("[BG] Error:", e);
    sendResponse({ error: String(e) });
  }
}
