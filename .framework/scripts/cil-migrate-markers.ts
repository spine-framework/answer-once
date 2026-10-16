// CIL[BEGIN stable_id="~/.framework/scripts/cil-migrate-markers.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-MACRO purpose="Import Node.js and shared CIL utilities used by the marker migration script"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the module-level imports required by the rest of the script"]
// CIL[DOC-CONTEXT module="cil-migrate-markers" layer="infrastructure" related_files=".framework/functions/_shared/cil.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import fs/promises, path, and shared CIL helpers" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="system-admin"]
import * as fs from 'fs/promises'
import * as path from 'path'
import { toCanonicalPath, generateStableId } from '../functions/_shared/cil'
// CIL[DOC-VECTOR type="context" content="purpose='Import Node.js and shared CIL utilities used by the marker migration script'; No verified external callers; imports: .framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/cil-migrate-markers.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/scripts/cil-migrate-markers.ts:MarkerRewrite:interface" type="interface" identity="MarkerRewrite" parent="~/.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-MACRO purpose="Define the shape of a marker rewrite result for a single file"]
// CIL[DOC-RESPONSIBILITY responsibility="Type the per-file rewrite report consumed by the main report"]
// CIL[DOC-CONTEXT module="cil-migrate-markers" layer="infrastructure" related_files=".framework/functions/_shared/cil.ts,.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declare an interface with file, rewrite count and error list fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface MarkerRewrite {
  file: string
  rewrites: number
  errors: string[]
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the shape of a marker rewrite result for a single file'; No verified external callers; imports: .framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/cil-migrate-markers.ts:MarkerRewrite:interface"]

// CIL[BEGIN stable_id="~/.framework/scripts/cil-migrate-markers.ts:LEGACY_PATTERNS:constant" type="constant" identity="LEGACY_PATTERNS" parent="~/.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-MACRO purpose="Define legacy marker patterns recognized for migration"]
// CIL[DOC-RESPONSIBILITY responsibility="List regular expressions that identify old CHUNK_START/CHUNK_END markers"]
// CIL[DOC-CONTEXT module="cil-migrate-markers" layer="infrastructure" related_files=".framework/functions/_shared/cil.ts,.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Store a single pattern object with begin and end regexes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const LEGACY_PATTERNS = [
  {
    name: 'chunk_start_end',
    begin: /^([ \t]*\/\*\*\s*───\s*CHUNK_START:\s*(.+?)\s*───\s*\*\/)/,
    end: /^([ \t]*\/\*\*\s*───\s*CHUNK_END:\s*(.+?)\s*───\s*\*\/)/,
  },
]
// CIL[DOC-VECTOR type="context" content="purpose='Define legacy marker patterns recognized for migration'; No verified external callers; imports: .framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/cil-migrate-markers.ts:LEGACY_PATTERNS:constant"]

// CIL[BEGIN stable_id="~/.framework/scripts/cil-migrate-markers.ts:TS_JS:constant" type="constant" identity="TS_JS" parent="~/.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-MACRO purpose="List file extensions treated as TypeScript or JavaScript"]
// CIL[DOC-RESPONSIBILITY responsibility="Drive comment-prefix selection for TS/JS source files"]
// CIL[DOC-CONTEXT module="cil-migrate-markers" layer="infrastructure" related_files=".framework/functions/_shared/cil.ts,.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declare an array of TypeScript and JavaScript extensions" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const TS_JS = ['.ts', '.tsx', '.js', '.jsx']
// CIL[DOC-VECTOR type="context" content="purpose='List file extensions treated as TypeScript or JavaScript'; No verified external callers; imports: .framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/cil-migrate-markers.ts:TS_JS:constant"]

// CIL[BEGIN stable_id="~/.framework/scripts/cil-migrate-markers.ts:parseIdentityFromChunkId:function" type="function" identity="parseIdentityFromChunkId" parent="~/.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-MACRO purpose="Extract a human-readable identity from a legacy chunk id"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert legacy chunk id strings to stable identities"]
// CIL[DOC-CONTEXT module="cil-migrate-markers" layer="infrastructure" related_files=".framework/functions/_shared/cil.ts,.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-CONTRACT inputs="chunkId: string | undefined" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Split the chunk id and derive an identity from trailing underscore-separated parts" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function parseIdentityFromChunkId(chunkId: string | undefined): string {
  if (!chunkId) return 'unknown'
  const parts = chunkId.split('_')
  if (parts.length < 2) return chunkId
  const epoch = parts.pop()
  const nameParts = parts.slice(1)
  return nameParts.length > 0 ? nameParts.join('_') : epoch || chunkId
}
// CIL[DOC-VECTOR type="context" content="purpose='Extract a human-readable identity from a legacy chunk id'; No verified external callers; imports: .framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/cil-migrate-markers.ts:parseIdentityFromChunkId:function"]

// CIL[BEGIN stable_id="~/.framework/scripts/cil-migrate-markers.ts:guessType:function" type="function" identity="guessType" parent="~/.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-MACRO purpose="Infer a CIL chunk type from a symbol name"]
// CIL[DOC-RESPONSIBILITY responsibility="Assign type labels such as method, class, hook or function when no explicit type is given"]
// CIL[DOC-CONTEXT module="cil-migrate-markers" layer="infrastructure" related_files=".framework/functions/_shared/cil.ts,.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-CONTRACT inputs="name: string" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Apply heuristics based on dots, initial capitalization and use prefix" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function guessType(name: string): string {
  if (!name) return 'unknown'
  if (name.includes('.')) return 'method'
  if (name[0] === name[0].toUpperCase()) return 'class'
  if (name.startsWith('use') && name.length > 3 && name[3] === name[3].toUpperCase()) return 'hook'
  return 'function'
}
// CIL[DOC-VECTOR type="context" content="purpose='Infer a CIL chunk type from a symbol name'; No verified external callers; imports: .framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/cil-migrate-markers.ts:guessType:function"]

// CIL[BEGIN stable_id="~/.framework/scripts/cil-migrate-markers.ts:parseStableId:function" type="function" identity="parseStableId" parent="~/.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-MACRO purpose="Parse a stable id string to extract identity and type"]
// CIL[DOC-RESPONSIBILITY responsibility="Recover chunk identity and type from stable id colons"]
// CIL[DOC-CONTEXT module="cil-migrate-markers" layer="infrastructure" related_files=".framework/functions/_shared/cil.ts,.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-CONTRACT inputs="stableId: string" outputs="{ identity, type }" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Split by colon and return the last two segments as identity and type" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function parseStableId(stableId: string): { identity: string; type: string } {
  const parts = stableId.split(':')
  return {
    identity: parts.length >= 2 ? parts[parts.length - 2] : 'unknown',
    type: parts.length >= 1 ? parts[parts.length - 1] : 'unknown',
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Parse a stable id string to extract identity and type'; No verified external callers; imports: .framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/cil-migrate-markers.ts:parseStableId:function"]

// CIL[BEGIN stable_id="~/.framework/scripts/cil-migrate-markers.ts:markerPrefix:function" type="function" identity="markerPrefix" parent="~/.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-MACRO purpose="Choose the correct comment syntax for CIL markers in a file"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the prefix and suffix for CIL comments based on file extension"]
// CIL[DOC-CONTEXT module="cil-migrate-markers" layer="infrastructure" related_files=".framework/functions/_shared/cil.ts,.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-CONTRACT inputs="filePath: string" outputs="{ prefix, suffix }" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Map file extensions to //, --, # or HTML comment markers" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function markerPrefix(filePath: string): { prefix: string; suffix: string } {
  const ext = path.extname(filePath)
  if (TS_JS.includes(ext)) return { prefix: '// ', suffix: '' }
  if (['.sql', '.psql'].includes(ext)) return { prefix: '-- ', suffix: '' }
  if (['.sh', '.bash', '.yaml', '.yml', '.py'].includes(ext)) return { prefix: '# ', suffix: '' }
  if (['.md', '.mdx'].includes(ext)) return { prefix: '<!-- ', suffix: ' -->' }
  return { prefix: '// ', suffix: '' }
}
// CIL[DOC-VECTOR type="context" content="purpose='Choose the correct comment syntax for CIL markers in a file'; No verified external callers; imports: .framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/cil-migrate-markers.ts:markerPrefix:function"]

// CIL[BEGIN stable_id="~/.framework/scripts/cil-migrate-markers.ts:SKIP_DIRS:constant" type="constant" identity="SKIP_DIRS" parent="~/.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-MACRO purpose="Define directories excluded from recursive file walking"]
// CIL[DOC-RESPONSIBILITY responsibility="Prevent scanning of build output and dependency folders"]
// CIL[DOC-CONTEXT module="cil-migrate-markers" layer="infrastructure" related_files=".framework/functions/_shared/cil.ts,.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Create a Set of directory names to ignore during traversal" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.devin', 'tmp', 'temp', '.assembled', '.netlify', '.next', '.output', 'coverage'])
// CIL[DOC-VECTOR type="context" content="purpose='Define directories excluded from recursive file walking'; No verified external callers; imports: .framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/cil-migrate-markers.ts:SKIP_DIRS:constant"]

// CIL[BEGIN stable_id="~/.framework/scripts/cil-migrate-markers.ts:walk:function" type="function" identity="walk" parent="~/.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-MACRO purpose="Recursively enumerate files under a directory"]
// CIL[DOC-RESPONSIBILITY responsibility="Yield absolute file paths while skipping symlinks and ignored directories"]
// CIL[DOC-CONTEXT module="cil-migrate-markers" layer="infrastructure" related_files=".framework/functions/_shared/cil.ts,.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-CONTRACT inputs="dir: string" outputs="AsyncGenerator<string>" errors="rethrows fs errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Read a directory, recurse into subdirectories and yield regular files" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir)
  for (const entry of entries) {
    const full = path.join(dir, entry)
    const stat = await fs.lstat(full)
    if (stat.isSymbolicLink()) continue
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(path.basename(full))) continue
      yield* walk(full)
    } else if (stat.isFile()) {
      yield full
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Recursively enumerate files under a directory'; No verified external callers; imports: .framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/cil-migrate-markers.ts:walk:function"]

// CIL[BEGIN stable_id="~/.framework/scripts/cil-migrate-markers.ts:rewriteFileMarkers:function" type="function" identity="rewriteFileMarkers" parent="~/.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-MACRO purpose="Rewrite legacy markers in a single file to stable CIL markers"]
// CIL[DOC-RESPONSIBILITY responsibility="Normalize chunk markers and persist or preview the updated file"]
// CIL[DOC-CONTEXT module="cil-migrate-markers" layer="infrastructure" related_files=".framework/functions/_shared/cil.ts,.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-CONTRACT inputs="absolutePath: string, repoRoot: string, dryRun: boolean" outputs="MarkerRewrite" errors="pushes error messages into result" side_effects="writes file when not in dry-run mode"]
// CIL[DOC-MICRO logic_summary="Scan each line, convert legacy and chunk-id markers to stable markers, then write if needed" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function rewriteFileMarkers(absolutePath: string, repoRoot: string, dryRun: boolean): Promise<MarkerRewrite> {
  const rel = path.relative(repoRoot, absolutePath)
  const canonical = toCanonicalPath(repoRoot, absolutePath)
  const content = await fs.readFile(absolutePath, 'utf-8')
  const lines = content.split('\n')
  const { prefix, suffix } = markerPrefix(absolutePath)
  const result: string[] = []
  const legacyToStable: Record<string, string> = {}
  let rewrites = 0
  const errors: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let matched = false

    for (const pattern of LEGACY_PATTERNS) {
      const beginMatch = line.match(pattern.begin)
      if (beginMatch) {
        const name = beginMatch[2].trim()
        const type = guessType(name)
        const stableId = generateStableId(canonical, name, type)
        legacyToStable[name] = stableId
        result.push(`${beginMatch[1].match(/^[ \t]*/)?.[0] || ''}${prefix}CIL[BEGIN stable_id="${stableId}"]${suffix}`)
        rewrites++
        matched = true
        break
      }
      const endMatch = line.match(pattern.end)
      if (endMatch) {
        const name = endMatch[2].trim()
        const stableId = legacyToStable[name] || generateStableId(canonical, name, guessType(name))
        result.push(`${endMatch[1].match(/^[ \t]*/)?.[0] || ''}${prefix}CIL[END stable_id="${stableId}"]${suffix}`)
        rewrites++
        matched = true
        break
      }
    }

    if (!matched) {
      // template: CIL[BEGIN stable_id="..." type="method" identity="..." parent="none"]
      const cilBegin = line.match(/(\s*)(\/\/|#|--|<!--)\s*CIL\[BEGIN\s+([^\]]+)\]/)
      if (cilBegin) {
        const attr = cilBegin[3]
        const stableId = attr.match(/stable_id="([^"]+)"/)?.[1]
        if (!attr.includes('chunk_id="') && stableId) {
          // Already-migrated stable marker — ensure it has type/identity/parent
          if (attr.includes('identity="') && attr.includes('type="') && attr.includes('parent="')) {
            result.push(line)
            continue
          }
          const { identity, type } = parseStableId(stableId)
          const parent = attr.match(/parent="([^"]+)"/)?.[1] || 'none'
          result.push(`${cilBegin[1]}${prefix}CIL[BEGIN stable_id="${stableId}" type="${type}" identity="${identity}" parent="${parent}"]${suffix}`)
          rewrites++
          continue
        }
        const chunkId = attr.match(/chunk_id="([^"]+)"/)?.[1]
        const identity = attr.match(/identity="([^"]+)"/)?.[1] || parseIdentityFromChunkId(chunkId)
        const type = attr.match(/type="([^"]+)"/)?.[1] || guessType(identity)
        const stableIdFromChunk = generateStableId(canonical, identity, type)
        if (chunkId) legacyToStable[chunkId] = stableIdFromChunk
        result.push(`${cilBegin[1]}${prefix}CIL[BEGIN stable_id="${stableIdFromChunk}" type="${type}" identity="${identity}" parent="none"]${suffix}`)
        rewrites++
        continue
      }
      const cilEnd = line.match(/(\s*)(\/\/|#|--|<!--)\s*CIL\[END\s+([^\]]+)\]/)
      if (cilEnd) {
        const attr = cilEnd[3]
        const stableId = attr.match(/stable_id="([^"]+)"/)?.[1]
        if (!attr.includes('chunk_id="') && stableId) {
          // Already-migrated stable end marker — keep as-is
          result.push(line)
          continue
        }
        const chunkId = attr.match(/chunk_id="([^"]+)"/)?.[1]
        const stableIdFromChunk = chunkId ? legacyToStable[chunkId] : undefined
        if (!stableIdFromChunk) {
          const identity = attr.match(/identity="([^"]+)"/)?.[1] || parseIdentityFromChunkId(chunkId)
          const type = attr.match(/type="([^"]+)"/)?.[1] || guessType(identity)
          result.push(`${cilEnd[1]}${prefix}CIL[END stable_id="${generateStableId(canonical, identity, type)}"${suffix}`)
        } else {
          result.push(`${cilEnd[1]}${prefix}CIL[END stable_id="${stableIdFromChunk}"]${suffix}`)
        }
        rewrites++
        continue
      }
      result.push(line)
    }
  }

  const newContent = result.join('\n')
  if (!dryRun && newContent !== content) {
    await fs.writeFile(absolutePath, newContent, 'utf-8')
  }
  return { file: rel, rewrites, errors }
}
// CIL[DOC-VECTOR type="context" content="purpose='Rewrite legacy markers in a single file to stable CIL markers'; No verified external callers; imports: .framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/cil-migrate-markers.ts:rewriteFileMarkers:function"]

// CIL[BEGIN stable_id="~/.framework/scripts/cil-migrate-markers.ts:main:function" type="function" identity="main" parent="~/.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-MACRO purpose="Walk a project tree and migrate legacy CIL markers to stable markers"]
// CIL[DOC-RESPONSIBILITY responsibility="Orchestrate file discovery, per-file marker rewriting and a summary report"]
// CIL[DOC-CONTEXT module="cil-migrate-markers" layer="infrastructure" related_files=".framework/functions/_shared/cil.ts,.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-CONTRACT inputs="process.argv flags" outputs="console report" errors="logs per-file errors to stderr" side_effects="updates marker comments in files unless in dry-run mode"]
// CIL[DOC-MICRO logic_summary="Parse CLI arguments, walk the project tree, call rewriteFileMarkers for each file and print a report" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function main() {
  const args = process.argv.slice(2)
  const repoRootArg = args.find(a => a.startsWith('--repo-root='))?.split('=')[1] || process.cwd()
  const projectPathArg = args.find(a => a.startsWith('--project-path='))?.split('=')[1] || ''
  const dryRun = args.includes('--dry-run')
  const repoRoot = path.resolve(repoRootArg)
  const projectDir = projectPathArg ? path.resolve(repoRoot, projectPathArg) : repoRoot

  const report: MarkerRewrite[] = []
  for await (const file of walk(projectDir)) {
    if (file.includes('node_modules') || file.includes('.git')) continue
    try {
      const res = await rewriteFileMarkers(file, repoRoot, dryRun)
      if (res.rewrites > 0) {
        if (dryRun) {
          console.log(`[dry-run] would rewrite ${res.rewrites} markers in ${res.file}`)
        } else {
          console.log(`rewrote ${res.rewrites} markers in ${res.file}`)
        }
        report.push(res)
      }
    } catch (err: any) {
      console.error(`error in ${file}:`, err.message)
      report.push({ file: path.relative(repoRoot, file), rewrites: 0, errors: [err.message] })
    }
  }

  const total = report.reduce((s, r) => s + r.rewrites, 0)
  const errorCount = report.filter(r => r.errors.length > 0).length
  console.log('\n--- report ---')
  console.log(`files touched: ${report.filter(r => r.rewrites > 0).length}`)
  console.log(`markers rewritten: ${total}`)
  console.log(`errors: ${errorCount}`)
}
// CIL[DOC-VECTOR type="context" content="purpose='Walk a project tree and migrate legacy CIL markers to stable markers'; No verified external callers; imports: .framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/cil-migrate-markers.ts:main:function"]

// CIL[BEGIN stable_id="~/.framework/scripts/cil-migrate-markers.ts:module_footer:module_footer" type="module_footer" identity="module_footer" parent="~/.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-MACRO purpose="Execute the main entry point and handle uncaught errors"]
// CIL[DOC-RESPONSIBILITY responsibility="Call main and exit with a non-zero code on failure"]
// CIL[DOC-CONTEXT module="cil-migrate-markers" layer="infrastructure" related_files=".framework/functions/_shared/cil.ts,.framework/scripts/cil-migrate-markers.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="prints to stderr and exits 1" side_effects="triggers top-level async main execution"]
// CIL[DOC-MICRO logic_summary="Invoke main and attach a catch handler that logs and exits" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
main().catch(err => {
  console.error(err)
  process.exit(1)
})
// CIL[DOC-VECTOR type="context" content="purpose='Execute the main entry point and handle uncaught errors'; No verified external callers; imports: .framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/scripts/cil-migrate-markers.ts:module_footer:module_footer"]
