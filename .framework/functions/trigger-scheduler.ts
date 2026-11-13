// x-netlify-event is the production canonical header (NFEvent in @netlify/serverless-functions-api); x-nf-event is the CLI emulation header. Both must be accepted or every scheduled tick 401s in production. Netlify Clockwork UA is a third indicator used only when neither header is present.
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
  // SYSTEM_PRINCIPAL where Netlify's platform guarantees scheduled functions
  // can't be invoked by URL. Detect that by Netlify's injected runtime vars
  // (SITE_ID/URL/DEPLOY_URL always exist in function runtime) or an explicit
  // SPINE_TRUST_SCHEDULE_HEADERS override for trusted non-Netlify setups.
  // build.environment vars do NOT reach function runtime — do not rely on them.
  const env = (k: string) =>
    (globalThis as any).process?.env?.[k] ??
    (globalThis as any).Deno?.env?.get?.(k)
  const override = env('SPINE_TRUST_SCHEDULE_HEADERS')
  const onNetlify = Boolean(env('SITE_ID') || env('URL') || env('DEPLOY_URL'))
  if (override !== '1' && override !== 'true' && !onNetlify) return false

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
