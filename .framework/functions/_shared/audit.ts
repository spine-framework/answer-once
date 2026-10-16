// CIL[BEGIN stable_id="~/.framework/functions/_shared/audit.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/audit.ts"]
// CIL[DOC-MACRO purpose="Module header for the shared audit logging utilities"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare module-level imports and establish the audit helper module boundary"]
// CIL[DOC-CONTEXT module="audit" layer="functions/_shared" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="No executable logic; groups audit and tracing imports" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="contributor"]




import { CoreContext } from './middleware'
import { adminDb } from './db'
import { Principal, formatPrincipalForAudit } from './principal'
import { Span, TraceContext } from './tracing'
// CIL[DOC-VECTOR type="context" content="purpose='Module header for the shared audit logging utilities'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/audit.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/audit.ts:traceFields:function" type="function" identity="traceFields" parent="~/.framework/functions/_shared/audit.ts"]
// CIL[DOC-MACRO purpose="Extract OpenTelemetry trace fields from the request context for log enrichment"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a partial record of trace and span identifiers when a trace context is present"]
// CIL[DOC-CONTEXT module="audit" layer="functions/_shared" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext" outputs="Partial<Record<string, any>> with trace_id, span_id, parent_span_id, trace_flags, tracestate, sampled" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Cast request context to access trace; if absent return empty object; otherwise copy trace fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Extract OpenTelemetry trace fields from the request context for log enrichment'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/audit.ts:traceFields:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/audit.ts:emitAudit:function" type="function" identity="emitAudit" parent="~/.framework/functions/_shared/audit.ts"]
// CIL[DOC-MACRO purpose="Write a structured audit event to the logs table"]
// CIL[DOC-RESPONSIBILITY responsibility="Persist an audit record capturing the principal, target, outcome, and optional metadata"]
// CIL[DOC-CONTEXT module="audit" layer="functions/_shared" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext, action: string, target: {type,id?,account_id?}, metadata?: {changes?,result?,error?,...}" outputs="Promise<void>" errors="Log insertion failures are caught and written to stderr" side_effects="Inserts a row into the logs table"]
// CIL[DOC-MICRO logic_summary="Determine log level from result; build message from principal; insert row with trace fields, target, and metadata; errors are swallowed" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Write a structured audit event to the logs table'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/audit.ts:emitAudit:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/audit.ts:emitSpan:function" type="function" identity="emitSpan" parent="~/.framework/functions/_shared/audit.ts"]
// CIL[DOC-MACRO purpose="Write a structured span completion log to the logs table"]
// CIL[DOC-RESPONSIBILITY responsibility="Persist a span record including timing, status, and associated metadata"]
// CIL[DOC-CONTEXT module="audit" layer="functions/_shared" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext, span: Span, options?: {action?,target?,level?,kind?,event_category?,metadata?}" outputs="Promise<void>" errors="Log insertion failures are caught and written to stderr" side_effects="Inserts a row into the logs table"]
// CIL[DOC-MICRO logic_summary="Compute level and outcome from span status; insert span details, attributes, and optional overrides; errors are swallowed" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Write a structured span completion log to the logs table'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/audit.ts:emitSpan:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/audit.ts:emitLog:function" type="function" identity="emitLog" parent="~/.framework/functions/_shared/audit.ts"]
// CIL[DOC-MACRO purpose="Emit a simplified audit log by delegating to emitAudit with optional target and changes"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a convenient wrapper over emitAudit for generic log events"]
// CIL[DOC-CONTEXT module="audit" layer="functions/_shared" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext, eventType: string, target?: {type,id}, changes?: {before?,after?}, metadata?: Record<string,any>" outputs="Promise<void>" errors="Failures are caught and written to stderr" side_effects="Calls emitAudit; may insert a logs row"]
// CIL[DOC-MICRO logic_summary="Build a target from provided values or fall back to the request account; forward to emitAudit with changes and metadata" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Emit a simplified audit log by delegating to emitAudit with optional target and changes'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/audit.ts:emitLog:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/audit.ts:emitActivity:function" type="function" identity="emitActivity" parent="~/.framework/functions/_shared/audit.ts"]
// CIL[DOC-MACRO purpose="Emit an activity audit event with a namespaced type and arbitrary details"]
// CIL[DOC-RESPONSIBILITY responsibility="Record a domain activity by delegating to emitLog"]
// CIL[DOC-CONTEXT module="audit" layer="functions/_shared" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/tracing.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext, type: string, details?: Record<string,any>" outputs="Promise<void>" errors="Failures from emitLog are propagated" side_effects="Calls emitLog; may insert a logs row"]
// CIL[DOC-MICRO logic_summary="Prefix the provided type with 'activity.' and forward to emitLog with the details payload" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function emitActivity(
  ctx: CoreContext,
  type: string,
  details: Record<string, any> = {}
): Promise<void> {
  await emitLog(ctx, `activity.${type}`, undefined, undefined, details)
}
// CIL[DOC-VECTOR type="context" content="purpose='Emit an activity audit event with a namespaced type and arbitrary details'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/audit.ts:emitActivity:function"]