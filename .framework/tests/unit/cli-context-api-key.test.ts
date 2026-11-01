import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { hashApiKey } from '../../functions/_shared/hash-api-key'

const { mockFrom, mockLimit } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockLimit: vi.fn(),
}))

vi.mock('../../functions/_shared/index.ts', () => ({
  adminDb: { from: mockFrom },
  getUserDb: vi.fn(),
  SYSTEM_PRINCIPAL: { id: 'system', type: 'system' },
}))

const ENV_KEYS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SPINE_CLI_API_KEY',
  'SPINE_CLI_JWT',
  'SPINE_CLI_ACCOUNT_ID',
] as const

const savedEnv: Record<string, string | undefined> = {}

async function loadContext() {
  vi.resetModules()
  return await import('../../cli/context.ts')
}

beforeEach(() => {
  vi.clearAllMocks()
  for (const key of ENV_KEYS) savedEnv[key] = process.env[key]
  process.env.SUPABASE_URL = 'https://example.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key'
  delete process.env.SPINE_CLI_API_KEY
  delete process.env.SPINE_CLI_JWT
  delete process.env.SPINE_CLI_ACCOUNT_ID

  mockFrom.mockReturnValue({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ limit: mockLimit })),
        })),
      })),
    })),
  })
})

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = savedEnv[key]
    }
  }
})

describe('buildCliContext API key auth', () => {
  it('returns a machine principal for a valid raw key', async () => {
    const rawKey = 'sk_validrawkey0001'
    const { key_hash } = hashApiKey(rawKey)
    mockLimit.mockResolvedValue({
      data: [{ id: 'key-id-1', account_id: 'acct-1', scopes: ['read'], key_hash, expires_at: null }],
      error: null,
    })
    process.env.SPINE_CLI_API_KEY = rawKey

    const { buildCliContext } = await loadContext()
    const ctx = await buildCliContext()

    expect(ctx.principal.type).toBe('machine')
    expect(ctx.principal.id).toBe('key-id-1')
    expect(ctx.principal.provenance.apiKeyId).toBe('key-id-1')
    expect(ctx.principal.provenance.sourceType).toBe('api_key')
    expect(ctx.accountId).toBe('acct-1')
    expect(ctx.requestId).toBeTruthy()
    expect(mockFrom).toHaveBeenCalledWith('api_keys')
  })

  it('rejects a wrong key sharing the same prefix', async () => {
    const { key_hash } = hashApiKey('sk_wrongxx_other')
    mockLimit.mockResolvedValue({
      data: [{ id: 'key-id-1', account_id: 'acct-1', scopes: [], key_hash, expires_at: null }],
      error: null,
    })
    process.env.SPINE_CLI_API_KEY = 'sk_wrongxx_guess'

    const { buildCliContext } = await loadContext()
    await expect(buildCliContext()).rejects.toThrow('Invalid or inactive SPINE_CLI_API_KEY')
  })

  it('skips expired rows and rejects when only expired keys match', async () => {
    const rawKey = 'sk_expiredkey001'
    const { key_hash } = hashApiKey(rawKey)
    mockLimit.mockResolvedValue({
      data: [{ id: 'key-id-1', account_id: 'acct-1', scopes: [], key_hash, expires_at: '2000-01-01T00:00:00Z' }],
      error: null,
    })
    process.env.SPINE_CLI_API_KEY = rawKey

    const { buildCliContext } = await loadContext()
    await expect(buildCliContext()).rejects.toThrow('Invalid or inactive SPINE_CLI_API_KEY')
  })

  it('rejects when no active keys match the prefix', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null })
    process.env.SPINE_CLI_API_KEY = 'sk_nomatch_00000'

    const { buildCliContext } = await loadContext()
    await expect(buildCliContext()).rejects.toThrow('Invalid or inactive SPINE_CLI_API_KEY')
  })
})
