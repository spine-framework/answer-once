#!/usr/bin/env bash

# CIL[BEGIN stable_id="~/scripts/assemble-functions.sh:module:script" type="script" identity="assemble-functions" parent="~/scripts/assemble-functions.sh"]
# CIL[DOC-MACRO purpose="Assemble .framework/functions + custom functions into the flat .assembled/netlify/functions dir Netlify deploys, with duplicate-handler detection."]
# CIL[DOC-RESPONSIBILITY responsibility="Stage framework functions then custom/functions and custom/apps/*/functions into a temp dir, enforcing basename uniqueness; publish via mtime-preserving rsync."]
# CIL[DOC-CONTEXT module="assembly" layer="build" related_files="scripts/assemble-frontend.sh,scripts/assemble.sh,netlify.toml"]
# CIL[DOC-CONTRACT inputs=".framework/functions,custom/functions,custom/apps/*/functions; env SPINE_PROJECT_ROOT (fixture override for tests)" outputs=".assembled/netlify/functions; exit 1 on duplicate basename" errors="hard error naming both sources on basename collision; symlink dev-aliases resolving inside .framework/functions skip silently" side_effects="rewrites .assembled/netlify/functions"]
# CIL[DOC-MICRO logic_summary="Manifest-tracked staging: each staged basename records its source path; collisions resolve via is_dev_alias (macOS-safe readlink resolution) or fail. Excludes _quarantine and *-test.ts/*.test.ts." notable_decisions="flat layout is required by Netlify, so last-wins overwrite is forbidden; PROJECT_ROOT canonicalized with pwd -P so /var→/private/var symlinked TMPDIR fixtures still match"]
# CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
# CIL[DOC-STABILITY stability="stable"]
# CIL[END stable_id="~/scripts/assemble-functions.sh:module:script"]

# Functions Assembly - Merge .framework + custom functions into .assembled/
#
# Purpose: Create unified functions directory for Netlify deployment.
# - .framework/functions are the canonical Spine runtime
# - custom/functions + custom/apps/<app>/functions are your custom extensions
# - Netlify requires a single functions directory, so we assemble at build time
#
# Process:
# 1. Assemble into temp directory first (prevents Netlify observing half-deleted dir)
# 2. Copy core functions
# 3. Overlay custom functions — with duplicate-handler detection:
#    a custom file whose basename is already staged must either be a symlink
#    resolving inside .framework/functions (safe dev alias → skipped silently)
#    or a HARD ERROR naming both source paths (no silent last-wins overwrite)
# 4. rsync -c into target so unchanged files keep their mtimes — Netlify/esbuild
#    then only rebundles functions that actually changed
#
# SPINE_PROJECT_ROOT (optional): override the project root — used by the
# fixture-based unit tests; production use leaves it unset.
#
# Dependencies: standard bash utilities, find, cp, rsync, readlink

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Canonicalize (-P resolves symlinks) so dev-alias prefix checks compare
# physical paths — e.g. macOS /var → /private/var under TMPDIR.
PROJECT_ROOT="$(cd "${SPINE_PROJECT_ROOT:-$(dirname "$SCRIPT_DIR")}" && pwd -P)"

CORE_DIR="$PROJECT_ROOT/.framework/functions"
CUSTOM_DIR="$PROJECT_ROOT/custom"
TARGET_DIR="$PROJECT_ROOT/.assembled/netlify/functions"
TMP_DIR="$PROJECT_ROOT/.functions-assemble-tmp"
# basename → source-file map for duplicate-handler error messages
STAGE_MANIFEST="$TMP_DIR.manifest.tsv"

echo "🔧 Assembling functions → $TARGET_DIR"

# 1. Assemble into a temp directory first so Netlify never observes a half-deleted functions dir
rm -rf "$TMP_DIR"
mkdir -p "$TMP_DIR"
: > "$STAGE_MANIFEST"

# Resolve a symlink to an absolute path (macOS readlink has no -f).
resolve_link() {
  local f="$1" t d
  t="$(readlink "$f")" || return 1
  case "$t" in
    /*) printf '%s\n' "$t" ;;
    *)
      d="$(cd "$(dirname "$f")" && cd "$(dirname "$t")" && pwd -P)" || return 1
      printf '%s/%s\n' "$d" "$(basename "$t")"
      ;;
  esac
}

# True when $1 is a symlink whose target resolves inside $CORE_DIR —
# a safe dev alias back to the framework copy, not an override.
is_dev_alias() {
  local f="$1" resolved
  [ -L "$f" ] || return 1
  resolved="$(resolve_link "$f")" || return 1
  case "$resolved" in
    "$CORE_DIR"|"$CORE_DIR"/*) return 0 ;;
    *) return 1 ;;
  esac
}

# Copy top-level .ts files from $1 (excluding tests) into the flat TMP_DIR.
# Basename already staged → dev-alias skip or hard error naming both sources.
stage_fn_files() {
  local src_dir="$1"
  local f base staged prev
  while IFS= read -r -d '' f; do
    base="$(basename "$f")"
    staged="$TMP_DIR/$base"
    if [ -e "$staged" ]; then
      if is_dev_alias "$f"; then
        continue  # dev alias → framework copy already staged, skip silently
      fi
      prev="$(awk -F '\t' -v b="$base" '$1 == b { print $2; exit }' "$STAGE_MANIFEST")"
      echo "  ✗ Duplicate function handler: '$base' is provided by both" >&2
      echo "      - $prev" >&2
      echo "      - $f" >&2
      echo "    Rename one of them — functions assemble flat, last-wins is forbidden." >&2
      exit 1
    fi
    cp "$f" "$staged"
    printf '%s\t%s\n' "$base" "$f" >> "$STAGE_MANIFEST"
  done < <(find "$src_dir" -maxdepth 1 -name '*.ts' ! -name '*-test.ts' ! -name '*.test.ts' -print0 | sort -z)
}

# Copy subdirectories of $1 into TMP_DIR, merging by basename. A real custom
# dir may overlay a framework dir (e.g. _shared helpers); a symlinked dir is a
# dev alias when it resolves inside .framework/functions — skipped silently if
# the name is already staged — otherwise a colliding symlink is a hard error.
stage_fn_dirs() {
  local src_dir="$1"
  local d base
  while IFS= read -r -d '' d; do
    base="$(basename "$d")"
    [ "$base" = "_quarantine" ] && continue
    if [ -L "$d" ]; then
      if [ -e "$TMP_DIR/$base" ]; then
        if is_dev_alias "$d"; then
          continue
        fi
        echo "  ✗ Duplicate function path: '$base' is provided by both" >&2
        echo "      - $TMP_DIR/$base (already staged)" >&2
        echo "      - $d -> $(readlink "$d")" >&2
        exit 1
      fi
      cp -R "$d" "$TMP_DIR/" 2>/dev/null || true
      continue
    fi
    # real dir: merge into staged dir if present (cp of dir/. includes dotfiles)
    mkdir -p "$TMP_DIR/$base"
    cp -r "$d"/. "$TMP_DIR/$base/" 2>/dev/null || true
  done < <(find "$src_dir" -mindepth 1 -maxdepth 1 \( -type d -o -type l \) -print0 | sort -z)
}

# 2. Copy core functions (base layer), excluding _quarantine and test files
if [ -d "$CORE_DIR" ]; then
  stage_fn_files "$CORE_DIR"
  stage_fn_dirs "$CORE_DIR"
  echo "  ✓ Core: $(find "$CORE_DIR" -name '*.ts' | grep -v '_quarantine' | grep -v '\-test\.ts$' | grep -v '\.test\.ts$' | wc -l | tr -d ' ') files"
fi

# 3. Overlay custom functions (additions; basename collisions error out above),
# excluding test files
CUSTOM_COUNT=0

# 3a. Functions from custom/functions/
if [ -d "$CUSTOM_DIR/functions" ]; then
  stage_fn_files "$CUSTOM_DIR/functions"
  stage_fn_dirs "$CUSTOM_DIR/functions"
  CUSTOM_COUNT=$((CUSTOM_COUNT + $(find "$CUSTOM_DIR/functions" -name '*.ts' ! -name '*-test.ts' ! -name '*.test.ts' 2>/dev/null | wc -l | tr -d ' ')))
fi

# 3b. Functions from custom/apps/*/functions/ — app-vs-framework AND
# app-vs-app basename collisions both hit the same staged-name check.
if [ -d "$CUSTOM_DIR/apps" ]; then
  for app_dir in "$CUSTOM_DIR/apps"/*/; do
    if [ -d "$app_dir/functions" ]; then
      stage_fn_files "$app_dir/functions"
      stage_fn_dirs "$app_dir/functions"
      APP_COUNT=$(find "$app_dir/functions" -name '*.ts' ! -name '*-test.ts' ! -name '*.test.ts' 2>/dev/null | wc -l | tr -d ' ')
      CUSTOM_COUNT=$((CUSTOM_COUNT + APP_COUNT))
      echo "  ✓ $(basename "$app_dir"): $APP_COUNT files"
    fi
  done
fi

if [ "$CUSTOM_COUNT" -gt 0 ]; then
  echo "  ✓ Custom: $CUSTOM_COUNT total files"
else
  echo "  ○ Custom: (empty)"
fi

# 3c. Emit stubs for dynamic-import specifiers in staged subdirs (e.g.
# _shared/webhook-registry's INBOUND_MODULE_LOADERS) that reference modules
# absent from this deployment's function set. Standalone exports only ship
# their own app's functions, and esbuild fails the whole build on an
# unresolved literal import(). A stub keeps bundling green — it can only
# throw if invoked, which requires a registered handler that isn't installed.
STUB_COUNT=0
while IFS= read -r spec; do
  [ -e "$TMP_DIR/$spec.ts" ] && continue
  [ -e "$TMP_DIR/$spec/index.ts" ] && continue
  [ -d "$TMP_DIR/$spec" ] && continue
  mkdir -p "$(dirname "$TMP_DIR/$spec")"
  cat > "$TMP_DIR/$spec.ts" <<STUB
// Auto-generated assemble stub: a _shared import map references this module
// but it is not part of this deployment's function set. The stub satisfies
// esbuild's static bundling; it throws only if invoked, which cannot happen
// without a registered handler for it.
export function adapt(): never { throw new Error('$spec is not installed in this build') }
export function handler(): never { throw new Error('$spec is not installed in this build') }
export default adapt
STUB
  STUB_COUNT=$((STUB_COUNT + 1))
  echo "  ✓ Stubbed missing import target: $spec"
done < <(grep -rhoE "import\('\.\./[A-Za-z0-9_/.-]+'\)" "$TMP_DIR"/*/*.ts 2>/dev/null | sed -E "s/import\('\.\.\///; s/'\)//" | sort -u)

# 4. Sync temp into place. -c compares content checksums; deliberately NO -t —
# otherwise rsync "corrects" mtimes of unchanged files to the fresh temp-copy
# time and Netlify/esbuild reloads all ~100 functions on every assemble.
mkdir -p "$(dirname "$TARGET_DIR")"
rsync -rlc --delete "$TMP_DIR"/ "$TARGET_DIR"/
rm -rf "$TMP_DIR" "$STAGE_MANIFEST"

echo "  ✓ Assembled: $(find "$TARGET_DIR" -name '*.ts' ! -name '*-test.ts' ! -name '*.test.ts' | wc -l | tr -d ' ') total functions"
echo "✅ Done"
