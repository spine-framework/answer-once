

import { adminDb } from './db'
import { SYSTEM_PRINCIPAL } from './principal'
import { execute as executeOutbound } from '../integration-outbound'



interface RetrySummary {
  outbound_retried: number
  outbound_succeeded: number
  outbound_failed: number
  inbound_retried: number
  inbound_succeeded: number
  inbound_failed: number
  errors: string[]
}


// New outbound deliveries insert as status='pending' with next_attempt_at=null, which satisfies this sweep's filter immediately — any other deployment sharing the DB (e.g. a stale Netlify site running trigger-scheduler with older code) can consume and poison a delivery before or instead of the originating pipeline. When debugging 'adapter not found' or unexpected retry errors, first identify which environment executed the attempt.

export async function retryPendingDeliveries(ctx: any): Promise<RetrySummary> {
  const summary: RetrySummary = {
    outbound_retried: 0,
    outbound_succeeded: 0,
    outbound_failed: 0,
    inbound_retried: 0,
    inbound_succeeded: 0,
    inbound_failed: 0,
    errors: []
  }

  const now = new Date().toISOString()

  const { data: dueDeliveries, error } = await adminDb
    .from('webhook_deliveries')
    .select('*')
    .eq('status', 'pending')
    .lt('attempt_count', 10)
    .or(`next_attempt_at.is.null,next_attempt_at.lte.${now}`)
    .limit(100)

  if (error) {
    console.error('[retry-deliveries] Failed to fetch pending deliveries:', error)
    summary.errors.push(error.message)
    return summary
  }

  if (!dueDeliveries || dueDeliveries.length === 0) {
    return summary
  }

  const retryCtx = {
    ...ctx,
    db: adminDb,
    accountId: null,
    appId: null,
    principal: SYSTEM_PRINCIPAL,
    query: {}
  }

  for (const delivery of dueDeliveries) {
    try {
      if (delivery.direction === 'outbound') {
        summary.outbound_retried++

        retryCtx.accountId = delivery.account_id

        await executeOutbound(retryCtx, { delivery_id: delivery.id })

        summary.outbound_succeeded++
      } else {
        // Inbound retry: not yet implemented. Reprocessing requires the
        // original x-api-key or an internal bypass; integration-routes
        // must be updated to accept delivery_id.
        summary.inbound_retried++
        console.warn(`[retry-deliveries] Inbound delivery retry not implemented: ${delivery.id}`)
        summary.inbound_failed++
      }
    } catch (err: any) {
      console.error(`[retry-deliveries] Delivery ${delivery.id} failed:`, err)
      summary.errors.push(`${delivery.id}: ${err.message || String(err)}`)

      if (delivery.direction === 'outbound') {
        summary.outbound_failed++
      } else {
        summary.inbound_failed++
      }
    }
  }

  return summary
}

