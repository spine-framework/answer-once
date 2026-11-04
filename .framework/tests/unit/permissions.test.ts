// CIL[BEGIN stable_id="~/.framework/tests/unit/permissions.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Test setup and imports for permission tests"]
// CIL[DOC-RESPONSIBILITY responsibility="Configure test environment and mock dependencies"]
// CIL[DOC-CONTEXT module="tests/unit/permissions" layer="test-unit" related_files=".framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="configured test mocks" errors="none" side_effects="Mocks database and middleware modules"]
// CIL[DOC-MICRO logic_summary="Imports vitest, mocks db and middleware, imports Principal type" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="test-engineers"]
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
}))

vi.mock('../../functions/_shared/middleware.ts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../functions/_shared/middleware.ts')>()
  return { ...actual }
})

import type { Principal } from '../../functions/_shared/principal.ts'
// CIL[DOC-VECTOR type="context" content="purpose='Test setup and imports for permission tests'; No verified external callers; imports: .framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/permissions.test.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/permissions.test.ts:makePrincipal:function" type="function" identity="makePrincipal" parent="none"]
// CIL[DOC-MACRO purpose="Create test principal with default values"]
// CIL[DOC-RESPONSIBILITY responsibility="Generate test principal objects"]
// CIL[DOC-CONTEXT module="tests/unit/permissions" layer="test-unit" related_files=".framework/functions/_shared/principal.ts,.framework/tests/unit/permissions.test.ts"]
// CIL[DOC-CONTRACT inputs="overrides: Partial<Principal>" outputs="Principal object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns default human principal with overrides applied" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function makePrincipal(overrides: Partial<Principal> = {}): Principal {
  return {
    id: 'user-123',
    type: 'human',
    accountId: 'account-123',
    roles: ['member'],
    provenance: {
      sourceType: 'jwt',
      createdBy: 'user-123',
      invokedAt: new Date().toISOString()
    },
    ...overrides
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Create test principal with default values'; No verified external callers; imports: .framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/permissions.test.ts:makePrincipal:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/permissions.test.ts:makeCtx:function" type="function" identity="makeCtx" parent="none"]
// CIL[DOC-MACRO purpose="Create test context from principal"]
// CIL[DOC-RESPONSIBILITY responsibility="Generate test context objects"]
// CIL[DOC-CONTEXT module="tests/unit/permissions" layer="test-unit" related_files=".framework/functions/_shared/principal.ts,.framework/tests/unit/permissions.test.ts"]
// CIL[DOC-CONTRACT inputs="principal: Principal" outputs="CoreContext object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates context with principal, accountId, empty db, and requestId" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function makeCtx(principal: Principal) {
  return {
    principal,
    accountId: principal.accountId,
    db: {},
    requestId: 'test-req-id'
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Create test context from principal'; No verified external callers; imports: .framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/permissions.test.ts:makeCtx:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/permissions.test.ts:describe_isSystemAdmin:block" type="block" identity="describe_isSystemAdmin" parent="none"]
// CIL[DOC-MACRO purpose="Test isSystemAdmin permission function"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify system admin role detection"]
// CIL[DOC-CONTEXT module="tests/unit/permissions" layer="test-unit" related_files=".framework/functions/_shared/principal.ts,.framework/tests/unit/permissions.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test assertions" errors="none" side_effects="Tests principal.ts module"]
// CIL[DOC-MICRO logic_summary="Tests system_admin role detection for humans and machines" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
describe('isSystemAdmin', () => {
  it('returns true for system_admin role', async () => {
    const { isSystemAdmin } = await import('../../functions/_shared/principal.ts')
    const principal = makePrincipal({ roles: ['admin', 'system_admin'] })
    expect(isSystemAdmin(principal)).toBe(true)
  })

  it('returns false for non-admin roles', async () => {
    const { isSystemAdmin } = await import('../../functions/_shared/principal.ts')
    const principal = makePrincipal({ roles: ['admin', 'member'] })
    expect(isSystemAdmin(principal)).toBe(false)
  })

  it('returns false for machine principals', async () => {
    const { isSystemAdmin } = await import('../../functions/_shared/principal.ts')
    const principal = makePrincipal({
      type: 'machine',
      roles: undefined,
      scopes: ['*:*']
    })
    expect(isSystemAdmin(principal)).toBe(false)
  })
})
// CIL[DOC-VECTOR type="context" content="purpose='Test isSystemAdmin permission function'; No verified external callers; imports: .framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/permissions.test.ts:describe_isSystemAdmin:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/permissions.test.ts:describe_machineHasScope:block" type="block" identity="describe_machineHasScope" parent="none"]
// CIL[DOC-MACRO purpose="Test machineHasScope permission function"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify machine principal scope matching"]
// CIL[DOC-CONTEXT module="tests/unit/permissions" layer="test-unit" related_files=".framework/functions/_shared/principal.ts,.framework/tests/unit/permissions.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test assertions" errors="none" side_effects="Tests principal.ts module"]
// CIL[DOC-MICRO logic_summary="Tests exact, wildcard, and global scope matching for machines" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
describe('machineHasScope', () => {
  it('matches exact scope', async () => {
    const { machineHasScope } = await import('../../functions/_shared/principal.ts')
    const principal = makePrincipal({ type: 'machine', scopes: ['items:read', 'people:write'] })
    expect(machineHasScope(principal, 'items:read')).toBe(true)
    expect(machineHasScope(principal, 'items:write')).toBe(false)
  })

  it('matches wildcard resource scope', async () => {
    const { machineHasScope } = await import('../../functions/_shared/principal.ts')
    const principal = makePrincipal({ type: 'machine', scopes: ['items:*'] })
    expect(machineHasScope(principal, 'items:read')).toBe(true)
    expect(machineHasScope(principal, 'items:write')).toBe(true)
    expect(machineHasScope(principal, 'people:read')).toBe(false)
  })

  it('matches global wildcard *:*', async () => {
    const { machineHasScope } = await import('../../functions/_shared/principal.ts')
    const principal = makePrincipal({ type: 'machine', scopes: ['*:*'] })
    expect(machineHasScope(principal, 'items:read')).toBe(true)
    expect(machineHasScope(principal, 'anything:anything')).toBe(true)
  })

  it('returns false for human principals', async () => {
    const { machineHasScope } = await import('../../functions/_shared/principal.ts')
    const principal = makePrincipal({ type: 'human', scopes: ['items:read'] })
    expect(machineHasScope(principal, 'items:read')).toBe(false)
  })

  it('returns false when no scopes assigned', async () => {
    const { machineHasScope } = await import('../../functions/_shared/principal.ts')
    const principal = makePrincipal({ type: 'machine', scopes: [] })
    expect(machineHasScope(principal, 'items:read')).toBe(false)
  })
})
// CIL[DOC-VECTOR type="context" content="purpose='Test machineHasScope permission function'; No verified external callers; imports: .framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/permissions.test.ts:describe_machineHasScope:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/permissions.test.ts:describe_humanHasRole:block" type="block" identity="describe_humanHasRole" parent="none"]
// CIL[DOC-MACRO purpose="Test humanHasRole permission function"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify human principal role checking"]
// CIL[DOC-CONTEXT module="tests/unit/permissions" layer="test-unit" related_files=".framework/functions/_shared/principal.ts,.framework/tests/unit/permissions.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test assertions" errors="none" side_effects="Tests principal.ts module"]
// CIL[DOC-MICRO logic_summary="Tests role presence checking for human principals" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
describe('humanHasRole', () => {
  it('returns true when role is present', async () => {
    const { humanHasRole } = await import('../../functions/_shared/principal.ts')
    const principal = makePrincipal({ roles: ['admin', 'member'] })
    expect(humanHasRole(principal, 'admin')).toBe(true)
  })

  it('returns false when role is absent', async () => {
    const { humanHasRole } = await import('../../functions/_shared/principal.ts')
    const principal = makePrincipal({ roles: ['member'] })
    expect(humanHasRole(principal, 'admin')).toBe(false)
  })

  it('returns false for machine principals', async () => {
    const { humanHasRole } = await import('../../functions/_shared/principal.ts')
    const principal = makePrincipal({ type: 'machine' })
    expect(humanHasRole(principal, 'admin')).toBe(false)
  })
})
// CIL[DOC-VECTOR type="context" content="purpose='Test humanHasRole permission function'; No verified external callers; imports: .framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/permissions.test.ts:describe_humanHasRole:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/permissions.test.ts:describe_sanitizeRecordData:block" type="block" identity="describe_sanitizeRecordData" parent="none"]
// CIL[DOC-MACRO purpose="Test sanitizeRecordData permission function"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify record data sanitization by role"]
// CIL[DOC-CONTEXT module="tests/unit/permissions" layer="test-unit" related_files=".framework/functions/_shared/principal.ts,.framework/tests/unit/permissions.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="test assertions" errors="none" side_effects="Tests permissions.ts module"]
// CIL[DOC-MICRO logic_summary="Tests config record sanitization for different user types" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
describe('sanitizeRecordData — second surface (config objects)', () => {
  const configRecord = {
    id: 'cfg-1',
    slug: 'my-type',
    name: 'My Type',
    kind: 'item',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    _table: 'types'
  }

  it('system_admin receives full config record', async () => {
    const { sanitizeRecordData } = await import('../../functions/_shared/permissions.ts')
    const principal = makePrincipal({ roles: ['system_admin'] })
    const ctx = makeCtx(principal)
    const result = await sanitizeRecordData(ctx, configRecord, 'types')
    expect(result).toHaveProperty('slug')
    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('kind')
  })

  it('machine principal with *:* receives full config record', async () => {
    const { sanitizeRecordData } = await import('../../functions/_shared/permissions.ts')
    const principal = makePrincipal({ type: 'machine', scopes: ['*:*'], roles: ['system_admin'] })
    const ctx = makeCtx(principal)
    const result = await sanitizeRecordData(ctx, configRecord, 'types')
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('slug')
  })

  it('non-admin human receives minimal stub from config record', async () => {
    const { sanitizeRecordData } = await import('../../functions/_shared/permissions.ts')
    const principal = makePrincipal({ roles: ['member'] })
    const ctx = makeCtx(principal)
    const result = await sanitizeRecordData(ctx, configRecord, 'types')
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('created_at')
    expect(result).not.toHaveProperty('kind')
    expect(result).not.toHaveProperty('slug')
  })
})
// CIL[DOC-VECTOR type="context" content="purpose='Test sanitizeRecordData permission function'; No verified external callers; imports: .framework/functions/_shared/principal.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/permissions.test.ts:describe_sanitizeRecordData:block"]
