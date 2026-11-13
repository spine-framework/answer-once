
import { createHandler, CoreContext } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { resolveCredential, ResolvedCredential } from './_shared/resolve-credentials'
import { isSystemAdmin, isSystemPrincipal } from './_shared/principal'
import { assertPublicOutboundUrl } from './_shared/access'
import { get as adminDataGet, update as adminDataUpdate } from './admin-data'
import * as openaiOutbound from './adapters/openai-outbound'
import * as genericWebhookOutbound from './adapters/generic-webhook-outbound'
import * as resendOutbound from './adapters/resend-outbound'
import * as makeOutbound from './adapters/make-outbound'

interface OutboundRequest {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  external_id?: string
}

interface OutboundAdapterContext {
  record: any
  integration: any
  apiKey?: any
  accountId: string | null
  appId: string | null
  actionConfig: any
}

function computeNextAttempt(attemptCount: number, baseMs = 30000, maxDelayMs = 3600000): Date {
  const delay = Math.min(baseMs * Math.pow(2, attemptCount), maxDelayMs)
  const jitter = Math.floor(Math.random() * delay * 0.2)
  return new Date(Date.now() + delay + jitter)
}

export async function execute(ctx: CoreContext, body: any = {}): Promise<any> {
  let deliveryId = body?.delivery_id
  let requestBody = body
  let isRetry = false
  let retryDelivery: any = null

  if (deliveryId) {
    const { data: delivery, error: deliveryError } = await adminDb
      .from('webhook_deliveries')
      .select('*')
      .eq('id', deliveryId)
      .single()

    if (deliveryError || !delivery) {
      throw new Error(`Delivery not found: ${deliveryId}`)
    }

    // A delivery_id replays (internal) or rewrites (non-internal) an existing
    // delivery row that carries its own account_id. Only system-level
    // principals — system_admin role or an unbound internal machine
    // (SYSTEM_PRINCIPAL via INTERNAL_INVOKE_SECRET) — may touch another
    // account's delivery. Account-bound callers must match.
    const isSystem = isSystemAdmin(ctx.principal) ||
      (ctx.principal?.isInternal === true && !ctx.accountId)
    if (!isSystem && delivery.account_id !== ctx.accountId) {
      const e: any = new Error('Delivery belongs to a different account')
      e.statusCode = 403
      throw e
    }

    if (ctx.principal?.isInternal) {
      retryDelivery = delivery
      requestBody = delivery.payload || {}
      isRetry = true

      await adminDb
        .from('webhook_deliveries')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', deliveryId)
    }
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
    const credentialField = isSystemPrincipal(ctx)
      ? (action_config.credential_field || 'api_token')
      : 'api_token'
    // An absent or explicitly-empty credential entry means "call without
    // auth" — generic HTTP/webhook targets often need none, and the stock
    // generic-http seed ships api_token {source:'value',value:''} as a
    // deliberate no-auth marker. The skip is still audited with the same
    // integration.credential_* event resolveCredential would have emitted,
    // marked skipped:true so the non-fatal path is distinguishable. A
    // configured-but-broken credential (env_var name set, variable unset)
    // keeps throwing inside resolveCredential, and adapters that genuinely
    // require a key (openai-outbound, resend-outbound) still fail in
    // buildRequest when apiKey is missing — generic-webhook-outbound only
    // attaches Authorization: Bearer when a credential resolved.
    const credEntry = (integration?.credentials || {})[credentialField]
    const credentialSkipped = !credEntry?.source || (credEntry.source === 'value' && !credEntry.value)
    let resolved: ResolvedCredential | undefined
    if (credentialSkipped) {
      await emitLog(ctx, credEntry?.source === 'value' ? 'integration.credential_empty' : 'integration.credential_missing', { type: 'integration', id: integration.id }, undefined, {
        field: credentialField,
        source: credEntry?.source || null,
        integration_id: integration.id,
        account_id: ctx.accountId,
        skipped: true
      })
    } else {
      resolved = await resolveCredential(ctx, integration, credentialField)
    }

    const adapterName = isSystemPrincipal(ctx)
      ? (action_config.adapter || integration.config?.outbound_adapter)
      : integration.config?.outbound_adapter
    if (!adapterName) {
      throw new Error('No outbound adapter configured for integration ' + integration_slug)
    }

    const adapter = await loadOutboundAdapter(adapterName)
    if (!adapter) {
      throw new Error(`Outbound adapter not found: ${adapterName}`)
    }

    // A system integration's secret may only ride adapters that pin their own
    // vendor URL — never a caller-chosen webhook URL from a tenant request.
    const dropsCredential = !isSystemPrincipal(ctx) &&
      !integration.account_id &&
      adapterName === 'adapters/generic-webhook-outbound'

    const adapterCtx: OutboundAdapterContext = {
      record,
      integration,
      apiKey: dropsCredential ? undefined : resolved,
      accountId: ctx.accountId,
      appId: (ctx as any).appId || null,
      actionConfig: action_config
    }

    const request: OutboundRequest = await adapter.buildRequest(record, adapterCtx)
    if (!request.url || !request.method) {
      throw new Error('Outbound adapter must return url and method')
    }
    assertPublicOutboundUrl(request.url)

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

const builtInOutboundAdapters: Record<string, any> = {
  'adapters/openai-outbound': openaiOutbound,
  'adapters/generic-webhook-outbound': genericWebhookOutbound,
  'adapters/resend-outbound': resendOutbound,
  'adapters/make-outbound': makeOutbound
}

// 'Outbound adapter not found' for a name present in builtInOutboundAdapters means the executing bundle predates the registration — netlify dev bundles each function independently into .netlify/functions-serve, and any other deployment sharing the DB (e.g. a stale site's system-cron sweep) runs its own copy. Identify which environment ran the attempt before re-checking this map.
async function loadOutboundAdapter(functionName: string): Promise<any | null> {
  if (builtInOutboundAdapters[functionName]) {
    return builtInOutboundAdapters[functionName]
  }
  // Dynamic adapter loading removed: caller-chosen module names are an
  // arbitrary-code-execution surface. Custom adapters must be registered in
  // the built-in map.
  return null
}

const integrationOutbound = createHandler(execute)
export const handler = integrationOutbound

