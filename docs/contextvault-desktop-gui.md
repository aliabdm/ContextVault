# ContextVault Desktop: From CLI Wrapper to Full GUI Product

ContextVault started as a local-first way to keep AI project context in Markdown. The npm package already knew how to record sessions, inspect history, retrieve evidence, prepare context, maintain memory, link sessions, and export a vault. The missing piece was a Desktop experience that felt like a product—not a command prompt in a window.

Desktop v1.8.0 closes that gap.

The new app gives History, Decisions, Problems, Tasks, Retrieve, Search, and Prepare their own screens. Time, source, type, query, and result limits are ordinary controls. Results are readable, grouped, copyable, and exportable. Initialization, imports, indexing, memory, timelines, full export, and session linking are also available without typing IDs or flags.

The package is still the engine. Record launches the bundled `contextvault record` process, and Desktop reads the same `.contextvault` Markdown as the CLI. A session created from the terminal appears in an already-open Desktop window because the active vault is watched for changes. The interface shows whether it is watching, when it last changed, how many events it found, and which sources are present.

There is one honest boundary: ContextVault does not secretly capture every Codex, Claude, or Cursor process. An external agent appears automatically only when it writes through ContextVault CLI or compatible files in the watched vault. That keeps recording explicit and local.

Power users still have the raw runner, but it now lives inside collapsed Advanced CLI Mode. Nobody needs to know package syntax for the normal workflow.

The result is the relationship I wanted from the beginning: the CLI and Desktop app are two complete surfaces over one local source of truth, much like Docker CLI and Docker Desktop.

Download: https://context-vault-two.vercel.app/download

Source: https://github.com/aliabdm/ContextVault
