/**
 * @module   pipeline
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * This module implements the pipeline for processing MCP (Model Context Protocol) requests, utilizing various utilities for data handling and validation. It serves as a core component in the server architecture, facilitating interactions with the database and file system. INVARIANT: All requests must be properly authenticated before reaching this module.
 *
 * @seeAlso adminDb (provides database access for administrative tasks).
 * @seeAlso computeContentHash (used for content integrity verification).
 * @seeAlso McpServer (the main server interface for handling MCP requests).
 *
 * @cil-generated
 */

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-MACRO purpose="This module implements the pipeline for processing MCP (Model Context Protocol) requests, utilizing various utilities..."]
// CIL[DOC-RESPONSIBILITY responsibility="This module implements the pipeline for processing MCP (Model Context Protocol) requests, utilizing various utilities..."]
// CIL[DOC-CONTEXT module="pipeline" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="This module implements the pipeline for processing MCP (Model Context Protocol) requests, utilizing various utilities..." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb, resolveTypeRecord } from '../../shared/db.js'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'node:crypto'
import { toCanonicalPath, computeContentHash } from '../../../functions/_shared/cil.js'
// CIL[DOC-VECTOR type="context" content="purpose='This module implements the pipeline for processing MCP (Model Context Protocol) requests, utilizing various utilities...'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline.ts:computeFileHash:function" type="function" identity="computeFileHash" parent="~/.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-MACRO purpose="Computes the SHA-256 hash of a given string content."]
// CIL[DOC-RESPONSIBILITY responsibility="Computes the SHA-256 hash of a given string content."]
// CIL[DOC-CONTEXT module="pipeline" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-CONTRACT inputs="content: string (required) — the content to hash." outputs="string — the resulting SHA-256 hash in hexadecimal format." errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the SHA-256 hash of a given string content." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Computes the SHA-256 hash of a given string content. This function is used for generating a unique identifier for file contents based on their content.
 *
 * @inputSpec
 *   content: string (required) — the content to hash.
 * @outputSpec  string — the resulting SHA-256 hash in hexadecimal format.
 * @sideEffects none
 * @stability   stable
 * @calls       crypto.createHash
 * @cil-generated
 */
function computeFileHash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex')
}
// CIL[DOC-VECTOR type="context" content="purpose='Computes the SHA-256 hash of a given string content.'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline.ts:computeFileHash:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline.ts:estimateTokens:function" type="function" identity="estimateTokens" parent="~/.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-MACRO purpose="Estimates the number of tokens required for a given text based on its length."]
// CIL[DOC-RESPONSIBILITY responsibility="Estimates the number of tokens required for a given text based on its length."]
// CIL[DOC-CONTEXT module="pipeline" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-CONTRACT inputs="text: string (required) — the input text for which to estimate tokens." outputs="number — the estimated number of tokens." errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Estimates the number of tokens required for a given text based on its length." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Estimates the number of tokens required for a given text based on its length. This function is useful for determining resource allocation in text processing tasks.
 *
 * @inputSpec
 *   text: string (required) — the input text for which to estimate tokens.
 * @outputSpec  number — the estimated number of tokens.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
// CIL[DOC-VECTOR type="context" content="purpose='Estimates the number of tokens required for a given text based on its length.'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline.ts:estimateTokens:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline.ts:parseAgentAttributes:function" type="function" identity="parseAgentAttributes" parent="~/.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-MACRO purpose="Parser for agent attributes in key-value format."]
// CIL[DOC-RESPONSIBILITY responsibility="Uses a regular expression to match and extract key-value pairs from the input string."]
// CIL[DOC-CONTEXT module="pipeline" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-CONTRACT inputs="attrString: string (required) — a string containing agent attributes in key-value format." outputs="Record<string, string> — a record mapping attribute names to their corresponding values." errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses a regular expression to match and extract key-value pairs from the input string." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Parses a string of agent attributes formatted as key-value pairs and returns them as a record. This function is useful for extracting structured data from a raw attribute string.
 *
 * @macro       Parser for agent attributes in key-value format.
 * @micro       Uses a regular expression to match and extract key-value pairs from the input string.
 * @inputSpec
 *   - attrString: string (required) — a string containing agent attributes in key-value format.
 * @outputSpec  Record<string, string> — a record mapping attribute names to their corresponding values.
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
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline.ts:parseAgentAttributes:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Parser for agent attributes in key-value format.'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline.ts:AgentParsedMarker:interface" type="interface" identity="AgentParsedMarker" parent="~/.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-MACRO purpose="Defines AgentParsedMarker"]
// CIL[DOC-RESPONSIBILITY responsibility="AgentParsedMarker implementation"]
// CIL[DOC-CONTEXT module="pipeline" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface AgentParsedMarker {
  stable_id: string
  start_line: number
  end_line: number
  type: string
  identity: string
  parent: string
  attributes?: Record<string, string>
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines AgentParsedMarker'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline.ts:AgentParsedMarker:interface"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline.ts:parseAgentCilMarkers:function" type="function" identity="parseAgentCilMarkers" parent="~/.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-MACRO purpose="Defines parseAgentCilMarkers"]
// CIL[DOC-RESPONSIBILITY responsibility="parseAgentCilMarkers implementation"]
// CIL[DOC-CONTEXT module="pipeline" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function parseAgentCilMarkers(lines: string[]): AgentParsedMarker[] {
  const markers: AgentParsedMarker[] = []
  const stack: { line: number; attrs: Record<string, string> }[] = []

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    const beginMatch = trimmed.match(/^(?:\/\/|--|#)\s*CIL\[BEGIN\s+(.+)\]$/) || trimmed.match(/^<!--\s*CIL\[BEGIN\s+(.+)\]\s*-->$/)
    const endMatch = trimmed.match(/^(?:\/\/|--|#)\s*CIL\[END\s+stable_id="([^"]+)"\]$/) || trimmed.match(/^<!--\s*CIL\[END\s+stable_id="([^"]+)"\]\s*-->$/)

    if (beginMatch) {
      const attrs = parseAgentAttributes(beginMatch[1])
      stack.push({ line: i + 1, attrs })
    } else if (endMatch && stack.length > 0) {
      const opened = stack.pop()!
      markers.push({
        stable_id: endMatch[1],
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
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline.ts:parseAgentCilMarkers:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Defines parseAgentCilMarkers'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline.ts:AgentParsedDocs:interface" type="interface" identity="AgentParsedDocs" parent="~/.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-MACRO purpose="The AgentParsedDocs interface defines the structure for parsed documentation related to agents, encapsulating various..."]
// CIL[DOC-RESPONSIBILITY responsibility="The AgentParsedDocs interface defines the structure for parsed documentation related to agents, encapsulating various..."]
// CIL[DOC-CONTEXT module="pipeline" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="The AgentParsedDocs interface defines the structure for parsed documentation related to agents, encapsulating various..." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The AgentParsedDocs interface defines the structure for parsed documentation related to agents, encapsulating various attributes that describe their functionality and context. It serves as a schema for organizing agent-related information in a consistent manner.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface AgentParsedDocs {
  macro?: string
  responsibility?: string
  context?: Record<string, any>
  contract?: Record<string, any>
  micro?: Record<string, any>
  confidence?: { pass: string; score: number; flags: string[] }
  stability?: string
  audience?: string
  vectors?: Record<string, { content: string; status: string }>
  notes?: Array<Record<string, any>>
  learnings?: Array<Record<string, any>>
  raw: Record<string, string>
}
// CIL[DOC-VECTOR type="context" content="purpose='The AgentParsedDocs interface defines the structure for parsed documentation related to agents, encapsulating various...'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline.ts:AgentParsedDocs:interface"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline.ts:parseAgentCilDocs:function" type="function" identity="parseAgentCilDocs" parent="~/.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-MACRO purpose="Documentation parser for agent CIL comments."]
// CIL[DOC-RESPONSIBILITY responsibility="Iterates through specified line ranges, applying regex to extract structured documentation attributes."]
// CIL[DOC-CONTEXT module="pipeline" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-CONTRACT inputs="lines: string[] (required), startLine: number (required), endLine: number (required)" outputs="AgentParsedDocs — an object containing parsed documentation attributes." errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Iterates through specified line ranges, applying regex to extract structured documentation attributes." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Parses lines of documentation comments for agent CIL and organizes them into a structured format. This function extracts specific documentation keys and their associated content for further processing.
 *
 * @macro       Documentation parser for agent CIL comments.
 * @micro       Iterates through specified line ranges, applying regex to extract structured documentation attributes.
 * @inputSpec
 *   - lines: string[] (required) — array of lines containing documentation comments.
 *   - startLine: number (required) — the starting line number for parsing.
 *   - endLine: number (required) — the ending line number for parsing.
 * @outputSpec  AgentParsedDocs — an object containing parsed documentation attributes.
 * @sideEffects none
 * @stability   stable
 * @calls       parseAgentAttributes
 * @cil-generated
 */
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
      case 'CONFIDENCE':
        docs.confidence = {
          pass: attrs.pass || 'first',
          score: parseFloat(attrs.score || '0'),
          flags: attrs.flags ? attrs.flags.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        }
        break
      case 'VECTOR':
        if (attrs.type) {
          if (!docs.vectors) docs.vectors = {}
          docs.vectors[attrs.type] = {
            content: attrs.content || '',
            status: attrs.status || 'ready',
          }
        }
        break
      case 'STABILITY':
        docs.stability = attrs.stability || content.replace(/^stability="|"$/g, '')
        break
      case 'AUDIENCE':
        docs.audience = attrs.audience || content.replace(/^audience="|"$/g, '')
        break
      case 'NOTE':
        if (!docs.notes) docs.notes = []
        docs.notes.push(attrs)
        break
      case 'LEARNING':
        if (!docs.learnings) docs.learnings = []
        docs.learnings.push(attrs)
        break
    }
  }
  return docs
}
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline.ts:parseAgentCilDocs:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline.ts:mapAgentDocsToChunkData:function" type="function" identity="mapAgentDocsToChunkData" parent="~/.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Documentation parser for agent CIL comments.'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Defines mapAgentDocsToChunkData"]
// CIL[DOC-RESPONSIBILITY responsibility="mapAgentDocsToChunkData implementation"]
// CIL[DOC-CONTEXT module="pipeline" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function mapAgentDocsToChunkData(docs: AgentParsedDocs): Record<string, any> {
  const pendingVectors = docs.vectors
    ? Object.entries(docs.vectors).filter(([, v]) => v.status === 'pending_human_input').map(([k]) => k)
    : []

  return {
    macro: docs.macro || docs.raw.MACRO || '',
    micro: docs.micro?.logic_summary || docs.responsibility || '',
    description: docs.macro || '',
    input_spec: docs.contract?.inputs?.replace(/\\n/g, '\n') || '',
    output_spec: docs.contract?.outputs || '',
    side_effects: docs.contract?.side_effects || '',
    throws: docs.contract?.errors || '',
    module: docs.context?.module || '',
    layer: docs.context?.layer || '',
    doc_confidence: docs.confidence?.pass === 'second' ? 'ai_generated' : 'from_source',
    confidence_score: docs.confidence?.score || 0,
    confidence_flags: docs.confidence?.flags || [],
    related_files: docs.context?.related_files || '',
    tags: docs.micro?.notable_decisions || '',
    depends_on: docs.contract?.dependencies || '',
    stability: docs.stability || '',
    audience: docs.audience || '',
    vector_content: docs.vectors || {},
    vectors_pending_human_review: pendingVectors,
    notes: docs.notes || [],
    learnings: docs.learnings || [],
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines mapAgentDocsToChunkData'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline.ts:mapAgentDocsToChunkData:function"]

/**
 * Registers tools for testing authentication and updating pipeline statuses in the MCP server. This module facilitates the management of file statuses within a project pipeline.
 *
 * @macro       Tool registration function for MCP server.
 * @micro       Utilizes asynchronous database operations to update project file statuses based on input parameters.
 * @inputSpec
 *   - server: McpServer (required) — The MCP server instance to register tools with.
 * @outputSpec  Promise<void> — No specific return value.
 * @sideEffects Database writes to update project file statuses.
 * @stability   stable
 * @calls       adminDb.from, adminDb.update
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/pipeline.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-MACRO purpose="Tool registration function for MCP server."]
// CIL[DOC-RESPONSIBILITY responsibility="Utilizes asynchronous database operations to update project file statuses based on input parameters."]
// CIL[DOC-CONTEXT module="pipeline" layer="app-specific" related_files=".framework/functions/_shared/cil.ts,.framework/mcp/shared/db.ts,.framework/mcp/tools/cil/pipeline.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer (required) — The MCP server instance to register tools with." outputs="Promise<void> — No specific return value." errors="none" side_effects="Database writes to update project file statuses."]
// CIL[DOC-MICRO logic_summary="Utilizes asynchronous database operations to update project file statuses based on input parameters." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function register(server: McpServer) {

  server.registerTool(
    'spine_cil_test_auth',
    {
      description: 'Test authentication and module loading',
      inputSchema: z.object({}),
    },
    async () => {
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ success: true, message: 'Pipeline tools loaded successfully' }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    'spine_cil_update_pipeline_status',
    {
      description: 'Update a file\'s pipeline status. Call at the end of each agent-run step. Standard statuses follow the 0–8 pipeline, but custom temporary statuses are also allowed.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        file_path: z.string().describe('Relative file path within the repository'),
        status: z.string().describe('File status — standard statuses follow the 0–8 pipeline, but custom temporary statuses are allowed'),
        metadata: z.object({}).passthrough().optional().describe('Additional metadata to store with the status update'),
      }),
    },
    async ({ project_id, file_path, status, metadata = {} }) => {
      const [projectRes] = await Promise.allSettled([
        adminDb.from('items').select('id, title, data').eq('id', project_id).maybeSingle(),
      ])

      const project = projectRes.status === 'fulfilled' ? projectRes.value.data : null
      if (!project) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: 'Project not found' }, null, 2) }] }
      }

      const pipelineData = project.data || {}
      const fileStatuses = pipelineData.file_statuses || {}

      fileStatuses[file_path] = status
      fileStatuses[`${file_path}_updated`] = new Date().toISOString()
      if (Object.keys(metadata).length > 0) {
        Object.assign(fileStatuses, { [`${file_path}_meta`]: metadata })
      }

      const [updateRes] = await Promise.allSettled([
        adminDb.from('items').update({
          data: { ...pipelineData, file_statuses: fileStatuses },
        }).eq('id', project_id).select()
      ])

      if (updateRes.status === 'rejected' || !updateRes.value.data) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: 'Failed to update status' }, null, 2) }] }
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: true,
            project_id,
            file_path,
            new_status: status,
            updated_at: fileStatuses[`${file_path}_updated`],
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    'spine_cil_store_markers',
    {
      description: `Parse CIL[BEGIN]/CIL[END] markers and DOC tags from a source file and upsert chunk records in the DB. The file must already be saved to disk before calling this.

Key constraints:
- file_path must be relative from repo root — never absolute
- file_hash must be the SHA256 of the current file content on disk (shasum -a 256 {path} | awk '{print $1}')
- start_line/end_line are the 1-based line numbers of the CIL[BEGIN]/CIL[END] lines themselves
- stable_id format: {canonical_path}:{identity_lowercase}:{type}
- parent: stable_id of direct parent, or "none" for top-level chunks

Returns: { ok, created, updated, results[] } — verify ok: true and counts match before continuing.`,
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The cil_project UUID'),
        file_path: z.string().describe('Relative path from repo root'),
        file_hash: z.string().optional().describe('SHA256 of the current file content'),
        markers: z.array(z.object({
          stable_id: z.string().describe('Stable chunk ID'),
          chunk_id: z.string().optional().describe('Legacy chunk ID (old format)'),
          start_line: z.number().int().min(1),
          end_line: z.number().int().min(1),
          type: z.string(),
          identity: z.string(),
          parent: z.string(),
        })).optional().describe('Chunk boundaries extracted from the annotated source — if omitted, all CIL[BEGIN/END] markers found in the file are used'),
      }),
    },
    async ({ project_id, file_path, file_hash, markers }) => {
      const { data: projectRows } = await adminDb.from('items').select('id, data, account_id')
        .filter('data->>kb_type', 'eq', 'cil_project')
        .eq('id', project_id)
        .eq('is_active', true)
      const projectItem = (projectRows || [])[0]
      if (!projectItem) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Project not found: ${project_id}` }) }] }
      }

      const accountId: string = projectItem.account_id || ''
      if (!accountId) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: 'Project has no account_id — cannot stamp chunks' }) }] }
      }

      const repoPath: string = projectItem.data?.repo_path || ''
      if (!repoPath) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: 'Project has no repo_path configured' }) }] }
      }

      const absolutePath = path.join(repoPath, file_path.replace(/^\//, ''))
      if (!fs.existsSync(absolutePath)) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Source file not found on disk: ${absolutePath}` }) }] }
      }

      const content = fs.readFileSync(absolutePath, 'utf-8')
      const computedHash = computeFileHash(content)
      if (file_hash && computedHash !== file_hash) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Hash mismatch: provided ${file_hash} != computed ${computedHash}` }) }] }
      }

      const lines = content.split('\n')
      const parsed = parseAgentCilMarkers(lines)
      const parsedById = new Map(parsed.map(m => [m.stable_id, m]))

      const markersToStore = (markers && markers.length > 0) ? markers : parsed
      const providedIds = new Set(markersToStore.map(m => m.stable_id))
      const sourceIds = new Set(parsed.map(m => m.stable_id))
      const missingInSource = markersToStore.filter(m => !sourceIds.has(m.stable_id))
      const extraInSource = parsed.filter(m => !providedIds.has(m.stable_id))
      if (missingInSource.length > 0 || extraInSource.length > 0) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              ok: false,
              error: `Marker mismatch: missing_in_source=[${missingInSource.map(m => m.stable_id).join(',')}], extra_in_source=[${extraInSource.map(m => m.stable_id).join(',')}]`,
            }),
          }],
        }
      }

      let chunkTypeId: string, chunkDesignSchema: Record<string, any>, chunkValidationSchema: Record<string, any>
      let fileTypeId: string, fileDesignSchema: Record<string, any>, fileValidationSchema: Record<string, any>
      try {
        const [chunkTypeRecord, fileTypeRecord] = await Promise.all([
          resolveTypeRecord('item', 'cil_chunk'),
          resolveTypeRecord('item', 'cil_file')
        ])
        chunkTypeId = chunkTypeRecord.id
        chunkDesignSchema = chunkTypeRecord.design_schema
        chunkValidationSchema = chunkTypeRecord.validation_schema
        fileTypeId = fileTypeRecord.id
        fileDesignSchema = fileTypeRecord.design_schema
        fileValidationSchema = fileTypeRecord.validation_schema
      } catch (e: any) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `CIL type not found — run migrations first: ${e.message}` }) }] }
      }

      const now = new Date().toISOString()
      const versionId = projectItem.data?.active_version_id || '0.1.0'

      const { data: existingFile } = await adminDb.from('items').select('id, data')
        .filter('data->>kb_type', 'eq', 'cil_file')
        .filter('data->>project_id', 'eq', project_id)
        .filter('data->>file_path', 'eq', file_path)
        .eq('is_active', true)
        .maybeSingle()
      
      let fileId: string
      if (existingFile) {
        fileId = existingFile.id
        try {
          const updatedFileData = {
            ...existingFile.data,
            file_hash: computedHash,
            version_id: versionId,
            updated_at: now,
          }
          await adminDb.from('items')
            .update({ data: updatedFileData, updated_at: now })
            .eq('id', fileId)
        } catch {
          // File metadata update is best-effort; continue with chunk sync
        }
      } else {
        const fileStableId = toCanonicalPath(repoPath, absolutePath)
        const fileData = {
          kb_type: 'cil_file',
          project_id,
          file_path,
          file_hash,
          stable_id: fileStableId,
          version_id: versionId,
          status: '2-chunked', // Files reach this status after chunking
          last_status_at: now,
        }
        const { data: newFile, error: fileError } = await adminDb.from('items')
          .insert({
            title: file_path,
            type_id: fileTypeId,
            account_id: accountId,
            design_schema: fileDesignSchema,
            validation_schema: fileValidationSchema,
            is_active: true,
            data: fileData,
          })
          .select('id')
          .maybeSingle()
        if (fileError || !newFile) {
          return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Failed to create cil_file item: ${fileError?.message || 'unknown'}` }) }] }
        }
        fileId = newFile.id
      }

      const { data: existingChunks } = await adminDb.from('items').select('id, data')
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>project_id', 'eq', project_id)
        .filter('data->>file_path', 'eq', file_path)
        .eq('is_active', true)
        .limit(1000)
      const existingByChunkId = new Map((existingChunks || []).map((c: any) => [c.data?.stable_id || c.data?.legacy_chunk_id || c.data?.chunk_id || c.id, c]))
      const existingIds = new Set((existingChunks || []).map((c: any) => c.id))

      const results: any[] = []
      const errors: string[] = []
      const usedIds = new Set<string>()

      for (const m of markersToStore) {
        const _parsed = parsedById.get(m.stable_id)!
        const codeContent = lines.slice(m.start_line, m.end_line - 1).join('\n')
        const docs = parseAgentCilDocs(lines, m.start_line, m.end_line)
        const docFields = mapAgentDocsToChunkData(docs)
        const fullContentHash = computeContentHash(codeContent)
        const tokenCount = estimateTokens(codeContent)

        const mm = m as any
        const parentStableId = mm.parent === 'none' ? null : mm.parent
        const baseData = {
          kb_type: 'cil_chunk',
          stable_id: mm.stable_id,
          chunk_name: m.identity,
          project_id,
          file_path,
          file_id: fileId, // Link to parent file item for existing embedding/mapping functions
          chunk_type: m.type,
          parent_id: parentStableId,
          parent_stable_id: parentStableId,
          version_id: versionId,
          line_start: m.start_line,
          line_end: m.end_line,
          stored_hash: fullContentHash,
          content_hash: fullContentHash,
          code_content: codeContent,
          token_count: tokenCount,
          is_dead_code: false,
          review_status: 'approved',
          boundary_confidence: 'high',
          boundary_source: 'agent_markers',
          ...docFields,
        }

        const existing: any = existingByChunkId.get(m.stable_id)
        if (existing) {
          try {
            const newData = { ...existing.data, ...baseData, updated_at: now }
            const { error } = await adminDb.from('items')
              .update({ data: newData, title: `${file_path}::${m.identity}`, updated_at: now })
              .eq('id', existing.id)
            if (error) errors.push(`${m.stable_id}: ${error.message}`)
            else {
              usedIds.add(existing.id)
              results.push({ stable_id: m.stable_id, action: 'updated', id: existing.id })
            }
          } catch (err: any) {
            errors.push(`${m.stable_id}: ${err?.message || String(err)}`)
          }
        } else {
          try {
            const { data: newChunk, error } = await adminDb.from('items')
              .insert({
                title: `${file_path}::${m.identity}`,
                type_id: chunkTypeId,
                account_id: accountId,
                design_schema: chunkDesignSchema,
                validation_schema: chunkValidationSchema,
                is_active: true,
                data: baseData,
              })
              .select('id')
              .maybeSingle()
            if (error) errors.push(`${m.stable_id}: ${error.message}`)
            else {
              if (newChunk?.id) usedIds.add(newChunk.id)
              results.push({ stable_id: m.stable_id, action: 'created', id: newChunk?.id })
            }
          } catch (err: any) {
            errors.push(`${m.stable_id}: ${err?.message || String(err)}`)
          }
        }
      }

      const idsToDeactivate = [...existingIds].filter((id: any) => !usedIds.has(id))
      for (const orphanId of idsToDeactivate) {
        try {
          const { error: deactError } = await adminDb.from('items')
            .update({ is_active: false, updated_at: now })
            .eq('id', orphanId)
          if (deactError) errors.push(`deactivate orphan ${orphanId}: ${deactError.message}`)
        } catch (err: any) {
          errors.push(`deactivate orphan ${orphanId}: ${err?.message || String(err)}`)
        }
      }

      const { count: liveChunkCount } = await adminDb.from('items')
        .select('*', { count: 'exact', head: true })
        .filter('data->>kb_type', 'eq', 'cil_chunk')
        .filter('data->>project_id', 'eq', project_id)
        .eq('is_active', true)
      if (liveChunkCount !== null) {
        try {
          await adminDb.from('items')
            .update({ data: { ...projectItem.data, chunk_count: liveChunkCount } })
            .eq('id', project_id)
        } catch (err: any) {
          errors.push(`project count update: ${err?.message || String(err)}`)
        }
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ok: errors.length === 0,
            project_id,
            file_path,
            file_id: fileId,
            file_hash: computedHash,
            chunk_count: markersToStore.length,
            created: results.filter(r => r.action === 'created').length,
            updated: results.filter(r => r.action === 'updated').length,
            errors: errors.length > 0 ? errors : undefined,
            results,
          }, null, 2),
        }],
      }
    }
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Tool registration function for MCP server.'; No verified external callers; imports: .framework/mcp/shared/db.ts,.framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/pipeline.ts:register:function"]
