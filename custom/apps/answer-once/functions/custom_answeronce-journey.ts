// Shared-article actions design: when finalizeAnalysis produces both a KB candidate and a directive candidate for one resolution it links article→directive via the ao_article_directive link type, so platform articles carry tenant-executable actions without per-account KB copies. Retrieval and execution are separate gates (envelope platform.sources vs platform.actions); platform directives above the annotate tier also need an active tenant ao_directive_subscription.
import { createHandler, CoreContext } from './_shared/middleware'
import { emitAudit } from './_shared/audit'
import { adminDb } from './_shared/db'
import { resolveTypeId, resolveLinkTypeId, resolveAgentId, resolvePromptConfigId } from './_shared/resolve-ids'
import { kbIngest } from './_shared/kb'
import { create, update } from './admin-data'
import { checkRateLimit } from './_shared/rate-limit'
import { detectInjection, emitSecurityEvent, getAppSecurityConfig } from './_shared/security'
import { kickAgentEpisode } from './_shared/agent-runner'
import { insertMessageSequenced } from './_shared/message-sequence'
import { createHash } from 'crypto'

function adminDataUpdate(ctx: CoreContext, entity: string, id: string, fields: Record<string, any>) {
  return update({ ...ctx, query: { ...((ctx as any).query || {}), entity, id } } as any, fields)
}

// Loads a record through the caller's RLS-scoped client — the caller must be
// able to read the record before any orchestration runs on it. Returns the row
// so callers can derive the record's real account_id (support in spine-system
// operates on tickets/articles owned by customer accounts).
async function loadRecord(ctx: any, entity: 'items' | 'threads' | 'messages', id: string, columns = '*') {
  const { data } = await ctx.db.from(entity).select(columns).eq('id', id).maybeSingle()
  if (!data) {
    const err: any = new Error('Record not found or access denied')
    err.statusCode = 404
    throw err
  }
  return data
}

async function platformAccountId(): Promise<string> {
  const { data } = await adminDb.from('accounts').select('id').eq('slug', 'spine-system').single()
  if (!data?.id) throw new Error('Platform account (spine-system) not found')
  return data.id
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function resolveIds() {
  const [ticket, thread, message, article, sharedArticle, directive, triageAgentId, triagePromptId, analysisAgentId, analysisPromptId] = await Promise.all([
    resolveTypeId('item', 'ao_support_ticket'),
    resolveTypeId('thread', 'ao_ticket_thread'),
    resolveTypeId('message', 'ao_ticket_message'),
    resolveTypeId('item', 'ao_kb_article'),
    resolveTypeId('item', 'ao_kb_shared'),
    resolveTypeId('item', 'ao_triage_directive'),
    resolveAgentId('AO Triage Agent'),
    resolvePromptConfigId('ao_triage'),
    resolveAgentId('AO Case Resolution Analysis Agent'),
    resolvePromptConfigId('ao_case_analysis'),
  ])
  return { ticket, thread, message, article, sharedArticle, directive, triageAgentId, triagePromptId, analysisAgentId, analysisPromptId }
}

async function createTicket(ctx: any, body: any) {
  const { message, title } = body
  if (!message) throw new Error('message is required')
  if (!ctx.accountId || !ctx.principal?.id) throw new Error('User context (account + person) required')

  // Per-account ticket-creation cap — the AO manifest declares
  // config.rate_limits.ao_ticket_create; no-op for unconfigured installs.
  await checkRateLimit(ctx, 'ao_ticket_create')

  // Prompt-injection pre-flight on the opening question. When the app
  // config's security.prompt_injection is 'block' (or unset — AO errs
  // toward humans), the ticket is created already escalated and the AI
  // never sees the text. 'flag' audits and lets triage run; the
  // ai-agents run step applies the same check to every follow-up.
  const injectionHit = detectInjection(message)
  const injectionMode = injectionHit
    ? ((await getAppSecurityConfig(ctx.appId))?.prompt_injection ?? 'block')
    : 'off'
  const injectionEscalated = !!injectionHit && injectionMode !== 'off' && injectionMode !== 'flag'
  if (injectionHit) {
    void emitSecurityEvent(ctx, 'security.injection_detected', {
      type: 'ticket', account_id: ctx.accountId
    }, {
      result: injectionEscalated ? 'denied' : 'flagged',
      pattern: injectionHit,
      surface: 'create_ticket',
      injection_mode: injectionMode,
    })
  }

  const ids = await resolveIds()

  const ticket = await create(ctx, {
    entity: 'items',
    type_id: ids.ticket,
    title: title || message.slice(0, 100),
    description: message,
    status: injectionEscalated ? 'human_assigned' : 'ai_responding',
    data: {
      aim_triage_agent_id: ids.triageAgentId,
      last_activity_at: new Date().toISOString(),
      ...(injectionHit ? {
        injection_detected: true,
        injection_pattern: injectionHit,
      } : {}),
      ...(injectionEscalated ? { aim_escalation_reason: 'prompt_injection' } : {}),
    },
  })
  if (!ticket?.id) throw new Error('Failed to create ticket')

  // The requester follows their own ticket.
  try {
    const watcherTypeId = await resolveTypeId('watcher', 'watcher')
    await create(ctx, {
      entity: 'watchers',
      type_id: watcherTypeId,
      target_type: 'item',
      target_id: ticket.id,
      person_id: ctx.principal.id,
      watch_type: 'all',
    })
  } catch {
    // best-effort — a missing watcher row must not block ticket creation
  }

  const thread = await create(ctx, {
    entity: 'threads',
    type_id: ids.thread,
    target_type: 'items',
    target_id: ticket.id,
    visibility: 'external',
    status: 'active',
    title: `Support thread for ${ticket.title}`,
    data: {
      agent_id: ids.triageAgentId,
      prompt_config_id: ids.triagePromptId,
      // Injection-escalated tickets are human-owned from creation — the AI
      // never kicks on them, and the owner gate keeps it that way.
      ...(injectionEscalated ? { owner: 'human' } : {}),
    },
  })
  if (!thread?.id) throw new Error('Failed to create thread')

  // The customer's opening message lands with creation — not inside the
  // kicked episode — so the thread renders it before the agent's first
  // beat, and injection-escalated tickets (which never kick) still retain
  // the question. runAgent skips re-inserting an identical latest inbound,
  // so the kick below carrying `message` cannot produce a second row.
  await create(ctx, {
    entity: 'messages',
    type_id: ids.message,
    thread_id: thread.id,
    person_id: ctx.principal.id,
    content: message,
    direction: 'inbound',
    sequence: 1,
    visibility: 'external',
    data: { message_type: 'human' },
  })

  if (injectionEscalated) {
    // Same escalation notice finalizeTicket posts — the customer sees a
    // normal handoff; only the audit trail records the detection reason.
    await create(ctx, {
      entity: 'messages',
      type_id: ids.message,
      thread_id: thread.id,
      content: "I've passed this to our support team — a person will follow up in this conversation shortly.",
      direction: 'outbound',
      sequence: 2,
      visibility: 'external',
      data: { message_type: 'escalation', escalation_notice: true },
    }).catch((e) => console.warn('escalation notice failed:', e?.message))
  } else {
    // Kick the agent episode in-process so it starts without the client
    // round-trip. The lease inside kickAgentEpisode makes the client's own
    // episode POST a no-op ('already_running'); if this invocation freezes
    // at response flush on Lambda, the watch-then-step supervisor takes over
    // once the heartbeat goes stale — same fallback as before. Injection-
    // escalated tickets never kick: the AI must not see flagged text.
    // Fire-and-forget: the response must not wait on the kick guards —
    // the client supervisor is the designed fallback either way.
    void (async () => {
      try {
        await checkRateLimit(ctx, 'agent_step')
        await kickAgentEpisode(thread.id, message, ctx, ctx.requestId, (thread as any).data)
      } catch (kickErr: any) {
        console.warn(`[${ctx.requestId}] create_ticket episode kick skipped:`, kickErr?.message)
      }
    })()
  }

  return { ticketId: ticket.id, threadId: thread.id, escalated: injectionEscalated }
}

// no demo-specific journey_role logic — Answer Once tickets are always root tickets; cited_sources preferred over retrieved_sources for the reuse stamp so retrieval alone doesn't count as reuse
async function finalizeTicket(ctx: any, body: any) {
  const { ticket_id, thread_id } = body
  if (!ticket_id) throw new Error('ticket_id is required')
  if (!thread_id) throw new Error('thread_id is required')

  const ids = await resolveIds()

  const ticketCheck = await loadRecord(
    ctx, 'items', ticket_id, 'id, title, status, data, type_id, account_id')
  const ticketAccountId = ticketCheck.account_id

  const { data: threadCheck } = await adminDb
    .from('threads')
    .select('id')
    .eq('id', thread_id)
    .eq('target_id', ticket_id)
    .eq('account_id', ticketAccountId)
    .single()
  if (!threadCheck) throw new Error('Thread not found for ticket')

  const { data: recent } = await adminDb
    .from('messages')
    .select('id, content, data, created_at')
    .eq('thread_id', thread_id)
    .order('created_at', { ascending: false })
    .limit(20)

  const agentMsg = (recent || []).find((m: any) =>
    m.data?.message_type === 'final' || m.data?.message_type === 'agent'
  )
  const askedUser = (recent || []).some((m: any) =>
    m.data?.message_type === 'awaiting_input'
  )

  const confidence = agentMsg?.data?.confidence ?? 0
  const { data: pcRow } = await adminDb
    .from('prompt_configs')
    .select('confidence_threshold')
    .eq('id', ids.triagePromptId)
    .single()
  const threshold = pcRow?.confidence_threshold ?? 0.75

  const escalated = agentMsg?.data?.escalated === true ||
    (!agentMsg && !askedUser) ||
    (agentMsg ? confidence < threshold && agentMsg.data?.evidence_state !== 'evidence_found' : false) ||
    ticketCheck.status === 'human_assigned'

  const answeredByAi = !escalated && !!agentMsg
  const suggestedTitle = agentMsg?.data?.suggested_title || ticketCheck.title

  // A human-owned ticket must never be demoted by a late triage finalize. A
  // stale client (remounted while the ticket still read ai_responding) can
  // legitimately re-run supervise→finalize after support already assigned,
  // progressed, or resolved the case — re-stamping the agent outcome would
  // silently revert that human work while leaving the resolution metadata
  // behind (observed: resolved → human_assigned with resolved_at intact).
  const humanOwned = ['in_progress', 'resolved', 'closed'].includes(ticketCheck.status)

  // True reuse signal: prefer cited_sources (articles the answer actually cited),
  // fall back to retrieved_sources only when nothing was cited. document_id for
  // regular records is the item UUID; verify against published ao_kb_* items so
  // CIL/code sources can't produce false positives.
  let kbSourceIds: string[] = []
  if (answeredByAi && agentMsg) {
    const cited = Array.isArray(agentMsg.data?.cited_sources) ? agentMsg.data.cited_sources : []
    const retrieved = Array.isArray(agentMsg.data?.retrieved_sources) ? agentMsg.data.retrieved_sources : []
    const sourceList = cited.length ? cited : retrieved
    const candidateIds = [...new Set(
      sourceList
        .map((s: any) => s?.document_id)
        .filter((id: any) => typeof id === 'string' && UUID_RE.test(id))
    )] as string[]
    if (candidateIds.length) {
      const { data: srcItems } = await adminDb
        .from('items')
        .select('id')
        .in('id', candidateIds)
        .in('type_id', [ids.article, ids.sharedArticle])
        .eq('status', 'published')
      kbSourceIds = (srcItems || []).map((r: any) => r.id)
    }
  }

  await adminDataUpdate(ctx, 'items', ticket_id, {
    title: suggestedTitle,
    ...(humanOwned ? {} : {
      status: escalated ? 'human_assigned' : answeredByAi ? 'pending_resolution' : (ticketCheck.status || 'ai_responding'),
    }),
    data: {
      ...(ticketCheck.data || {}),
      ...(humanOwned ? {} : { last_activity_at: new Date().toISOString() }),
      aim_triage_agent_id: ids.triageAgentId,
      aim_confidence_at_response: confidence,
      aim_retrieval_confidence: agentMsg?.data?.retrieval_confidence ?? agentMsg?.data?.mean_similarity ?? null,
      aim_escalation_reason: escalated
        ? ((ticketCheck.data as any)?.aim_escalation_reason || (agentMsg || askedUser ? 'low_confidence' : 'no_response'))
        : 'none',
      aim_answered_from_kb: answeredByAi && kbSourceIds.length > 0,
      aim_kb_source_article_id: kbSourceIds[0] || null,
      aim_kb_source_ids: kbSourceIds,
      // A confident answer enters the pending-confirmation window, not resolved.
      // resolve_pending_since resets on every confident answer — the 72h
      // auto-resolve clock always measures silence after the LAST answer.
      ...(humanOwned
        ? {}
        : answeredByAi
          ? {
              pending_proposed_by: 'ai',
              resolve_pending_since: new Date().toISOString(),
              // Pending is not resolved — clear any stale resolution claims.
              resolved_at: null,
              resolved_via: null,
              aim_resolved_by_ai: false,
            }
          : escalated
            ? { pending_proposed_by: null, resolve_pending_since: null }
            : {}),
    },
  })

  // A directive auto-reply already told the customer what happens next —
  // posting the generic handoff notice on top of it reads as a duplicate.
  if (escalated && !agentMsg?.data?.directive_id) {
    const { data: existingAck } = await adminDb
      .from('messages')
      .select('id')
      .eq('thread_id', thread_id)
      .eq('data->>escalation_notice', 'true')
      .limit(1)
    if (!existingAck?.length) {
      await insertMessageSequenced(thread_id, sequence =>
        create(ctx, {
          entity: 'messages',
          type_id: ids.message,
          thread_id,
          content: "I've passed this to our support team — a person will follow up in this conversation shortly.",
          direction: 'outbound',
          sequence,
          visibility: 'external',
          data: { message_type: 'escalation', escalation_notice: true },
        })
      )
    }
  }

  return {
    ticketId: ticket_id,
    threadId: thread_id,
    agentMessageId: agentMsg?.id || null,
    confidence,
    escalated,
  }
}

function validatePostmortem(envelope: any): {
  state: 'validated' | 'incomplete' | 'unearned'
  checks: Record<string, boolean>
  issues: string[]
} {
  const checks = {
    cause_identified: !!envelope?.true_problem?.trim(),
    cause_evidenced: (envelope?.evidence?.cause_evidence?.length ?? 0) > 0,
    diagnostics_recorded: (envelope?.diagnostic_steps?.length ?? 0) > 0,
    solution_recorded: (envelope?.solution_steps?.length ?? 0) > 0 && !!envelope?.final_solution?.trim(),
    outcome_evidenced: (envelope?.evidence?.outcome_evidence?.length ?? 0) > 0,
  }
  const issues = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k)
  const state = issues.length === 0
    ? 'validated'
    : (checks.cause_identified && checks.solution_recorded) ? 'incomplete' : 'unearned'
  return { state, checks, issues }
}

async function analyzeTicket(ctx: any, body: any) {
  const { ticket_id } = body
  if (!ticket_id) throw new Error('ticket_id is required')
  if (!ctx.accountId) throw new Error('Account context required')

  const ids = await resolveIds()

  const ticket = await loadRecord(ctx, 'items', ticket_id)
  if (ticket.type_id !== ids.ticket) throw new Error(`Not an Answer Once ticket: ${ticket_id}`)
  if (ticket.status !== 'resolved') throw new Error('Ticket must be resolved before analysis')
  const ticketAccountId = ticket.account_id

  const { data: threads } = await adminDb
    .from('threads')
    .select('id, visibility, data')
    .eq('account_id', ticketAccountId)
    .eq('target_type', 'items')
    .eq('target_id', ticket_id)
    .eq('type_id', ids.thread)

  const externalThread = (threads || []).find((t: any) => t.visibility === 'external' || t.visibility === 'public')
  const internalThread = (threads || []).find((t: any) => t.visibility === 'internal')
  const existingAnalysis = internalThread?.data?.thread_purpose === 'case_analysis' ? internalThread : null

  const threadIds = (threads || []).map((t: any) => t.id)
  const { data: msgs } = threadIds.length
    ? await adminDb
        .from('messages')
        .select('thread_id, content, direction, visibility, created_at, data')
        .in('thread_id', threadIds)
        .eq('account_id', ticketAccountId)
        .order('created_at', { ascending: true })
        .limit(200)
    : { data: [] as any[] }

  const fmt = (list: any[], label: string) => {
    if (!list.length) return ''
    const body = list
      .map((m: any) => `${m.direction === 'inbound' ? 'Customer' : 'Support/Agent'}: ${m.content}`)
      .join('\n')
    return `\n${label}:\n${body}\n`
  }
  const externalMsgs = (msgs || []).filter((m: any) => m.thread_id === externalThread?.id)
  const internalMsgs = (msgs || []).filter((m: any) => m.thread_id === internalThread?.id && m.data?.message_type !== 'case_analysis_summary')

  const analysisPrompt = [
    `Ticket: ${ticket.title}`,
    `Description: ${ticket.description || ''}`,
    `Created: ${ticket.created_at}`,
    `Resolved: ${ticket.updated_at}`,
    `Status: ${ticket.status}`,
    `Priority: ${ticket.data?.priority || 'medium'}`,
    fmt(externalMsgs, 'Customer Conversation'),
    fmt(internalMsgs, 'Internal Support Notes'),
    '\nProduce the full structured postmortem JSON.',
  ].join('\n')

  // Threads are unique per (target_type, target_id, visibility) — adopt the
  // existing internal notes thread when present so analysis doesn't violate
  // the constraint. Wiring fields are bookkeeping written via adminDb
  // (admin-data field permissions deny updates to undeclared data fields).
  let analysisThreadId = existingAnalysis?.id as string | undefined

  if (analysisThreadId) {
    await adminDb
      .from('threads')
      .update({
        data: {
          ...(existingAnalysis!.data || {}),
          agent_id: ids.analysisAgentId,
          prompt_config_id: ids.analysisPromptId,
          research_state: null,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', analysisThreadId)
  } else if (internalThread?.id) {
    analysisThreadId = internalThread.id
    await adminDb
      .from('threads')
      .update({
        data: {
          ...(internalThread.data || {}),
          thread_purpose: 'case_analysis',
          agent_id: ids.analysisAgentId,
          prompt_config_id: ids.analysisPromptId,
          research_state: null,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', internalThread.id)
  } else {
    const analysisThread = await create(ctx, {
      entity: 'threads',
      type_id: ids.thread,
      target_type: 'items',
      target_id: ticket_id,
      visibility: 'internal',
      status: 'active',
      title: `Case analysis for ${ticket.title}`,
    })
    if (!analysisThread?.id) throw new Error('Failed to create analysis thread')
    analysisThreadId = analysisThread.id
    await adminDb
      .from('threads')
      .update({
        data: {
          thread_purpose: 'case_analysis',
          agent_id: ids.analysisAgentId,
          prompt_config_id: ids.analysisPromptId,
        },
      })
      .eq('id', analysisThreadId)
  }

  return { ticketId: ticket_id, analysisThreadId, analysisPrompt }
}

// When one resolution yields both a KB candidate and a directive candidate, finalizeAnalysis links article→directive via the ao_article_directive link type — this is how shared/platform articles gain tenant-executable actions without per-account KB copies (shared-directives design: platform retrieval via envelope platform.sources, execution gated by platform.actions + tenant ao_directive_subscription opt-in for tiers above annotate).
async function finalizeAnalysis(ctx: any, body: any) {
  const { ticket_id } = body
  if (!ticket_id) throw new Error('ticket_id is required')
  if (!ctx.accountId) throw new Error('Account context required')

  const ids = await resolveIds()

  const ticket = await loadRecord(ctx, 'items', ticket_id)
  const ticketAccountId = ticket.account_id

  const { data: analysisThread } = await adminDb
    .from('threads')
    .select('id, data')
    .eq('account_id', ticketAccountId)
    .eq('target_type', 'items')
    .eq('target_id', ticket_id)
    .eq('visibility', 'internal')
    .eq('data->>thread_purpose', 'case_analysis')
    .maybeSingle()
  if (!analysisThread?.id) throw new Error('No case analysis thread found — run analyze_ticket first')

  const { data: recent } = await adminDb
    .from('messages')
    .select('id, content, data, created_at')
    .eq('thread_id', analysisThread.id)
    .eq('account_id', ticketAccountId)
    .order('created_at', { ascending: false })
    .limit(20)
  const agentMsg = (recent || []).find((m: any) =>
    m.data?.message_type === 'final' || m.data?.message_type === 'agent')


  let envelope: any = {}

  try {
    const raw = agentMsg?.content || '{}'
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    envelope = JSON.parse(cleaned)
  } catch {
    envelope = {
      reported_issue: ticket.description || '',
      true_problem: 'Analysis parse failure — see raw agent message',
      diagnostic_steps: [],
      solution_steps: [],
      final_solution: '',
      confidence_score: 0.1,
      kb_candidate: false,
      analysis_summary: 'Structured analysis unavailable — agent response was not valid JSON.',
    }
  }

  const validation = validatePostmortem(envelope)
  if (envelope.kb_candidate && (validation.state === 'unearned' || envelope.generalizable === false)) {
    envelope.kb_candidate = false
    validation.issues.push('kb_candidate_clamped')
  }

  // Keep one stamped snapshot — admin-data replaces `data` wholesale, so any
  // later update (e.g. kb_article_id below) must spread this object, not the
  // stale ticket.data, or it silently wipes every ca_* field just written.
  const stampedData = {
    ...(ticket.data || {}),
    ca_reported_issue: envelope.reported_issue,
    ca_true_problem: envelope.true_problem,
    ca_final_solution: envelope.final_solution,
    ca_diagnostic_steps: envelope.diagnostic_steps,
    ca_solution_steps: envelope.solution_steps,
    ca_time_to_resolution: envelope.time_to_resolution,
    ca_back_and_forth_count: envelope.back_and_forth_count,
    ca_escalation_required: envelope.escalation_required,
    ca_automation_potential: envelope.automation_potential,
    ca_customer_temperature: envelope.customer_temperature,
    ca_kb_candidate: envelope.kb_candidate,
    ca_correctness_state: validation.state,
    ca_validation_checks: validation.checks,
    ca_validation_issues: validation.issues,
    ca_generalizable: envelope.generalizable ?? null,
    ca_confidence_score: envelope.confidence_score || 0.5,
    ca_sentiment_progression: envelope.sentiment_progression,
    analysis_timestamp: new Date().toISOString(),
  }
  await adminDataUpdate(ctx, 'items', ticket_id, { data: stampedData })

  // Human-readable summary message on the analysis thread — idempotent.
  const summaryContent = [
    '**Case analysis complete**',
    `**Reported issue:** ${envelope.reported_issue || 'N/A'}`,
    `**True problem:** ${envelope.true_problem || 'N/A'}`,
    `**Final solution:** ${envelope.final_solution || 'N/A'}`,
    `**Confidence:** ${envelope.confidence_score || 0.5}`,
    `**KB candidate:** ${envelope.kb_candidate ? 'Yes' : 'No'}`,
  ].join('\n\n')
  const summaryData = {
    message_type: 'case_analysis_summary',
    agent_id: ids.analysisAgentId,
    analysis_summary: envelope.analysis_summary || '',
    confidence_score: envelope.confidence_score || 0.5,
  }
  const { data: existingSummary } = await adminDb
    .from('messages')
    .select('id')
    .eq('thread_id', analysisThread.id)
    .eq('data->>message_type', 'case_analysis_summary')
    .limit(1)
    .maybeSingle()
  if (existingSummary?.id) {
    await adminDb.from('messages')
      .update({ content: summaryContent, data: summaryData })
      .eq('id', existingSummary.id)
  } else {
    await insertMessageSequenced(analysisThread.id, sequence =>
      create(ctx, {
        entity: 'messages',
        type_id: ids.message,
        thread_id: analysisThread.id,
        content: summaryContent,
        direction: 'outbound',
        sequence,
        visibility: 'internal',
        data: summaryData,
      })
    )
  }

  // KB candidate: one ao_kb_article per source ticket, composed as markdown.
  // The candidate always lives in the ticket's account — private-by-default.

  let kbCandidateArticleId: string | null = null

  if (envelope.kb_candidate === true) {
    const { data: existingArticle } = await adminDb
      .from('items')
      .select('id, data')
      .eq('account_id', ticketAccountId)
      .eq('type_id', ids.article)
      .eq('data->>source_ticket_id', ticket_id)
      .maybeSingle()

    const mdSteps = (v: any): string =>
      Array.isArray(v)
        ? v.map((s: any) => `- ${typeof s === 'string' ? s : (s?.step || s?.description || s?.action || JSON.stringify(s))}`).join('\n')
        : (v ? String(v) : '')
    const d = ticket.data || {}
    const resolutionMd = mdSteps(envelope.solution_steps) || (envelope.final_solution ? String(envelope.final_solution) : '')
    const diagnosticMd = mdSteps(envelope.diagnostic_steps)
    const content = [
      envelope.reported_issue && `## Reported issue\n\n${envelope.reported_issue}`,
      envelope.true_problem && `## Root cause\n\n${envelope.true_problem}`,
      diagnosticMd && `## Diagnostic steps\n\n${diagnosticMd}`,
      resolutionMd && `## Resolution\n\n${resolutionMd}`,
    ].filter(Boolean).join('\n\n') || ticket.title || ''

    if (existingArticle?.id) {
      await adminDataUpdate(ctx, 'items', existingArticle.id, {
        title: ticket.title || 'Resolved Case',
        data: {
          ...(existingArticle.data || {}),
          content,
          analysis_summary: envelope.analysis_summary || '',
          correctness_state: validation.state,
          generalizable: envelope.generalizable ?? null,
          confidence_score: envelope.confidence_score || 0.5,
        },
      })
      kbCandidateArticleId = existingArticle.id
    } else {
      const article = await create(ctx, {
        entity: 'items',
        type_id: ids.article,
        account_id: ticketAccountId,
        title: ticket.title || 'Resolved Case',
        status: 'candidate',
        data: {
          content,
          learning_scope: 'private',
          source_ticket_id: ticket_id,
          source_resolution_message_id: d.human_resolution_message_id || null,
          is_ai_generated: true,
          analysis_summary: envelope.analysis_summary || '',
          correctness_state: validation.state,
          generalizable: envelope.generalizable ?? null,
          confidence_score: envelope.confidence_score || 0.5,
        },
      })
      kbCandidateArticleId = article?.id || null
    }

    if (kbCandidateArticleId) {
      await adminDataUpdate(ctx, 'items', ticket_id, {
        data: { ...stampedData, kb_article_id: kbCandidateArticleId },
      })
    }
  }

  // Directive candidate: one suggested ao_triage_directive per source ticket.
  // Created only when the resolution was a repeatable routing action rather
  // than a reusable answer — drafts land as status=suggested for admin review,
  // never active. Actions are derived from what the analysis observed, and
  // anything outside the executor's actions contract is dropped at apply time.

  let directiveCandidateId: string | null = null

  if (envelope.directive_candidate === true && envelope.suggested_directive) {
    const sd = envelope.suggested_directive
    const { data: existingDirective } = await adminDb
      .from('items')
      .select('id, data')
      .eq('account_id', ticketAccountId)
      .eq('type_id', ids.directive)
      .eq('data->>source_ticket_id', ticket_id)
      .maybeSingle()

    const directiveData = {
      status: 'suggested',
      match_description: sd.match_description || envelope.reported_issue || ticket.title || '',
      reply_template: sd.reply_template || null,
      mode: sd.mode_suggestion === 'auto_reply' ? 'auto_reply' : 'suggest',
      actions: (sd.actions && typeof sd.actions === 'object' && !Array.isArray(sd.actions)) ? sd.actions : {},
      is_ai_generated: true,
      source_ticket_id: ticket_id,
      source_resolution_message_id: ticket.data?.human_resolution_message_id || null,
      notes: sd.rationale || envelope.analysis_summary || '',
    }

    if (existingDirective?.id) {
      await adminDataUpdate(ctx, 'items', existingDirective.id, {
        data: { ...(existingDirective.data || {}), ...directiveData },
      })
      directiveCandidateId = existingDirective.id
    } else {
      const created = await create(ctx, {
        entity: 'items',
        type_id: ids.directive,
        account_id: ticketAccountId,
        title: ticket.title || 'Suggested Directive',
        status: 'suggested',
        data: directiveData,
      })
      directiveCandidateId = created?.id || null
    }
    if (directiveCandidateId) {
      await adminDataUpdate(ctx, 'items', ticket_id, {
        data: { ...stampedData, suggested_directive_id: directiveCandidateId },
      })
    }
  }

  // Article→directive action link: when the same resolution produced both a
  // KB candidate and a directive candidate, link them so future retrievals
  // surface the directive through the article. Linked directives only reach
  // the model once status=active — a suggested draft stays dormant.
  if (kbCandidateArticleId && directiveCandidateId) {
    try {
      const linkTypeId = await resolveLinkTypeId('ao_article_directive')
      const { data: existingLink } = await adminDb
        .from('links')
        .select('id')
        .eq('source_type', 'items')
        .eq('source_id', kbCandidateArticleId)
        .eq('target_type', 'items')
        .eq('target_id', directiveCandidateId)
        .eq('link_type_id', linkTypeId)
        .maybeSingle()
      if (!existingLink?.id) {
        await create(ctx, {
          entity: 'links',
          type_slug: 'link',
          account_id: ticketAccountId,
          source_type: 'items',
          source_id: kbCandidateArticleId,
          target_type: 'items',
          target_id: directiveCandidateId,
          link_type_id: linkTypeId,
          data: { source_ticket_id: ticket_id },
        })
      }
    } catch (err: any) {
      console.warn('article→directive link creation failed:', err?.message || err)
    }
  }

  return {
    ticketId: ticket_id,
    analysisThreadId: analysisThread.id,
    confidence: envelope.confidence_score || 0.5,
    correctnessState: validation.state,
    kbCandidate: envelope.kb_candidate,
    kbCandidateArticleId,
    directiveCandidate: envelope.directive_candidate === true,
    directiveCandidateId,
  }
}

function computeArticleHash(article: any): string {
  const norm = (v: any) => (v === undefined || v === null ? '' : String(v)).trim()
  const d = article?.data || {}
  const rawTags = Array.isArray(d.tags) ? d.tags : (d.tags ? [d.tags] : [])
  const tags = rawTags.map((t: any) => norm(t)).filter(Boolean).sort()
  return createHash('sha256').update(JSON.stringify({
    title: norm(article?.title ?? d.title),
    content: norm(article?.content ?? d.content),
    tags,
  })).digest('hex')
}

function validateArticle(article: any, sourceTicket: any) {
  const d = article?.data || {}
  const checks = {
    has_title: !!article?.title?.trim(),
    has_content: !!(article?.content || d.content || '').trim(),
    has_source_ticket: !!d.source_ticket_id,
    source_ticket_resolved: !!sourceTicket && sourceTicket.status === 'resolved',
    analysis_validated: d.correctness_state === 'validated',
    has_resolution_message: !!d.source_resolution_message_id,
    generalizable: d.generalizable === true,
  }
  const hard_failures = ['has_title', 'has_content', 'has_source_ticket'].filter((k) => !(checks as any)[k])
  const warnings = ['source_ticket_resolved', 'analysis_validated', 'has_resolution_message', 'generalizable']
    .filter((k) => !(checks as any)[k])
  return { checks, hard_failures, warnings }
}

// no private-to-public promotion — a published article's learning_scope is immutable; internal re-home uses adminDb because admin-data strips account_id from item updates, and it runs only after the permission-validated admin-data write
async function publishArticle(ctx: any, body: any) {
  const { article_id, acknowledge_warnings } = body || {}
  const flavor = (body?.flavor || 'private') as 'private' | 'internal' | 'shared'
  if (!ctx.accountId) throw new Error('Account context required')
  if (!article_id) throw new Error('article_id is required')
  if (!['private', 'internal', 'shared'].includes(flavor)) {
    const e: any = new Error(`Invalid flavor: ${flavor} — expected private | internal | shared`)
    e.statusCode = 400
    throw e
  }

  const ids = await resolveIds()
  const article = await loadRecord(ctx, 'items', article_id)
  if (article.type_id !== ids.article) {
    const e: any = new Error('Only ao_kb_article candidates can be published — shared artifacts are created by this action')
    e.statusCode = 400
    throw e
  }
  if (article.status === 'published' && article.data?.learning_scope) {
    const e: any = new Error(`Article already published as '${article.data.learning_scope}' — flavor is chosen once at publish`)
    e.statusCode = 400
    throw e
  }

  const sourceTicketId = article.data?.source_ticket_id
  const { data: sourceTicket } = sourceTicketId
    ? await adminDb.from('items').select('id, status').eq('id', sourceTicketId).eq('account_id', article.account_id).maybeSingle()
    : { data: null }

  const validation = validateArticle(article, sourceTicket)
  if (validation.hard_failures.length) {
    const err: any = new Error(`Article has blocking validation failures: ${validation.hard_failures.join(', ')}`)
    err.statusCode = 400
    throw err
  }
  if (validation.warnings.length && acknowledge_warnings !== true) {
    return { published: false, requires_acknowledgement: true, validation }
  }

  const now = new Date().toISOString()
  const approvalData = {
    approved_at: now,
    approved_by: ctx.principal?.id || null,
    validation_checks: validation.checks,
    validation_issues: validation.warnings,
    ...(validation.warnings.length ? {
      validation_acknowledged_at: now,
      validation_acknowledged_by: ctx.principal?.id || null,
    } : {}),
  }

  // The record that gets embedded — private/internal reuse the candidate;
  // shared produces a new platform-scope ao_kb_shared artifact.

  let embedId = article.id


  let embedAccountId = article.account_id


  let sharedArtifactId: string | null = null


  if (flavor === 'shared') {
    // Idempotent: reuse an existing artifact on retry.
    const { data: existingShared } = await adminDb
      .from('items')
      .select('id')
      .eq('type_id', ids.sharedArticle)
      .eq('data->>source_article_id', article.id)
      .maybeSingle()

    if (existingShared?.id) {
      sharedArtifactId = existingShared.id
    } else {
      // ao_kb_shared is design_schema scope=platform — admin-data create
      // auto-homes the record into the spine-system account.
      const shared = await create(ctx, {
        entity: 'items',
        type_id: ids.sharedArticle,
        title: article.title,
        status: 'published',
        data: {
          content: article.data?.content || article.content || '',
          tags: article.data?.tags || [],
          source_ticket_id: sourceTicketId || null,
          source_article_id: article.id,
          source_resolution_message_id: article.data?.source_resolution_message_id || null,
          is_ai_generated: article.data?.is_ai_generated === true,
          analysis_summary: article.data?.analysis_summary || '',
          correctness_state: article.data?.correctness_state || null,
          generalizable: article.data?.generalizable ?? null,
          confidence_score: article.data?.confidence_score ?? null,
          ...approvalData,
        },
      })
      if (!shared?.id) throw new Error('Failed to create shared article artifact')
      sharedArtifactId = shared.id
    }
    embedId = sharedArtifactId
    embedAccountId = await platformAccountId()
  }

  // Publish the source candidate (permission-validated admin-data write) and
  // stamp its final learning_scope + provenance link for shared artifacts.
  const candidateData = {
    ...(article.data || {}),
    ...approvalData,
    learning_scope: flavor,
    ...(sharedArtifactId ? { shared_article_id: sharedArtifactId } : {}),
  }
  const embeddingPatch = flavor === 'shared'
    // The artifact carries the embedding lifecycle — the candidate is only
    // the published source, so clear any stale embed markers on it.
    ? { embedding_state: null, embedding_pending_at: null, embedding_error: null }
    : { embedding_state: 'processing', embedding_pending_at: now, embedding_error: null }
  const record = await adminDataUpdate(ctx, 'items', article.id, {
    status: 'published',
    data: { ...candidateData, ...embeddingPatch },
  })

  // Internal learnings are support-only: re-home the record into spine-system
  // via adminDb — admin-data strips account_id from item updates, so this is
  // the one bookkeeping write that must bypass it. The admin-data update above
  // has already proven the caller holds update permission on the record.
  if (flavor === 'internal') {
    embedAccountId = await platformAccountId()
    await adminDb.from('items').update({ account_id: embedAccountId }).eq('id', article.id)
    // The adminDb write above bypasses admin-data's audit trigger — record the
    // tenant-boundary move explicitly so it appears in the audit trail. The
    // audit insert itself goes through adminDb: the target account is
    // spine-system, which a caller's user-scoped client may not be able to
    // write logs into, and a privileged move must never lose its audit record.
    await emitAudit({ ...ctx, db: adminDb }, 'article.account_rehome', {
      type: 'items',
      id: article.id,
      account_id: embedAccountId,
    }, {
      changes: { before: { account_id: article.account_id }, after: { account_id: embedAccountId } },
      result: 'success',
      flavor,
      reason: 'internal_publish_re_home',
    })
  }

  // A republish candidate supersedes its source once published — archive the
  // original so the corpus keeps exactly one live version. The source may live
  // in a different account (re-homed internal or platform shared), so this goes
  // through adminDb with an explicit audit record.
  if (article.data?.republish_of) {
    const { data: src } = await adminDb
      .from('items')
      .select('id, status, data, account_id')
      .eq('id', article.data.republish_of)
      .maybeSingle()
    if (src?.id && src.status !== 'archived') {
      await adminDb.from('items').update({
        status: 'archived',
        data: { ...(src.data || {}), superseded_by: embedId, superseded_at: new Date().toISOString() },
      }).eq('id', src.id)
      await emitAudit({ ...ctx, db: adminDb }, 'article.superseded', {
        type: 'items',
        id: src.id,
        account_id: src.account_id,
      }, { result: 'success', superseded_by: embedId, candidate_id: article.id })
    }
  }

  // Run the ingest inline: detached post-response work is CPU-frozen on
  // Netlify and silently never ran in production, leaving published articles
  // with no embeddings and null embedding markers. Awaiting adds a few
  // seconds to publish but returns the real embedding_state. A concurrent
  // worker holding the document lease yields in_progress — the marker stays
  // 'processing' and the owning worker's completion reconciles it.
  const stamp = async (patch: Record<string, any>) => {
    const { data: cur } = await adminDb.from('items').select('data').eq('id', embedId).single()
    await adminDataUpdate(ctx, 'items', embedId, {
      data: { ...(cur?.data || {}), ...patch },
    })
  }

  let finalEmbeddingState = 'processing'

  try {
    const ingest = await kbIngest(ctx, { id: embedId, account_id: embedAccountId })
    if (ingest?.in_progress) {
      finalEmbeddingState = 'processing'
    } else {
      const embedded = ingest?.ok === true && (ingest.count ?? 0) > 0
      finalEmbeddingState = embedded ? 'embedded' : 'error'
      await stamp({
        embedding_state: finalEmbeddingState,
        embedding_pending_at: null,
        embedding_error: embedded ? null : (ingest?.message || 'no embeddings written'),
        ...(embedded ? {
          embedded_content_hash: computeArticleHash(article),
          embedded_at: new Date().toISOString(),
        } : {}),
      })
    }
  } catch (err: any) {
    finalEmbeddingState = 'error'
    await stamp({
      embedding_state: 'error',
      embedding_pending_at: null,
      embedding_error: err?.message || String(err),
    }).catch(() => {})
  }

  return { published: true, record, flavor, shared_article_id: sharedArtifactId, validation, embedding_state: finalEmbeddingState }
}

async function republishArticle(ctx: any, body: any) {
  const { article_id, target_flavor } = body || {}
  if (!ctx.accountId) throw new Error('Account context required')
  if (!article_id) throw new Error('article_id is required')
  if (!['private', 'internal', 'shared'].includes(target_flavor)) {
    const e: any = new Error(`Invalid target_flavor: ${target_flavor} — expected private | internal | shared`)
    e.statusCode = 400
    throw e
  }

  const ids = await resolveIds()
  const article = await loadRecord(ctx, 'items', article_id)
  if (![ids.article, ids.sharedArticle].includes(article.type_id)) {
    const e: any = new Error('Not an Answer Once knowledge article')
    e.statusCode = 400
    throw e
  }
  if (article.status !== 'published') {
    const e: any = new Error('Only published articles can be republished')
    e.statusCode = 400
    throw e
  }

  const sourceScope = article.type_id === ids.sharedArticle
    ? 'shared'
    : (article.data?.learning_scope || 'private')
  if (sourceScope === target_flavor) {
    const e: any = new Error(`Article is already published as '${sourceScope}'`)
    e.statusCode = 400
    throw e
  }

  // Private republishes must land in the originating customer account — use
  // the source ticket's account when known, else the article's current home.
  let candidateAccountId = article.account_id
  const srcTicketId = article.data?.source_ticket_id
  if (srcTicketId) {
    const { data: t } = await adminDb.from('items').select('account_id').eq('id', srcTicketId).maybeSingle()
    if (t?.account_id) candidateAccountId = t.account_id
  }

  const candidate = await create(ctx, {
    entity: 'items',
    type_id: ids.article,
    account_id: candidateAccountId,
    title: article.title,
    description: article.description || '',
    status: 'in_review',
    data: {
      content: article.data?.content || article.content || '',
      tags: article.data?.tags || [],
      source_ticket_id: srcTicketId || null,
      republish_of: article.id,
      republish_source_scope: sourceScope,
      target_flavor,
      is_ai_generated: article.data?.is_ai_generated === true,
    },
  })
  if (!candidate?.id) throw new Error('Failed to create republish candidate')

  await emitAudit({ ...ctx, db: adminDb }, 'article.republish_requested', {
    type: 'items',
    id: candidate.id,
    account_id: candidateAccountId,
  }, {
    result: 'success',
    source_article_id: article.id,
    source_scope: sourceScope,
    target_flavor,
  })

  return { candidate_id: candidate.id, target_flavor, source_scope: sourceScope }
}

async function reembedArticle(ctx: any, body: any) {
  const { article_id } = body || {}
  if (!ctx.accountId) throw new Error('Account context required')
  if (!article_id) throw new Error('article_id is required')

  const ids = await resolveIds()
  const article = await loadRecord(ctx, 'items', article_id)
  if (![ids.article, ids.sharedArticle].includes(article.type_id)) {
    const e: any = new Error('Not an Answer Once knowledge article')
    e.statusCode = 400
    throw e
  }
  if (article.status !== 'published') throw new Error('Only published articles can be re-embedded')

  const ingest = await kbIngest(ctx, { id: article.id, account_id: article.account_id })
  const embedded = ingest?.ok === true && (ingest.count ?? 0) > 0
  await adminDataUpdate(ctx, 'items', article.id, {
    data: {
      ...(article.data || {}),
      embedding_state: embedded ? 'embedded' : 'error',
      embedding_pending_at: null,
      embedding_error: embedded ? null : (ingest?.message || 'no embeddings written'),
      ...(embedded ? {
        embedded_content_hash: computeArticleHash(article),
        embedded_at: new Date().toISOString(),
      } : {}),
    },
  })
  return { ok: embedded, ingest, embedding_state: embedded ? 'embedded' : 'error' }
}

async function verifyCompletion(ctx: any, body: any) {
  const { ticket_id, article_id } = body || {}
  if (!ctx.accountId) throw new Error('Account context required')
  if (!ticket_id || !article_id) throw new Error('ticket_id and article_id are required')

  const ids = await resolveIds()

  const ticketRow = await loadRecord(ctx, 'items', ticket_id, 'id, account_id')
  const ticketAccountId = ticketRow.account_id

  const { data: thread } = await adminDb
    .from('threads')
    .select('id')
    .eq('account_id', ticketAccountId)
    .eq('target_type', 'items')
    .eq('target_id', ticket_id)
    .eq('type_id', ids.thread)
    .eq('visibility', 'external')
    .maybeSingle()
  if (!thread) throw new Error('External thread not found for ticket')

  const { data: msgs } = await adminDb
    .from('messages')
    .select('id, content, data, created_at')
    .eq('thread_id', thread.id)
    .eq('account_id', ticketAccountId)
    .order('created_at', { ascending: false })
    .limit(50)

  // Prefer the latest evidence_found terminal message; fall back to the latest
  // terminal message regardless — an evidence_state of 'incomplete' can still
  // carry a decisive [n] citation (weak tail results drag the mean), and the
  // resolved marker is the actual proof we're verifying.
  const terminals = (msgs || []).filter((m: any) =>
    m.data?.message_type === 'final' || m.data?.message_type === 'agent')
  const finalMsg = terminals.find((m: any) => m.data?.evidence_state === 'evidence_found') || terminals[0]
  if (!finalMsg) return { verified: false, messageId: null, evidence_state: null }

  const sources: any[] = Array.isArray(finalMsg.data?.retrieved_sources) ? finalMsg.data.retrieved_sources : []
  const citedIndexes = new Set<number>()
  for (const m of (finalMsg.content || '').matchAll(/\[(\d+)\]/g)) {
    const n = parseInt(m[1], 10)
    if (n >= 1 && n <= sources.length) citedIndexes.add(n - 1)
  }
  const verified = [...citedIndexes].some((i) => {
    const s = sources[i]
    return s?.document_id === article_id || s?.id === article_id
  })

  return { verified, messageId: finalMsg.id, evidence_state: finalMsg.data?.evidence_state }
}

// sweeps every account — the transition is a deterministic time-based rule, idempotent and safe to re-run; invoked by the once-a-day lazy sweep on the tickets page and wireable to a scheduler
const AUTO_RESOLVE_MS = 72 * 60 * 60 * 1000

export async function autoResolvePending(ctx: any, body: any) {
  const ids = await resolveIds()
  const windowMs = typeof body?.since_ms === 'number' && body.since_ms > 0 ? body.since_ms : AUTO_RESOLVE_MS
  const cutoff = new Date(Date.now() - windowMs).toISOString()

  const { data: stale } = await adminDb
    .from('items')
    .select('id, account_id, status, data')
    .eq('type_id', ids.ticket)
    .eq('status', 'pending_resolution')
    .lt('data->>resolve_pending_since', cutoff)
    .limit(200)

  const now = new Date().toISOString()
  const resolved: string[] = []
  for (const t of stale || []) {
    const via = t.data?.pending_proposed_by === 'human' ? 'human_auto' : 'ai_auto'
    const scopedCtx = { ...ctx, accountId: t.account_id }
    await adminDataUpdate(scopedCtx, 'items', t.id, {
      status: 'resolved',
      data: {
        ...(t.data || {}),
        resolved_at: now,
        resolved_via: via,
        aim_resolved_by_ai: via === 'ai_auto',
        last_activity_at: now,
      },
    })

    // Courtesy close note — customer-visible, documents the reopen path.
    const { data: extThread } = await adminDb
      .from('threads')
      .select('id')
      .eq('target_id', t.id)
      .eq('account_id', t.account_id)
      .eq('visibility', 'external')
      .limit(1)
      .maybeSingle()
    if (extThread) {
      await insertMessageSequenced(extThread.id, sequence =>
        create(scopedCtx, {
          entity: 'messages',
          type_id: ids.message,
          thread_id: extThread.id,
          content: "Marking this resolved since we haven't heard back — reply any time and our team will pick it up.",
          direction: 'outbound',
          sequence,
          visibility: 'external',
          data: { message_type: 'system', auto_resolved: true },
        })
      ).catch(() => {})
    }
    resolved.push(t.id)
  }

  return { resolved: resolved.length, ticketIds: resolved }
}

const actions = {
  create_ticket: createTicket,
  finalize: finalizeTicket,
  auto_resolve: autoResolvePending,
  analyze_ticket: analyzeTicket,
  finalize_analysis: finalizeAnalysis,
  publish_article: publishArticle,
  republish_article: republishArticle,
  reembed_article: reembedArticle,
  verify_completion: verifyCompletion,
}

// allowlist prevents arbitrary action execution; company gate lives at dispatch — autoResolvePending sweeps every account via adminDb so a member reaching it is cross-account escalation; the cron bypasses dispatch by importing autoResolvePending directly
const COMPANY_ACTIONS = new Set([
  'auto_resolve',
  'analyze_ticket',
  'finalize_analysis',
  'publish_article',
  'republish_article',
  'reembed_article',
])
const COMPANY_ROLES = new Set(['support', 'support_admin', 'system_admin'])

export const handler = createHandler(async (ctx, body) => {
  const action = (ctx.query as any)?.action
  const handlerFn = (actions as any)[action]
  if (!handlerFn) {
    throw new Error(`Unknown action: ${action}`)
  }
  if (COMPANY_ACTIONS.has(action)) {
    const roles: any[] = ctx.principal?.roles || []
    const isCompany = roles.some((r) => COMPANY_ROLES.has(typeof r === 'string' ? r : r?.slug))
    if (!isCompany) {
      const err: any = new Error(`Action '${action}' requires a support role`)
      err.statusCode = 403
      throw err
    }
  }
  return handlerFn(ctx, body || {})
})
