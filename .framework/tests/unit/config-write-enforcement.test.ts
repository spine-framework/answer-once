// Decision spine-framework:0026 — second-surface config writes on timers
// and triggers require system_admin. These tests pin the deny path: when
// the permission engine's canAccessConfigObject says no, every mutating
// handler must throw before touching the database.
import { describe, it, expect, vi } from 'vitest'

const { fromMock, canAccessMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  canAccessMock: vi.fn()
}))

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: { from: fromMock, rpc: vi.fn() },
  joins: {}
}))

vi.mock('../../functions/_shared/audit.ts', () => ({
  emitLog: vi.fn().mockResolvedValue(undefined),
  emitAudit: vi.fn().mockResolvedValue(undefined),
  emitSpan: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('../../functions/_shared/permissions.ts', () => ({
  sanitizeRecordData: vi.fn((_ctx: any, record: any) => Promise.resolve(record)),
  canAccessRecord: canAccessMock,
  PermissionEngine: {
    isSystemAdmin: vi.fn(() => false),
    resolveFirstSurfacePermissions: vi.fn().mockResolvedValue({
      canCreate: false, canRead: false, canUpdate: false, canDelete: false,
      fieldPermissions: {}
    }),
    canAccessRecord: canAccessMock
  }
}))

import { create as createTimer, update as updateTimer, remove as removeTimer, toggle as toggleTimer } from '../../functions/timers.ts'
import { update as updateTrigger, remove as removeTrigger, toggle as toggleTrigger } from '../../functions/triggers.ts'

// A non-admin member principal — person in an account, no system_admin role.
const memberCtx: any = {
  requestId: 'req-gate-test',
  principal: { id: 'person-1', type: 'human', accountId: 'acct-1', roles: ['member'] },
  accountId: 'acct-1',
  appId: null,
  db: {},
  query: {}
}

describe('second-surface write gates — timers', () => {
  it('create denies a member before any DB write', async () => {
    canAccessMock.mockResolvedValue(false)
    await expect(createTimer(memberCtx, { name: 'n', timer_type: 'interval', config: {} }))
      .rejects.toThrow('Insufficient permissions to create timers')
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('update denies a member before any DB write', async () => {
    canAccessMock.mockResolvedValue(false)
    await expect(updateTimer(memberCtx, { id: 't1', name: 'x' }))
      .rejects.toThrow('Insufficient permissions to update timers')
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('remove denies a member before any DB write', async () => {
    canAccessMock.mockResolvedValue(false)
    await expect(removeTimer(memberCtx, { id: 't1' }))
      .rejects.toThrow('Insufficient permissions to delete timers')
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('toggle denies a member before any DB write', async () => {
    canAccessMock.mockResolvedValue(false)
    await expect(toggleTimer(memberCtx, { id: 't1' }))
      .rejects.toThrow('Insufficient permissions to toggle timers')
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('create checks the second-surface record, not a runtime type', async () => {
    canAccessMock.mockResolvedValue(false)
    await expect(createTimer(memberCtx, { name: 'n', timer_type: 'interval' }))
      .rejects.toThrow('Insufficient permissions')
    expect(canAccessMock).toHaveBeenCalledWith(memberCtx, { type: 'timers' }, 'create')
  })
})

describe('second-surface write gates — triggers', () => {
  it('update denies a member before any DB write', async () => {
    canAccessMock.mockResolvedValue(false)
    await expect(updateTrigger(memberCtx, { id: 'tr1', name: 'x' }))
      .rejects.toThrow('Insufficient permissions to update triggers')
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('remove denies a member before any DB write', async () => {
    canAccessMock.mockResolvedValue(false)
    await expect(removeTrigger(memberCtx, { id: 'tr1' }))
      .rejects.toThrow('Insufficient permissions to delete triggers')
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('toggle denies a member before any DB write', async () => {
    canAccessMock.mockResolvedValue(false)
    await expect(toggleTrigger(memberCtx, { id: 'tr1' }))
      .rejects.toThrow('Insufficient permissions to toggle triggers')
    expect(fromMock).not.toHaveBeenCalled()
  })
})
