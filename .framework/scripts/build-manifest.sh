#!/usr/bin/env bash
# CIL[BEGIN stable_id="~/scripts/build-manifest.sh:module:script" type="script" identity="build-manifest" parent="~/scripts/build-manifest.sh"]
# CIL[DOC-MACRO purpose="Thin wrapper that regenerates .spine-manifest.json via scripts/checksum-manifest.mts"]
# CIL[DOC-RESPONSIBILITY responsibility="Resolve the repo-local tsx binary and invoke the Node manifest generator against this repo root"]
# CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/checksum-manifest.mts,scripts/verify-integrity.sh,package.json"]
# CIL[DOC-CONTRACT inputs="optional passthrough args (e.g. --include-dir)" outputs=".spine-manifest.json at repo root" errors="exit 1 when tsx is missing or the generator fails" side_effects="rewrites .spine-manifest.json, echoes SPINE_INTEGRITY mode for compatibility"]
# CIL[DOC-MICRO logic_summary="Replaces the legacy inline-bash implementation that used GNU-only sort -z and a broken JSDoc header" notable_decisions="hashing lives in Node — BSD/GNU portability and deterministic ordering come free"]
# CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
# CIL[DOC-STABILITY stability="stable"]
# CIL[DOC-AUDIENCE audience="system-admin"]
# CIL[DOC-VECTOR type="context" content="Invoked by npm run manifest"]
# CIL[DOC-VECTOR type="implementation_pattern" content="Sibling thin wrapper of verify-integrity.sh; real logic in scripts/checksum-manifest.mts" status="ready"]
# CIL[END stable_id="~/scripts/build-manifest.sh:module:script"]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

INTEGRITY_MODE="${SPINE_INTEGRITY:-warn}"
echo "🔒 Generating spine integrity manifest (mode: $INTEGRITY_MODE)"

if [ -f "$PROJECT_ROOT/.spine-export-manifest.json" ]; then
  echo "❌ Frozen standalone export — .spine-manifest.json regeneration is only allowed in the monorepo (.spine-export-manifest.json present)" >&2
  exit 1
fi

TSX="$PROJECT_ROOT/node_modules/.bin/tsx"
if [ ! -x "$TSX" ]; then
  echo "❌ tsx not found at $TSX — run 'npm install' first" >&2
  exit 1
fi

"$TSX" "$SCRIPT_DIR/checksum-manifest.mts" "$PROJECT_ROOT" "$PROJECT_ROOT/.spine-manifest.json" "$@"

echo "✅ Manifest written"
