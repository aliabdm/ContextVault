import { getAdapterForUrl } from "./adapters/base";
import { registerDefaultAdapters } from "./adapters";
import { SimpleEngine } from "./capture/engine";
import { generateSessionToken } from "./capture/network-monitor";
import type { ChromeMessage } from "./types";

registerDefaultAdapters();

const SESSION_TOKEN = generateSessionToken();
let engine: SimpleEngine | null = null;
let isCapturing = false;
let lastCapturePlatform: string | null = null;
let urlPollInterval: ReturnType<typeof setInterval> | null = null;
let currentUrl = "";
let networkMonitorInjected = false;

function extractTextFromNetworkPayload(parsed: unknown): string {
  if (!parsed || typeof parsed !== "object") return "";
  const p = parsed as Record<string, unknown>;

  const choices = p.choices as Array<Record<string, unknown>> | undefined;
  if (choices?.[0]) {
    const delta = choices[0].delta as Record<string, unknown> | undefined;
    const message = choices[0].message as Record<string, unknown> | undefined;
    if (typeof delta?.content === "string") return delta.content;
    if (typeof message?.content === "string") return message.content;
  }

  if (typeof p.content === "string") return p.content;
  if (Array.isArray(p.content)) {
    return p.content
      .map((part) => extractTextFromNetworkPayload(part))
      .filter(Boolean)
      .join("");
  }

  const contentObj = p.content as Record<string, unknown> | undefined;
  if (Array.isArray(contentObj?.parts)) {
    return contentObj.parts.filter((part): part is string => typeof part === "string").join("");
  }

  const message = p.message as Record<string, unknown> | undefined;
  if (message) {
    const fromMessage = extractTextFromNetworkPayload(message);
    if (fromMessage) return fromMessage;
  }

  const delta = p.delta as Record<string, unknown> | undefined;
  if (typeof delta?.text === "string") return delta.text;
  if (Array.isArray(delta?.content)) {
    return delta.content
      .map((part) => extractTextFromNetworkPayload(part))
      .filter(Boolean)
      .join("");
  }

  if (typeof p.text === "string") return p.text;
  return "";
}

function extractUserTextFromRequestBody(raw: string): string {
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw);
    const text = extractTextFromNetworkPayload(parsed);
    if (text) return text;

    const p = parsed as Record<string, unknown>;
    const messages = p.messages as Array<Record<string, unknown>> | undefined;
    const userMessages = messages?.filter((msg) => msg.role === "user") ?? [];
    const lastUser = userMessages[userMessages.length - 1];
    if (lastUser) return extractTextFromNetworkPayload(lastUser);

    const prompt = p.prompt ?? p.query ?? p.text;
    return typeof prompt === "string" ? prompt : "";
  } catch {
    const params = new URLSearchParams(raw);
    return params.get("prompt") ?? params.get("q") ?? params.get("query") ?? "";
  }
}

function startCapture(): void {
  if (engine) return;

  const url = window.location.href;
  const adapter = getAdapterForUrl(url);
  if (!adapter) {
    console.log(`[LLM Observer] Site not supported: ${url}`);
    return;
  }

  console.log(`[LLM Observer] Content script loaded at ${url}`);
  lastCapturePlatform = adapter.platform;
  isCapturing = true;
  currentUrl = url;

  injectNetworkMonitor();

  engine = new SimpleEngine(adapter, {
    onCapture: (role, content) => {
      chrome.runtime.sendMessage({
        action: "captureMessage",
        payload: {
          platform: adapter.platform,
          role,
          content,
          title: adapter.getTitleFromPage(),
          model: adapter.detectModel(window.location.href),
        },
      }).catch(() => {});
    },
    onTitleChange: (title) => {
      if (title && title !== "New chat" && title !== "ChatGPT") {
        chrome.runtime.sendMessage({
          action: "updateTitle",
          payload: { platform: adapter.platform, title },
        }).catch(() => {});
      }
    },
  });

  engine.start();
  startUrlPolling(adapter.platform);
}

function stopCapture(): void {
  if (!engine) return;
  engine.stop();
  engine = null;
  isCapturing = false;
  if (urlPollInterval) {
    clearInterval(urlPollInterval);
    urlPollInterval = null;
  }
}

function startUrlPolling(platform: string): void {
  if (urlPollInterval) clearInterval(urlPollInterval);
  urlPollInterval = setInterval(() => {
    const url = window.location.href;
    if (url !== currentUrl) {
      const oldUrl = currentUrl;
      currentUrl = url;

      const adapter = getAdapterForUrl(url);
      if (adapter && adapter.isNewConversation(oldUrl, url)) {
        engine?.finalizeAssistant();
        chrome.runtime.sendMessage({
          action: "endConversation",
          payload: { platform },
        }).catch(() => {});
        chrome.runtime.sendMessage({
          action: "newConversation",
          payload: { platform: adapter.platform },
        }).catch(() => {});
      }

      if (adapter && adapter.platform !== platform) {
        stopCapture();
        setTimeout(() => startCapture(), 300);
      }
    }
  }, 1000);
}

function injectNetworkMonitor(): void {
  if (networkMonitorInjected) return;
  networkMonitorInjected = true;
  try {
    const scriptUrl = chrome.runtime.getURL("network-inject.js");
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.dataset.token = SESSION_TOKEN;
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
  } catch (e) {
    /* CSP or DOM not ready, network capture unavailable */
  }
}

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const data = event.data as Record<string, unknown> & { _source?: string };
  if (data._source !== "llm-observer-network") return;
  if (!engine || !isCapturing) return;

  const method = ((data.method as string) || "POST").toUpperCase();
  if (method !== "POST") return;

  if (data.type === "request") {
    const text = extractUserTextFromRequestBody((data.requestBody as string | undefined) ?? "");
    if (text) engine.processNetworkMessage("user", text);
    return;
  }

  if (data.type === "response_chunk" || data.type === "response_complete") {
    const raw = (data.data as string | undefined) ?? (data.responseBody as string | undefined) ?? "";
    if (!raw || raw === "[DONE]") return;

    try {
      const parsed = JSON.parse(raw);
      const text = extractTextFromNetworkPayload(parsed);
      if (text) engine.processNetworkMessage("assistant", text);
    } catch {
      // not valid JSON or plain text, try as plain content
      if (raw && raw.length > 10) {
        engine.processNetworkMessage("assistant", raw);
      }
    }
  }
});

chrome.runtime.onMessage.addListener((msg: ChromeMessage, _sender, sendResponse) => {
  if (msg.action === "startCapture") {
    startCapture();
    sendResponse({ success: true, isCapturing });
  } else if (msg.action === "stopCapture") {
    stopCapture();
    sendResponse({ success: true });
  } else if (msg.action === "getState") {
    const adapter = getAdapterForUrl(window.location.href);
    sendResponse({
      isCapturing,
      platform: adapter?.platform || lastCapturePlatform,
    });
  } else if (msg.action === "flushCapture") {
    engine?.flush();
    setTimeout(() => sendResponse({ success: true }), 500);
  }
  return true;
});

if (getAdapterForUrl(window.location.href)) {
  startCapture();
}
