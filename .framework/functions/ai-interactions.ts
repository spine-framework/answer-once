




import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { resolveTypeId } from './_shared/resolve-ids'
import { create, update } from './admin-data'
import { emitLog } from './_shared/audit'
import { emitSignal } from './_shared/funnel'
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
export const createInteraction = createHandler(async (ctx, body) => {
  const {
    thread_id, ai_message_id, retrieved_sources = [],
    per_source_feedback = [],
    ai_confidence, retrieval_confidence, kb_candidate,
    answer_quality, assistance_outcome,
    eval_case_id,
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
      review_notes:               review_notes ?? null,
      reviewed_by:                reviewed_by ?? null,
      reviewed_at:                reviewed_at ?? null,
      reuse_count:                0,
    },
  })

  return record
})
export const updateInteraction = createHandler(async (ctx, body) => {
  const { id, ...fields } = body || {}
  if (!id) throw new Error('id is required')

  const allowed = ['kb_article_id', 'human_message_id', 'human_edits_made',
                   'customer_feedback', 'kb_candidate', 'reuse_count',
                   'per_source_feedback', 'answer_quality', 'assistance_outcome',
                   'eval_case_id',
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
    case 'list':
    default:
      if (method === 'GET') return await list(ctx, body)
  }

  throw new Error('Invalid action or method')
})