import { describe, it, expect, vi } from 'vitest'

const principalRef = vi.hoisted(() => ({ principal: null as any }))

vi.mock('../../functions/_shared/middleware', () => ({
  createHandler: (fn: any) => async () =>
    fn({ principal: principalRef.principal, requestId: 'req-1', accountId: 'acct-1' }, {}),
}))

import { handler } from '../../functions/debug-auth'

const event = (method?: string) => ({ queryStringParameters: method ? { method } : {} })

describe('debug-auth system_admin gate', () => {
  it('denies a non-admin principal with statusCode 403', async () => {
    principalRef.principal = { type: 'person', id: 'p1', roles: [{ slug: 'member' }] }
    await expect(handler(event(), {})).rejects.toMatchObject({ statusCode: 403 })
  })

  it('denies an unauthenticated request (no principal)', async () => {
    principalRef.principal = null
    await expect(handler(event(), {})).rejects.toMatchObject({ statusCode: 403 })
  })

  it('returns debug data for a system_admin principal', async () => {
    principalRef.principal = { type: 'person', id: 'p1', roles: [{ slug: 'system_admin' }] }
    const res = await handler(event('debug'), {})
    expect(res.data.message).toBe('Debug auth endpoint')
    expect(res.data.hasPrincipal).toBe(true)
  })

  it('returns tokenValid for testJwt with a system_admin principal', async () => {
    principalRef.principal = { type: 'person', id: 'p1', roles: [{ slug: 'system_admin' }] }
    const res = await handler(event('testJwt'), {})
    expect(res.data.tokenValid).toBe(true)
    expect(res.data.principal.id).toBe('p1')
  })
})
