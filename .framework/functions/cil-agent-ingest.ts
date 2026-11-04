// CIL[BEGIN stable_id="~/.framework/functions/cil-agent-ingest.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-MACRO purpose="Netlify function that ingests and synchronises agent-annotated CIL chunks for a project."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose actions for selecting files, storing markers, updating documentation, detecting changes, marking dead code, and renaming files."]
// CIL[DOC-CONTEXT module="cil-agent-ingest" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-CONTRACT inputs="project_id and action query" outputs="action-specific JSON payload" errors="Project not found or invalid action" side_effects="Reads and writes CIL chunk records in the admin database"]
// CIL[DOC-MICRO logic_summary="Imports shared middleware, db, admin-data, resolveTypeId and Node fs, path and crypto; declares a createHandler export." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="cil-workers"]


import { createHandler, requireSystemContextWithAudit } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { create as adminCreate, update as adminUpdate } from './admin-data'
import { resolveTypeId } from './_shared/resolve-ids'
import { computeContentHash } from './_shared/cil'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
// CIL[DOC-VECTOR type="context" content="purpose='Netlify function that ingests and synchronises agent-annotated CIL chunks for a project.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent-ingest.ts:module_header:module_header"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-agent-ingest.ts:AgentIngestRequest:interface" type="interface" identity="AgentIngestRequest" parent="~/.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-MACRO purpose="Defines the request payload accepted by the cil-agent-ingest handler."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a strongly-typed contract for project_id, file metadata, marker arrays, chunk updates and rename parameters."]
// CIL[DOC-CONTEXT module="cil-agent-ingest" layer="types" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Optional string fields plus chunks and file_ids arrays used across handler actions." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface AgentIngestRequest {
  project_id: string
  file_id?: string
  file_path?: string
  file_hash?: string
  markers?: AgentParsedMarker[]
  chunks?: Array<{
    chunk_id: string
    documentation: Record<string, any>
    metadata?: Record<string, any>
  }>
  file_ids?: string[]
  new_file_path?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the request payload accepted by the cil-agent-ingest handler.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent-ingest.ts:AgentIngestRequest:interface"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-agent-ingest.ts:AgentParsedMarker:interface" type="interface" identity="AgentParsedMarker" parent="~/.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-MACRO purpose="Represents a single CIL chunk boundary as parsed from source."]
// CIL[DOC-RESPONSIBILITY responsibility="Capture start_line, end_line, type, identity, parent and extra attributes for a marker."]
// CIL[DOC-CONTEXT module="cil-agent-ingest" layer="types" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Includes chunk_id as legacy support plus an attributes record for forward compatibility." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface AgentParsedMarker {
  chunk_id: string
  start_line: number
  end_line: number
  type: string
  identity: string
  parent: string
  attributes?: Record<string, string>
}
// CIL[DOC-VECTOR type="context" content="purpose='Represents a single CIL chunk boundary as parsed from source.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent-ingest.ts:AgentParsedMarker:interface"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-agent-ingest.ts:AgentParsedDocs:interface" type="interface" identity="AgentParsedDocs" parent="~/.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-MACRO purpose="Holds all parsed CIL documentation tags for a chunk."]
// CIL[DOC-RESPONSIBILITY responsibility="Collect macro, responsibility, context, contract, micro, examples, confidence, stability and audience fields."]
// CIL[DOC-CONTEXT module="cil-agent-ingest" layer="types" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Raw map mirrors the source tag contents; confidence flags are stored as an array." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface AgentParsedDocs {
  macro?: string
  responsibility?: string
  context?: Record<string, any>
  contract?: Record<string, any>
  micro?: Record<string, any>
  examples?: Record<string, any>
  confidence?: { pass: string; score: number; flags: string[] }
  stability?: string
  audience?: string
  raw: Record<string, string>
}
// CIL[DOC-VECTOR type="context" content="purpose='Holds all parsed CIL documentation tags for a chunk.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent-ingest.ts:AgentParsedDocs:interface"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-agent-ingest.ts:computeFileHash:function" type="function" identity="computeFileHash" parent="~/.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-MACRO purpose="Compute a SHA-256 digest of a file or string."]
// CIL[DOC-RESPONSIBILITY responsibility="Return a stable hex hash for content comparison and integrity checks."]
// CIL[DOC-CONTEXT module="cil-agent-ingest" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-CONTRACT inputs="content: string" outputs="hex hash string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates a sha256 hash from utf-8 content and returns the hex digest." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function computeFileHash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex')
}
// CIL[DOC-VECTOR type="context" content="purpose='Compute a SHA-256 digest of a file or string.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent-ingest.ts:computeFileHash:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-agent-ingest.ts:estimateTokens:function" type="function" identity="estimateTokens" parent="~/.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-MACRO purpose="Approximate token count for a block of text."]
// CIL[DOC-RESPONSIBILITY responsibility="Convert character length to token count using a simple 1:4 ratio."]
// CIL[DOC-CONTEXT module="cil-agent-ingest" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-CONTRACT inputs="text: string" outputs="number" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Divides string length by four and rounds up to the nearest integer." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
// CIL[DOC-VECTOR type="context" content="purpose='Approximate token count for a block of text.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent-ingest.ts:estimateTokens:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-agent-ingest.ts:parseAgentAttributes:function" type="function" identity="parseAgentAttributes" parent="~/.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-MACRO purpose="Parse key=value attribute pairs inside CIL marker or doc tag content."]
// CIL[DOC-RESPONSIBILITY responsibility="Return a record of attribute names to their quoted string values."]
// CIL[DOC-CONTEXT module="cil-agent-ingest" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-CONTRACT inputs="attrString: string" outputs="Record<string, string>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses a regex to capture word keys and double-quoted values, returning an object." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function parseAgentAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const regex = /(\w+)="([^"]*)"/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(attrString)) !== null) {
    attrs[match[1]] = match[2]
  }
  return attrs
}
// CIL[DOC-VECTOR type="context" content="purpose='Parse key=value attribute pairs inside CIL marker or doc tag content.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent-ingest.ts:parseAgentAttributes:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-agent-ingest.ts:parseAgentCilMarkers:function" type="function" identity="parseAgentCilMarkers" parent="~/.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-MACRO purpose="Scan source lines and build a list of CIL chunk markers with boundaries."]
// CIL[DOC-RESPONSIBILITY responsibility="Match BEGIN and END lines, pair them on a stack, and emit marker metadata."]
// CIL[DOC-CONTEXT module="cil-agent-ingest" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-CONTRACT inputs="lines: string[]" outputs="AgentParsedMarker[]" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Supports //, --, # and HTML comment prefixes; legacy END chunk_id is preserved." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function parseAgentCilMarkers(lines: string[]): AgentParsedMarker[] {
  const markers: AgentParsedMarker[] = []
  const stack: { line: number; attrs: Record<string, string> }[] = []

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    const beginMatch = trimmed.match(/^(?:\/\/|--|#)\s*CIL\[BEGIN\s+(.+)\]$/) || trimmed.match(/^<!--\s*CIL\[BEGIN\s+(.+)\]\s*-->$/)
    const endMatch = trimmed.match(/^(?:\/\/|--|#)\s*CIL\[END\s+chunk_id="([^"]+)"\]$/) || trimmed.match(/^<!--\s*CIL\[END\s+chunk_id="([^"]+)"\]\s*-->$/)

    if (beginMatch) {
      const attrs = parseAgentAttributes(beginMatch[1])
      stack.push({ line: i + 1, attrs })
    } else if (endMatch && stack.length > 0) {
      const opened = stack.pop()!
      markers.push({
        chunk_id: endMatch[1],
        start_line: opened.line,
        end_line: i + 1,
        type: opened.attrs.type || 'unknown',
        identity: opened.attrs.identity || '',
        parent: opened.attrs.parent || 'none',
        attributes: opened.attrs,
      })
    }
  }

  return markers
}
// CIL[DOC-VECTOR type="context" content="purpose='Scan source lines and build a list of CIL chunk markers with boundaries.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent-ingest.ts:parseAgentCilMarkers:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-agent-ingest.ts:parseAgentCilDocs:function" type="function" identity="parseAgentCilDocs" parent="~/.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-MACRO purpose="Extract CIL documentation tags from a chunk line range."]
// CIL[DOC-RESPONSIBILITY responsibility="Parse each DOC-* tag and map it into the AgentParsedDocs structure."]
// CIL[DOC-CONTEXT module="cil-agent-ingest" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-CONTRACT inputs="lines: string[], startLine: number, endLine: number" outputs="AgentParsedDocs" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Switches on tag key to populate macro, responsibility, context, contract, micro, examples, confidence, stability and audience fields." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function parseAgentCilDocs(lines: string[], startLine: number, endLine: number): AgentParsedDocs {
  const docs: AgentParsedDocs = { raw: {} }
  for (let i = startLine - 1; i < endLine - 1; i++) {
    const trimmed = lines[i].trim()
    const match = trimmed.match(/^(?:\/\/|--|#)\s*CIL\[DOC-(\w+)\s+(.+)\]$/) || trimmed.match(/^<!--\s*CIL\[DOC-(\w+)\s+(.+)\]\s*-->$/)
    if (!match) continue
    const key = match[1]
    const content = match[2]
    docs.raw[key] = content

    const attrs = parseAgentAttributes(content)

    switch (key) {
      case 'MACRO':
        docs.macro = attrs.purpose || content.replace(/^purpose="|"$/g, '')
        break
      case 'RESPONSIBILITY':
        docs.responsibility = attrs.responsibility || content.replace(/^responsibility="|"$/g, '')
        break
      case 'CONTEXT':
        docs.context = attrs
        break
      case 'CONTRACT':
        docs.contract = attrs
        break
      case 'MICRO':
        docs.micro = attrs
        break
      case 'EXAMPLES':
        docs.examples = attrs
        break
      case 'EXPORTS':
        docs.examples = { ...docs.examples, exports: attrs }
        break
      case 'CONFIDENCE':
        docs.confidence = {
          pass: attrs.pass || 'first',
          score: parseFloat(attrs.score || '0'),
          flags: attrs.flags ? attrs.flags.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        }
        break
      case 'STABILITY':
        docs.stability = attrs.stability || content.replace(/^stability="|"$/g, '')
        break
      case 'AUDIENCE':
        docs.audience = attrs.audience || content.replace(/^audience="|"$/g, '')
        break
    }
  }
  return docs
}
// CIL[DOC-VECTOR type="context" content="purpose='Extract CIL documentation tags from a chunk line range.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent-ingest.ts:parseAgentCilDocs:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-agent-ingest.ts:mapAgentDocsToChunkData:function" type="function" identity="mapAgentDocsToChunkData" parent="~/.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-MACRO purpose="Flatten parsed docs into database column fields for a chunk record."]
// CIL[DOC-RESPONSIBILITY responsibility="Translate doc tags into macro, micro, input/output specs, side effects, module, layer and related files."]
// CIL[DOC-CONTEXT module="cil-agent-ingest" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-CONTRACT inputs="docs: AgentParsedDocs" outputs="Record<string, any>" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Falls back to raw tag content where typed values are missing; uses contract and micro attributes." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function mapAgentDocsToChunkData(docs: AgentParsedDocs): Record<string, any> {
  // Only emit fields backed by DOC-* tags actually present in the source.
  // Emitting empty strings for absent tags would wipe enriched fields on
  // every store_markers call for chunks that use JSDoc or no doc tags.
  const out: Record<string, any> = {}
  if (docs.raw.MACRO || docs.macro) {
    out.macro = docs.macro || docs.raw.MACRO || ''
    out.description = docs.macro || ''
  }
  if (docs.raw.MICRO) {
    out.micro = docs.micro?.logic_summary || ''
    out.tags = docs.micro?.notable_decisions || ''
  } else if (docs.raw.RESPONSIBILITY) {
    out.micro = docs.responsibility || ''
  }
  if (docs.contract) {
    out.input_spec = docs.contract.inputs || ''
    out.output_spec = docs.contract.outputs || ''
    out.side_effects = docs.contract.side_effects || ''
    out.throws = docs.contract.errors || ''
    out.depends_on = docs.contract.dependencies || ''
  }
  if (docs.context) {
    out.module = docs.context.module || ''
    out.layer = docs.context.layer || ''
    out.see_also = docs.context.related_files || ''
  }
  if (docs.confidence) {
    out.doc_confidence = docs.confidence.pass === 'second' ? 'ai_generated' : 'from_source'
    out.confidence_score = docs.confidence.score || 0
    out.confidence_flags = docs.confidence.flags || []
  }
  if (docs.raw.STABILITY || docs.stability) out.stability = docs.stability || ''
  if (docs.raw.AUDIENCE || docs.audience) out.audience = docs.audience || ''
  return out
}
// CIL[DOC-VECTOR type="context" content="purpose='Flatten parsed docs into database column fields for a chunk record.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent-ingest.ts:mapAgentDocsToChunkData:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-agent-ingest.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-MACRO purpose="Main Netlify function handler for CIL agent ingestion actions."]
// CIL[DOC-RESPONSIBILITY responsibility="Route query actions, validate project, read and write chunk records, and return action results."]
// CIL[DOC-CONTEXT module="cil-agent-ingest" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent-ingest.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, body: any" outputs="JSON response per action" errors="Project not found, missing fields, hash mismatch, unknown action" side_effects="Creates, updates, deactivates and renames CIL chunk and file records"]
// CIL[DOC-MICRO logic_summary="Implements six actions via createHandler: get_selected_files, store_markers, update_documentation, detect_changes, mark_dead and update_file_path." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  // CIL is operator tooling — every action touches the service-role client
  // and server filesystem. System principals only; tenant callers stop here.
  requireSystemContextWithAudit(ctx)

  const action = ctx.query?.action
  const req = body as AgentIngestRequest

  if (!req?.project_id) throw new Error('project_id is required')

  const { data: projectItem, error: projectError } = await adminDb
    .from('items')
    .select('id, title, data')
    .eq('id', req.project_id)
    .maybeSingle()

  if (projectError || !projectItem) throw new Error(`Project not found: ${req.project_id}`)

  const repoPath: string = projectItem.data?.repo_path || ''

  
  if (action === 'get_selected_files') {
    const selectedPaths = projectItem.data?.selected_paths as string[] | undefined || []
    const selectedExtensions = req.selected_extensions || (projectItem.data?.selected_extensions as string[] | undefined) || []

    const { data: files } = await adminDb.from('items').select('id, title, data')
      .filter('data->>kb_type', 'eq', 'cil_file')
      .filter('data->>project_id', 'eq', req.project_id)
      .eq('is_active', true)

    const result = (files || []).map((f: any) => {
      const fd = f.data || {}
      const filePath = fd.file_path || f.title
      const absolutePath = repoPath ? path.join(repoPath, filePath.replace(/^\//, '')) : filePath
      const isSelected = selectedPaths.length === 0 || selectedPaths.some(sp => filePath === sp || filePath.startsWith(sp + '/'))
      const extMatch = selectedExtensions.length === 0 || (fd.extension && selectedExtensions.includes(fd.extension))
      let currentHash = null
      if (isSelected && extMatch && fs.existsSync(absolutePath)) {
        currentHash = computeFileHash(fs.readFileSync(absolutePath, 'utf-8'))
      }
      return {
        file_id: f.id,
        file_path: filePath,
        stored_hash: fd.stored_hash || null,
        current_hash: currentHash,
        language: fd.language || 'unknown',
        status: fd.status || 'not_started',
        is_selected: isSelected,
        extension_matches: extMatch,
      }
    })

    return {
      action: 'get_selected_files',
      project_id: req.project_id,
      repo_path: repoPath,
      files: result.filter((f: any) => f.is_selected && f.extension_matches),
    }
  }

  
  if (action === 'store_markers') {
    const fileId = req.file_id
    const filePath = req.file_path
    const fileHash = req.file_hash
    const markers = req.markers

    if (!fileId) throw new Error('file_id is required')
    if (!filePath) throw new Error('file_path is required')
    if (!fileHash) throw new Error('file_hash is required')
    if (!markers || !Array.isArray(markers)) throw new Error('markers array is required')

    if (!repoPath) throw new Error('Project has no repo_path configured')
    const absolutePath = path.join(repoPath, filePath.replace(/^\//, ''))
    if (!fs.existsSync(absolutePath)) throw new Error(`Source file not found on disk: ${absolutePath}`)

    const content = fs.readFileSync(absolutePath, 'utf-8')
    const computedHash = computeFileHash(content)
    if (computedHash !== fileHash) throw new Error(`Hash mismatch: provided ${fileHash} != computed ${computedHash}`)

    const lines = content.split('\n')
    const parsed = parseAgentCilMarkers(lines)
    const parsedById = new Map(parsed.map(m => [m.chunk_id, m]))

    const providedIds = new Set(markers.map(m => m.chunk_id))
    const sourceIds = new Set(parsed.map(m => m.chunk_id))
    const missingInSource = markers.filter(m => !sourceIds.has(m.chunk_id))
    const extraInSource = parsed.filter(m => !providedIds.has(m.chunk_id))
    if (missingInSource.length > 0 || extraInSource.length > 0) {
      throw new Error(
        `Marker mismatch: missing_in_source=[${missingInSource.map(m => m.chunk_id).join(',')}], extra_in_source=[${extraInSource.map(m => m.chunk_id).join(',')}]`
      )
    }

    const chunkTypeId = await resolveTypeId('item', 'cil_chunk')

    const { data: existingChunks } = await adminDb.from('items').select('id, data')
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .filter('data->>file_id', 'eq', fileId)
      .eq('is_active', true)
    const existingByChunkId = new Map((existingChunks || []).map((c: any) => [c.data?.chunk_id || c.id, c]))

    const now = new Date().toISOString()
    const results: any[] = []
    const errors: string[] = []

    for (const m of markers) {
      const parsed = parsedById.get(m.chunk_id)!
      const codeContent = lines.slice(m.start_line, m.end_line - 1).join('\n')
      const docs = parseAgentCilDocs(lines, m.start_line, m.end_line)
      const docFields = mapAgentDocsToChunkData(docs)
      const chunkHash = computeContentHash(codeContent)
      const tokenCount = estimateTokens(codeContent)

      const baseData = {
        kb_type: 'cil_chunk',
        chunk_id: m.chunk_id,
        chunk_name: m.identity,
        file_id: fileId,
        project_id: req.project_id,
        file_path: filePath,
        chunk_type: m.type,
        parent_id: m.parent === 'none' ? null : m.parent,
        line_start: m.start_line,
        line_end: m.end_line,
        stored_hash: chunkHash,
        content_hash: chunkHash,
        code_content: codeContent,
        token_count: tokenCount,
        is_dead_code: false,
        review_status: 'approved',
        boundary_confidence: 'high',
        boundary_source: 'agent_markers',
        ...docFields,
      }

      const existing = existingByChunkId.get(m.chunk_id)
      if (existing) {
        const newData = { ...existing.data, ...baseData, updated_at: now }
        const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: existing.id } }
        await adminUpdate(updateCtx, { data: newData, title: `${filePath}::${m.identity}` })
          .then(() => results.push({ chunk_id: m.chunk_id, action: 'updated', id: existing.id }))
          .catch((e: any) => errors.push(`${m.chunk_id}: ${e.message}`))
      } else {
        await adminCreate(ctx, {
          entity: 'items',
          type_slug: 'cil_chunk',
          title: `${filePath}::${m.identity}`,
          status: 'active',
          is_active: true,
          data: baseData,
        })
          .then((newChunk: any) => results.push({ chunk_id: m.chunk_id, action: 'created', id: newChunk.id }))
          .catch((e: any) => errors.push(`${m.chunk_id}: ${e.message}`))
      }
    }

    const { data: fileItem } = await adminDb.from('items').select('id, data').eq('id', fileId).maybeSingle()
    if (fileItem) {
      const newFileData = {
        ...fileItem.data,
        stored_hash: computedHash,
        line_count: lines.length,
        chunk_count: markers.length,
        has_existing_markers: true,
        existing_marker_names: markers.map(m => m.identity),
        ingestion_pass: 2,
        status: 'pass2_complete',
        last_status_at: now,
      }
      const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: fileId } }
      await adminUpdate(updateCtx, { data: newFileData }).catch((e: any) => errors.push(`file_update: ${e.message}`))
    }

    return {
      action: 'store_markers',
      project_id: req.project_id,
      file_id: fileId,
      file_path: filePath,
      file_hash: computedHash,
      chunk_count: markers.length,
      created: results.filter(r => r.action === 'created').length,
      updated: results.filter(r => r.action === 'updated').length,
      errors: errors.length > 0 ? errors : undefined,
      results,
    }
  }

  
  if (action === 'update_documentation') {
    const chunks = req.chunks
    if (!chunks || !Array.isArray(chunks)) throw new Error('chunks array is required')

    const now = new Date().toISOString()
    const results: any[] = []

    for (const c of chunks) {
      const { data: chunk } = await adminDb.from('items').select('id, data').eq('id', c.chunk_id).maybeSingle()
      if (!chunk) {
        results.push({ chunk_id: c.chunk_id, ok: false, error: 'Chunk not found' })
        continue
      }

      const newData = { ...chunk.data, ...c.documentation, ...(c.metadata || {}), doc_updated_at: now }
      const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: c.chunk_id } }
      await adminUpdate(updateCtx, { data: newData })
        .then(() => results.push({ chunk_id: c.chunk_id, ok: true, error: null }))
        .catch((e: any) => results.push({ chunk_id: c.chunk_id, ok: false, error: e.message }))
    }

    return {
      action: 'update_documentation',
      project_id: req.project_id,
      ok: results.every(r => r.ok),
      updated: results.filter(r => r.ok).length,
      failed: results.filter(r => !r.ok).length,
      results,
    }
  }

  
  if (action === 'detect_changes') {
    if (!repoPath) throw new Error('Project has no repo_path configured')

    let q = adminDb.from('items').select('id, title, data')
      .filter('data->>kb_type', 'eq', 'cil_file')
      .filter('data->>project_id', 'eq', req.project_id)
      .eq('is_active', true)
    if (req.file_ids && req.file_ids.length > 0) q = (q as any).in('id', req.file_ids)

    const { data: files } = await q
    const changed: any[] = []
    const unchanged: any[] = []
    const missing: any[] = []

    for (const f of files || []) {
      const fd = f.data || {}
      const filePath = fd.file_path || f.title
      const absolutePath = path.join(repoPath, filePath.replace(/^\//, ''))
      const storedHash = fd.stored_hash || null

      if (!fs.existsSync(absolutePath)) {
        missing.push({ file_id: f.id, file_path: filePath })
        continue
      }

      const content = fs.readFileSync(absolutePath, 'utf-8')
      const currentHash = computeFileHash(content)
      if (storedHash && storedHash === currentHash) {
        unchanged.push({ file_id: f.id, file_path: filePath })
      } else {
        changed.push({ file_id: f.id, file_path: filePath, stored_hash: storedHash, current_hash: currentHash })
      }
    }

    return {
      action: 'detect_changes',
      project_id: req.project_id,
      changed_count: changed.length,
      unchanged_count: unchanged.length,
      missing_count: missing.length,
      changed,
      unchanged,
      missing,
    }
  }

  
  if (action === 'mark_dead') {
    const fileId = req.file_id
    if (!fileId) throw new Error('file_id is required')

    const now = new Date().toISOString()
    const { data: fileItem } = await adminDb.from('items').select('id, title, data').eq('id', fileId).maybeSingle()
    if (!fileItem) throw new Error(`File not found: ${fileId}`)

    const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: fileId } }
    await adminUpdate(updateCtx, {
      is_active: false,
      data: { ...fileItem.data, is_dead_code: true },
    })

    const { data: chunks } = await adminDb.from('items').select('id')
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .filter('data->>file_id', 'eq', fileId)

    for (const c of chunks || []) {
      const chunkUpdateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: c.id } }
      await adminUpdate(chunkUpdateCtx, { is_active: false }).catch(() => { /* non-fatal */ })
    }

    return {
      action: 'mark_dead',
      project_id: req.project_id,
      file_id: fileId,
      file_path: fileItem.data?.file_path || fileItem.title || '',
      chunks_marked_dead: chunks?.length || 0,
    }
  }

  
  if (action === 'update_file_path') {
    const fileId = req.file_id
    const newFilePath = req.new_file_path
    if (!fileId) throw new Error('file_id is required')
    if (!newFilePath) throw new Error('new_file_path is required')

    const now = new Date().toISOString()
    const { data: fileItem } = await adminDb.from('items').select('id, title, data').eq('id', fileId).maybeSingle()
    if (!fileItem) throw new Error(`File not found: ${fileId}`)

    const oldPath = fileItem.data?.file_path || fileItem.title || ''
    const newData = { ...fileItem.data, file_path: newFilePath }

    const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: fileId } }
    await adminUpdate(updateCtx, { title: newFilePath, data: newData })

    const { data: chunks } = await adminDb.from('items').select('id, data')
      .filter('data->>kb_type', 'eq', 'cil_chunk')
      .filter('data->>file_id', 'eq', fileId)

    for (const c of chunks || []) {
      const cd = c.data || {}
      const chunkUpdateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id: c.id } }
      await adminUpdate(chunkUpdateCtx, {
        data: { ...cd, file_path: newFilePath },
      }).catch(() => { /* non-fatal */ })
    }

    return {
      action: 'update_file_path',
      project_id: req.project_id,
      file_id: fileId,
      old_path: oldPath,
      new_path: newFilePath,
      chunks_updated: chunks?.length || 0,
    }
  }

  throw new Error(`Unknown action: ${action}. Valid actions: get_selected_files, store_markers, update_documentation, detect_changes, mark_dead, update_file_path`)
})
// CIL[DOC-VECTOR type="context" content="purpose='Main Netlify function handler for CIL agent ingestion actions.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent-ingest.ts:handler:constant"]


