// CIL[BEGIN stable_id="~/.framework/tests/unit/notify.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Unit tests for _shared/notify.ts resolveNotificationRecipients"]
// CIL[DOC-RESPONSIBILITY responsibility="Assert role:<slug> entries resolve to account-scoped people ids, UUIDs pass through, and malformed/unknown entries warn and are skipped"]
// CIL[DOC-CONTEXT module="tests/unit/notify" layer="test-unit" related_files=".framework/functions/_shared/notify.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts"]
// CIL[DOC-CONTRACT inputs="mocked adminDb people queries" outputs="expect assertions on resolved id lists and console.warn" errors="none" side_effects="registers vi.mock factories"]
// CIL[DOC-MICRO logic_summary="Mocks adminDb.from('people') with a thenable supabase-style chain so the awaited .eq('role.slug', ...) call resolves fixture rows" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="test maintainers"]
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CoreContext } from '../../functions/_shared/middleware.ts'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: { from: vi.fn(), rpc: vi.fn() }
}))

import { adminDb } from '../../functions/_shared/db.ts'
import { resolveNotificationRecipients } from '../../functions/_shared/notify.ts'
// CIL[END stable_id="~/.framework/tests/unit/notify.test.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/notify.test.ts:makeCtx:function" type="function" identity="makeCtx" parent="none"]
// CIL[DOC-MACRO purpose="Create a test CoreContext scoped to acct-test"]
// CIL[DOC-CONTRACT inputs="overrides: Partial<CoreContext>" outputs="CoreContext object" errors="none" side_effects="none"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function makeCtx(overrides: Partial<CoreContext> = {}): CoreContext {
  return {
    principal: {
      id: 'system', type: 'machine', accountId: null, scopes: ['*:*'],
      provenance: { sourceType: 'manual', createdBy: null, invokedAt: new Date().toISOString() }
    },
    accountId: 'acct-test',
    db: {},
    requestId: 'req-test',
    ...overrides
  }
}
// CIL[END stable_id="~/.framework/tests/unit/notify.test.ts:makeCtx:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/notify.test.ts:mockPeople:function" type="function" identity="mockPeople" parent="none"]
// CIL[DOC-MACRO purpose="Mock adminDb.from('people') to resolve fixture rows from the awaited terminal .eq"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a supabase-style thenable query builder for people role-join lookups"]
// CIL[DOC-CONTRACT inputs="rows: any[] | null, error?: any" outputs="configured adminDb.from mock" errors="none" side_effects="Mocks adminDb.from"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const UUID_A = '11111111-1111-4111-8111-111111111111'
const UUID_B = '22222222-2222-4222-8222-222222222222'

function mockPeople(result: { data: any[] | null; error?: any }) {
  const q: any = {
    select: vi.fn(() => q),
    eq: vi.fn(() => q),
    in: vi.fn(() => q),
    single: vi.fn().mockResolvedValue({ data: result.data?.[0] ?? null, error: result.error ?? null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: result.data?.[0] ?? null, error: result.error ?? null }),
    then: (onF: any, onR: any) =>
      Promise.resolve({ data: result.data, error: result.error ?? null }).then(onF, onR)
  }
  vi.mocked(adminDb.from).mockImplementation((table: string) => {
    if (table === 'people') return q
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null })
    } as any
  })
}
// CIL[END stable_id="~/.framework/tests/unit/notify.test.ts:mockPeople:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/notify.test.ts:describe_resolveNotificationRecipients:block" type="block" identity="describe_resolveNotificationRecipients" parent="none"]
// CIL[DOC-MACRO purpose="resolveNotificationRecipients behavior suite"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify role slug joins, UUID passthrough, warn-and-skip semantics, and dedupe"]
// CIL[DOC-CONTRACT inputs="recipient entry lists" outputs="resolved people.id lists" errors="none" side_effects="console.warn on skipped entries"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
describe('resolveNotificationRecipients', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('resolves role:<slug> entries to people ids in the account', async () => {
    mockPeople({ data: [{ id: 'person-1' }, { id: 'person-2' }] })
    const ids = await resolveNotificationRecipients(makeCtx(), ['role:member_admin'])
    expect(ids).toEqual(['person-1', 'person-2'])
    expect(adminDb.from).toHaveBeenCalledWith('people')
  })

  it('passes UUID-shaped recipients through unchanged', async () => {
    mockPeople({ data: [] })
    const ids = await resolveNotificationRecipients(makeCtx(), [UUID_A, UUID_B])
    expect(ids).toEqual([UUID_A, UUID_B])
    expect(adminDb.from).not.toHaveBeenCalledWith('people')
  })

  it('warns and skips a role that matches no active people', async () => {
    mockPeople({ data: [] })
    const ids = await resolveNotificationRecipients(makeCtx(), ['role:no_such_role'])
    expect(ids).toEqual([])
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('role:no_such_role'))
  })

  it('warns and skips when the role lookup query errors', async () => {
    mockPeople({ data: null, error: { message: 'join exploded' } })
    const ids = await resolveNotificationRecipients(makeCtx(), ['role:member_admin'])
    expect(ids).toEqual([])
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('role:member_admin'))
  })

  it('warns and skips recipients that are neither role: handles nor UUIDs', async () => {
    mockPeople({ data: [] })
    const ids = await resolveNotificationRecipients(makeCtx(), ['member_admin', 'not-a-uuid'])
    expect(ids).toEqual([])
    expect(console.warn).toHaveBeenCalledTimes(2)
  })

  it('skips non-string entries with a warning', async () => {
    mockPeople({ data: [] })
    const ids = await resolveNotificationRecipients(makeCtx(), [42, null] as any[])
    expect(ids).toEqual([])
    expect(console.warn).toHaveBeenCalledTimes(2)
  })

  it('mixes role resolution and UUID passthrough, deduping results', async () => {
    mockPeople({ data: [{ id: UUID_A }, { id: 'person-9' }] })
    const ids = await resolveNotificationRecipients(makeCtx(), ['role:member_admin', UUID_A, UUID_B])
    expect(ids).toEqual([UUID_A, 'person-9', UUID_B])
  })

  it('returns an empty list for empty or missing recipients', async () => {
    expect(await resolveNotificationRecipients(makeCtx(), [])).toEqual([])
    expect(await resolveNotificationRecipients(makeCtx(), undefined as any)).toEqual([])
  })
})
// CIL[END stable_id="~/.framework/tests/unit/notify.test.ts:describe_resolveNotificationRecipients:block"]
