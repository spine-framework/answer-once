// CIL[BEGIN stable_id="~/.framework/tests/unit/principal-cache.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Unit tests for the human principal cache placement guard"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify principals missing both account_id and role_id (mid-registration) are never cached, while placed principals and account-scoped contacts cache normally"]
// CIL[DOC-CONTEXT module="tests/unit/principal-cache" layer="test-unit" related_files=".framework/functions/_shared/principal.ts,.framework/migrations/052_registration_security.sql"]
// CIL[DOC-CONTRACT inputs="none" outputs="vitest assertions" errors="none" side_effects="Mocks @supabase/supabase-js createClient and db module"]
// CIL[DOC-MICRO logic_summary="Drives resolvePrincipal with Bearer tokens while toggling the mocked people row between unplaced and placed states; asserts re-resolution instead of stale cache replay" notable_decisions="Regression coverage for the ~60s 'Account context required' stall documented in app install docs"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="test-engineers"]
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockGetUser, mockPeopleSingle, mockPersonByAuthUid } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockPeopleSingle: vi.fn(),
  mockPersonByAuthUid: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: mockPersonByAuthUid })),
      })),
    })),
    rpc: vi.fn(),
  },
  getUserDb: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ single: mockPeopleSingle })),
      })),
    })),
  })),
}))

import { resolvePrincipal } from '../../functions/_shared/principal.ts'
// CIL[DOC-VECTOR type="context" content="purpose='Unit tests for the human principal cache placement guard'; No verified external callers; imports: .framework/functions/_shared/principal.ts" status="ready"]

const event = (token: string) => ({
  headers: { authorization: `Bearer ${token}`, 'user-agent': 'vitest' },
})

const authUser = { id: 'auth-1', email: 'new-user@example.com' }

function setPerson(person: any) {
  mockPeopleSingle.mockResolvedValue({ data: person, error: null })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: authUser }, error: null })
  mockPersonByAuthUid.mockResolvedValue({ data: { id: 'person-1' } })
})

describe('resolvePrincipal human cache — mid-registration guard', () => {
  it('does not cache a principal with both account_id and role_id null', async () => {
    // First call lands mid-registration (placement RPC has not run yet).
    setPerson({
      id: 'person-1',
      email: authUser.email,
      account_id: null,
      role_id: null,
      role: null,
    })
    const first = await resolvePrincipal(event('tok-unplaced'))
    expect(first.type).toBe('human')
    expect(first.accountId).toBeNull()

    // Placement commits — same token must re-resolve and see the account.
    setPerson({
      id: 'person-1',
      email: authUser.email,
      account_id: 'acct-1',
      role_id: 'role-1',
      role: { id: 'role-1', slug: 'member_admin', name: 'Admin', is_system: false, permissions: [] },
    })
    const second = await resolvePrincipal(event('tok-unplaced'))
    expect(second.accountId).toBe('acct-1')
    expect(second.roles).toEqual(['member_admin'])
    expect(mockPeopleSingle).toHaveBeenCalledTimes(2)
  })

  it('caches a fully placed principal on subsequent requests', async () => {
    setPerson({
      id: 'person-1',
      email: authUser.email,
      account_id: 'acct-1',
      role_id: 'role-1',
      role: { id: 'role-1', slug: 'member', name: 'Member', is_system: false, permissions: [] },
    })
    const first = await resolvePrincipal(event('tok-placed'))
    expect(first.accountId).toBe('acct-1')

    // Second call must hit the cache — the people lookup is not repeated.
    setPerson({
      id: 'person-1',
      email: authUser.email,
      account_id: 'acct-changed',
      role_id: 'role-1',
      role: { id: 'role-1', slug: 'member', name: 'Member', is_system: false, permissions: [] },
    })
    const second = await resolvePrincipal(event('tok-placed'))
    expect(second.accountId).toBe('acct-1')
    expect(mockPeopleSingle).toHaveBeenCalledTimes(1)
  })

  it('caches an account-scoped contact that has no role', async () => {
    // Directory contacts legitimately have account_id without role_id —
    // the both-null guard must not skip caching for this steady state.
    setPerson({
      id: 'person-1',
      email: authUser.email,
      account_id: 'acct-1',
      role_id: null,
      role: null,
    })
    const first = await resolvePrincipal(event('tok-contact'))
    expect(first.accountId).toBe('acct-1')

    setPerson({
      id: 'person-1',
      email: authUser.email,
      account_id: 'acct-other',
      role_id: null,
      role: null,
    })
    const second = await resolvePrincipal(event('tok-contact'))
    expect(second.accountId).toBe('acct-1')
    expect(mockPeopleSingle).toHaveBeenCalledTimes(1)
  })
})

describe('internal invoke secret', () => {
  it('resolves a bare x-internal-secret to the system principal', async () => {
    vi.stubEnv('INTERNAL_INVOKE_SECRET', 'test-secret')
    const p = await resolvePrincipal({ headers: { 'x-internal-secret': 'test-secret' } })
    expect(p.id).toBe('system')
    expect(p.machineType).toBe('internal')
  })

  it('does not trust a wrong secret', async () => {
    vi.stubEnv('INTERNAL_INVOKE_SECRET', 'test-secret')
    const p = await resolvePrincipal({ headers: { 'x-internal-secret': 'wrong' } })
    expect(p.id).toBe('anonymous')
  })
})
// CIL[END stable_id="~/.framework/tests/unit/principal-cache.test.ts:module_header:module_header"]
