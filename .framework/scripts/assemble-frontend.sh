#!/usr/bin/env bash

# CIL[BEGIN stable_id="~/.framework/scripts/assemble-frontend.sh:module:script" type="script" identity="assemble-frontend" parent="~/.framework/scripts/assemble-frontend.sh"]
# CIL[DOC-MACRO purpose="Assemble .framework/src base layer + each custom app under .assembled/src/<app-slug>/ and merge public assets with collision detection, for the Vite build."]
# CIL[DOC-RESPONSIBILITY responsibility="Stage core src, per-app dirs (verbatim, no basename flattening), index.html path fix, _redirects, and public assets; then mtime-preserving rsync into .assembled/src and public/."]
# CIL[DOC-CONTEXT module="assembly" layer="build" related_files="scripts/assemble-functions.sh,scripts/assemble.sh,config/vite.config.ts,.framework/src/components/CustomAppLoader.tsx"]
# CIL[DOC-CONTRACT inputs=".framework/src,.framework/public,custom/apps/*,spine.config.json; env SPINE_PROJECT_ROOT (fixture override for tests)" outputs=".assembled/src + merged public/; exit 1 on public-path collision" errors="hard error naming both sources when two public assets share a relative path with different content" side_effects="rewrites .assembled/src and public/"]
# CIL[DOC-MICRO logic_summary="Temp-dir staging → core copy → per-app rsync with excludes (functions/seed/public/node_modules/dist/dotfiles) → public manifest-tracked collision check → rsync -rlc (no -t) publish." notable_decisions="identical duplicate public assets skip silently; root spine.config.json wins over framework template; no .gitkeep rsync exclude so --delete can remove stale dirs"]
# CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
# CIL[DOC-STABILITY stability="stable"]
# CIL[DOC-NOTE type="invariant" content="import.meta.glob('../../../custom/apps/*/index.tsx') in CustomAppLoader must keep resolving — app dirs are copied verbatim under src/<slug>/, never flattened by basename."]
# CIL[END stable_id="~/.framework/scripts/assemble-frontend.sh:module:script"]

# Frontend Assembly - Merge .framework/src + custom/apps/* → .assembled/src
#
# Purpose: Create unified frontend source directory for Vite build process.
# - .framework/src is the canonical Spine frontend (base layer at root)
# - each custom/apps/<app> is copied to .assembled/src/<app-slug>/ VERBATIM —
#   no basename flattening (two apps' components/ must never merge silently)
# - custom app index resolution uses import.meta.glob('../../../custom/apps/*/index.tsx')
#   in .framework/src/components/CustomAppLoader.tsx — assembled app dirs exist
#   for @/(@core)-style imports and layout consistency, not for the glob
#
# Process:
# 1. Assemble into temp directory first
# 2. Copy core src files (base layer)
# 3. Copy each app to <app-slug>/, excluding functions/, seed/, public/,
#    node_modules, dist, and dotfiles
# 4. Merge public assets with same-relative-path collision detection
# 5. rsync -c into target so unchanged files keep their mtimes — Vite then only
#    reloads modules that actually changed instead of every file
#
# SPINE_PROJECT_ROOT (optional): override the project root — used by the
# fixture-based unit tests; production use leaves it unset.
#
# Dependencies: standard bash utilities, find, cp, rsync, cmp

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Canonicalize (-P resolves symlinks) — consistent with assemble-functions.sh
# and safe when the repo itself is reached through a symlinked path.
PROJECT_ROOT="$(cd "${SPINE_PROJECT_ROOT:-$(dirname "$SCRIPT_DIR")}" && pwd -P)"

CORE_SRC_DIR="$PROJECT_ROOT/.framework/src"
CUSTOM_SRC_DIR="$PROJECT_ROOT/custom/apps"
TARGET_SRC_DIR="$PROJECT_ROOT/.assembled/src"
VITE_PUBLIC_DIR="$PROJECT_ROOT/public"
TMP_ROOT="$PROJECT_ROOT/.frontend-assemble-tmp"
TMP_SRC_DIR="$TMP_ROOT/src"
TMP_PUBLIC_DIR="$TMP_ROOT/public"
# rel-path → source-file map for public-asset collision errors
PUBLIC_MANIFEST="$TMP_ROOT/public-manifest.tsv"

echo "🔧 Assembling frontend → $TARGET_SRC_DIR"

# 1. Stage into temp dir
rm -rf "$TMP_ROOT"
mkdir -p "$TMP_SRC_DIR" "$TMP_PUBLIC_DIR"
: > "$PUBLIC_MANIFEST"

# 2. Copy core src (base layer)
if [ -d "$CORE_SRC_DIR" ]; then
  cp -r "$CORE_SRC_DIR"/* "$TMP_SRC_DIR"/ 2>/dev/null || true
  echo "  ✓ Core: $(find "$CORE_SRC_DIR" -name '*.tsx' -o -name '*.ts' -o -name '*.css' | wc -l | tr -d ' ') files"
else
  echo "  ⚠ Core: $CORE_SRC_DIR not found"
fi

# 3. Copy index.html, fixing the script src path for assembled structure
if [ -f "$PROJECT_ROOT/.framework/index.html" ]; then
  sed 's|/src/main.tsx|./main.tsx|g' "$PROJECT_ROOT/.framework/index.html" > "$TMP_SRC_DIR/index.html"
  echo "  ✓ Core: index.html (paths fixed)"
fi

# 4. Stage a public-asset source dir into TMP_PUBLIC_DIR with collision
# detection. The SAME relative path may never come from two different sources:
# - identical content → skip silently (duplicate copy is harmless)
# - differing content → hard error naming both source files
stage_public_dir() {
  local src_dir="$1"
  local f rel staged prev
  while IFS= read -r -d '' f; do
    rel="${f#"$src_dir"/}"
    staged="$TMP_PUBLIC_DIR/$rel"
    if [ -e "$staged" ]; then
      if cmp -s "$f" "$staged"; then
        continue
      fi
      prev="$(awk -F '\t' -v r="$rel" '$1 == r { print $2; exit }' "$PUBLIC_MANIFEST")"
      echo "  ✗ Public asset collision: '$rel' is provided by both" >&2
      echo "      - $prev" >&2
      echo "      - $f" >&2
      echo "    Rename one of them — public/ merges flat, last-wins is forbidden." >&2
      exit 1
    fi
    mkdir -p "$(dirname "$staged")"
    cp "$f" "$staged"
    printf '%s\t%s\n' "$rel" "$f" >> "$PUBLIC_MANIFEST"
  done < <(find "$src_dir" -type f ! -name '.*' -print0 | sort -z)
}

# 5. Framework public assets merge first — Vite's publicDir is
# PROJECT_ROOT/public, so static files must land there to be served at root URL
if [ -d "$PROJECT_ROOT/.framework/public" ]; then
  stage_public_dir "$PROJECT_ROOT/.framework/public"
  echo "  ✓ Core: $(find "$PROJECT_ROOT/.framework/public" -type f | wc -l | tr -d ' ') public files"
fi

# 6. Copy _redirects to Vite-served root for Netlify dev (served from .assembled/src root)
if [ -f "$PROJECT_ROOT/.framework/public/_redirects" ]; then
  cp "$PROJECT_ROOT/.framework/public/_redirects" "$TMP_SRC_DIR/_redirects"
  echo "  ✓ Core: _redirects copied to Vite-served directory for Netlify dev"
fi

# 7. Per-app copy: custom/apps/<app> → .assembled/src/<app-slug>/ verbatim.
# Excluded: functions (goes to .assembled/netlify/functions), seed, public
# (merged into /public above), node_modules, dist, dotfiles.
CUSTOM_COUNT=0
if [ -d "$CUSTOM_SRC_DIR" ]; then
  for app_dir in "$CUSTOM_SRC_DIR"/*/; do
    [ -d "$app_dir" ] || continue
    slug="$(basename "$app_dir")"

    rsync -a \
      --exclude='functions' \
      --exclude='seed' \
      --exclude='public' \
      --exclude='node_modules' \
      --exclude='dist' \
      --exclude='.*' \
      "$app_dir" "$TMP_SRC_DIR/$slug/"

    # App public assets merge into /public AFTER framework public; a same
    # relative path in two sources (or vs framework) is a hard error above.
    if [ -d "$app_dir/public" ]; then
      stage_public_dir "$app_dir/public"
    fi

    app_count=$(find "$TMP_SRC_DIR/$slug" -name '*.tsx' -o -name '*.ts' -o -name '*.css' 2>/dev/null | wc -l | tr -d ' ')
    CUSTOM_COUNT=$((CUSTOM_COUNT + app_count))
    echo "  ✓ $slug: $app_count files → src/$slug/"
  done
fi
if [ "$CUSTOM_COUNT" -eq 0 ]; then
  echo "  ○ Custom: (empty)"
fi

# 8. spine.config.json → staged public (root config, served at /spine.config.json).
# The ROOT copy is the instance config and intentionally wins over the
# framework template of the same name (framework/public/spine.config.json).
if [ -f "$PROJECT_ROOT/spine.config.json" ]; then
  cp -f "$PROJECT_ROOT/spine.config.json" "$TMP_PUBLIC_DIR/spine.config.json"
  echo "  ✓ Config: spine.config.json copied to public/"
fi

# 9. Publish staged public assets. -c compares content checksums; deliberately
# NO -t so unchanged files keep mtimes (see final sync note below).
mkdir -p "$VITE_PUBLIC_DIR"
rsync -rlc "$TMP_PUBLIC_DIR"/ "$VITE_PUBLIC_DIR"/

# 10. Sync temp into place. -c compares content checksums; deliberately NO -t —
# otherwise rsync "corrects" mtimes of unchanged files to the fresh temp-copy
# time and Vite reloads the entire module graph on every assemble.
mkdir -p "$TARGET_SRC_DIR"
# No .gitkeep exclusion: .assembled/ is gitignored, and leftover .gitkeep
# files inside stale dirs would make --delete treat them as non-empty.
rsync -rlc --delete "$TMP_SRC_DIR"/ "$TARGET_SRC_DIR"/
rm -rf "$TMP_ROOT"

echo "  ✓ Assembled: $(find "$TARGET_SRC_DIR" -name '*.tsx' -o -name '*.ts' -o -name '*.css' | wc -l | tr -d ' ') total files"
echo "✅ Done"
