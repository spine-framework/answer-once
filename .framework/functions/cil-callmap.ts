// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:MAP_SOURCE_STATUS:constant" type="constant" identity="MAP_SOURCE_STATUS" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Define source file status mapping for CIL callmap pass transitions"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the prior and target statuses that qualify files for mapping"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="constant" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Record of first/second pass status transitions" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Maps 'first' and 'second' pass statuses to prior and target FileStatus values" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const MAP_SOURCE_STATUS: Record<'first' | 'second', { prior: FileStatus; target: FileStatus }> = {
  first: { prior: '6-enriched', target: '7-embedded-mapped' },
  second: { prior: '6-enriched', target: '7-embedded-mapped' },
}
// CIL[DOC-VECTOR type="context" content="purpose='Define source file status mapping for CIL callmap pass transitions'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:MAP_SOURCE_STATUS:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:getMapSourceFilePaths:function" type="function" identity="getMapSourceFilePaths" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Filter project file statuses to find files eligible for mapping"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the list of file paths whose current status matches the mapping prior status"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="projectItem, secondPass flag" outputs="string[] of file paths" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Reads project file statuses and returns paths whose status equals the configured prior status" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function getMapSourceFilePaths(projectItem: any, secondPass: boolean): string[] {
  const fileStatuses: Record<string, string> = projectItem?.data?.file_statuses || {}
  const { prior } = secondPass ? MAP_SOURCE_STATUS.second : MAP_SOURCE_STATUS.first
  return Object.entries(fileStatuses)
    .filter(([, status]) => status === prior)
    .map(([filePath]) => filePath)
}
// CIL[DOC-VECTOR type="context" content="purpose='Filter project file statuses to find files eligible for mapping'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:getMapSourceFilePaths:function"]






// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Import dependencies and set module context for the .framework/functions/cil-callmap Netlify function"]
// CIL[DOC-RESPONSIBILITY responsibility="Load shared middleware, database, admin-data, CIL helpers and path utilities for the callmap handler"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="module_header" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Imports createHandler, adminDb, resolve-ids, admin-data CRUD, CIL status helpers, fs and path for the handler" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="maintainer"]

import { createHandler, requireSystemContextWithAudit } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { resolveLinkTypeIds } from './_shared/resolve-ids'
import { create as adminCreate, update as adminUpdate } from './admin-data'
import { FileStatus, FileTreeNode, isSelectedPath, getFileStatus, updateTreeNodeStatus, saveProjectTree } from './_shared/cil'
import * as fs from 'fs'
import * as path from 'path'
// CIL[DOC-VECTOR type="context" content="purpose='Import dependencies and set module context for the .framework/functions/cil-callmap Netlify function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:module_header:module_header"]









// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:STATUS_RANK:constant" type="constant" identity="STATUS_RANK" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Define numeric ordering for CIL pipeline file statuses"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a rank lookup for comparing CIL file status progression"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="constant" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Record<string, number>" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Maps each pipeline status string to an integer rank for ordering comparisons" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]

const STATUS_RANK: Record<string, number> = {
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
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:STATUS_RANK:constant"]

// Keep REST URL length under the ~8k character limit for UUID IN clauses.
// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:UUID_IN_LIMIT:constant" type="constant" identity="UUID_IN_LIMIT" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Define numeric ordering for CIL pipeline file statuses'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Set the maximum UUID count for IN clause link deletions"]
// CIL[DOC-RESPONSIBILITY responsibility="Limit the size of UUID IN clause batches to keep REST URLs under ~8k"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="constant" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="number" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Declares a constant of 100 UUIDs per batched IN clause" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const UUID_IN_LIMIT = 100
// CIL[DOC-VECTOR type="context" content="purpose='Set the maximum UUID count for IN clause link deletions'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:UUID_IN_LIMIT:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:PAGE_SIZE:constant" type="constant" identity="PAGE_SIZE" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Set the page size for batched project record fetching"]
// CIL[DOC-RESPONSIBILITY responsibility="Limit each adminDb query to 1000 rows for pagination"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="constant" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="number" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Declares a constant of 1000 records per page" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const PAGE_SIZE = 1000
// CIL[DOC-VECTOR type="context" content="purpose='Set the page size for batched project record fetching'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:PAGE_SIZE:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:fetchAllProjectRecords:function" type="function" identity="fetchAllProjectRecords" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Fetch all project records of a given KB type in pages"]
// CIL[DOC-RESPONSIBILITY responsibility="Return every active item of the requested kb_type for a project"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="projectId, kbType" outputs="any[] of item rows" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Paginates through items using offset ranges and accumulates all rows" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

async function fetchAllProjectRecords(
  projectId: string,
  kbType: 'cil_file' | 'cil_chunk'
): Promise<any[]> {
  const out: any[] = []
  let offset = 0
  while (true) {
    const { data } = await adminDb
      .from('items')
      .select('id, title, data')
      .filter('data->>project_id', 'eq', projectId)
      .filter('data->>kb_type', 'eq', kbType)
      .eq('is_active', true)
      .order('id')
      .range(offset, offset + PAGE_SIZE - 1)
    const rows = data || []
    out.push(...rows)
    if (rows.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }
  return out
}
// CIL[DOC-VECTOR type="context" content="purpose='Fetch all project records of a given KB type in pages'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:fetchAllProjectRecords:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:fetchAllProjectChunkNames:function" type="function" identity="fetchAllProjectChunkNames" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Fetch all chunk names and IDs for a project"]
// CIL[DOC-RESPONSIBILITY responsibility="Return chunk id, chunk_name and kb_type for every active cil_chunk"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="projectId" outputs="{id, chunk_name, kb_type}[]" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Paginates cil_chunk items and projects minimal fields for name lookup" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

async function fetchAllProjectChunkNames(projectId: string): Promise<{ id: string; chunk_name: string; kb_type: string }[]> {
  const out: any[] = []
  let offset = 0
  while (true) {
    const { data } = await adminDb
      .from('items')
      .select('id, data->>chunk_name, data->>kb_type')
      .filter('data->>project_id', 'eq', projectId)
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .eq('is_active', true)
      .order('id')
      .range(offset, offset + PAGE_SIZE - 1)
    const rows = data || []
    out.push(...rows)
    if (rows.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }
  return out
}
// CIL[DOC-VECTOR type="context" content="purpose='Fetch all chunk names and IDs for a project'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:fetchAllProjectChunkNames:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:fetchFileChunks:function" type="function" identity="fetchFileChunks" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Fetch all chunks for a specific file path"]
// CIL[DOC-RESPONSIBILITY responsibility="Return every active cil_chunk belonging to a file"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="projectId, filePath" outputs="any[] of chunk rows" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
    // CIL[DOC-STABILITY stability="internal"]
    // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MICRO logic_summary="Paginates cil_chunk items filtered by project and file_path" notable_decisions="[]"]

async function fetchFileChunks(projectId: string, filePath: string): Promise<any[]> {
  const out: any[] = []
  let offset = 0
  while (true) {
    const { data } = await adminDb
      .from('items')
      .select('id, title, data')
      .filter('data->>project_id', 'eq', projectId)
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .filter('data->>file_path', 'eq', filePath)
      .eq('is_active', true)
      .order('id')
      .range(offset, offset + PAGE_SIZE - 1)
    const rows = data || []
    out.push(...rows)
    if (rows.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }
  return out
}
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:fetchFileChunks:function"]



// CIL[DOC-VECTOR type="context" content="purpose='Fetch all chunks for a specific file path'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

      // CIL[DOC-STABILITY stability="internal"]
      // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
      // CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]


// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:rank:function" type="function" identity="rank" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Return numeric rank for a CIL file status"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert a status string to its position in the pipeline"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="status string or undefined" outputs="number rank" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Looks up the status in STATUS_RANK and returns 0 for unknown or missing values" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function rank(status: string | undefined): number {
  return status ? STATUS_RANK[status] || 0 : 0
}
// CIL[DOC-VECTOR type="context" content="purpose='Return numeric rank for a CIL file status'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:rank:function"]









// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:ExtractedImport:interface" type="interface" identity="ExtractedImport" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Define the shape of an extracted ES import"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the fields of a parsed import statement"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="interface" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="TypeScript interface" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Declares from_path, symbols and is_default fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface ExtractedImport {
  from_path: string   
  symbols: string[]   
  is_default: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the shape of an extracted ES import'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:ExtractedImport:interface"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:ExtractedCall:interface" type="interface" identity="ExtractedCall" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Define the shape of an extracted function call"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the fields of a parsed function call"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="interface" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="TypeScript interface" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Declares callee_name and is_await fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface ExtractedCall {
  callee_name: string   
  is_await: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the shape of an extracted function call'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:ExtractedCall:interface"]










// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:extractImports:function" type="function" identity="extractImports" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Parse ES import statements from source text"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a list of extracted imports with named, default and star aliases"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="source string" outputs="ExtractedImport[]" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Regex scans import declarations and resolves specifier blocks into symbol lists" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function extractImports(source: string): ExtractedImport[] {
  const results: ExtractedImport[] = []
  
  const importRe = /^import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/gm
  let m: RegExpExecArray | null
  while ((m = importRe.exec(source)) !== null) {
    const specifierBlock = m[1].trim()
    const fromPath = m[2]

    let symbols: string[] = []
    let isDefault = false

    if (specifierBlock.startsWith('{')) {
      
      const inner = specifierBlock.replace(/^\{|\}$/g, '').trim()
      symbols = inner.split(',').map(s => {
        const parts = s.trim().split(/\s+as\s+/)
        return (parts[parts.length - 1] || '').trim()
      }).filter(Boolean)
    } else if (specifierBlock.startsWith('*')) {
      
      const asMatch = specifierBlock.match(/\*\s+as\s+(\w+)/)
      if (asMatch) symbols = [asMatch[1]]
    } else {
      
      const defaultMatch = specifierBlock.match(/^(\w+)/)
      if (defaultMatch) { symbols = [defaultMatch[1]]; isDefault = true }
      const namedMatch = specifierBlock.match(/\{([^}]+)\}/)
      if (namedMatch) {
        const named = namedMatch[1].split(',').map(s => s.trim().split(/\s+as\s+/).pop()!.trim()).filter(Boolean)
        symbols = [...symbols, ...named]
      }
    }

    results.push({ from_path: fromPath, symbols, is_default: isDefault })
  }
  return results
}
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:extractImports:function"]


// CIL[DOC-VECTOR type="context" content="purpose='Parse ES import statements from source text'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]






// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:extractCalls:function" type="function" identity="extractCalls" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Parse function calls and symbol references from source text"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a deduplicated list of extracted calls, filtering keywords and short names"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="source string" outputs="ExtractedCall[]" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Regex scans for function call tokens, filters reserved words and context names, and deduplicates" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function extractCalls(source: string): ExtractedCall[] {
  const seen = new Set<string>()
  const results: ExtractedCall[] = []

  
  const callRe = /(await\s+)?(?:[\w$]+\.)*?([\w$]{2,})\s*\(/g
  let m: RegExpExecArray | null
  while ((m = callRe.exec(source)) !== null) {
    const isAwait = !!m[1]
    const calleeName = m[2]
    
    
    if (['if', 'for', 'while', 'switch', 'catch', 'return', 'new', 'typeof', 'instanceof', 'function'].includes(calleeName)) continue
    if (calleeName.length < 3) continue
    
    
    if (['ctx', 'req', 'res', 'data', 'props', 'state', 'params', 'config', 'options', 'args'].includes(calleeName)) continue
    
    if (seen.has(calleeName)) continue
    seen.add(calleeName)
    results.push({ callee_name: calleeName, is_await: isAwait })
  }
  return results
}
// CIL[DOC-VECTOR type="context" content="purpose='Parse function calls and symbol references from source text'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:extractCalls:function"]

// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:extractSymbolReferences:function" type="function" identity="extractSymbolReferences" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Find token references to a candidate set in source text"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the set of candidate symbol names found as bare references"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="source, candidateSet, ownName" outputs="string[] of matching symbols" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Tokenises the source, skips reserved and own name, and returns matched candidate tokens" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function extractSymbolReferences(source: string, candidateSet: Set<string>, ownName?: string): string[] {
  const reserved = new Set(['if','for','while','switch','catch','return','new','typeof','instanceof','function','const','let','var','class','interface','type','enum','export','import','from','await','async','true','false','null','undefined','this','super','extends','implements','as','in','of','with','yield'])
  const tokenRe = /[A-Za-z_$][A-Za-z0-9_$]*/g
  const seen = new Set<string>()
  let m: RegExpExecArray | null
  while ((m = tokenRe.exec(source)) !== null) {
    const name = m[0].toLowerCase()
    if (name === ownName || name.length < 2 || reserved.has(name) || !candidateSet.has(name)) continue
    seen.add(name)
  }
  return [...seen]
}
// CIL[DOC-VECTOR type="context" content="purpose='Find token references to a candidate set in source text'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:extractSymbolReferences:function"]




// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:extractExports:function" type="function" identity="extractExports" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Parse exported declarations from source text"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the list of exported names including named re-exports"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="source string" outputs="string[] of exported identifiers" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Regex matches export declarations and export blocks, resolving aliases" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function extractExports(source: string): string[] {
  const exports: string[] = []
  
  const exportRe = /^export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|var|type|interface|enum)\s+(\w+)/gm
  let m: RegExpExecArray | null
  while ((m = exportRe.exec(source)) !== null) {
    exports.push(m[1])
  }
  
  const namedRe = /^export\s+\{([^}]+)\}/gm
  while ((m = namedRe.exec(source)) !== null) {
    const named = m[1].split(',').map(s => s.trim().split(/\s+as\s+/).pop()!.trim()).filter(Boolean)
    exports.push(...named)
  }
  return [...new Set(exports)]
}
// CIL[DOC-VECTOR type="context" content="purpose='Parse exported declarations from source text'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:extractExports:function"]









// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:resolveImportPath:function" type="function" identity="resolveImportPath" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Resolve a relative import specifier to a project file path"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert a local import specifier to a normalised project-relative base path"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="fromFilePath, importSpecifier" outputs="string | null" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Normalises '.' and '..' segments relative to the importing file and returns the base path" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function resolveImportPath(fromFilePath: string, importSpecifier: string): string | null {
  
  if (!importSpecifier.startsWith('.')) return null

  const fromDir = fromFilePath.split('/').slice(0, -1).join('/')
  const segments = `${fromDir}/${importSpecifier}`.split('/')
  const resolved: string[] = []

  for (const seg of segments) {
    if (seg === '..') resolved.pop()
    else if (seg !== '.') resolved.push(seg)
  }

  const base = resolved.join('/')
  
  return base 
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolve a relative import specifier to a project file path'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:resolveImportPath:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:upsertLink:function" type="function" identity="upsertLink" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Create a single link if no matching link already exists"]
// CIL[DOC-RESPONSIBILITY responsibility="Insert a link record between a source and target item for a given link type"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="ctx, sourceItem, targetItem, linkTypeId, metadata" outputs="boolean indicating created" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Checks for an existing link and calls adminCreate when none is found" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export async function upsertLink(
  ctx: any,
  sourceItem: any,
  targetItem: any,
  linkTypeId: string,
  metadata: Record<string, any> = {}
): Promise<boolean> {

  const sourceType = sourceItem.data?.kb_type
  const targetType = targetItem.data?.kb_type
  if (!sourceType || !targetType) return false

  const { data: existing } = await adminDb
    .from('links')
    .select('id')
    .eq('source_type', sourceType)
    .eq('source_id', sourceItem.id)
    .eq('target_type', targetType)
    .eq('target_id', targetItem.id)
    .eq('link_type_id', linkTypeId)
    .maybeSingle()

  if (existing) return false

  try {
    await adminCreate(ctx, {
      entity: 'links',
      type_slug: 'link',
      source_id: sourceItem.id,
      source_type: sourceType,
      target_id: targetItem.id,
      target_type: targetType,
      link_type_id: linkTypeId,
      metadata,
    })
    return true
  } catch (err: any) {
    console.error('upsertLink failed:', err?.message || err)
    return false
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Create a single link if no matching link already exists'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:upsertLink:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:clearProjectLinks:function" type="function" identity="clearProjectLinks" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Delete all cil links for a project in batches"]
// CIL[DOC-RESPONSIBILITY responsibility="Remove import, call and export links tied to a project's file and chunk items"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="projectId, linkTypeIds" outputs="number of deleted links" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Collects file and chunk ids, then deletes links in UUID_IN_LIMIT sized IN batches" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

async function clearProjectLinks(projectId: string, linkTypeIds: string[]): Promise<number> {
  const [fileItems, chunkItems] = await Promise.all([
    fetchAllProjectRecords(projectId, 'cil_file'),
    fetchAllProjectRecords(projectId, 'cil_chunk'),
  ])

  const ids = [
    ...fileItems.map((f: any) => f.id),
    ...chunkItems.map((c: any) => c.id),
  ]
  if (!ids.length) return 0

  let deleted = 0
  for (const ltId of linkTypeIds.filter(Boolean)) {
    for (let i = 0; i < ids.length; i += UUID_IN_LIMIT) {
      const { data: deletedRows } = await adminDb
        .from('links')
        .delete()
        .eq('link_type_id', ltId)
        .in('source_id', ids.slice(i, i + UUID_IN_LIMIT))
        .select('id')
      deleted += (deletedRows || []).length
    }
  }
  return deleted
}
// CIL[DOC-VECTOR type="context" content="purpose='Delete all cil links for a project in batches'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:clearProjectLinks:function"]
// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:mapFile:function" type="function" identity="mapFile" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Create import, call and export links for a single file"]
// CIL[DOC-RESPONSIBILITY responsibility="Map a file's chunks and full content to related files and chunks"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="ctx, fileItem, projectId, allChunksByFile, chunksByNameArg, fileItemsByPath, importsLinkTypeId, callsLinkTypeId, exportsLinkTypeId" outputs="{imports_created, calls_created, exports_created}" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Extracts calls and symbols per chunk, imports per file, and exports back to the file item" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export async function mapFile(
  ctx: any,
  fileItem: any,
  projectId: string,
  allChunksByFile: Map<string, any[]>,
  chunksByNameArg: Map<string, any>,
  fileItemsByPath: Map<string, any>,
  importsLinkTypeId: string,
  callsLinkTypeId: string,
  exportsLinkTypeId: string
): Promise<{ imports_created: number; calls_created: number; exports_created: number }> {
  let importsCreated = 0, callsCreated = 0, exportsCreated = 0

  const filePath: string = fileItem.data?.file_path || fileItem.title
  const chunksInFile = allChunksByFile.get(filePath) || []

  const chunksByName = new Map<string, any>()
  for (const [name, chunk] of chunksByNameArg.entries()) {
    if (name) chunksByName.set(name.toLowerCase(), chunk)
  }
  const allChunkNames = Array.from(chunksByName.keys())
  const candidateSet = new Set(allChunkNames)

  for (const chunk of chunksInFile) {
    const codeContent: string = chunk.data?.code_content || ''
    if (!codeContent) continue

    
    const calls = extractCalls(codeContent)
    const callPromises = calls
      .filter((call) => {
        const targetChunk = chunksByName.get(call.callee_name.toLowerCase())
        return targetChunk && targetChunk.id !== chunk.id
      })
      .map((call) => {
        const targetChunk = chunksByName.get(call.callee_name.toLowerCase())!
        const callMetadata: Record<string, any> = {
          callee_name: call.callee_name,
          is_await: call.is_await,
        }
        if (chunk.data?.version_id) callMetadata.version_id = chunk.data.version_id
        return upsertLink(ctx, chunk, targetChunk, callsLinkTypeId, callMetadata)
      })
    const callResults = await Promise.all(callPromises)
    callsCreated += callResults.filter(Boolean).length

    
    const symbolRefs = extractSymbolReferences(codeContent, candidateSet, (chunk.data?.chunk_name || '').toLowerCase())
    const refPromises = symbolRefs
      .filter((refName) => {
        const targetChunk = chunksByName.get(refName.toLowerCase())
        return targetChunk && targetChunk.id !== chunk.id
      })
      .map((refName) => {
        const targetChunk = chunksByName.get(refName.toLowerCase())!
        const refMetadata: Record<string, any> = {
          callee_name: refName,
          is_symbol_reference: true,
        }
        if (chunk.data?.version_id) refMetadata.version_id = chunk.data.version_id
        return upsertLink(ctx, chunk, targetChunk, callsLinkTypeId, refMetadata)
      })
    const refResults = await Promise.all(refPromises)
    callsCreated += refResults.filter(Boolean).length
  }

  
  
  const fullFileContent = chunksInFile.map((c: any) => c.data?.code_content || '').join('\n')
  const imports = extractImports(fullFileContent)

  const importPromises = imports
    .map((imp) => {
      const resolvedBase = resolveImportPath(filePath, imp.from_path)
      if (!resolvedBase) return null

      
      const targetFile =
        fileItemsByPath.get(resolvedBase) ||
        fileItemsByPath.get(resolvedBase + '.ts') ||
        fileItemsByPath.get(resolvedBase + '.tsx') ||
        fileItemsByPath.get(resolvedBase + '/index.ts') ||
        fileItemsByPath.get(resolvedBase + '/index.tsx')

      if (!targetFile || targetFile.id === fileItem.id) return null

      const importMetadata: Record<string, any> = {
        symbols: imp.symbols,
        is_default: imp.is_default,
        specifier: imp.from_path,
      }
      if (fileItem.data?.version_id) importMetadata.version_id = fileItem.data.version_id
      return upsertLink(ctx, fileItem, targetFile, importsLinkTypeId, importMetadata)
    })
    .filter((p): p is Promise<boolean> => p !== null)
  const importResults = await Promise.all(importPromises)
  importsCreated += importResults.filter(Boolean).length

  
  const exportedNames = extractExports(fullFileContent)
  const exportPromises = exportedNames
    .map((exportedName) => {
      const chunk = chunksByName.get(exportedName.toLowerCase())
      if (!chunk) return null
      return upsertLink(ctx, chunk, fileItem, exportsLinkTypeId, {
        exported_name: exportedName,
      })
    })
    .filter((p): p is Promise<boolean> => p !== null)
  const exportResults = await Promise.all(exportPromises)
  exportsCreated += exportResults.filter(Boolean).length

  return { imports_created: importsCreated, calls_created: callsCreated, exports_created: exportsCreated }
}
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:mapFile:function"]



// CIL[DOC-VECTOR type="context" content="purpose='Create import, call and export links for a single file'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]



// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:markFilePass4bComplete:function" type="function" identity="markFilePass4bComplete" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Advance a file to the embedded-mapped pipeline status"]
// CIL[DOC-RESPONSIBILITY responsibility="Update the file item and project tree status after mapping completes"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="ctx, fileItem, tree, secondPass, projectItem" outputs="void" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Skips files before 6-enriched, updates file status, advances project file_statuses and mutates projectItem" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

async function markFilePass4bComplete(
  ctx: any,
  fileItem: any,
  tree: FileTreeNode | null,
  secondPass = false,
  projectItem?: any
): Promise<void> {
  const cil_file_status: FileStatus = secondPass ? '7-embedded-mapped' : '7-embedded-mapped'
  const pipeline_status: FileStatus = secondPass ? '7-embedded-mapped' : '7-embedded-mapped'
  const currentFileStatus = getFileStatus(fileItem)
  const filePath: string = fileItem.data?.file_path

  
  if (rank(currentFileStatus) < rank('6-enriched')) {
    console.error(`markFilePass4bComplete skipped ${filePath}: current status ${currentFileStatus} is before 6-enriched`)
    return
  }

  
  if (rank(currentFileStatus) < rank(cil_file_status)) {
    const updateCtx = { ...ctx, query: { ...(ctx.query || {}), entity: 'items', id: fileItem.id } }
    await adminUpdate(updateCtx, {
      data: {
        ...fileItem.data,
        status: cil_file_status,
        last_status_at: new Date().toISOString(),
      },
    }).catch((e: any) => console.error(`mark ${cil_file_status} failed:`, e.message))
  }
  if (tree) updateTreeNodeStatus(tree, fileItem.id, cil_file_status)

  
  const projectId: string = fileItem.data?.project_id
  if (!filePath || !projectId) return

  let projItem = projectItem
  if (!projItem) {
    const { data } = await adminDb.from('items').select('id, data').eq('id', projectId).maybeSingle()
    projItem = data
  }
  if (!projItem) return

  const currentPipelineStatus = projItem.data?.file_statuses?.[filePath]
  if (rank(currentPipelineStatus) >= rank(pipeline_status)) return

  const fileStatuses = { ...(projItem.data?.file_statuses || {}) }
  fileStatuses[filePath] = pipeline_status
  fileStatuses[`${filePath}_updated`] = new Date().toISOString()
  const { data: updateResult, error: updateErr } = await adminDb.from('items')
    .update({ data: { ...projItem.data, file_statuses: fileStatuses } })
    .eq('id', projectId)
    .select('id')
  if (updateErr) {
    console.error(`pipeline status advance to ${pipeline_status} failed:`, updateErr.message)
    return
  }
  console.log(`pipeline status advance to ${pipeline_status} result:`, JSON.stringify(updateResult))

  
  if (projectItem) {
    if (!projectItem.data) projectItem.data = {}
    projectItem.data.file_statuses = fileStatuses
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Advance a file to the embedded-mapped pipeline status'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:markFilePass4bComplete:function"]






// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:isTestFile:function" type="function" identity="isTestFile" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Detect whether a file path is a test file"]
// CIL[DOC-RESPONSIBILITY responsibility="Return true for paths that look like unit, spec or E2E tests"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="filePath" outputs="boolean" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Tests the path against common test, __tests__ and tests directory patterns" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

function isTestFile(filePath: string): boolean {
  return /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filePath) ||
    /\/__tests__\//.test(filePath) ||
    /\/tests?\//.test(filePath)
}
// CIL[DOC-VECTOR type="context" content="purpose='Detect whether a file path is a test file'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:isTestFile:function"]




// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:mapTests:function" type="function" identity="mapTests" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Create tested_by links between chunks and test files"]
// CIL[DOC-RESPONSIBILITY responsibility="Scan test files, match chunk names and upsert tested_by links and test path fields"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="function" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="ctx, projectId, repoPath, testedByLinkTypeId, chunksByNameArg" outputs="{test_files_scanned, tested_by_links_created, chunks_updated, errors}" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="Reads test sources, matches imported names, describe/it strings and calls, then links and updates chunk test paths" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

async function mapTests(
  ctx: any,
  projectId: string,
  repoPath: string,
  testedByLinkTypeId: string,
  chunksByNameArg: Map<string, any>
): Promise<{ test_files_scanned: number; tested_by_links_created: number; chunks_updated: number; errors: string[] }> {
  const chunksByName = new Map<string, any>()
  for (const [name, chunk] of chunksByNameArg.entries()) {
    if (name) chunksByName.set(name.toLowerCase(), chunk)
  }
  const errors: string[] = []
  let testFilesScanned = 0, linksCreated = 0, chunksUpdated = 0

  const allFiles = await fetchAllProjectRecords(projectId, 'cil_file')

  const testFiles = allFiles.filter((f: any) => isTestFile(f.data?.file_path || f.title))

  const matchesByFile = new Map<string, Set<string>>()
  const allMatchedNames = new Set<string>()

  for (const testFileItem of testFiles) {
    const relPath: string = testFileItem.data?.file_path || testFileItem.title
    const absPath = path.join(repoPath, relPath)

    try {
      if (!fs.existsSync(absPath)) continue
      const source = fs.readFileSync(absPath, 'utf-8')
      testFilesScanned++

      const matchedChunkNames = new Set<string>()

      const importRe = /import\s+\{([^}]+)\}/g
      let m: RegExpExecArray | null
      while ((m = importRe.exec(source)) !== null) {
        const names = m[1].split(',').map(s => s.trim().split(/\s+as\s+/).shift()!.trim()).filter(Boolean)
        for (const n of names) {
          if (chunksByName.has(n.toLowerCase())) matchedChunkNames.add(n.toLowerCase())
        }
      }

      const stringRe = /(?:describe|it|test|beforeEach|afterEach)\s*\(\s*['"`]([^'"`]+)['"`]/g
      while ((m = stringRe.exec(source)) !== null) {
        const words = m[1].split(/\W+/)
        for (const word of words) {
          if (chunksByName.has(word.toLowerCase())) matchedChunkNames.add(word.toLowerCase())
        }
      }

      const callRe = /\b(\w{3,})\s*\(/g
      while ((m = callRe.exec(source)) !== null) {
        const name = m[1].toLowerCase()
        if (chunksByName.has(name)) matchedChunkNames.add(name)
      }

      matchesByFile.set(relPath, matchedChunkNames)
      for (const name of matchedChunkNames) allMatchedNames.add(name)
    } catch (err) {
      errors.push(`${relPath}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const matchedIds = [...allMatchedNames]
    .map(name => chunksByName.get(name)?.id)
    .filter(Boolean)
  const fullChunksByName = new Map<string, any>()
  for (let i = 0; i < matchedIds.length; i += UUID_IN_LIMIT) {
    const { data } = await adminDb
      .from('items')
      .select('id, title, data')
      .in('id', matchedIds.slice(i, i + UUID_IN_LIMIT))
    for (const c of data || []) {
      const name = c.data?.chunk_name
      if (name) fullChunksByName.set(name.toLowerCase(), c)
    }
  }

  for (const testFileItem of testFiles) {
    const relPath: string = testFileItem.data?.file_path || testFileItem.title
    const absPath = path.join(repoPath, relPath)
    const isE2E = /e2e|cypress|playwright|integration/.test(relPath)
    const matchedChunkNames = matchesByFile.get(relPath)
    if (!matchedChunkNames) continue

    for (const chunkName of matchedChunkNames) {
      const chunk = fullChunksByName.get(chunkName)
      if (!chunk) continue
      const cd = chunk.data || {}

      const created = await upsertLink(ctx, chunk, testFileItem, testedByLinkTypeId, {
        test_path: relPath,
        is_e2e: isE2E,
      })
      if (created) linksCreated++

      const pathField = isE2E ? 'test_e2e_path' : 'test_unit_path'
      const existingPath = cd[pathField]
      if (!existingPath || existingPath === relPath) {
        await adminUpdate({ ...ctx, query: { ...(ctx.query || {}), entity: 'items', id: chunk.id } } as any, {
          data: { ...cd, [pathField]: relPath },
        })
        chunksUpdated++
      }
    }
  }

  return { test_files_scanned: testFilesScanned, tested_by_links_created: linksCreated, chunks_updated: chunksUpdated, errors }
}
// CIL[DOC-VECTOR type="context" content="purpose='Create tested_by links between chunks and test files'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:mapTests:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-callmap.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/cil-callmap.ts"]
// CIL[DOC-MACRO purpose="Expose the CIL callmap Netlify function handler"]
// CIL[DOC-RESPONSIBILITY responsibility="Dispatch map_project, map_file, map_tests, status and clear actions"]
// CIL[DOC-CONTEXT module=".framework/functions/cil-callmap" layer="constant" related_files=".framework/functions/_shared/cil.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-callmap.ts"]
// CIL[DOC-CONTRACT inputs="ctx, body, typeId, ids" outputs="JSON response object" errors="throws or returns error strings" side_effects="reads/writes CIL items and links via adminDb and admin-data"]
// CIL[DOC-MICRO logic_summary="createHandler that resolves link type ids, queries chunks/files, calls mapFile/mapTests and returns counts" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export const handler = createHandler(async (ctx, body) => {
  // CIL is operator tooling — every action touches the service-role client
  // and server filesystem. System principals only; tenant callers stop here.
  requireSystemContextWithAudit(ctx)

  const action = ctx.query?.action

  
  if (action === 'status') {
    const projectId = ctx.query?.project_id || body?.project_id
    if (!projectId) throw new Error('project_id is required')

    const linkTypeIds = await resolveLinkTypeIds(['cil_imports','cil_calls','cil_exports','cil_tested_by'])
    const importsTypeId = linkTypeIds['cil_imports'] ?? null
    const callsTypeId = linkTypeIds['cil_calls'] ?? null
    const exportsTypeId = linkTypeIds['cil_exports'] ?? null
    const testedByTypeId = linkTypeIds['cil_tested_by'] ?? null

    const fileItems = await fetchAllProjectRecords(projectId, 'cil_file')
    const chunkItems = await fetchAllProjectRecords(projectId, 'cil_chunk')

    const fileIds  = fileItems.map((f: any) => f.id)
    const chunkIds = chunkItems.map((c: any) => c.id)

    async function countLinksForIds(typeId: string, ids: string[], batchSize = UUID_IN_LIMIT): Promise<number> {
      if (!typeId || !ids.length) return 0
      let total = 0
      for (let i = 0; i < ids.length; i += batchSize) {
        const { count } = await adminDb.from('links').select('id', { count: 'exact' })
          .eq('link_type_id', typeId).in('source_id', ids.slice(i, i + batchSize))
        total += count || 0
      }
      return total
    }

    const [importCount, callCount, exportCount, testedByCount] = await Promise.all([
      countLinksForIds(importsTypeId, fileIds),
      countLinksForIds(callsTypeId, chunkIds),
      countLinksForIds(exportsTypeId, chunkIds),
      countLinksForIds(testedByTypeId, chunkIds),
    ])

    return {
      project_id: projectId,
      total_files: (fileItems || []).length,
      total_chunks: (chunkItems || []).length,
      import_links: importCount,
      call_links: callCount,
      export_links: exportCount,
      tested_by_links: testedByCount,
      total_links: importCount + callCount + exportCount + testedByCount,
    }
  }

  
  if (action === 'clear') {
    const projectId = body?.project_id
    if (!projectId) throw new Error('project_id is required')

    const clearLinkTypeIds = await resolveLinkTypeIds(['cil_imports','cil_calls','cil_exports']).catch(() => ({} as Record<string, string>))
    const importsTypeId = clearLinkTypeIds['cil_imports'] ?? null
    const callsTypeId = clearLinkTypeIds['cil_calls'] ?? null
    const exportsTypeId = clearLinkTypeIds['cil_exports'] ?? null

    const { data: chunkItems } = await adminDb
      .from('items').select('id')
      .filter('data->>project_id', 'eq', projectId)
      .filter('data->>kb_type', 'in', '(cil_chunk,cil_file)')

    const ids = (chunkItems || []).map((c: any) => c.id)
    let deleted = 0

    for (const ltId of [importsTypeId, callsTypeId, exportsTypeId].filter(Boolean)) {
      if (!ids.length) continue
      for (let i = 0; i < ids.length; i += UUID_IN_LIMIT) {
        const { data: deletedRows } = await adminDb.from('links')
          .delete().eq('link_type_id', ltId!).in('source_id', ids.slice(i, i + UUID_IN_LIMIT)).select('id')
        deleted += (deletedRows || []).length
      }
    }

    
    const { data: projectItem } = await adminDb.from('items').select('id, data').eq('id', projectId).maybeSingle()
    const fileTree = (projectItem?.data?.file_tree as FileTreeNode) || null
    const { data: fileItems } = await adminDb
      .from('items')
      .select('id, data')
      .filter('data->>project_id', 'eq', projectId)
      .filter('data->>kb_type', 'eq', 'cil_file')
      .eq('is_active', true)

    let resetCount = 0
    for (const fileItem of fileItems || []) {
      if (getFileStatus(fileItem) === '7-embedded-mapped' || getFileStatus(fileItem) === '7-embedded-mapped') {
        const updateCtx = { ...ctx, query: { ...(ctx.query || {}), entity: 'items', id: fileItem.id } }
        await adminUpdate(updateCtx, {
          data: {
            ...fileItem.data,
            status: '3-documented',
            last_status_at: new Date().toISOString(),
          },
        }).catch((e: any) => console.error(`reset status ${fileItem.id}: ${e.message}`))
        if (fileTree) updateTreeNodeStatus(fileTree, fileItem.id, '3-documented')
        resetCount++
      }
    }
    if (fileTree && projectItem) {
      await saveProjectTree(ctx, projectId, fileTree, { last_ingested_at: new Date().toISOString() })
    }

    return { project_id: projectId, deleted_links: deleted, reset_files: resetCount }
  }

  
  if (action === 'map_file') {
    const fileId = body?.file_id
    if (!fileId) throw new Error('file_id is required')

    const { data: fileItem } = await adminDb
      .from('items').select('id, title, data').eq('id', fileId).maybeSingle()
    if (!fileItem) throw new Error(`File not found: ${fileId}`)

    const projectId = fileItem.data?.project_id
    if (!projectId) throw new Error('File has no project_id')

    const fileLinkTypeIds = await resolveLinkTypeIds(['cil_imports','cil_calls','cil_exports'])
    const importsTypeId = fileLinkTypeIds['cil_imports']
    const callsTypeId = fileLinkTypeIds['cil_calls']
    const exportsTypeId = fileLinkTypeIds['cil_exports']

    
    const [allFiles, allChunkNames, fileChunks] = await Promise.all([
      fetchAllProjectRecords(projectId, 'cil_file'),
      fetchAllProjectChunkNames(projectId),
      fetchFileChunks(projectId, fileItem.data?.file_path || fileItem.title),
    ])

    const fileItemsByPath = new Map((allFiles || []).map((f: any) => [f.data?.file_path || f.title, f]))
    const chunksByName = new Map<string, any>()
    for (const c of allChunkNames) {
      if (c.chunk_name) chunksByName.set(c.chunk_name.toLowerCase(), { id: c.id, data: { chunk_name: c.chunk_name, kb_type: c.kb_type || 'cil_chunk' } })
    }
    const allChunksByFile = new Map<string, any[]>()
    const fp = fileItem.data?.file_path || fileItem.title
    allChunksByFile.set(fp, fileChunks)

    const result = await mapFile(
      ctx, fileItem, projectId,
      allChunksByFile, chunksByName, fileItemsByPath,
      importsTypeId, callsTypeId, exportsTypeId
    )

    return { file_id: fileId, ...result }
  }

  
  if (action === 'map_tests') {
    const projectId = body?.project_id
    if (!projectId) throw new Error('project_id is required')

    
    const { data: projectItem } = await adminDb
      .from('items').select('data').eq('id', projectId).maybeSingle()
    const repoPath: string = projectItem?.data?.repo_path || body?.repo_path || ''
    if (!repoPath) throw new Error('Project has no repo_path — pass repo_path in body')

    const testLinkTypeIds = await resolveLinkTypeIds(['cil_tested_by'])
    const testedByTypeId = testLinkTypeIds['cil_tested_by']
    const allChunks = await fetchAllProjectRecords(projectId, 'cil_chunk')
    const chunksByName = new Map<string, any>()
    for (const c of allChunks) {
      const name = c.data?.chunk_name
      if (name) chunksByName.set(name, { id: c.id, data: { chunk_name: c.data?.chunk_name, kb_type: c.data?.kb_type || 'cil_chunk' } })
    }
    const result = await mapTests(ctx, projectId, repoPath, testedByTypeId, chunksByName)
    return { project_id: projectId, repo_path: repoPath, ...result }
  }

  
  
  
  
  
  
  if (action === 'map_project') {
    const projectId = body?.project_id
    if (!projectId) throw new Error('project_id is required')

    const pageLimit  = Math.min(parseInt(body?.limit  || '5', 10), 15)
    const pageOffset = parseInt(body?.offset || '0', 10)
    const filePath   = body?.file_path || undefined
    const force      = body?.force_regenerate ?? body?.force ?? false
    const secondPass = body?.second_pass ?? false
    const fast       = body?.fast === true

    const targetPipelineStatus = secondPass ? '7-embedded-mapped' : '7-embedded-mapped'

    const projectLinkTypeIds = await resolveLinkTypeIds(['cil_imports','cil_calls','cil_exports','cil_tested_by']).catch(() => ({} as Record<string, string>))
    const importsTypeId = projectLinkTypeIds['cil_imports']
    const callsTypeId = projectLinkTypeIds['cil_calls']
    const exportsTypeId = projectLinkTypeIds['cil_exports']
    const testedByTypeId = projectLinkTypeIds['cil_tested_by'] ?? null

    if (force && pageOffset === 0) {
      await clearProjectLinks(projectId, [importsTypeId, callsTypeId, exportsTypeId, testedByTypeId])
    }

    
    const { data: projectItem } = await adminDb.from('items').select('id, data').eq('id', projectId).maybeSingle()
    const selectedExtensions = body?.selected_extensions || (projectItem?.data?.selected_extensions as string[] | undefined)
    const selectedPaths: string[] = body?.selected_paths || projectItem?.data?.selected_paths || []
    const fileTree = (projectItem?.data?.file_tree as FileTreeNode) || null

    
    const sourceFilePaths = filePath
      ? [filePath]
      : fast
        ? selectedPaths
        : force
          ? selectedPaths
          : getMapSourceFilePaths(projectItem, secondPass)

    let filesQ = adminDb.from('items').select('id, title, data')
      .filter('data->>project_id', 'eq', projectId)
      .filter('data->>kb_type', 'eq', 'cil_file').eq('is_active', true)
      .order('id')
      .limit(100000)
    if (filePath) filesQ = filesQ.filter('data->>file_path', 'eq', filePath)

    const [filesResult, allChunkNamesResult] = await Promise.all([
      filesQ,
      fetchAllProjectChunkNames(projectId),
    ])

    const allFiles = filesResult.data || []

    const fileItemsByPath = new Map(allFiles.map((f: any) => [f.data?.file_path || f.title, f]))

    const chunksByName = new Map<string, any>()
    for (const c of allChunkNamesResult) {
      const name = c.chunk_name
      if (name) chunksByName.set(name.toLowerCase(), { id: c.id, data: { chunk_name: c.chunk_name, kb_type: c.kb_type || 'cil_chunk' } })
    }

    const mappedFileStatus: FileStatus = secondPass ? '7-embedded-mapped' : '7-embedded-mapped'
    const syncFiles = allFiles.filter((f: any) => {
      const fp = f.data?.file_path || f.title
      const status = getFileStatus(f)
      const ext = f.data?.extension as string || ''
      const extMatch = (selectedExtensions || []).length === 0 || (selectedExtensions || []).includes(ext)
      return status === mappedFileStatus
        && rank(projectItem?.data?.file_statuses?.[fp]) < rank(targetPipelineStatus)
        && isSelectedPath(fp, selectedPaths)
        && extMatch
    })
    if (!fast) {
      for (const fileItem of syncFiles) {
        await markFilePass4bComplete(ctx, fileItem, fileTree, secondPass, projectItem)
      }
    }

    const eligibleFiles = allFiles.filter((f: any) => {
      const fp = f.data?.file_path || f.title
      const ext = f.data?.extension as string || ''
      const extMatch = (selectedExtensions || []).length === 0 || (selectedExtensions || []).includes(ext)
      if (filePath && fp !== filePath) return false
      return sourceFilePaths.includes(fp) && isSelectedPath(fp, selectedPaths) && extMatch
    })

    const totalFiles = eligibleFiles.length
    const pageFiles = eligibleFiles.slice(pageOffset, pageOffset + pageLimit)

    const pageFilePaths = pageFiles.map(f => f.data?.file_path || f.title)
    let pageChunks: any[] = []
    if (pageFilePaths.length > 0) {
      const { data } = await adminDb.from('items').select('id, title, data')
        .filter('data->>project_id', 'eq', projectId)
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .eq('is_active', true)
        .in('data->>file_path' as any, pageFilePaths)
        .limit(100000)
      pageChunks = data || []
    }

    const allChunksByFile = new Map<string, any[]>()
    for (const c of pageChunks) {
      const name = c.data?.chunk_name || ''
      if (name) chunksByName.set(name.toLowerCase(), c)
      const fp = c.data?.file_path
      if (!fp) continue
      if (!allChunksByFile.has(fp)) allChunksByFile.set(fp, [])
      allChunksByFile.get(fp)!.push(c)
    }

    if (!chunksByName.size) {
      return { project_id: projectId, file_path: filePath || null, message: 'No chunks found — run Pass 1 + Pass 2 first', imports_created: 0, calls_created: 0, exports_created: 0, has_more: false }
    }

    let totalImports = 0, totalCalls = 0, totalExports = 0
    const errors: string[] = []

    for (const fileItem of pageFiles) {
      try {
        const result = await mapFile(
          ctx, fileItem, projectId,
          allChunksByFile, chunksByName, fileItemsByPath,
          importsTypeId, callsTypeId, exportsTypeId
        )
        totalImports += result.imports_created
        totalCalls   += result.calls_created
        totalExports += result.exports_created

        
        if (!fast) {
          await markFilePass4bComplete(ctx, fileItem, fileTree, secondPass, projectItem)
        }
      } catch (err) {
        errors.push(`${fileItem.data?.file_path || fileItem.id}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    const nextOffset = pageOffset + pageFiles.length
    const isLastPage = pageFiles.length === 0 || pageFiles.length < pageLimit || nextOffset >= totalFiles

    
    let testResult: { test_files_scanned: number; tested_by_links_created: number; chunks_updated: number; errors: string[] } | null = null
    if (isLastPage && !fast) {
      const repoPath: string = projectItem?.data?.repo_path || ''
      if (repoPath) {
        try {
          const testByLinkIds = await resolveLinkTypeIds(['cil_tested_by']).catch(() => ({} as Record<string, string>))
          const testedByTypeId = testByLinkIds['cil_tested_by']
          if (testedByTypeId) {
            testResult = await mapTests(ctx, projectId, repoPath, testedByTypeId, chunksByName)
            errors.push(...(testResult.errors || []))
          }
        } catch {
        }
      }
    }

    
    if (fileTree && isLastPage && !fast) {
      await saveProjectTree(ctx, projectId, fileTree, { last_ingested_at: new Date().toISOString() }, projectItem)
    }

    return {
      project_id: projectId,
      file_path: filePath || null,
      total_files: totalFiles,
      files_processed: pageFiles.length,
      imports_created: totalImports,
      calls_created: totalCalls,
      exports_created: totalExports,
      tested_by_links_created: testResult?.tested_by_links_created ?? 0,
      test_files_scanned: testResult?.test_files_scanned ?? 0,
      chunks_updated_with_test_paths: testResult?.chunks_updated ?? 0,
      total_links_created: totalImports + totalCalls + totalExports + (testResult?.tested_by_links_created ?? 0),
      errors,
      has_more: !isLastPage,
      next_offset: !isLastPage ? nextOffset : null,
      done_total: pageOffset + pageFiles.length,
    }
  }

  throw new Error(`Unknown action: ${action}. Valid: map_project, map_file, map_tests, status, clear`)
})
// CIL[DOC-VECTOR type="context" content="purpose='Expose the CIL callmap Netlify function handler'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-callmap.ts:handler:constant"]



