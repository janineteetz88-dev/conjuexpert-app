#!/bin/bash
# SessionStart hook for Claude Code on the web.
# Installs the npm dependencies (notably @babel/standalone) so that
# `npm run build:app` — which transpiles src/blocks/*.jsx into index.html —
# works in remote sessions. Idempotent and non-interactive.
set -euo pipefail

# Only needed in the remote (web) environment; local machines already have deps.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# Prefer `npm install` (not `ci`) so the cached container layer is reused.
npm install --no-audit --no-fund
