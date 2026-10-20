// CIL[BEGIN stable_id="~/.framework/functions/integration-outbound.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/integration-outbound.ts"]
// CIL[DOC-MACRO purpose="Module header: imports and adapter registration for outbound integration delivery"]
// CIL[DOC-RESPONSIBILITY responsibility="Declares dependencies for the outbound integration handler and built-in adapter map"]
// CIL[DOC-CONTEXT module="integration-outbound" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-credentials.ts,.framework/functions/adapters/generic-webhook-outbound.ts,.framework/functions/adapters/openai-outbound.ts,.framework/functions/admin-data.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports shared middleware, database, audit, credential resolution, admin-data and built-in outbound adapters." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal engineers"]

import { createHandler, CoreContext } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { resolveCredential } from './_shared/resolve-credentials'
import { get as adminDataGet, update as adminDataUpdate } from './admin-data'
import * as openaiOutbound from './adapters/openai-outbound'
import * as genericWebhookOutbound from './adapters/generic-webhook-outbound'
import * as resendOutbound from './adapters/resend-outbound'
// CIL[DOC-VECTOR type="context" content="purpose='Module header: imports and adapter registration for outbound integration delivery'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-outbound.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/integration-outbound.ts:OutboundRequest:interface" type="interface" identity="OutboundRequest" parent="~/.framework/functions/integration-outbound.ts"]
// CIL[DOC-MACRO purpose="Shape of an outbound HTTP request produced by an adapter"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the contract between adapters and the outbound executor"]
// CIL[DOC-CONTEXT module="integration-outbound" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-credentials.ts,.framework/functions/adapters/generic-webhook-outbound.ts,.framework/functions/adapters/openai-outbound.ts,.framework/functions/admin-data.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="an OutboundRequest with url, method, optional headers, body and external_id" errors="N/A" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the fields required for a single outbound HTTP call." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface OutboundRequest {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  external_id?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Shape of an outbound HTTP request produced by an adapter'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-outbound.ts:OutboundRequest:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/integration-outbound.ts:OutboundAdapterContext:interface" type="interface" identity="OutboundAdapterContext" parent="~/.framework/functions/integration-outbound.ts"]
// CIL[DOC-MACRO purpose="Context object passed to outbound adapters when building a request"]
// CIL[DOC-RESPONSIBILITY responsibility="Encapsulates record, integration, resolved credential and runtime identifiers for adapter use"]
// CIL[DOC-CONTEXT module="integration-outbound" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-credentials.ts,.framework/functions/adapters/generic-webhook-outbound.ts,.framework/functions/adapters/openai-outbound.ts,.framework/functions/admin-data.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="an OutboundAdapterContext with record, integration, apiKey, accountId, appId and actionConfig" errors="N/A" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Provides adapters with all runtime data needed to construct a request." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface OutboundAdapterContext {
  record: any
  integration: any
  apiKey?: any
  accountId: string | null
  appId: string | null
  actionConfig: any
}
// CIL[DOC-VECTOR type="context" content="purpose='Context object passed to outbound adapters when building a request'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-outbound.ts:OutboundAdapterContext:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/integration-outbound.ts:computeNextAttempt:function" type="function" identity="computeNextAttempt" parent="~/.framework/functions/integration-outbound.ts"]
// CIL[DOC-MACRO purpose="Compute the next retry timestamp for a failed outbound delivery"]
// CIL[DOC-RESPONSIBILITY responsibility="Calculate exponential backoff with jitter for delivery retries"]
// CIL[DOC-CONTEXT module="integration-outbound" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-credentials.ts,.framework/functions/adapters/generic-webhook-outbound.ts,.framework/functions/adapters/openai-outbound.ts,.framework/functions/admin-data.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="attemptCount: number, baseMs: number = 30000, maxDelayMs: number = 3600000" outputs="Date representing the next retry time" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses exponential backoff capped by maxDelayMs and adds up to 20% jitter." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function computeNextAttempt(attemptCount: number, baseMs = 30000, maxDelayMs = 3600000): Date {
  const delay = Math.min(baseMs * Math.pow(2, attemptCount), maxDelayMs)
  const jitter = Math.floor(Math.random() * delay * 0.2)
  return new Date(Date.now() + delay + jitter)
}
// CIL[DOC-VECTOR type="context" content="purpose='Compute the next retry timestamp for a failed outbound delivery'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-outbound.ts:computeNextAttempt:function"]

// CIL[BEGIN stable_id="~/.framework/functions/integration-outbound.ts:execute:function" type="function" identity="execute" parent="~/.framework/functions/integration-outbound.ts"]
// CIL[DOC-MACRO purpose="Execute an outbound integration webhook request with retries and audit logging"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve the integration, build an outbound request, call the target, and persist delivery status"]
// CIL[DOC-CONTEXT module="integration-outbound" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-credentials.ts,.framework/functions/adapters/generic-webhook-outbound.ts,.framework/functions/adapters/openai-outbound.ts,.framework/functions/admin-data.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="ctx: CoreContext, body: any = {}" outputs="object { success, delivery_id, response_status, response_body, is_retry }" errors="Throws if delivery not found, integration_slug missing or integration not found, adapter missing, request invalid, HTTP non-success, or delivery record update fails" side_effects="Inserts or updates webhook_deliveries, emits audit logs, calls an external HTTP endpoint, and optionally updates the source record"]
// CIL[DOC-MICRO logic_summary="Resolves tenant or system integration, creates or reuses a delivery record, loads the configured adapter, builds and executes the HTTP request, updates delivery status, and optionally writes the record." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function execute(ctx: CoreContext, body: any = {}): Promise<any> {
  let deliveryId = body?.delivery_id
  let requestBody = body
  let isRetry = false
  let retryDelivery: any = null

  if (deliveryId && ctx.principal?.isInternal) {
    const { data: delivery, error: deliveryError } = await adminDb
      .from('webhook_deliveries')
      .select('*')
      .eq('id', deliveryId)
      .single()

    if (deliveryError || !delivery) {
      throw new Error(`Delivery not found: ${deliveryId}`)
    }

    retryDelivery = delivery
    requestBody = delivery.payload || {}
    isRetry = true

    await adminDb
      .from('webhook_deliveries')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', deliveryId)
  }

  const { integration_slug, record_id, action_config = {} } = requestBody

  if (!integration_slug) {
    throw new Error('integration_slug is required')
  }

  let integration: any = null

  if (ctx.accountId) {
    const { data: tenant } = await adminDb
      .from('integrations')
      .select('*')
      .eq('slug', integration_slug)
      .eq('account_id', ctx.accountId)
      .eq('is_active', true)
      .maybeSingle()
    if (tenant) integration = tenant
  }

  if (!integration) {
    const { data: system } = await adminDb
      .from('integrations')
      .select('*')
      .eq('slug', integration_slug)
      .is('account_id', null)
      .eq('is_active', true)
      .maybeSingle()
    if (system) integration = system
  }

  if (!integration) {
    throw new Error(`Integration not found: ${integration_slug}`)
  }

  let record: any = null
  if (record_id) {
    const getCtx = { ...ctx, query: { entity: 'items', id: record_id } } as any
    record = await adminDataGet(getCtx)
  }

  const logStarted = (id: string) =>
    emitLog(ctx, 'integration.outbound.started', { type: 'integration', id: integration.id }, undefined, {
      delivery_id: id,
      integration_id: integration.id,
      record_id,
      account_id: ctx.accountId,
      is_retry: isRetry
    }).catch(err => console.error('emitLog integration.outbound.started failed:', err))

  let deliveryPayload: any
  // The delivery INSERT runs concurrently with the outbound request — the
  // wire call dominates latency, so tracking no longer serializes ahead of
  // it. insertPromise is awaited before any delivery update.
  let insertPromise: Promise<string> | null = null
  if (!deliveryId) {
    deliveryPayload = {
      direction: 'outbound',
      integration_id: integration.id,
      record_id: record_id || null,
      action_slug: action_config.action_slug || null,
      payload: requestBody,
      status: 'pending',
      attempt_count: 0,
      max_attempts: action_config.max_attempts ?? integration.config?.retry_policy?.max_attempts ?? 3,
      next_attempt_at: null,
      account_id: ctx.accountId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    insertPromise = adminDb
      .from('webhook_deliveries')
      .insert(deliveryPayload)
      .select('id')
      .single()
      .then(({ data: deliveryRow, error: deliveryInsertError }) => {
        if (deliveryInsertError || !deliveryRow) {
          throw new Error('Failed to create outbound delivery record')
        }
        void logStarted(deliveryRow.id)
        return deliveryRow.id as string
      })
    insertPromise.catch(() => {}) // rejection is surfaced where it is awaited
  } else {
    await adminDb
      .from('webhook_deliveries')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', deliveryId)
    void logStarted(deliveryId)
  }

  try {
    const credentialField = action_config.credential_field || 'api_token'
    const resolved = await resolveCredential(ctx, integration, credentialField)

    const adapterName = action_config.adapter || integration.config?.outbound_adapter
    if (!adapterName) {
      throw new Error('No outbound adapter configured for integration ' + integration_slug)
    }

    const adapter = await loadOutboundAdapter(adapterName)
    if (!adapter) {
      throw new Error(`Outbound adapter not found: ${adapterName}`)
    }

    const adapterCtx: OutboundAdapterContext = {
      record,
      integration,
      apiKey: resolved,
      accountId: ctx.accountId,
      appId: (ctx as any).appId || null,
      actionConfig: action_config
    }

    const request: OutboundRequest = await adapter.buildRequest(record, adapterCtx)
    if (!request.url || !request.method) {
      throw new Error('Outbound adapter must return url and method')
    }

    const startMs = Date.now()
    const response = await fetch(request.url, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers || {})
      },
      body: request.body ? JSON.stringify(request.body) : undefined
    })
    const durationMs = Date.now() - startMs
    const responseBodyText = await response.text()
    let responseBody: any = null
    try {
      responseBody = JSON.parse(responseBodyText)
    } catch {
      responseBody = responseBodyText
    }

    const success = response.ok

    // The tracking insert overlapped the wire call — resolve it now for the
    // status update. attempt_count is derived locally (fresh inserts start
    // at 0, retries carry their count from the row loaded above), so no
    // extra SELECT is needed.
    if (!deliveryId && insertPromise) deliveryId = await insertPromise
    const maxAttempts = deliveryPayload?.max_attempts ?? retryDelivery?.max_attempts ?? 3
    const attemptCount = (isRetry ? retryDelivery?.attempt_count : 0) + 1

    await adminDb
      .from('webhook_deliveries')
      .update({
        status: success ? 'delivered' : (attemptCount >= maxAttempts ? 'failed' : 'pending'),
        attempt_count: attemptCount,
        next_attempt_at: success ? null : computeNextAttempt(attemptCount).toISOString(),
        response_status: response.status,
        response_body: responseBody,
        duration_ms: durationMs,
        updated_at: new Date().toISOString()
      })
      .eq('id', deliveryId)

    void emitLog(ctx, success ? 'integration.outbound.succeeded' : 'integration.outbound.failed_http', { type: 'integration', id: integration.id }, undefined, {
      delivery_id: deliveryId,
      integration_id: integration.id,
      response_status: response.status,
      duration_ms: durationMs,
      account_id: ctx.accountId,
      is_retry: isRetry
    }).catch(err => console.error('emitLog integration.outbound result failed:', err))

    if (success && action_config.update_record && record_id) {
      await adminDataUpdate({ ...ctx, query: { entity: 'items', id: record_id } } as any, {
        entity: 'items',
        id: record_id,
        data: {
          ...(action_config.update_fields || {}),
          last_outbound_status: response.status,
          last_outbound_at: new Date().toISOString()
        }
      })
    }

    if (!success) {
      throw new Error(`Outbound HTTP ${request.method} to ${request.url} failed with status ${response.status}`)
    }

    return {
      success: true,
      delivery_id: deliveryId,
      response_status: response.status,
      response_body: responseBody,
      is_retry: isRetry
    }
  } catch (err: any) {
    // Resolve the overlapped tracking insert — if it failed there is no
    // delivery row to update, so skip the bookkeeping and rethrow.
    if (!deliveryId && insertPromise) deliveryId = await insertPromise.catch(() => null)
    if (deliveryId) {
      const maxAttempts = deliveryPayload?.max_attempts ?? retryDelivery?.max_attempts ?? 3
      const attemptCount = (isRetry ? retryDelivery?.attempt_count : 0) + 1
      const shouldRetry = attemptCount < maxAttempts

      await adminDb
        .from('webhook_deliveries')
        .update({
          status: shouldRetry ? 'pending' : 'failed',
          attempt_count: attemptCount,
          next_attempt_at: shouldRetry ? computeNextAttempt(attemptCount).toISOString() : null,
          last_error: err.message || String(err),
          updated_at: new Date().toISOString()
        })
        .eq('id', deliveryId)

      void emitLog(ctx, 'integration.outbound.error', { type: 'integration', id: integration.id }, undefined, {
        delivery_id: deliveryId,
        integration_id: integration.id,
        error: err.message || String(err),
        account_id: ctx.accountId,
        is_retry: isRetry
      }).catch(logErr => console.error('emitLog integration.outbound.error failed:', logErr))
    }

    throw err
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Execute an outbound integration webhook request with retries and audit logging'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-outbound.ts:execute:function"]

// CIL[BEGIN stable_id="~/.framework/functions/integration-outbound.ts:builtInOutboundAdapters:constant" type="constant" identity="builtInOutboundAdapters" parent="~/.framework/functions/integration-outbound.ts"]
// CIL[DOC-MACRO purpose="Registry of built-in outbound adapter modules"]
// CIL[DOC-RESPONSIBILITY responsibility="Map adapter paths to their module exports"]
// CIL[DOC-CONTEXT module="integration-outbound" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-credentials.ts,.framework/functions/adapters/generic-webhook-outbound.ts,.framework/functions/adapters/openai-outbound.ts,.framework/functions/admin-data.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="Record<string, any> of built-in adapters" errors="N/A" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Lists the openai and generic webhook outbound adapter modules." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const builtInOutboundAdapters: Record<string, any> = {
  'adapters/openai-outbound': openaiOutbound,
  'adapters/generic-webhook-outbound': genericWebhookOutbound,
  'adapters/resend-outbound': resendOutbound
}
// CIL[DOC-VECTOR type="context" content="purpose='Registry of built-in outbound adapter modules'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-outbound.ts:builtInOutboundAdapters:constant"]

// CIL[BEGIN stable_id="~/.framework/functions/integration-outbound.ts:loadOutboundAdapter:function" type="function" identity="loadOutboundAdapter" parent="~/.framework/functions/integration-outbound.ts"]
// CIL[DOC-MACRO purpose="Load an outbound adapter by name from built-ins or dynamic imports"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve and return an adapter module that exposes buildRequest"]
// CIL[DOC-CONTEXT module="integration-outbound" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-credentials.ts,.framework/functions/adapters/generic-webhook-outbound.ts,.framework/functions/adapters/openai-outbound.ts,.framework/functions/admin-data.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="functionName: string" outputs="adapter module or null" errors="Returns null on import or validation failure" side_effects="Logs a console error on import failure"]
// CIL[DOC-MICRO logic_summary="Checks built-in registry first, then dynamically imports the requested adapter and verifies buildRequest exists." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function loadOutboundAdapter(functionName: string): Promise<any | null> {
  if (builtInOutboundAdapters[functionName]) {
    return builtInOutboundAdapters[functionName]
  }
  try {
    const module = await import(`./${functionName}`)
    return module.buildRequest ? module : null
  } catch (err) {
    console.error(`[integration-outbound] Failed to load adapter ${functionName}:`, err)
    return null
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Load an outbound adapter by name from built-ins or dynamic imports'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-outbound.ts:loadOutboundAdapter:function"]

// CIL[BEGIN stable_id="~/.framework/functions/integration-outbound.ts:integrationOutbound:constant" type="constant" identity="integrationOutbound" parent="~/.framework/functions/integration-outbound.ts"]
// CIL[DOC-MACRO purpose="Handler binding for the outbound integration execute function"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap execute in the shared middleware handler"]
// CIL[DOC-CONTEXT module="integration-outbound" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-credentials.ts,.framework/functions/adapters/generic-webhook-outbound.ts,.framework/functions/adapters/openai-outbound.ts,.framework/functions/admin-data.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="createHandler(execute) result" errors="N/A" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates the middleware-backed handler from the execute function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const integrationOutbound = createHandler(execute)
// CIL[DOC-VECTOR type="context" content="purpose='Handler binding for the outbound integration execute function'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-outbound.ts:integrationOutbound:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/integration-outbound.ts:default:function" type="function" identity="default" parent="~/.framework/functions/integration-outbound.ts"]
// CIL[DOC-MACRO purpose="Default export of the integration outbound handler"]
// CIL[DOC-RESPONSIBILITY responsibility="Export integrationOutbound as the module default"]
// CIL[DOC-CONTEXT module="integration-outbound" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/resolve-credentials.ts,.framework/functions/adapters/generic-webhook-outbound.ts,.framework/functions/adapters/openai-outbound.ts,.framework/functions/admin-data.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="integrationOutbound handler" errors="N/A" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports the prebuilt handler as the module default for serverless entry points." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export default integrationOutbound
// CIL[DOC-VECTOR type="context" content="purpose='Default export of the integration outbound handler'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/audit.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/integration-outbound.ts:default:function"]

