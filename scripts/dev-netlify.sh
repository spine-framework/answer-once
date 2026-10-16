#!/usr/bin/env bash

# Netlify Dev Launcher - starts `netlify dev` with raised resource limits.
# Uses the pinned local binary (devDependency netlify-cli) — never npx,
# which would auto-download whatever version the registry happens to serve.
#
# Why: this project has ~100 bundled functions. macOS's default soft file
# descriptor limit (256) and default Node heap are too small when Netlify
# reloads many function bundles at once, which previously crashed the dev
# server mid-reload with no error output.
#
# Also cleans up stale listeners/orphans before starting and on exit —
# `netlify dev` has a habit of leaving the Vite child behind when it dies.
#
# Launch is fragile: do NOT hit http://localhost:8888 (UI or functions) until
# the "Local dev server ready" banner prints — early requests during function
# bundling reliably crash the whole dev server.
#
# Usage: npm run dev:netlify   (or: bash scripts/dev-netlify.sh)

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "🧹 Cleaning stale dev processes..."
bash "$SCRIPT_DIR/dev-clean.sh" || true

ulimit -n 10240 2>/dev/null || true
export NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=8192"

# When netlify dev exits (crash, Ctrl-C, reload storm), reap the Vite child
# and anything else it left behind so ports are free for the next start.
cleanup() {
  echo ""
  echo "🧹 netlify dev exited — reaping leftovers..."
  bash "$SCRIPT_DIR/dev-clean.sh" || true
}
trap cleanup EXIT INT TERM

NETLIFY="$PROJECT_ROOT/node_modules/.bin/netlify"
if [ ! -x "$NETLIFY" ]; then
  echo "❌ netlify-cli not found at $NETLIFY" >&2
  echo "   Run 'npm install' first — netlify-cli is a pinned devDependency." >&2
  exit 1
fi

"$NETLIFY" dev "$@"
