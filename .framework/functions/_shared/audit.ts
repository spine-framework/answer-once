



import { CoreContext } from './middleware'
import { adminDb } from './db'
import { Principal, formatPrincipalForAudit } from './principal'
import { Span, TraceContext } from './tracing'

function traceFields(ctx: CoreContext): Partial<Record<string, any>> {
  const trace = (ctx as any).trace as TraceContext | undefined
  if (!trace) return {}
  return {
    trace_id: trace.traceId,
    span_id: trace.spanId,
    parent_span_id: trace.parentSpanId,
    trace_flags: trace.traceFlags,
    tracestate: trace.traceState,
    sampled: trace.sampled
  }
}


export async function emitAudit(
  ctx: CoreContext,
  action: string,
  target: { type: string; id?: string; account_id?: string },
  metadata?: {
    changes?: { before?: any; after?: any }
    result?: 'success' | 'failure' | 'denied'
    error?: string
    [key: string]: any
  }
): Promise<void> {
  try {
    const logDb = ctx.db || adminDb
    const result = metadata?.result
    const level = result === 'failure' || result === 'denied' ? 'warning' : 'info'

    await logDb.from('logs').insert({
      level,
      source: 'audit',
      source_type: 'event',
      message: `${action} by ${ctx.principal?.type || 'unknown'}:${ctx.principal?.id || 'anonymous'}`,
      span_name: action,
      kind: 'event',
      outcome: result === 'failure' ? 'failure' : result === 'denied' ? 'failure' : result === 'success' ? 'success' : null,
      event_category: result ? 'business_outcome' : 'audit',
      started_at: new Date().toISOString(),
      ...traceFields(ctx),
      metadata: {
        principal: ctx.principal ? formatPrincipalForAudit(ctx.principal) : null,
        action,
        target: {
          type: target.type,
          id: target.id,
          account_id: target.account_id || ctx.accountId
        },
        request_id: ctx.requestId,
        ...metadata
      },
      account_id: target.account_id || ctx.accountId || ctx.principal?.accountId || null
    })
  } catch (err) {
    console.error('Failed to emit audit log:', err)
  }
}


export async function emitSpan(
  ctx: CoreContext,
  span: Span,
  options?: {
    action?: string
    target?: { type: string; id?: string; account_id?: string }
    level?: string
    kind?: string
    event_category?: string
    metadata?: Record<string, any>
  }
): Promise<void> {
  try {
    const logDb = ctx.db || adminDb
    const level = options?.level || (span.status === 'error' ? 'warning' : 'info')
    const outcome = span.status === 'error' ? 'failure' : span.status === 'ok' ? 'success' : null

    await logDb.from('logs').insert({
      level,
      source: 'span',
      source_type: 'span',
      message: `${span.spanName} ${span.status === 'error' ? 'failed' : 'completed'}`,
      trace_id: span.traceId,
      span_id: span.spanId,
      parent_span_id: span.parentSpanId,
      trace_flags: span.traceFlags,
      tracestate: span.traceState,
      span_name: span.spanName,
      started_at: span.startedAt,
      ended_at: span.endedAt,
      duration_ms: span.durationMs,
      sampled: span.sampled,
      kind: options?.kind || 'span',
      outcome,
      event_category: options?.event_category,
      metadata: {
        principal: ctx.principal ? formatPrincipalForAudit(ctx.principal) : null,
        action: options?.action || span.spanName,
        target: options?.target || { type: 'request', account_id: ctx.accountId },
        request_id: ctx.requestId,
        ...span.attributes,
        ...(options?.metadata || {})
      },
      account_id: options?.target?.account_id || ctx.accountId || ctx.principal?.accountId || null
    })
  } catch (err) {
    console.error('Failed to emit span log:', err)
  }
}

export async function emitLog(
  ctx: CoreContext,
  eventType: string,
  target?: { type: string; id: string },
  changes?: { before?: any; after?: any },
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    await emitAudit(ctx, eventType, {
      type: target?.type || 'unknown',
      id: target?.id,
      account_id: ctx.accountId || undefined
    }, {
      changes,
      ...metadata
    })
  } catch (error) {
    console.error('Failed to emit log:', error)
  }
}

export async function emitActivity(
  ctx: CoreContext,
  type: string,
  details: Record<string, any> = {}
): Promise<void> {
  await emitLog(ctx, `activity.${type}`, undefined, undefined, details)
}