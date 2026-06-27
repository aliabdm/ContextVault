#!/bin/sh
set -eu

ROOT=/tmp/contextvault-smoke
CLI=/app/scripts/vault-terminal.mjs

rm -rf "$ROOT"
mkdir -p "$ROOT"
cd "$ROOT"

node "$CLI" init

cat > chatgpt-auth.md <<'EOF'
---
title: Diagnose auth redirect
platform: chatgpt
model: ChatGPT
date: 2026-06-01T09:00:00.000Z
message_count: 2
conversation_id: smoke-browser-auth
url: "https://chatgpt.com/c/smoke-browser-auth"
---

## User

Why does the login redirect loop?

## Assistant

Inspect the authentication middleware order.
EOF

node "$CLI" import chatgpt-auth.md
node "$CLI" import chatgpt-auth.md

printf '%s\n' \
  '/source codex' \
  '/title Fix auth middleware' \
  '/user Login redirect is broken' \
  '/agent Found middleware order issue' \
  '/decision Keep auth checks in middleware' \
  '/task Add regression test' \
  '/problem Redirect loop on callback' \
  '/end' | node "$CLI" record

sleep 1

printf '%s\n' \
  '/source claude-code' \
  '/title Verify auth fix' \
  '/note Regression test passes' \
  '/decision Keep the middleware order' \
  '/end' | node "$CLI" record

node "$CLI" index
node "$CLI" retrieve auth middleware
node "$CLI" prepare auth middleware
node "$CLI" memory
node "$CLI" timeline
node "$CLI" tasks
node "$CLI" decisions
node "$CLI" problems
node "$CLI" history auth --since 30d
node "$CLI" decisions auth --source codex --since 30d
node "$CLI" retrieve auth --type decision --source codex --since 30d

first=$(node "$CLI" list | sed -n '1s/ |.*//p')
second=$(node "$CLI" list | sed -n '2s/ |.*//p')
node "$CLI" link "$first" "$second" 'verified by'

test -s .contextvault/index/context-index.json
test -s .contextvault/exports/prepared-context.md
test -s .contextvault/exports/context-timeline.md
test -s .contextvault/links.json
grep -q 'Keep auth checks in middleware' .contextvault/exports/prepared-context.md
grep -q 'smoke-browser-auth' .contextvault/index/context-index.json
grep -q 'Inspect the authentication middleware order' .contextvault/exports/prepared-context.md
grep -q 'verified by' .contextvault/links.json

printf 'SMOKE_OK sessions=%s,%s\n' "$first" "$second"
