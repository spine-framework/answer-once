// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-AUDIENCE audience="cil-pipeline, framework-developers"]
// CIL[DOC-MACRO purpose="Shared CIL utilities for stable IDs, content hashing, and file tree operations"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide reusable helpers for the CIL pipeline across the framework"]
// CIL[DOC-CONTEXT module="functions/_shared/cil" layer="shared" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="module exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports adminDb and crypto; re-exports helper functions and types" notable_decisions="Uses Node crypto for SHA-256 content hashing"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]

import { adminDb } from './db'
import * as crypto from 'crypto'
// CIL[DOC-VECTOR type="context" content="purpose='Shared CIL utilities for stable IDs, content hashing, and file tree operations'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:STABLE_ID_PREFIX:constant" type="constant" identity="STABLE_ID_PREFIX" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-MACRO purpose="Define the prefix used for canonical file paths"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the constant tilde prefix used by stable ID and path helpers"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="functions/_shared/cil" layer="shared" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string constant STABLE_ID_PREFIX" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports a single string literal '~'" notable_decisions=""]
export const STABLE_ID_PREFIX = '~'
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:STABLE_ID_PREFIX:constant"]

// CIL[DOC-VECTOR type="context" content="purpose='Define the prefix used for canonical file paths'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:FileStatus:type" type="type" identity="FileStatus" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-MACRO purpose="Enumerate the CIL processing pipeline stages for a file"]
// CIL[DOC-RESPONSIBILITY responsibility="Type the ordered file lifecycle statuses"]
// CIL[DOC-CONTEXT module="functions/_shared/cil" layer="shared" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="FileStatus union type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="String-literal union from 0-discovered to 8-published" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export type FileStatus =
  | '0-discovered'
  | '1-selected'
  | '2-chunked'
  | '3-documented'
  | '4-chunk-validated'
  | '5-doc-validated'
  | '6-enriched'
  | '7-embedded-mapped'
  | '8-published'
// CIL[DOC-VECTOR type="context" content="purpose='Enumerate the CIL processing pipeline stages for a file'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:FileStatus:type"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:PIPELINE_STATUS_RANK:constant" type="constant" identity="PIPELINE_STATUS_RANK" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-MACRO purpose="Map each FileStatus to a numeric rank for ordering and comparison"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a lookup table from status string to rank"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="functions/_shared/cil" layer="shared" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Record<string, number>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Object literal mapping status strings to 0-8" notable_decisions=""]
export const PIPELINE_STATUS_RANK: Record<string, number> = {
  '0-discovered': 0,
  '1-selected': 1,
  '2-chunked': 2,
  '3-documented': 3,
  '4-chunk-validated': 4,
  '5-doc-validated': 5,
  '6-enriched': 6,
  '7-embedded-mapped': 7,
  '8-published': 8,
}
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:PIPELINE_STATUS_RANK:constant"]

// CIL[DOC-VECTOR type="context" content="purpose='Map each FileStatus to a numeric rank for ordering and comparison'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:pipelineRank:function" type="function" identity="pipelineRank" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-MACRO purpose="Return the numeric rank for a given status string"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert a status into its rank, defaulting to 0"]
// CIL[DOC-CONTEXT module="functions/_shared/cil" layer="shared" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="status: string | undefined" outputs="number" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns rank if status exists and is in map, otherwise 0" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function pipelineRank(status: string | undefined): number {
  return status ? PIPELINE_STATUS_RANK[status] || 0 : 0
}
// CIL[DOC-VECTOR type="context" content="purpose='Return the numeric rank for a given status string'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:pipelineRank:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:toCanonicalPath:function" type="function" identity="toCanonicalPath" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-MACRO purpose="Convert an absolute file path into a canonical '~/' path"]
// CIL[DOC-RESPONSIBILITY responsibility="Normalize and prefix a repository-relative path"]
// CIL[DOC-CONTEXT module="functions/_shared/cil" layer="shared" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="repoRoot: string, absolutePath: string" outputs="canonical path string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Strips repo root, backslashes, leading slashes, then prefixes with '~'" notable_decisions="Handles empty relative path as '~/'"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function toCanonicalPath(repoRoot: string, absolutePath: string): string {
  const rel = absolutePath.startsWith(repoRoot) ? absolutePath.slice(repoRoot.length) : absolutePath
  const normalized = rel.replace(/\\/g, '/').replace(/^\/+/, '')
  return normalized ? `${STABLE_ID_PREFIX}/${normalized}` : `${STABLE_ID_PREFIX}/`
}
// CIL[DOC-VECTOR type="context" content="purpose='Convert an absolute file path into a canonical '~/' path'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:toCanonicalPath:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:generateStableId:function" type="function" identity="generateStableId" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-MACRO purpose="Build a stable ID from canonical path, identity and type"]
// CIL[DOC-RESPONSIBILITY responsibility="Concatenate path, identity and type into a colon-delimited stable ID"]
// CIL[DOC-CONTEXT module="functions/_shared/cil" layer="shared" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="canonicalPath: string, identity: string, type: string" outputs="stable id string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns template literal `${canonicalPath}:${identity}:${type}`" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function generateStableId(canonicalPath: string, identity: string, type: string): string {
  return `${canonicalPath}:${identity}:${type}`
}
// CIL[DOC-VECTOR type="context" content="purpose='Build a stable ID from canonical path, identity and type'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:generateStableId:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:parseStableId:function" type="function" identity="parseStableId" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-MACRO purpose="Split a stable ID into its path, identity and type components"]
// CIL[DOC-RESPONSIBILITY responsibility="Parse colon-delimited stable IDs or return null for invalid inputs"]
// CIL[DOC-CONTEXT module="functions/_shared/cil" layer="shared" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="stableId: string" outputs="{ canonicalPath, identity, type } | null" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Splits on ':', pops last two parts as type and identity, joins remainder" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function parseStableId(stableId: string): { canonicalPath: string; identity: string; type: string } | null {
  const parts = stableId.split(':')
  if (parts.length < 3) return null
  const type = parts.pop()!
  const identity = parts.pop()!
  const canonicalPath = parts.join(':')
  return { canonicalPath, identity, type }
}
// CIL[DOC-VECTOR type="context" content="purpose='Split a stable ID into its path, identity and type components'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:parseStableId:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:computeContentHash:function" type="function" identity="computeContentHash" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-MACRO purpose="Compute a 32-character SHA-256 hash of code content ignoring CIL markers and whitespace"]
// CIL[DOC-RESPONSIBILITY responsibility="Produce a deterministic short hash for chunk content comparison"]
// CIL[DOC-CONTEXT module="functions/_shared/cil" layer="shared" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="raw: string" outputs="32-char hex string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Normalises line endings, filters CIL and blank lines, collapses blanks, SHA-256 then slice(0,32)" notable_decisions="CIL marker and doc lines are excluded from hash"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function computeContentHash(raw: string): string {
  const lines = raw.replace(/\r\n/g, '\n').split('\n')
  const filtered = lines.filter(line => {
    const trimmed = line.trim()
    return !trimmed.match(/^\/\/\s*CIL\[(BEGIN|END)/) &&
           !trimmed.match(/^\/\*\*?\s*CIL\[(BEGIN|END)/) &&
           !trimmed.match(/^\/\/\s*CIL\[DOC-/) &&
           !trimmed.match(/^\/\*\*?\s*CIL\[DOC-/) &&
           !trimmed.match(/^<!--\s*CIL\[(BEGIN|END)/) &&
           !trimmed.match(/^<!--\s*CIL\[DOC-/) &&
           !trimmed.match(/^#\s*CIL\[(BEGIN|END|DOC-)/) &&
           !trimmed.match(/^--\s*CIL\[(BEGIN|END|DOC-)/)
  })
  const collapsed: string[] = []
  let lastBlank = false
  for (const line of filtered) {
    const isBlank = line.trim() === ''
    if (isBlank && lastBlank) continue
    collapsed.push(line)
    lastBlank = isBlank
  }
  const normalised = collapsed.join('\n').trim()
  return crypto.createHash('sha256').update(normalised).digest('hex').slice(0, 32)
}
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:computeContentHash:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:FileTreeNode:interface" type="interface" identity="FileTreeNode" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Compute a 32-character SHA-256 hash of code content ignoring CIL markers and whitespace'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Define the recursive file tree node structure"]
// CIL[DOC-RESPONSIBILITY responsibility="Type file and directory nodes with status, language and children"]
// CIL[DOC-CONTEXT module="functions/_shared/cil" layer="shared" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="FileTreeNode interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Optional id, required name/path/type, optional extension, language, status, children, selected" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export interface FileTreeNode {
  id?: string | null
  name: string
  path: string
  type: 'file' | 'directory'
  extension?: string
  language?: string
  status?: FileStatus
  children?: FileTreeNode[]
  selected?: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the recursive file tree node structure'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:FileTreeNode:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:isSelectedPath:function" type="function" identity="isSelectedPath" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-MACRO purpose="Check if a file path matches a set of selected paths"]
// CIL[DOC-RESPONSIBILITY responsibility="Determine inclusion of a path under selection rules"]
// CIL[DOC-CONTEXT module="functions/_shared/cil" layer="shared" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="filePath: string, selectedPaths: string[]" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Empty selection means include all; matches exact path or a path prefix ending with '/'" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function isSelectedPath(filePath: string, selectedPaths: string[]): boolean {
  if (selectedPaths.length === 0) return true
  return selectedPaths.some(sp => {
    if (filePath === sp) return true
    if (sp === '') return true
    return filePath.startsWith(sp + '/')
  })
}
// CIL[DOC-VECTOR type="context" content="purpose='Check if a file path matches a set of selected paths'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:isSelectedPath:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:getFileStatus:function" type="function" identity="getFileStatus" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-MACRO purpose="Extract the CIL status from a file item record"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the status stored in item.data or a default discovered value"]
// CIL[DOC-CONTEXT module="functions/_shared/cil" layer="shared" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="fileItem: any" outputs="FileStatus" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns fileItem.data?.status or '0-discovered'" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function getFileStatus(fileItem: any): FileStatus {
  return fileItem.data?.status || '0-discovered'
}
// CIL[DOC-VECTOR type="context" content="purpose='Extract the CIL status from a file item record'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:getFileStatus:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:updateFileStatus:function" type="function" identity="updateFileStatus" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-MACRO purpose="Persist an updated CIL status and extra data for a file item"]
// CIL[DOC-RESPONSIBILITY responsibility="Write the new status and timestamp to the items table"]
// CIL[DOC-CONTEXT module="functions/_shared/cil" layer="shared" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="_ctx: any, fileItem: any, status: FileStatus, extraData: Record<string, any>" outputs="Promise<void>" errors="database errors" side_effects="updates items row"]
// CIL[DOC-MICRO logic_summary="Merges fileItem.data and extraData, sets status and last_status_at, then adminDb update by id" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export async function updateFileStatus(_ctx: any, fileItem: any, status: FileStatus, extraData: Record<string, any> = {}): Promise<void> {
  await adminDb
    .from('items')
    .update({
      data: {
        ...fileItem.data,
        ...extraData,
        status,
        last_status_at: new Date().toISOString(),
      },
    })
    .eq('id', fileItem.id)
}
// CIL[DOC-VECTOR type="context" content="purpose='Persist an updated CIL status and extra data for a file item'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:updateFileStatus:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:buildFileTree:function" type="function" identity="buildFileTree" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-MACRO purpose="Construct a hierarchical file tree from flat file records"]
// CIL[DOC-RESPONSIBILITY responsibility="Group file records into directories and files as a tree"]
// CIL[DOC-CONTEXT module="functions/_shared/cil" layer="shared" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="fileRecords: { file_path, id?, language, status?, extension }[]" outputs="FileTreeNode" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates root, splits paths by '/', builds nested children, attaches file metadata to leaf nodes" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function buildFileTree(fileRecords: { file_path: string; id?: string; language: string; status?: FileStatus; extension: string }[]): FileTreeNode {
  const root: FileTreeNode = { name: 'root', path: '', type: 'directory', children: [] }

  for (const record of fileRecords) {
    const parts = record.file_path.split('/')
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isFile = i === parts.length - 1
      const currentPath = parts.slice(0, i + 1).join('/')

      let child = current.children?.find(c => c.name === part)
      if (!child) {
        child = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'directory',
          children: isFile ? undefined : []
        }
        if (isFile) {
          child.id = record.id
          child.language = record.language
          child.status = record.status
          child.extension = record.extension
        }
        current.children!.push(child)
      }
      current = child
    }
  }

  return root
}
// CIL[DOC-VECTOR type="context" content="purpose='Construct a hierarchical file tree from flat file records'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:buildFileTree:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:updateTreeNodeStatus:function" type="function" identity="updateTreeNodeStatus" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-MACRO purpose="Recursively set the status of a tree node by file id"]
    // CIL[DOC-STABILITY stability="internal"]
    // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
    // CIL[DOC-CONTEXT module="cil" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-RESPONSIBILITY responsibility="Find a node with matching id and update its status"]
// CIL[DOC-CONTRACT inputs="tree: FileTreeNode, fileId: string, status: FileStatus" outputs="void" errors="none" side_effects="mutates tree.status"]
// CIL[DOC-MICRO logic_summary="Sets status if tree.id matches, otherwise recurses over children" notable_decisions=""]
export function updateTreeNodeStatus(tree: FileTreeNode, fileId: string, status: FileStatus): void {
  if (tree.id === fileId) {
    tree.status = status
    return
  }
  if (tree.children) {
    for (const child of tree.children) {
      updateTreeNodeStatus(child, fileId, status)
    }
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:updateTreeNodeStatus:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:updateTreeNodeByPath:function" type="function" identity="updateTreeNodeByPath" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Recursively set the status of a tree node by file id'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Update id and status of a file node by its path"]
// CIL[DOC-RESPONSIBILITY responsibility="Locate a file node by exact path and apply updates"]
// CIL[DOC-CONTEXT module="functions/_shared/cil" layer="shared" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="tree: FileTreeNode, filePath: string, updates: { id?, status? }" outputs="void" errors="none" side_effects="mutates matching tree node fields"]
// CIL[DOC-MICRO logic_summary="If file node path matches, assigns id and status from updates, then recurses children" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function updateTreeNodeByPath(tree: FileTreeNode, filePath: string, updates: { id?: string; status?: FileStatus }): void {
  if (tree.type === 'file' && tree.path === filePath) {
    if (updates.id !== undefined) tree.id = updates.id
    if (updates.status !== undefined) tree.status = updates.status
    return
  }
  if (tree.children) {
    for (const child of tree.children) {
      updateTreeNodeByPath(child, filePath, updates)
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Update id and status of a file node by its path'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:updateTreeNodeByPath:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:saveProjectTree:function" type="function" identity="saveProjectTree" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-MACRO purpose="Persist the file tree for a project to the items table"]
// CIL[DOC-RESPONSIBILITY responsibility="Store a file tree object and metadata inside the project item"]
// CIL[DOC-CONTEXT module="functions/_shared/cil" layer="shared" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="_ctx: any, projectId: string, tree: FileTreeNode, extraData: Record<string, any>, projectItem?: any" outputs="Promise<void>" errors="database errors" side_effects="updates items row"]
// CIL[DOC-MICRO logic_summary="Fetches project item if not provided, merges data, writes file_tree and last_tree_update" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export async function saveProjectTree(
  _ctx: any,
  projectId: string,
  tree: FileTreeNode,
  extraData: Record<string, any> = {},
  projectItem?: any
): Promise<void> {
  let projItem = projectItem
  if (!projItem) {
    const { data } = await adminDb.from('items').select('id, data').eq('id', projectId).maybeSingle()
    projItem = data
  }
  if (!projItem) return
  await adminDb
    .from('items')
    .update({
      data: {
        ...projItem.data,
        file_tree: tree,
        ...extraData,
        last_tree_update: new Date().toISOString(),
      },
    })
    .eq('id', projItem.id)
}
// CIL[DOC-VECTOR type="context" content="purpose='Persist the file tree for a project to the items table'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:saveProjectTree:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/cil.ts:stripCilBoilerplate:function" type="function" identity="stripCilBoilerplate" parent="~/.framework/functions/_shared/cil.ts"]
// CIL[DOC-MACRO purpose="Remove generated CIL placeholder phrases (e.g. 'No verified external callers') from chunk text before it is embedded or shown to the LLM."]
// CIL[DOC-RESPONSIBILITY responsibility="Define CIL_BOILERPLATE_PHRASES and strip them, plus emptied 'Context:'/'Blast radius:' labels and punctuation debris, from a string."]
// CIL[DOC-CONTEXT module="cil" layer="functions" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/agent-runner.ts,.framework/functions/cil-embeddings.ts"]
// CIL[DOC-CONTRACT inputs="text: string" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Case-insensitive removal of each phrase, then regex cleanup of dangling labels and ';;', ';.', '..' and double spaces." notable_decisions="Placeholder metadata was being parroted by the CIL agent as a fact about code usage; stripping at both embed time and context-build time removes it from the evidence path."]
// CIL[DOC-CONFIDENCE pass="first" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const CIL_BOILERPLATE_PHRASES = [
  'No verified external callers',
  'No direct caller data from CIL graph; local impact only',
  'No environment or build configuration dependencies identified',
  'Standard runtime; no special invariants documented',
]

export function stripCilBoilerplate(text: string): string {
  if (!text) return text
  let out = text
  for (const phrase of CIL_BOILERPLATE_PHRASES) {
    out = out.replace(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '')
  }
  out = out.replace(/\b(?:Blast radius|Context):\s*(?=\.\s|$)/g, '')
  out = out
    .replace(/;\s*;/g, ';')
    .replace(/;\s*\./g, '.')
    .replace(/\.\s*\./g, '.')
    .replace(/ {2,}/g, ' ')
  return out
}
// CIL[END stable_id="~/.framework/functions/_shared/cil.ts:stripCilBoilerplate:function"]
