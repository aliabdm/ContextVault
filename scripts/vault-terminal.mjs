import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const VAULT_DIR = path.join(ROOT, ".contextvault");
const CONFIG_PATH = path.join(VAULT_DIR, "config.json");
const MEMORY_PATH = path.join(VAULT_DIR, "memory.md");
const SESSIONS_DIR = path.join(VAULT_DIR, "sessions");
const EXPORTS_DIR = path.join(VAULT_DIR, "exports");

const EVENT_TYPES = new Set(["user", "agent", "note", "decision", "task", "problem"]);

function nowIso() {
  return new Date().toISOString();
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function fileDate(date = new Date()) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + "-" + [pad(date.getHours()), pad(date.getMinutes())].join("-");
}

function slug(input) {
  const clean = input
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
  return clean || "untitled";
}

function id() {
  return `vt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeIfMissing(file, content) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, content, "utf8");
}

function ensureVault() {
  ensureDir(VAULT_DIR);
  ensureDir(SESSIONS_DIR);
  ensureDir(EXPORTS_DIR);

  writeIfMissing(
    CONFIG_PATH,
    JSON.stringify(
      {
        version: 1,
        created_at: nowIso(),
        storage: "local",
        sessions_dir: ".contextvault/sessions",
        exports_dir: ".contextvault/exports",
      },
      null,
      2
    ) + "\n"
  );

  writeIfMissing(
    MEMORY_PATH,
    `# ContextVault Project Memory

This file is the durable memory for this repo.

## What this project is

ContextVault is a local-first context recorder. It preserves browser LLM chats and terminal-based human/AI work sessions as portable Markdown.

## What context should be preserved

- Important user intent
- Agent responses
- Decisions
- Tasks
- Problems
- Constraints
- Follow-up context needed by future agents

## How agents should use this memory

Before continuing work, read this file and the latest sessions under \`.contextvault/sessions/\`.

## How to continue previous sessions

Use \`npm run vault:list\` to find sessions, \`npm run vault:show -- latest\` to inspect the latest session, and \`npm run vault:export\` to build a portable context bundle.
`
  );
}

function yamlValue(value) {
  const text = String(value ?? "");
  if (!text) return '""';
  if (/[:#{}\[\],&*?|>!%@`"'\n]/.test(text)) {
    return `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return text;
}

function heading(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function sessionMarkdown(session) {
  const lines = [
    "---",
    `id: ${yamlValue(session.id)}`,
    `title: ${yamlValue(session.title)}`,
    `source: ${yamlValue(session.source)}`,
    `started_at: ${yamlValue(session.started_at)}`,
    `ended_at: ${yamlValue(session.ended_at)}`,
    `event_count: ${session.events.length}`,
    "---",
    "",
  ];

  for (const event of session.events) {
    lines.push(`## ${heading(event.type)}`);
    lines.push("");
    lines.push(event.content);
    lines.push("");
  }

  return lines.join("\n");
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---")) return {};
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return {};

  const meta = {};
  const block = markdown.slice(3, end).trim();
  for (const line of block.split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    }
    meta[key] = value;
  }
  return meta;
}

function getSessionFiles() {
  ensureVault();
  return fs
    .readdirSync(SESSIONS_DIR)
    .filter((name) => name.endsWith(".md"))
    .map((name) => path.join(SESSIONS_DIR, name))
    .sort();
}

function readSessionSummaries() {
  return getSessionFiles()
    .map((file) => {
      const markdown = fs.readFileSync(file, "utf8");
      const meta = parseFrontmatter(markdown);
      return { file, markdown, meta };
    })
    .sort((a, b) => String(a.meta.started_at).localeCompare(String(b.meta.started_at)));
}

function resolveSession(selector) {
  const sessions = readSessionSummaries();
  if (sessions.length === 0) return null;
  if (!selector || selector === "latest") return sessions[sessions.length - 1];
  return sessions.find((session) => session.meta.id === selector || path.basename(session.file).includes(selector)) ?? null;
}

function gitBranch() {
  try {
    return execSync("git branch --show-current", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function commandHelp() {
  return `Commands:
  /source <name>      Set source: codex, claude-code, cursor, terminal, human, other
  /title <title>      Set session title
  /user <message>     Record user message
  /agent <message>    Record agent message
  /note <message>     Record note
  /decision <message> Record decision
  /task <message>     Record task
  /problem <message>  Record problem
  /paste              Start multiline paste mode
  /endpaste           End multiline paste mode
  /end                Save and end session
  /help               Show this help`;
}

async function record() {
  ensureVault();

  const session = {
    id: id(),
    title: "Untitled terminal session",
    source: "terminal",
    started_at: nowIso(),
    ended_at: "",
    cwd: ROOT,
    git_branch: gitBranch(),
    events: [],
  };

  let pasteMode = false;
  const pasteLines = [];

  console.log("Vault Terminal recorder started.");
  console.log(commandHelp());

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "vault> ",
  });

  rl.prompt();

  rl.on("line", (line) => {
    if (pasteMode) {
      if (line === "/endpaste") {
        session.events.push({ type: "note", content: pasteLines.join("\n"), created_at: nowIso() });
        pasteLines.length = 0;
        pasteMode = false;
        console.log("Paste captured.");
      } else {
        pasteLines.push(line);
      }
      rl.prompt();
      return;
    }

    if (line === "/help") {
      console.log(commandHelp());
      rl.prompt();
      return;
    }

    if (line === "/paste") {
      pasteMode = true;
      console.log("Paste mode. Enter /endpaste on its own line to finish.");
      rl.prompt();
      return;
    }

    if (line === "/end") {
      rl.close();
      return;
    }

    const match = line.match(/^\/([a-z-]+)(?:\s+([\s\S]*))?$/);
    if (!match) {
      session.events.push({ type: "note", content: line, created_at: nowIso() });
      rl.prompt();
      return;
    }

    const [, command, rest = ""] = match;
    const value = rest.trim();

    if (command === "source") {
      session.source = value || "terminal";
      rl.prompt();
      return;
    }

    if (command === "title") {
      session.title = value || session.title;
      rl.prompt();
      return;
    }

    if (EVENT_TYPES.has(command)) {
      session.events.push({ type: command, content: value, created_at: nowIso() });
      rl.prompt();
      return;
    }

    console.log(`Unknown command: /${command}`);
    rl.prompt();
  });

  await new Promise((resolve) => rl.on("close", resolve));

  if (pasteMode && pasteLines.length > 0) {
    session.events.push({ type: "note", content: pasteLines.join("\n"), created_at: nowIso() });
  }

  session.ended_at = nowIso();

  const filename = `${fileDate(new Date(session.started_at))}-${slug(session.source)}-${slug(session.title)}.md`;
  const file = path.join(SESSIONS_DIR, filename);
  fs.writeFileSync(file, sessionMarkdown(session), "utf8");
  console.log(`Saved ${path.relative(ROOT, file)}`);
}

function init() {
  ensureVault();
  console.log("Initialized .contextvault/");
}

function list() {
  const sessions = readSessionSummaries();
  if (sessions.length === 0) {
    console.log("No sessions yet. Run npm run vault:record");
    return;
  }

  for (const session of sessions) {
    const m = session.meta;
    console.log(`${m.id} | ${m.started_at} | ${m.source} | ${m.title} | ${m.event_count} events`);
  }
}

function show(selector) {
  const session = resolveSession(selector);
  if (!session) {
    console.error(`Session not found: ${selector || "latest"}`);
    process.exitCode = 1;
    return;
  }
  console.log(session.markdown);
}

function extractSections(markdown, sectionNames) {
  const wanted = new Set(sectionNames.map((name) => name.toLowerCase()));
  const lines = markdown.split(/\r?\n/);
  const matches = [];
  let current = null;
  let buffer = [];

  function flush() {
    if (current && wanted.has(current.toLowerCase())) {
      const content = buffer.join("\n").trim();
      if (content) matches.push({ type: current, content });
    }
  }

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      flush();
      current = headingMatch[1].trim();
      buffer = [];
    } else if (current) {
      buffer.push(line);
    }
  }
  flush();
  return matches;
}

function exportContext() {
  ensureVault();
  const sessions = readSessionSummaries();
  const latest = sessions.slice(-10);
  const lines = [
    "# ContextVault Terminal Export",
    "",
    `Generated at: ${nowIso()}`,
    "",
    "## Project Memory",
    "",
    fs.existsSync(MEMORY_PATH) ? fs.readFileSync(MEMORY_PATH, "utf8").trim() : "",
    "",
    "## Latest Sessions",
    "",
  ];

  for (const session of latest) {
    lines.push(`### ${session.meta.title || "Untitled"}`);
    lines.push("");
    lines.push(`- id: ${session.meta.id}`);
    lines.push(`- source: ${session.meta.source}`);
    lines.push(`- started_at: ${session.meta.started_at}`);
    lines.push("");
    lines.push(session.markdown.trim());
    lines.push("");
  }

  const extracted = [];
  for (const session of sessions) {
    for (const event of extractSections(session.markdown, ["Decision", "Task", "Problem"])) {
      extracted.push({ session, ...event });
    }
  }

  lines.push("## Decisions, Tasks, And Problems");
  lines.push("");
  for (const item of extracted) {
    lines.push(`### ${item.type} - ${item.session.meta.title || item.session.meta.id}`);
    lines.push("");
    lines.push(item.content);
    lines.push("");
  }

  const out = path.join(EXPORTS_DIR, "contextvault-terminal-export.md");
  fs.writeFileSync(out, lines.join("\n"), "utf8");
  console.log(`Exported ${path.relative(ROOT, out)}`);
}

function search(queryParts) {
  const query = queryParts.join(" ").trim().toLowerCase();
  if (!query) {
    console.error("Usage: npm run vault:search -- <keyword>");
    process.exitCode = 1;
    return;
  }

  const sessions = readSessionSummaries();
  let found = 0;
  for (const session of sessions) {
    const lines = session.markdown.split(/\r?\n/);
    const matches = lines
      .map((line, index) => ({ line, index: index + 1 }))
      .filter((entry) => entry.line.toLowerCase().includes(query));

    if (matches.length === 0) continue;
    found += 1;
    console.log(`\n${session.meta.id} | ${session.meta.started_at} | ${session.meta.source} | ${session.meta.title}`);
    for (const match of matches.slice(0, 8)) {
      console.log(`  ${match.index}: ${match.line}`);
    }
  }

  if (found === 0) console.log("No matches.");
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case "init":
      init();
      break;
    case "record":
      await record();
      break;
    case "list":
      list();
      break;
    case "show":
      show(args[0] || "latest");
      break;
    case "export":
      exportContext();
      break;
    case "search":
      search(args);
      break;
    default:
      console.log(`Usage: node scripts/vault-terminal.mjs <init|record|list|show|export|search>

Examples:
  npm run vault:init
  npm run vault:record
  npm run vault:list
  npm run vault:show -- latest
  npm run vault:search -- auth`);
      if (command) process.exitCode = 1;
  }
}

main();
