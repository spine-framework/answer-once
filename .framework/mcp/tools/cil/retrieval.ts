/**
 * @module   retrieval
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * This module handles retrieval operations for the MCP framework, facilitating various search functionalities such as content, semantic, and title searches. It integrates with the admin database to fetch and normalize identifiers, ensuring consistent search results. INVARIANT: The module expects valid search queries to function correctly.
 *
 * @seeAlso search-core.js (provides core search functionalities).
 * @seeAlso ../../shared/db.js (accesses the admin database).
 *
 * @cil-generated
 */

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/retrieval.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/cil/retrieval.ts"]
// CIL[DOC-MACRO purpose="MCP retrieval tools and test registration for chunk search and example lookup"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose MCP tools that run retrieval tests and find code examples by querying search-core"]
// CIL[DOC-CONTEXT module="retrieval" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-CONTRACT inputs="McpServer instance; search query and optional project_id" outputs="Registered MCP tools and JSON result summaries" errors="Invalid query parameters or database failures propagate as tool errors" side_effects="Registers tools on the provided McpServer; performs database reads"]
// CIL[DOC-MICRO logic_summary="Implements mergeResults, matchesExpectations, and register to wire up retrieval and example tools" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import {
  contentSearch,
  semanticSearch,
  titleSearch,
  normalizeIdentifier,
  buildSearchResult,
  SearchResult,
} from './search-core.js'
import { adminDb } from '../../shared/db.js'
// CIL[DOC-VECTOR type="context" content="purpose='MCP retrieval tools and test registration for chunk search and example lookup'; No verified external callers; imports: .framework/mcp/tools/cil/search-core.ts,.framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/retrieval.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/retrieval.ts:mergeResults:function" type="function" identity="mergeResults" parent="~/.framework/mcp/tools/cil/retrieval.ts"]
// CIL[DOC-MACRO purpose="Merge two search result arrays, keeping the highest similarity per id and sorting descending"]
// CIL[DOC-RESPONSIBILITY responsibility="Combine results from multiple search strategies without duplicates"]
// CIL[DOC-CONTEXT module="retrieval" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/retrieval.ts,.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-CONTRACT inputs="a: SearchResult[], b: SearchResult[]" outputs="SearchResult[] sorted by similarity descending" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Index results by id, keep the highest similarity score, then return sorted values" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Merges two arrays of search results, prioritizing results with higher similarity scores. This function ensures that the most relevant results are retained from both input arrays.
 *
 * @inputSpec
 *   - a: SearchResult[] (required) — the first array of search results.
 *   - b: SearchResult[] (required) — the second array of search results.
 * @outputSpec  SearchResult[] — an array of merged search results sorted by similarity score.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
function mergeResults(a: SearchResult[], b: SearchResult[]): SearchResult[] {
  const byId = new Map<string, SearchResult>()
  for (const r of a) byId.set(r.id, r)
  for (const r of b) {
    const existing = byId.get(r.id)
    if (!existing || (r.similarity ?? 0) > (existing.similarity ?? 0)) {
      byId.set(r.id, r)
    }
  }
  return Array.from(byId.values()).sort(
    (x, y) => (y.similarity ?? 0) - (x.similarity ?? 0),
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Merge two search result arrays, keeping the highest similarity per id and sorting descending'; No verified external callers; imports: .framework/mcp/tools/cil/search-core.ts,.framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/retrieval.ts:mergeResults:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/retrieval.ts:matchesExpectations:function" type="function" identity="matchesExpectations" parent="~/.framework/mcp/tools/cil/retrieval.ts"]
// CIL[DOC-MACRO purpose="Check whether a search result matches expected chunk names and/or file path substrings"]
// CIL[DOC-RESPONSIBILITY responsibility="Filter search results against caller-provided expected values"]
// CIL[DOC-CONTEXT module="retrieval" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/retrieval.ts,.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-CONTRACT inputs="result: SearchResult, expectedChunkNames?: string[], expectedFiles?: string[]" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Case-insensitive substring match against chunk_name, macro, and file_path; missing or empty expectations pass" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Determines if a search result matches expected chunk names and file paths. This function is used to validate the relevance of search results against predefined criteria.
 *
 * @inputSpec
 *   - result: SearchResult (required) — the search result object to evaluate.
 *   - expectedChunkNames: string[] (optional) — an array of expected chunk names to match against.
 *   - expectedFiles: string[] (optional) — an array of expected file paths to match against.
 * @outputSpec  boolean — true if the search result matches the expectations, false otherwise.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
function matchesExpectations(
  result: SearchResult,
  expectedChunkNames?: string[],
  expectedFiles?: string[],
): boolean {
  const nameMatch =
    !expectedChunkNames ||
    expectedChunkNames.length === 0 ||
    expectedChunkNames.some(
      (name) =>
        result.chunk_name.toLowerCase().includes(name.toLowerCase()) ||
        result.macro.toLowerCase().includes(name.toLowerCase()),
    )
  const fileMatch =
    !expectedFiles ||
    expectedFiles.length === 0 ||
    expectedFiles.some((f) =>
      result.file_path.toLowerCase().includes(f.toLowerCase()),
    )
  return nameMatch && fileMatch
}
// CIL[DOC-VECTOR type="context" content="purpose='Check whether a search result matches expected chunk names and/or file path substrings'; No verified external callers; imports: .framework/mcp/tools/cil/search-core.ts,.framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/retrieval.ts:matchesExpectations:function"]

/**
 * Registers tools for running retrieval tests against CIL chunks and finding code examples. This function facilitates the evaluation of search results based on specified queries and expected outcomes.
 *
 * @macro       Tool registration function for search retrieval and example finding.
 * @micro       Utilizes various search strategies (text, semantic, hybrid) to evaluate and return results based on test cases.
 * @inputSpec
 *   server: McpServer (required) — the server instance to register tools with.
 * @outputSpec  Promise<{ content: Array<{ type: 'text', text: string }> }> — returns a structured summary of test results.
 * @sideEffects registers tools with the server instance.
 * @stability   stable
 * @calls       titleSearch, semanticSearch, contentSearch, mergeResults, matchesExpectations
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/retrieval.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/cil/retrieval.ts"]
// CIL[DOC-MACRO purpose="Register MCP tools for retrieval testing and code example lookup"]
// CIL[DOC-RESPONSIBILITY responsibility="Bind spine_cil_test_retrieval, spine_cil_find_examples, and spine_cil_find_pattern tools to the McpServer"]
// CIL[DOC-CONTEXT module="retrieval" layer="app-specific" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/retrieval.ts,.framework/mcp/tools/cil/search-core.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="Promise<{ content: Array<{ type: 'text', text: string }> }> from tool handlers" errors="Invalid inputs from zod schema or database errors" side_effects="Registers three tools on the McpServer; reads from adminDb and search-core"]
// CIL[DOC-MICRO logic_summary="Defines three tool handlers: test retrieval, find examples, and find pattern; each queries search-core or adminDb and returns structured JSON" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function register(server: McpServer) {
  server.registerTool(
    'spine_cil_test_retrieval',
    {
      description: 'Run a retrieval test suite against CIL chunks. Each test runs the same search pipeline as spine_cil_search_chunks and checks whether expected chunk names/files appear in the top results.',
      inputSchema: z.object({
        project_id: z.string().optional().describe('Limit to a project UUID'),
        limit: z.number().int().min(1).max(50).default(10).optional().describe('Max results to evaluate per query'),
        tests: z.array(
          z.object({
            q: z.string().describe('Search query'),
            expected_chunk_names: z.array(z.string()).optional().describe('One or more chunk_name/macro substrings that should appear in results'),
            expected_files: z.array(z.string()).optional().describe('One or more file_path substrings that should appear in results'),
            mode: z.enum(['hybrid', 'semantic', 'text']).default('hybrid').optional(),
          }),
        ).describe('List of retrieval test cases'),
      }),
    },
    async ({ project_id, limit, tests }) => {
      const results: any[] = []
      let passed = 0
      let failed = 0

      for (const test of tests) {
        let searchResults: SearchResult[] = []
        if (test.mode === 'text') {
          searchResults = await titleSearch({ q: test.q, project_id, limit })
        } else if (test.mode === 'semantic') {
          searchResults = await semanticSearch({ q: test.q, project_id, limit })
        } else {
          const [content, semantic] = await Promise.all([
            contentSearch({ q: test.q, project_id, limit }),
            semanticSearch({ q: test.q, project_id, limit }),
          ])
          searchResults = mergeResults(content, semantic).slice(0, limit ?? 10)
        }

        const top = searchResults.slice(0, 3)
        const ok = searchResults.some((r) =>
          matchesExpectations(r, test.expected_chunk_names, test.expected_files),
        )

        if (ok) passed++
        else failed++

        results.push({
          q: test.q,
          mode: test.mode ?? 'hybrid',
          ok,
          top_results: top.map((r) => ({
            chunk_name: r.chunk_name,
            file_path: r.file_path,
            macro: r.macro,
            match_type: r.match_type,
            similarity: r.similarity,
          })),
        })
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            project_id: project_id || null,
            limit: limit ?? 10,
            summary: { total: tests.length, passed, failed },
            results,
          }, null, 2),
        }],
      }
    },
  )

  server.registerTool(
    'spine_cil_find_examples',
    {
      description: 'Find code examples matching a query. Searches chunk code_content and returns the most relevant full code snippets.',
      inputSchema: z.object({
        q: z.string().describe('Describe the API, function, or pattern you want examples of'),
        project_id: z.string().optional().describe('Limit to a project UUID'),
        limit: z.number().int().min(1).max(20).default(5).optional().describe('Max examples to return'),
      }),
    },
    async ({ q, project_id, limit }) => {
      const results = await contentSearch({ q, project_id, limit })
      const examples = results
        .filter((r) => r.code_content.trim().length > 0)
        .map((r) => ({
          chunk_name: r.chunk_name,
          file_path: r.file_path,
          chunk_type: r.chunk_type,
          macro: r.macro,
          code_content: r.code_content,
          match_type: r.match_type,
          similarity: r.similarity,
        }))
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ query: q, count: examples.length, examples }, null, 2),
        }],
      }
    },
  )

  server.registerTool(
    'spine_cil_find_pattern',
    {
      description: 'Find chunks that reference a pattern, convention, or topic. Searches chunk tags, macro, micro, and code_content for the term.',
      inputSchema: z.object({
        q: z.string().describe('Pattern or topic, e.g. "design_schema", "error handling", "zod schema"'),
        project_id: z.string().optional().describe('Limit to a project UUID'),
        limit: z.number().int().min(1).max(50).default(10).optional().describe('Max results to return'),
      }),
    },
    async ({ q, project_id, limit }) => {
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
      const phrase = q.toLowerCase()
      const normPhrase = normalizeIdentifier(phrase)

      const scored = (allChunks || [])
        .map((c: any) => {
          const d = c.data || {}
          const haystacks = [
            { text: (c.title || '').toLowerCase(), weight: 3 },
            { text: (d.macro || '').toLowerCase(), weight: 3 },
            { text: (d.micro || '').toLowerCase(), weight: 2 },
            { text: (d.tags || '').toLowerCase(), weight: 2 },
            { text: (d.vector_content ? JSON.stringify(d.vector_content) : '').toLowerCase(), weight: 1 },
            { text: (d.code_content || '').toLowerCase(), weight: 1 },
          ]
          let score = 0
          for (const { text, weight } of haystacks) {
            if (text.includes(phrase)) score += weight * 2
            if (normalizeIdentifier(text).includes(normPhrase)) score += weight
          }
          return { chunk: c, score }
        })
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit ?? 10)

      const maxScore = scored[0]?.score || 1
      const results = scored.map(({ chunk, score }) => {
        const r = buildSearchResult(chunk, 'content', score / maxScore)
        return {
          id: r.id,
          chunk_name: r.chunk_name,
          file_path: r.file_path,
          chunk_type: r.chunk_type,
          macro: r.macro,
          micro: r.micro,
          tags: r.tags,
          code_content: r.code_content,
          similarity: r.similarity,
        }
      })

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ query: q, count: results.length, results }, null, 2),
        }],
      }
    },
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Register MCP tools for retrieval testing and code example lookup'; No verified external callers; imports: .framework/mcp/tools/cil/search-core.ts,.framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/retrieval.ts:register:function"]
