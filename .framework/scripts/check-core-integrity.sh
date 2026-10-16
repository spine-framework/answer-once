#!/usr/bin/env bash
# CIL[BEGIN stable_id="~/.framework/scripts/check-core-integrity.sh:module:script" type="script" identity="check-core-integrity" parent="~/.framework/scripts/check-core-integrity.sh"]
# CIL[DOC-MACRO purpose="RETIRED — deprecated shim that delegates to verify-integrity.sh"]
# CIL[DOC-RESPONSIBILITY responsibility="Preserve the historical entrypoint name while forwarding all integrity checks to the unified manifest verifier"]
# CIL[DOC-CONTEXT module="spine-integrity" layer="build" related_files="scripts/verify-integrity.sh,scripts/verify-manifest.mts,.framework/scripts/check-core-integrity.sh"]
# CIL[DOC-CONTRACT inputs="passthrough args" outputs="exit code of verify-integrity.sh" errors="same as verify-integrity.sh" side_effects="deprecation notice on stderr"]
# CIL[DOC-MICRO logic_summary="The legacy implementation compared aggregate src/functions hashes and used GNU-only tools with invalid bash markers; it had no callers" notable_decisions="kept as a shim rather than deleted so external muscle memory and docs links do not 404"]
# CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="superseded"]
# CIL[DOC-STABILITY stability="deprecated"]
# CIL[DOC-AUDIENCE audience="system-admin"]
# CIL[DOC-NOTE type="deprecated" content="No repo callers found via git grep; use npm run verify / scripts/verify-integrity.sh directly"]
# CIL[DOC-VECTOR type="context" content="Retired in favor of scripts/verify-integrity.sh during the hard-lock manifest batch"]
# CIL[DOC-VECTOR type="implementation_pattern" content="exec passthrough shim" status="ready"]
# CIL[END stable_id="~/.framework/scripts/check-core-integrity.sh:module:script"]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "⚠️  check-core-integrity.sh is retired — delegating to verify-integrity.sh" >&2
exec bash "$SCRIPT_DIR/verify-integrity.sh" "$@"
