import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
  getUserDb: vi.fn(() => ({})),
}))

vi.mock('../../functions/_shared/audit.ts', () => ({
  emitAudit: vi.fn().mockResolvedValue(undefined),
  emitLog: vi.fn().mockResolvedValue(undefined),
  emitSpan: vi.fn().mockResolvedValue(undefined),
  emitActivity: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../functions/_shared/rate-limit.ts', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(undefined),
  RateLimitError: class RateLimitError extends Error {},
}))

vi.mock('../../functions/_shared/security.ts', () => ({
  checkRegistrationBlocklist: vi.fn().mockResolvedValue(undefined),
  recordRegistrationGeo: vi.fn().mockResolvedValue(undefined),
  isBlockedRequest: vi.fn().mockResolvedValue(null),
  isBlockedIp: vi.fn().mockResolvedValue(null),
  touchPersonGeo: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../../functions/_shared/geo.ts', () => ({
  getClientGeo: vi.fn(() => ({ ip: undefined, country: undefined })),
}))

vi.mock('../../functions/admin-data.ts', () => ({
  create: vi.fn(),
  list: vi.fn(),
  update: vi.fn(),
}))

vi.mock('../../functions/integration-outbound.ts', () => ({
  execute: vi.fn().mockResolvedValue({ success: true }),
}))

import { adminDb } from '../../functions/_shared/db.ts'
import {
  completeRegistration,
  validateToken,
  createInvite,
  handler,
} from '../../functions/invites.ts'
import { resolveInternalPersonId } from '../../functions/_shared/principal.ts'
import { update as adminDataUpdate, list as adminDataList } from '../../functions/admin-data.ts'

function q(result: { data?: any; error?: any }) {
  const b: any = {}
  const chainers = ['select', 'eq', 'in', 'is', 'ilike', 'filter', 'not', 'order',
    'limit', 'update', 'insert', 'upsert', 'delete', 'neq', 'or', 'contains', 'gte', 'lte']
  for (const m of chainers) b[m] = vi.fn(() => b)
  b.single = vi.fn(async () => result)
  b.maybeSingle = vi.fn(async () => result)
  b.then = (onF: any, onR: any) => Promise.resolve(result).then(onF, onR)
  return b
}

let queue: any[] = []
let built: any[] = []

beforeEach(() => {
  queue = []
  built = []
  vi.clearAllMocks()
  vi.mocked(adminDb.from).mockImplementation(() => {
    const b = queue.length ? queue.shift() : q({ data: null, error: null })
    built.push(b)
    return b
  })
  vi.mocked(adminDb.rpc).mockResolvedValue({ data: null, error: null } as any)
})

const savedEnv: Record<string, string | undefined> = {}
afterEach(() => {
  for (const k of ['APP_BASE_URL', 'ALLOWED_ORIGINS']) {
    if (savedEnv[k] === undefined) delete process.env[k]
    else process.env[k] = savedEnv[k]
    delete savedEnv[k]
  }
})

function setEnv(key: string, value: string | undefined) {
  if (!(key in savedEnv)) savedEnv[key] = process.env[key]
  if (value === undefined) delete process.env[key]
  else process.env[key] = value
}

function makeCtx(overrides: any = {}) {
  const principal = {
    id: 'person-1',
    type: 'human',
    accountId: 'acct-1',
    roles: ['member'],
    email: 'user@corp.com',
    provenance: { sourceType: 'jwt', createdBy: 'person-1', invokedAt: new Date().toISOString() },
    ...(overrides.principal || {}),
  }
  return {
    requestId: 'req-test',
    accountId: principal.accountId,
    appId: null,
    query: {},
    headers: {},
    ...overrides,
    principal,
  }
}

function expectNoWrites() {
  for (const b of built) {
    expect(b.update?.mock?.calls?.length ?? 0, 'update() calls').toBe(0)
    expect(b.insert?.mock?.calls?.length ?? 0, 'insert() calls').toBe(0)
    expect(b.delete?.mock?.calls?.length ?? 0, 'delete() calls').toBe(0)
  }
}

// ─── completeRegistration ────────────────────────────────────────────────────
describe('completeRegistration', () => {
  it('binds placement to ctx.principal.id, never the body email', async () => {
    vi.mocked(adminDb.rpc).mockResolvedValue({
      data: { status: 'active', account_slug: 'acme-a1b2c3', role_slug: 'member' },
      error: null,
    } as any)

    const res = await completeRegistration(makeCtx() as any, {
      app: 'portal',
      path: 'new_account',
      account_name: 'Acme Co',
      email: 'victim@other.example', // spoofed — must not drive placement
    })

    expect(adminDb.rpc).toHaveBeenCalledWith('complete_registration_placement', {
      p_person_id: 'person-1',
      p_app_slug: 'portal',
      p_path: 'new_account',
      p_account_name: 'Acme Co',
      p_host: null,
    })
    expect(res).toMatchObject({
      status: 'active',
      account_slug: 'acme-a1b2c3',
      role_slug: 'member',
    })
    // The endpoint performs no direct people/accounts writes.
    expect(adminDb.from).not.toHaveBeenCalled()
  })

  it('rejects when app or path is missing', async () => {
    await expect(completeRegistration(makeCtx() as any, { path: 'new_account' }))
      .rejects.toThrow('app and path are required')
    await expect(completeRegistration(makeCtx() as any, { app: 'portal' }))
      .rejects.toThrow('app and path are required')
    expect(adminDb.rpc).not.toHaveBeenCalled()
  })

  it('maps RPC errors (unknown app, disabled registration, join_request policy) to a 400', async () => {
    const cases = [
      "Unknown or uninstalled app 'ghost' or no registration policy configured",
      "Registration is not enabled for app 'portal'",
      "App 'portal' does not allow domain-based join requests",
      'No account found for this email domain',
    ]
    for (const message of cases) {
      vi.mocked(adminDb.rpc).mockResolvedValueOnce({ data: null, error: { message } } as any)
      const err = await completeRegistration(makeCtx() as any, {
        app: 'portal', path: 'join_request',
      }).then(() => null).catch((e: any) => e)
      expect(err).toBeTruthy()
      expect(err.statusCode).toBe(400)
      expect(err.message).toBe(message)
    }
  })

  it('returns the existing placement unchanged on idempotent retry', async () => {
    vi.mocked(adminDb.rpc).mockResolvedValue({
      data: { status: 'active', account_slug: 'acme-a1b2c3', role_slug: 'member_admin' },
      error: null,
    } as any)
    const res = await completeRegistration(makeCtx() as any, {
      app: 'portal', path: 'new_account', account_name: 'Acme Co',
    })
    expect(res).toMatchObject({ status: 'active', account_slug: 'acme-a1b2c3', role_slug: 'member_admin' })
  })

  it('passes through a `next` field when the RPC supplies one', async () => {
    vi.mocked(adminDb.rpc).mockResolvedValue({
      data: { status: 'pending', account_slug: 'corp-zz99', role_slug: 'member', next: 'pending_approval' },
      error: null,
    } as any)
    const res = await completeRegistration(makeCtx() as any, {
      app: 'portal', path: 'join_request',
    })
    expect(res).toMatchObject({ status: 'pending', next: 'pending_approval' })
  })
})

// ─── validateToken ───────────────────────────────────────────────────────────
describe('validateToken', () => {
  function invitePerson(data: any) {
    return {
      id: 'p-inv', email: 'inv@corp.com', account_id: 'acct-1', role_id: 'r1',
      status: 'invited', data,
      account: { display_name: 'Corp' }, role: { name: 'Member' },
    }
  }

  it('performs zero writes on a successful preview', async () => {
    queue.push(q({
      data: invitePerson({ invite_token: 'tok', invite_kind: 'invite', invite_attempts: 0 }),
    }))
    const ctx: any = makeCtx()
    ctx.query = { token: 'tok' }
    const res = await validateToken(ctx, undefined)
    expect(res).toMatchObject({ email: 'inv@corp.com', account_name: 'Corp', role_name: 'Member' })
    expectNoWrites()
  })

  it('rejects blocked and expired invites without writing', async () => {
    queue.push(q({
      data: invitePerson({ invite_token: 'tok', invite_blocked_at: new Date().toISOString() }),
    }))
    const ctx: any = makeCtx()
    ctx.query = { token: 'tok' }
    await expect(validateToken(ctx, undefined)).rejects.toThrow('blocked')
    expectNoWrites()

    queue.push(q({
      data: invitePerson({ invite_token: 'tok', invite_expires_at: '2000-01-01T00:00:00Z' }),
    }))
    const ctx2: any = makeCtx()
    ctx2.query = { token: 'tok' }
    await expect(validateToken(ctx2, undefined)).rejects.toThrow('expired')
    expectNoWrites()
  })

  it('surfaces the blocked state for legacy rows at the attempts cap without writing', async () => {
    queue.push(q({
      data: invitePerson({ invite_token: 'tok', invite_attempts: 5 }),
    }))
    const ctx: any = makeCtx()
    ctx.query = { token: 'tok' }
    await expect(validateToken(ctx, undefined)).rejects.toThrow('Too many failed attempts')
    expectNoWrites()
  })
})

// ─── Account-scoped admin checks ─────────────────────────────────────────────
describe('account-scoped admin checks', () => {
  const otherAccountPerson = { id: 'p2', email: 't@corp.com', account_id: 'acct-2', status: 'invited', data: {} }

  const mutationCases: Array<{ action: string; person: any }> = [
    { action: 'revoke-invite', person: { ...otherAccountPerson, status: 'invited' } },
    { action: 'reinvite', person: { ...otherAccountPerson, status: 'invited' } },
    { action: 'approve', person: { ...otherAccountPerson, status: 'pending' } },
    { action: 'block-invite', person: { ...otherAccountPerson } },
    { action: 'deny', person: { ...otherAccountPerson, status: 'pending' } },
    { action: 'update-member', person: { ...otherAccountPerson, status: 'active' } },
    { action: 'deactivate-member', person: { ...otherAccountPerson, status: 'active' } },
  ]

  for (const { action, person } of mutationCases) {
    it(`${action}: rejects an *_admin of a different account`, async () => {
      queue.push(q({ data: person })) // target person lookup
      const ctx: any = makeCtx({
        principal: { accountId: 'acct-1', roles: ['member_admin'] },
        query: { action },
      })
      await expect(handler(ctx, { person_id: 'p2', full_name: 'X' }))
        .rejects.toThrow('Insufficient permissions')
    })

    it(`${action}: accepts an *_admin of the target account`, async () => {
      queue.push(q({ data: person })) // target person lookup
      queue.push(q({ data: null, error: null })) // update result / allowlist read
      queue.push(q({ data: [{ id: 'r-member', slug: 'member', is_system: false }] }))
      vi.mocked(adminDataUpdate).mockResolvedValue({ id: 'p2' } as any)
      const ctx: any = makeCtx({
        principal: { accountId: 'acct-2', roles: ['member_admin'] },
        query: { action },
      })
      const res = await handler(ctx, { person_id: 'p2', full_name: 'X' })
      expect(res).toBeTruthy()
    })

    it(`${action}: accepts system_admin regardless of account`, async () => {
      queue.push(q({ data: person }))
      queue.push(q({ data: null, error: null }))
      queue.push(q({ data: [{ id: 'r-member', slug: 'member', is_system: false }] }))
      vi.mocked(adminDataUpdate).mockResolvedValue({ id: 'p2' } as any)
      const ctx: any = makeCtx({
        principal: { accountId: 'acct-9', roles: ['system_admin'], permissions: ['system'] },
        query: { action },
      })
      const res = await handler(ctx, { person_id: 'p2', full_name: 'X' })
      expect(res).toBeTruthy()
    })

    it(`${action}: rejects a plain member`, async () => {
      queue.push(q({ data: person }))
      const ctx: any = makeCtx({
        principal: { accountId: 'acct-2', roles: ['member'] },
        query: { action },
      })
      await expect(handler(ctx, { person_id: 'p2' }))
        .rejects.toThrow('Insufficient permissions')
    })
  }

  it('list-members: rejects an *_admin of a different account', async () => {
    const ctx: any = makeCtx({
      principal: { accountId: 'acct-1', roles: ['member_admin'] },
      query: { action: 'list-members', account_id: 'acct-2' },
    })
    await expect(handler(ctx, {})).rejects.toThrow('Insufficient permissions')
  })

  it('list-members: accepts an *_admin of the queried account', async () => {
    queue.push(q({ data: [{ id: 'r-member', slug: 'member', name: 'Member' }] }))
    vi.mocked(adminDataList).mockResolvedValue([{ id: 'p2', role_id: 'r-member' }] as any)
    const ctx: any = makeCtx({
      principal: { accountId: 'acct-2', roles: ['member_admin'] },
      query: { action: 'list-members', account_id: 'acct-2' },
    })
    const res = await handler(ctx, {})
    expect(res.data?.[0]?.role).toMatchObject({ slug: 'member' })
  })

  it('reinvite: rejects when the target person is active', async () => {
    queue.push(q({ data: { ...otherAccountPerson, status: 'active' } }))
    const ctx: any = makeCtx({
      principal: { accountId: 'acct-2', roles: ['member_admin'] },
      query: { action: 'reinvite' },
    })
    await expect(handler(ctx, { person_id: 'p2' }))
      .rejects.toThrow('reinvitable')
  })

  it('update-member: rejects a system_admin role_slug', async () => {
    queue.push(q({ data: { ...otherAccountPerson, status: 'active' } })) // target lookup
    queue.push(q({ data: [] })) // roleAllowlistForAccount
    const ctx: any = makeCtx({
      principal: { accountId: 'acct-2', roles: ['member_admin'] },
      query: { action: 'update-member' },
    })
    await expect(handler(ctx, { person_id: 'p2', role_slug: 'system_admin' }))
      .rejects.toThrow('not permitted')
    expect(vi.mocked(adminDataUpdate)).not.toHaveBeenCalled()
  })

  it('update-member: rejects an is_system role_slug', async () => {
    queue.push(q({ data: { ...otherAccountPerson, status: 'active' } }))
    queue.push(q({ data: [] })) // roleAllowlistForAccount → no declared allowlist
    queue.push(q({ data: [{ id: 'r-eng', slug: 'engineering', is_system: true }] }))
    const ctx: any = makeCtx({
      principal: { accountId: 'acct-2', roles: ['member_admin'] },
      query: { action: 'update-member' },
    })
    await expect(handler(ctx, { person_id: 'p2', role_slug: 'engineering' }))
      .rejects.toThrow('not permitted')
  })
})

// ─── createInvite ────────────────────────────────────────────────────────────
describe('createInvite', () => {
  const baseBody = { email: 'new@corp.com', account_id: 'acct-1', role_slug: 'member' }
  const adminCtx = () => makeCtx({ principal: { accountId: 'acct-1', roles: ['member_admin'] } })

  // Queue order mirrors from() call order in createInvite: optional apps
  // allowlist read (only when body.app/ctx.appId is set) → roles → existing
  // person → person type → integrations.
  function queueHappyPath(opts: { appRow?: any } = {}) {
    if ('appRow' in opts) queue.push(q({ data: opts.appRow }))
    queue.push(q({ data: [{ id: 'r-member', slug: 'member', is_system: false }] })) // roles
    queue.push(q({ data: null }))                                         // existing person
    queue.push(q({ data: { id: 't-person' } }))                           // person type
    queue.push(q({ data: null }))                                         // integrations
  }

  it('rejects callers that are not admins of the target account', async () => {
    await expect(createInvite(makeCtx() as any, baseBody))
      .rejects.toThrow('Insufficient permissions')
    const foreignAdmin = makeCtx({ principal: { accountId: 'acct-9', roles: ['member_admin'] } })
    await expect(createInvite(foreignAdmin as any, baseBody))
      .rejects.toThrow('Insufficient permissions')
  })

  it('rejects a forged system_admin role_slug', async () => {
    await expect(createInvite(adminCtx() as any, { ...baseBody, role_slug: 'system_admin' }))
      .rejects.toThrow('not permitted')
  })

  it('rejects an is_system role even when the slug exists', async () => {
    queue.push(q({ data: [{ id: 'r-eng', slug: 'engineering', is_system: true }] }))
    await expect(createInvite(adminCtx() as any, { ...baseBody, role_slug: 'engineering' }))
      .rejects.toThrow('not permitted')
  })

  it('rejects roles outside the app allowlist', async () => {
    queue.push(q({ data: { config: { invitation: { allowed_roles: ['member'] } } } }))
    await expect(createInvite(adminCtx() as any, { ...baseBody, app: 'portal', role_slug: 'member_admin' }))
      .rejects.toThrow('not permitted')
  })

  it('creates an invite and builds the link on an allowlisted origin', async () => {
    setEnv('APP_BASE_URL', 'https://app.example.com')
    queueHappyPath({ appRow: { config: { registration: { roles: ['member'] } } } })
    const { create: adminDataCreate } = await import('../../functions/admin-data.ts')
    vi.mocked(adminDataCreate).mockResolvedValue({ id: 'stub-1' } as any)

    const res = await createInvite(adminCtx() as any, {
      ...baseBody, app: 'portal', base_url: 'https://app.example.com/some/path',
    })
    expect(res.invite_url).toMatch(/^https:\/\/app\.example\.com\/register\?t=/)
    expect(res.invite_url).not.toContain('yourapp.com')
  })

  it('allows localhost base_url for dev', async () => {
    queueHappyPath()
    const { create: adminDataCreate } = await import('../../functions/admin-data.ts')
    vi.mocked(adminDataCreate).mockResolvedValue({ id: 'stub-1' } as any)
    const res = await createInvite(adminCtx() as any, {
      ...baseBody, base_url: 'http://localhost:3000',
    })
    expect(res.invite_url).toMatch(/^http:\/\/localhost:3000\/register\?t=/)
  })

  it('falls back to APP_BASE_URL for disallowed origins (never yourapp.com)', async () => {
    setEnv('APP_BASE_URL', 'https://app.example.com')
    queueHappyPath()
    const { create: adminDataCreate } = await import('../../functions/admin-data.ts')
    vi.mocked(adminDataCreate).mockResolvedValue({ id: 'stub-1' } as any)
    const res = await createInvite(adminCtx() as any, {
      ...baseBody, base_url: 'https://phish.example.org',
    })
    expect(res.invite_url).toMatch(/^https:\/\/app\.example\.com\/register\?t=/)
    expect(res.invite_url).not.toContain('yourapp.com')
    expect(res.invite_url).not.toContain('phish.example.org')
  })

  it('falls back to http://localhost:8888 when nothing is configured or allowed', async () => {
    setEnv('APP_BASE_URL', undefined)
    setEnv('ALLOWED_ORIGINS', undefined)
    queueHappyPath()
    const { create: adminDataCreate } = await import('../../functions/admin-data.ts')
    vi.mocked(adminDataCreate).mockResolvedValue({ id: 'stub-1' } as any)
    const res = await createInvite(adminCtx() as any, {
      ...baseBody, base_url: 'not-a-url',
    })
    expect(res.invite_url).toMatch(/^http:\/\/localhost:8888\/register\?t=/)
  })
})

// ─── resolveInternalPersonId ─────────────────────────────────────────────────
describe('resolveInternalPersonId', () => {
  it('resolves by auth_uid first without touching the email path', async () => {
    queue.push(q({ data: { id: 'p-bound' } }))
    const id = await resolveInternalPersonId('auth-1', 'someone@corp.com')
    expect(id).toBe('p-bound')
    expect(adminDb.from).toHaveBeenCalledTimes(1)
  })

  it('does not bind an unclaimed invited stub by email', async () => {
    queue.push(q({ data: null })) // auth_uid lookup → miss
    queue.push(q({
      data: { id: 'stub-1', auth_uid: null, status: 'invited', data: { invite_token: 'abc' } },
    }))
    const id = await resolveInternalPersonId('auth-1', 'inv@corp.com')
    expect(id).toBe('auth-1')
    expectNoWrites()
  })

  it('does not bind an unclaimed pending stub by email', async () => {
    queue.push(q({ data: null }))
    queue.push(q({ data: { id: 'stub-2', auth_uid: null, status: 'pending', data: {} } }))
    const id = await resolveInternalPersonId('auth-1', 'req@corp.com')
    expect(id).toBe('auth-1')
    expectNoWrites()
  })

  it('still binds a non-stub unbound person by email', async () => {
    queue.push(q({ data: null }))
    queue.push(q({ data: { id: 'p3', auth_uid: null, status: 'active', data: null } }))
    queue.push(q({ data: null, error: null })) // update
    const id = await resolveInternalPersonId('auth-1', 'active@corp.com')
    expect(id).toBe('p3')
    const updateBuilder = built.find(b => b.update?.mock?.calls?.length)
    expect(updateBuilder).toBeTruthy()
    expect(updateBuilder.update).toHaveBeenCalledWith({ auth_uid: 'auth-1' })
  })

  it('falls back to the auth id when nothing matches', async () => {
    queue.push(q({ data: null }))
    queue.push(q({ data: null }))
    const id = await resolveInternalPersonId('auth-1', 'ghost@corp.com')
    expect(id).toBe('auth-1')
  })
})
