// CIL[BEGIN stable_id="~/custom/apps/answer-once/functions/custom_answeronce-autoresolve-cron.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Scheduled Netlify function that auto-resolves stale Answer Once pending_resolution tickets"]
// CIL[DOC-RESPONSIBILITY responsibility="Run the cross-account pending-resolution sweep on a Netlify schedule using an internal machine principal"]
// CIL[DOC-CONTEXT module="custom_answeronce-autoresolve-cron" layer="functions" related_files="custom/apps/answer-once/functions/custom_answeronce-journey.ts, netlify.toml, custom/apps/answer-once/pages/company/TicketsPage.tsx"]
// CIL[DOC-CONTRACT inputs="scheduled invocation" outputs="none — logs sweep result" errors="logged and rethrown" side_effects="items updates + courtesy messages via autoResolvePending"]
// CIL[DOC-MICRO logic_summary="Scheduled functions carry no auth headers so createHandler would 401; this builds a SYSTEM_PRINCIPAL ctx and calls autoResolvePending directly. Netlify blocks public HTTP on scheduled functions in production so the scheduler itself is the trust boundary." notable_decisions="not routed through system-cron schedules/actions tables — those are account-scoped and executeAction cannot call app functions; the sweep itself is already cross-account via adminDb"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="answer-once developers and framework maintainers"]
import { randomUUID } from 'crypto'
import { SYSTEM_PRINCIPAL } from './_shared/principal'
import { adminDb } from './_shared/db'
import { autoResolvePending } from './custom_answeronce-journey'
// CIL[END stable_id="~/custom/apps/answer-once/functions/custom_answeronce-autoresolve-cron.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/functions/custom_answeronce-autoresolve-cron.ts:handler:function" type="function" identity="handler" parent="~/custom/apps/answer-once/functions/custom_answeronce-autoresolve-cron.ts"]
// CIL[DOC-MACRO purpose="Netlify scheduled-function entry point for the Answer Once auto-resolve sweep"]
// CIL[DOC-RESPONSIBILITY responsibility="Invoke autoResolvePending with a synthetic internal machine ctx and log the outcome"]
// CIL[DOC-CONTEXT module="custom_answeronce-autoresolve-cron" layer="functions" related_files="custom/apps/answer-once/functions/custom_answeronce-journey.ts"]
// CIL[DOC-CONTRACT inputs="none (Netlify scheduler event ignored)" outputs="void" errors="rethrows sweep failures so Netlify records the run as failed" side_effects="autoResolvePending updates items + writes courtesy messages"]
// CIL[DOC-MICRO logic_summary="Fabricate a cron-provenance SYSTEM_PRINCIPAL ctx, run the sweep, console.log the result; throws on failure so the scheduled run is marked failed" notable_decisions="the once-a-day lazy sweep on the company tickets page remains the fallback if cron never fires"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers,operators"]
export const handler = async () => {
  const ctx = {
    requestId: randomUUID(),
    principal: {
      ...SYSTEM_PRINCIPAL,
      provenance: { sourceType: 'cron', createdBy: null, invokedAt: new Date().toISOString() },
    },
    db: adminDb,
    accountId: null,
    appId: null,
    query: {},
    requestPath: '/.netlify/functions/custom_answeronce-autoresolve-cron',
    headers: {},
    source: 'cron',
  }
  try {
    const result = await autoResolvePending(ctx, {})
    console.log('[answeronce-autoresolve]', JSON.stringify(result))
  } catch (err) {
    console.error('[answeronce-autoresolve] sweep failed:', err)
    throw err
  }
}
// CIL[END stable_id="~/custom/apps/answer-once/functions/custom_answeronce-autoresolve-cron.ts:handler:function"]
