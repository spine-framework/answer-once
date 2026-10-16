/**
 * @module   suggest
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module provides functionality for suggesting actions or items within the MCP framework, leveraging the McpServer for server interactions. It is designed to integrate with the admin database for data persistence and utilizes Zod for input validation. INVARIANT: All suggestions must be validated before processing to ensure data integrity.
 *
 * @seeAlso adminDb.js (provides database access for storing suggestions).
 * @seeAlso @modelcontextprotocol/sdk/server/mcp.js (contains the McpServer used for server interactions).
 * @seeAlso zod (used for input validation).
 *
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/suggest.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/cil/suggest.ts"]
// CIL[DOC-MACRO purpose="Expose CIL suggestion tools (learning and review) on an McpServer and persist suggestions via adminDb"]
// CIL[DOC-RESPONSIBILITY responsibility="Initialize module dependencies and provide the register() entry point that attaches two MCP tools"]
// CIL[DOC-CONTEXT module="suggest" layer="shared-core" related_files=".framework/mcp/shared/db.ts"]
// CIL[DOC-CONTRACT inputs="McpServer instance at runtime" outputs="registered tools with database-backed handlers" errors="none at module scope" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import McpServer, zod, adminDb, and uuid; delegate to register() for tool registration" notable_decisions="Uses a dedicated type slug cil_suggestion resolved by resolveTypeId"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="both"]
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../../shared/db.js'
import { v4 as uuid } from 'uuid'
// CIL[DOC-VECTOR type="context" content="purpose='Expose CIL suggestion tools (learning and review) on an McpServer and persist suggestions via adminDb'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/suggest.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/suggest.ts:resolveTypeId:function" type="function" identity="resolveTypeId" parent="~/.framework/mcp/tools/cil/suggest.ts"]
// CIL[DOC-MACRO purpose="Resolve a public.types row id from a slug, restricting to active types"]
// CIL[DOC-RESPONSIBILITY responsibility="Map a type slug to its database id or throw when missing or inactive"]
// CIL[DOC-CONTEXT module="suggest" layer="shared-core" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/suggest.ts"]
// CIL[DOC-CONTRACT inputs="slug: string" outputs="string type id" errors="Error('Type not found: {slug}')" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Query adminDb.from('types') for id where slug equals and is_active is true, return first row id" notable_decisions="Filters on is_active to avoid resolving deleted or inactive type records"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
/**
 * Retrieves the ID of a type based on its slug from the database. This function ensures that only active types are considered.
 *
 * @macro       Async function that resolves a type ID from a slug.
 * @micro       Queries the database for a type's ID and throws an error if not found or if inactive.
 * @inputSpec
 *   slug: string (required) — the slug identifier for the type.
 * @outputSpec  Promise<string> — resolves to the ID of the type as a string.
 * @throws      Error — Type not found: {slug}
 * @sideEffects none
 * @stability   internal
 * @calls       adminDb.from('types')
 * @cil-generated
 */
async function resolveTypeId(slug: string): Promise<string> {
  const { data: rows, error } = await adminDb
    .from('types')
    .select('id')
    .filter('slug', 'eq', slug)
    .eq('is_active', true)
  const typeId = (rows || [])[0]?.id
  if (error || !typeId) throw new Error(`Type not found: ${slug}`)
  return typeId
}
// CIL[DOC-VECTOR type="context" content="purpose='Resolve a public.types row id from a slug, restricting to active types'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/suggest.ts:resolveTypeId:function"]

/**
 * Registers tools for creating and reviewing CIL suggestions within the server. This functionality allows users to submit suggestions and manage their review process.
 *
 * @macro       Tool registration for CIL suggestion management.
 * @micro       Utilizes a database to insert and retrieve suggestion records based on user actions.
 * @inputSpec
 *   - server: McpServer (required) — The server instance to register tools with.
 * @outputSpec  Promise<{ content: Array<{ type: string, text: string }> }> — Returns a structured response indicating success or failure of the operation.
 * @sideEffects Database writes for inserting suggestions and retrieving existing suggestions.
 * @stability   internal
 * @calls       adminDb.from, uuid, resolveTypeId
 * @errorHandling Returns a structured error message if the database operation fails.
 * @cil-generated */
// CIL[BEGIN stable_id="~/.framework/mcp/tools/cil/suggest.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/cil/suggest.ts"]
// CIL[DOC-MACRO purpose="Register two CIL suggestion tools on an McpServer for creating and reviewing suggestions"]
// CIL[DOC-RESPONSIBILITY responsibility="Attach spine_cil_suggest_learning and spine_cil_review_suggestion to the provided server and handle adminDb persistence"]
// CIL[DOC-CONTEXT module="suggest" layer="shared-core" related_files=".framework/mcp/shared/db.ts,.framework/mcp/tools/cil/suggest.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="void" errors="Returns {ok:false,error} on database failures; validation via Zod" side_effects="Inserts or updates items in adminDb for suggestions and reviews"]
// CIL[DOC-MICRO logic_summary="Resolve the cil_suggestion type, generate a uuid, insert a pending item for new suggestions, then for reviews read the item, update its status and review metadata, and persist the change" notable_decisions="Uses resolveTypeId('cil_suggestion') for the type id; review action sets status to accepted, rejected, or escalated; defaults proposed_by to system"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function register(server: McpServer) {
  server.registerTool(
    'spine_cil_suggest_learning',
    {
      description: 'Create a CIL suggestion (learning, note, or KB link) for a chunk or version.',
      inputSchema: z.object({
        project_id: z.string().uuid().describe('The CIL project UUID'),
        version_id: z.string().uuid().optional().describe('Optional version to scope the suggestion to'),
        target_stable_id: z.string().optional().describe('Optional stable_id of the chunk this suggestion targets'),
        suggestion_type: z.enum(['learning', 'note', 'kb_link']).describe('Type of suggestion'),
        content: z.string().min(1).describe('Suggestion content'),
        source: z.string().optional().describe('Source or context (ticket, commit, AI reasoning)'),
        confidence: z.number().min(0).max(1).optional().describe('Confidence score 0-1'),
        proposed_by: z.enum(['ai', 'human', 'system']).optional().describe('Who proposed the suggestion'),
      }),
    },
    async ({ project_id, version_id, target_stable_id, suggestion_type, content, source, confidence, proposed_by }) => {
      const typeId = await resolveTypeId('cil_suggestion')
      const id = uuid()
      const data = {
        kb_type: 'cil_suggestion',
        project_id,
        version_id: version_id || null,
        target_stable_id: target_stable_id || null,
        suggestion_type,
        content,
        source: source || null,
        confidence: confidence ?? null,
        status: 'pending',
        proposed_by: proposed_by || 'system',
        reviewed_by: null,
        reviewed_at: null,
      }
      const { data: record, error } = await adminDb.from('items').insert({
        id,
        type_id: typeId,
        title: `CIL suggestion: ${suggestion_type}`,
        data,
        is_active: true,
      })
      if (error) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: error.message }) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify({ ok: true, suggestion_id: record?.id || id, status: 'pending' }) }] }
    }
  )

  server.registerTool(
    'spine_cil_review_suggestion',
    {
      description: 'Review a CIL suggestion: accept, reject, or escalate it.',
      inputSchema: z.object({
        suggestion_id: z.string().uuid().describe('The CIL suggestion UUID'),
        action: z.enum(['accept', 'reject', 'escalate']).describe('Review action'),
        reviewed_by: z.string().optional().describe('Reviewer identifier'),
        review_notes: z.string().optional().describe('Notes from the reviewer'),
      }),
    },
    async ({ suggestion_id, action, reviewed_by, review_notes }) => {
      const { data: rows } = await adminDb
        .from('items')
        .select('id, data')
        .filter('data->>kb_type', 'eq', 'cil_suggestion')
        .filter('id', 'eq', suggestion_id)
      const suggestion = (rows || [])[0]
      if (!suggestion) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `Suggestion not found: ${suggestion_id}` }) }] }
      }
      const newData = { ...suggestion.data }
      if (action === 'accept') newData.status = 'accepted'
      if (action === 'reject') newData.status = 'rejected'
      if (action === 'escalate') newData.status = 'escalated'
      newData.reviewed_by = reviewed_by || null
      newData.reviewed_at = new Date().toISOString()
      if (review_notes) newData.review_notes = review_notes
      const { error } = await adminDb.from('items').eq('id', suggestion_id).update({ data: newData, updated_at: new Date().toISOString() })
      if (error) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: error.message }) }] }
      }
      return { content: [{ type: 'text', text: JSON.stringify({ ok: true, suggestion_id, status: newData.status }) }] }
    }
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Register two CIL suggestion tools on an McpServer for creating and reviewing suggestions'; No verified external callers; imports: .framework/mcp/shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/cil/suggest.ts:register:function"]
