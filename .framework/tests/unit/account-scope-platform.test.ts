import { describe, it, expect, vi } from 'vitest'

// The items_access RLS policy exposes design_schema.scope='platform' items on
// the spine-system account to every actor. The explicit account filter in
// account-scope.ts is the only guard for machine principals on adminDb — it
// must mirror that branch or platform artifacts become invisible to tenants
// (shipped bug: members saw an empty KB because ao_kb_shared artifacts live on
// spine-system). The exemption is items-only and read-side only: writes stay
// confined to the caller's accounts.

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => ({ data: { id: 'sys-acct' } })),
        })),
      })),
    })),
    rpc: vi.fn(async () => ({ data: [{ account_id: 'tenant-a' }] })),
  },
  getUserDb: vi.fn(() => ({})),
}))

import {
  applyAccountScope,
  assertRecordAccess,
  resolvePlatformAccountId,
} from '../../functions/_shared/account-scope.ts'

function fakeQuery() {
  const calls: { method: string; args: any[] }[] = []
  const q: any = {
    calls,
    eq: (...a: any[]) => { calls.push({ method: 'eq', args: a }); return q },
    in: (...a: any[]) => { calls.push({ method: 'in', args: a }); return q },
    or: (...a: any[]) => { calls.push({ method: 'or', args: a }); return q },
  }
  return q
}

const memberCtx = {
  accountId: 'tenant-a',
  principal: { type: 'human', id: 'actor-1', roles: ['member'] },
}

describe('applyAccountScope — platform items', () => {
  it('ORs in spine-system platform rows for items when the platform account is provided', () => {
    const q = fakeQuery()
    applyAccountScope(q, 'items', ['tenant-a'], 'sys-acct')
    expect(q.calls).toEqual([{
      method: 'or',
      args: ['account_id.in.(tenant-a),and(account_id.eq.sys-acct,design_schema->>scope.eq.platform)'],
    }])
  })

  it('keeps the platform clause when the caller has no accessible accounts', () => {
    const q = fakeQuery()
    applyAccountScope(q, 'items', [], 'sys-acct')
    expect(q.calls).toEqual([{
      method: 'or',
      args: ['and(account_id.eq.sys-acct,design_schema->>scope.eq.platform)'],
    }])
  })

  it('does not widen items without a platform account id', () => {
    const q = fakeQuery()
    applyAccountScope(q, 'items', ['tenant-a', 'tenant-b'])
    expect(q.calls).toEqual([{ method: 'in', args: ['account_id', ['tenant-a', 'tenant-b']] }])
  })

  it('does not widen non-items entities even with a platform account id', () => {
    const q = fakeQuery()
    applyAccountScope(q, 'threads', ['tenant-a'], 'sys-acct')
    expect(q.calls).toEqual([{ method: 'eq', args: ['account_id', 'tenant-a'] }])
  })
})

describe('assertRecordAccess — platform items', () => {
  const platformItem = { account_id: 'sys-acct', design_schema: { scope: 'platform' } }

  it('allows a member to read a platform-scope item on spine-system', async () => {
    await expect(
      assertRecordAccess(memberCtx, 'items', platformItem, 'sys-acct')
    ).resolves.toBeUndefined()
  })

  it('still denies the same record when the platform account is not passed (write paths)', async () => {
    await expect(
      assertRecordAccess(memberCtx, 'items', platformItem)
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('still denies a non-platform item on spine-system', async () => {
    const accountItem = { account_id: 'sys-acct', design_schema: { scope: 'account' } }
    await expect(
      assertRecordAccess(memberCtx, 'items', accountItem, 'sys-acct')
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it('still denies a platform-scope item owned by a tenant account', async () => {
    const foreignPlatform = { account_id: 'tenant-b', design_schema: { scope: 'platform' } }
    await expect(
      assertRecordAccess(memberCtx, 'items', foreignPlatform, 'sys-acct')
    ).rejects.toMatchObject({ statusCode: 403 })
  })
})

describe('resolvePlatformAccountId', () => {
  it('resolves and caches the spine-system account id per request', async () => {
    const ctx: any = {}
    const first = await resolvePlatformAccountId(ctx)
    expect(first).toBe('sys-acct')
    expect(ctx.__platformAccountId).toBe('sys-acct')
    await expect(resolvePlatformAccountId(ctx)).resolves.toBe('sys-acct')
  })
})
