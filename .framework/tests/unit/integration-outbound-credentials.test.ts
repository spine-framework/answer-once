import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// F-065: the stock `generic-http` seed ships
// `api_token: { source: 'value', value: '' }`. An absent or explicitly-empty
// credential must mean "call without auth" — the adapter decides whether a
// key is required. A configured-but-broken env_var entry still throws.

vi.mock('../../functions/_shared/middleware.ts', () => ({
  createHandler: (fn: any) => fn,
}))

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: {
    from: vi.fn(),
  },
  getUserDb: vi.fn(() => ({})),
}))

vi.mock('../../functions/_shared/audit.ts', () => ({
  emitAudit: vi.fn().mockResolvedValue(undefined),
  emitLog: vi.fn().mockResolvedValue(undefined),
  emitSpan: vi.fn().mockResolvedValue(undefined),
  emitActivity: vi.fn().mockResolvedValue(undefined),
}))

// admin-data pulls in permissions/trigger-engine — only `get`/`update` are
// used here, and only when record_id / update_record are set.
vi.mock('../../functions/admin-data.ts', () => ({
  get: vi.fn(),
  update: vi.fn(),
}))

import { adminDb } from '../../functions/_shared/db.ts'
import { emitLog } from '../../functions/_shared/audit.ts'
import { execute } from '../../functions/integration-outbound.ts'

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

const fetchMock = vi.fn()

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

function queueIntegration(credentials: any, config: any = { outbound_adapter: 'adapters/generic-webhook-outbound' }) {
  // execute() looks up the account-scoped row first, then the system row.
  queue.push(q({ data: null, error: null })) // tenant miss
  queue.push(q({ data: { id: 'int-1', slug: 'generic-http', credentials, config, is_active: true }, error: null })) // system hit
  queue.push(q({ data: { id: 'del-1' }, error: null })) // webhook_deliveries insert
  queue.push(q({ data: null, error: null })) // webhook_deliveries update
}

beforeEach(() => {
  queue = []
  vi.clearAllMocks()
  vi.mocked(adminDb.from).mockImplementation(() => (queue.length ? queue.shift() : q({ data: null, error: null })))
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    text: async () => '{"ok":true}',
  })
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('integration-outbound optional credentials (F-065)', () => {
  it('sends the request with no Authorization header when api_token is an empty literal', async () => {
    queueIntegration({ api_token: { source: 'value', value: '' } })

    const result = await execute(makeCtx(), {
      integration_slug: 'generic-http',
      action_config: { url: 'https://hooks.example.com/in' },
    })

    expect(result.success).toBe(true)
    expect(fetchMock).toHaveBeenCalledOnce()
    const headers = fetchMock.mock.calls[0][1].headers
    expect(headers.Authorization).toBeUndefined()

    // The skip is still audited — same event name, marked skipped.
    const events = vi.mocked(emitLog).mock.calls.map(c => c[1])
    expect(events).toContain('integration.credential_empty')
    const emptyCall = vi.mocked(emitLog).mock.calls.find(c => c[1] === 'integration.credential_empty')!
    expect(emptyCall[4]).toMatchObject({ skipped: true, field: 'api_token' })
  })

  it('proceeds unauthenticated when the credentials map has no entry for the field', async () => {
    queueIntegration({})

    const result = await execute(makeCtx(), {
      integration_slug: 'generic-http',
      action_config: { url: 'https://hooks.example.com/in' },
    })

    expect(result.success).toBe(true)
    const headers = fetchMock.mock.calls[0][1].headers
    expect(headers.Authorization).toBeUndefined()
    const events = vi.mocked(emitLog).mock.calls.map(c => c[1])
    expect(events).toContain('integration.credential_missing')
  })

  it('attaches Authorization: Bearer when a literal token is configured', async () => {
    queueIntegration({ api_token: { source: 'value', value: 'tok-123' } })

    await execute(makeCtx(), {
      integration_slug: 'generic-http',
      action_config: { url: 'https://hooks.example.com/in' },
    })

    const headers = fetchMock.mock.calls[0][1].headers
    expect(headers.Authorization).toBe('Bearer tok-123')
  })

  it('still throws when an env_var credential names an unset variable', async () => {
    queueIntegration({ api_token: { source: 'env_var', value: 'DEFINITELY_UNSET_ENV_VAR' } })

    await expect(
      execute(makeCtx(), {
        integration_slug: 'generic-http',
        action_config: { url: 'https://hooks.example.com/in' },
      })
    ).rejects.toThrow('Environment variable DEFINITELY_UNSET_ENV_VAR for api_token is not set')
    expect(fetchMock).not.toHaveBeenCalled()
    const events = vi.mocked(emitLog).mock.calls.map(c => c[1])
    expect(events).toContain('integration.credential_env_missing')
  })

  it('openai adapter still fails when no credential resolved', async () => {
    queueIntegration({}, { outbound_adapter: 'adapters/openai-outbound' })

    await expect(
      execute(makeCtx(), {
        integration_slug: 'openai',
        action_config: { endpoint: '/chat/completions', body: {} },
      })
    ).rejects.toThrow('OpenAI adapter requires api_token credential')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
