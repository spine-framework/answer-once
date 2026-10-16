/**
 * @module   validate
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * This module provides validation utilities for the MCP (Model Context Protocol) server, ensuring that incoming data adheres to defined schemas. It plays a crucial role in maintaining data integrity and security within the application by validating requests before they are processed. INVARIANT: All incoming data must conform to the specified Zod schemas to prevent runtime errors.
 *
 * @seeAlso db.js (provides database access for validation checks).
 * @seeAlso server.js (defines the MCP server context and its operations).
 * @seeAlso zod (used for schema validation).
 *
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="MCP validation utilities"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides validation utilities for the MCP CIL server and registers the related MCP tools."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="unknown" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Provides validation utilities for the MCP CIL server and registers the related MCP tools." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import * as ts from 'typescript'
import { computeContentHash } from '../../../functions/_shared/cil.js'
// CIL[DOC-VECTOR type="context" content="purpose='MCP validation utilities'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:normaliseAgentChunkContent:function" type="function" identity="normaliseAgentChunkContent" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="normaliseAgentChunkContent function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the normaliseAgentChunkContent function."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="raw: string" outputs="unknown" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the normaliseAgentChunkContent function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function normaliseAgentChunkContent(raw: string): string {
  const lines = raw.replace(/\r\n/g, '\n').split('\n')
  const filtered = lines.filter(line => {
    const trimmed = line.trim()
    return !trimmed.match(/^(?:(?:\/\/|--|#)\s*|<!--\s*)CIL\[(BEGIN|END)/) && !trimmed.match(/^(?:(?:\/\/|--|#)\s*|<!--\s*)CIL\[DOC-/)
  })
  const collapsed: string[] = []
  let lastBlank = false
  for (const line of filtered) {
    const isBlank = line.trim() === ''
    if (isBlank && lastBlank) continue
    collapsed.push(line)
    lastBlank = isBlank
  }
  return collapsed.join('\n').trim()
}
// CIL[DOC-VECTOR type="context" content="purpose='normaliseAgentChunkContent function'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:normaliseAgentChunkContent:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:computeChunkHash:function" type="function" identity="computeChunkHash" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="computeChunkHash function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the computeChunkHash function."]
    // CIL[DOC-STABILITY stability="internal"]
    // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="content: string" outputs="unknown" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the computeChunkHash function." notable_decisions="[]"]
function computeChunkHash(content: string): string {
  return crypto.createHash('sha256').update(normaliseAgentChunkContent(content), 'utf8').digest('hex').slice(0, 16)
}
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:computeChunkHash:function"]

// CIL[DOC-VECTOR type="context" content="purpose='computeChunkHash function'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:getChunkByStableId:function" type="function" identity="getChunkByStableId" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="getChunkByStableId function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the getChunkByStableId function."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="projectId: string, stableId: string, versionId?: string" outputs="unknown" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the getChunkByStableId function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getChunkByStableId(projectId: string, stableId: string, versionId?: string) {
  let q = adminDb.from('items').select('id, title, data')
    .filter('data->>kb_type', 'eq', 'cil_chunk')
    .filter('data->>project_id', 'eq', projectId)
    .filter('data->>stable_id', 'eq', stableId)
    .eq('is_active', true)
  if (versionId) q = (q as any).filter('data->>version_id', 'eq', versionId)
  const { data } = await (q as any).maybeSingle()
  return data
}
// CIL[DOC-VECTOR type="context" content="purpose='getChunkByStableId function'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:getChunkByStableId:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:parseAgentAttributes:function" type="function" identity="parseAgentAttributes" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="parseAgentAttributes function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the parseAgentAttributes function."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="attrString: string" outputs="unknown" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the parseAgentAttributes function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Parses a string of agent attributes formatted as key-value pairs into a record. This function is useful for extracting structured data from unstructured attribute strings.
 *
 * @inputSpec
 *   - attrString: string (required) — a string containing agent attributes in the format key="value".
 * @outputSpec  Record<string, string> — an object mapping attribute names to their corresponding values.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
function parseAgentAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const regex = /(\w+)="([^"]*)"/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(attrString)) !== null) {
    attrs[match[1]] = match[2]
  }
  return attrs
}
// CIL[DOC-VECTOR type="context" content="purpose='parseAgentAttributes function'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:parseAgentAttributes:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:detectLanguage:function" type="function" identity="detectLanguage" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="detectLanguage function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the detectLanguage function."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="filePath: string" outputs="unknown" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the detectLanguage function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The detectLanguage function determines the programming language of a file based on its file extension. It maps known extensions to their corresponding languages for identification purposes.
 *
 * @macro       Language detection utility for file types.
 * @micro       Utilizes a mapping object to return the language associated with the file extension.
 * @inputSpec
 *   - filePath: string (required) — the path of the file whose language is to be detected.
 * @outputSpec  string — the detected language or 'unknown' if the extension is not recognized.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  const map: Record<string, string> = {
    '.ts': 'typescript',
    '.tsx': 'typescriptreact',
    '.js': 'javascript',
    '.jsx': 'javascriptreact',
    '.sql': 'sql',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.toml': 'toml',
    '.sh': 'shell',
    '.md': 'markdown',
  }
  return map[ext] || 'unknown'
}
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:detectLanguage:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:ParsedMarker:interface" type="interface" identity="ParsedMarker" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='detectLanguage function'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="ParsedMarker interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the ParsedMarker interface."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the ParsedMarker interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * ParsedMarker defines the structure for a marker that has been parsed from a source file, capturing essential metadata about its location and type. This interface is used to facilitate the validation and processing of markers within the module.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface ParsedMarker {
  stable_id: string
  type: string
  identity: string
  parent: string
  start_line: number
  end_line: number
}
// CIL[DOC-VECTOR type="context" content="purpose='ParsedMarker interface'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:ParsedMarker:interface"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:ParseResult:interface" type="interface" identity="ParseResult" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="ParseResult interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the ParseResult interface."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the ParseResult interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ParseResult {
  markers: ParsedMarker[]
  errors: Array<{ line: number; type: string; message: string }>
  unclosed: Array<{ line: number; stable_id: string }>
  orphan_ends: Array<{ line: number; stable_id: string }>
}
// CIL[DOC-VECTOR type="context" content="purpose='ParseResult interface'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:ParseResult:interface"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:parseCilMarkers:function" type="function" identity="parseCilMarkers" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="parseCilMarkers function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the parseCilMarkers function."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="lines: string[]" outputs="unknown" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the parseCilMarkers function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function parseCilMarkers(lines: string[]): ParseResult {
  const result: ParseResult = { markers: [], errors: [], unclosed: [], orphan_ends: [] }
  const stack: Array<{ stable_id: string; type: string; identity: string; parent: string; start_line: number; attrs: string }> = []
  const beginRe = /^(?:\/\/|--|#)\s*CIL\[BEGIN\s+(.+)\]\s*$/
  const endRe = /^(?:\/\/|--|#)\s*CIL\[END\s+stable_id="([^"]+)"[^\]]*\]\s*$/
  const mdBeginRe = /^<!--\s*CIL\[BEGIN\s+(.+)\]\s*-->$/
  const mdEndRe = /^<!--\s*CIL\[END\s+stable_id="([^"]+)"[^\]]*\]\s*-->$/

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    let beginMatch = trimmed.match(beginRe)
    let endMatch = trimmed.match(endRe)
    if (!beginMatch) beginMatch = trimmed.match(mdBeginRe)
    if (!endMatch) endMatch = trimmed.match(mdEndRe)

    if (beginMatch) {
      const attrs = parseAgentAttributes(beginMatch[1])
      if (!attrs.stable_id) {
        result.errors.push({ line: i + 1, type: 'missing_stable_id', message: 'BEGIN marker has no stable_id attribute' })
        continue
      }
      stack.push({
        stable_id: attrs.stable_id,
        type: attrs.type || 'unknown',
        identity: attrs.identity || '',
        parent: attrs.parent || 'none',
        start_line: i + 1,
        attrs: beginMatch[1],
      })
    } else if (endMatch) {
      const endStableId = endMatch[1]
      if (stack.length === 0) {
        result.orphan_ends.push({ line: i + 1, stable_id: endStableId })
        continue
      }
      const opened = stack.pop()!
      if (opened.stable_id !== endStableId) {
        result.errors.push({
          line: i + 1,
          type: 'mismatched_end',
          message: `END marker stable_id "${endStableId}" does not match BEGIN "${opened.stable_id}" at line ${opened.start_line}`,
        })
        // Continue as if it closed the opened marker so downstream checks can still run
      }
      result.markers.push({
        stable_id: opened.stable_id,
        type: opened.type,
        identity: opened.identity,
        parent: opened.parent,
        start_line: opened.start_line,
        end_line: i + 1,
      })
    }
  }

  while (stack.length > 0) {
    const opened = stack.pop()!
    result.unclosed.push({ line: opened.start_line, stable_id: opened.stable_id })
  }

  return result
}
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:parseCilMarkers:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:StableIdIssue:interface" type="interface" identity="StableIdIssue" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='parseCilMarkers function'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="StableIdIssue interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the StableIdIssue interface."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the StableIdIssue interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface StableIdIssue {
  stable_id: string
  line: number
  issue: string
}
// CIL[DOC-VECTOR type="context" content="purpose='StableIdIssue interface'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:StableIdIssue:interface"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:validateStableIds:function" type="function" identity="validateStableIds" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="validateStableIds function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the validateStableIds function."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="markers: ParsedMarker[], canonicalPath: string" outputs="unknown" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the validateStableIds function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Validates a list of stable IDs against a specified canonical path and checks for various structural issues. This function ensures that stable IDs conform to expected formats and values.
 *
 * @macro       Validator for stable IDs in a given context.
 * @micro       Iterates through markers to check the format of stable IDs and collects issues based on specific validation rules.
 * @inputSpec
 *   - markers: ParsedMarker[] (required) — an array of markers containing stable IDs to validate.
 *   - canonicalPath: string (required) — the expected canonical path that stable IDs should match.
 * @outputSpec  StableIdIssue[] — an array of issues found during validation, each containing details about the stable ID and the nature of the issue.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
function validateStableIds(markers: ParsedMarker[], canonicalPath: string): StableIdIssue[] {
  const issues: StableIdIssue[] = []
  for (const m of markers) {
    const parts = m.stable_id.split(':')
    if (parts.length < 3) {
      issues.push({ stable_id: m.stable_id, line: m.start_line, issue: 'stable_id must be canonical_path:identity:type' })
      continue
    }
    const type = parts.pop()!
    const identity = parts.pop()!
    const pathPart = parts.join(':')
    if (!pathPart.startsWith('~')) {
      issues.push({ stable_id: m.stable_id, line: m.start_line, issue: 'canonical_path must start with ~' })
    }
    if (pathPart !== canonicalPath) {
      issues.push({ stable_id: m.stable_id, line: m.start_line, issue: `canonical_path mismatch: expected ${canonicalPath}` })
    }
    if (!identity) {
      issues.push({ stable_id: m.stable_id, line: m.start_line, issue: 'identity must not be empty' })
    }
    if (!type) {
      issues.push({ stable_id: m.stable_id, line: m.start_line, issue: 'type must not be empty' })
    }
    if (m.type === 'module_header' && (identity !== 'module_header' || type !== 'module_header')) {
      issues.push({ stable_id: m.stable_id, line: m.start_line, issue: 'module_header chunk identity/type must both be module_header' })
    }
  }
  return issues
}
// CIL[DOC-VECTOR type="context" content="purpose='validateStableIds function'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:validateStableIds:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:CoverageIssue:interface" type="interface" identity="CoverageIssue" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="CoverageIssue interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the CoverageIssue interface."]
  // CIL[DOC-STABILITY stability="internal"]
  // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the CoverageIssue interface." notable_decisions="[]"]
/**
 * The CoverageIssue interface defines the structure for representing issues related to code coverage, specifically identifying lines of code that are either uncovered or overlapping. It exists to facilitate the reporting and handling of coverage-related problems in the codebase.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface CoverageIssue {
  line: number
  type: 'uncovered' | 'overlapping'
  message: string
}
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:CoverageIssue:interface"]

// CIL[DOC-VECTOR type="context" content="purpose='CoverageIssue interface'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:computeCoverage:function" type="function" identity="computeCoverage" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="computeCoverage function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the computeCoverage function."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="lines: string[], markers: ParsedMarker[]" outputs="unknown" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the computeCoverage function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function computeCoverage(lines: string[], markers: ParsedMarker[]): CoverageIssue[] {
  const issues: CoverageIssue[] = []
  const coverage: number[] = new Array(lines.length).fill(0)

  for (const m of markers) {
    for (let i = m.start_line - 1; i <= m.end_line - 1; i++) {
      if (i >= 0 && i < lines.length) coverage[i]++
    }
  }

  let inBlockComment = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    const isMarker = /^\s*(?:\/\/|--|#)\s*CIL\[(BEGIN|END|DOC-)/.test(line) || /^\s*<!--\s*CIL\[(BEGIN|END|DOC-)/.test(line)
    const isLineComment = /^\s*(?:\/\/|--|#)/.test(line)
    const isBlank = trimmed === ''

    // Track multi-line /* ... */ blocks so JSDoc/module comments don't need their own chunk
    if (trimmed.startsWith('/*')) inBlockComment = true
    if (trimmed.endsWith('*/')) {
      inBlockComment = false
      continue
    }
    if (inBlockComment || isLineComment || isBlank || isMarker) continue

    if (coverage[i] === 0) {
      issues.push({ line: i + 1, type: 'uncovered', message: `Line ${i + 1} is not inside any CIL chunk` })
    } else if (coverage[i] > 1) {
      issues.push({ line: i + 1, type: 'overlapping', message: `Line ${i + 1} is inside ${coverage[i]} overlapping chunks` })
    }
  }

  return issues
}
// CIL[DOC-VECTOR type="context" content="purpose='computeCoverage function'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:computeCoverage:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:JsxLeak:interface" type="interface" identity="JsxLeak" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="JsxLeak interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the JsxLeak interface."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the JsxLeak interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The JsxLeak interface defines the structure for reporting issues related to JSX leaks during validation. It provides essential information such as the line number and a descriptive message for each leak detected.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface JsxLeak {
  line: number
  message: string
}
// CIL[DOC-VECTOR type="context" content="purpose='JsxLeak interface'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:JsxLeak:interface"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:checkJsxLeakage:function" type="function" identity="checkJsxLeakage" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="checkJsxLeakage function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the checkJsxLeakage function."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="content: string, lines: string[], language: string" outputs="unknown" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the checkJsxLeakage function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Checks for leakage of CIL markers into JSX content by analyzing the provided code. This function ensures that specific markers do not appear within JSX elements, which could lead to unintended behavior.
 *
 * @inputSpec
 *   - content: string (required) — the JSX content to be analyzed.
 *   - lines: string[] (required) — an array of lines from the content for leakage checking.
 *   - language: string (required) — specifies the language type, either 'typescriptreact' or 'javascriptreact'.
 * @outputSpec  JsxLeak[] — an array of leakage objects containing line numbers and messages.
 * @sideEffects none
 * @stability   stable
 * @calls       ts.createSourceFile, ts.isJsxText, ts.isJsxExpression, ts.forEachChild
 * @cil-generated
 */
function checkJsxLeakage(content: string, lines: string[], language: string): JsxLeak[] {
  const leaks: JsxLeak[] = []
  if (!['typescriptreact', 'javascriptreact'].includes(language)) return leaks

  const scriptKind = language === 'typescriptreact' ? ts.ScriptKind.TSX : ts.ScriptKind.JSX
  const sourceFile = ts.createSourceFile('temp.tsx', content, ts.ScriptTarget.Latest, true, scriptKind)

  function findJsxText(node: ts.Node) {
    if (ts.isJsxText(node) || ts.isJsxExpression(node)) {
      const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line
      const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line
      for (let i = start; i <= end; i++) {
        if (lines[i] && lines[i].includes('CIL[')) {
          leaks.push({ line: i + 1, message: `CIL marker text leaked into JSX at line ${i + 1}` })
        }
      }
    }
    ts.forEachChild(node, findJsxText)
  }
  findJsxText(sourceFile)
  return leaks
}
// CIL[DOC-VECTOR type="context" content="purpose='checkJsxLeakage function'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:checkJsxLeakage:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:AstProposal:interface" type="interface" identity="AstProposal" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="AstProposal interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the AstProposal interface."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the AstProposal interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The AstProposal interface defines the structure for proposals in the AST validation process, encapsulating essential metadata about each proposal. It serves to standardize the representation of proposals within the module.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface AstProposal {
  stable_id: string
  identity: string
  type: string
  line_start: number
  line_end: number
}
// CIL[DOC-VECTOR type="context" content="purpose='AstProposal interface'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:AstProposal:interface"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:proposeAstChunks:function" type="function" identity="proposeAstChunks" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="proposeAstChunks function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the proposeAstChunks function."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="content: string, canonicalPath: string, language: string" outputs="unknown" errors="none" side_effects="none"]
 // CIL[DOC-STABILITY stability="internal"]
 // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MICRO logic_summary="Implements the proposeAstChunks function." notable_decisions="[]"]
/**
 * The proposeAstChunks function analyzes a given source code content and generates a list of AST proposals based on the structure of the code. It identifies module headers, functions, classes, interfaces, type aliases, and constants for TypeScript and JavaScript files.
 *
 * @macro       AST proposal generator for TypeScript and JavaScript source files.
 * @micro       Utilizes TypeScript's compiler API to parse source files and extract relevant declarations.
 * @inputSpec
 *   - content: string (required) — the source code to analyze.
 *   - canonicalPath: string (required) — the path to the source file.
 *   - language: string (required) — the programming language, must be one of 'typescript', 'typescriptreact', 'javascript', 'javascriptreact'.
 * @outputSpec  AstProposal[] — an array of proposals representing different code structures.
 * @sideEffects none
 * @stability   stable
 * @calls       ts.createSourceFile, ts.forEachChild, ts.isFunctionDeclaration, ts.isClassDeclaration, ts.isInterfaceDeclaration, ts.isTypeAliasDeclaration, ts.isVariableStatement, ts.isIdentifier
 * @cil-generated
 */
function proposeAstChunks(content: string, canonicalPath: string, language: string): AstProposal[] {
  const proposals: AstProposal[] = []
  if (!['typescript', 'typescriptreact', 'javascript', 'javascriptreact'].includes(language)) return proposals

  const scriptKind =
    language === 'typescript' ? ts.ScriptKind.TS :
    language === 'typescriptreact' ? ts.ScriptKind.TSX :
    language === 'javascript' ? ts.ScriptKind.JS :
    ts.ScriptKind.JSX

  const sourceFile = ts.createSourceFile(canonicalPath, content, ts.ScriptTarget.Latest, true, scriptKind)
  const imports = sourceFile.statements.filter(s => ts.isImportDeclaration(s))
  let headerStart = 1
  let headerEnd = 1
  if (imports.length > 0) {
    const firstImport = imports[0]
    const lastImport = imports[imports.length - 1]
    headerStart = sourceFile.getLineAndCharacterOfPosition(firstImport.getStart(sourceFile)).line + 1
    headerEnd = sourceFile.getLineAndCharacterOfPosition(lastImport.getEnd()).line + 1
  }

  proposals.push({ stable_id: `${canonicalPath}:module_header:module_header`, identity: 'module_header', type: 'module_header', line_start: headerStart, line_end: headerEnd })

  function addSymbol(name: string, type: string, node: ts.Node) {
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
    const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1
    proposals.push({ stable_id: `${canonicalPath}:${name.toLowerCase()}:${type}`, identity: name, type, line_start: start, line_end: end })
  }

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isFunctionDeclaration(node) && node.name) addSymbol(node.name.text, 'function', node)
    else if (ts.isClassDeclaration(node) && node.name) addSymbol(node.name.text, 'class', node)
    else if (ts.isInterfaceDeclaration(node) && node.name) addSymbol(node.name.text, 'interface', node)
    else if (ts.isTypeAliasDeclaration(node) && node.name) addSymbol(node.name.text, 'type', node)
    else if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          addSymbol(decl.name.text, 'constant', node)
          break
        }
      }
    }
  })

  return proposals
}
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:proposeAstChunks:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:BoundaryMismatch:interface" type="interface" identity="BoundaryMismatch" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='proposeAstChunks function'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="BoundaryMismatch interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the BoundaryMismatch interface."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
 // CIL[DOC-STABILITY stability="internal"]
 // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MICRO logic_summary="Implements the BoundaryMismatch interface." notable_decisions="[]"]
interface BoundaryMismatch {
  stable_id: string
  existing_start: number
  existing_end: number
  proposed_start: number
  proposed_end: number
  message: string
}
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:BoundaryMismatch:interface"]

// CIL[DOC-VECTOR type="context" content="purpose='BoundaryMismatch interface'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:compareWithProposals:function" type="function" identity="compareWithProposals" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="compareWithProposals function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the compareWithProposals function."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="markers: ParsedMarker[], proposals: AstProposal[], lines: string[]" outputs="unknown" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the compareWithProposals function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Compares parsed markers with AST proposals to identify boundary mismatches in code chunks. This function ensures that the code boundaries defined by markers align with the proposed boundaries in the AST.
 *
 * @inputSpec
 *   - markers: ParsedMarker[] (required) — an array of parsed markers representing code boundaries.
 *   - proposals: AstProposal[] (required) — an array of AST proposals containing expected boundaries.
 *   - lines: string[] (required) — an array of lines of code to analyze.
 * @outputSpec  BoundaryMismatch[] — an array of boundary mismatch objects detailing discrepancies between markers and proposals.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
function compareWithProposals(markers: ParsedMarker[], proposals: AstProposal[], lines: string[]): BoundaryMismatch[] {
  const mismatches: BoundaryMismatch[] = []
  const proposalMap = new Map(proposals.map(p => [p.stable_id, p]))
  const markerRe = /^\s*(?:\/\/|--|#)\s*CIL\[(BEGIN|END)\s+stable_id=/
  const docRe = /^\s*(?:\/\/|--|#)\s*CIL\[DOC-/
  function innerCodeBoundary(start: number, end: number): { start: number; end: number } {
    let s = start
    let e = end
    while (s <= e && (markerRe.test(lines[s - 1]) || docRe.test(lines[s - 1]) || lines[s - 1].trim() === '')) s++
    while (e >= s && (markerRe.test(lines[e - 1]) || docRe.test(lines[e - 1]) || lines[e - 1].trim() === '')) e--
    return { start: s, end: e }
  }
  for (const m of markers) {
    const p = proposalMap.get(m.stable_id)
    if (!p) continue // extra markers are handled elsewhere; unproposed chunks may be intentional
    const existing = innerCodeBoundary(m.start_line, m.end_line)
    if (existing.start !== p.line_start || existing.end !== p.line_end) {
      mismatches.push({
        stable_id: m.stable_id,
        existing_start: existing.start,
        existing_end: existing.end,
        proposed_start: p.line_start,
        proposed_end: p.line_end,
        message: `Chunk ${m.stable_id} inner code boundaries (${existing.start}-${existing.end}) do not match AST proposal (${p.line_start}-${p.line_end})`,
      })
    }
  }
  return mismatches
}
// CIL[DOC-VECTOR type="context" content="purpose='compareWithProposals function'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:compareWithProposals:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:ValidateChunkResult:interface" type="interface" identity="ValidateChunkResult" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="ValidateChunkResult interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the ValidateChunkResult interface."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the ValidateChunkResult interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The ValidateChunkResult interface defines the structure of the result returned from validating a chunk of code. It encapsulates the validation status, file paths, language details, and any associated errors or issues.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface ValidateChunkResult {
  ok: boolean
  status: 'valid' | 'invalid' | 'not_chunked'
  file_path: string
  canonical_path: string
  language: string
  errors: Array<{ line?: number; type: string; message: string }>
  marker_count: number
  coverage_issues: CoverageIssue[]
  stable_id_issues: StableIdIssue[]
  boundary_mismatches: BoundaryMismatch[]
  jsx_leaks: JsxLeak[]
  proposals?: AstProposal[]
}
// CIL[DOC-VECTOR type="context" content="purpose='ValidateChunkResult interface'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:ValidateChunkResult:interface"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:validateChunkFile:function" type="function" identity="validateChunkFile" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="validateChunkFile function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the validateChunkFile function."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="projectId: string, filePath: string" outputs="unknown" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the validateChunkFile function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Validates the existence and structure of a chunk file associated with a project, returning detailed information about its validity and any issues found. This function is essential for ensuring that chunk files conform to expected formats and contain valid markers.
 *
 * @macro       Async function that validates chunk files for a specified project.
 * @micro       Reads file content and analyzes it for markers, errors, and coverage issues.
 * @inputSpec
 *   projectId: string (required) — The ID of the project to which the file belongs.
 *   filePath: string (required) — The path of the file to validate.
 * @outputSpec  Promise<ValidateChunkResult> — An object containing validation results including status, errors, and issue counts.
 * @sideEffects Reads from the filesystem to check file existence and content.
 * @stability   stable
 * @calls       adminDb.from('items'), fs.existsSync, fs.readFileSync, detectLanguage, parseCilMarkers, validateStableIds, computeCoverage, checkJsxLeakage, proposeAstChunks, compareWithProposals
 * @cil-generated
 */
async function validateChunkFile(projectId: string, filePath: string): Promise<ValidateChunkResult> {
  const { data: projectRows } = await adminDb.from('items').select('data').eq('id', projectId).maybeSingle()
  const repoPath = projectRows?.data?.repo_path || process.env.REPO_PATH || ''
  const absolutePath = repoPath ? path.join(repoPath, filePath.replace(/^\//, '')) : filePath

  if (!fs.existsSync(absolutePath)) {
    return { ok: false, status: 'invalid', file_path: filePath, canonical_path: '', language: '', errors: [{ type: 'file_not_found', message: `File not found: ${absolutePath}` }], marker_count: 0, coverage_issues: [], stable_id_issues: [], boundary_mismatches: [], jsx_leaks: [] }
  }

  const content = fs.readFileSync(absolutePath, 'utf-8')
  const lines = content.split('\n')
  const language = detectLanguage(filePath)
  const canonicalPath = `~/${filePath.replace(/^\//, '')}`

  const parseResult = parseCilMarkers(lines)
  const markers = parseResult.markers

  const errors: Array<{ line?: number; type: string; message: string }> = [...parseResult.errors]
  for (const o of parseResult.orphan_ends) {
    errors.push({ line: o.line, type: 'orphan_end', message: `Orphan END marker at line ${o.line} for ${o.stable_id}` })
  }
  for (const u of parseResult.unclosed) {
    errors.push({ line: u.line, type: 'unclosed_begin', message: `Unclosed BEGIN marker at line ${u.line} for ${u.stable_id}` })
  }

  if (markers.length === 0) {
    return { ok: false, status: 'not_chunked', file_path: filePath, canonical_path: canonicalPath, language, errors: [], marker_count: 0, coverage_issues: [], stable_id_issues: [], boundary_mismatches: [], jsx_leaks: [] }
  }

  const stableIdIssues = validateStableIds(markers, canonicalPath)
  const coverageIssues = computeCoverage(lines, markers)
  const jsxLeaks = checkJsxLeakage(content, lines, language)

  for (const issue of stableIdIssues) {
    errors.push({ line: issue.line, type: 'invalid_stable_id', message: issue.issue })
  }

  const proposals = ['typescript', 'typescriptreact', 'javascript', 'javascriptreact'].includes(language)
    ? proposeAstChunks(content, canonicalPath, language)
    : []
  const boundaryMismatches = compareWithProposals(markers, proposals, lines)
  for (const m of boundaryMismatches) {
    errors.push({ type: 'boundary_mismatch', message: m.message })
  }

  const allIssues = errors.length + coverageIssues.length + jsxLeaks.length
  const ok = allIssues === 0

  return {
    ok,
    status: ok ? 'valid' : 'invalid',
    file_path: filePath,
    canonical_path: canonicalPath,
    language,
    errors,
    marker_count: markers.length,
    coverage_issues: coverageIssues,
    stable_id_issues: stableIdIssues,
    boundary_mismatches: boundaryMismatches,
    jsx_leaks: jsxLeaks,
    proposals,
  }
}
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:validateChunkFile:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:ProjectValidationResult:interface" type="interface" identity="ProjectValidationResult" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='validateChunkFile function'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="ProjectValidationResult interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the ProjectValidationResult interface."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="ValidateChunkResult & { file_path: string }" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the ProjectValidationResult interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The ProjectValidationResult interface encapsulates the results of validating a project, providing details about the validation outcome and statistics. It serves to structure the response data for project validation operations.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface ProjectValidationResult {
  ok: boolean
  project_id: string
  file_path: string | null
  limit: number
  offset: number
  total_files: number
  valid: number
  invalid: number
  not_chunked: number
  results: (ValidateChunkResult & { file_path: string })[]
}
// CIL[DOC-VECTOR type="context" content="purpose='ProjectValidationResult interface'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:ProjectValidationResult:interface"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:validateProjectFiles:function" type="function" identity="validateProjectFiles" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="validateProjectFiles function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the validateProjectFiles function."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="projectId: string, filePath?: string, limit = 50, offset = 0" outputs="unknown" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the validateProjectFiles function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function validateProjectFiles(
  projectId: string,
  filePath?: string,
  limit = 50,
  offset = 0
): Promise<ProjectValidationResult> {
  let q = adminDb
    .from('items')
    .select('id, title, data')
    .filter('data->>kb_type', 'eq', 'cil_file')
    .filter('data->>project_id', 'eq', projectId)
    .eq('is_active', true)
    .order('id')

  if (filePath) {
    q = q.filter('data->>file_path', 'eq', filePath)
  } else {
    q = q.range(offset, offset + limit - 1)
  }

  const { data: files, error } = await q
  if (error) {
    return {
      ok: false,
      project_id: projectId,
      file_path: filePath || null,
      limit,
      offset,
      total_files: 0,
      valid: 0,
      invalid: 0,
      not_chunked: 0,
      results: [{ file_path: '', ok: false, status: 'invalid' as const, canonical_path: '', language: '', errors: [{ type: 'db_error', message: error.message }], marker_count: 0, coverage_issues: [], stable_id_issues: [], boundary_mismatches: [], jsx_leaks: [] }],
    }
  }

  const results: (ValidateChunkResult & { file_path: string })[] = []
  let valid = 0, invalid = 0, notChunked = 0

  for (const f of files || []) {
    const fp = f.data?.file_path || f.title || ''
    const r = await validateChunkFile(projectId, fp)
    results.push({ file_path: fp, ...r })
    if (r.status === 'valid') valid++
    else if (r.status === 'invalid') invalid++
    else notChunked++
  }

  return {
    ok: invalid === 0,
    project_id: projectId,
    file_path: filePath || null,
    limit,
    offset,
    total_files: files?.length || 0,
    valid,
    invalid,
    not_chunked: notChunked,
    results,
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='validateProjectFiles function'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:validateProjectFiles:function"]

/**
 * Registers a tool for validating chunk hashes in a specified source file. It checks the integrity of file chunks against stored hashes after modifications.
 *
 * @macro       Tool registration function for validating file integrity.
 * @micro       Reads a file from disk, computes hashes for its chunks, and compares them to stored values.
 * @inputSpec
 *   - server: McpServer (required) — The server instance to register the tool with.
 * @outputSpec  Promise<{ content: Array<{ type: string, text: string }> }> — Returns validation results or error messages.
 * @sideEffects Reads from the file system, queries the database.
 * @stability   stable
 * @calls       adminDb.from, fs.existsSync, fs.readFileSync, computeChunkHash
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/validate.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-MACRO purpose="register function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the register function."]
// CIL[DOC-CONTEXT module="validate" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/validate.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="unknown" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the register function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function register(server: McpServer) {
  const splitParameterList = (text: string): string[] => {
    const parts: string[] = []
    let depth = 0
    let inString = false
    let quote = ''
    let current = ''
    for (const ch of text) {
      if (inString) {
        if (ch === quote) inString = false
        current += ch
        continue
      }
      if (ch === '"' || ch === "'" || ch === '`') {
        inString = true
        quote = ch
        current += ch
        continue
      }
      if (ch === '(' || ch === '[' || ch === '<' || ch === '{') depth++
      else if (ch === ')' || ch === ']' || ch === '>' || ch === '}') depth = Math.max(0, depth - 1)
      else if ((ch === ',' || ch === '\n') && depth === 0) {
        parts.push(current)
        current = ''
        continue
      }
      current += ch
    }
    parts.push(current)
    return parts.map(s => s.trim()).filter(Boolean)
  }

  const extractIdentifierNames = (s: string): string[] => {
    const raw = s.trim()
    if (!raw) return []

    // Strip trailing type/default, then optional ?
    let left = raw.split(/[:=]/)[0].trim().replace(/\?$/, '')

    // Object / array destructuring
    if ((left.startsWith('{') && left.endsWith('}')) || (left.startsWith('[') && left.endsWith(']'))) {
      const inner = left.slice(1, -1)
      const names = splitParameterList(inner)
        .map(p => p.trim().split(/[:=]/)[0].replace(/\?$/, '').replace(/^\.\.\./, ''))
        .map(p => p.match(/([a-zA-Z0-9_]+)/)?.[0] || '')
        .filter(Boolean)
      return names
    }

    // Rest parameter or regular parameter (tolerate leading "- " / "* " list bullets)
    left = left.replace(/^\.\.\./, '')
    const m = left.match(/^[-*\s]*([a-zA-Z0-9_]+)/)
    return m ? [m[1]] : []
  }

  server.registerTool(
    'spine_cil_validate_file',
    {
      description: 'Re-read a source file from disk and validate all chunk hashes. Returns drift status for each chunk: current | drift_detected | not_found. Use this after editing to confirm hashes are up to date.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        file_path: z.string().describe('Relative file path from repo root, e.g. ".framework/cli/commands/auth.ts"'),
      }),
    },
    async ({ project_id, file_path }) => {
      const { data: proj } = await adminDb.from('items').select('data').eq('id', project_id).maybeSingle()
      if (!proj) return { content: [{ type: 'text', text: JSON.stringify({ error: `Project not found: ${project_id}` }) }] }

      const resolvedRepo = proj.data?.repo_path || process.env.REPO_PATH || ''
      if (!resolvedRepo) return { content: [{ type: 'text', text: JSON.stringify({ error: 'No repo_path on project and REPO_PATH env not set' }) }] }

      const absolutePath = `${resolvedRepo.replace(/\/$/, '')}/${file_path.replace(/^\//, '')}`

      if (!fs.existsSync(absolutePath)) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: `File not found on disk: ${absolutePath}`, file_path }) }] }
      }

      const fileContent = fs.readFileSync(absolutePath, 'utf-8')
      const lines = fileContent.split('\n')

      const activeVersionId = proj.data?.active_version_id
      let chunkQuery = adminDb.from('items').select('id, data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>project_id', 'eq', project_id)
        .filter('data->>file_path', 'eq', file_path)
        .eq('is_active', true)
      if (activeVersionId) {
        chunkQuery = chunkQuery.filter('data->>version_id', 'eq', activeVersionId)
      }
      const { data: chunks } = await chunkQuery

      const results: any[] = []
      let current = 0, drifted = 0, notFound = 0

      for (const chunk of chunks || []) {
        const cd = chunk.data || {}
        const stableId = cd.stable_id || cd.legacy_chunk_id || cd.chunk_id || chunk.id
        const lineStart = (cd.line_start || 1) - 1
        const lineEnd = (cd.line_end || 1) - 1

        if (lineEnd >= lines.length) {
          results.push({ chunk_id: chunk.id, stable_id: stableId, chunk_name: cd.chunk_name || '', status: 'not_found', reason: 'line range out of bounds' })
          notFound++
          continue
        }

        const extractedContent = lines.slice(lineStart, lineEnd + 1).join('\n')
        const shortHash = computeChunkHash(extractedContent)
        const fullHash = computeContentHash(extractedContent)
        const storedHash = cd.stored_hash || cd.content_hash

        if (!storedHash) {
          results.push({ chunk_id: chunk.id, stable_id: stableId, chunk_name: cd.chunk_name || '', status: 'not_found', reason: 'no stored hash' })
          notFound++
        } else if (storedHash === shortHash || storedHash === fullHash) {
          results.push({ chunk_id: chunk.id, stable_id: stableId, chunk_name: cd.chunk_name || '', status: 'current', line_start: cd.line_start, line_end: cd.line_end })
          current++
        } else {
          results.push({ chunk_id: chunk.id, stable_id: stableId, chunk_name: cd.chunk_name || '', status: 'drift_detected', stored_hash: storedHash, computed_hash: shortHash, line_start: cd.line_start, line_end: cd.line_end })
          drifted++
        }
      }

      const total = chunks?.length || 0
      const trustRating = total > 0 ? Math.round((current / total) * 100) : 100

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            project_id,
            file_path,
            summary: { total, current, drift_detected: drifted, not_found: notFound, trust_rating: trustRating },
            chunks: results,
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    'spine_cil_validate_chunk',
    {
      description: 'Strictly validate CIL chunk markers in a source file before storage. Checks marker pairing, full line coverage, valid stable IDs, boundary agreement with the AST, and JSX leakage. Returns a structured error list so the caller can fix markers before calling spine_cil_store_markers.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        file_path: z.string().describe('Relative file path from repo root, e.g. ".framework/mcp/tools/cil/validate.ts"'),
      }),
    },
    async ({ project_id, file_path }) => {
      const result = await validateChunkFile(project_id, file_path)
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
  )

  server.registerTool(
    'spine_cil_validate_project',
    {
      description: 'Validate all selected/chunked files in a CIL project. Checks marker pairing, full line coverage, valid stable IDs, boundary agreement with the AST, and JSX leakage. Supports optional file_path scope and batching.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        file_path: z.string().optional().describe('Limit validation to a single file path'),
        limit: z.number().int().min(1).max(100).optional().describe('Max files to validate in this call (default 50)'),
        offset: z.number().int().min(0).optional().describe('File offset for batching'),
      }),
    },
    async ({ project_id, file_path, limit, offset }) => {
      const result = await validateProjectFiles(project_id, file_path, limit ?? 50, offset ?? 0)
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
  )

  server.registerTool(
    'spine_cil_reindex_chunk',
    {
      description: 'Re-read a chunk from disk by its stable_id, recompute its hash and update code_content in the database. Call this after editing a chunk to keep the CIL in sync. Set also_embed: true to also trigger an embedding update.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        stable_id: z.string().describe('The stable_id of the chunk to reindex'),
        version_id: z.string().optional().describe('Optional version UUID to scope the lookup'),
        also_embed: z.boolean().default(false).optional().describe('If true, trigger embed_chunk after updating the hash'),
        repo_path: z.string().optional().describe('Absolute path to repo root (overrides project data.repo_path)'),
      }),
    },
    async ({ project_id, stable_id, version_id, also_embed, repo_path }) => {
      const chunk = await getChunkByStableId(project_id, stable_id, version_id)
      if (!chunk) return { content: [{ type: 'text', text: JSON.stringify({ error: `Chunk not found: ${stable_id}` }) }] }

      const cd = chunk.data || {}

      let resolvedRepo = repo_path || process.env.REPO_PATH || ''
      if (!resolvedRepo) {
        const { data: proj } = await adminDb.from('items').select('data').eq('id', project_id).maybeSingle()
        resolvedRepo = proj?.data?.repo_path || ''
      }

      const filePath = cd.file_path || ''
      const absolutePath = resolvedRepo ? `${resolvedRepo.replace(/\/$/, '')}/${filePath.replace(/^\//, '')}` : filePath

      if (!fs.existsSync(absolutePath)) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: `File not found on disk: ${absolutePath}` }) }] }
      }

      const fileContent = fs.readFileSync(absolutePath, 'utf-8')
      const lines = fileContent.split('\n')
      const lineStart = (cd.line_start || 1) - 1
      const lineEnd = (cd.line_end || 1) - 1
      const extractedContent = lines.slice(lineStart + 1, lineEnd).join('\n')

      const newHash = computeContentHash(extractedContent)
      const now = new Date().toISOString()

      const newData = {
        ...cd,
        code_content: extractedContent,
        stored_hash: newHash,
        content_hash: newHash,
        hash_updated_at: now,
        token_count: Math.round(extractedContent.length / 4),
      }

      const { error } = await adminDb.from('items')
        .update({ data: newData, updated_at: now })
        .eq('id', chunk.id)

      if (error) return { content: [{ type: 'text', text: JSON.stringify({ error: `Failed to update chunk: ${error.message}` }) }] }

      const result: any = {
        ok: true,
        chunk_id: chunk.id,
        stable_id,
        version_id: version_id || cd.version_id || null,
        chunk_name: cd.chunk_name || '',
        file_path: filePath,
        new_hash: newHash,
        hash_updated_at: now,
        lines_extracted: lineEnd - lineStart + 1,
      }

      if (also_embed) {
        result.embed_note = `Re-embedding requires the Netlify function endpoint. Use POST /api/custom_cil-embeddings?action=embed_chunk with { project_id, stable_id, version_id }`
      }

      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
    }
  )

  server.registerTool(
    'spine_cil_validate_docs',
    {
      description: 'Validate that chunks meet the canonical inline documentation contract. Returns chunks that are missing required fields (module, audience, layer, macro, micro, input_spec, output_spec, side_effects, stability) or have undocumented parameters. For enriched chunks, also checks required DOC-VECTOR types and related_files.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        file_path: z.string().optional().describe('Limit validation to a single file path'),
      }),
    },
    async ({ project_id, file_path }) => {
      const PAGE_SIZE = 500
      const allChunks: any[] = []
      let from = 0
      while (true) {
        let q = adminDb.from('items').select('id, title, data')
          .filter('data->>kb_type', 'eq', 'cil_chunk')
          .filter('data->>project_id', 'eq', project_id)
          .eq('is_active', true)
          .order('id')
          .range(from, from + PAGE_SIZE - 1)
        if (file_path) q = (q as any).filter('data->>file_path', 'eq', file_path)

        const { data: chunks, error } = await q
        if (error) return { content: [{ type: 'text', text: JSON.stringify({ error: `Failed to load chunks: ${error.message}` }) }] }
        if (!chunks || chunks.length === 0) break
        allChunks.push(...chunks)
        if (chunks.length < PAGE_SIZE) break
        from += PAGE_SIZE
      }

      const requiredModule = ['module', 'audience', 'layer', 'stability', 'description']
      const requiredChunk = ['description', 'macro', 'micro', 'input_spec', 'output_spec', 'side_effects', 'stability']

      const invalid: any[] = []
      for (const chunk of allChunks) {
        const d = chunk.data || {}
        const isModule = d.chunk_type === 'module_header'
        const required = isModule ? requiredModule : requiredChunk
        const errors: string[] = []
        for (const field of required) {
          if (!d[field] || String(d[field]).trim() === '') errors.push(`missing ${field}`)
        }

        const hasVectors = d.vector_content && Object.keys(d.vector_content).length > 0
        if (hasVectors) {
          const requiredVectors = ['context', 'blast_radius', 'configuration', 'constraint']
          for (const v of requiredVectors) {
            const vec = d.vector_content[v]
            if (!vec || vec.status !== 'ready' || !String(vec.content).trim()) {
              errors.push(`missing or non-ready DOC-VECTOR: ${v}`)
            }
          }
          const relatedFilesRaw = d.related_files || d.see_also || ''
          const relatedFilesTrimmed = String(relatedFilesRaw).trim()
          const hasRelatedFiles = relatedFilesTrimmed !== '' && relatedFilesTrimmed !== '[]'
          if (!hasRelatedFiles) {
            errors.push('missing related_files')
          }
        }

        if (!isModule && d.input_spec && d.input_spec !== 'none') {
          const paramNames = splitParameterList(d.input_spec).flatMap(extractIdentifierNames)
          const code = d.code_content || ''
          const sig = code.match(/(?:function|const|let|var)\s+\w+\s*\(([^)]*)\)/)
          if (sig) {
            const declared = splitParameterList(sig[1]).flatMap(extractIdentifierNames)
            for (const name of declared) {
              if (!paramNames.includes(name)) errors.push(`undocumented parameter: ${name}`)
            }
          }
        }

        if (errors.length > 0) {
          invalid.push({
            chunk_id: chunk.id,
            chunk_name: d.chunk_name || chunk.title,
            file_path: d.file_path || '',
            chunk_type: d.chunk_type || '',
            errors,
          })
        }
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            project_id,
            file_path: file_path || null,
            total_chunks: allChunks.length,
            valid_chunks: allChunks.length - invalid.length,
            invalid_chunks: invalid.length,
            invalid,
          }, null, 2),
        }],
      }
    }
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='register function'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/validate.ts:register:function"]
