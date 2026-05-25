import type { Conversation } from "../types";
import { buildMarkdown, generateFilename } from "./markdown";
import JSZip from "jszip";

async function blobToDataUrl(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunks: string[] = [];
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    chunks.push(String.fromCharCode(...chunk));
  }
  const base64 = btoa(chunks.join(""));
  return `data:${blob.type};base64,${base64}`;
}

function markdownToDataUrl(md: string): string {
  const base64 = btoa(unescape(encodeURIComponent(md)));
  return `data:text/markdown;charset=utf-8;base64,${base64}`;
}

export async function downloadMarkdownFile(conversation: Conversation, markdown?: string): Promise<void> {
  const md = markdown ?? buildMarkdown(conversation);
  const filename = generateFilename(conversation);
  const dataUrl = markdownToDataUrl(md);

  await chrome.downloads.download({
    url: dataUrl,
    filename: `llm-history/${filename}`,
    saveAs: false,
  });
}

export async function downloadAllAsZip(conversations: Conversation[]): Promise<void> {
  const zip = new JSZip();

  for (const conv of conversations) {
    const md = buildMarkdown(conv);
    const filename = generateFilename(conv);
    zip.file(filename, md);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const dataUrl = await blobToDataUrl(blob);

  const dateStr = new Date().toISOString().slice(0, 10);
  const zipFilename = `llm-history/export-${dateStr}.zip`;

  await chrome.downloads.download({
    url: dataUrl,
    filename: zipFilename,
    saveAs: true,
  });
}

export async function copyConversationToClipboard(conversation: Conversation): Promise<void> {
  const md = buildMarkdown(conversation);
  await navigator.clipboard.writeText(md);
}
