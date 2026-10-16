#!/usr/bin/env bash

# CIL[BEGIN stable_id="~/scripts/dev-clean.sh:module:script" type="script" identity="dev-clean" parent="~/scripts/dev-clean.sh"]
# CIL[DOC-MACRO purpose="Kill leftover dev-server processes for THIS repo only — never cross-project port holders."]
# CIL[DOC-RESPONSIBILITY responsibility="Free dev ports 8888/3001 when the listener's cwd is under PROJECT_ROOT; kill repo-scoped vite/netlify/esbuild/lambda-local leftovers; warn (not kill) foreign listeners."]
# CIL[DOC-CONTEXT module="dev-tooling" layer="dx" related_files="scripts/dev-netlify.sh,scripts/netlify-dev-wrapper.sh,package.json"]
# CIL[DOC-CONTRACT inputs="running processes + port listeners" outputs="freed repo dev ports; warnings for foreign listeners" errors="nonzero-free report only" side_effects="SIGTERM to repo-scoped dev processes"]
# CIL[DOC-MICRO logic_summary="lsof port listeners → cwd check via lsof -p awk $4==cwd → kill only under PROJECT_ROOT; pgrep -f repo path for leftovers; final remaining-listener report." notable_decisions="ports are global across projects, so cwd-scoping is mandatory"]
# CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
# CIL[DOC-STABILITY stability="stable"]
# CIL[END stable_id="~/scripts/dev-clean.sh:module:script"]

# Dev Process Cleanup - kills leftover dev-server processes for THIS repo.
#
# Targets, in order:
#   1. Whatever is LISTENING on the dev ports (8888 netlify, 3001 vite) — but
#      only when the listener's cwd is inside this repo; foreign listeners get
#      a warning, not a kill (ports are shared across projects)
#   2. Orphaned processes spawned from this repo (vite, netlify, lambda-local,
#      esbuild service workers) — matched by project path in their cmdline
#   3. Processes named like netlify dev children whose cwd is this repo
#
# Deliberately does NOT kill the Devin MCP `tsx` server — it is matched by
# cmdline pattern only when it contains vite/netlify/esbuild/lambda-local.
#
# Usage: npm run dev:stop

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

killed=0
note() { echo "  $1"; }

# 1. Kill listeners on the dev ports — ONLY when the listener's cwd is under
# this repo. Ports are global: another project's dev server on 8888/3001 must
# be warned about, never killed.
for port in 8888 3001; do
  pids=$(lsof -ti :"$port" -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "$pids" ]; then
    for pid in $pids; do
      cmd=$(ps -p "$pid" -o command= 2>/dev/null | cut -c1-80)
      cwd=$(lsof -p "$pid" 2>/dev/null | awk '$4=="cwd" {print $NF}' | head -1)
      case "$cwd" in
        "$PROJECT_ROOT"|"$PROJECT_ROOT"/*)
          note "port $port: killing $cmd (pid $pid)"
          kill "$pid" 2>/dev/null || true
          killed=$((killed + 1))
          ;;
        *)
          note "port $port held by ${cmd:-unknown} (pid $pid) outside this repo — skipping"
          ;;
      esac
    done
  fi
done

# 2. Kill repo-scoped node leftovers (vite/netlify/lambda-local/esbuild under this tree)
pgrep -f "$PROJECT_ROOT" 2>/dev/null | while read -r pid; do
  cmd=$(ps -p "$pid" -o command= 2>/dev/null || true)
  case "$cmd" in
    *vite*|*netlify*|*esbuild*|*lambda-local*)
      note "repo proc: killing $(echo "$cmd" | cut -c1-80) (pid $pid)"
      kill "$pid" 2>/dev/null || true
      ;;
  esac
done

# 3. Kill netlify-dev children whose cwd is this repo (cmdline has no path)
pgrep -f "netlify dev|netlify-cli|lambda-local" 2>/dev/null | while read -r pid; do
  cwd=$(lsof -p "$pid" 2>/dev/null | awk '$4=="cwd" {print $NF}' | head -1)
  if [ "$cwd" = "$PROJECT_ROOT" ]; then
    note "netlify child: killing $(ps -p "$pid" -o command= 2>/dev/null | cut -c1-80) (pid $pid)"
    kill "$pid" 2>/dev/null || true
  fi
done

sleep 1
# Report anything still holding the ports
remaining=$(lsof -ti :8888 -i :3001 -sTCP:LISTEN 2>/dev/null | wc -l | tr -d ' ')
if [ "$remaining" = "0" ]; then
  echo "✅ Ports 8888/3001 free"
else
  echo "⚠ $remaining process(es) still listening — re-run with sudo or kill -9 manually"
fi
