import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFrom, mockMaybeSingle } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockMaybeSingle: vi.fn(),
}))

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: { from: mockFrom },
  getUserDb: vi.fn(),
}))

vi.mock('../../functions/_shared/middleware.ts', () => ({}))

vi.mock('../../functions/_shared/principal.ts', () => ({
  formatPrincipalForAudit: vi.fn(() => null),
}))

const APP_UUID = '5f2c1e9a-3b7d-4a8e-9c6f-1d2e3f4a5b6c'

async function loadLogging() {
  vi.resetModules()
  return await import('../../functions/_shared/logging.ts')
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFrom.mockReturnValue({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({ maybeSingle: mockMaybeSingle })),
    })),
  })
})

describe('resolveAppUuid', () => {
  it('returns a uuid input unchanged without a db call', async () => {
    const { resolveAppUuid } = await loadLogging()
    await expect(resolveAppUuid(APP_UUID)).resolves.toBe(APP_UUID)
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('resolves a slug via the apps lookup and caches the hit', async () => {
    const { resolveAppUuid } = await loadLogging()
    mockMaybeSingle.mockResolvedValue({ data: { id: APP_UUID }, error: null })
    await expect(resolveAppUuid('demo')).resolves.toBe(APP_UUID)
    await expect(resolveAppUuid('demo')).resolves.toBe(APP_UUID)
    expect(mockFrom).toHaveBeenCalledTimes(1)
    expect(mockFrom).toHaveBeenCalledWith('apps')
  })

  it('returns null for an unknown slug and caches the miss', async () => {
    const { resolveAppUuid } = await loadLogging()
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
    await expect(resolveAppUuid('missing-app')).resolves.toBeNull()
    await expect(resolveAppUuid('missing-app')).resolves.toBeNull()
    expect(mockFrom).toHaveBeenCalledTimes(1)
  })

  it('returns null on lookup error and retries instead of caching', async () => {
    const { resolveAppUuid } = await loadLogging()
    mockMaybeSingle.mockResolvedValue({ data: null, error: { message: 'db down' } })
    await expect(resolveAppUuid('demo')).resolves.toBeNull()
    mockMaybeSingle.mockResolvedValue({ data: { id: APP_UUID }, error: null })
    await expect(resolveAppUuid('demo')).resolves.toBe(APP_UUID)
    expect(mockFrom).toHaveBeenCalledTimes(2)
  })

  it('returns null for null, undefined, and empty input without a db call', async () => {
    const { resolveAppUuid } = await loadLogging()
    await expect(resolveAppUuid(null)).resolves.toBeNull()
    await expect(resolveAppUuid(undefined)).resolves.toBeNull()
    await expect(resolveAppUuid('')).resolves.toBeNull()
    expect(mockFrom).not.toHaveBeenCalled()
  })
})
