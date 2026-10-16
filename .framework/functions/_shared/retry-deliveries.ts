// CIL[BEGIN stable_id="~/.framework/functions/_shared/retry-deliveries.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/retry-deliveries.ts"]
// CIL[DOC-MACRO purpose="Provides shared retry logic for pending webhook deliveries"]
// CIL[DOC-RESPONSIBILITY responsibility="Coordinate delivery retry scheduling and summarize results"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="function" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports dependencies for webhook delivery retry handling" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]


import { adminDb } from './db'
import { SYSTEM_PRINCIPAL } from './principal'
import { execute as executeOutbound } from '../integration-outbound'
// CIL[DOC-VECTOR type="context" content="purpose='Provides shared retry logic for pending webhook deliveries'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/retry-deliveries.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/retry-deliveries.ts:RetrySummary:interface" type="interface" identity="RetrySummary" parent="~/.framework/functions/_shared/retry-deliveries.ts"]
// CIL[DOC-MACRO purpose="Defines the shape of retry operation summary statistics"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare counts and errors returned after retrying deliveries"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="function" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/retry-deliveries.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Aggregates counts of retried, succeeded, and failed deliveries with a list of errors" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface RetrySummary {
  outbound_retried: number
  outbound_succeeded: number
  outbound_failed: number
  inbound_retried: number
  inbound_succeeded: number
  inbound_failed: number
  errors: string[]
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the shape of retry operation summary statistics'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/retry-deliveries.ts:RetrySummary:interface"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/retry-deliveries.ts:retryPendingDeliveries:function" type="function" identity="retryPendingDeliveries" parent="~/.framework/functions/_shared/retry-deliveries.ts"]
// CIL[DOC-MACRO purpose="Retries pending webhook deliveries due for a new attempt and returns a summary"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch due deliveries, call outbound retry handler, tally results, log failures"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="function" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts,.framework/functions/_shared/retry-deliveries.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-CONTRACT inputs="ctx: any" outputs="Promise<RetrySummary>" errors="db query errors, delivery execution errors" side_effects="Calls executeOutbound, updates console logs"]
// CIL[DOC-MICRO logic_summary="Queries webhook_deliveries table for pending due rows, invokes executeOutbound for outbound deliveries, counts successes/failures, and returns a RetrySummary" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

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
// CIL[DOC-VECTOR type="context" content="purpose='Retries pending webhook deliveries due for a new attempt and returns a summary'; No verified external callers; imports: .framework/functions/_shared/db.ts,.framework/functions/_shared/principal.ts,.framework/functions/integration-outbound.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/retry-deliveries.ts:retryPendingDeliveries:function"]

