#!/bin/bash
# Claude Code on the web only: make sure dependencies are installed so lint,
# typecheck and tests can run. Idempotent; reinstalls only when package-lock.json changed.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-.}"

stamp="node_modules/.lock-stamp"
current="$(sha256sum package-lock.json | cut -d' ' -f1)"

if [ -d node_modules ] && [ -f "$stamp" ] && [ "$(cat "$stamp")" = "$current" ]; then
  exit 0
fi

npm ci --no-audit --no-fund
echo "$current" > "$stamp"
