// CIL[BEGIN stable_id="~/.framework/functions/trigger-scheduler.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/trigger-scheduler.ts"]
// CIL[DOC-MACRO purpose="Scheduled entry point that invokes the shared system-cron runner so Netlify's every-minute trigger dispatches due scheduled actions."]
// CIL[DOC-RESPONSIBILITY responsibility="Detect Netlify Clockwork scheduled invocations (which carry no credentials) and run system-cron under the system principal; forward everything else to system-cron's normal middleware auth."]
// CIL[DOC-CONTEXT module="trigger-scheduler" layer="functions" related_files=".framework/functions/system-cron.ts, .framework/functions/_shared/principal.ts, .framework/functions/_shared/db.ts, netlify.toml"]
// CIL[DOC-CONTRACT inputs="Netlify scheduled invocation (x-nf-event/x-netlify-event: schedule OR Netlify Clockwork UA, + {\"next_run\"} body) or authenticated HTTP request" outputs="system-cron sweep result" errors="401 for unauthenticated HTTP requests" side_effects="runs due schedule actions across accounts"]
// CIL[DOC-MICRO logic_summary="Netlify's scheduler invokes this function directly. The header name differs between environments: CLI emulation sends X-NF-Event; production sends x-netlify-event (canonical constant in @netlify/serverless-functions-api). Both are accepted, as is the Netlify Clockwork user-agent, so detection is robust across all invocation paths. The body must contain next_run as a string for both headers. For that path a RequestContext is fabricated with SYSTEM_PRINCIPAL and passed straight into system-cron's handler. Non-scheduled requests fall through to system-cron's createHandler." notable_decisions="x-netlify-event is the production canonical header (NFEvent in @netlify/serverless-functions-api); x-nf-event is the CLI emulation header. Both must be accepted or every scheduled tick 401s in production. Netlify Clockwork UA is a third indicator used only when neither header is present."]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="framework maintainers"]
import { handler as cronHandler } from './system-cron'
import { SYSTEM_PRINCIPAL } from './_shared/principal'
import { adminDb } from './_shared/db'

// Netlify Clockwork invocation detection. Require BOTH a recognised indicator
// AND the {"next_run": "..."} body shape so a bare spoofed header or UA alone
// cannot authenticate.
//
// Header variants (both must be handled):
//   - x-nf-event: schedule   — Netlify CLI emulation (ntl dev / functions:invoke)
//   - x-netlify-event: schedule — production canonical header
//     (@netlify/serverless-functions-api NFEvent = "x-netlify-event")
//
// Fallback: user-agent "Netlify Clockwork" is accepted when neither header is
// present, to guard against future header renames.
function isNetlifyScheduledInvocation(event: any): boolean {
  // Header+body signals are all client-controlled — they only get to mint a
  // SYSTEM_PRINCIPAL on hosts where we explicitly trust Netlify's platform
  // guarantee that scheduled functions can't be invoked by URL. Everywhere
  // else the check falls through to the normal middleware auth path.
  const trusted = (globalThis as any).process?.env?.SPINE_TRUST_SCHEDULE_HEADERS ||
    (globalThis as any).Deno?.env?.get?.('SPINE_TRUST_SCHEDULE_HEADERS')
  if (trusted !== '1' && trusted !== 'true') return false

  const headers = event.headers || {}

  const nfEvent =
    headers['x-netlify-event'] || headers['X-Netlify-Event'] ||
    headers['x-nf-event']      || headers['X-NF-Event']

  const ua = headers['user-agent'] || headers['User-Agent'] || ''

  const hasScheduleIndicator =
    nfEvent === 'schedule' || ua.includes('Netlify Clockwork')

  if (!hasScheduleIndicator) return false

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    return typeof body?.next_run === 'string'
  } catch {
    return false
  }
}

export const handler = async (event: any, context: any) => {
  if (!isNetlifyScheduledInvocation(event)) {
    // Not a Clockwork invocation — run the normal middleware auth path.
    // x-internal-secret resolves to SYSTEM_PRINCIPAL; ?api_key= is checked
    // inside the cron handler; anything else 401s.
    return cronHandler(event, context)
  }

  // Fabricate a RequestContext carrying the system principal. createHandler
  // short-circuits when event.requestId + event.principal are present, so
  // this flows straight into the cron handler without re-resolving auth.
  const ctx = {
    requestId: crypto.randomUUID(),
    principal: SYSTEM_PRINCIPAL,
    db: adminDb,
    accountId: null,
    appId: null,
    query: {},
    requestPath: event.path || '/.netlify/functions/trigger-scheduler',
    headers: {},
    source: 'netlify-scheduler',
  }
  return cronHandler(ctx, context)
}
// CIL[END stable_id="~/.framework/functions/trigger-scheduler.ts:module_header:module_header"]
