import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: {
    from: vi.fn(),
  },
  getUserDb: vi.fn(() => ({})),
  joins: {
    app: 'app:apps(id, slug, name)',
    createdBy: 'created_by:people(id, full_name)',
  },
}))

vi.mock('../../functions/_shared/audit.ts', () => ({
  emitAudit: vi.fn().mockResolvedValue(undefined),
  emitLog: vi.fn().mockResolvedValue(undefined),
  emitSpan: vi.fn().mockResolvedValue(undefined),
  emitActivity: vi.fn().mockResolvedValue(undefined),
}))

import { adminDb } from '../../functions/_shared/db.ts'
import { emitLog } from '../../functions/_shared/audit.ts'
import { update, create } from '../../functions/integrations.ts'

// Chainable query-builder stub — every filter/terminal method returns the
// builder except single/maybeSingle/await, which resolve to the result.
function q(result: { data?: any; error?: any }) {
  const b: any = {}
  const chainers = ['select', 'eq', 'in', 'is', 'ilike', 'filter', 'not', 'order',
    'limit', 'update', 'insert', 'upsert', 'delete', 'neq', 'or', 'contains', 'gte', 'lte', 'range']
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
})

// createHandler-wrapped exports invoke the inner handler directly when the
// first arg carries requestId + principal (the ctx shortcut used by handler()).
function makeCtx(overrides: any = {}) {
  return {
    requestId: 'req-1',
    principal: {
      id: 'user-1',
      type: 'human',
      accountId: 'acct-1',
      roles: ['system_admin'],
    },
    accountId: 'acct-1',
    db: adminDb,
    query: {},
    ...overrides,
  }
}

describe('integrations update audit redaction (S-005)', () => {
  it('redacts credentials in the audit after payload while writing them to the DB', async () => {
    const integration = { id: 'int-1', name: 'OpenAI' }
    const builder = q({ data: integration, error: null })
    queue.push(builder)

    const credentials = {
      api_key: { source: 'value', value: 'sk-super-secret' },
    }

    const result = await update(makeCtx(), {
      id: 'int-1',
      name: 'OpenAI v2',
      credentials,
    })

    expect(result).toEqual(integration)

    // The DB write still receives the real credentials.
    const written = builder.update.mock.calls[0][0]
    expect(written.credentials).toEqual(credentials)
    expect(written.is_configured).toBe(true)
    expect(written.name).toBe('OpenAI v2')

    // The audit payload carries only a redaction marker.
    expect(emitLog).toHaveBeenCalledOnce()
    const [, eventType, target, changes] = vi.mocked(emitLog).mock.calls[0]
    expect(eventType).toBe('integration.updated')
    expect(target).toEqual({ type: 'integration', id: 'int-1' })
    expect(changes.after.credentials).toEqual({ __redacted: true })
    expect(JSON.stringify(changes.after)).not.toContain('sk-super-secret')
    expect(changes.after.name).toBe('OpenAI v2')
  })

  it('emits no credentials key in the audit payload when credentials are not updated', async () => {
    const builder = q({ data: { id: 'int-2' }, error: null })
    queue.push(builder)

    await update(makeCtx(), { id: 'int-2', description: 'new desc' })

    const [, , , changes] = vi.mocked(emitLog).mock.calls[0]
    expect(changes.after).not.toHaveProperty('credentials')
    expect(changes.after.description).toBe('new desc')
  })

  it('does not leak credentials in the create audit payload', async () => {
    const builder = q({ data: { id: 'int-3' }, error: null })
    queue.push(builder)

    await create(makeCtx(), {
      name: 'Resend',
      integration_type: 'api',
      provider: 'resend',
      credentials: { api_key: { source: 'value', value: 're_secret' } },
    })

    const [, , , changes] = vi.mocked(emitLog).mock.calls[0]
    expect(changes.after).not.toHaveProperty('credentials')
    expect(JSON.stringify(changes.after)).not.toContain('re_secret')
  })
})
