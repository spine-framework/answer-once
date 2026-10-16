// CIL[BEGIN stable_id="~/.framework/functions/cil-agent.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/cil-agent.ts"]
// CIL[DOC-MACRO purpose="CIL agent Netlify function: answer codebase questions using tool-augmented retrieval."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide ask, chat, tool, and tools endpoints for CIL-powered codebase Q&A."]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-CONTRACT inputs="HTTP request context and JSON body" outputs="JSON answer with sources and tool calls" errors="Authentication, missing question, unknown action, LLM or database errors" side_effects="Reads chunk index and writes thread messages for chat"]
// CIL[DOC-MICRO logic_summary="Imports shared helpers and exports a single createHandler-wrapped endpoint that dispatches actions." notable_decisions="Uses environment URL as base for internal CIL API calls; action defaults to ask."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]




import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { resolveTypeId } from './_shared/resolve-ids'
import { create as adminCreate } from './admin-data'
import { callOpenAIChat } from './_shared/llm'
import { handler as cilGraphHandler } from './cil-graph'
import { SYSTEM_PRINCIPAL } from './_shared/principal'
// CIL[DOC-VECTOR type="context" content="purpose='CIL agent Netlify function: answer codebase questions using tool-augmented retrieval.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent.ts:module_header:module_header"]








// CIL[BEGIN stable_id="~/.framework/functions/cil-agent.ts:CIL_TOOLS:constant" type="constant" identity="CIL_TOOLS" parent="~/.framework/functions/cil-agent.ts"]
// CIL[DOC-MACRO purpose="Define the JSON function schemas exposed to the LLM for CIL tool use."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide tool descriptions and parameters for chunk lookup, contract retrieval, blast radius, hash validation, gap report, and project status."]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="any" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Static array of function definitions with names, descriptions, and parameter schemas." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const CIL_TOOLS = [
  {
    name: 'chunk_lookup',
    description: 'Search for a chunk by name or purpose. Returns chunk_name, file_path, macro, micro, input_spec, output_spec, side_effects, stability.',
    parameters: {
      type: 'object',
      properties: {
        q: { type: 'string', description: 'Chunk name or description of what you are looking for' },
        project_id: { type: 'string', description: 'Optional: scope to a specific project UUID' },
      },
      required: ['q'],
    },
  },
  {
    name: 'get_contract',
    description: 'Get the full contract for a specific chunk by its ID.',
    parameters: {
      type: 'object',
      properties: {
        chunk_id: { type: 'string', description: 'UUID of the cil_chunk item' },
      },
      required: ['chunk_id'],
    },
  },
  {
    name: 'blast_radius',
    description: 'Find all chunks that call a given chunk (BFS caller traversal). Use before refactoring.',
    parameters: {
      type: 'object',
      properties: {
        chunk_id: { type: 'string', description: 'UUID of the chunk to check callers for' },
        max_depth: { type: 'number', description: 'Maximum traversal depth (default 3)' },
      },
      required: ['chunk_id'],
    },
  },
  {
    name: 'hash_validate',
    description: 'Check whether a chunk\'s stored hash is current or has drifted (code was changed without updating CIL).',
    parameters: {
      type: 'object',
      properties: {
        chunk_id: { type: 'string', description: 'UUID of the chunk to validate' },
      },
      required: ['chunk_id'],
    },
  },
  {
    name: 'doc_gap_report',
    description: 'List undocumented chunks in a project and overall documentation coverage.',
    parameters: {
      type: 'object',
      properties: {
        project_id: { type: 'string', description: 'UUID of the cil_project' },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'project_status',
    description: 'Get the full pipeline status for a project: file count, chunk count, embedding coverage, doc coverage, link counts.',
    parameters: {
      type: 'object',
      properties: {
        project_id: { type: 'string', description: 'UUID of the cil_project' },
      },
      required: ['project_id'],
    },
  },
]
// CIL[DOC-VECTOR type="context" content="purpose='Define the JSON function schemas exposed to the LLM for CIL tool use.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent.ts:CIL_TOOLS:constant"]







// CIL[BEGIN stable_id="~/.framework/functions/cil-agent.ts:runcilgraphaction:function" type="function" identity="runCilGraphAction" parent="~/.framework/functions/cil-agent.ts"]
// CIL[DOC-MACRO purpose="Dispatch a cil-graph action internally as the system principal."]
// CIL[DOC-RESPONSIBILITY responsibility="Build a synthetic handler event and call the cil-graph handler so CIL agent tools can reuse the v2 graph/search logic."]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/cil-graph.ts,.framework/functions/_shared/principal.ts,.framework/functions/cil-agent.ts"]
// CIL[DOC-CONTRACT inputs="query: Record<string, string | undefined>" outputs="Promise<any> (raw cil-graph action result)" errors="Propagates cil-graph handler exceptions" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Construct an event with SYSTEM_PRINCIPAL and the requested query, then invoke the cil-graph handler." notable_decisions="Uses a synthetic requestId to satisfy createHandler internal-invoke bypass."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function runCilGraphAction(query: Record<string, string | undefined>): Promise<any> {
  const event = {
    requestId: 'internal-cil-agent',
    principal: SYSTEM_PRINCIPAL,
    db: adminDb,
    query: Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined)) as Record<string, string>,
    httpMethod: 'GET',
    headers: {},
    path: '/.netlify/functions/cil-graph',
    body: null,
  } as any
  return cilGraphHandler(event, {})
}
// CIL[DOC-VECTOR type="context" content="purpose='Dispatch a cil-graph action internally as the system principal.'; No verified external callers; imports: .framework/functions/cil-graph.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="Local impact only; used by dispatchTool and retrieveChunkContext"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent.ts:runcilgraphaction:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-agent.ts:dispatchTool:function" type="function" identity="dispatchTool" parent="~/.framework/functions/cil-agent.ts"]
// CIL[DOC-MACRO purpose="Execute a named CIL tool by making local API calls or database queries."]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve the requested tool to the corresponding CIL endpoint or database operation and return the result."]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent.ts"]
// CIL[DOC-CONTRACT inputs="toolName: string, args: Record<string, any>, accountId: string" outputs="Tool-specific JSON result" errors="Unknown tool, network or database errors" side_effects="Queries internal CIL endpoints and the items table"]
// CIL[DOC-MICRO logic_summary="Switch on toolName and dispatch cil-graph actions through runCilGraphAction; use direct adminDb or fetch for remaining tools." notable_decisions="Avoids unauthenticated internal fetch by calling the cil-graph handler with a system principal."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function dispatchTool(
  toolName: string,
  args: Record<string, any>,
  accountId: string
): Promise<any> {
  const base = process.env.URL || 'http://localhost:8888'

  switch (toolName) {
    case 'chunk_lookup': {
      const q: Record<string, string | undefined> = {
        action: 'search',
        q: args.q,
        mode: 'hybrid',
        limit: '5',
      }
      if (args.project_id) q.project_id = args.project_id
      if (args.version_id) q.version_id = args.version_id
      const res: any = await runCilGraphAction(q)
      return { results: res?.results || [] }
    }

    case 'get_contract': {
      const q: Record<string, string | undefined> = {
        action: 'get_chunk_contract',
        chunk_id: args.chunk_id,
        stable_id: args.stable_id,
      }
      if (args.version_id) q.version_id = args.version_id
      const res: any = await runCilGraphAction(q)
      return res?.contract || {}
    }

    case 'blast_radius': {
      const depth = String(args.max_depth || 3)
      const q: Record<string, string | undefined> = {
        action: 'get_blast_radius',
        chunk_id: args.chunk_id,
        max_depth: depth,
      }
      if (args.version_id) q.version_id = args.version_id
      const res: any = await runCilGraphAction(q)
      return { affected: res?.affected || [], depth: args.max_depth || 3 }
    }

    case 'hash_validate': {
      
      const { data: chunk } = await adminDb
        .from('items').select('id, data').eq('id', args.chunk_id).maybeSingle()
      if (!chunk) return { status: 'not_found', chunk_id: args.chunk_id }

      const codeContent = chunk.data?.code_content || ''
      if (!codeContent) return { status: 'no_code_content', chunk_id: args.chunk_id }

      const res = await fetch(`${base}/.netlify/functions/cil-validate?action=validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chunks: [{ chunk_id: args.chunk_id, chunk_name: chunk.data?.chunk_name || '', content: codeContent }],
        }),
      })
      const data: any = await res.json()
      const result = (data?.results || data?.data?.results)?.[0]
      return result || { status: 'unknown', chunk_id: args.chunk_id }
    }

    case 'doc_gap_report': {
      const res = await fetch(`${base}/.netlify/functions/cil-doc?action=gap_report&project_id=${args.project_id}`)
      const data: any = await res.json()
      return data?.data || data
    }

    case 'project_status': {
      const pid = args.project_id
      const [projectRes, embedRes, callmapRes] = await Promise.allSettled([
        fetch(`${base}/.netlify/functions/cil-project?action=get&id=${pid}`).then(r => r.json()),
        fetch(`${base}/.netlify/functions/cil-embeddings?action=status&project_id=${pid}`).then(r => r.json()),
        fetch(`${base}/.netlify/functions/cil-callmap?action=status&project_id=${pid}`).then(r => r.json()),
      ])

      const project = projectRes.status === 'fulfilled' ? (projectRes.value?.project || projectRes.value?.data?.project) : null
      const embed   = embedRes.status === 'fulfilled'   ? (embedRes.value?.data  || embedRes.value)  : null
      const callmap = callmapRes.status === 'fulfilled' ? (callmapRes.value?.data || callmapRes.value) : null

      return {
        project_id: pid,
        file_count: project?.data?.file_count || 0,
        chunk_count: project?.data?.chunk_count || 0,
        embedding_coverage_pct: embed?.coverage_pct || 0,
        embedded_chunks: embed?.embedded_chunks || 0,
        import_links: callmap?.import_links || 0,
        call_links: callmap?.call_links || 0,
        total_ingestion_cost_usd: project?.data?.total_ingestion_cost_usd || 0,
        last_ingested_at: project?.data?.last_ingested_at || null,
      }
    }

    default:
      return { error: `Unknown tool: ${toolName}` }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Execute a named CIL tool by making local API calls or database queries.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent.ts:dispatchTool:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-agent.ts:callLLM:function" type="function" identity="callLLM" parent="~/.framework/functions/cil-agent.ts"]
// CIL[DOC-MACRO purpose="Call the OpenAI chat completion endpoint with optional tool definitions."]
// CIL[DOC-RESPONSIBILITY responsibility="Format messages and tools and return the assistant content and any tool calls."]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent.ts"]
// CIL[DOC-CONTRACT inputs="messages, tools, model" outputs="{ content: string, tool_calls?: any[] }" errors="LLM API errors" side_effects="Calls OpenAI chat API"]
// CIL[DOC-MICRO logic_summary="Build options, map tools to OpenAI function format, call chat, and extract choice." notable_decisions="Sets temperature 0.2 and max_tokens 1500; defaults tool_calls to undefined."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function callLLM(
  messages: { role: string; content: string }[],
  tools: any[],
  model: string
): Promise<{ content: string; tool_calls?: any[] }> {
  const options: any = { temperature: 0.2, max_tokens: 1500 }
  if (tools.length > 0) {
    options.tools = tools.map(t => ({ type: 'function', function: t }))
    options.tool_choice = 'auto'
  }
  const j = await callOpenAIChat(undefined, messages, model, options)
  const choice = j.choices?.[0]

  return {
    content: choice?.message?.content || '',
    tool_calls: choice?.message?.tool_calls || undefined,
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Call the OpenAI chat completion endpoint with optional tool definitions.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent.ts:callLLM:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-agent.ts:retrieveChunkContext:function" type="function" identity="retrieveChunkContext" parent="~/.framework/functions/cil-agent.ts"]
// CIL[DOC-MACRO purpose="Retrieve relevant chunk contracts to ground CIL agent answers using v2 graph/search."]
// CIL[DOC-RESPONSIBILITY responsibility="Call cil-graph hybrid search and format matching chunk contracts into a context string."]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/cil-graph.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent.ts"]
// CIL[DOC-CONTRACT inputs="query: string, projectId: string | null, accountId: string" outputs="Formatted context string of chunk contracts or empty string" errors="Graph search or formatting failures are caught and return an empty string" side_effects="Calls the cil-graph hybrid search action"]
// CIL[DOC-MICRO logic_summary="Dispatch a cil-graph search with the user query, then format macro/micro/contract fields and similarity scores." notable_decisions="Uses runCilGraphAction to reuse the same v2 search logic as the MCP tools; falls back to empty context on any error."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function retrieveChunkContext(
  query: string,
  projectId: string | null,
  accountId: string
): Promise<string> {
  try {
    const q: Record<string, string | undefined> = {
      action: 'search',
      q: query,
      mode: 'hybrid',
      limit: '16',
    }
    if (projectId) q.project_id = projectId
    const res: any = await runCilGraphAction(q)
    const results = res?.results || []
    if (!results.length) return ''

    const contextParts: string[] = []
    for (const d of results) {
      const parts = [
        `## ${d.chunk_name || 'unknown'} (${d.chunk_type || ''}) — ${d.file_path || ''}`,
      ]
      if (d.macro)        parts.push(`Purpose: ${d.macro}`)
      if (d.micro)        parts.push(`Detail: ${d.micro}`)
      if (d.input_spec)   parts.push(`Inputs: ${d.input_spec}`)
      if (d.output_spec)  parts.push(`Returns: ${d.output_spec}`)
      if (d.side_effects) parts.push(`Side effects: ${d.side_effects}`)
      if (d.stability)    parts.push(`Stability: ${d.stability}`)
      if (d.similarity != null) {
        parts.push(`Similarity: ${(d.similarity * 100).toFixed(0)}%`)
      }
      contextParts.push(parts.join('\n'))
    }

    return contextParts.join('\n\n')
  } catch {
    return ''
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Retrieve relevant chunk contracts to ground CIL agent answers using v2 graph/search.'; No verified external callers; imports: .framework/functions/cil-graph.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent.ts:retrieveChunkContext:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-agent.ts:SYSTEM_PROMPT:constant" type="constant" identity="SYSTEM_PROMPT" parent="~/.framework/functions/cil-agent.ts"]
// CIL[DOC-MACRO purpose="System prompt that instructs the CIL assistant to synthesize prose answers from KB articles and code chunks without confabulating."]
// CIL[DOC-RESPONSIBILITY responsibility="Set the behavior and constraints for the CIL Q&A agent."]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="any" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Template string defining answer-first synthesis rules, inline [n] citation requirements, per-question-type routing, anti-confabulation constraints, call-edge caveat, and cited-only Sources format." notable_decisions="Synthesis over enumeration; [KB article]/[code chunk] labels bind to buildContext's excerpt tagging; question routing covers concept/how-to/example/where-is; explicit warning that empty blast_radius ≠ low impact for interfaces/types."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const SYSTEM_PROMPT = `You are the Spine Code Intelligence assistant. You answer questions about this codebase and the platform's architecture using retrieved evidence.

Evidence arrives as numbered excerpts [n], labeled:
- [KB article] — narrative documentation explaining concepts, mechanisms, rules, and worked examples.
- [code chunk] — implementation records: chunk_name, file_path, macro (purpose), contract fields, stability.

Rules:
- Answer the question directly in prose first. Excerpts are evidence, not the answer's structure — synthesize across them rather than enumerating them.
- Cite inline: put [n] after each claim that relies on excerpt n or on a tool result. The Sources list at the end must contain only the [n] you actually cited. Never list an excerpt you did not use.
- Route by question type:
  * Concept / "what is X": explain the mechanism from the KB — where it is stored, what is generated from it, what enforces or consumes it — then cite the implementing code chunks. Distinguish the database field or runtime record (e.g. \`design_schema\` on public.types) from the TypeScript type that merely describes it (e.g. \`DesignSchema\`).
  * How-to / configure: give the concrete checklist of rules from the KB (required keys, constraints, gotchas). Do not give generic advice such as "understand the structure, test, iterate".
  * Example / sample: if a complete example appears verbatim in an excerpt or tool result, paste it in full in a code block and cite it. If only a fragment was retrieved, call cil_fetch_document with that document_id to get the full text before answering. Never stitch fragments together and never invent JSON.
  * Where-is / which files: call cil_chunk_lookup (it searches code content) and report chunk_name + file_path grouped by role (definition, generation, runtime enforcement, UI, tests). Mark files under /archive/ or /migrations/ as historical.
- Never invent JSON, schemas, config examples, or APIs. Only present code that appears verbatim in retrieved excerpts or tool results. If the evidence is missing, say exactly what is missing (e.g. "I found the concept article but not the example article") rather than generalizing.
- blast_radius and caller tools traverse CALL edges. Interfaces, types, and constants are imported, not called — an empty blast radius does NOT mean low impact. Chunk metadata such as "no verified external callers" is a call-graph artifact, not a fact about usage; never repeat it as one.
- On follow-up questions, answer what is new; do not restate your previous answer.
- End with "Sources:" listing only the cited excerpts as \`[n] title — file path\`.`
// CIL[DOC-VECTOR type="context" content="purpose='System prompt that instructs the CIL assistant to ground answers in retrieved chunk contracts.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent.ts:SYSTEM_PROMPT:constant"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-agent.ts:runCilInference:function" type="function" identity="runCilInference" parent="~/.framework/functions/cil-agent.ts"]
// CIL[DOC-MACRO purpose="Run a tool-augmented RAG conversation: embed, call LLM, dispatch tool calls, and synthesize an answer."]
// CIL[DOC-RESPONSIBILITY responsibility="Orchestrate retrieval, LLM calls, and tool execution for a single user turn."]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent.ts"]
// CIL[DOC-CONTRACT inputs="question, projectId, history, accountId, model" outputs="{ answer, sources, tool_calls_made }" errors="LLM or tool execution errors" side_effects="Calls LLM and CIL tool endpoints; may write messages"]
// CIL[DOC-MICRO logic_summary="Retrieve context, build messages, loop up to MAX_TOOL_ITERS calling the LLM and dispatching any tool calls, then return an answer." notable_decisions="Sources extracted from RAG context by matching chunk name headings; uses spread to attach tool_calls to assistant messages."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function runCilInference(
  question: string,
  projectId: string | null,
  history: { role: string; content: string }[],
  accountId: string,
  model = 'gpt-4o-mini'
): Promise<{ answer: string; sources: string[]; tool_calls_made: string[] }> {
  
  const ragContext = await retrieveChunkContext(question, projectId, accountId)

  const messages: { role: string; content: string | any[] }[] = [
    { role: 'system', content: SYSTEM_PROMPT },
  ]

  if (ragContext) {
    messages.push({
      role: 'system',
      content: `## Retrieved Chunk Contracts (from CIL index)\n\n${ragContext}`,
    })
  }

  
  for (const msg of history) {
    messages.push(msg)
  }

  messages.push({ role: 'user', content: question })

  const toolCallsMade: string[] = []
  const MAX_TOOL_ITERS = 4

  for (let iter = 0; iter < MAX_TOOL_ITERS; iter++) {
    const response = await callLLM(messages as any, CIL_TOOLS, model)

    if (!response.tool_calls?.length) {
      
      const sources: string[] = []
      if (ragContext) {
        const nameMatches = ragContext.match(/## (\w[\w.]+)/g) || []
        sources.push(...nameMatches.map(m => m.replace('## ', '')).slice(0, 5))
      }
      return { answer: response.content, sources, tool_calls_made: toolCallsMade }
    }

    
    messages.push({ role: 'assistant', content: response.content || '', ...{ tool_calls: response.tool_calls } } as any)

    for (const tc of response.tool_calls) {
      const toolName = tc.function?.name || tc.name || ''
      const toolArgs = (() => { try { return JSON.parse(tc.function?.arguments || '{}') } catch { return {} } })()
      toolCallsMade.push(toolName)

      let result: any
      try {
        result = await dispatchTool(toolName, toolArgs, accountId)
      } catch (err) {
        result = { error: err instanceof Error ? err.message : String(err) }
      }

      messages.push({
        role: 'tool',
        content: JSON.stringify(result),
        ...({ tool_call_id: tc.id }),
      } as any)
    }
  }

  return { answer: 'I exhausted my tool call budget. Please try a more specific question.', sources: [], tool_calls_made: toolCallsMade }
}
// CIL[DOC-VECTOR type="context" content="purpose='Run a tool-augmented RAG conversation: embed, call LLM, dispatch tool calls, and synthesize an answer.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent.ts:runCilInference:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-agent.ts:getPlatformAccountId:function" type="function" identity="getPlatformAccountId" parent="~/.framework/functions/cil-agent.ts"]
// CIL[DOC-MACRO purpose="Resolve the spine-system account id for unauthenticated platform requests."]
// CIL[DOC-RESPONSIBILITY responsibility="Return the id of the account with slug 'spine-system'."]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="string account id or empty string" errors="Database errors are not caught" side_effects="Queries accounts table"]
// CIL[DOC-MICRO logic_summary="Select id from accounts where slug equals spine-system using adminDb.maybeSingle." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function getPlatformAccountId(): Promise<string> {
  const { data } = await adminDb.from('accounts').select('id').eq('slug', 'spine-system').maybeSingle()
  return data?.id || ''
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the spine-system account id for unauthenticated platform requests.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent.ts:getPlatformAccountId:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-agent.ts:ensureCilAgentConfig:function" type="function" identity="ensureCilAgentConfig" parent="~/.framework/functions/cil-agent.ts"]
// CIL[DOC-NOTE type="api_behavior" content="Bootstrap-owned rows carry metadata.managed_by='cil_agent' and are re-synced on each prepare (system_prompt, context_template, and managed metadata keys incl. retrieval_policy); unmarked rows are left untouched."]
// CIL[DOC-LEARNING topic="retrieval" content="Two item-embedding pipelines exist: embeddings.ts generate (vector_type = semantic/structure/...) and _shared/kb.ts kbIngest (vector_type = field name like 'content', item_type = type slug). retrieval_policy filters must name the values kbIngest writes, or kb articles are invisible to vector search."]
// CIL[DOC-MACRO purpose="Find-or-create the CIL Codebase Assistant ai_agent and cil_codebase_assistant prompt_config."]
// CIL[DOC-RESPONSIBILITY responsibility="Return ids for the agent and prompt config the CIL agent page should use, creating them with adminDb when absent."]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/db.ts,.framework/functions/cil-agent.ts"]
// CIL[DOC-CONTRACT inputs="accountId: string" outputs="{ agentId, promptConfigId }" errors="Database insert errors propagate" side_effects="May insert ai_agents and prompt_configs rows; reads types for cil_retrievable declarations"]
// CIL[DOC-MICRO logic_summary="Resolve item types declaring functionality.kb.cil_retrievable into the default retrieval corpus (base: cil_chunk, kb_article); look up agent by name and prompt config by slug; insert seed-shaped rows when missing." notable_decisions="Reuses the module SYSTEM_PROMPT for the seeded agent; retrieval item_types come from type declarations, not a hardcoded corpus list."]
// CIL[DOC-CONFIDENCE pass="second" score="0.80" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function ensureCilAgentConfig(accountId: string): Promise<{ agentId: string; promptConfigId: string }> {
  const agentDefaults = {
    description: 'Conversational agent that answers questions about the codebase using the Code Intelligence Layer.',
    agent_type: 'rag',
    model_config: { model: 'gpt-4o', temperature: 0.2, max_tokens: 4000 },
    system_prompt: SYSTEM_PROMPT,
    tools: [] as any[],
    capabilities: ['rag_search', 'code_intelligence'],
    constraints: { max_context_tokens: 12000 },
    metadata: {
      managed_by: 'cil_agent',
      default_prompt_config_slug: 'cil_codebase_assistant',
    },
  }
  // The default retrieval corpus is declared, not hardcoded: item types opt
  // in via design_schema.functionality.kb.cil_retrievable === true. cil_chunk
  // and kb_article are the framework base. This default is written once at
  // agent provisioning (and re-synced for managed configs), so the extra read
  // is cheap; a lookup failure falls back to the base corpus.
  let declaredItemTypes: string[] = []
  try {
    const { data: kbTypes } = await adminDb
      .from('types')
      .select('slug')
      .eq('design_schema->functionality->kb->>cil_retrievable', 'true')
    declaredItemTypes = (kbTypes || []).map((t: any) => t.slug)
  } catch (err: any) {
    console.warn('cil_retrievable type lookup failed; using base corpus:', err?.message)
  }
  const defaultItemTypes = [...new Set(['cil_chunk', 'kb_article', ...declaredItemTypes])]

  const contextTemplate =
    "Answer using the numbered 'Relevant Information' excerpts and any tool results; cite them inline as [n]. Treat them as authoritative evidence even when a tool call returns zero results.\n" +
    'Lead with a synthesized answer, then a Sources list containing only the [n] you cited. Do not reproduce chunk metadata unless the user asked where code lives.'
  const configDefaults = {
    name: 'CIL Codebase Assistant',
    context_template: contextTemplate,
    model: 'gpt-4o',
    temperature: 0.2,
    max_tokens: 4000,
    is_multi_turn: true,
    max_history_messages: 10,
    confidence_threshold: 0.3,
    output_mode: 'text',
    knowledge_sources: [] as any[],
    available_tools: [] as string[],
    metadata: {
      managed_by: 'cil_agent',
      max_turns: 6,
      retrieval_policy: {
        // kbIngest labels embeddings with the type slug (item_type) and the
        // field name (vector_type), so both lists must include those values —
        // 'content'/'title' here are kb field names, not CIL vector types.
        item_types: defaultItemTypes,
        vector_types: ['semantic', 'contract', 'content', 'title'],
        max_security_level: 'internal',
        require_approved: true,
      },
    },
  }

  let { data: agent } = await adminDb
    .from('ai_agents')
    .select('id, system_prompt, metadata')
    .eq('name', 'CIL Codebase Assistant')
    .eq('is_active', true)
    .maybeSingle()
  if (!agent?.id) {
    const { data: created, error } = await adminDb
      .from('ai_agents')
      .insert({ account_id: accountId, name: 'CIL Codebase Assistant', ...agentDefaults, is_active: true })
      .select('id')
      .single()
    if (error) throw error
    agent = created
  } else if (agent.metadata?.managed_by === 'cil_agent') {
    await adminDb.from('ai_agents').update({
      system_prompt: SYSTEM_PROMPT,
      model_config: agentDefaults.model_config,
      metadata: { ...(agent.metadata || {}), ...agentDefaults.metadata },
    }).eq('id', agent.id)
  }

  let { data: pc } = await adminDb
    .from('prompt_configs')
    .select('id, context_template, metadata')
    .eq('slug', 'cil_codebase_assistant')
    .eq('is_active', true)
    .maybeSingle()
  if (!pc?.id) {
    const { data: created, error } = await adminDb
      .from('prompt_configs')
      .insert({ account_id: accountId, slug: 'cil_codebase_assistant', ...configDefaults, is_active: true })
      .select('id')
      .single()
    if (error) throw error
    pc = created
  } else if (pc.metadata?.managed_by === 'cil_agent') {
    await adminDb.from('prompt_configs').update({
      context_template: contextTemplate,
      model: configDefaults.model,
      temperature: configDefaults.temperature,
      max_tokens: configDefaults.max_tokens,
      metadata: { ...(pc.metadata || {}), ...configDefaults.metadata },
    }).eq('id', pc.id)
  }

  return { agentId: agent.id, promptConfigId: pc.id }
}
// CIL[DOC-VECTOR type="context" content="purpose='Find-or-create the CIL Codebase Assistant ai_agent and prompt_config used by the CIL agent page.'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="Local impact only; used by the prepare action"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Bootstraps config records server-side so the admin CIL agent page works without an app seed"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent.ts:ensureCilAgentConfig:function"]

// CIL[BEGIN stable_id="~/.framework/functions/cil-agent.ts:findOrCreateCilThread:function" type="function" identity="findOrCreateCilThread" parent="~/.framework/functions/cil-agent.ts"]
// CIL[DOC-LEARNING topic="schema" content="threads.target_type and target_id are NOT NULL, and (target_type, target_id, visibility) is unique — each conversation needs its own target record, so we create a lightweight items row per conversation rather than pointing every thread at the account."]
// CIL[DOC-MACRO purpose="Find-or-create the CIL agent conversation thread wired to the agent, prompt config, and CIL retrieval/tools."]
// CIL[DOC-RESPONSIBILITY responsibility="Return a thread id whose data carries agent_id, prompt_config_id, and cil_config for the new agent engine."]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/db.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent.ts"]
// CIL[DOC-CONTRACT inputs="ctx, accountId, projectId, conversationId (optional), agentId, promptConfigId" outputs="thread id string" errors="Propagates admin-data create errors" side_effects="May create a threads record"]
// CIL[DOC-MICRO logic_summary="When conversationId is supplied, reuse the thread whose data.conversation_id matches; otherwise create a lightweight items row as the target, then a generic thread via admin-data." notable_decisions="Stores cil_config.enabled/use_cil_tools/project_ids so resolveAgentConfig augments retrieval and tools."]
// CIL[DOC-CONFIDENCE pass="second" score="0.80" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function findOrCreateCilThread(
  ctx: any,
  accountId: string,
  projectId: string | null,
  conversationId: string | null,
  agentId: string,
  promptConfigId: string
): Promise<string> {
  const cilConfig = {
    enabled: true,
    project_ids: projectId ? [projectId] : [],
    use_cil_tools: true,
  }

  if (conversationId) {
    const { data: existing } = await adminDb
      .from('threads')
      .select('id, data')
      .eq('account_id', accountId)
      .filter('data->>conversation_id', 'eq', conversationId)
      .limit(1)
    const thread = existing?.[0]
    if (thread?.id) {
      const merged = { ...(thread.data || {}), agent_id: agentId, prompt_config_id: promptConfigId, cil_config: cilConfig }
      await adminDb.from('threads').update({ data: merged }).eq('id', thread.id)
      return thread.id
    }
  }

  // Threads are unique per (target_type, target_id, visibility), so each
  // conversation gets its own lightweight items record as the thread target.
  const target = await adminCreate(ctx, {
    entity: 'items',
    type_slug: 'item',
    account_id: accountId,
    title: 'CIL agent conversation',
    status: 'active',
    data: { conversation_id: conversationId },
  })
  if (!target?.id) throw new Error('Failed to create CIL agent conversation target')

  const thread = await adminCreate(ctx, {
    entity: 'threads',
    type_slug: 'thread',
    account_id: accountId,
    target_type: 'items',
    target_id: target.id,
    title: 'CIL agent conversation',
    visibility: 'internal',
    status: 'active',
    data: {
      agent_id: agentId,
      prompt_config_id: promptConfigId,
      conversation_id: conversationId,
      cil_config: cilConfig,
    },
  })
  if (!thread?.id) throw new Error('Failed to create CIL agent thread')
  return thread.id
}
// CIL[DOC-VECTOR type="context" content="purpose='Find-or-create the CIL agent conversation thread wired to the agent engine config.'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="Local impact only; used by the prepare action"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Thread data must carry agent_id, prompt_config_id, and cil_config for resolveAgentConfig to wire the new engine"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent.ts:findOrCreateCilThread:function"]





// CIL[BEGIN stable_id="~/.framework/functions/cil-agent.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/cil-agent.ts"]
// CIL[DOC-MACRO purpose="Create the Netlify function handler for the CIL agent, dispatching ask/chat/tool/tools actions."]
// CIL[DOC-RESPONSIBILITY responsibility="Handle HTTP requests for CIL agent actions and return JSON responses or errors."]
// CIL[DOC-CONTEXT module="functions" layer="edge" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/llm.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/cil-agent.ts"]
// CIL[DOC-CONTRACT inputs="HTTP request context and JSON body" outputs="JSON response object" errors="Authentication, missing parameters, unknown action, LLM or database errors" side_effects="Queries chunks and account; writes messages for chat threads"]
// CIL[DOC-MICRO logic_summary="createHandler wrapper that parses action, resolves account, dispatches to tools or runCilInference, and persists chat messages." notable_decisions="Defaults action to ask; supports human/assistant history for chat; uses resolveTypeId and adminCreate to store messages."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  const action = ctx.query?.action || 'ask'
  const accountId = ctx.accountId || await getPlatformAccountId()

  
  if (action === 'prepare') {
    const projectId = body?.project_id || ctx.query?.project_id || null
    const conversationId = body?.conversation_id || null
    const runCtx = {
      ...ctx,
      accountId,
      principal:
        ctx.principal?.id && ctx.principal.id !== 'anonymous'
          ? ctx.principal
          : SYSTEM_PRINCIPAL,
    }
    const { agentId, promptConfigId } = await ensureCilAgentConfig(accountId)
    const threadId = await findOrCreateCilThread(runCtx, accountId, projectId, conversationId, agentId, promptConfigId)
    return { thread_id: threadId, agent_id: agentId, prompt_config_id: promptConfigId }
  }

  
  if (action === 'tools') {
    return { tools: CIL_TOOLS }
  }

  
  if (action === 'tool') {
    const toolName = body?.tool
    const toolArgs = body?.args || {}
    if (!toolName) throw new Error('tool name is required')
    const result = await dispatchTool(toolName, toolArgs, accountId)
    return { tool: toolName, result }
  }

  
  if (action === 'ask') {
    const question = body?.question || body?.q
    const projectId = body?.project_id || ctx.query?.project_id || null
    const model = body?.model || 'gpt-4o-mini'
    if (!question) throw new Error('question is required')

    const { answer, sources, tool_calls_made } = await runCilInference(
      question, projectId, [], accountId, model
    )

    return { question, answer, sources, tool_calls_made }
  }

  
  if (action === 'chat') {
    const message = body?.message
    const threadId = body?.thread_id
    const projectId = body?.project_id || null
    const model = body?.model || 'gpt-4o-mini'
    if (!message) throw new Error('message is required')

    
    let history: { role: string; content: string }[] = []
    if (threadId) {
      const { data: messages } = await adminDb
        .from('messages')
        .select('data, content')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: false })
        .limit(10)

      history = ((messages || []).reverse()).map((m: any) => ({
        role: m.data?.message_type === 'human' ? 'user' : 'assistant',
        content: m.content || '',
      }))
    }

    const { answer, sources, tool_calls_made } = await runCilInference(
      message, projectId, history, accountId, model
    )

    
    if (threadId) {
      const messageTypeId = await resolveTypeId('message', 'message').catch(() => null)
      if (messageTypeId) {
        await adminCreate(ctx, {
          entity: 'messages',
          type_id: messageTypeId,
          thread_id: threadId,
          content: message,
          data: { message_type: 'human' },
        })
        await adminCreate(ctx, {
          entity: 'messages',
          type_id: messageTypeId,
          thread_id: threadId,
          content: answer,
          data: { message_type: 'agent', sources, tool_calls_made },
        })
      }
    }

    return { message, answer, sources, tool_calls_made, thread_id: threadId }
  }

  throw new Error(`Unknown action: ${action}. Valid: prepare, ask, chat, tool, tools`)
})
// CIL[DOC-VECTOR type="context" content="purpose='Create the Netlify function handler for the CIL agent, dispatching ask/chat/tool/tools actions.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/cil-agent.ts:handler:constant"]


