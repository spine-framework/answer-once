// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Shared knowledge base helpers for generating embeddings, chunking text, and searching vector embeddings."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides shared utilities for KB ingestion, revocation, reindexing, and semantic search."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="[]" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Module header: imports database, middleware, permissions, and LLM helpers." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]

import { createHash } from 'crypto'
import { adminDb } from './db'
import { isSystemPrincipal, resolveAccessibleAccountIds } from './principal'
import type { CoreContext } from './middleware'
import { sanitizeRecordData } from './permissions'
import { callOpenAIEmbeddings } from './llm'
// admin-data is imported lazily — a static edge closes the cycle
// middleware → security → rate-limit → funnel → trigger-engine →
// pipeline-runner → kb → admin-data → middleware, leaving createHandler
// undefined during module evaluation.
const adminUpdate = async (ctx: any, body: any) =>
  (await import('../admin-data')).update(ctx, body)
// CIL[DOC-VECTOR type="context" content="purpose='Shared knowledge base helpers for generating embeddings, chunking text, and searching vector embeddings.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:EMBEDDING_MODEL:constant" type="constant" identity="EMBEDDING_MODEL" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="OpenAI embedding model identifier used for generating text embeddings."]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the default embedding model string."]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="string" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Constant string 'text-embedding-3-small'." notable_decisions="[]"]
const EMBEDDING_MODEL = 'text-embedding-3-small'
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:EMBEDDING_MODEL:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:DEFAULT_CHUNK_SIZE:constant" type="constant" identity="DEFAULT_CHUNK_SIZE" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='OpenAI embedding model identifier used for generating text embeddings.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Default maximum number of characters per KB text chunk."]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the default chunk size for text splitting."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTRACT inputs="[]" outputs="number" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Constant number 800." notable_decisions="[]"]
const DEFAULT_CHUNK_SIZE = 800
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:DEFAULT_CHUNK_SIZE:constant"]
// CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Default maximum number of characters per KB text chunk.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:DEFAULT_CHUNK_OVERLAP:constant" type="constant" identity="DEFAULT_CHUNK_OVERLAP" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Default overlap in characters between consecutive text chunks."]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the default chunk overlap for sliding window chunking."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTRACT inputs="[]" outputs="number" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Constant number 100." notable_decisions="[]"]
const DEFAULT_CHUNK_OVERLAP = 100
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:DEFAULT_CHUNK_OVERLAP:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:SIMILARITY_THRESHOLD:constant" type="constant" identity="SIMILARITY_THRESHOLD" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Default overlap in characters between consecutive text chunks.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Default cosine-similarity threshold for vector search matches."]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the minimum similarity score used to filter search results."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="number" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Constant number 0.15." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const SIMILARITY_THRESHOLD = 0.15
// CIL[DOC-VECTOR type="context" content="purpose='Default cosine-similarity threshold for vector search matches.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:SIMILARITY_THRESHOLD:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:DEFAULT_MATCH_COUNT:constant" type="constant" identity="DEFAULT_MATCH_COUNT" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Default number of vector search results to consider before pagination."]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the default match count used in semantic queries."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="number" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Constant number 10." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const DEFAULT_MATCH_COUNT = 10
// CIL[DOC-VECTOR type="context" content="purpose='Default number of vector search results to consider before pagination.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:DEFAULT_MATCH_COUNT:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:resolveSecurityLevel:function" type="function" identity="resolveSecurityLevel" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Resolve the vector security level for a KB item type from its declared design_schema."]
// CIL[DOC-RESPONSIBILITY responsibility="Reads functionality.kb.security_level off a type's design_schema; falls back to 'internal' (deny-by-default) when undeclared."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="designSchema: any — a type's design_schema (or a record's stamped copy)" outputs="string — 'restricted' | 'internal' | 'external'" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Returns functionality.kb.security_level when it is a non-empty string; 'internal' otherwise." notable_decisions="Security level is declared per KB type in seed design_schema (functionality.kb.security_level); undeclared types deny by default to 'internal' — no hardcoded slug map."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
export function resolveSecurityLevel(designSchema: any): string {
  const declared = designSchema?.functionality?.kb?.security_level
  return typeof declared === 'string' && declared ? declared : 'internal'
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the vector security level for a KB item type from its declared design_schema.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:resolveSecurityLevel:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:generateEmbedding:function" type="function" identity="generateEmbedding" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Generates an embedding for the provided text using an external API."]
// CIL[DOC-RESPONSIBILITY responsibility="Transforms textual data into a numerical format suitable for machine learning tasks."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="text: string (required), ctx: CoreContext (optional)" outputs="Promise of number array" errors="[]" side_effects="calls OpenAI API for embeddings"]
// CIL[DOC-MICRO logic_summary="Calls callOpenAIEmbeddings and returns the first embedding or an empty array." notable_decisions="Returns empty array if embedding not found."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
/**
 * Generates an embedding for the provided text using an external API. This function is essential for transforming textual data into a numerical format suitable for machine learning tasks.
 *
 * @macro       Async function that retrieves embeddings from an external service.
 * @micro       Calls an external API to obtain the embedding for the given text.
 * @inputSpec
 *   text: string (required) — the input text to generate an embedding for.
 *   ctx: CoreContext (optional) — optional context for the API call.
 * @outputSpec  Promise<number[]> — an array of numbers representing the embedding, or an empty array if not found.
 * @sideEffects calls OpenAI API for embeddings
 * @stability   internal
 * @calls       callOpenAIEmbeddings
 * @cil-generated
 */
async function generateEmbedding(text: string, ctx?: CoreContext): Promise<number[]> {
  const json = await callOpenAIEmbeddings(ctx, [text], EMBEDDING_MODEL)
  return json.data?.[0]?.embedding || []
}
// CIL[DOC-VECTOR type="context" content="purpose='Generates an embedding for the provided text using an external API.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:generateEmbedding:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:chunkText:function" type="function" identity="chunkText" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Splits text into overlapping chunks of a given size."]
// CIL[DOC-RESPONSIBILITY responsibility="Implements sliding-window chunking for long text fields."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="text: string, chunkSize: number, overlap: number" outputs="string array" errors="[]" side_effects="[]"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MICRO logic_summary="Iterates through text with a stride of chunkSize minus overlap and accumulates slices." notable_decisions="[]"]
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  if (!text) return []
  if (text.length <= chunkSize) return [text]

  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const chunk = text.slice(start, end)
    chunks.push(chunk)
    start += chunkSize - overlap
    if (start >= end) break
  }
  return chunks
}
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:chunkText:function"]


// CIL[DOC-VECTOR type="context" content="purpose='Splits text into overlapping chunks of a given size.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:getFieldValue:function" type="function" identity="getFieldValue" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Retrieves a flattened string value from a record or its data object."]
// CIL[DOC-RESPONSIBILITY responsibility="Normalizes record fields into a searchable text representation."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="record: any, field: string" outputs="string" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Checks record[field] then record.data[field]; joins arrays with spaces and coerces to string." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function getFieldValue(record: any, field: string): string {
  if (record[field] !== undefined && record[field] !== null) {
    const value = record[field]
    if (Array.isArray(value)) return value.join(' ')
    return String(value)
  }
  const data = record.data || {}
  if (data[field] !== undefined && data[field] !== null) {
    const value = data[field]
    if (Array.isArray(value)) return value.join(' ')
    return String(value)
  }
  return ''
}

const UUID_TOKEN_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi
const HTML_TAG_RE = /<[^>]*>/g
const HTML_LOOKS_LIKE_RE = /<\/?[a-z][^>]*>/i

// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:getembeddablefieldvalue:function" type="function" identity="getEmbeddableFieldValue" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Normalize a record field into embeddable plain text — strips rich-text HTML and bare UUID tokens"]
// CIL[DOC-RESPONSIBILITY responsibility="Produce the exact text that feeds both the content-hash lease and the embedder so neither markup nor identifier-only chunks enter the corpus"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/kb.ts"]
// CIL[DOC-CONTRACT inputs="record: any, field: string, designSchema: any" outputs="string — normalized text, '' when nothing embeddable remains" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="rich_text fields (or any value containing tags) run through an HTML-to-text pass; every field then drops bare UUID tokens — reference-id arrays like tag item ids collapse to empty and are skipped" notable_decisions="applied uniformly to all vector fields so the content hash dedupes on the same text the embedder sees"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function getEmbeddableFieldValue(record: any, field: string, designSchema: any): string {
  let text = getFieldValue(record, field)
  if (!text) return ''
  const dataType = designSchema?.fields?.[field]?.data_type
  if (dataType === 'rich_text' || HTML_LOOKS_LIKE_RE.test(text)) {
    text = text
      .replace(/<\/(p|div|h[1-6]|li|ul|ol|section|article|header|footer|blockquote|tr|table)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li[^>]*>/gi, '\n- ')
      .replace(HTML_TAG_RE, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;|&apos;/g, "'")
  }
  return text
    .replace(UUID_TOKEN_RE, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:getembeddablefieldvalue:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Retrieves a flattened string value from a record or its data object.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:getFieldValue:function"]


// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:getRawFieldValue:function" type="function" identity="getRawFieldValue" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Retrieves the raw value of a record field without string coercion."]
// CIL[DOC-RESPONSIBILITY responsibility="Returns the original value from record or record.data."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="record: any, field: string" outputs="any" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Checks record[field] then record.data[field]; returns undefined if not present." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function getRawFieldValue(record: any, field: string): any {
  if (record[field] !== undefined && record[field] !== null) return record[field]
  const data = record.data || {}
  if (data[field] !== undefined && data[field] !== null) return data[field]
  return undefined
}
// CIL[DOC-VECTOR type="context" content="purpose='Retrieves the raw value of a record field without string coercion.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:getRawFieldValue:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:matchesFilters:function" type="function" identity="matchesFilters" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Checks whether a record matches a set of filter values."]
// CIL[DOC-RESPONSIBILITY responsibility="Filters vector search results by field values."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="record: any, filters: Record<string, any>" outputs="boolean" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Compares expected values to actual values; returns false if any expected value is absent." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
function matchesFilters(record: any, filters: Record<string, any>): boolean {
  if (!filters || Object.keys(filters).length === 0) return true

  for (const [field, expected] of Object.entries(filters)) {
    const raw = getRawFieldValue(record, field)
    const actual = Array.isArray(raw) ? raw : (raw !== undefined ? [raw] : [])
    const expectedArr = Array.isArray(expected) ? expected : (expected !== undefined ? [expected] : [])
    if (expectedArr.length === 0) continue

    const hasOverlap = expectedArr.some((ev: any) => actual.includes(ev))
    if (!hasOverlap) return false
  }

  return true
}
// CIL[DOC-VECTOR type="context" content="purpose='Checks whether a record matches a set of filter values.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:matchesFilters:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:ensurePlatformAccountId:function" type="function" identity="ensurePlatformAccountId" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Resolves the global spine-system account ID from the accounts table."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the platform account ID for cross-account KB search."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="string or null" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Queries the accounts table for slug spine-system and returns the id or null." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
async function ensurePlatformAccountId(): Promise<string | null> {
  const { data, error } = await adminDb
    .from('accounts')
    .select('id')
    .eq('slug', 'spine-system')
    .maybeSingle()
  if (error) throw new Error(`platform_account_lookup_failed: ${error.message}`)
  return data?.id ?? null
}
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:ensurePlatformAccountId:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:knowledgeenvelope:interface" type="interface" identity="KnowledgeEnvelope" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="App-level knowledge access envelope declared in manifest config.knowledge"]
// CIL[DOC-RESPONSIBILITY responsibility="Declares the maximum set of KB/platform/CIL corpora any agent in an app may reach; deny-by-default when absent"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/agent-runner.ts,.framework/functions/_shared/pipeline-runner.ts,.framework/cli/commands/install-app.ts"]
// CIL[DOC-CONTRACT inputs="apps.config.knowledge (persisted from manifest.config.knowledge)" outputs="KnowledgeEnvelope" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="account gates own/descendant corpora (item_types supports trailing-* prefixes, scope self|self_and_descendants); platform.sources allowlists platform-account item types; cil requires explicit project_ids and governs every cil_chunk row" notable_decisions="missing envelope = no access; envelope is the ceiling, per-agent retrieval_policy picks may only narrow it"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export interface KnowledgeEnvelope {
  /** Own-account corpus. true/object enables; object may carry
   *  scope ('self' | 'self_and_descendants') and item_types patterns
   *  (exact slug or 'prefix*'). Omitted/false = no account KB access. */
  account?: boolean | { scope?: 'self' | 'self_and_descendants'; item_types?: string[] }
  /** Platform (spine-system) corpus. sources = allowed item_type patterns. */
  platform?: boolean | { sources?: string[] }
  /** CIL corpus. Only granted when an explicit project id list resolves. */
  cil?: boolean | { project_ids?: string[] }
}
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:knowledgeenvelope:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:knowledgescope:interface" type="interface" identity="KnowledgeScope" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Resolved effective knowledge access for one request/run"]
// CIL[DOC-RESPONSIBILITY responsibility="Carries the envelope∩pick intersection: permitted account ids, per-corpus item type allowlists, CIL project ids, and out-of-envelope violations"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/kb.ts"]
// CIL[DOC-CONTRACT inputs="KnowledgeEnvelope + agent retrieval_policy pick + caller account tree" outputs="KnowledgeScope" errors="violations[] for picks outside the envelope" side_effects="none"]
// CIL[DOC-STABILITY stability="experimental"]
export interface KnowledgeScope {
  allowed: boolean
  deniedReason?: string
  /** All account ids permitted to appear in results (self + descendants + platform when granted). */
  accountIds: string[]
  /** Self (+ descendants under hierarchy scope). */
  selfAccountIds: string[]
  platformAccountId: string | null
  /** null = unrestricted within the corpus; [] = corpus disabled. */
  accountItemTypes: string[] | null
  platformItemTypes: string[] | null
  /** null = CIL denied. Always an explicit list when enabled. */
  cilProjectIds: string[] | null
  /** Safe filter_item_types for match_embeddings, or null when a wildcard/unrestricted corpus exists. */
  rpcItemTypes: string[] | null
  /** Pick entries outside the envelope — callers must fail visibly, not clamp. */
  violations: string[]
  /** Set when the platform account lookup errored — callers may surface an error span while continuing with self scope. */
  platformLookupError?: string
}
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:knowledgescope:interface"]

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:matchitemtype:function" type="function" identity="matchItemType" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Match an item_type against a list of exact slugs or 'prefix*' wildcard patterns"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements pattern matching for knowledge envelope item_type lists"]
// CIL[DOC-CONTRACT inputs="patterns: string[] | null (null = unrestricted, [] = match nothing), itemType" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-STABILITY stability="experimental"]
export function matchItemType(patterns: string[] | null | undefined, itemType: string | undefined | null): boolean {
  if (patterns == null) return true
  if (!itemType) return false
  return patterns.some((p) =>
    p === '*' ? true : p.endsWith('*') ? itemType.startsWith(p.slice(0, -1)) : p === itemType
  )
}
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:matchitemtype:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:knowledgerowallowed:function" type="function" identity="knowledgeRowAllowed" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Decide whether a single embeddings/items row is inside the resolved knowledge scope"]
// CIL[DOC-RESPONSIBILITY responsibility="Applies per-corpus rules: account rows match accountItemTypes, platform rows match platformItemTypes, and cil_chunk rows are governed solely by cilProjectIds regardless of corpus"]
// CIL[DOC-CONTRACT inputs="scope: KnowledgeScope, row: { account_id?, metadata? }" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="cil_chunk rows require an explicit project grant even in unrestricted account corpora — this prevents the platform codebase leaking through a broad account allowlist" notable_decisions="cil_chunk is always project-gated"]
// CIL[DOC-STABILITY stability="experimental"]
export function knowledgeRowAllowed(scope: KnowledgeScope, row: { account_id?: string | null; metadata?: any }): boolean {
  const meta = row.metadata || {}
  if (meta.item_type === 'cil_chunk') {
    return !!scope.cilProjectIds?.length && !!meta.project_id && scope.cilProjectIds.includes(meta.project_id)
  }
  const isPlatformRow = !!scope.platformAccountId && row.account_id === scope.platformAccountId
  const isOwnRow = scope.selfAccountIds.includes(row.account_id || '')
  if (isPlatformRow && !isOwnRow) return matchItemType(scope.platformItemTypes, meta.item_type)
  if (isOwnRow || isPlatformRow) return matchItemType(scope.accountItemTypes, meta.item_type)
  return false
}
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:knowledgerowallowed:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:resolveknowledgescope:function" type="function" identity="resolveKnowledgeScope" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Resolve the effective knowledge scope for a request/agent run from the app's installed envelope and the agent's pick"]
// CIL[DOC-RESPONSIBILITY responsibility="Server-side enforcement point: loads apps.config.knowledge, intersects it with the per-agent retrieval pick, and returns the account ids + per-corpus allowlists that callers must apply"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/agent-runner.ts,.framework/functions/_shared/pipeline-runner.ts"]
// CIL[DOC-CONTRACT inputs="ctx: { accountId?, principal?, appId? }, appRef: app slug or uuid, pick: { item_types?, project_ids? }" outputs="KnowledgeScope (allowed=false when no envelope or nothing permitted)" errors="never throws for missing config — fails closed" side_effects="DB reads: apps, accounts, get_accessible_accounts"]
// CIL[DOC-MICRO logic_summary="Missing app/envelope => denied. account corpus adds self (+descendants when scope=self_and_descendants via get_accessible_accounts). platform corpus adds the spine-system account with its own item_type allowlist. cil only resolves when an explicit non-empty project list survives the envelope∩pick intersection. Pick item_types are intersected per corpus and any pick entry outside the envelope is recorded in violations." notable_decisions="deny-by-default; violations are surfaced for visible failure rather than silently clamped"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export async function resolveKnowledgeScope(
  ctx: { accountId?: string | null; appId?: string | null; principal?: { id?: string } },
  appRef?: string | null,
  pick: { item_types?: string[]; project_ids?: string[] } = {}
): Promise<KnowledgeScope> {
  const denied = (reason: string): KnowledgeScope => ({
    allowed: false,
    deniedReason: reason,
    accountIds: [],
    selfAccountIds: [],
    platformAccountId: null,
    accountItemTypes: [],
    platformItemTypes: [],
    cilProjectIds: null,
    rpcItemTypes: null,
    violations: [],
  })

  const ref = appRef || ctx.appId || null
  if (!ref) return denied('no_app: cannot resolve the app for knowledge access')
  if (!ctx.accountId) return denied('no_account: no account context for knowledge access')

  let app: any = null
  try {
    const res = await adminDb
      .from('apps')
      .select('id, slug, config, required_roles')
      .eq(UUID_RE.test(ref) ? 'id' : 'slug', ref)
      .maybeSingle()
    app = res?.data
  } catch (e: any) {
    console.warn('resolveKnowledgeScope: apps lookup failed:', e?.message)
    return denied('envelope_lookup_failed: could not load app config')
  }
  if (!app) return denied(`unknown_app: '${ref}' is not an installed app`)

  // The caller's app claim (x-app-id header) is client-controllable, so bind
  // it: when the app declares required_roles, the principal must hold at least
  // one. Otherwise a low-privilege caller could claim a staff app's envelope.
  const requiredRoles: string[] = Array.isArray(app.required_roles) ? app.required_roles : []
  const principalRoles: string[] = Array.isArray(ctx.principal?.roles) ? ctx.principal!.roles! : []
  const norm = (r: string) => String(r).replace(/-/g, '_')
  // system_admin is the platform superuser — same bypass convention as
  // useApps/AppWrapper/get_account_apps; a god-mode principal must not be
  // blocked by an app's required_roles envelope binding.
  const isSystemAdmin = principalRoles.some((pr) => norm(pr) === 'system_admin')
  if (requiredRoles.length && principalRoles.length && !isSystemAdmin) {
    const ok = requiredRoles.some((rr) => principalRoles.some((pr) => norm(pr) === norm(rr)))
    if (!ok) return denied(`app_role_mismatch: principal lacks any required role for app '${app.slug}'`)
  }

  const envelope = (app.config as any)?.knowledge as KnowledgeEnvelope | undefined
  if (!envelope || typeof envelope !== 'object') {
    return denied(`no_knowledge_envelope: app '${app.slug}' declares no knowledge access`)
  }

  const accountEnabled = !!envelope.account
  const accountBlock = envelope.account === true ? {} : (envelope.account || {})
  const platformEnabled = !!envelope.platform
  const platformBlock = envelope.platform === true ? {} : (envelope.platform || {})
  const cilEnabled = !!envelope.cil
  const cilBlock = envelope.cil === true ? {} : (envelope.cil || {})

  // Account corpus: self, or self + descendants under hierarchy scope.
  let selfAccountIds: string[] = accountEnabled ? [ctx.accountId] : []
  if (accountEnabled && accountBlock.scope === 'self_and_descendants' && ctx.principal?.id) {
    try {
      const { data } = await adminDb.rpc('get_accessible_accounts', { actor_id: ctx.principal.id })
      const ids = (data || []).map((r: any) => r.account_id ?? r).filter(Boolean)
      if (ids.length) selfAccountIds = ids
    } catch (e: any) {
      console.warn('resolveKnowledgeScope: get_accessible_accounts failed, using self only:', e?.message)
    }
  }

  // CIL: only granted when an explicit project list survives envelope ∩ pick.
  // `cil: true` without project_ids grants nothing — the pick (thread data)
  // is caller-influenceable, so an id-less envelope must not pass it through.
  const envCilIds = cilEnabled ? (cilBlock.project_ids ?? []) : null
  const pickCilIds = pick.project_ids?.length ? pick.project_ids : null
  const effectiveCilIds = envCilIds?.length && pickCilIds
    ? pickCilIds.filter((id) => envCilIds.includes(id))
    : (envCilIds?.length ? envCilIds : [])
  const cilProjectIds = cilEnabled && effectiveCilIds?.length ? effectiveCilIds : null
  const cilDeniedPicks = pickCilIds?.filter((id) => !cilProjectIds?.includes(id)) ?? []

  let platformAccountId: string | null = null
  let platformLookupError: string | undefined
  if (platformEnabled || cilProjectIds) {
    try {
      platformAccountId = await ensurePlatformAccountId()
    } catch (e: any) {
      platformLookupError = e?.message || String(e)
      console.warn('resolveKnowledgeScope: platform account lookup failed:', platformLookupError)
    }
  }

  // Envelope item types per corpus (null = unrestricted within that corpus).
  const envAccountTypes = accountEnabled ? (accountBlock.item_types ?? null) : []
  const envPlatformTypes = platformEnabled ? (platformBlock.sources ?? null) : []

  // Intersect the agent's pick with the envelope per corpus; record pick
  // entries that match nothing the app permits.
  const violations: string[] = []
  const pickTypes = pick.item_types?.length ? pick.item_types : null
  if (pickTypes) {
    for (const t of pickTypes) {
      const ok =
        matchItemType(envAccountTypes, t) ||
        matchItemType(envPlatformTypes, t) ||
        (t === 'cil_chunk' && !!cilProjectIds?.length)
      if (!ok) violations.push(t)
    }
  }
  const accountItemTypes = pickTypes ? pickTypes.filter((t) => matchItemType(envAccountTypes, t)) : envAccountTypes
  const platformItemTypes = pickTypes ? pickTypes.filter((t) => matchItemType(envPlatformTypes, t)) : envPlatformTypes
  if (cilDeniedPicks.length) violations.push(`cil projects outside envelope: ${cilDeniedPicks.join(',')}`)

  const accountIds = [
    ...(selfAccountIds),
    ...(platformAccountId && !selfAccountIds.includes(platformAccountId) ? [platformAccountId] : []),
  ]

  // Best-effort SQL-level item_type filter: only expressible when every
  // enabled corpus has an explicit, wildcard-free list.
  let rpcItemTypes: string[] | null
  if (violations.length || (!accountEnabled && !platformEnabled && !cilProjectIds)) {
    rpcItemTypes = []
  } else {
    const parts: string[] = []
    let unrestricted = false
    if (accountEnabled) {
      if (accountItemTypes == null) unrestricted = true
      else parts.push(...accountItemTypes)
    }
    if (platformEnabled) {
      if (platformItemTypes == null) unrestricted = true
      else parts.push(...platformItemTypes)
    }
    if (cilProjectIds?.length) parts.push('cil_chunk')
    const uniq = [...new Set(parts)]
    rpcItemTypes = unrestricted || uniq.some((t) => t.includes('*')) ? null : uniq
  }

  const allowed = accountIds.length > 0 &&
    (accountEnabled || platformEnabled || !!cilProjectIds?.length)

  return {
    allowed,
    deniedReason: allowed
      ? (violations.length ? `pick_outside_envelope: ${violations.join(',')}` : undefined)
      : 'empty_scope: knowledge envelope permits no corpora',
    accountIds,
    selfAccountIds,
    platformAccountId,
    accountItemTypes,
    platformItemTypes,
    cilProjectIds,
    rpcItemTypes,
    violations,
    platformLookupError,
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:resolveknowledgescope:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Resolves the global spine-system account ID from the accounts table.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:ensurePlatformAccountId:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:clearembeddingsforitem:function" type="function" identity="clearEmbeddingsForItem" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Revoke + delete every embeddings row for a document without touching document_leases."]
// CIL[DOC-RESPONSIBILITY responsibility="Internal embedding-clearing primitive shared by kbRevoke (which additionally clears the lease row) and kbIngest (which must NOT delete the lease it just acquired)."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/kb.ts,.framework/migrations/054_kb_ingest_lease.sql"]
// CIL[DOC-CONTRACT inputs="documentId: string (items.id / embeddings.document_id)" outputs="revoked count" errors="rpc/delete errors propagate" side_effects="revoke_embeddings_for_item RPC + embeddings row delete"]
// CIL[DOC-MICRO logic_summary="Calls revoke_embeddings_for_item then hard-deletes embeddings rows for document_id." notable_decisions="Extracted so kbIngest can clear stale embeddings inside its lease critical section — routing through kbRevoke would delete the caller's own document_leases row and break mutual exclusion."]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
async function clearEmbeddingsForItem(documentId: string): Promise<number> {
  const { data, error } = await adminDb.rpc('revoke_embeddings_for_item', { p_item_id: documentId })
  if (error) throw error

  const { error: deleteError } = await adminDb
    .from('embeddings')
    .delete()
    .eq('document_id', documentId)

  if (deleteError) throw deleteError
  return data || 0
}
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:clearembeddingsforitem:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:kbIngest:function" type="function" identity="kbIngest" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Ingests a knowledge base item by generating embeddings from its content and storing them in the database."]
// CIL[DOC-RESPONSIBILITY responsibility="Processes a published KB item, chunks vector fields, and persists embeddings under a content-hash document lease."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/migrations/054_kb_ingest_lease.sql"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext, body with id: string and optional account_id" outputs="ok: boolean; message: string; count?: number; in_progress?: boolean" errors="id is required; record not found; database errors" side_effects="revokes previous embeddings; inserts rows into embeddings table; acquires/releases a document_leases row; archives+revokes superseded documents"]
// CIL[DOC-MICRO logic_summary="Fetches the item, validates status, hashes the normalized vector-field values (rich_text HTML stripped, bare UUID tokens dropped), acquires a document lease ('reused' skips unchanged work, 'processing' reports another worker owns it), then inside try/finally clears stale embeddings, batches chunks into one embeddings call, inserts, and runs supersede_keys-driven supersession before releasing the lease token." notable_decisions="Revokes existing embeddings via clearEmbeddingsForItem (not kbRevoke — that would delete the caller's own lease); supersession is driven by functionality.kb.supersede_keys declared data fields instead of a hardcoded type-slug gate; a fenced release (token mismatch) warns without throwing — the work was written but ownership was lost to a superseding acquire."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-NOTE type="contract" content="Lease outcomes: 'reused' returns a live-embeddings count so callers may stamp freshness; 'processing' returns in_progress:true with NO success marker — callers that stamp embedding state must not stamp success or failure for it, the owning worker's completion reconciles the corpus."]
/**
 * The kbIngest function processes a knowledge base item by generating embeddings from its content and storing them in a database. It ensures the item is published before proceeding with embedding generation.
 *
 * @macro       Async function responsible for ingesting knowledge base items and generating embeddings.
 * @micro       Retrieves item details from the database, processes its content into chunks, and generates embeddings for each chunk.
 * @inputSpec
 *   - ctx: CoreContext (required) — the context containing account information.
 *   - body: { id: string } (required) — an object containing the ID of the knowledge base item.
 * @outputSpec  Promise<{ ok: boolean; message: string; count?: number; in_progress?: boolean }> — indicates success status, a message, and an optional count of embeddings generated; in_progress marks a lease 'processing' outcome another worker owns.
 * @throws      Error — id is required; Error — record not found; Error — error from database operations.
 * @sideEffects Writes embeddings to the database and may revoke previous embeddings; acquires and releases a document_leases row.
 * @stability   internal
 * @calls       adminDb.from('items'), adminDb.from('types'), adminDb.rpc('acquire_document_lease'), clearEmbeddingsForItem, callOpenAIEmbeddings, adminDb.from('embeddings').insert, adminDb.rpc('release_document_lease')
 * @cil-generated
 */
export async function kbIngest(ctx: CoreContext, body: { id: string; account_id?: string }): Promise<{ ok: boolean; message: string; count?: number; in_progress?: boolean }> {
  const { id } = body
  if (!id) throw new Error('id is required')

  // Multi-tenant support callers ingest articles owned by
  // customer accounts — the caller passes the record's account_id explicitly.
  // Default remains the caller's own account.
  const recordAccountId = isSystemPrincipal(ctx)
    ? (body.account_id || ctx.accountId)
    : ctx.accountId
  const { data: record, error } = await adminDb
    .from('items')
    .select('*')
    .eq('id', id)
    .eq('account_id', recordAccountId)
    .maybeSingle()

  if (error) throw error
  if (!record) throw new Error('record not found')

  if (record.status !== 'published') {
    await kbRevoke(ctx, { id })
    return { ok: true, message: 'record is not published; embeddings revoked if any' }
  }

  const designSchema = record.design_schema || {}
  const kbConfig = designSchema.functionality?.kb || {}
  const vectorFields = kbConfig.vector_fields || ['title', 'content']
  const chunkField = kbConfig.chunk_field || 'content'
  const chunkSize = kbConfig.chunk_size || DEFAULT_CHUNK_SIZE
  const chunkOverlap = kbConfig.chunk_overlap || DEFAULT_CHUNK_OVERLAP

  const { data: typeRecord, error: typeSlugError } = await adminDb
    .from('types')
    .select('slug, app_id')
    .eq('id', record.type_id)
    .single()
  if (typeSlugError) throw typeSlugError

  const typeSlug = typeRecord?.slug || ''
  const appId = record.app_id || typeRecord?.app_id || null
  // Apps declare the corpus security level on their type's
  // design_schema.functionality.kb.security_level; 'internal' is the
  // deny-by-default fallback when undeclared.
  const securityLevel = resolveSecurityLevel(designSchema)

  // Content-hash lease (document_leases, migration 054): sha256 over the
  // declared vector-field values in order — the same NORMALIZED text that
  // feeds the embedder (HTML stripped, bare UUIDs dropped). The lease
  // dedupes unchanged re-embeds and fences concurrent workers (publish
  // trigger + detached ingest both arrive here).
  const contentHash = createHash('sha256')
    .update(vectorFields.map((field: string) => getEmbeddableFieldValue(record, field, designSchema)).join('\n'))
    .digest('hex')

  const { data: lease, error: leaseError } = await adminDb.rpc('acquire_document_lease', {
    p_document_id: id,
    p_account_id: record.account_id,
    p_content_hash: contentHash,
  })
  if (leaseError) throw leaseError

  if (lease?.outcome === 'reused') {
    // Same-hash completed work exists — reuse it. Count live embeddings so
    // callers that stamp freshness get an honest count.
    const { count } = await adminDb
      .from('embeddings')
      .select('id', { count: 'exact', head: true })
      .eq('document_id', id)
      .is('revoked_at', null)
    return { ok: true, message: 'embeddings reused (unchanged content)', count: count ?? 0 }
  }

  if (lease?.outcome === 'processing') {
    // A live worker owns this content's embed — nothing to do. The caller
    // must NOT stamp success; in_progress lets stampers keep their pending
    // marker instead of writing a false terminal state.
    return { ok: true, message: 'embedding already in progress', in_progress: true }
  }

  const leaseId: string | null = lease?.lease_id || null
  let succeeded = false
  try {
    // Clear prior embeddings WITHOUT deleting the lease row we just hold —
    // kbRevoke clears document_leases for external callers (so a revoked
    // doc re-ingests cleanly); routing through it here would release our
    // own lease mid-flight and reopen the race the lease exists to close.
    await clearEmbeddingsForItem(id)

    const toEmbed: Array<{ field: string; chunk: string }> = []
    for (const field of vectorFields) {
      const raw = getEmbeddableFieldValue(record, field, designSchema)
      if (!raw.trim()) continue

      const isChunked = field === chunkField && raw.length > chunkSize
      const chunks = isChunked ? chunkText(raw, chunkSize, chunkOverlap) : [raw]

      for (const chunk of chunks) {
        if (chunk.trim()) toEmbed.push({ field, chunk })
      }
    }

    // One batched embedding call per item — a sequential call per chunk makes
    // bulk reindex (N items × ~10 chunks) blow past the function timeout.
    const embedJson = await callOpenAIEmbeddings(ctx, toEmbed.map(t => t.chunk), EMBEDDING_MODEL)
    const vectors: number[][] = (embedJson.data || []).map((d: any) => d.embedding)

    const embeddingsToInsert: any[] = []
    for (let i = 0; i < toEmbed.length; i++) {
      const embedding = vectors[i]
      if (!embedding?.length) continue
      embeddingsToInsert.push({
        account_id: record.account_id,
        model_id: EMBEDDING_MODEL,
        document_id: id,
        chunk_index: i,
        content: toEmbed[i].chunk,
        embedding: JSON.stringify(embedding),
        metadata: {
          type_slug: typeSlug,
          item_type: typeSlug,
          app_id: appId,
          vector_type: toEmbed[i].field,
          security_level: securityLevel,
          status: record.status,
        },
        approved_at: new Date().toISOString(),
        revoked_at: null,
      })
    }

    if (embeddingsToInsert.length === 0) {
      succeeded = true
      return { ok: true, message: 'no content to embed', count: 0 }
    }

    const { error: insertError } = await adminDb.from('embeddings').insert(embeddingsToInsert)
    if (insertError) throw insertError

    // Supersession: a newly published document with the same logical
    // identity replaces older published versions. Types declare the data
    // fields that identify a logical document via
    // design_schema.functionality.kb.supersede_keys (e.g. ['slug'],
    // ['source_ticket_id']); undeclared types skip supersession entirely.
    const supersedeKeys: string[] = Array.isArray(kbConfig.supersede_keys) ? kbConfig.supersede_keys : []
    const orParts: string[] = []
    for (const key of supersedeKeys) {
      const value = record.data?.[key]
      if (value !== undefined && value !== null && value !== '') {
        orParts.push(`data->>${key}.eq.${value}`)
      }
    }
    if (orParts.length) {
      const { data: stale } = await adminDb
        .from('items')
        .select('id, status, data')
        .eq('account_id', record.account_id)
        .eq('type_id', record.type_id)
        .eq('status', 'published')
        .neq('id', id)
        .or(orParts.join(','))
      for (const old of stale || []) {
        await adminDb
          .from('items')
          .update({
            status: 'archived',
            data: { ...(old.data || {}), superseded_by: id, superseded_at: new Date().toISOString() },
            updated_at: new Date().toISOString(),
          })
          .eq('id', old.id)
        await kbRevoke(ctx, { id: old.id }).catch((err) =>
          console.warn(`supersession revoke failed for ${old.id}:`, err?.message)
        )
      }
    }

    succeeded = true
    return { ok: true, message: 'embeddings generated', count: embeddingsToInsert.length }
  } finally {
    // Token-gated release. A false return means a superseding acquire took
    // ownership mid-flight (new content hash or expired lease) — the work
    // was already written but ownership was lost; warn, do not throw, and
    // let the next run reconcile.
    const { data: released, error: releaseError } = await adminDb.rpc('release_document_lease', {
      p_document_id: id,
      p_lease_id: leaseId,
      p_status: succeeded ? 'completed' : 'failed',
    })
    if (releaseError) {
      console.warn(`release_document_lease failed for ${id}:`, releaseError.message)
    } else if (released === false) {
      console.warn(`document lease fenced for ${id} — a superseding acquire took ownership before release`)
    }
  }
}
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:kbIngest:function"]


// CIL[DOC-VECTOR type="context" content="purpose='Ingests a knowledge base item by generating embeddings from its content and storing them in the database.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:kbRevoke:function" type="function" identity="kbRevoke" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Revokes all embeddings associated with a given knowledge base item."]
// CIL[DOC-RESPONSIBILITY responsibility="Removes embeddings for an item from the vector store."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext, body with id: string" outputs="ok: boolean; message: string; count?: number" errors="id is required; database errors" side_effects="deletes rows from embeddings table; deletes the document_leases row so a revoked doc re-ingests cleanly"]
// CIL[DOC-MICRO logic_summary="Clears embeddings via clearEmbeddingsForItem, then deletes the document_leases row (warn-on-error) so a 'completed' lease cannot force 'reused' on a now-empty corpus." notable_decisions="Lease delete is unconditional — an in-flight ingest racing an external revoke is already racy at the status level."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
/**
 * The kbRevoke function revokes embeddings associated with a specific item ID. It ensures that the item ID is provided and performs database operations to delete the embeddings.
 *
 * @inputSpec
 *   ctx: CoreContext (required) — the context object for core operations.
 *   body: { id: string } (required) — an object containing the ID of the item whose embeddings are to be revoked.
 * @outputSpec  Promise<{ ok: boolean; message: string; count?: number }> — returns an object indicating success, a message, and an optional count of revoked embeddings.
 * @throws      Error — id is required, Error — error from revoke_embeddings_for_item, Error — deleteError from embeddings deletion
 * @sideEffects DB writes to revoke embeddings, delete from the embeddings table, and delete the document_leases row.
 * @stability   internal
 * @calls       clearEmbeddingsForItem, adminDb.from('document_leases').delete()
 * @cil-generated
 */
export async function kbRevoke(ctx: CoreContext, body: { id: string }): Promise<{ ok: boolean; message: string; count?: number; skipped?: boolean }> {
  const { id } = body
  if (!id) throw new Error('id is required')

  // Execution-time fence: a revoke queued by an intermediate
  // item_updated event (e.g. auto_revoke_on_unpublish fired while a
  // publish pipeline was mid-flight) executes long after the trigger
  // condition was true. Re-check the document's CURRENT status — if it
  // is published now, its embeddings are fresh and must be kept.
  // Trigger-time evaluation is always stale by the time work runs.
  const { data: doc } = await adminDb
    .from('items')
    .select('status, data, account_id')
    .eq('id', id)
    .maybeSingle()
  const docStatus = doc?.status ?? doc?.data?.status
  if (doc && docStatus === 'published') {
    return { ok: true, skipped: true, message: 'document is published — embeddings retained', count: 0 }
  }

  // Revoke is a delete on the document's search surface — the caller must
  // be able to reach the owning account unless they're a system principal.
  if (!isSystemPrincipal(ctx) && doc?.account_id) {
    const ids = await resolveAccessibleAccountIds(ctx)
    if (!(ids || []).includes(doc.account_id)) {
      const e: any = new Error('Item belongs to a different account')
      e.statusCode = 403
      throw e
    }
  }

  const count = await clearEmbeddingsForItem(id)

  // Clear any stored lease — a 'completed' lease would otherwise force
  // 'reused' on the next ingest of this now-empty corpus. Warn-only: a
  // lease-delete failure must not fail revocation.
  const { error: leaseDeleteError } = await adminDb
    .from('document_leases')
    .delete()
    .eq('document_id', id)
  if (leaseDeleteError) {
    console.warn(`document_leases delete failed for ${id}:`, leaseDeleteError.message)
  }

  return { ok: true, message: 'embeddings revoked', count }
}
// CIL[DOC-VECTOR type="context" content="purpose='Revokes all embeddings associated with a given knowledge base item.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:kbRevoke:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:kbReindex:function" type="function" identity="kbReindex" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Re-ingests all published items of a given type to refresh their embeddings."]
// CIL[DOC-RESPONSIBILITY responsibility="Iterates over published items for a type and re-runs kbIngest."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext, body with type_slug: string, app_id?: string" outputs="ok: boolean; count: number" errors="type_slug is required; type not found; database errors" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Resolves the type ID, queries published items, and calls kbIngest for each." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
export async function kbReindex(ctx: CoreContext, body: { type_slug: string; app_id?: string }): Promise<{ ok: boolean; count: number; errors?: Array<{ id: string; error: string }> }> {
  // Re-embedding the whole corpus spends platform AI budget — system only.
  if (!isSystemPrincipal(ctx)) {
    const e: any = new Error('Insufficient permissions for corpus reindex')
    e.statusCode = 403
    throw e
  }
  const { type_slug } = body
  if (!type_slug) throw new Error('type_slug is required')

  const { data: typeRecord } = await adminDb
    .from('types')
    .select('id')
    .eq('slug', type_slug)
    .maybeSingle()

  if (!typeRecord) throw new Error(`type not found: ${type_slug}`)

  let query = adminDb.from('items').select('id').eq('type_id', typeRecord.id).eq('status', 'published')
  if (body.app_id) query = query.eq('app_id', body.app_id)

  const { data: records, error } = await query
  if (error) throw error

  // Bounded parallelism — sequential ingest of a full corpus exceeds the
  // function timeout, and one bad record should not abort the whole reindex.
  const BATCH = 10
  let count = 0
  const errors: Array<{ id: string; error: string }> = []
  for (let i = 0; i < (records || []).length; i += BATCH) {
    const batch = (records || []).slice(i, i + BATCH)
    const results = await Promise.allSettled(batch.map(r => kbIngest(ctx, { id: r.id })))
    for (let j = 0; j < results.length; j++) {
      const r = results[j]
      if (r.status === 'fulfilled') count++
      else errors.push({ id: batch[j].id, error: String(r.reason?.message || r.reason) })
    }
  }

  return { ok: errors.length === 0, count, errors }
}
// CIL[DOC-VECTOR type="context" content="purpose='Re-ingests all published items of a given type to refresh their embeddings.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:kbReindex:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:kbSearch:function" type="function" identity="kbSearch" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Performs semantic search over knowledge base embeddings and returns matching published records."]
// CIL[DOC-RESPONSIBILITY responsibility="Executes vector search, filters by metadata, and returns sanitized results."]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/kb.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext, body: any" outputs="results array; count: number" errors="query is required; database errors" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Generates query embedding, calls match_embeddings, filters, deduplicates, and builds result objects." notable_decisions="Includes platform account in search; limits to best match per document."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
export async function kbSearch(ctx: CoreContext, body: any): Promise<{ results: any[]; count: number; error?: string }> {
  const query = body.query
  const typeSlugs = body.type_slugs || []
  const sources = body.sources || ['kb']
  const appId = body.app_id || null
  const vectorFields = body.vector_fields || []
  const limit = body.limit || DEFAULT_MATCH_COUNT
  const offset = body.offset || 0
  const filters = body.filters || {}
  const threshold = typeof body.similarity_threshold === 'number' ? body.similarity_threshold : SIMILARITY_THRESHOLD

  if (!query) throw new Error('query is required')

  // App knowledge envelope is the ceiling; body.type_slugs is the caller's
  // pick within it. Deny-by-default: no envelope, no retrieval.
  const scope = await resolveKnowledgeScope(ctx, (ctx as any).appId || body.app_id, { item_types: typeSlugs })
  if (!scope.allowed) {
    return { results: [], count: 0, error: `knowledge_denied: ${scope.deniedReason}` }
  }
  if (scope.violations.length) {
    return { results: [], count: 0, error: `knowledge_denied: sources outside app envelope: ${scope.violations.join(', ')}` }
  }
  const accountIds = scope.accountIds

  const queryEmbedding = await generateEmbedding(query, ctx)
  if (!queryEmbedding.length) return { results: [], count: 0 }

  const allowedVectorTypes = new Set(vectorFields)
  const allowedTypeSlugs = new Set(typeSlugs)
  const includeKb = !sources.length || sources.includes('kb')
  const includeCode = !sources.length || sources.includes('code')

  const allMatches: any[] = []
  const vectorTypesToSearch = vectorFields.length ? vectorFields : [null]
  const matchCount = Math.max(offset + limit, 50)

  for (const vt of vectorTypesToSearch) {
    const { data: matches, error: rpcError } = await adminDb.rpc('match_embeddings', {
      query_embedding: queryEmbedding,
      match_count: matchCount,
      filter_account_ids: accountIds,
      filter_vector_type: vt,
      similarity_threshold: threshold,
      filter_item_types: scope.rpcItemTypes,
    })

    if (rpcError) throw new Error(`rpc_${rpcError.message}`)
    allMatches.push(...(matches || []))
  }

  const filtered = allMatches.filter((m: any) => {
    if (m.similarity < threshold) return false
    if (!knowledgeRowAllowed(scope, m)) return false
    const meta = m.metadata || {}
    const vectorType = meta.vector_type || ''
    const matchAppId = meta.app_id || null

    if (vectorFields.length && !allowedVectorTypes.has(vectorType)) return false

    if (appId && matchAppId !== appId) return false

    const isCode = meta.item_type === 'cil_chunk'
    if (isCode && !includeCode) return false
    if (!isCode && !includeKb) return false

    return true
  })

  const bestByDoc = new Map<string, any>()
  for (const m of filtered) {
    const existing = bestByDoc.get(m.document_id)
    if (!existing || m.similarity > existing.similarity) bestByDoc.set(m.document_id, m)
  }

  const documentIds = Array.from(bestByDoc.keys()).slice(offset, offset + limit)
  if (documentIds.length === 0) return { results: [], count: 0 }

  // document_id is a UUID for regular records but a CIL stable_id for
  // cil_chunk embeddings — feeding stable_ids to .in('id', ...) errors with
  // 'invalid input syntax for type uuid', so split the lookup like
  // retrieveKnowledge does.
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const uuidIds = documentIds.filter((id) => UUID_RE.test(id))
  const stableIds = documentIds.filter((id) => !UUID_RE.test(id))
  const records: any[] = []
  if (uuidIds.length) {
    const { data, error } = await (ctx.db || adminDb)
      .from('items')
      .select('*, types!inner(slug)')
      .in('id', uuidIds)
      .in('account_id', accountIds)
    if (error) throw error
    records.push(...(data || []))
  }
  if (stableIds.length) {
    const { data, error } = await (ctx.db || adminDb)
      .from('items')
      .select('*, types!inner(slug)')
      .in('data->>stable_id', stableIds)
      .in('account_id', accountIds)
    if (error) throw error
    records.push(...(data || []))
  }

  const recordByDocId = new Map<string, any>()
  for (const r of records) {
    recordByDocId.set(r.id, r)
    if (r.data?.stable_id) recordByDocId.set(r.data.stable_id, r)
  }

  const results: any[] = []
  for (const match of documentIds.map((id) => bestByDoc.get(id))) {
    const record = recordByDocId.get(match.document_id)
    if (!record) continue
    if (record.status !== 'published') continue
    if (!matchesFilters(record, filters)) continue

    const sanitized = await sanitizeRecordData(ctx, record, 'items')
    if (!sanitized.data || Object.keys(sanitized.data).length === 0) continue
    const recordTypeSlug = (record as any).types?.slug || sanitized.type_slug || record.type_slug
    if (typeSlugs.length > 0 && !allowedTypeSlugs.has(recordTypeSlug || '')) continue

    const source = match.metadata?.item_type === 'cil_chunk' ? 'code' : 'kb'
    results.push({
      id: record.id,
      document_id: match.document_id,
      type_slug: recordTypeSlug,
      title: sanitized.title || record.title,
      snippet: match.content,
      app_id: record.app_id || match.metadata?.app_id || null,
      similarity: match.similarity,
      status: record.status,
      created_at: record.created_at,
      source,
      data: sanitized.data,
    })
  }

  return { results: results.sort((a, b) => b.similarity - a.similarity), count: results.length }
}
// CIL[DOC-VECTOR type="context" content="purpose='Performs semantic search over knowledge base embeddings and returns matching published records.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:kbSearch:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/kb.ts:kbPublish:function" type="function" identity="kbPublish" parent="~/.framework/functions/_shared/kb.ts"]
// CIL[DOC-MACRO purpose="Publish a KB record through admin-data and immediately ingest it for vector search"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements kbPublish"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="kb" related_files=".framework/functions/_shared/kb.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext, body with id: string" outputs="{ record, ingest }" errors="id is required; admin-data validation/permission errors" side_effects="PATCHes items.status to 'published' via admin-data; writes/revokes embeddings via kbIngest"]
// CIL[DOC-MICRO logic_summary="Builds a synthetic PATCH context targeting items/:id, flips status to published through admin-data so permissions/audit/triggers run, then calls kbIngest to embed the published record" notable_decisions="Publish goes through admin-data rather than adminDb so field-level permissions and triggers apply"]
// CIL[DOC-STABILITY stability="stable"]
export async function kbPublish(ctx: CoreContext, body: { id: string }) {
  const { id } = body
  if (!id) throw new Error('id is required')
  const updateCtx = { ...ctx, query: { ...ctx.query, entity: 'items', id, method: 'PATCH' } }
  const record = await adminUpdate(updateCtx as any, { status: 'published' })
  const ingest = await kbIngest(ctx, { id })
  return { record, ingest }
}
// CIL[END stable_id="~/.framework/functions/_shared/kb.ts:kbPublish:function"]

