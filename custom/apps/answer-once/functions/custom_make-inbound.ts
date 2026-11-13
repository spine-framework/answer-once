/**
 * @module   custom_make-inbound
 * @responsibility Inbound adapter for the 'make' integration — transforms a
 * Make.com scenario payload into a full Answer Once intake: ao_support_ticket
 * + external ao_ticket_thread + first inbound ao_ticket_message + triage
 * episode kick. Make becomes an intake channel (Gmail, Typeform, Shopify,
 * etc.) whose tickets are triaged exactly like portal-originated ones.
 *
 * The adapter creates the records itself (via admin-data) rather than
 * returning the ticket as its AdapterResult — integration-routes creates the
 * returned record AFTER adapt() runs, so the ticket must exist first for the
 * thread to attach to. adapt() returns a webhook_event audit summary instead.
 *
 * Expected payload (all fields optional — adapter is tolerant):
 * {
 *   "title": "subject line",
 *   "message" | "description" | "body": "the customer's request text",
 *   "customer_email": "...", "customer_name": "...",
 *   "source": "gmail|typeform|...", "external_id": "dedupe key"
 * }
 *
 * Idempotent: data.external_id dedupes Make-side retries — a replayed payload
 * summarizes the existing ticket instead of creating a second one.
 */
import { adminDb } from './_shared/db'
import { create } from './admin-data'
import { resolveTypeId, resolveAgentId, resolvePromptConfigId } from './_shared/resolve-ids'
import { detectInjection, emitSecurityEvent, getAppSecurityConfig } from './_shared/security'
import { checkRateLimit } from './_shared/rate-limit'
import { kickAgentEpisode } from './_shared/agent-runner'
import { SYSTEM_PRINCIPAL } from './_shared/principal'

interface InboundAdapterContext {
  integration: any
  apiKey: any
  accountId: string
  appId?: string
  event: string | null
  headers?: Record<string, string>
  logger: { info: (msg: string, meta?: any) => void; warn: (msg: string, meta?: any) => void; error: (msg: string, meta?: any) => void }
}

interface AdapterResult {
  type_slug: string
  data: Record<string, any>
  title?: string
  status?: string
  external_id?: string
  error?: string
  retryable?: boolean
}

export async function adapt(payload: any, ctx: InboundAdapterContext): Promise<AdapterResult> {
  const message =
    payload?.message ?? payload?.description ?? payload?.body ?? payload?.text ?? ''
  const title =
    payload?.title ?? payload?.subject ?? (message ? String(message).slice(0, 80) : 'Make intake')
  const externalId = payload?.external_id ?? payload?.id ?? ctx.event ?? undefined

  if (!message && !payload?.customer_email) {
    return { type_slug: 'ao_support_ticket', data: {}, error: 'payload carries no message or customer identifier', retryable: false }
  }

  ctx.logger.info('make-inbound received payload', {
    event: ctx.event,
    account_id: ctx.accountId,
    source: payload?.source,
  })

  // Idempotency — Make retries and scenario replays must not mint a second
  // ticket. data.external_id is stored top-level for this lookup.
  if (externalId) {
    const { data: existing } = await adminDb
      .from('items')
      .select('id')
      .eq('account_id', ctx.accountId)
      .filter('data->>external_id', 'eq', String(externalId))
      .limit(1)
    if (existing?.length) {
      return {
        type_slug: 'webhook_event',
        title: `make intake → ticket ${existing[0].id} (deduped)`,
        data: {
          channel: 'make',
          source: payload?.source || 'make',
          deduped: true,
          created_ticket_id: existing[0].id,
          external_id: externalId,
        },
        external_id: externalId,
      }
    }
  }

  // Same prompt-injection pre-flight as journey create_ticket — Make intake is
  // untrusted external text and gets the identical treatment: 'block' (or
  // unset) escalates to humans before the AI ever sees the text, 'flag'
  // audits and lets triage run.
  const injectionHit = detectInjection(message)
  const injectionMode = injectionHit
    ? ((await getAppSecurityConfig(ctx.appId))?.prompt_injection ?? 'block')
    : 'off'
  const injectionEscalated = !!injectionHit && injectionMode !== 'off' && injectionMode !== 'flag'
  if (injectionHit) {
    void emitSecurityEvent({ requestId: crypto.randomUUID(), accountId: ctx.accountId } as any, 'security.injection_detected', {
      type: 'ticket', account_id: ctx.accountId
    }, {
      result: injectionEscalated ? 'denied' : 'flagged',
      pattern: injectionHit,
      surface: 'make_inbound',
      injection_mode: injectionMode,
    })
  }

  const [ticketTypeId, threadTypeId, messageTypeId, triageAgentId, triagePromptId] = await Promise.all([
    resolveTypeId('item', 'ao_support_ticket'),
    resolveTypeId('thread', 'ao_ticket_thread'),
    resolveTypeId('message', 'ao_ticket_message'),
    resolveAgentId('AO Triage Agent'),
    resolvePromptConfigId('ao_triage'),
  ])

  // Fabricated system ctx — mirrors trigger-scheduler's SYSTEM_PRINCIPAL
  // pattern. The API-key auth already ran in integration-routes; writes here
  // are trusted orchestration, and the system principal gets adminDb access
  // inside admin-data without impersonating a person.
  const adminCtx: any = {
    requestId: crypto.randomUUID(),
    principal: SYSTEM_PRINCIPAL,
    db: adminDb,
    accountId: ctx.accountId,
    appId: ctx.appId || null,
    query: {},
    requestPath: '/.netlify/functions/integration-routes',
    headers: ctx.headers || {},
    source: 'make-inbound',
  }

  const ticket = await create(adminCtx, {
    entity: 'items',
    type_id: ticketTypeId,
    title: String(title),
    description: String(message),
    status: injectionEscalated ? 'human_assigned' : 'ai_responding',
    data: {
      aim_triage_agent_id: triageAgentId,
      initial_message: String(message),
      external_id: externalId ?? null,
      last_activity_at: new Date().toISOString(),
      context: {
        channel: 'make',
        source: payload?.source || 'make',
        customer_email: payload?.customer_email || null,
        customer_name: payload?.customer_name || null,
        raw: payload,
      },
      ...(injectionHit ? {
        injection_detected: true,
        injection_pattern: injectionHit,
      } : {}),
      ...(injectionEscalated ? { aim_escalation_reason: 'prompt_injection' } : {}),
    },
  })
  if (!ticket?.id) {
    return { type_slug: 'ao_support_ticket', data: {}, error: 'ticket create returned no record', retryable: true }
  }

  const thread = await create(adminCtx, {
    entity: 'threads',
    type_id: threadTypeId,
    target_type: 'items',
    target_id: ticket.id,
    visibility: 'external',
    status: 'active',
    title: `Support thread for ${ticket.title}`,
    data: {
      agent_id: triageAgentId,
      prompt_config_id: triagePromptId,
      // Injection-escalated tickets are human-owned from creation — the AI
      // never kicks on them, and the owner gate keeps it that way.
      ...(injectionEscalated ? { owner: 'human' } : {}),
    },
  })
  const threadId = thread?.id

  // The opening message lands with creation — not inside the kicked episode —
  // so the thread renders it before the agent's first beat. runAgent skips
  // re-inserting an identical latest inbound, so the kick cannot double-post.
  if (threadId && message) {
    await create(adminCtx, {
      entity: 'messages',
      type_id: messageTypeId,
      thread_id: threadId,
      content: String(message),
      direction: 'inbound',
      sequence: 1,
      visibility: 'external',
      data: { message_type: 'human' },
    })
  }

  if (injectionEscalated && threadId) {
    // Same escalation notice create_ticket posts — the customer sees a normal
    // handoff; only the audit trail records the detection reason.
    await create(adminCtx, {
      entity: 'messages',
      type_id: messageTypeId,
      thread_id: threadId,
      content: "I've passed this to our support team — a person will follow up in this conversation shortly.",
      direction: 'outbound',
      sequence: 2,
      visibility: 'external',
      data: { message_type: 'escalation', escalation_notice: true },
    }).catch((e) => ctx.logger.warn('escalation notice failed', { error: e?.message }))
  } else if (threadId && message) {
    // Kick the triage episode detached — the delivery response must not wait
    // on the episode; the watch-then-step supervisor is the designed fallback
    // if this invocation freezes at flush.
    void (async () => {
      try {
        await checkRateLimit(adminCtx, 'agent_step')
        await kickAgentEpisode(threadId, String(message), adminCtx, adminCtx.requestId, (thread as any).data)
      } catch (kickErr: any) {
        ctx.logger.warn('episode kick skipped', { error: kickErr?.message })
      }
    })()
  }

  return {
    type_slug: 'webhook_event',
    title: `make intake → ticket ${ticket.id}`,
    data: {
      channel: 'make',
      source: payload?.source || 'make',
      created_ticket_id: ticket.id,
      thread_id: threadId || null,
      external_id: externalId,
      escalated: injectionEscalated,
    },
    external_id: externalId,
  }
}
