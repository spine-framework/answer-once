import { describe, it, expect, vi } from 'vitest'

// F-051: requireSystemContextWithAudit's ctx overload used to return a
// Netlify response object on denial; handlers returned it as `result`, so
// createHandler wrapped it as {data:{statusCode:403}} under HTTP 200. It now
// throws a statusCode-carrying error which the catch path maps to a real
// HTTP status. These tests exercise the real createHandler end-to-end for
// security.ts and tests.ts.

const principalRef = vi.hoisted(() => ({ principal: null as any }))

vi.mock('../../functions/_shared/principal.ts', () => ({
  resolvePrincipal: vi.fn(async () => principalRef.principal),
  isSystemAdmin: (p: any) =>
    !!p?.roles?.some((r: any) => r === 'system_admin' || r?.slug === 'system_admin'),
  getPrincipalDb: () => ({}),
}))

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: {
    from: () => {
      const builder: any = {}
      for (const m of [
        'select', 'eq', 'in', 'is', 'ilike', 'filter', 'not', 'order', 'limit',
        'update', 'insert', 'upsert', 'delete', 'neq', 'or', 'contains', 'gte',
        'lte', 'lt', 'range', 'textSearch',
      ]) {
        builder[m] = () => builder
      }
      builder.single = () => Promise.resolve({ data: null, error: null })
      builder.maybeSingle = () => Promise.resolve({ data: null, error: null })
      builder.then = (res: any, rej: any) =>
        Promise.resolve({ data: [], error: null }).then(res, rej)
      return builder
    },
    rpc: vi.fn(async () => ({ data: null, error: null })),
    auth: { admin: {} },
  },
  getUserDb: vi.fn(() => ({})),
}))

vi.mock('../../functions/_shared/audit.ts', () => ({
  emitAudit: vi.fn(async () => {}),
  emitSpan: vi.fn(async () => {}),
  emitLog: vi.fn(async () => {}),
  emitActivity: vi.fn(async () => {}),
}))

vi.mock('../../functions/_shared/security.ts', () => ({
  isBlockedRequest: vi.fn(async () => null),
  isBlockedIp: vi.fn(async () => false),
  touchPersonGeo: vi.fn(async () => {}),
}))

vi.mock('../../functions/_shared/geo.ts', () => ({
  getClientGeo: vi.fn(() => ({ ip: '127.0.0.1' })),
}))

import { requireSystemContextWithAudit } from '../../functions/_shared/middleware'
import { handler as securityHandler } from '../../functions/security'
import { handler as testsHandler } from '../../functions/tests'

const memberPrincipal = {
  id: 'p-member',
  type: 'human',
  accountId: 'acct-1',
  roles: ['member'],
  provenance: { sourceType: 'jwt', createdBy: null, invokedAt: new Date().toISOString() },
}

const adminPrincipal = {
  ...memberPrincipal,
  id: 'p-admin',
  roles: ['system_admin'],
}

const event = (queryStringParameters: Record<string, string> = {}) => ({
  headers: {},
  httpMethod: 'GET',
  path: '/api/x',
  queryStringParameters,
  body: null,
})

describe('requireSystemContextWithAudit ctx overload (F-051)', () => {
  it('throws a statusCode 403 error for a non-admin principal', () => {
    const ctx = { principal: memberPrincipal, accountId: 'acct-1' }
    try {
      requireSystemContextWithAudit(ctx as any)
      expect.unreachable('should have thrown')
    } catch (err: any) {
      expect(err).toBeInstanceOf(Error)
      expect(err.statusCode).toBe(403)
      expect(err.message).toBe('System context required')
    }
  })

  it('throws a statusCode 401 error for an anonymous principal', () => {
    const ctx = { principal: { id: 'anonymous', type: 'machine' }, accountId: null }
    try {
      requireSystemContextWithAudit(ctx as any)
      expect.unreachable('should have thrown')
    } catch (err: any) {
      expect(err.statusCode).toBe(401)
      expect(err.message).toBe('Authentication required')
    }
  })

  it('returns null and stamps triggeredBy for a system_admin principal', () => {
    const ctx: any = { principal: { ...adminPrincipal }, accountId: 'acct-1' }
    expect(requireSystemContextWithAudit(ctx, 'suite')).toBeNull()
    expect(ctx.triggeredBy).toBe('suite')
  })
})

describe('denied responses are real HTTP errors (F-051)', () => {
  it('tests.ts returns HTTP 403 — not a 200-wrapped response object', async () => {
    principalRef.principal = memberPrincipal
    const res = await testsHandler(event({ action: 'list' }), {})
    expect(res.statusCode).toBe(403)
    const body = JSON.parse(res.body)
    expect(body.error).toBe('System context required')
    expect(body.data).toBeNull()
    // Regression shape: previously {statusCode:200, body:{data:{statusCode:403}}}
    expect(body.data?.statusCode).toBeUndefined()
  })

  it('security.ts returns HTTP 403 — not a 200-wrapped response object', async () => {
    principalRef.principal = memberPrincipal
    const res = await securityHandler(event({ action: 'blocklist' }), {})
    expect(res.statusCode).toBe(403)
    const body = JSON.parse(res.body)
    expect(body.error).toBe('System context required')
    expect(body.data).toBeNull()
  })

  it('tests.ts still serves a system_admin principal with HTTP 200', async () => {
    principalRef.principal = adminPrincipal
    const res = await testsHandler(event({ action: 'list' }), {})
    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.error).toBeNull()
    expect(body.data.data).toEqual([])
  })
})
