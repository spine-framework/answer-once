// CIL[BEGIN stable_id="~/.framework/functions/ai-interactions.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/ai-interactions.ts"]
// CIL[DOC-MACRO purpose="Defines the ai-interactions Netlify function handlers for AI feedback and CIL learning proposals."]
// CIL[DOC-RESPONSIBILITY responsibility="Initialize the module, register handler exports, and provide shared imports for the AI interaction function."]
// CIL[DOC-CONTEXT module="ai-interactions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/funnel.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports shared middleware, database, ID resolution, admin-data helpers, audit logging, and typed signal emission." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]





import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { resolveTypeId } from './_shared/resolve-ids'
import { create, update } from './admin-data'
import { emitLog } from './_shared/audit'
import { emitSignal } from './_shared/funnel'
// CIL[DOC-VECTOR type="context" content="purpose='Defines the ai-interactions Netlify function handlers for AI feedback and CIL learning proposals.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/ai-interactions.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/functions/ai-interactions.ts:submitFeedback:constant" type="constant" identity="submitFeedback" parent="~/.framework/functions/ai-interactions.ts"]
// CIL[DOC-MACRO purpose="Record customer thumbs-up/thumbs-down feedback for an AI message and escalate to human if needed."]
// CIL[DOC-RESPONSIBILITY responsibility="Validate inputs, persist feedback on the message row, update the ticket status on thumbs-down, attach feedback to the ai_interaction record, and emit an audit log."]
// CIL[DOC-CONTEXT module="ai-interactions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/ai-interactions.ts"]
// CIL[DOC-CONTRACT inputs="message_id, ticket_id, feedback, reason, msgData" outputs="{message_id, ticket_id, feedback, escalated}" errors="missing fields, invalid feedback value" side_effects="updates messages.data, items status/data, and emits an audit log"]
// CIL[DOC-MICRO logic_summary="Validate required fields, update the message with feedback, on not_helpful assign the ticket to human (reopening resolved tickets via reopened_at/reopen_reason), on helpful resolve a pending_resolution ticket as ai_confirmed, find the linked ai_interaction and record customer_feedback, then emit a structured log." notable_decisions="thumbs are lifecycle accelerators — thumbs-up confirms a pending AI answer, thumbs-down escalates; resolved_via stamps make the outcome auditable"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// Classify why a thumbs-down happened from the message's own evidence trail.
// Retrieval failure (no usable sources), reasoning failure (sources existed
// but weren't cited or were ignored), or missing knowledge (nothing to
// retrieve) each route to a different improvement path downstream.
function diagnoseFeedback(msgData: any): string {
  const sources = msgData?.retrieved_sources || []
  const cited = msgData?.cited_sources || []
  const meanSim = msgData?.mean_similarity ?? msgData?.retrieval_confidence ?? 0
  if (!sources.length) return 'missing_knowledge'
  if (meanSim < 0.35) return 'retrieval_miss'
  if (!cited.length) return 'reasoning_error'
  return 'wrong_answer'
}

export const submitFeedback = createHandler(async (ctx, body) => {
  const { message_id, ticket_id, feedback, reason } = body || {}
  if (!message_id) throw new Error('message_id is required')
  if (!ticket_id)  throw new Error('ticket_id is required')
  if (!['helpful', 'not_helpful'].includes(feedback)) {
    throw new Error('feedback must be "helpful" or "not_helpful"')
  }

  const { data: msg } = await adminDb
    .from('messages').select('data').eq('id', message_id).single()
  const diagnosis = feedback === 'not_helpful' ? diagnoseFeedback(msg?.data) : null
  if (msg) {
    await adminDb
      .from('messages')
      .update({ data: {
        ...(msg.data || {}),
        feedback,
        ...(reason ? { feedback_reason: String(reason).slice(0, 2000) } : {}),
        ...(diagnosis ? { feedback_diagnosis: diagnosis, needs_review: true } : {}),
      } })
      .eq('id', message_id)
  }

  {
    const { data: ticket } = await adminDb
      .from('items').select('status, data').eq('id', ticket_id).single()
    if (ticket) {
      const now = new Date().toISOString()
      // Thumbs-down is a definitive negative signal: escalate to a human from
      // any state, and reopen when the ticket was already resolved/closed.
      if (feedback === 'not_helpful' && ticket.status !== 'human_assigned' && ticket.status !== 'in_progress') {
        const wasResolved = ticket.status === 'resolved' || ticket.status === 'closed'
        await adminDb
          .from('items')
          .update({
            status: 'human_assigned',
            data: {
              ...(ticket.data || {}),
              aim_escalation_reason: 'thumbs_down',
              last_activity_at: now,
              ...(wasResolved ? {
                reopened_at: now,
                reopen_reason: 'thumbs_down',
                resolved_at: null,
                resolved_via: null,
                aim_resolved_by_ai: false,
              } : {
                pending_proposed_by: null,
                resolve_pending_since: null,
              }),
            },
            updated_at: now,
          })
          .eq('id', ticket_id)
      }
      // Thumbs-up on a pending-resolution ticket is the explicit customer
      // confirm: close it, attributing the resolution to whoever proposed it.
      if (feedback === 'helpful' && ticket.status === 'pending_resolution') {
        const via = ticket.data?.pending_proposed_by === 'human' ? 'human_confirmed' : 'ai_confirmed'
        await adminDb
          .from('items')
          .update({
            status: 'resolved',
            data: {
              ...(ticket.data || {}),
              resolved_at: now,
              resolved_via: via,
              aim_resolved_by_ai: via === 'ai_confirmed',
              last_activity_at: now,
            },
            updated_at: now,
          })
          .eq('id', ticket_id)
      }
    }
  }

  const { data: interactionRows } = await adminDb
    .from('items')
    .select('id, data')
    .contains('data', { ai_message_id: message_id })
    .limit(1)
  if (interactionRows?.length) {
    const interaction = interactionRows[0]
    await adminDb
      .from('items')
      .update({ data: {
        ...(interaction.data || {}),
        customer_feedback: feedback,
        ...(reason ? { feedback_reason: String(reason).slice(0, 2000) } : {}),
        ...(diagnosis ? { feedback_diagnosis: diagnosis, needs_review: true } : {}),
      } })
      .eq('id', interaction.id)
  }

  await emitLog(ctx, 'ai_interaction.feedback_submitted',
    { type: 'message', id: message_id },
    { after: { feedback, ticket_id, escalated: feedback === 'not_helpful', diagnosis } }
  )

  // Journey event: a customer submitted feedback through the calling app.
  emitSignal(ctx, {
    type_slug: 'funnel_signal',
    action: 'feedback_submitted',
    data: { ticket_id, feedback, diagnosis, source: ctx.appId ?? 'core' },
  }).catch(() => {})

  return { message_id, ticket_id, feedback, escalated: feedback === 'not_helpful' }
})
// CIL[DOC-VECTOR type="context" content="purpose='Record customer thumbs-up/thumbs-down feedback for an AI message and escalate to human if needed.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/ai-interactions.ts:submitFeedback:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/ai-interactions.ts:createInteraction:constant" type="constant" identity="createInteraction" parent="~/.framework/functions/ai-interactions.ts"]
// CIL[DOC-MACRO purpose="Create a new interaction-feedback item (default ai_feedback_record, overridable via type_slug) that captures per-message interaction metadata."]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve the caller-declared type_slug (default ai_feedback_record), validate required identifiers, and insert a typed record."]
// CIL[DOC-CONTEXT module="ai-interactions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/ai-interactions.ts"]
// CIL[DOC-CONTRACT inputs="thread_id or ai_message_id plus optional metadata and optional type_slug" outputs="record or skipped object" errors="none thrown; returns skipped if type not found" side_effects="creates a row in items"]
// CIL[DOC-MICRO logic_summary="Require thread_id or ai_message_id, resolve body.type_slug (default ai_feedback_record) via resolveTypeId, call create with default/null fields, and return the record." notable_decisions="type_slug lets app-specific demos record interactions under their own item type without forking this function"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const createInteraction = createHandler(async (ctx, body) => {
  const {
    thread_id, ai_message_id, retrieved_sources = [],
    per_source_feedback = [],
    ai_confidence, retrieval_confidence, kb_candidate,
    answer_quality, assistance_outcome,
    eval_case_id, cil_learning_proposal_id,
    review_notes, reviewed_by, reviewed_at,
    type_slug
  } = body || {}

  if (!thread_id && !ai_message_id) {
    throw new Error('thread_id or ai_message_id is required')
  }

  const resolvedSlug = type_slug || 'ai_feedback_record'
  let typeId: string | null = null
  try {
    typeId = await resolveTypeId('item', resolvedSlug)
  } catch {
    return { skipped: true, reason: `${resolvedSlug} type not found` }
  }
  if (!typeId) return { skipped: true, reason: `${resolvedSlug} type not found` }

  const record = await create(ctx, {
    entity: 'items',
    type_id: typeId,
    title: `AI Interaction — ${new Date().toISOString().slice(0, 10)}`,
    status: 'active',
    data: {
      thread_id:                  thread_id || null,
      ai_message_id:              ai_message_id || null,
      human_message_id:           null,
      retrieved_sources:          retrieved_sources,
      per_source_feedback:        per_source_feedback,
      ai_confidence:              ai_confidence ?? null,
      retrieval_confidence:       retrieval_confidence ?? null,
      human_edits_made:           false,
      customer_feedback:          null,
      answer_quality:             answer_quality ?? null,
      assistance_outcome:         assistance_outcome ?? null,
      kb_candidate:               kb_candidate ?? null,
      kb_article_id:              null,
      eval_case_id:               eval_case_id ?? null,
      cil_learning_proposal_id:   cil_learning_proposal_id ?? null,
      review_notes:               review_notes ?? null,
      reviewed_by:                reviewed_by ?? null,
      reviewed_at:                reviewed_at ?? null,
      reuse_count:                0,
    },
  })

  return record
})
// CIL[DOC-VECTOR type="context" content="purpose='Create a new interaction-feedback item under a caller-declared type_slug (default ai_feedback_record).'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/ai-interactions.ts:createInteraction:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/ai-interactions.ts:updateInteraction:constant" type="constant" identity="updateInteraction" parent="~/.framework/functions/ai-interactions.ts"]
// CIL[DOC-MACRO purpose="Update an existing ai_interaction record with allowed fields."]
// CIL[DOC-RESPONSIBILITY responsibility="Validate id and allowed field list, merge patch into existing data, and delegate to the generic update helper."]
// CIL[DOC-CONTEXT module="ai-interactions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/ai-interactions.ts"]
// CIL[DOC-CONTRACT inputs="id and one or more allowed fields" outputs="update result" errors="missing id, no updatable fields, record not found" side_effects="updates items.data"]
// CIL[DOC-MICRO logic_summary="Validate id, build a patch from the allow-list, fetch existing record data, and call update with merged data." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const updateInteraction = createHandler(async (ctx, body) => {
  const { id, ...fields } = body || {}
  if (!id) throw new Error('id is required')

  const allowed = ['kb_article_id', 'human_message_id', 'human_edits_made',
                   'customer_feedback', 'kb_candidate', 'reuse_count',
                   'per_source_feedback', 'answer_quality', 'assistance_outcome',
                   'eval_case_id', 'cil_learning_proposal_id',
                   'review_notes', 'reviewed_by', 'reviewed_at']
  const patch: Record<string, any> = {}
  for (const key of allowed) {
    if (fields[key] !== undefined) patch[key] = fields[key]
  }

  if (!Object.keys(patch).length) throw new Error('No updatable fields provided')

  const { data: existing } = await adminDb
    .from('items').select('data').eq('id', id).single()
  if (!existing) throw new Error('Interaction record not found')

  return update(
    { ...ctx, query: { ...(ctx.query || {}), entity: 'items', id } } as any,
    { data: { ...(existing.data || {}), ...patch } }
  )
})
// CIL[DOC-VECTOR type="context" content="purpose='Update an existing ai_interaction record with allowed fields.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/ai-interactions.ts:updateInteraction:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/ai-interactions.ts:createCilLearningProposal:constant" type="constant" identity="createCilLearningProposal" parent="~/.framework/functions/ai-interactions.ts"]
// CIL[DOC-MACRO purpose="Create a draft CIL learning proposal from ticket context and source references."]
// CIL[DOC-RESPONSIBILITY responsibility="Validate ticket_id and proposed_summary, resolve the cil_learning_proposal type, and insert a draft record."]
// CIL[DOC-CONTEXT module="ai-interactions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/ai-interactions.ts"]
// CIL[DOC-CONTRACT inputs="ticket_id, proposed_summary, optional thread/message/tags" outputs="record or skipped object" errors="missing ticket_id or summary; returns skipped if type not found" side_effects="creates a draft proposal row in items"]
// CIL[DOC-MICRO logic_summary="Validate required inputs, resolve the proposal type, build data payload with source references, and create the record." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const createCilLearningProposal = createHandler(async (ctx, body) => {
  const {
    ticket_id, thread_id, ai_message_id, proposed_summary,
    source_message_ids = [], source_chunk_ids = [],
    proposed_tags = []
  } = body || {}

  if (!ticket_id) throw new Error('ticket_id is required')
  if (!proposed_summary) throw new Error('proposed_summary is required')

  let typeId: string | null = null
  try {
    typeId = await resolveTypeId('item', 'cil_learning_proposal')
  } catch {
    return { skipped: true, reason: 'cil_learning_proposal type not found' }
  }
  if (!typeId) return { skipped: true, reason: 'cil_learning_proposal type not found' }

  const record = await create(ctx, {
    entity: 'items',
    type_id: typeId,
    title: `CIL Proposal — ${proposed_summary.slice(0, 80)}`,
    status: 'draft',
    data: {
      ticket_id:          ticket_id || null,
      thread_id:          thread_id || null,
      ai_message_id:      ai_message_id || null,
      proposed_summary:   proposed_summary,
      source_message_ids: source_message_ids,
      source_chunk_ids:   source_chunk_ids,
      proposed_tags:      proposed_tags,
      status:             'draft',
      submitted_at:       null,
      reviewed_by:        null,
      review_notes:       null,
    },
  })

  return record
})
// CIL[DOC-VECTOR type="context" content="purpose='Create a draft CIL learning proposal from ticket context and source references.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/ai-interactions.ts:createCilLearningProposal:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/ai-interactions.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/ai-interactions.ts"]
// CIL[DOC-MACRO purpose="List AI interaction records filtered by feedback and kb_candidate."]
// CIL[DOC-RESPONSIBILITY responsibility="Build a paged query scoped to the account, apply optional filters, and return matching rows."]
// CIL[DOC-CONTEXT module="ai-interactions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/ai-interactions.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query { feedback?, kb_candidate?, limit?, offset? }" outputs="array of records" errors="throws query error" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Parse query parameters, select from items with account filter and optional data filters, then return data." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const list = createHandler(async (ctx, _body) => {
  const { feedback, kb_candidate, limit = '50', offset = '0' } = ctx.query || {}

  let q = ctx.db
    .from('items')
    .select('*')
    .eq('account_id', ctx.accountId)
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1)

  if (feedback) q = q.eq('data->>customer_feedback', feedback)
  if (kb_candidate !== undefined) q = q.eq('data->>kb_candidate', kb_candidate)

  const { data: typeRow } = await adminDb
    .from('types').select('id').eq('slug', 'ai_feedback_record').eq('kind', 'item').maybeSingle()
  if (typeRow?.id) q = q.eq('type_id', typeRow.id)

  const { data, error } = await q
  if (error) throw error
  return data || []
})
// CIL[DOC-VECTOR type="context" content="purpose='List AI interaction records filtered by feedback and kb_candidate.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/ai-interactions.ts:list:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/ai-interactions.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/ai-interactions.ts"]
// CIL[DOC-MACRO purpose="Main request router for the ai-interactions Netlify function."]
// CIL[DOC-RESPONSIBILITY responsibility="Dispatch incoming requests to the correct action handler based on action and HTTP method."]
// CIL[DOC-CONTEXT module="ai-interactions" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-ids.ts,.framework/functions/admin-data.ts,.framework/functions/ai-interactions.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query { action, method } and body" outputs="handler result" errors="invalid action or method" side_effects="delegates to other handlers"]
// CIL[DOC-MICRO logic_summary="Switch on action and method, call the appropriate sub-handler, and throw an error for unsupported combinations." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  switch (action) {
    case 'submit_feedback':
      if (method === 'POST') return await submitFeedback(ctx, body)
      break
    case 'create_interaction':
      if (method === 'POST') return await createInteraction(ctx, body)
      break
    case 'update_interaction':
      if (method === 'PATCH' || method === 'POST') return await updateInteraction(ctx, body)
      break
    case 'create_cil_proposal':
      if (method === 'POST') return await createCilLearningProposal(ctx, body)
      break
    case 'list':
    default:
      if (method === 'GET') return await list(ctx, body)
  }

  throw new Error('Invalid action or method')
})
// CIL[DOC-VECTOR type="context" content="purpose='Main request router for the ai-interactions Netlify function.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/resolve-ids.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/ai-interactions.ts:handler:constant"]