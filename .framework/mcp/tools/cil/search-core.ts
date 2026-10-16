/**
 * @module   search-core
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module provides core search functionalities for the application, leveraging the admin database for data retrieval and manipulation. It serves as a critical component in the overall architecture, facilitating efficient search operations across various datasets. INVARIANT: The module assumes that the database is always accessible and properly configured for search queries.
 *
 * @seeAlso db.js (provides the database connection and operations needed for search functionality.)
 * @seeAlso shared.js (contains shared utilities that may be used across different modules.)
 *
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/search-core.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-MACRO purpose="Provides core search operations over the CIL chunk index"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose title, content, semantic and hybrid search utilities for CIL chunks"]
// CIL[DOC-CONTEXT module=".framework/mcp/tools/cil" layer="shared-core" related_files=".framework/mcp/shared/db.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="Database and network failures propagate to caller" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Imports adminDb and exports normalizeIdentifier, buildSearchResult, titleSearch, contentSearch, embedQuery, semanticSearch and hybridSearch" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="both"]
import { adminDb } from '../../shared/db.js'
// CIL[DOC-VECTOR type="context" content="purpose='Provides core search operations over the CIL chunk index'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/search-core.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/search-core.ts:normalizeIdentifier:function" type="function" identity="normalizeIdentifier" parent="~/.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-MACRO purpose="Normalize a string identifier to lowercase alphanumeric"]
// CIL[DOC-RESPONSIBILITY responsibility="Sanitize raw strings for consistent identifier comparison"]
// CIL[DOC-CONTEXT module=".framework/mcp/tools/cil" layer="shared-core" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-CONTRACT inputs="s: string" outputs="string" errors="N/A" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Converts input to lowercase and removes all non-alphanumeric characters" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
/**
 * Normalizes a string identifier by converting it to lowercase and removing all non-alphanumeric characters. This function ensures that identifiers are consistent and suitable for further processing.
 *
 * @inputSpec
 *   s: string (required) — the string identifier to normalize.
 * @outputSpec  string — the normalized identifier consisting only of lowercase alphanumeric characters.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
export const normalizeIdentifier = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]/g, '')
// CIL[DOC-VECTOR type="context" content="purpose='Normalize a string identifier to lowercase alphanumeric'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/search-core.ts:normalizeIdentifier:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/search-core.ts:SearchResult:interface" type="interface" identity="SearchResult" parent="~/.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-MACRO purpose="Defines the typed shape of a CIL search result"]
// CIL[DOC-RESPONSIBILITY responsibility="Standardize chunk metadata, scoring and content fields returned by search APIs"]
// CIL[DOC-CONTEXT module=".framework/mcp/tools/cil" layer="shared-core" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Declares fields including stable_id, macro, micro, code_content, match_type and similarity" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
/**
 * The SearchResult interface defines the structure of a search result object, encapsulating various attributes related to search outcomes. It exists to standardize the representation of search results across the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
export interface SearchResult {
  id: string
  stable_id: string
  version_id: string | null
  chunk_name: string
  file_path: string
  chunk_type: string
  source_set_id: string | null
  layer: string | null
  macro: string
  micro: string
  input_spec: string
  output_spec: string
  side_effects: string
  stability: string
  tags: string
  complexity: string
  doc_confidence: string
  validation_errors: string[]
  code_content: string
  similarity: number | null
  match_type: 'content' | 'semantic' | 'text'
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the typed shape of a CIL search result'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/search-core.ts:SearchResult:interface"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/search-core.ts:buildSearchResult:function" type="function" identity="buildSearchResult" parent="~/.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-MACRO purpose="Construct a SearchResult object from a raw chunk row"]
// CIL[DOC-RESPONSIBILITY responsibility="Map database chunk fields into a typed search result with sensible defaults"]
// CIL[DOC-CONTEXT module=".framework/mcp/tools/cil" layer="shared-core" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-CONTRACT inputs="chunk: any, match_type: SearchResult['match_type'], similarity: number | null (optional)" outputs="SearchResult" errors="N/A" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Extracts chunk.data, applies defaults for missing metadata, and assembles the SearchResult" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
/**
 * Builds a structured search result object from a given chunk of data, encapsulating various attributes for search functionality. This function is essential for transforming raw data into a standardized format for search results.
 *
 * @macro       Function that constructs a search result object from a data chunk.
 * @micro       Extracts properties from the chunk and assigns default values where necessary.
 * @inputSpec
 *   - chunk: any (required) — the data chunk containing search-related information.
 *   - match_type: SearchResult['match_type'] (required) — the type of match for the search result.
 *   - similarity: number | null (optional[nullable]) — a similarity score associated with the search result.
 * @outputSpec  SearchResult — an object containing structured search result data.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
export function buildSearchResult(
  chunk: any,
  match_type: SearchResult['match_type'],
  similarity: number | null = null,
): SearchResult {
  const d = chunk.data || {}
  return {
    id: chunk.id,
    stable_id: d.stable_id || '',
    version_id: d.version_id || null,
    chunk_name: d.chunk_name || '',
    file_path: d.file_path || '',
    chunk_type: d.chunk_type || '',
    source_set_id: d.source_set_id || null,
    layer: d.layer || null,
    macro: d.macro || '',
    micro: d.micro || '',
    input_spec: d.input_spec || '',
    output_spec: d.output_spec || '',
    side_effects: d.side_effects || '',
    stability: d.stability || 'unknown',
    tags: d.tags || '',
    complexity: d.complexity || '',
    doc_confidence: d.doc_confidence || 'unverified_legacy',
    validation_errors: d.doc_validation_errors || [],
    code_content: d.code_content || '',
    similarity,
    match_type,
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Construct a SearchResult object from a raw chunk row'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/search-core.ts:buildSearchResult:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/search-core.ts:titleSearch:function" type="function" identity="titleSearch" parent="~/.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-MACRO purpose="Case-insensitive title substring search over CIL chunks"]
// CIL[DOC-RESPONSIBILITY responsibility="Return chunks whose title contains the query"]
// CIL[DOC-CONTEXT module=".framework/mcp/tools/cil" layer="shared-core" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-CONTRACT inputs="q: string, project_id?: string, limit?: number" outputs="Promise<SearchResult[]>" errors="Database errors propagate" side_effects="Queries the items table"]
// CIL[DOC-MICRO logic_summary="Builds a Supabase query for active cil_chunks, optionally filters by project_id and maps rows to SearchResult" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
export async function titleSearch({
  q,
  project_id,
  limit = 10,
}: {
  q: string
  project_id?: string
  limit?: number
}): Promise<SearchResult[]> {
  let qb = adminDb
    .from('items')
    .select('id, title, data')
    .filter('data->>kb_type', 'eq', 'cil_chunk')
    .eq('is_active', true)
    .ilike('title', `%${q}%`)
    .limit(limit)
  if (project_id) qb = (qb as any).filter('data->>project_id', 'eq', project_id)

  const { data } = await qb
  return (data || []).map((c: any) => buildSearchResult(c, 'text', null))
}
// CIL[DOC-VECTOR type="context" content="purpose='Case-insensitive title substring search over CIL chunks'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/search-core.ts:titleSearch:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/search-core.ts:contentSearch:function" type="function" identity="contentSearch" parent="~/.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-MACRO purpose="Score CIL chunks by keyword presence across metadata and code"]
// CIL[DOC-RESPONSIBILITY responsibility="Find the most relevant chunks for a free-text query using term scoring"]
// CIL[DOC-CONTEXT module=".framework/mcp/tools/cil" layer="shared-core" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-CONTRACT inputs="q: string, project_id?: string, limit?: number" outputs="Promise<SearchResult[]>" errors="N/A" side_effects="Queries the items table; may call titleSearch as fallback"]
// CIL[DOC-MICRO logic_summary="Fetches active chunks, scores matches in title, macro, micro, tags and code, boosts exact phrases, returns top results or titleSearch fallback" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
export async function contentSearch({
  q,
  project_id,
  limit = 10,
}: {
  q: string
  project_id?: string
  limit?: number
}): Promise<SearchResult[]> {
  const pageLimit = 5000
  let qb = adminDb
    .from('items')
    .select('id, title, data')
    .filter('data->>kb_type', 'eq', 'cil_chunk')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(pageLimit)
  if (project_id) qb = (qb as any).filter('data->>project_id', 'eq', project_id)

  const { data: allChunks } = await qb

  const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
  const normalizedTerms = terms
    .map((t) => normalizeIdentifier(t))
    .filter((t) => t.length >= 2)

  if (normalizedTerms.length === 0) return titleSearch({ q, project_id, limit })

  const scored = (allChunks || [])
    .map((c: any) => {
      const title = (c.title || '').toLowerCase()
      const macro = (c.data?.macro || '').toLowerCase()
      const micro = (c.data?.micro || '').toLowerCase()
      const tags = (c.data?.tags || '').toLowerCase()
      const codeContent = (c.data?.code_content || '').toLowerCase()

      const normTitle = normalizeIdentifier(title)
      const normMacro = normalizeIdentifier(macro)
      const normMicro = normalizeIdentifier(micro)
      const normTags = normalizeIdentifier(tags)
      const normCode = normalizeIdentifier(codeContent)

      let score = 0
      for (const term of normalizedTerms) {
        if (normTitle.includes(term)) score += 3
        if (normMacro.includes(term)) score += 2
        if (normMicro.includes(term)) score += 1
        if (normTags.includes(term)) score += 1
        if (normCode.includes(term)) {
          const count = normCode.split(term).length - 1
          score += Math.min(count, 3)
        }
      }

      const phrase = q.toLowerCase()
      const normPhrase = normalizeIdentifier(phrase)
      if (codeContent.includes(phrase) || normCode.includes(normPhrase)) score += 5

      return { chunk: c, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  if (scored.length === 0) return titleSearch({ q, project_id, limit })

  const maxScore = scored[0].score || 1
  return scored.map(({ chunk, score }) =>
    buildSearchResult(chunk, 'content', score / maxScore),
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Score CIL chunks by keyword presence across metadata and code'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/search-core.ts:contentSearch:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/search-core.ts:embedQuery:function" type="function" identity="embedQuery" parent="~/.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-MACRO purpose="Fetch an OpenAI embedding vector for a query string"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert a search query into a JSON array vector string for semantic search"]
// CIL[DOC-CONTEXT module=".framework/mcp/tools/cil" layer="shared-core" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-CONTRACT inputs="q: string" outputs="Promise<string | null>" errors="Returns null on any API or parsing failure" side_effects="POST to the OpenAI embeddings endpoint"]
// CIL[DOC-MICRO logic_summary="Sends the query to the embeddings endpoint and serializes the returned vector as a JSON array string" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
/**
 * The embedQuery function sends a query string to an external API to retrieve its embedding vector. It exists to facilitate the integration of OpenAI's embedding capabilities into the application.
 *
 * @macro       Async function that retrieves text embeddings from an external API.
 * @micro       Constructs a POST request to the embeddings endpoint with the query string as input.
 * @inputSpec
 *   - q: string (required) — the query string to be embedded.
 * @outputSpec  Promise<string | null> — returns the embedding vector as a string in JSON array format or null if an error occurs.
 * @sideEffects makes an external API call to OpenAI's embeddings endpoint
 * @stability   internal
 * @calls       fetch
 * @errorHandling returns null on any error during the API call or response processing
 * @cil-generated
 */
async function embedQuery(q: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  if (!apiKey) return null
  try {
    const res = await fetch(`${baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: [q] }),
    })
    if (!res.ok) return null
    const j: any = await res.json()
    const vec = j.data?.[0]?.embedding
    if (!Array.isArray(vec)) return null
    return `[${vec.join(',')}]`
  } catch {
    return null
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Fetch an OpenAI embedding vector for a query string'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/search-core.ts:embedQuery:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/search-core.ts:semanticSearch:function" type="function" identity="semanticSearch" parent="~/.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-MACRO purpose="Semantic search over CIL chunks using vector similarity"]
// CIL[DOC-RESPONSIBILITY responsibility="Return chunks semantically similar to the query using the match_embeddings RPC"]
// CIL[DOC-CONTEXT module=".framework/mcp/tools/cil" layer="shared-core" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-CONTRACT inputs="q: string, project_id?: string, limit?: number" outputs="Promise<SearchResult[]>" errors="Returns empty array on RPC failure or missing data" side_effects="Calls embedQuery and adminDb RPC"]
// CIL[DOC-MICRO logic_summary="Embeds the query, calls match_embeddings, fetches chunk records by id and maps results" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
export async function semanticSearch({
  q,
  project_id,
  limit = 10,
}: {
  q: string
  project_id?: string
  limit?: number
}): Promise<SearchResult[]> {
  const vector = await embedQuery(q)
  if (!vector) return []

  const matchCount = limit * 3
  let rpcResult: { data: any; error: any } | null = null
  try {
    rpcResult = await adminDb.rpc('match_embeddings', {
      query_embedding: vector,
      match_count: matchCount,
      filter_account_ids: null,
      filter_vector_type: null,
      similarity_threshold: 0.15,
      filter_item_types: ['cil_chunk'],
    })
  } catch (err: any) {
    console.error('match_embeddings rpc failed:', err?.message || String(err))
    return []
  }

  const { data, error } = rpcResult || { data: null, error: 'rpc call failed' }
  if (error || !data || !data.length) return []

  const docIds = data.map((d: any) => d.document_id)
  let chunkQb = adminDb
    .from('items')
    .select('id, title, data')
    .filter('data->>kb_type', 'eq', 'cil_chunk')
    .eq('is_active', true)
    .in('data->>stable_id', docIds)
  if (project_id)
    chunkQb = (chunkQb as any).filter('data->>project_id', 'eq', project_id)

  const { data: chunks } = await chunkQb
  const chunkMap = new Map((chunks || []).map((c: any) => [c.data?.stable_id, c]))

  return (data as any[])
    .map((d: any) => {
      const c = chunkMap.get(d.document_id)
      if (!c) return null
      return buildSearchResult(c, 'semantic', d.similarity)
    })
    .filter(Boolean)
    .slice(0, limit) as SearchResult[]
}
// CIL[DOC-VECTOR type="context" content="purpose='Semantic search over CIL chunks using vector similarity'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/search-core.ts:semanticSearch:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/search-core.ts:hybridSearch:function" type="function" identity="hybridSearch" parent="~/.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-MACRO purpose="Combine content and semantic search results into a single ranked list"]
// CIL[DOC-RESPONSIBILITY responsibility="Merge and rank content-based and vector-based search results"]
// CIL[DOC-CONTEXT module=".framework/mcp/tools/cil" layer="shared-core" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-CONTRACT inputs="q: string, project_id?: string, limit?: number" outputs="Promise<SearchResult[]>" errors="N/A" side_effects="Calls contentSearch and semanticSearch"]
// CIL[DOC-MICRO logic_summary="Runs both search strategies in parallel, merges results by id, sorts by similarity and slices to limit" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="internal"]
export async function hybridSearch({
  q,
  project_id,
  limit = 10,
}: {
  q: string
  project_id?: string
  limit?: number
}): Promise<SearchResult[]> {
  const [content, semantic] = await Promise.all([
    contentSearch({ q, project_id, limit }),
    semanticSearch({ q, project_id, limit }),
  ])

  const byId = new Map<string, SearchResult>()
  for (const r of content) {
    byId.set(r.id, r)
  }
  for (const r of semantic) {
    const existing = byId.get(r.id)
    if (!existing || (r.similarity ?? 0) > (existing.similarity ?? 0)) {
      byId.set(r.id, r)
    }
  }

  return Array.from(byId.values())
    .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
    .slice(0, limit)
}
// CIL[DOC-VECTOR type="context" content="purpose='Combine content and semantic search results into a single ranked list'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/search-core.ts:hybridSearch:function"]
