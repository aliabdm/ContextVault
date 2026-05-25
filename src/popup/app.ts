import type { Conversation, Settings } from "../types";
import { DEFAULT_SETTINGS } from "../types";

const el = (id: string): HTMLElement => document.getElementById(id)!;

let settings: Settings = { ...DEFAULT_SETTINGS };
let conversations: Conversation[] = [];
let currentTags: string[] = [];
let currentConversationId: string | null = null;

function showToast(msg: string): void {
  const t = el("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}

async function loadState(): Promise<void> {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      const response = await chrome.tabs.sendMessage(tabs[0].id, { action: "getState" });
      if (response) {
        el("status-dot").className = response.isCapturing ? "status-dot active" : "status-dot inactive";
        el("status-label").textContent = response.isCapturing ? `Recording: ${response.platform ?? "chatgpt"}` : "Inactive";
        if (response.platform) {
          el("conv-platform").textContent = response.platform;
        }
      }
    }
  } catch {
    el("status-dot").className = "status-dot inactive";
    el("status-label").textContent = "No active tab";
  }

  const convResp = await chrome.runtime.sendMessage({ action: "getConversations" });
  if (convResp?.conversations) {
    conversations = (convResp.conversations as Conversation[]).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );

    if (conversations.length > 0) {
      const latest = conversations[0];
      currentConversationId = latest.id;
      el("conv-title").textContent = latest.title || "Untitled";
      el("conv-msg-count").textContent = String(latest.messageCount ?? latest.messages.length);
      el("conv-duration").textContent = `${latest.durationMinutes ?? 0}m`;
      if (latest.project) {
        (el("project-select") as HTMLSelectElement).value = latest.project;
      }
      currentTags = latest.tags ?? [];
      renderTags();
    }
    renderRecent();
  }

  loadProjects();
}

async function loadProjects(): Promise<void> {
  const select = el("project-select") as HTMLSelectElement;
  try {
    const resp = await chrome.runtime.sendMessage({ action: "getConversations" });
    if (resp?.conversations) {
      const projects = new Set(
        (resp.conversations as Conversation[])
          .filter((c) => c.project)
          .map((c) => c.project!)
      );
      select.innerHTML = '<option value="">-- No project --</option>';
      projects.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p;
        opt.textContent = p;
        select.appendChild(opt);
      });
    }
  } catch {
    // ignore
  }
}

function renderRecent(): void {
  const container = el("recent-list");
  if (conversations.length === 0) {
    container.innerHTML = '<div class="empty-state">No conversations yet.</div>';
    return;
  }

  container.innerHTML = conversations
    .slice(0, 20)
    .map(
      (c) => `
    <div class="recent-item" data-id="${c.id}">
      <div class="info">
        <div class="title">${esc(c.title || "Untitled")}</div>
        <div class="meta">
          ${formatDateShort(c.startedAt)} — ${c.messageCount}m
          <span class="platform-badge">${c.platform}</span>
          ${c.project ? `<span class="platform-badge" style="background:#312e81;">${esc(c.project)}</span>` : ""}
        </div>
      </div>
      <button class="btn btn-sm btn-primary export-one-btn" data-id="${c.id}">.md</button>
    </div>`
    )
    .join("");

  container.querySelectorAll(".export-one-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = (btn as HTMLElement).dataset.id;
      if (id) exportOne(id);
    });
  });

  container.querySelectorAll(".recent-item").forEach((item) => {
    item.addEventListener("click", () => {
      const id = (item as HTMLElement).dataset.id;
      if (id) exportOne(id);
    });
  });
}

function renderTags(): void {
  const container = el("tag-container");
  const input = el("tag-input");
  container.innerHTML = "";

  currentTags.forEach((tag) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.innerHTML = `${esc(tag)} <span class="tag-remove" data-tag="${esc(tag)}">&times;</span>`;
    span.querySelector(".tag-remove")?.addEventListener("click", () => {
      currentTags = currentTags.filter((t) => t !== tag);
      renderTags();
      saveTags();
    });
    container.appendChild(span);
  });

  container.appendChild(input);
}

function esc(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  } catch {
    return iso.slice(0, 10);
  }
}

async function exportOne(id: string): Promise<void> {
  try {
    const resp = await chrome.runtime.sendMessage({ action: "exportConversation", payload: { conversationId: id } });
    if (resp?.success) {
      showToast("Exported!");
    }
  } catch {
    showToast("Export failed");
  }
}

async function saveTags(): Promise<void> {
  try {
    const resp = await chrome.runtime.sendMessage({ action: "updateTags", payload: { tags: currentTags } });
    if (resp?.conversation) {
      const updated = resp.conversation as Conversation;
      const idx = conversations.findIndex((c) => c.id === updated.id);
      if (idx >= 0) conversations[idx] = updated;
    }
  } catch {
    // ignore
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadState();
  setInterval(() => loadState(), 2000);

  el("tag-input").addEventListener("keydown", (e) => {
    const input = e.target as HTMLInputElement;
    if ((e.key === "Enter" || e.key === ",") && input.value.trim()) {
      e.preventDefault();
      const tag = input.value.trim().replace(/,/g, "");
      if (tag && !currentTags.includes(tag)) {
        currentTags.push(tag);
        renderTags();
        saveTags();
      }
      input.value = "";
    }
  });

  el("project-select").addEventListener("change", async () => {
    const val = (el("project-select") as HTMLSelectElement).value;
    try {
      const resp = await chrome.runtime.sendMessage({ action: "updateProject", payload: { project: val } });
      if (resp?.success) showToast("Project set");
    } catch {
      // ignore
    }
  });

  el("btn-pause").addEventListener("click", async () => {
    const label = el("btn-pause");
    const isPaused = label.textContent === "Pause";

    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.id) {
        if (isPaused) {
          await chrome.tabs.sendMessage(tabs[0].id, { action: "stopCapture" });
          el("status-dot").className = "status-dot inactive";
          el("status-label").textContent = "Paused";
          label.textContent = "Resume";
        } else {
          await chrome.tabs.sendMessage(tabs[0].id, { action: "startCapture" });
          el("status-dot").className = "status-dot active";
          el("status-label").textContent = "Recording";
          label.textContent = "Pause";
        }
      }
    } catch {
      showToast("No active tab");
    }
  });

  el("btn-export-one").addEventListener("click", async () => {
    if (currentConversationId) {
      await exportOne(currentConversationId);
    } else {
      showToast("No active conversation");
    }
  });

  el("btn-export-all").addEventListener("click", async () => {
    try {
      const resp = await chrome.runtime.sendMessage({ action: "exportAll" });
      if (resp?.success) {
        showToast(`Exported ${resp.count} conversations`);
      }
    } catch {
      showToast("Export failed");
    }
  });

  el("btn-settings-toggle").addEventListener("click", () => {
    el("settings-panel").classList.toggle("hidden");
  });

  el("btn-save-settings").addEventListener("click", async () => {
    const newSettings: Partial<Settings> = {
      autoExportEvery: parseInt((el("setting-auto-export") as HTMLInputElement).value) || 0,
      idleTimeoutMinutes: parseInt((el("setting-idle") as HTMLInputElement).value) || 10,
      maxMessagesPerFile: parseInt((el("setting-max-msg") as HTMLInputElement).value) || 100,
      captureEnabled: (el("setting-capture") as HTMLInputElement).checked,
    };

    try {
      await chrome.runtime.sendMessage({
        action: "updateSettings",
        payload: newSettings,
      });

      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.id) {
        await chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateSettings",
          payload: newSettings,
        });
      }

      settings = { ...settings, ...newSettings };
      showToast("Settings saved");
    } catch {
      showToast("Save failed");
    }
  });
});
