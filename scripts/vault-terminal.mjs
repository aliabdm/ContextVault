#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { execSync } from "node:child_process";
import {
  buildContextIndex,
  buildTimeline,
  ensureEngineStorage,
  importBrowserExports,
  linkSessions,
  listContextEvents,
  prepareContext,
  renderHistory,
  renderRetrieval,
  renderEventList,
  retrieveContext,
  updateProjectMemory,
} from "./context-engine.mjs";

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
  ensureEngineStorage(ROOT);

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

ContextVault is a local-first context engine. It preserves browser LLM chats and terminal-based human/AI work sessions as portable Markdown, then indexes and retrieves that context locally.

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

Use \`contextvault list\` to find sessions, \`contextvault show latest\` to inspect the latest session, and \`contextvault prepare "topic"\` to build a focused context package.
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

function createEvent(type, content) {
  return { type, content, createdAt: nowIso() };
}

function normalizeEvent(event) {
  return {
    ...event,
    createdAt: event.createdAt ?? event.created_at ?? nowIso(),
  };
}

function sessionMarkdown(session) {
  const lines = [
    "---",
    `id: ${yamlValue(session.id)}`,
    `title: ${yamlValue(session.title)}`,
    `source: ${yamlValue(session.source)}`,
    `started_at: ${yamlValue(session.started_at)}`,
    `ended_at: ${yamlValue(session.ended_at)}`,
    `cwd: ${yamlValue(session.cwd)}`,
    `git_branch: ${yamlValue(session.git_branch)}`,
    `event_count: ${session.events.length}`,
    "---",
    "",
  ];

  for (const event of session.events.map(normalizeEvent)) {
    lines.push(`## ${heading(event.type)}`);
    lines.push("");
    lines.push(`<!-- context-event: ${JSON.stringify({ createdAt: event.createdAt, metadata: event.metadata })} -->`);
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
        session.events.push(createEvent("note", pasteLines.join("\n")));
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
      session.events.push(createEvent("note", line));
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
      session.events.push(createEvent(command, value));
      rl.prompt();
      return;
    }

    console.log(`Unknown command: /${command}`);
    rl.prompt();
  });

  await new Promise((resolve) => rl.on("close", resolve));

  if (pasteMode && pasteLines.length > 0) {
    session.events.push(createEvent("note", pasteLines.join("\n")));
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

function indexContext() {
  ensureVault();
  const index = buildContextIndex(ROOT);
  console.log(`Indexed ${index.sessionCount} sessions and ${index.eventCount} events.`);
  console.log(`Saved ${path.relative(ROOT, path.join(VAULT_DIR, "index", "context-index.json"))}`);
}

function parseFilterArgs(args) {
  const filters = { types: [], sources: [] };
  const query = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const value = args[index + 1];
    if ((arg === "--type" || arg === "--types") && value) {
      filters.types.push(...value.split(",").map((item) => item.trim()).filter(Boolean));
      index += 1;
    } else if ((arg === "--source" || arg === "--sources") && value) {
      filters.sources.push(...value.split(",").map((item) => item.trim()).filter(Boolean));
      index += 1;
    } else if (arg === "--since" && value) {
      filters.since = value;
      index += 1;
    } else if (arg === "--limit" && value) {
      filters.limit = Number.parseInt(value, 10);
      index += 1;
    } else {
      query.push(arg);
    }
  }
  return { query: query.join(" ").trim(), filters };
}

async function importContext(args) {
  const inputPath = args.join(" ").trim();
  if (!inputPath) {
    console.error("Usage: contextvault import <export.md|export.zip|directory>");
    process.exitCode = 1;
    return;
  }
  try {
    const result = await importBrowserExports(ROOT, inputPath);
    console.log(`Browser import: ${result.imported} imported, ${result.updated} updated, ${result.skipped} unchanged.`);
    for (const error of result.errors) console.warn(`Skipped ${error.file}: ${error.error}`);
    console.log(`Unified index now includes ${buildContextIndex(ROOT).sessionCount} sessions.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

function focusedEvents(type, args = []) {
  ensureVault();
  const { query, filters } = parseFilterArgs(args);
  console.log(renderEventList(type, listContextEvents(ROOT, type, { ...filters, query })));
}

function history(args) {
  ensureVault();
  const { query, filters } = parseFilterArgs(args);
  console.log(renderHistory(listContextEvents(ROOT, undefined, { ...filters, query }), { ...filters, query }));
}

function retrieve(queryParts) {
  const { query, filters } = parseFilterArgs(queryParts);
  if (!query) {
    console.error('Usage: npm run vault:retrieve -- "query"');
    process.exitCode = 1;
    return;
  }
  try {
    const result = retrieveContext(ROOT, query, filters);
    console.log(renderRetrieval(result));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

function prepare(queryParts) {
  const { query, filters } = parseFilterArgs(queryParts);
  if (!query) {
    console.error('Usage: npm run vault:prepare -- "query"');
    process.exitCode = 1;
    return;
  }
  try {
    const result = prepareContext(ROOT, query, filters);
    console.log(`Prepared ${path.relative(ROOT, result.outputPath)}`);
    console.log(`Included ${result.retrieval.results.length} relevant events from ${result.retrieval.sessions.length} sessions.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

function memory() {
  const result = updateProjectMemory(ROOT);
  console.log(`Updated ${path.relative(ROOT, result.memoryPath)} with ${result.eventCount} decisions, tasks, and problems.`);
}

function link(args) {
  const [from, to, ...relationshipParts] = args;
  if (!from || !to) {
    console.error('Usage: npm run vault:link -- <from-session-id> <to-session-id> "relationship"');
    process.exitCode = 1;
    return;
  }
  try {
    const result = linkSessions(ROOT, from, to, relationshipParts.join(" ") || "related");
    console.log(`Linked ${result.from} -> ${result.to}: ${result.relationship}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

function timeline() {
  const result = buildTimeline(ROOT);
  console.log(`Generated ${path.relative(ROOT, result.outputPath)} with ${result.eventCount} events.`);
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
    case "index":
      indexContext();
      break;
    case "import":
      await importContext(args);
      break;
    case "retrieve":
      retrieve(args);
      break;
    case "prepare":
      prepare(args);
      break;
    case "memory":
      memory();
      break;
    case "link":
      link(args);
      break;
    case "timeline":
      timeline();
      break;
    case "tasks":
      focusedEvents("task", args);
      break;
    case "decisions":
      focusedEvents("decision", args);
      break;
    case "problems":
      focusedEvents("problem", args);
      break;
    case "history":
      history(args);
      break;
    default:
      console.log(`Usage: contextvault <init|record|list|show|export|search|import|index|retrieve|prepare|memory|link|timeline|history|tasks|decisions|problems>

Examples:
  contextvault init
  contextvault record
  contextvault import ./chatgpt-export.md
  contextvault import ./contextvault-export.zip
  contextvault index
  contextvault retrieve "auth middleware"
  contextvault retrieve "auth" --type decision --source codex --since 14d
  contextvault prepare "auth middleware"
  contextvault history --since 14d
  contextvault tasks --since 2w
  contextvault decisions auth --source codex
  contextvault problems redis --since 30d
  contextvault memory
  contextvault link <from-id> <to-id> "fixed by"
  contextvault timeline

The existing npm run vault:* commands remain supported.`);
      if (command) process.exitCode = 1;
  }
}

main();
