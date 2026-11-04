/**
 * @module   functions/_shared
 * @audience internal
 * @layer    geo
 * @stability stable
 *
 * Best-effort client geo/IP extraction from request headers
 *
 * @seeAlso .framework/functions/_shared/middleware.ts (provides RequestContext type)
 * @seeAlso .framework/functions/_shared/funnel.ts (related functionality for handling requests)
 *
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/geo.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/geo.ts"]
// CIL[DOC-MACRO purpose="Best-effort client geo/IP extraction from request headers"]
// CIL[DOC-RESPONSIBILITY responsibility="Parse Netlify/CDN geo headers and client IP from ctx.headers for logging and policy decisions"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="geo" related_files=".framework/functions/_shared/middleware.ts,.framework/functions/_shared/funnel.ts"]
// CIL[DOC-CONTRACT inputs="RequestContext with headers" outputs="{ country, ip } — both optional, 'unknown' never thrown" errors="never throws" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Check x-nf-geo JSON (Netlify), then CDN fallbacks (cf-ipcountry, x-country, x-vercel-ip-country); IP from x-nf-client-connection-ip then first x-forwarded-for hop" notable_decisions="Log-and-allow: geo is a signal, never a gate — missing headers yield undefined, callers decide policy"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-VECTOR type="context" content="purpose='Best-effort client geo/IP extraction from request headers'; No verified external callers; imports: .framework/functions/_shared/middleware.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Never blocks; headers absent in local dev yield undefined"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

import type { RequestContext } from './middleware'
// CIL[END stable_id="~/.framework/functions/_shared/geo.ts:module_header:module_header"]

// CIL[DOC-MACRO purpose="ClientGeo represents geographical information about a client, including their country code and IP address."]
// CIL[DOC-RESPONSIBILITY responsibility="ClientGeo represents geographical information about a client, including their country code and IP address. It is used to provide location-based services and analytics."]
// CIL[DOC-CONTEXT module="geo" layer="app-specific" related_files=".framework/functions/_shared/middleware"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="ClientGeo represents geographical information about a client, including their country code and IP address. It is used to provide location-based services and analytics." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * ClientGeo represents geographical information about a client, including their country code and IP address. It is used to provide location-based services and analytics.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/geo.ts:clientgeo:type" type="type" identity="ClientGeo" parent="~/.framework/functions/_shared/geo.ts"]
// CIL[DOC-MACRO purpose="ClientGeo type"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the ClientGeo type."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/geo.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the ClientGeo type." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export type ClientGeo = {
  /** ISO 3166-1 alpha-2 country code, lowercase (e.g. 'us', 'ca'). Undefined when unavailable. */
  country?: string
  /** Client IP address. Undefined when unavailable. */
  ip?: string
}
// CIL[END stable_id="~/.framework/functions/_shared/geo.ts:clientgeo:type"]
// CIL[DOC-VECTOR type="context" content="purpose='ClientGeo represents geographical information about a client, including their country code and IP address.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/geo.ts:firstValidIp:function" type="function" identity="firstValidIp" parent="~/.framework/functions/_shared/geo.ts"]
// CIL[DOC-MACRO purpose="Accept only well-formed IP literals from client-controlled headers"]
// CIL[DOC-RESPONSIBILITY responsibility="Reject spoofed/garbage x-forwarded-for values before they land in geo/rate-limit state"]
// CIL[DOC-CONTRACT inputs="candidate string" outputs="string|undefined" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="IPv4 dotted-quad, or hex+colon IPv6 (a colon is required so plain hex words like 'dead' don't pass)" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="stable"]
function firstValidIp(v: string | undefined): string | undefined {
  if (!v) return undefined
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(v) || (v.includes(':') && /^[0-9a-fA-F:]{3,}$/.test(v))) return v
  return undefined
}
// CIL[END stable_id="~/.framework/functions/_shared/geo.ts:firstValidIp:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/geo.ts:getclientgeo:function" type="function" identity="getClientGeo" parent="~/.framework/functions/_shared/geo.ts"]
// CIL[DOC-MACRO purpose="Extract client country and IP from request headers"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements getClientGeo"]
// CIL[DOC-CONTRACT inputs="RequestContext" outputs="ClientGeo" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Parses x-nf-geo JSON for country.code, falls back to flat country headers, then resolves IP from Netlify or forwarded-for headers" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="stable"]
export function getClientGeo(ctx: RequestContext): ClientGeo {
  const headers = ctx.headers || {}
  let country: string | undefined

  const nfGeo = headers['x-nf-geo']
  if (nfGeo) {
    try {
      const parsed = JSON.parse(nfGeo)
      const code = parsed?.country?.code
      if (typeof code === 'string' && code) country = code.toLowerCase()
    } catch { /* non-JSON header, ignore */ }
  }

  if (!country) {
    const flat =
      headers['cf-ipcountry'] ||
      headers['x-country'] ||
      headers['x-country-code'] ||
      headers['x-vercel-ip-country']
    if (typeof flat === 'string' && /^[a-zA-Z]{2}$/.test(flat)) {
      country = flat.toLowerCase()
    }
  }

  const ip =
    headers['x-nf-client-connection-ip'] ||
    firstValidIp((headers['x-forwarded-for'] || '').split(',')[0].trim()) ||
    undefined

  return { country, ip }
}
// CIL[END stable_id="~/.framework/functions/_shared/geo.ts:getclientgeo:function"]
