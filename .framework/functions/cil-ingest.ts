// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Module header, imports and handler export for cil-ingest"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides shared imports and the main Netlify handler export"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="imported modules and the exported handler" errors="none at import time" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports shared modules and sets up the action dispatch handler" notable_decisions="Single handler routes all CIL ingestion actions"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="both"]
import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { create as adminCreate, update as adminUpdate } from './admin-data'
import { resolveTypeId } from './_shared/resolve-ids'
import { FileTreeNode, FileStatus, isSelectedPath, getFileStatus, updateTreeNodeStatus, updateTreeNodeByPath, buildFileTree, toCanonicalPath, generateStableId, parseStableId, computeContentHash, pipelineRank } from './_shared/cil'
import { extractIdentities } from './_shared/ast'
import * as ts from 'typescript'
import * as fs from 'fs'
import * as path from 'path'
// CIL[DOC-VECTOR type="context" content="purpose='Module header, imports and handler export for cil-ingest'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:collectselectedfiles:function" type="function" identity="collectSelectedFiles" parent="none"]
// CIL[DOC-MACRO purpose="Implements the collectSelectedFiles logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides collectSelectedFiles functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="tree: FileTreeNode | null, selectedPaths: string[], selectedExtensions: string[]" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (tree: FileTreeNode | null, selectedPaths: string[], selectedExtensions: string[]) and returns the collectSelectedFiles result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function collectSelectedFiles(tree: FileTreeNode | null, selectedPaths: string[], selectedExtensions: string[]): string[] {
  const files: string[] = []
  if (!tree) return files
  const walk = (node: FileTreeNode) => {
    if (node.type === 'file') {
      const isSelected = selectedPaths.length === 0 || selectedPaths.some(sp => node.path === sp || node.path.startsWith(sp + '/'))
      const extMatch = selectedExtensions.length === 0 || (node.extension && selectedExtensions.includes(node.extension))
      if (isSelected && extMatch) files.push(node.path)
    } else if (node.children) {
      for (const child of node.children) walk(child)
    }
  }
  walk(tree)
  return files
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the collectSelectedFiles logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:collectselectedfiles:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:ingestrequest:interface" type="interface" identity="IngestRequest" parent="none"]
// CIL[DOC-MACRO purpose="TypeScript interface defining IngestRequest"]
// CIL[DOC-RESPONSIBILITY responsibility="Describes the shape of IngestRequest"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields and types for IngestRequest" notable_decisions="Structural contract for IngestRequest"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface IngestRequest {
  project_id: string
  globs?: string[]
  exclude_globs?: string[]
  force_reprocess?: boolean
  file_path?: string
  selected_extensions?: string[]
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript interface defining IngestRequest'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:ingestrequest:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:sourceset:interface" type="interface" identity="SourceSet" parent="none"]
// CIL[DOC-MACRO purpose="TypeScript interface defining SourceSet"]
      // CIL[DOC-STABILITY stability="internal"]
      // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
      // CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-RESPONSIBILITY responsibility="Describes the shape of SourceSet"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields and types for SourceSet" notable_decisions="Structural contract for SourceSet"]
interface SourceSet {
  id: string
  name: string
  base_path: string
  globs?: string[]
  exclude_globs?: string[]
  layer?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript interface defining SourceSet'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:sourceset:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:discoveredfile:interface" type="interface" identity="DiscoveredFile" parent="none"]
// CIL[DOC-MACRO purpose="TypeScript interface defining DiscoveredFile"]
// CIL[DOC-RESPONSIBILITY responsibility="Describes the shape of DiscoveredFile"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields and types for DiscoveredFile" notable_decisions="Structural contract for DiscoveredFile"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface DiscoveredFile {
  file_path: string
  language: string
  size_bytes: number
  stored_hash: string
  line_count: number
  has_existing_markers: boolean
  existing_marker_names: string[]
  status: FileStatus
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript interface defining DiscoveredFile'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:discoveredfile:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:chunkproposal:interface" type="interface" identity="ChunkProposal" parent="none"]
// CIL[DOC-MACRO purpose="TypeScript interface defining ChunkProposal"]
// CIL[DOC-RESPONSIBILITY responsibility="Describes the shape of ChunkProposal"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields and types for ChunkProposal" notable_decisions="Structural contract for ChunkProposal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ChunkProposal {
  name: string
  line_start: number
  line_end: number
  chunk_type: string
  confidence: 'high' | 'low'
  confidence_score: number
  confidence_reasons: string
  existing_marker_match: boolean
  existing_marker_name: string
  code_preview: string
  token_count: number
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript interface defining ChunkProposal'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:chunkproposal:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:language_map:constant" type="constant" identity="LANGUAGE_MAP" parent="none"]
  // CIL[DOC-STABILITY stability="internal"]
  // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
  // CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-MACRO purpose="Constant LANGUAGE_MAP"]
// CIL[DOC-RESPONSIBILITY responsibility="Supplies the static value for LANGUAGE_MAP"]
// CIL[DOC-CONTRACT inputs="none" outputs="value of LANGUAGE_MAP" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Holds the static LANGUAGE_MAP value" notable_decisions="Static value used across cil-ingest"]
const LANGUAGE_MAP: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.sql': 'sql',
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.md': 'markdown',
  '.json': 'json',
  '.css': 'css',
  '.html': 'html',
  '.sh': 'shell',
}
// CIL[DOC-VECTOR type="context" content="purpose='Constant LANGUAGE_MAP'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:language_map:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:default_globs:constant" type="constant" identity="DEFAULT_GLOBS" parent="none"]
// CIL[DOC-MACRO purpose="Constant DEFAULT_GLOBS"]
// CIL[DOC-RESPONSIBILITY responsibility="Supplies the static value for DEFAULT_GLOBS"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="value of DEFAULT_GLOBS" errors="none" side_effects="none"]
  // CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-MICRO logic_summary="Holds the static DEFAULT_GLOBS value" notable_decisions="Static value used across cil-ingest"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
const DEFAULT_GLOBS = ['**/*.ts', '**/*.tsx', '**/*.sql']
// CIL[DOC-VECTOR type="context" content="purpose='Constant DEFAULT_GLOBS'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:default_globs:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:default_exclude:constant" type="constant" identity="DEFAULT_EXCLUDE" parent="none"]
// CIL[DOC-MACRO purpose="Constant DEFAULT_EXCLUDE"]
// CIL[DOC-RESPONSIBILITY responsibility="Supplies the static value for DEFAULT_EXCLUDE"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="value of DEFAULT_EXCLUDE" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Holds the static DEFAULT_EXCLUDE value" notable_decisions="Static value used across cil-ingest"]
  // CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
const DEFAULT_EXCLUDE = ['node_modules/**', '.git/**', '.assembled/**', 'dist/**', 'build/**', '.netlify/**', '**/*.min.js', '**/*.d.ts']
// CIL[DOC-VECTOR type="context" content="purpose='Constant DEFAULT_EXCLUDE'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:default_exclude:constant"]
  // CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:high_confidence_threshold:constant" type="constant" identity="HIGH_CONFIDENCE_THRESHOLD" parent="none"]
// CIL[DOC-MACRO purpose="Constant HIGH_CONFIDENCE_THRESHOLD"]
// CIL[DOC-RESPONSIBILITY responsibility="Supplies the static value for HIGH_CONFIDENCE_THRESHOLD"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="value of HIGH_CONFIDENCE_THRESHOLD" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Holds the static HIGH_CONFIDENCE_THRESHOLD value" notable_decisions="Static value used across cil-ingest"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const HIGH_CONFIDENCE_THRESHOLD = 0.80
// CIL[DOC-VECTOR type="context" content="purpose='Constant HIGH_CONFIDENCE_THRESHOLD'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:high_confidence_threshold:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:marker_start_re:constant" type="constant" identity="MARKER_START_RE" parent="none"]
// CIL[DOC-MACRO purpose="Regular expression constant MARKER_START_RE"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the matching pattern for MARKER_START_RE"]
  // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="value of MARKER_START_RE" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Compiles and stores the MARKER_START_RE regex pattern" notable_decisions="Static value used across cil-ingest"]
// CIL[DOC-STABILITY stability="stable"]
const MARKER_START_RE = /^\/\/\s*CIL\[BEGIN\s+stable_id="([^"]+)"[^\]]*\]\s*$/
// CIL[DOC-VECTOR type="context" content="purpose='Regular expression constant MARKER_START_RE'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:marker_start_re:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:marker_end_re:constant" type="constant" identity="MARKER_END_RE" parent="none"]
// CIL[DOC-MACRO purpose="Regular expression constant MARKER_END_RE"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the matching pattern for MARKER_END_RE"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="value of MARKER_END_RE" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Compiles and stores the MARKER_END_RE regex pattern" notable_decisions="Static value used across cil-ingest"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const MARKER_END_RE = /^\/\/\s*CIL\[END\s+stable_id="([^"]+)"[^\]]*\]\s*$/
// CIL[DOC-VECTOR type="context" content="purpose='Regular expression constant MARKER_END_RE'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:marker_end_re:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:proposal_start_re:constant" type="constant" identity="PROPOSAL_START_RE" parent="none"]
// CIL[DOC-MACRO purpose="Regular expression constant PROPOSAL_START_RE"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the matching pattern for PROPOSAL_START_RE"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="value of PROPOSAL_START_RE" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Compiles and stores the PROPOSAL_START_RE regex pattern" notable_decisions="Static value used across cil-ingest"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const PROPOSAL_START_RE = /^\/\*\*\s*─+\s*CHUNK_START:\s*PROPOSAL\s+(.+?)\s*─+\s*\*\/\s*$/
// CIL[DOC-VECTOR type="context" content="purpose='Regular expression constant PROPOSAL_START_RE'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:proposal_start_re:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:proposal_end_re:constant" type="constant" identity="PROPOSAL_END_RE" parent="none"]
// CIL[DOC-MACRO purpose="Regular expression constant PROPOSAL_END_RE"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the matching pattern for PROPOSAL_END_RE"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="value of PROPOSAL_END_RE" errors="none" side_effects="none"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MICRO logic_summary="Compiles and stores the PROPOSAL_END_RE regex pattern" notable_decisions="Static value used across cil-ingest"]
const PROPOSAL_END_RE   = /^\/\*\*\s*─+\s*CHUNK_END:\s*PROPOSAL\s+(.+?)\s*─+\s*\*\/\s*$/
// CIL[DOC-VECTOR type="context" content="purpose='Regular expression constant PROPOSAL_END_RE'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:proposal_end_re:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:rejected_start_re:constant" type="constant" identity="REJECTED_START_RE" parent="none"]
// CIL[DOC-MACRO purpose="Regular expression constant REJECTED_START_RE"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the matching pattern for REJECTED_START_RE"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="value of REJECTED_START_RE" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Compiles and stores the REJECTED_START_RE regex pattern" notable_decisions="Static value used across cil-ingest"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const REJECTED_START_RE = /^\/\*\*\s*─+\s*CHUNK_START:\s*REJECTED\s+(.+?)\s*─+\s*\*\/\s*$/
// CIL[DOC-VECTOR type="context" content="purpose='Regular expression constant REJECTED_START_RE'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:rejected_start_re:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:rejected_end_re:constant" type="constant" identity="REJECTED_END_RE" parent="none"]
// CIL[DOC-MACRO purpose="Regular expression constant REJECTED_END_RE"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the matching pattern for REJECTED_END_RE"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="value of REJECTED_END_RE" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Compiles and stores the REJECTED_END_RE regex pattern" notable_decisions="Static value used across cil-ingest"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const REJECTED_END_RE   = /^\/\*\*\s*─+\s*CHUNK_END:\s*REJECTED\s+(.+?)\s*─+\s*\*\/\s*$/
// CIL[DOC-VECTOR type="context" content="purpose='Regular expression constant REJECTED_END_RE'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:rejected_end_re:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:any_marker_re:constant" type="constant" identity="ANY_MARKER_RE" parent="none"]
// CIL[DOC-MACRO purpose="Regular expression constant ANY_MARKER_RE"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the matching pattern for ANY_MARKER_RE"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="value of ANY_MARKER_RE" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Compiles and stores the ANY_MARKER_RE regex pattern" notable_decisions="Static value used across cil-ingest"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const ANY_MARKER_RE = /^\/\/\s*CIL\[(BEGIN|END)\b.*stable_id="([^"]+)"[^\]]*\]/
// CIL[DOC-VECTOR type="context" content="purpose='Regular expression constant ANY_MARKER_RE'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:any_marker_re:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:chunkstartmarker:function" type="function" identity="chunkStartMarker" parent="none"]
// CIL[DOC-MACRO purpose="Implements the chunkStartMarker logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides chunkStartMarker functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="stableId: string, chunkType: string, identity: string, parentStableId: string" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (stableId: string, chunkType: string, identity: string, parentStableId: string) and returns the chunkStartMarker result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function chunkStartMarker(stableId: string, chunkType: string, identity: string, parentStableId: string): string {
  return `// CIL[BEGIN stable_id="${stableId}" type="${chunkType || 'unknown'}" identity="${identity || 'unknown'}" parent="${parentStableId || 'none'}"]`
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the chunkStartMarker logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:chunkstartmarker:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:chunkendmarker:function" type="function" identity="chunkEndMarker" parent="none"]
// CIL[DOC-MACRO purpose="Implements the chunkEndMarker logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides chunkEndMarker functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="stableId: string" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (stableId: string) and returns the chunkEndMarker result" notable_decisions="See source for implementation details"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
function chunkEndMarker(stableId: string): string {
  return `// CIL[END stable_id="${stableId}"]`
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the chunkEndMarker logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:chunkendmarker:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:proposalstartmarker:function" type="function" identity="proposalStartMarker" parent="none"]
// CIL[DOC-MACRO purpose="Implements the proposalStartMarker logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides proposalStartMarker functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="name: string" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (name: string) and returns the proposalStartMarker result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function proposalStartMarker(name: string): string {
  return ``
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the proposalStartMarker logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:proposalstartmarker:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:proposalendmarker:function" type="function" identity="proposalEndMarker" parent="none"]
// CIL[DOC-MACRO purpose="Implements the proposalEndMarker logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides proposalEndMarker functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="name: string" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (name: string) and returns the proposalEndMarker result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function proposalEndMarker(name: string): string {
  return ``
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the proposalEndMarker logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:proposalendmarker:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:rejectedstartmarker:function" type="function" identity="rejectedStartMarker" parent="none"]
// CIL[DOC-MACRO purpose="Implements the rejectedStartMarker logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides rejectedStartMarker functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTRACT inputs="name: string" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (name: string) and returns the rejectedStartMarker result" notable_decisions="See source for implementation details"]
function rejectedStartMarker(name: string): string {
  return ``
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the rejectedStartMarker logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:rejectedstartmarker:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:rejectedendmarker:function" type="function" identity="rejectedEndMarker" parent="none"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-MACRO purpose="Implements the rejectedEndMarker logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides rejectedEndMarker functionality"]
// CIL[DOC-CONTRACT inputs="name: string" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (name: string) and returns the rejectedEndMarker result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function rejectedEndMarker(name: string): string {
  return ``
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the rejectedEndMarker logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:rejectedendmarker:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:markerinsertidx:function" type="function" identity="markerInsertIdx" parent="none"]
// CIL[DOC-MACRO purpose="Implements the markerInsertIdx logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides markerInsertIdx functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="_lines: string[], lineStart: number" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (_lines: string[], lineStart: number) and returns the markerInsertIdx result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function markerInsertIdx(_lines: string[], lineStart: number): number {
  return lineStart - 1 
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the markerInsertIdx logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:markerinsertidx:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:markerendinsertidx:function" type="function" identity="markerEndInsertIdx" parent="none"]
// CIL[DOC-MACRO purpose="Implements the markerEndInsertIdx logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides markerEndInsertIdx functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="lines: string[], lineStart: number, lineEnd: number" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (lines: string[], lineStart: number, lineEnd: number) and returns the markerEndInsertIdx result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function markerEndInsertIdx(lines: string[], lineStart: number, lineEnd: number): number {
  if (lineEnd > lines.length) return lines.length
  if (lineEnd - lineStart <= 0) return lineEnd
  const startLine = lines[lineStart - 1] || ''
  const startIndent = (startLine.match(/^(\s*)/)?.[1] || '').length
  const isBraceOnly = (line: string, maxIndent: number) => {
    const indent = (line.match(/^(\s*)/)?.[1] || '').length
    return /^\s*\}\s*$/.test(line) && indent <= maxIndent
  }
  // search backward from lineEnd for the closing brace of this block
  const endCap = Math.min(lineEnd - 1, lines.length - 1)
  for (let i = endCap; i >= lineStart - 1; i--) {
    if (isBraceOnly(lines[i], startIndent)) return i + 1
  }
  return lineEnd
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the markerEndInsertIdx logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:markerendinsertidx:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:modulenamefrompath:function" type="function" identity="moduleNameFromPath" parent="none"]
// CIL[DOC-MACRO purpose="Implements the moduleNameFromPath logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides moduleNameFromPath functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="relPath: string" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (relPath: string) and returns the moduleNameFromPath result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function moduleNameFromPath(relPath: string): string {
  return path.basename(relPath, path.extname(relPath))
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the moduleNameFromPath logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:modulenamefrompath:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:estimatetokens:function" type="function" identity="estimateTokens" parent="none"]
// CIL[DOC-MACRO purpose="Implements the estimateTokens logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides estimateTokens functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="text: string" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (text: string) and returns the estimateTokens result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the estimateTokens logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:estimatetokens:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:detectlanguage:function" type="function" identity="detectLanguage" parent="none"]
// CIL[DOC-MACRO purpose="Implements the detectLanguage logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides detectLanguage functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="filePath: string" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (filePath: string) and returns the detectLanguage result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  return LANGUAGE_MAP[ext] || 'unknown'
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the detectLanguage logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:detectlanguage:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:matchesglob:function" type="function" identity="matchesGlob" parent="none"]
// CIL[DOC-MACRO purpose="Implements the matchesGlob logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides matchesGlob functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="filePath: string, pattern: string" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (filePath: string, pattern: string) and returns the matchesGlob result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function matchesGlob(filePath: string, pattern: string): boolean {
  const regexStr = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '__DOUBLESTAR__')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]')
    .replace(/__DOUBLESTAR__/g, '.*')
  const re = new RegExp('^' + regexStr + '$')
  return re.test(filePath)
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the matchesGlob logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:matchesglob:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:shouldinclude:function" type="function" identity="shouldInclude" parent="none"]
// CIL[DOC-MACRO purpose="Implements the shouldInclude logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides shouldInclude functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="filePath: string, globs: string[], excludeGlobs: string[]" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (filePath: string, globs: string[], excludeGlobs: string[]) and returns the shouldInclude result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function shouldInclude(filePath: string, globs: string[], excludeGlobs: string[]): boolean {
  const normalised = filePath.replace(/\\/g, '/')
  const included = globs.some(g => matchesGlob(normalised, g) || matchesGlob(path.basename(normalised), g))
  const excluded = excludeGlobs.some(g => matchesGlob(normalised, g))
  return included && !excluded
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the shouldInclude logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:shouldinclude:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:walkedfile:interface" type="interface" identity="WalkedFile" parent="none"]
// CIL[DOC-MACRO purpose="TypeScript interface defining WalkedFile"]
// CIL[DOC-RESPONSIBILITY responsibility="Describes the shape of WalkedFile"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields and types for WalkedFile" notable_decisions="Structural contract for WalkedFile"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface WalkedFile {
  path: string
  absPath: string
  size: number
  extension: string
  language: string
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript interface defining WalkedFile'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:walkedfile:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:walkdir:function" type="function" identity="walkDir" parent="none"]
// CIL[DOC-MACRO purpose="Implements the walkDir logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides walkDir functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="dir: string, base: string, globs: string[], excludeGlobs: string[]" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (dir: string, base: string, globs: string[], excludeGlobs: string[]) and returns the walkDir result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function walkDir(dir: string, base: string, globs: string[], excludeGlobs: string[]): WalkedFile[] {
  const results: WalkedFile[] = []
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return results
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    const rel = path.relative(base, full).replace(/\\/g, '/')
    if (entry.isDirectory()) {
      
      if (excludeGlobs.some(g => matchesGlob(rel, g) || matchesGlob(rel + '/', g))) continue
      results.push(...walkDir(full, base, globs, excludeGlobs))
    } else if (entry.isFile()) {
      if (shouldInclude(rel, globs, excludeGlobs)) {
        try {
          const size = fs.statSync(full).size
          const extension = path.extname(rel).toLowerCase()
          results.push({ path: rel, absPath: full, size, extension, language: detectLanguage(rel) })
        } catch {
        }
      }
    }
  }
  return results
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the walkDir logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:walkdir:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:parseexistingmarkers:function" type="function" identity="parseExistingMarkers" parent="none"]
  // CIL[DOC-STABILITY stability="internal"]
  // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
  // CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-MACRO purpose="Implements the parseExistingMarkers logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides parseExistingMarkers functionality"]
// CIL[DOC-CONTRACT inputs="lines: string[]" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (lines: string[]) and returns the parseExistingMarkers result" notable_decisions="See source for implementation details"]
function parseExistingMarkers(lines: string[]): { stable_id: string; line_start: number; line_end: number }[] {
  const markers: { stable_id: string; line_start: number; line_end: number }[] = []
  const stack: { stable_id: string; line_start: number }[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const startMatch = line.match(MARKER_START_RE)
    const endMatch = line.match(MARKER_END_RE)
    if (startMatch) {
      stack.push({ stable_id: startMatch[1], line_start: i + 1 })
    } else if (endMatch && stack.length > 0) {
      const opened = stack.pop()!
      markers.push({ stable_id: opened.stable_id, line_start: opened.line_start, line_end: i + 1 })
    }
  }
  return markers
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the parseExistingMarkers logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:parseexistingmarkers:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:extractedjsdoc:interface" type="interface" identity="ExtractedJsDoc" parent="none"]
// CIL[DOC-MACRO purpose="TypeScript interface defining ExtractedJsDoc"]
// CIL[DOC-RESPONSIBILITY responsibility="Describes the shape of ExtractedJsDoc"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields and types for ExtractedJsDoc" notable_decisions="Structural contract for ExtractedJsDoc"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ExtractedJsDoc {
  raw: string          
  description: string  
  params: string       
  returns: string      
  throws: string       
  side_effects: string 
  stability: string    
  macro: string        
  micro: string        
  input_spec: string   
  output_spec: string  
  
  called_by: string    
  calls: string        
  tags: string         
  complexity: string   
  error_handling: string 
  depends_on: string   
  depended_by: string  
  see_also: string     
  module: string       
  audience: string     
  layer: string        
  is_cil_generated: boolean 
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript interface defining ExtractedJsDoc'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:extractedjsdoc:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:extractjsdocabove:function" type="function" identity="extractJsDocAbove" parent="none"]
// CIL[DOC-MACRO purpose="Implements the extractJsDocAbove logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides extractJsDocAbove functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="lines: string[], lineStart: number" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (lines: string[], lineStart: number) and returns the extractJsDocAbove result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function extractJsDocAbove(lines: string[], lineStart: number): ExtractedJsDoc | null {
  
  let endIdx = lineStart - 2 
  while (endIdx >= 0) {
    const t = lines[endIdx].trim()
    if (t === '') { endIdx--; continue }
    
    if (/CHUNK_(?:START|END):/.test(t)) { endIdx--; continue }
    break
  }
  if (endIdx < 0) return null

  const endTrimmed = lines[endIdx].trim()
  
  if (!endTrimmed.endsWith('*/')) return null

  let startIdx = endIdx
  for (let i = endIdx; i >= 0; i--) {
    const t = lines[i].trim()
    if (t.startsWith('/**') || t.startsWith('/*')) { startIdx = i; break }
    if (i === 0) return null
  }

  const bodyLines: string[] = []
  for (let i = startIdx; i <= endIdx; i++) {
    const raw = lines[i]
    const stripped = raw.trim()
      .replace(/^\/\*\*?/, '').replace(/\*\/$/, '')  
      .replace(/^\*\s?/, '')                           
      .trim()
    bodyLines.push(stripped)
  }

  const raw = bodyLines.join('\n').trim()
  if (!raw) return null

  const get = (tags: string[], preserveLines = false): string => {
    for (const tag of tags) {
      const re = new RegExp(`@${tag}\\s+(.+?)(?=\\n@|$)`, 'si')
      const m = raw.match(re)
      if (!m) continue
      if (preserveLines) {
        // Multi-entry specs (one parameter per line) must keep their line
        // breaks — splitParameterList in cil-doc splits on ',' and '\n', so
        // flattening merges all params into a single unparseable blob.
        return m[1].split('\n').map(s => s.trim()).filter(Boolean).join('\n')
      }
      return m[1].replace(/\n\s*\*?\s*/g, ' ').trim()
    }
    return ''
  }

  const descMatch = raw.match(/^([\s\S]*?)(?=@\w|$)/)
  const description = descMatch ? descMatch[1].trim() : ''

  const paramLines: string[] = []
  for (const m of raw.matchAll(/@param\s+(.+?)(?=\n@|\n\n|$)/gsi)) {
    paramLines.push(m[1].replace(/\n\s*\*?\s*/g, ' ').trim())
  }

  return {
    raw,
    description,
    params: paramLines.join('\n'),
    returns: get(['returns', 'return']),
    throws: get(['throws', 'throw']),
    side_effects: get(['sideEffects', 'side-effects', 'sideeffects']),
    stability: get(['stability']),
    macro: get(['macro']),
    micro: get(['micro']),
    input_spec: get(['inputSpec', 'inputs', 'input_spec'], true),
    output_spec: get(['outputSpec', 'outputs', 'output_spec'], true),
    
    called_by: get(['calledBy', 'called_by']),
    calls: get(['calls']),
    tags: get(['tags']),
    complexity: get(['complexity']),
    error_handling: get(['errorHandling', 'error_handling']),
    depends_on: get(['dependsOn', 'depends_on']),
    depended_by: get(['dependedBy', 'depended_by']),
    see_also: get(['seeAlso', 'see_also']),
    module: get(['module']),
    audience: get(['audience']),
    layer: get(['layer']),
    is_cil_generated: raw.includes('@cil-generated'),
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the extractJsDocAbove logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:extractjsdocabove:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:extractfilejsdoc:function" type="function" identity="extractFileJsDoc" parent="none"]
// CIL[DOC-MACRO purpose="Implements the extractFileJsDoc logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides extractFileJsDoc functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="lines: string[]" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (lines: string[]) and returns the extractFileJsDoc result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function extractFileJsDoc(lines: string[]): string {
  let inBlock = false
  const bodyLines: string[] = []
  for (const line of lines) {
    const t = line.trim()
    if (!inBlock) {
      if (t.startsWith('/**') || t.startsWith('/*')) { inBlock = true; bodyLines.push(t); continue }
      if (t !== '' && !t.startsWith('//')) break  
    } else {
      bodyLines.push(t)
      if (t.endsWith('*/')) break
    }
  }
  return bodyLines.join('\n')
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the extractFileJsDoc logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:extractfilejsdoc:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:rawproposal:interface" type="interface" identity="RawProposal" parent="none"]
// CIL[DOC-MACRO purpose="TypeScript interface defining RawProposal"]
// CIL[DOC-RESPONSIBILITY responsibility="Describes the shape of RawProposal"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields and types for RawProposal" notable_decisions="Structural contract for RawProposal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface RawProposal {
  name: string
  stable_id: string
  parent_stable_id: string
  line_start: number
  line_end: number
  marker_line_end: number
  chunk_type: string
  confidence_score: number
  confidence_reasons: string[]
  existing_jsdoc?: ExtractedJsDoc | null
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript interface defining RawProposal'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:rawproposal:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:proposechunksfromsource:function" type="function" identity="proposeChunksFromSource" parent="none"]
// CIL[DOC-MACRO purpose="Implements the proposeChunksFromSource logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides proposeChunksFromSource functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="content: string, lines: string[], language: string, canonicalPath: string" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs (content: string, lines: string[], language: string, canonicalPath: string) and returns the proposeChunksFromSource result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function proposeChunksFromSource(content: string, lines: string[], language: string, canonicalPath: string): RawProposal[] {
  const proposals: RawProposal[] = []
  if (['typescript', 'typescriptreact', 'javascript', 'javascriptreact'].includes(language)) {


    let headerStart = -1


    let headerEnd = -1

    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim()
      if (t.startsWith('import')) {
        if (headerStart === -1) headerStart = i
        headerEnd = i
        continue
      }
      if (t === '' && headerStart !== -1) continue
      if (headerStart !== -1) break
    }
    const scriptKind =
      language === 'typescript' ? ts.ScriptKind.TS :
      language === 'typescriptreact' ? ts.ScriptKind.TSX :
      language === 'javascript' ? ts.ScriptKind.JS :
      ts.ScriptKind.JSX
    const sourceFile = ts.createSourceFile(canonicalPath, content, ts.ScriptTarget.Latest, true, scriptKind)
    const identities = extractIdentities(sourceFile, canonicalPath)
    const baseScore: Record<string, number> = {
      function: 0.92,
      hook: 0.94,
      component: 0.94,
      class: 0.90,
      method: 0.85,
      interface: 0.90,
      type: 0.88,
      variable: 0.70,
      constant: 0.85,
      module_header: 0.99,
    }
    for (const identity of identities) {
      if (identity.identity === 'file' && identity.type === 'file') continue
      const line = lines[identity.line_start - 1] || ''
      const lineCount = identity.line_end - identity.line_start + 1


      let score = baseScore[identity.type] || 0.70

      const reasons: string[] = []
      if (line.includes('export')) { score += 0.05; reasons.push('exported symbol') }
      const existingJsDoc = extractJsDocAbove(lines, identity.line_start)
      if (existingJsDoc) { score += 0.10; reasons.push('has JSDoc') }
      if (lineCount > 200) { score -= 0.10; reasons.push('very large (>200 lines)') }
      if (['function', 'hook', 'component'].includes(identity.type) && !line.match(/function\s+\w+/) && !line.match(/class\s+\w+/) && !line.match(/interface\s+\w+/)) {
        score -= 0.05; reasons.push('arrow/assigned function')
      }

      score = Math.min(0.99, Math.max(0.1, score))
      const isModuleHeader = identity.identity === 'module_header'
      if (isModuleHeader && headerStart === -1) continue
      const lineStart = isModuleHeader ? headerStart + 1 : identity.line_start
      const endLine = isModuleHeader ? headerEnd + 1 : identity.line_end
      const markerEndLine = endLine
      proposals.push({
        name: identity.identity,
        stable_id: generateStableId(canonicalPath, identity.identity, identity.type),
        parent_stable_id: identity.parent,
        line_start: lineStart,
        line_end: endLine,
        marker_line_end: markerEndLine,
        chunk_type: identity.type,
        confidence_score: score,
        confidence_reasons: reasons,
        existing_jsdoc: existingJsDoc,
      })
    }
  } else {


    let jsDocStart = -1, jsDocEnd = -1

    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim()
      if (t === '') continue
      if ((t.startsWith('/**') || t.startsWith('/*')) && jsDocStart === -1) {
        jsDocStart = i
      } else if (jsDocStart !== -1 && t.endsWith('*/') && jsDocEnd === -1) {
        jsDocEnd = i
      } else if (jsDocStart === -1 && !t.startsWith('//') && !t.startsWith('/*')) {
        break
      }
    }


    const headerStart = jsDocStart >= 0 ? jsDocStart : 0


    let headerEnd = jsDocEnd >= 0 ? jsDocEnd : headerStart - 1


    const DECL_RE = /^(?:export\s+)?(?:async\s+)?(?:function|class|interface|const|let|var)\s+\w+/
    const EXPORT_DECL_RE = /^export\s+(?:default\s+)?(?:async\s+)?(?:function|class|interface|type|const|let|var)\s+\w+/
    const startScan = Math.max(headerEnd + 1, 0)

    for (let i = startScan; i < lines.length; i++) {
      const t = lines[i].trim()
      if (t === '' || t.startsWith('//')) continue
      if (t.startsWith('import')) continue
      if (EXPORT_DECL_RE.test(lines[i]) || DECL_RE.test(lines[i])) {
        headerEnd = i - 1
        break
      }
    }


    while (headerEnd > headerStart && lines[headerEnd].trim() === '') {
      headerEnd--
    }

    if (headerEnd >= headerStart) {
      proposals.push({
        name: '__module_header__',
        stable_id: generateStableId(canonicalPath, '__module_header__', 'module_header'),
        parent_stable_id: canonicalPath,
        line_start: headerStart + 1,
        line_end: headerEnd + 1,
        marker_line_end: headerEnd + 1,
        chunk_type: 'module_header',
        confidence_score: 0.99,
        confidence_reasons: ['file-level JSDoc, imports, and module setup'],
        existing_jsdoc: null,
      })
    }

    const scanStart = headerEnd >= 0 ? headerEnd + 1 : 0

    const patterns: { re: RegExp; type: string; baseScore: number; nameGroup: number }[] = [
      { re: /^export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)/m, type: 'function', baseScore: 0.92, nameGroup: 1 },
      { re: /^export\s+const\s+(\w+)\s*[=:]/m, type: 'constant', baseScore: 0.85, nameGroup: 1 },
      { re: /^export\s+(?:let|var)\s+(\w+)\s*[=:]/m, type: 'constant', baseScore: 0.82, nameGroup: 1 },
      { re: /^export\s+(?:default\s+)?(?:abstract\s+)?class\s+(\w+)/m, type: 'class', baseScore: 0.90, nameGroup: 1 },
      { re: /^export\s+interface\s+(\w+)/m, type: 'interface', baseScore: 0.90, nameGroup: 1 },
      { re: /^export\s+type\s+(\w+)/m, type: 'type', baseScore: 0.88, nameGroup: 1 },
      { re: /^(?:async\s+)?function\s+(\w+)/m, type: 'function', baseScore: 0.78, nameGroup: 1 },
      { re: /^(?:abstract\s+)?class\s+(\w+)/m, type: 'class', baseScore: 0.80, nameGroup: 1 },
      { re: /^interface\s+(\w+)/m, type: 'interface', baseScore: 0.80, nameGroup: 1 },
      { re: /^type\s+(\w+)\s*=/m, type: 'type', baseScore: 0.78, nameGroup: 1 },
      { re: /^(?:const|let|var)\s+(\w+)\s*[=:]/m, type: 'constant', baseScore: 0.70, nameGroup: 1 },
    ]



    let lineIdx = scanStart

    while (lineIdx < lines.length) {
      const line = lines[lineIdx]


      let matched = false


      for (const { re, type, baseScore, nameGroup } of patterns) {
        const m = line.match(re)
        if (m) {
          const name = m[nameGroup]
          if (!name) { lineIdx++; break }



          let braceDepth = 0



          let parenDepth = 0



          let angleDepth = 0



          let endLine = lineIdx



          let foundOpen = false



          let inString = false



          let stringChar = ''


          for (let j = lineIdx; j < Math.min(lines.length, lineIdx + 500); j++) {
            const l = lines[j]


            let inLineComment = false



            let inBlockComment = false

            for (let ci = 0; ci < l.length; ci++) {
              const c = l[ci]
              const next = l[ci + 1]
              const prev = l[ci - 1]

              if (inString) {
                if (c === stringChar && prev !== '\\') inString = false
                continue
              }

              if (inLineComment) continue
              if (inBlockComment) {
                if (c === '*' && next === '/') { inBlockComment = false; ci++ }
                continue
              }

              if (c === '/' && next === '/') { inLineComment = true; ci++; continue }
              if (c === '/' && next === '*') { inBlockComment = true; ci++; continue }

              if (c === '"' || c === "'") { inString = true; stringChar = c; continue }
              if (c === '`') { inString = true; stringChar = '`'; continue }

              if (c === '(') { parenDepth++; continue }
              if (c === ')') { parenDepth--; continue }
              if (c === '<' && prev !== '=' && next !== '=') { angleDepth++; continue }
              if (c === '>' && prev !== '=' && next !== '=') { angleDepth--; continue }

              if (c === '{') {
                if (!foundOpen && (parenDepth !== 0 || angleDepth !== 0)) {
                  continue
                }
                braceDepth++; foundOpen = true
              }
              if (c === '}') {
                if (!foundOpen) continue
                braceDepth--
              }
            }



            if (foundOpen && braceDepth === 0) {
              endLine = j
              break
            }
          }








          const lineCount = endLine - lineIdx + 1
          if (lineCount < 3) { lineIdx++; matched = true; break }

          const confidenceReasons: string[] = []


          let score = baseScore

          const existingJsDoc = extractJsDocAbove(lines, lineIdx + 1)

          if (line.includes('export')) { score += 0.05; confidenceReasons.push('exported symbol') }
          if (existingJsDoc) { score += 0.10; confidenceReasons.push('has JSDoc') }
          if (lineCount > 200) { score -= 0.10; confidenceReasons.push('very large (>200 lines)') }
          if (!line.match(/function\s+\w+/) && !line.match(/class\s+\w+/) && !line.match(/interface\s+\w+/)) {
            score -= 0.05; confidenceReasons.push('arrow/assigned function')
          }


          score = Math.min(0.99, Math.max(0.1, score))

          proposals.push({
            name,
            stable_id: generateStableId(canonicalPath, name, type),
            parent_stable_id: canonicalPath,
            line_start: lineIdx + 1,
            line_end: endLine + 1,
            marker_line_end: endLine + 1,
            chunk_type: type,
            confidence_score: score,
            confidence_reasons: confidenceReasons,
            existing_jsdoc: existingJsDoc,
          })

          lineIdx = endLine + 1
          matched = true
          break
        }
      }


      if (!matched) lineIdx++
    }

  }

  const deduped: RawProposal[] = []
  for (const p of proposals.sort((a, b) => b.confidence_score - a.confidence_score)) {
    const overlaps = deduped.some(d =>
      Math.max(d.line_start, p.line_start) <= Math.min(d.line_end, p.line_end)
    )
    if (!overlaps) deduped.push(p)
  }

  const sorted = deduped.sort((a, b) => a.line_start - b.line_start)

  if (sorted.length === 0) return []

  for (let i = sorted.length - 1; i >= 0; i--) {
    const curr = sorted[i]
    const prevEnd = i > 0 ? sorted[i - 1].marker_line_end : 0


    let foundComment = false



    let candidateStart = curr.line_start

    for (let j = curr.line_start - 2; j >= prevEnd; j--) {
      const t = lines[j].trim()
      if (t === '') continue 
      if (t.startsWith('/**') || t.startsWith('/*') || t.startsWith('*')) {
        foundComment = true
        candidateStart = j + 1
        continue
      }
      break
    }


    if (foundComment) curr.line_start = candidateStart
  }

  sorted[0].line_start = 1

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]
    if (curr.line_start > prev.line_end + 1) {
      prev.line_end = curr.line_start - 1
    }
  }

  const last = sorted[sorted.length - 1]
  if (last.line_end < lines.length) {
    last.line_end = lines.length
  }

  return sorted
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the proposeChunksFromSource logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:proposechunksfromsource:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:pass1discover:function" type="function" identity="pass1Discover" parent="none"]
// CIL[DOC-MACRO purpose="Implements the pass1Discover logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides pass1Discover functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="ctx: any, projectId: string, repoPath: string, globs: string[], excludeGlobs: string[], _forceReprocess: boolean, sourceSets?: SourceSet[]" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="executes database queries and updates and reads files from disk"]
// CIL[DOC-MICRO logic_summary="Processes inputs (arguments as defined in source) and returns the pass1Discover result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
async function pass1Discover(
  ctx: any,
  projectId: string,
  repoPath: string,
  globs: string[],
  excludeGlobs: string[],
  _forceReprocess: boolean,
  sourceSets?: SourceSet[]
): Promise<{ files_discovered: number; errors: string[]; file_tree: FileTreeNode }> {
  const errors: string[] = []
  let filesDiscovered = 0

  const discoveryTargets: { sourceSetId?: string; layer?: string; basePath: string; globs: string[]; excludeGlobs: string[] }[] = []
  if (sourceSets && sourceSets.length > 0) {
    for (const ss of sourceSets) {
      const basePath = path.isAbsolute(ss.base_path) ? ss.base_path : path.join(repoPath, ss.base_path)
      discoveryTargets.push({
        sourceSetId: ss.id,
        layer: ss.layer || 'app-specific',
        basePath,
        globs: ss.globs && ss.globs.length > 0 ? ss.globs : globs,
        excludeGlobs: ss.exclude_globs && ss.exclude_globs.length > 0 ? ss.exclude_globs : excludeGlobs,
      })
    }
  } else {
    discoveryTargets.push({ basePath: repoPath, globs, excludeGlobs })
  }

  const treeRecords: { file_path: string; language: string; status?: FileStatus; extension: string }[] = []
  const newRows: any[] = []

  const fileTypeId = await resolveTypeId('item', 'cil_file')
  const { data: projItem } = await adminDb
    .from('items').select('id, data').eq('id', projectId).maybeSingle()
  const versionId = projItem?.data?.active_version_id || projItem?.data?.default_version_id || 'default'

  const { data: existingFiles } = await adminDb
    .from('items')
    .select('id, title, data')
    .filter('data->>project_id', 'eq', projectId)
    .filter('data->>kb_type', 'eq', 'cil_file')
    .eq('is_active', true)
  const existingPaths = new Set<string>(
    (existingFiles || []).map((f: any) => f.data?.file_path || f.title).filter(Boolean)
  )

  for (const target of discoveryTargets) {
    const files = walkDir(target.basePath, target.basePath, target.globs, target.excludeGlobs)
    filesDiscovered += files.length
    for (const file of files) {
      treeRecords.push({
        file_path: file.path,
        language: file.language,
        extension: file.extension,
      })

      if (!existingPaths.has(file.path)) {
        const absPath = path.join(repoPath, file.path)
        const content = fs.readFileSync(absPath, 'utf-8')
        const contentHash = computeContentHash(content)
        const canonical = toCanonicalPath(repoPath, absPath)
        newRows.push({
          type_id: fileTypeId,
          account_id: ctx.accountId,
          title: file.path,
          status: 'active',
          is_active: true,
          design_schema: {},
          validation_schema: {},
          created_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          data: {
            kb_type: 'cil_file',
            project_id: projectId,
            file_path: file.path,
            stable_id: canonical,
            version_id: versionId,
            language: file.language,
            extension: file.extension,
            stored_hash: null,
            file_hash: contentHash,
            content_hash: contentHash,
            has_existing_markers: false,
            existing_marker_names: [],
            existing_marker_count: 0,
            line_count: 0,
            status: '0-discovered',
            ingestion_pass: 1,
            chunk_count: 0,
            is_dead_code: false,
            git_last_commit: null,
            existing_marker_agreement_count: 0,
            existing_marker_disagreement_count: 0,
          },
        })
      }
    }
  }

  for (let i = 0; i < newRows.length; i += 50) {
    const batch = newRows.slice(i, i + 50)
    const { error: insertErr } = await adminDb.from('items').insert(batch)
    if (insertErr) errors.push(`batch insert failed: ${insertErr.message}`)
  }

  const fileTree = buildFileTree(treeRecords)

  if (projItem) {
    const fileStatuses: Record<string, string> = { ...(projItem.data?.file_statuses || {}) }
    for (const r of treeRecords) {
      if (!fileStatuses[r.file_path]) fileStatuses[r.file_path] = '0-discovered'
    }
    const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: projItem.id } }
    await adminUpdate(updateCtx, {
      data: {
        ...projItem.data,
        file_tree: fileTree,
        file_statuses: fileStatuses,
        ingestion_status: 'in_progress',
        file_count: Object.keys(fileStatuses).length,
        last_ingested_at: new Date().toISOString(),
      },
    }).catch(() => { /* non-fatal */ })
  }

  return {
    files_discovered: filesDiscovered,
    errors,
    file_tree: fileTree,
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the pass1Discover logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:pass1discover:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:pass2chunk:function" type="function" identity="pass2Chunk" parent="none"]
// CIL[DOC-MACRO purpose="Implements the pass2Chunk logic"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides pass2Chunk functionality"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="ctx: any, projectId: string, repoPath: string, globs: string[], excludeGlobs: string[], forceReprocess: boolean, filePath?: string, selectedPaths?: string[], selectedExtensions?: string[]" outputs="return value as defined in source" errors="throws on invalid inputs" side_effects="executes database queries and updates and writes files to disk and reads files from disk"]
// CIL[DOC-MICRO logic_summary="Processes inputs (arguments as defined in source) and returns the pass2Chunk result" notable_decisions="See source for implementation details"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
async function pass2Chunk(
  ctx: any,
  projectId: string,
  repoPath: string,
  globs: string[],
  excludeGlobs: string[],
  forceReprocess: boolean,
  filePath?: string,
  selectedPaths?: string[],
  selectedExtensions?: string[]
): Promise<{
  files_processed: number
  chunks_auto_approved: number
  chunks_queued_for_review: number
  markers_written: number
  errors: string[]
}> {
  const errors: string[] = []


  let filesProcessed = 0, chunksAutoApproved = 0, chunksQueued = 0, markersWritten = 0


  const { data: projItem } = await adminDb.from('items').select('id, data').eq('id', projectId).maybeSingle()
  const fileTree = (projItem?.data?.file_tree as FileTreeNode) || null
  const versionId = projItem?.data?.active_version_id || projItem?.data?.default_version_id || 'default'



  let targetFiles: string[] = []

  if (filePath) {
    targetFiles = [filePath]
  } else if (fileTree) {
    targetFiles = collectSelectedFiles(fileTree, selectedPaths || [], selectedExtensions || [])
  } else {
    
    targetFiles = walkDir(repoPath, repoPath, globs, excludeGlobs).map(f => f.path)
  }



  const { data: allFileItems } = await adminDb
    .from('items')
    .select('id, title, data')
    .filter('data->>project_id', 'eq', projectId)
    .filter('data->>kb_type', 'eq', 'cil_file')
    .eq('is_active', true)

  const existingByPath = new Map<string, { id: string; title: string; data: any }>()
  for (const item of allFileItems || []) {
    const fp = item.data?.file_path as string || item.title
    if (fp) existingByPath.set(fp, item)
  }

  const fileItems: { id: string; title: string; data: any }[] = []
  for (const relPath of targetFiles) {


    let fileItem = existingByPath.get(relPath)

    if (!fileItem) {
      const fileAbsPath = path.join(repoPath, relPath)
      const language = detectLanguage(fileAbsPath)
      const extension = path.extname(relPath).toLowerCase()
      const fileCanonical = toCanonicalPath(repoPath, fileAbsPath)
      const fileContent = fs.readFileSync(fileAbsPath, 'utf-8')
      const fileContentHash = computeContentHash(fileContent)
      try {
        const newFile = await adminCreate(ctx, {
          entity: 'items',
          type_slug: 'cil_file',
          title: relPath,
          status: 'active',
          is_active: true,
          data: {
            kb_type: 'cil_file',
            project_id: projectId,
            file_path: relPath,
            stable_id: fileCanonical,
            version_id: versionId,
            language,
            extension,
            stored_hash: null,
            file_hash: fileContentHash,
            content_hash: fileContentHash,
            has_existing_markers: false,
            existing_marker_names: [],
            existing_marker_count: 0,
            line_count: 0,
            status: '0-discovered',
            ingestion_pass: 1,
            chunk_count: 0,
            is_dead_code: false,
            git_last_commit: null,
            existing_marker_agreement_count: 0,
            existing_marker_disagreement_count: 0,
          },
        })
        const fileData = newFile.data || newFile
        fileItem = { id: newFile.id, title: relPath, data: fileData }
        if (fileTree) updateTreeNodeByPath(fileTree, relPath, { id: newFile.id, status: '0-discovered' })
      } catch (err) {
        errors.push(`${relPath}: create failed: ${err instanceof Error ? err.message : String(err)}`)
        continue
      }
    }

    if (fileItem) {
      const status = getFileStatus(fileItem)
      if (forceReprocess || status === '0-discovered' || status === '1-selected') {
        fileItems.push(fileItem)
      }
    }
  }

  const { data: existingChunkRows } = await adminDb
    .from('items')
    .select('data->file_id, data->chunk_name')
    .filter('data->>project_id', 'eq', projectId)
    .filter('data->>kb_type', 'eq', 'cil_chunk')
    .eq('is_active', true)

  const alreadyChunkedFileIds = new Set(
    (existingChunkRows || []).map((r: any) => r.file_id).filter(Boolean)
  )
  
  const existingChunkKeys = new Set(
    (existingChunkRows || [])
      .filter((r: any) => r.file_id && r.chunk_name)
      .map((r: any) => `${r.file_id}::${r.chunk_name}`)
  )

  const chunksToInsert: object[] = []
  const proposalsToInsert: object[] = []
  
  const fileUpdates: { id: string; data: Record<string, unknown> }[] = []

  for (const fileItem of fileItems || []) {
    const relPath: string = fileItem.data?.file_path || fileItem.title
    const absPath = path.join(repoPath, relPath)
    const language = fileItem.data?.language || 'unknown'

    if (!['typescript', 'javascript'].includes(language)) continue

    if (!forceReprocess && alreadyChunkedFileIds.has(fileItem.id)) continue

    try {
      if (forceReprocess) {
        try {
          await adminDb.from('items')
            .update({ is_active: false })
            .filter('data->>file_id', 'eq', fileItem.id)
            .filter('data->>kb_type', 'eq', 'cil_chunk')
            .eq('is_active', true)
        } catch (_) { /* non-fatal */ }
        for (const key of existingChunkKeys) {
          if (key.startsWith(`${fileItem.id}::`)) existingChunkKeys.delete(key)
        }
      }

      const rawContent = fs.readFileSync(absPath, 'utf-8')
      const rawLines = rawContent.split('\n')
      // Blank (rather than remove) CIL marker/DOC lines when force-reprocessing:
      // filtering them out shifts every line index, so stored line_start/line_end
      // land in stripped-file coordinates and validate_file reports false drift.
      // Blank lines are invisible to the AST proposer and collapse in
      // computeContentHash, keeping hashes identical to store_markers output.
      const lines = forceReprocess
        ? rawLines.map((l: string) => (/^\/\/\s*CIL\[/.test(l.trim()) || /^\s*\/\*\s*CIL\[/.test(l.trim())) ? '' : l)
        : rawLines
      const content = lines.join('\n')


      let fileHash = ''

      const canonicalPath = fileItem.data?.stable_id || toCanonicalPath(repoPath, absPath)

      const existingMarkers = parseExistingMarkers(lines)
      const hasExistingMarkers = existingMarkers.length > 0

      const rawProposals = proposeChunksFromSource(content, lines, language, canonicalPath)

      const approvedChunks: { name: string; stable_id: string; parent_stable_id: string; line_start: number; line_end: number; marker_line_end: number; chunk_type: string; is_proposal: boolean }[] = []

      for (const proposal of rawProposals) {
        


        let contentStart = proposal.line_start - 1 

        if (proposal.existing_jsdoc) {
          for (let i = proposal.line_start - 2; i >= 0; i--) {
            const t = lines[i].trim()
            if (t === '' || /CHUNK_(?:START|END):|@cil-generated/.test(t)) continue
            if (t.startsWith('/**') || t.startsWith('/*')) { contentStart = i; break }
            if (!t.startsWith('*')) break 
          }
        }

        const codeLines = lines.slice(contentStart, proposal.line_end)
        const codeContent = codeLines.join('\n')
        const codePreview = codeLines.slice(0, 8).join('\n')
        const tokenCount = estimateTokens(codeContent)
        const contentHash = computeContentHash(codeContent)

        const overlappingMarker = existingMarkers.find(m =>
          Math.abs(m.line_start - proposal.line_start) <= 3
        )
        const existingMarkerMatch = !!overlappingMarker
        const existingMarkerName = overlappingMarker?.stable_id || ''



        let score = proposal.confidence_score



        let reasons = proposal.confidence_reasons

        if (existingMarkerMatch) {
          if (overlappingMarker!.stable_id === proposal.stable_id) {
            score = Math.min(0.99, score + 0.08)
            reasons = [...reasons, 'matches existing marker name+position']
          } else {
            score = Math.min(0.99, score + 0.04)
            reasons = [...reasons, 'matches existing marker position']
          }
        }



        const isHighConfidence = score >= HIGH_CONFIDENCE_THRESHOLD

        if (isHighConfidence) {
          
          const chunkKey = `${fileItem.id}::${proposal.name}`
          if (!forceReprocess && existingChunkKeys.has(chunkKey)) {
            approvedChunks.push({ name: proposal.name, stable_id: proposal.stable_id, parent_stable_id: proposal.parent_stable_id || canonicalPath, line_start: proposal.line_start, line_end: proposal.line_end, marker_line_end: proposal.marker_line_end, chunk_type: proposal.chunk_type, is_proposal: false })
            chunksAutoApproved++
            continue
          }

          const existingMarkerAgreement = existingMarkerMatch
            ? (overlappingMarker!.stable_id === proposal.stable_id ? 'agreed' : 'disagreed')
            : 'none'

          const jd = proposal.existing_jsdoc
          const hasSourceDoc = !!(jd && (jd.description || jd.params || jd.returns))
          
          const docConfidence = jd?.is_cil_generated ? 'ai_generated' : hasSourceDoc ? 'from_source' : 'unverified_legacy'

          const inputSpec = jd?.input_spec || jd?.params || ''
          
          const outputSpec = jd?.output_spec || jd?.returns || ''
          
          const sentences = (jd?.description || '').split(/(?<=[.!?])\s+/)
          const macro = jd?.macro || sentences[0] || ''
          const micro = jd?.micro || sentences[1] || ''

          const isModuleHeader = proposal.chunk_type === 'module_header'
          const moduleName = isModuleHeader ? moduleNameFromPath(relPath) : ''
          
          const layer = jd?.layer || fileItem.data?.layer || (isModuleHeader ? 'shared-core' : 'app-specific')

          const baseChunkData: Record<string, any> = {
            kb_type: 'cil_chunk',
            chunk_name: proposal.name,
            stable_id: proposal.stable_id,
            version_id: versionId,
            parent_stable_id: proposal.parent_stable_id,
            legacy_chunk_id: null,
            file_id: fileItem.id,
            project_id: projectId,
            file_path: relPath,
            source_set_id: fileItem.data?.source_set_id || null,
            layer,
            line_start: proposal.line_start,
            line_end: proposal.line_end,
            chunk_type: proposal.chunk_type,
            stored_hash: contentHash,
            content_hash: contentHash,
            boundary_confidence: 'high',
            boundary_source: 'ast_auto',
            review_status: 'approved',
            doc_confidence: docConfidence,
            is_dead_code: false,
            macro,
            micro,
            input_spec: inputSpec,
            output_spec: outputSpec,
            side_effects: jd?.side_effects || '',
            stability: jd?.stability || 'internal',
            throws: jd?.throws || '',
            
            called_by: jd?.called_by || '',
            calls: jd?.calls || '',
            tags: jd?.tags || '',
            complexity: jd?.complexity || '',
            error_handling: jd?.error_handling || '',
            depends_on: jd?.depends_on || '',
            depended_by: jd?.depended_by || '',
            test_unit_path: null,
            test_e2e_path: null,
            token_count: tokenCount,
            existing_marker_agreement: existingMarkerAgreement,
            code_content: codeContent,
          }

          if (isModuleHeader) {
            baseChunkData.module = jd?.module || moduleName
            baseChunkData.audience = jd?.audience || 'both'
            baseChunkData.layer = layer
            baseChunkData.stability = jd?.stability || 'stable'
            
            baseChunkData.description = jd?.description || ''
            baseChunkData.see_also = jd?.see_also || ''
          }

          chunksToInsert.push({
            entity: 'items',
            type_slug: 'cil_chunk',
            title: `${relPath}::${proposal.name}`,
            status: 'active',
            is_active: true,
            data: baseChunkData,
          })
          existingChunkKeys.add(chunkKey) 

          approvedChunks.push({ name: proposal.name, stable_id: proposal.stable_id, parent_stable_id: proposal.parent_stable_id || canonicalPath, line_start: proposal.line_start, line_end: proposal.line_end, marker_line_end: proposal.marker_line_end, chunk_type: proposal.chunk_type, is_proposal: false })
          chunksAutoApproved++
        } else {
          proposalsToInsert.push({
            entity: 'items',
            type_slug: 'cil_chunk_proposal',
            title: `PROPOSAL: ${relPath}::${proposal.name}`,
            status: 'active',
            is_active: true,
            data: {
              kb_type: 'cil_chunk_proposal',
              stable_id: proposal.stable_id,
              version_id: versionId,
              parent_stable_id: proposal.parent_stable_id,
              legacy_chunk_id: null,
              file_id: fileItem.id,
              project_id: projectId,
              file_path: relPath,
              proposed_name: proposal.name,
              line_start: proposal.line_start,
              line_end: proposal.line_end,
              marker_line_end: proposal.marker_line_end,
              chunk_type: proposal.chunk_type,
              confidence_score: score,
              confidence_reasons: reasons.join('; '),
              existing_marker_match: existingMarkerMatch,
              existing_marker_name: existingMarkerName,
              content_hash: contentHash,
              review_status: 'pending_review',
              reviewed_by: null,
              reviewed_at: null,
              adjusted_line_start: null,
              adjusted_line_end: null,
              token_count: tokenCount,
              code_preview: codePreview,
            },
          })
          
          approvedChunks.push({ name: proposal.name, stable_id: proposal.stable_id, line_start: proposal.line_start, line_end: proposal.line_end, marker_line_end: proposal.marker_line_end, chunk_type: proposal.chunk_type, is_proposal: true })
          chunksQueued++
        }
      }


      if (approvedChunks.length > 0 || forceReprocess) {


        let resultLines = [...lines]


        const sorted = [...approvedChunks].sort((a, b) => b.line_start - a.line_start)

        for (const chunk of sorted) {
          const startLine = resultLines[chunk.line_start - 1]
          
          if (startLine && ANY_MARKER_RE.test(startLine.trim())) continue

          const startMarker = chunk.is_proposal ? proposalStartMarker(chunk.name) : chunkStartMarker(chunk.stable_id, chunk.chunk_type, chunk.name, chunk.parent_stable_id)
          const endMarker   = chunk.is_proposal ? proposalEndMarker(chunk.name)   : chunkEndMarker(chunk.stable_id)
          const startIdx = markerInsertIdx(resultLines, chunk.line_start)
          
          const endIdx = chunk.chunk_type === 'module_header'
            ? chunk.marker_line_end
            : markerEndInsertIdx(resultLines, chunk.line_start, chunk.marker_line_end)

          resultLines.splice(endIdx, 0, endMarker)
          resultLines.splice(startIdx, 0, startMarker)
          markersWritten++
        }


        fs.writeFileSync(absPath, resultLines.join('\n'), 'utf-8')
        fileHash = computeContentHash(resultLines.join('\n'))
      }

      fileUpdates.push({
        id: fileItem.id,
        data: {
          ...fileItem.data,
          stored_hash: fileHash,
          file_hash: fileHash,
          content_hash: fileHash,
          line_count: lines.length,
          has_existing_markers: approvedChunks.length > 0,
          existing_marker_names: approvedChunks.map(c => c.stable_id),
          existing_marker_count: approvedChunks.length,
          chunk_count: approvedChunks.length,
          ingestion_pass: 2,
          status: '2-chunked',
          last_status_at: new Date().toISOString(),
          existing_marker_agreement_count: approvedChunks.filter(c => {
            const em = existingMarkers.find(m => Math.abs(m.line_start - c.line_start) <= 3)
            return em && em.stable_id === c.stable_id
          }).length,
          existing_marker_disagreement_count: approvedChunks.filter(c => {
            const em = existingMarkers.find(m => Math.abs(m.line_start - c.line_start) <= 3)
            return em && em.stable_id !== c.stable_id
          }).length,
        },
      })

      if (fileTree) {
        updateTreeNodeStatus(fileTree, fileItem.id, '2-chunked')
      }

      filesProcessed++
    } catch (err) {
      errors.push(`${relPath}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const PARALLEL_INSERT = 10
  const PARALLEL_UPDATE = 20

  for (let i = 0; i < chunksToInsert.length; i += PARALLEL_INSERT) {
    const batch = chunksToInsert.slice(i, i + PARALLEL_INSERT)
    await Promise.all(batch.map(record =>
      adminCreate(ctx, record as any).catch((e: any) =>
        errors.push(`chunk insert failed: ${e.message}`)
      )
    ))
  }

  for (let i = 0; i < proposalsToInsert.length; i += PARALLEL_INSERT) {
    const batch = proposalsToInsert.slice(i, i + PARALLEL_INSERT)
    await Promise.all(batch.map(record =>
      adminCreate(ctx, record as any).catch((e: any) =>
        errors.push(`proposal insert failed: ${e.message}`)
      )
    ))
  }

  for (let i = 0; i < fileUpdates.length; i += PARALLEL_UPDATE) {
    const batch = fileUpdates.slice(i, i + PARALLEL_UPDATE)
    await Promise.all(batch.map(({ id, data }) => {
      const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id } }
      return adminUpdate(updateCtx, { data }).catch((e: any) =>
        errors.push(`file update ${id} failed: ${e.message}`)
      )
    }))
  }

  if (projItem) {
    const fileStatuses: Record<string, string> = { ...(projItem.data?.file_statuses || {}) }
    for (const { data } of fileUpdates) {
      const fp = data.file_path as string | undefined
      if (fp) fileStatuses[fp] = '2-chunked'
    }
    const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: projItem.id } }
    await adminUpdate(updateCtx, {
      data: {
        ...projItem.data,
        file_tree: fileTree,
        file_statuses: fileStatuses,
        ingestion_status: chunksQueued > 0 ? 'in_progress' : 'complete',
        chunk_count: chunksAutoApproved,
        last_ingested_at: new Date().toISOString(),
      },
    }).catch(() => { /* non-fatal */ })
  }

  return {
    files_processed: filesProcessed,
    chunks_auto_approved: chunksAutoApproved,
    chunks_queued_for_review: chunksQueued,
    markers_written: markersWritten,
    errors,
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Implements the pass2Chunk logic'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:pass2chunk:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-ingest.ts:handler:constant" type="constant" identity="handler" parent="none"]
// CIL[DOC-MACRO purpose="Constant handler"]
// CIL[DOC-RESPONSIBILITY responsibility="Supplies the static value for handler"]
// CIL[DOC-CONTEXT module="cil-ingest" layer="functions" related_files=".framework/functions/_shared/ast.ts,.framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="value of handler" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Holds the static handler value" notable_decisions="Static value used across cil-ingest"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  const action = ctx.query?.action
  const req = body as IngestRequest

  if (!req?.project_id) throw new Error('project_id is required')

  const { data: projectItem, error: projectError } = await adminDb
    .from('items')
    .select('id, title, data')
    .eq('id', req.project_id)
    .maybeSingle()

  if (projectError || !projectItem) throw new Error(`Project not found: ${req.project_id}`)

  const repoPath: string = projectItem.data?.repo_path

  const DISK_ACTIONS = ['pass1', 'pass2', 'reindex_chunk', 'validate_chunking']
  if (DISK_ACTIONS.includes(action || '')) {
    if (!repoPath) throw new Error('Project has no repo_path configured')
    if (!fs.existsSync(repoPath)) {
      throw new Error(`Repository path does not exist on this machine: ${repoPath}`)
    }
  }

  const globs = req.globs || projectItem.data?.globs || DEFAULT_GLOBS
  const excludeGlobs = req.exclude_globs || projectItem.data?.exclude_globs || DEFAULT_EXCLUDE
  const forceReprocess = req.force_reprocess ?? false
  const sourceSets: SourceSet[] | undefined = projectItem.data?.source_sets

  if (action === 'pass1') {
    if (!ctx.accountId) throw new Error('account_id required — user must be authenticated')
    
    const discoverGlobs = req.file_path ? [req.file_path] : globs
    const discoverExcludes = req.file_path ? [] : excludeGlobs
    const result = await pass1Discover(ctx, req.project_id, repoPath, discoverGlobs, discoverExcludes, forceReprocess, sourceSets)
    return {
      action: 'pass1',
      project_id: req.project_id,
      repo_path: repoPath,
      file_path: req.file_path || null,
      source_sets_used: sourceSets ? sourceSets.length : 0,
      ...result,
    }
  }

  if (action === 'pass2') {
    if (!ctx.accountId) throw new Error('account_id required — user must be authenticated')
    const selectedPaths = projectItem.data?.selected_paths as string[] | undefined
    const selectedExtensions = req.selected_extensions || (projectItem.data?.selected_extensions as string[] | undefined)
    const result = await pass2Chunk(ctx, req.project_id, repoPath, globs, excludeGlobs, forceReprocess, req.file_path, selectedPaths, selectedExtensions)
    return {
      action: 'pass2',
      project_id: req.project_id,
      repo_path: repoPath,
      file_path: req.file_path || null,
      confidence_threshold: HIGH_CONFIDENCE_THRESHOLD,
      ...result,
    }
  }

  if (action === 'validate_chunking') {
    const filePath = req.file_path
    if (!filePath) throw new Error('file_path is required for validate_chunking')
    if (!repoPath) throw new Error('Project has no repo_path configured')

    const absPath = path.join(repoPath, filePath)
    if (!fs.existsSync(absPath)) {
      throw new Error(`Source file not found on disk: ${absPath}`)
    }

    const content = fs.readFileSync(absPath, 'utf-8')
    const lines = content.split('\n')
    const language = detectLanguage(absPath)
    const canonicalPath = toCanonicalPath(repoPath, absPath)
    const existingMarkers = parseExistingMarkers(lines)

    if (existingMarkers.length === 0) {
      return {
        file_path: filePath,
        canonical_path: canonicalPath,
        status: 'not_chunked',
        message: 'No CIL markers found',
        existing_marker_count: 0,
        proposed_chunk_count: 0,
      }
    }

    const proposals = proposeChunksFromSource(content, lines, language, canonicalPath)
    const matchedProposalIdx = new Set<number>()
    const markerResults = existingMarkers.map(marker => {
      const overlapIdx = proposals.findIndex((p, idx) =>
        !matchedProposalIdx.has(idx) && Math.abs(p.line_start - marker.line_start) <= 3
      )
      if (overlapIdx === -1) {
        return { ...marker, status: 'orphan', reason: 'No matching proposed chunk within 3 lines' }
      }
      matchedProposalIdx.add(overlapIdx)
      const proposal = proposals[overlapIdx]
      if (proposal.stable_id === marker.stable_id) {
        return { ...marker, status: 'agreed', proposal_stable_id: proposal.stable_id, proposal_line_end: proposal.line_end }
      }
      return { ...marker, status: 'disagreed', proposal_stable_id: proposal.stable_id, proposal_line_end: proposal.line_end }
    })

    const missing = proposals
      .map((p, idx) => ({ ...p, idx }))
      .filter(({ idx }) => !matchedProposalIdx.has(idx))
      .map(p => ({
        stable_id: p.stable_id,
        line_start: p.line_start,
        line_end: p.line_end,
        chunk_type: p.chunk_type,
        status: 'missing',
      }))

    const allAgreed = markerResults.every(m => m.status === 'agreed') && missing.length === 0
    const status = allAgreed ? 'valid' : 'needs_rechunk'

    return {
      file_path: filePath,
      canonical_path: canonicalPath,
      status,
      existing_marker_count: existingMarkers.length,
      proposed_chunk_count: proposals.length,
      agreed_count: markerResults.filter(m => m.status === 'agreed').length,
      disagreed_count: markerResults.filter(m => m.status === 'disagreed').length,
      orphan_count: markerResults.filter(m => m.status === 'orphan').length,
      missing_count: missing.length,
      markers: markerResults,
      missing,
    }
  }

  if (action === 'step') {
    const step = Number((body as any).step ?? 2)
    const limit = Number((body as any).limit ?? 1)
    if (step !== 0 && step !== 1 && step !== 2) throw new Error(`step ${step} is not yet supported by the resumable worker`)
    if (step === 2 && (limit < 1 || limit > 50)) throw new Error('step 2 limit must be between 1 and 50')
    if (!ctx.accountId) throw new Error('account_id required — user must be authenticated')
    if (!repoPath) throw new Error('Project has no repo_path configured')

    const selectedPaths = projectItem.data?.selected_paths as string[] | undefined
    const selectedExtensions = req.selected_extensions || (projectItem.data?.selected_extensions as string[] | undefined)

    if (step === 0) {
      const filePath = req.file_path
      if (!filePath) throw new Error('file_path is required for step 0 (discover one file)')
      const result = await pass1Discover(ctx, req.project_id, repoPath, [filePath], [], forceReprocess, sourceSets)

      const { data: projectAfter } = await adminDb
        .from('items')
        .select('data')
        .eq('id', req.project_id)
        .maybeSingle()

      if (projectAfter) {
        const stepCursors = { ...(projectAfter.data?.step_cursors || {}), [String(step)]: filePath }
        const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: req.project_id } }
        await adminUpdate(updateCtx, {
          data: {
            ...projectAfter.data,
            step_cursors: stepCursors,
          },
        }).catch(() => { /* non-fatal */ })
      }

      return {
        ok: true,
        step,
        file_path: filePath,
        status: 'in_progress',
        processed: 1,
        ...result,
      }
    }

    if (step === 1) {
      const { data: fileItems } = await adminDb
        .from('items')
        .select('id, data')
        .filter('data->>project_id', 'eq', req.project_id)
        .filter('data->>kb_type', 'eq', 'cil_file')
        .eq('is_active', true)

      const toSelect = (fileItems || [])
        .map((f: any) => ({ id: f.id, data: f.data, path: f.data?.file_path || f.title, status: getFileStatus(f) }))
        .filter((f: any) => isSelectedPath(f.path, selectedPaths || []) && f.status === '0-discovered')
        .sort((a: any, b: any) => a.path.localeCompare(b.path))

      const now = new Date().toISOString()
      const fileStatuses = { ...(projectItem.data?.file_statuses || {}) }
      for (const f of toSelect) {
        const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: f.id } }
        await adminUpdate(updateCtx, {
          data: {
            ...f.data,
            status: '1-selected',
            selected_at: now,
          },
        }).catch(() => { /* non-fatal */ })
        fileStatuses[f.path] = '1-selected'
      }

      const { data: projectAfter } = await adminDb
        .from('items')
        .select('data')
        .eq('id', req.project_id)
        .maybeSingle()

      if (projectAfter) {
        const stepCursors = { ...(projectAfter.data?.step_cursors || {}), [String(step)]: toSelect[toSelect.length - 1]?.path || '' }
        const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: req.project_id } }
        await adminUpdate(updateCtx, {
          data: {
            ...projectAfter.data,
            file_statuses: fileStatuses,
            step_cursors: stepCursors,
          },
        }).catch(() => { /* non-fatal */ })
      }

      return {
        ok: true,
        step,
        status: toSelect.length === 0 ? 'complete' : 'in_progress',
        processed: toSelect.length,
        remaining: 0,
        selected_paths: selectedPaths,
        selected_file_count: toSelect.length,
      }
    }

    const { data: fileItems } = await adminDb
      .from('items')
      .select('id, title, data')
      .filter('data->>project_id', 'eq', req.project_id)
      .filter('data->>kb_type', 'eq', 'cil_file')
      .eq('is_active', true)

    const pending = (fileItems || [])
      .map((f: any) => ({ path: f.data?.file_path || f.title, status: getFileStatus(f) }))
      .filter((f: any) => isSelectedPath(f.path, selectedPaths || []) && (f.status === '1-selected' || (forceReprocess && f.status === '2-chunked')))
      .sort((a: any, b: any) => a.path.localeCompare(b.path))

    if (pending.length === 0) {
      return { ok: true, step, status: 'complete', processed: 0, remaining: 0, message: 'No files to chunk' }
    }

    const cursorPath = (projectItem?.data?.step_cursors?.[String(step)] as string) || ''
    let startIdx = 0
    if (cursorPath) {
      const found = pending.findIndex((f: any) => f.path === cursorPath)
      if (found >= 0) startIdx = found + 1
    }
    const toProcess = req.file_path ? [{ path: req.file_path, status: '' }] : pending.slice(startIdx, startIdx + limit)
    let filesProcessed = 0
    let chunksAutoApproved = 0
    let chunksQueued = 0
    let markersWritten = 0
    const allErrors: string[] = []
    let lastPath = ''

    for (const p of toProcess) {
      const result = await pass2Chunk(ctx, req.project_id, repoPath, globs, excludeGlobs, forceReprocess, p.path, selectedPaths, selectedExtensions)
      filesProcessed += result.files_processed || 0
      chunksAutoApproved += result.chunks_auto_approved || 0
      chunksQueued += result.chunks_queued_for_review || 0
      markersWritten += result.markers_written || 0
      allErrors.push(...(result.errors || []))
      lastPath = p.path
    }

    const { data: projectAfter } = await adminDb
      .from('items')
      .select('data')
      .eq('id', req.project_id)
      .maybeSingle()

    if (projectAfter) {
      const stepCursors = { ...(projectAfter.data?.step_cursors || {}), [String(step)]: lastPath }
      const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: req.project_id } }
      await adminUpdate(updateCtx, {
        data: {
          ...projectAfter.data,
          step_cursors: stepCursors,
        },
      }).catch(() => { /* non-fatal */ })
    }

    return {
      ok: true,
      step,
      file_path: lastPath,
      status: toProcess.length >= pending.length ? 'complete' : 'in_progress',
      processed: toProcess.length,
      remaining: pending.length - toProcess.length,
      files_processed: filesProcessed,
      chunks_auto_approved: chunksAutoApproved,
      chunks_queued_for_review: chunksQueued,
      markers_written: markersWritten,
      errors: allErrors,
    }
  }

  if (action === 'promote_proposal') {
    const proposalId = body?.proposal_id
    if (!proposalId) throw new Error('proposal_id is required')

    const { data: proposal } = await adminDb
      .from('items')
      .select('id, data')
      .eq('id', proposalId)
      .maybeSingle()

    if (!proposal) throw new Error(`Proposal not found: ${proposalId}`)

    const pd = proposal.data || {}
    const fileId = pd.file_id
    if (!fileId) throw new Error('Proposal has no file_id')

    const chunkName = body?.adjusted_name || pd.proposed_name || 'Unknown'
    const chunkType = pd.chunk_type || 'function'
    const projectId = pd.project_id || req.project_id

    const { data: fileItem } = await adminDb
      .from('items').select('id, data').eq('id', fileId).maybeSingle()
    if (!fileItem) throw new Error(`File not found: ${fileId}`)

    const relPath: string = fileItem.data?.file_path || fileItem.title
    const effectiveRepoPath: string = repoPath || body?.repo_path || ''
    if (!effectiveRepoPath) {
      throw new Error(
        `Project has no repo_path configured. ` +
        `Pass repo_path in the request body to override, or update the project record.`
      )
    }
    const absPath = path.join(effectiveRepoPath, relPath)
    if (!fs.existsSync(absPath)) throw new Error(`Source file not found on disk: ${absPath}`)

    const fileContent = fs.readFileSync(absPath, 'utf-8')
    const resultLines = fileContent.split('\n')
    const canonicalPath = fileItem.data?.stable_id || toCanonicalPath(effectiveRepoPath, absPath)
    const promotionVersionId = projectItem?.data?.active_version_id || projectItem?.data?.default_version_id || 'default'
    const chunkStableId = generateStableId(canonicalPath, chunkName, chunkType)

    const proposalStartText = proposalStartMarker(chunkName)
    const proposalEndText   = proposalEndMarker(chunkName)
    const startIdx = resultLines.findIndex(l => l.trim() === proposalStartText.trim())
    const endIdx   = resultLines.findIndex(l => l.trim() === proposalEndText.trim())

    let markerReplaced = false
    if (startIdx !== -1) { resultLines[startIdx] = chunkStartMarker(chunkStableId); markerReplaced = true }
    if (endIdx   !== -1) { resultLines[endIdx]   = chunkEndMarker(chunkStableId);   markerReplaced = true }
    if (markerReplaced) fs.writeFileSync(absPath, resultLines.join('\n'), 'utf-8')

    const actualStart = startIdx !== -1 ? startIdx + 1 : (pd.line_start || 1)
    const actualEnd   = endIdx   !== -1 ? endIdx + 1   : (pd.line_end   || actualStart)
    
    const codeLines   = resultLines.slice(actualStart, actualEnd - 1)
    const codeContent = codeLines.join('\n')
    const tokenCount  = estimateTokens(codeContent)
    const contentHash = computeContentHash(codeContent)

    if (!ctx.accountId) throw new Error('account_id required — user must be authenticated')

    const newChunk = await adminCreate(ctx, {
      entity: 'items',
      type_slug: 'cil_chunk',
      title: `${relPath}::${chunkName}`,
      status: 'active',
      is_active: true,
      data: {
        kb_type: 'cil_chunk',
        chunk_name: chunkName,
        stable_id: chunkStableId,
        version_id: promotionVersionId,
        parent_stable_id: canonicalPath,
        legacy_chunk_id: proposal.id,
        file_id: fileId,
        project_id: projectId,
        file_path: relPath,
        line_start: actualStart,
        line_end: actualEnd,
        chunk_type: chunkType,
        stored_hash: contentHash,
        content_hash: contentHash,
        boundary_confidence: 'human_verified',
        boundary_source: 'ast_approved',
        review_status: 'approved',
        doc_confidence: 'unverified_legacy',
        is_dead_code: false,
        macro: '',
        micro: '',
        input_spec: '',
        output_spec: '',
        side_effects: '',
        stability: 'internal',
        test_unit_path: null,
        test_e2e_path: null,
        token_count: tokenCount,
        existing_marker_agreement: 'none',
        code_content: codeContent,
      },
    })
    if (!newChunk?.id) throw new Error('Failed to create chunk record')

    const propUpdateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: proposalId } }
    await adminUpdate(propUpdateCtx, {
      is_active: false,
      data: { ...pd, review_status: 'approved', promoted_chunk_id: newChunk.id },
    })

    return {
      action: 'promote_proposal',
      proposal_id: proposalId,
      chunk_id: newChunk?.id,
      chunk_name: chunkName,
      file_path: relPath,
      marker_replaced: markerReplaced,
    }
  }

  if (action === 'reject_proposal') {
    const proposalId = body?.proposal_id
    if (!proposalId) throw new Error('proposal_id is required')

    const { data: proposal } = await adminDb
      .from('items')
      .select('id, data')
      .eq('id', proposalId)
      .maybeSingle()

    if (!proposal) throw new Error(`Proposal not found: ${proposalId}`)

    const pd = proposal.data || {}
    const fileId = pd.file_id
    if (!fileId) throw new Error('Proposal has no file_id')

    const chunkName = pd.proposed_name || 'Unknown'

    const { data: fileItem } = await adminDb
      .from('items').select('id, data').eq('id', fileId).maybeSingle()
    if (!fileItem) throw new Error(`File not found: ${fileId}`)

    const relPath: string = fileItem.data?.file_path || fileItem.title
    const effectiveRepoPath: string = repoPath || body?.repo_path || ''
    if (!effectiveRepoPath) {
      throw new Error(
        `Project has no repo_path configured. ` +
        `Pass repo_path in the request body to override, or update the project record.`
      )
    }
    const absPath = path.join(effectiveRepoPath, relPath)
    if (!fs.existsSync(absPath)) throw new Error(`Source file not found on disk: ${absPath}`)

    const fileContent = fs.readFileSync(absPath, 'utf-8')
    const resultLines = fileContent.split('\n')

    const proposalStartText = proposalStartMarker(chunkName)
    const proposalEndText   = proposalEndMarker(chunkName)
    let markerReplaced = false
    for (let i = 0; i < resultLines.length; i++) {
      const t = resultLines[i].trim()
      if (t === proposalStartText.trim()) { resultLines[i] = rejectedStartMarker(chunkName); markerReplaced = true }
      if (t === proposalEndText.trim())   { resultLines[i] = rejectedEndMarker(chunkName);   markerReplaced = true }
    }
    if (markerReplaced) fs.writeFileSync(absPath, resultLines.join('\n'), 'utf-8')

    const propUpdateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: proposalId } }
    await adminUpdate(propUpdateCtx, {
      is_active: false,
      data: { ...pd, review_status: 'rejected' },
    })

    return {
      action: 'reject_proposal',
      proposal_id: proposalId,
      chunk_name: chunkName,
      file_path: relPath,
      marker_replaced: markerReplaced,
    }
  }

  if (action === 'status') {
    const { count: fileCount } = await adminDb
      .from('items').select('id', { count: 'exact' })
      .filter('data->>project_id', 'eq', req.project_id)
      .filter('data->>kb_type', 'eq', 'cil_file').eq('is_active', true)

    const { count: chunkCount } = await adminDb
      .from('items').select('id', { count: 'exact' })
      .filter('data->>project_id', 'eq', req.project_id)
      .filter('data->>kb_type', 'eq', 'cil_chunk').eq('is_active', true)

    const { count: proposalCount } = await adminDb
      .from('items').select('id', { count: 'exact' })
      .filter('data->>project_id', 'eq', req.project_id)
      .filter('data->>kb_type', 'eq', 'cil_chunk_proposal')
      .filter('data->>review_status', 'eq', 'pending_review')
      .eq('is_active', true)

    return {
      project_id: req.project_id,
      file_count: fileCount || 0,
      chunk_count: chunkCount || 0,
      pending_review_count: proposalCount || 0,
      ingestion_status: projectItem.data?.ingestion_status || 'not_started',
    }
  }

  if (action === 'reindex_chunk') {
    const chunkId = body?.chunk_id
    if (!chunkId) throw new Error('chunk_id is required')

    const { data: chunk } = await adminDb
      .from('items').select('id, data').eq('id', chunkId).maybeSingle()
    if (!chunk) throw new Error(`Chunk not found: ${chunkId}`)

    const cd = chunk.data || {}
    const fileId   = cd.file_id
    const relPath: string = cd.file_path
    const lineStart: number = cd.line_start || 0
    const lineEnd: number   = cd.line_end   || 0

    if (!relPath || !lineStart || !lineEnd) {
      throw new Error('Chunk is missing file_path / line_start / line_end — cannot reindex')
    }

    const absPath = path.join(repoPath, relPath)
    if (!fs.existsSync(absPath)) {
      throw new Error(`Source file not found on disk: ${absPath}`)
    }

    const fileContent = fs.readFileSync(absPath, 'utf-8')
    const lines = fileContent.split('\n')

    const codeLines    = lines.slice(lineStart - 1, lineEnd)
    const codeContent  = codeLines.join('\n')
    const tokenCount   = estimateTokens(codeContent)
    const contentHash  = computeContentHash(codeContent)

    const chunkUpdateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: chunkId } }
    await adminUpdate(chunkUpdateCtx, {
      data: {
        ...cd,
        code_content:    codeContent,
        stored_hash:     contentHash,
        content_hash:    contentHash,
        token_count:     tokenCount,
        hash_updated_at: new Date().toISOString(),
      },
    })

    if (fileId) {
      const fileHash = computeContentHash(fileContent)
      const fileUpdateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: fileId } }
      await adminUpdate(fileUpdateCtx, { data: { stored_hash: fileHash, file_hash: fileHash, content_hash: fileHash } })
    }

    const result: Record<string, any> = {
      action: 'reindex_chunk',
      chunk_id: chunkId,
      chunk_name: cd.chunk_name || '',
      file_path: relPath,
      new_hash: contentHash,
      token_count: tokenCount,
      embed_triggered: false,
      doc_triggered: false,
    }

    if (body?.also_embed) {
      try {
        const base = process.env.URL || 'http://localhost:8888'
        const embedRes = await fetch(`${base}/.netlify/functions/cil-embeddings?action=embed_chunk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chunk_id: chunkId, force_regenerate: true }),
        })
        result.embed_triggered = embedRes.ok
        if (!embedRes.ok) {
          const errText = await embedRes.text()
          result.embed_error = errText.slice(0, 200)
        }
      } catch (err) {
        result.embed_error = err instanceof Error ? err.message : String(err)
      }
    }

    if (body?.also_doc) {
      try {
        const base = process.env.URL || 'http://localhost:8888'
        const docRes = await fetch(`${base}/.netlify/functions/cil-doc?action=doc_chunk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chunk_id: chunkId, model: body?.model || 'gpt-4o-mini', force: true }),
        })
        result.doc_triggered = docRes.ok
        if (!docRes.ok) {
          const errText = await docRes.text()
          result.doc_error = errText.slice(0, 200)
        }
      } catch (err) {
        result.doc_error = err instanceof Error ? err.message : String(err)
      }
    }

    return result
  }

  if (action === 'discover') {
    const result = await pass1Discover(ctx, req.project_id, repoPath, globs, excludeGlobs, forceReprocess, sourceSets)
    return {
      action: 'discover',
      project_id: req.project_id,
      repo_path: repoPath,
      ...result,
    }
  }

  if (action === 'select') {
    const selectedPaths: string[] = req.selected_paths || []
    const { data: projectItem } = await adminDb.from('items').select('id, data').eq('id', req.project_id).maybeSingle()
    if (!projectItem) throw new Error('Project not found')

    const now = new Date().toISOString()
    const fileStatuses: Record<string, string> = { ...(projectItem.data?.file_statuses || {}) }

    // Preserve later pass statuses; only toggle between 0-discovered and 1-selected
    const canSelect = (status?: string) => !status || status === '0-discovered' || status === '1-selected'

    for (const p of Object.keys(fileStatuses)) {
      const isSelected = selectedPaths.includes(p)
      const current = fileStatuses[p]
      if (isSelected && canSelect(current)) {
        fileStatuses[p] = '1-selected'
      } else if (!isSelected && current === '1-selected') {
        fileStatuses[p] = '0-discovered'
      }
    }
    for (const p of selectedPaths) {
      if (fileStatuses[p] == null) {
        fileStatuses[p] = '1-selected'
      }
    }

    const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: projectItem.id } }
    await adminUpdate(updateCtx, {
      data: {
        ...projectItem.data,
        selected_paths: selectedPaths,
        file_statuses: fileStatuses,
      },
    })

    const { data: files } = await adminDb.from('items')
      .select('id, data')
      .filter('data->>kb_type', 'eq', 'cil_file')
      .filter('data->>project_id', 'eq', req.project_id)
      .eq('is_active', true)

    let selectedCount = 0
    for (const f of files || []) {
      const fp = f.data?.file_path || f.title
      const isSelected = selectedPaths.includes(fp)
      const current = f.data?.status
      const canSelect = !current || current === '0-discovered' || current === '1-selected'
      if (isSelected && canSelect) {
        await adminDb.from('items').update({
          data: { ...f.data, status: '1-selected' },
          updated_at: now,
        }).eq('id', f.id)
        selectedCount++
      } else if (!isSelected && current === '1-selected') {
        await adminDb.from('items').update({
          data: { ...f.data, status: '0-discovered' },
          updated_at: now,
        }).eq('id', f.id)
      }
    }

    return {
      ok: true,
      action: 'select',
      project_id: req.project_id,
      selected_paths: selectedPaths,
      files_selected: selectedCount,
    }
  }

  throw new Error(`Unknown action: ${action}. Valid actions: pass1, pass2, discover, select, status, promote_proposal, reject_proposal, reindex_chunk`)
})
// CIL[DOC-VECTOR type="context" content="purpose='Constant handler'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-ingest.ts:handler:constant"]

