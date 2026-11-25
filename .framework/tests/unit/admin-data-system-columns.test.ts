// Decision spine-framework:0032 — status/is_active are protected system
// columns: a record-level update/create grant never covers them; writes need
// a system principal or an explicit fields.<col>.permissions /
// system_fields.<col> grant. `title` is exempt (required member-set field).
import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn()
  }
}))

import { adminDb } from '../../functions/_shared/db.ts'
import { PermissionEngine, canWriteSystemColumn } from '../../functions/_shared/permissions.ts'

function ctxFor(principal: any) {
  return { principal, accountId: 'acct-1', db: {}, requestId: 't' } as any
}

const memberCtx = ctxFor({ id: 'p1', type: 'human', roles: ['member'] })
const adminCtx = ctxFor({ id: 'p2', type: 'human', roles: ['system_admin'] })
const internalCtx = ctxFor({ id: 'sys', type: 'machine', isInternal: true, scopes: [] })
const globalMachineCtx = ctxFor({ id: 'm1', type: 'machine', scopes: ['*:*'] })

describe('canWriteSystemColumn', () => {
  it('allows system principals', () => {
    expect(canWriteSystemColumn(adminCtx, {}, 'status')).toBe(true)
    expect(canWriteSystemColumn(internalCtx, {}, 'status')).toBe(true)
    expect(canWriteSystemColumn(globalMachineCtx, {}, 'is_active')).toBe(true)
  })

  it('denies members without a grant', () => {
    expect(canWriteSystemColumn(memberCtx, {}, 'status')).toBe(false)
    expect(canWriteSystemColumn(memberCtx, { record_permissions: { member: ['create','read','update'] } }, 'status')).toBe(false)
  })

  it('honors fields.<col>.permissions grants', () => {
    const schema = { fields: { status: { system: true, permissions: { member: ['read', 'write'] } } } }
    expect(canWriteSystemColumn(memberCtx, schema, 'status')).toBe(true)
  })

  it('honors system_fields grants and the all wildcard', () => {
    expect(canWriteSystemColumn(memberCtx, { system_fields: { status: { member: ['write'] } } }, 'status')).toBe(true)
    expect(canWriteSystemColumn(memberCtx, { system_fields: { is_active: { all: ['write'] } } }, 'is_active')).toBe(true)
  })

  it('denies grants scoped to other roles or read-only', () => {
    const schema = { system_fields: { status: { finance: ['write'], member: ['read'] } } }
    expect(canWriteSystemColumn(memberCtx, schema, 'status')).toBe(false)
  })
})

describe('validateUpdatePermissions — protected system columns', () => {
  function recordWith(schema: any) {
    return { id: 'r1', account_id: 'acct-1', item_type: 'thing', design_schema: schema, status: 'draft' }
  }
  const memberSchema = {
    record_permissions: { member: ['create', 'read', 'update'] },
    fields: { title: { system: true, data_type: 'text' } }
  }

  function mockMemberRole() {
    ;(adminDb.single as any).mockResolvedValue({ data: { role: { slug: 'member' } } })
  }

  it('denies a member PATCHing status through the update passthrough', async () => {
    mockMemberRole()
    const r = await PermissionEngine.validateUpdatePermissions(
      memberCtx, { status: 'live' }, recordWith(memberSchema), 'thing')
    expect(r.valid).toBe(false)
    expect(r.error).toMatch(/system column 'status'/)
  })

  it('denies is_active writes on a fields-less schema (no early-return bypass)', async () => {
    mockMemberRole()
    const r = await PermissionEngine.validateUpdatePermissions(
      memberCtx, { is_active: false },
      recordWith({ record_permissions: { member: ['create','read','update'] }, fields: {} }), 'thing')
    expect(r.valid).toBe(false)
  })

  it('still allows data and title writes for the same member', async () => {
    mockMemberRole()
    const r = await PermissionEngine.validateUpdatePermissions(
      memberCtx, { title: 'New name' }, recordWith(memberSchema), 'thing')
    expect(r.valid).toBe(true)
  })

  it('allows member status writes when the schema grants it', async () => {
    mockMemberRole()
    const schema = { ...memberSchema, fields: { ...memberSchema.fields, status: { system: true, data_type: 'text', permissions: { member: ['write'] } } } }
    const r = await PermissionEngine.validateUpdatePermissions(
      memberCtx, { status: 'live' }, recordWith(schema), 'thing')
    expect(r.valid).toBe(true)
  })

  it('allows system_admin unconditionally', async () => {
    const r = await PermissionEngine.validateUpdatePermissions(
      adminCtx, { status: 'live' }, recordWith(memberSchema), 'thing')
    expect(r.valid).toBe(true)
  })
})

// Decision 0036 — the outer write bypasses must accept isSystemPrincipal
// (system_admin roles OR an unbound internal machine principal), matching
// the access checks. A bare internal machine principal — what
// handler_module:'custom' handlers run as — previously passed access but
// failed write validation as a misleading 'Authentication required'.
describe('admin-data — internal machine principal write bypass (0036)', () => {
  const src = readFileSync(
    join(__dirname, '../../functions/admin-data.ts'), 'utf8')

  it('no write-validation bypass uses the narrower role-only isSystemAdmin', () => {
    expect(src).not.toMatch(/!validation\.valid && !isSystemAdmin\(ctx\.principal\)/)
    expect(src).not.toMatch(/!perms\.canDelete && !isSystemAdmin\(ctx\.principal\)/)
  })

  it('update, delete, and atomic paths bypass for isSystemPrincipal', () => {
    const bypasses = src.match(/!isSystemPrincipal\(ctx\)/g) || []
    expect(bypasses.length).toBeGreaterThanOrEqual(4)
  })
})
