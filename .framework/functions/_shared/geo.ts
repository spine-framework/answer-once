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
// Log-and-allow: geo is a signal, never a gate — missing headers yield undefined, callers decide policy

import type { RequestContext } from './middleware'

/**
 * ClientGeo represents geographical information about a client, including their country code and IP address. It is used to provide location-based services and analytics.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
export type ClientGeo = {
  /** ISO 3166-1 alpha-2 country code, lowercase (e.g. 'us', 'ca'). Undefined when unavailable. */
  country?: string
  /** Client IP address. Undefined when unavailable. */
  ip?: string
}

function firstValidIp(v: string | undefined): string | undefined {
  if (!v) return undefined
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(v) || (v.includes(':') && /^[0-9a-fA-F:]{3,}$/.test(v))) return v
  return undefined
}

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
