/**
 * @module   security
 * @audience internal
 * @layer    security
 * @stability experimental
 *
 * System-admin security operations: flagged-actor report, three-layer
 * ban (internal blocklist + Supabase Auth ban + Netlify edge deny rule),
 * unban, and blocklist CRUD. INVARIANT: every action requires a
 * system-admin principal; the Netlify edge layer degrades gracefully
 * when NETLIFY_ACCESS_TOKEN / NETLIFY_SITE_ID are unset (local dev).
 *
 * @seeAlso .framework/functions/_shared/security.ts (enforcement helpers)
 * @seeAlso .framework/migrations/049_security_blocklist.sql (schema)
 *
 * @cil-generated
 */
// Edge rule is a single shared deny rule whose data.addresses array is mutated — preserves user-managed geo rules and stays within tight free-tier rule limits; all edge calls skip silently without NETLIFY_ACCESS_TOKEN/SITE_ID

import { createHandler, requireSystemContextWithAudit } from './_shared/middleware'
import type { RequestContext } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitAudit } from './_shared/audit'

// PUT replaces the entire ruleset, so the full published rule list is round-tripped; concurrent edits could still race — acceptable at admin-action frequency
const MANAGED_RULE_DESC = 'spine-security:blocklist'
const NETLIFY_API = 'https://api.netlify.com'

async function netlifyEdgeSync(ipsToAdd: string[], ipsToRemove: string[] = []): Promise<{ synced: boolean; skipped?: boolean; error?: string }> {
  const token = process.env.NETLIFY_ACCESS_TOKEN
  const siteId = process.env.NETLIFY_SITE_ID
  if (!token || !siteId) return { synced: false, skipped: true }
  const ips = [...new Set([...ipsToAdd, ...ipsToRemove].filter(Boolean))]
  if (!ips.length) return { synced: false, skipped: true }

  try {
    const base = `${NETLIFY_API}/api/v1/sites/${siteId}/firewall_rule_set`
    const getRes = await fetch(base, { headers: { Authorization: `Bearer ${token}` } })
    if (!getRes.ok) return { synced: false, error: `Netlify GET ${getRes.status}` }
    const payload = await getRes.json().catch(() => ({}))
    const ruleset = payload?.published ?? payload ?? { default: 'allow', rules: [] }
    const rules: any[] = Array.isArray(ruleset.rules) ? ruleset.rules : []

    const managedIdx = rules.findIndex(
      (r) => r?.type === 'ip' && r?.action === 'deny' && String(r?.description || '').startsWith(MANAGED_RULE_DESC)
    )

    let addresses: string[] = managedIdx >= 0
      ? [...(rules[managedIdx]?.data?.addresses || [])]
      : []

    for (const ip of ipsToAdd) if (ip && !addresses.includes(ip)) addresses.push(ip)
    addresses = addresses.filter((a) => !ipsToRemove.includes(a))

    if (managedIdx >= 0) {
      if (addresses.length) {
        rules[managedIdx] = { ...rules[managedIdx], data: { ...rules[managedIdx].data, addresses } }
      } else {
        rules.splice(managedIdx, 1)
      }
    } else if (addresses.length) {
      rules.push({
        type: 'ip',
        action: 'deny',
        data: { addresses },
        description: `${MANAGED_RULE_DESC} — managed by Spine security admin`,
      })
    }

    const putRes = await fetch(base, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ default: ruleset.default || 'allow', rules }),
    })
    if (!putRes.ok) return { synced: false, error: `Netlify PUT ${putRes.status}` }
    return { synced: true }
  } catch (err: any) {
    return { synced: false, error: err?.message || 'Netlify sync failed' }
  }
}

// IP shown comes from the person's registration_ip/last_ip (trusted edge capture), not spoofable request data; started_at lower bound keeps the span_name scan index-bounded (no span_name index, and zero-signal scans would otherwise walk the whole logs table)
const SECURITY_SIGNALS = [
  'security.rate_limit_exceeded',
  'security.injection_detected',
  'security.registration_blocked',
]

async function flaggedAccounts(ctx: RequestContext) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: events, error } = await adminDb
    .from('logs')
    .select('account_id, started_at, metadata')
    .in('span_name', SECURITY_SIGNALS)
    .gte('started_at', since)
    .order('started_at', { ascending: false })
    .limit(500)
  if (error) {
    console.warn('flaggedAccounts query failed (missing logs?):', error.message)
    return { rows: [] }
  }

  // Bucket by acting principal id, falling back to account id for
  // anonymous signals (e.g. registration_blocked carries no person).
  const buckets = new Map<string, {
    person_id: string | null
    account_id: string | null
    signals: number
    kinds: Set<string>
    patterns: Set<string>
    last_seen_at: string | null
  }>()

  for (const ev of events || []) {
    const meta = ev.metadata || {}
    const pid = meta.principal?.id && meta.principal.id !== 'anonymous' ? meta.principal.id : null
    const key = pid || `acct:${ev.account_id || meta.target?.account_id || 'unknown'}`
    const b = buckets.get(key) || {
      person_id: pid,
      account_id: ev.account_id || meta.target?.account_id || null,
      signals: 0,
      kinds: new Set<string>(),
      patterns: new Set<string>(),
      last_seen_at: null,
    }
    b.signals += 1
    if (meta.action) b.kinds.add(String(meta.action).replace('security.', ''))
    if (meta.pattern) b.patterns.add(String(meta.pattern))
    if (!b.last_seen_at || ev.started_at > b.last_seen_at) b.last_seen_at = ev.started_at
    buckets.set(key, b)
  }

  const personIds = [...buckets.values()].map(b => b.person_id).filter(Boolean) as string[]
  const accountIds = [...new Set([...buckets.values()].map(b => b.account_id).filter(Boolean))] as string[]

  const [{ data: people }, { data: accounts }, { data: bl }] = await Promise.all([
    personIds.length
      ? adminDb.from('people').select('id, email, account_id, auth_uid, status, data').in('id', personIds)
      : Promise.resolve({ data: [] as any[] }),
    accountIds.length
      ? adminDb.from('accounts').select('id, slug, display_name').in('id', accountIds)
      : Promise.resolve({ data: [] as any[] }),
    adminDb.from('security_blocklist').select('type, value').is('revoked_at', null).or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`),
  ])

  const personById = new Map((people || []).map((p: any) => [p.id, p]))
  const accountById = new Map((accounts || []).map((a: any) => [a.id, a]))
  const activeBlocks = new Set((bl || []).map((r: any) => `${r.type}:${r.value}`))

  const rows = [...buckets.values()].map((b) => {
    const p = b.person_id ? personById.get(b.person_id) : null
    const acctId = b.account_id || p?.account_id || null
    const acct = acctId ? accountById.get(acctId) : null
    const email = p?.email || null
    const ip = p?.data?.last_ip || p?.data?.registration_ip || null
    const banned = !!(
      (p && activeBlocks.has(`person_id:${p.id}`)) ||
      (email && activeBlocks.has(`email:${String(email).toLowerCase()}`)) ||
      (ip && activeBlocks.has(`ip:${ip}`)) ||
      (acctId && activeBlocks.has(`account_id:${acctId}`))
    )
    return {
      person_id: b.person_id,
      email,
      account_id: acctId,
      account_name: acct?.display_name || acct?.slug || null,
      last_ip: ip,
      last_country: p?.data?.last_country || p?.data?.registration_country || null,
      person_status: p?.status || null,
      signals: b.signals,
      kinds: [...b.kinds],
      patterns: [...b.patterns],
      last_seen_at: b.last_seen_at,
      banned,
    }
  })

  rows.sort((a, b) => b.signals - a.signals)
  return { rows }
}

async function addBlockRows(
  rows: Array<{ type: string; value: string }>,
  bannedBy: string | undefined,
  reason?: string,
): Promise<void> {
  const clean = rows.filter(r => r.value)
  if (!clean.length) return
  const { error } = await adminDb
    .from('security_blocklist')
    .upsert(
      clean.map(r => ({
        type: r.type,
        value: r.value,
        severity: 'hard',
        reason: reason || null,
        banned_by: bannedBy || null,
        revoked_at: null,
        expires_at: null,
      })),
      { onConflict: 'type,value' }
    )
  if (error) throw new Error('security_blocklist upsert failed: ' + error.message)
}

// Internal blocklist is authoritative and must succeed; auth/edge failures are recorded in the audit event and returned, not thrown — a ban must never half-apply silently
async function banUser(ctx: RequestContext, body: any) {
  const { person_id, email: rawEmail, ip: rawIp, reason, block_ip = true, block_email = true } = body || {}
  if (!person_id && !rawEmail && !rawIp) {
    throw new Error('person_id, email, or ip is required')
  }

  let person: any = null
  if (person_id) {
    const { data } = await adminDb
      .from('people')
      .select('id, email, account_id, auth_uid, status, data')
      .eq('id', person_id)
      .maybeSingle()
    if (!data) throw new Error(`Person not found: ${person_id}`)
    person = data
  } else if (rawEmail) {
    const { data } = await adminDb
      .from('people')
      .select('id, email, account_id, auth_uid, status, data')
      .eq('email', String(rawEmail).toLowerCase())
      .maybeSingle()
    person = data // may be null — banning a bare email is still valid
  }

  const email = (person?.email || rawEmail || '').toLowerCase() || null
  const ip = person?.data?.last_ip || person?.data?.registration_ip || rawIp || null

  const layers: Record<string, any> = { blocklist: 'pending', auth: 'skipped', edge: 'skipped' }

  // Layer 1 (authoritative): internal blocklist rows.
  const rows: Array<{ type: string; value: string }> = []
  if (person?.id) rows.push({ type: 'person_id', value: person.id })
  if (person?.account_id) rows.push({ type: 'account_id', value: person.account_id })
  if (email && block_email) rows.push({ type: 'email', value: email })
  if (ip && block_ip) rows.push({ type: 'ip', value: ip })
  await addBlockRows(rows, ctx.principal?.id, reason)
  layers.blocklist = 'applied'

  // Layer 2: Supabase Auth ban — ~100y duration is effectively permanent.
  if (person?.auth_uid) {
    const { error: authErr } = await adminDb.auth.admin.updateUserById(person.auth_uid, {
      ban_duration: '876600h',
    })
    layers.auth = authErr ? `error: ${authErr.message}` : 'applied'
  }

  // Layer 3: Netlify edge IP deny rule.
  if (ip && block_ip) {
    const edge = await netlifyEdgeSync([ip])
    layers.edge = edge.synced ? 'applied' : edge.skipped ? 'skipped' : `error: ${edge.error}`
  }

  await emitAudit(ctx, 'security.user_banned', { type: 'person', id: person?.id, account_id: person?.account_id }, {
    result: 'success',
    target_email: email,
    target_ip: ip,
    reason: reason || null,
    layers,
  })

  return { ok: true, person_id: person?.id || null, email, ip, layers }
}

async function unbanUser(ctx: RequestContext, body: any) {
  const { person_id } = body || {}
  if (!person_id) throw new Error('person_id is required')

  const { data: person } = await adminDb
    .from('people')
    .select('id, email, account_id, auth_uid, data')
    .eq('id', person_id)
    .maybeSingle()
  if (!person) throw new Error(`Person not found: ${person_id}`)

  const email = (person.email || '').toLowerCase()
  const ip = person.data?.last_ip || person.data?.registration_ip || null

  const pairs: Array<{ type: string; value: string }> = [
    { type: 'person_id', value: person.id },
  ]
  if (email) pairs.push({ type: 'email', value: email })
  if (ip) pairs.push({ type: 'ip', value: ip })

  const or = pairs.map(p => `and(type.eq.${p.type},value.eq.${p.value})`).join(',')
  const { data: revoked } = await adminDb
    .from('security_blocklist')
    .update({ revoked_at: new Date().toISOString() })
    .is('revoked_at', null)
    .or(or)
    .select('id')

  const layers: Record<string, any> = { blocklist: `revoked ${revoked?.length || 0}`, auth: 'skipped', edge: 'skipped' }

  if (person.auth_uid) {
    const { error: authErr } = await adminDb.auth.admin.updateUserById(person.auth_uid, {
      ban_duration: 'none',
    })
    layers.auth = authErr ? `error: ${authErr.message}` : 'applied'
  }

  if (ip) {
    const edge = await netlifyEdgeSync([], [ip])
    layers.edge = edge.synced ? 'applied' : edge.skipped ? 'skipped' : `error: ${edge.error}`
  }

  await emitAudit(ctx, 'security.user_unbanned', { type: 'person', id: person.id, account_id: person.account_id }, {
    result: 'success',
    target_email: email,
    layers,
  })

  return { ok: true, person_id: person.id, layers }
}

async function listBlocklist() {
  const { data, error } = await adminDb
    .from('security_blocklist')
    .select('id, type, value, severity, reason, banned_by, expires_at, revoked_at, created_at')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) throw new Error('blocklist read failed: ' + error.message)
  return { rows: data || [] }
}

async function blocklistAdd(ctx: RequestContext, body: any) {
  const { type, value, severity = 'hard', reason, expires_at } = body || {}
  if (!type || !value) throw new Error('type and value are required')
  if (!['ip', 'email', 'email_domain', 'person_id', 'account_id'].includes(type)) {
    throw new Error(`invalid type: ${type}`)
  }
  const normalized = type === 'email' || type === 'email_domain' ? String(value).toLowerCase() : String(value)

  const { error } = await adminDb
    .from('security_blocklist')
    .upsert({
      type, value: normalized, severity, reason: reason || null,
      banned_by: ctx.principal?.id || null,
      expires_at: expires_at || null,
      revoked_at: null,
    }, { onConflict: 'type,value' })
  if (error) throw new Error('blocklist write failed: ' + error.message)

  const edge = type === 'ip' ? await netlifyEdgeSync([normalized]) : { synced: false, skipped: true }
  await emitAudit(ctx, 'security.blocklist_add', { type: 'security_blocklist' }, {
    result: 'success', block_type: type, value: normalized, severity,
    edge: edge.synced ? 'applied' : edge.skipped ? 'skipped' : `error: ${edge.error}`,
  })
  return { ok: true }
}

async function blocklistRevoke(ctx: RequestContext, body: any) {
  const { id, type, value } = body || {}
  if (!id && !(type && value)) throw new Error('id or (type, value) is required')

  let query = adminDb
    .from('security_blocklist')
    .update({ revoked_at: new Date().toISOString() })
    .is('revoked_at', null)
    .select('id, type, value')
  query = id ? query.eq('id', id) : query.eq('type', type).eq('value', String(value).toLowerCase())
  const { data: revoked, error } = await query
  if (error) throw new Error('blocklist revoke failed: ' + error.message)

  const ip = (revoked || []).find((r: any) => r.type === 'ip')?.value
  const edge = ip ? await netlifyEdgeSync([], [ip]) : { synced: false, skipped: true }
  await emitAudit(ctx, 'security.blocklist_revoked', { type: 'security_blocklist', id }, {
    result: 'success', revoked: revoked?.length || 0,
    edge: edge.synced ? 'applied' : edge.skipped ? 'skipped' : `error: ${edge.error}`,
  })
  return { ok: true, revoked: revoked?.length || 0 }
}

export const handler = createHandler(async (ctx, body) => {
  // Throws a statusCode-carrying error on denial; createHandler maps it to a
  // real HTTP 401/403 (F-051).
  requireSystemContextWithAudit(ctx, 'security_admin')

  const action = (ctx.query?.action as string) || (body?.action as string) || ''
  switch (action) {
    case 'flagged_accounts': return flaggedAccounts(ctx)
    case 'ban_user':         return banUser(ctx, body)
    case 'unban_user':       return unbanUser(ctx, body)
    case 'blocklist':        return listBlocklist()
    case 'blocklist_add':    return blocklistAdd(ctx, body)
    case 'blocklist_revoke': return blocklistRevoke(ctx, body)
    default: {
      const e: any = new Error(`Unknown security action: ${action}`)
      e.statusCode = 400
      throw e
    }
  }
})

