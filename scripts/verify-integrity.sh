#!/usr/bin/env bash
# CIL[BEGIN stable_id="~/scripts/verify-integrity.sh:module:script" type="script" identity="verify-integrity" parent="~/scripts/verify-integrity.sh"]
# CIL[DOC-MACRO purpose="Thin wrapper that verifies protected trees against .spine-manifest.json via scripts/verify-manifest.mts"]
# CIL[DOC-RESPONSIBILITY responsibility="Map SPINE_INTEGRITY to verifier flags and invoke the Node verifier; fail closed by default"]
# CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/verify-manifest.mts,scripts/build-manifest.sh,scripts/check-core-integrity.sh,package.json"]
# CIL[DOC-CONTRACT inputs="SPINE_INTEGRITY=warn|enforce (default enforce); passthrough args" outputs="exit 0 pass / exit 1 integrity failure" errors="exit 1 on missing tsx or verifier failure" side_effects="stdout/stderr report"]
# CIL[DOC-MICRO logic_summary="SPINE_INTEGRITY=warn passes --warn; the verifier itself ignores --warn when the manifest is frozen" notable_decisions="default is enforce — fail-closed — unlike the legacy warn-by-default script"]
# CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
# CIL[DOC-STABILITY stability="stable"]
# CIL[DOC-AUDIENCE audience="system-admin"]
# CIL[DOC-VECTOR type="context" content="Invoked by npm run verify and the retired check-core-integrity.sh shim"]
# CIL[DOC-VECTOR type="implementation_pattern" content="Sibling thin wrapper of build-manifest.sh; real logic in scripts/verify-manifest.mts" status="ready"]
# CIL[END stable_id="~/scripts/verify-integrity.sh:module:script"]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

INTEGRITY_MODE="${SPINE_INTEGRITY:-enforce}"
echo "🔒 Verifying spine integrity (mode: $INTEGRITY_MODE)"

TSX="$PROJECT_ROOT/node_modules/.bin/tsx"
if [ ! -x "$TSX" ]; then
  echo "❌ tsx not found at $TSX — run 'npm install' first" >&2
  exit 1
fi

if [ "$INTEGRITY_MODE" = "warn" ]; then
  "$TSX" "$SCRIPT_DIR/verify-manifest.mts" "$PROJECT_ROOT" --warn "$@"
else
  "$TSX" "$SCRIPT_DIR/verify-manifest.mts" "$PROJECT_ROOT" "$@"
fi
