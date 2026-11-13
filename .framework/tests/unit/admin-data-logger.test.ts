
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: {
    from: vi.fn()
  },
  getUserDb: vi.fn()
}))

vi.mock('../../functions/_shared/principal.ts', () => ({
  formatPrincipalForAudit: vi.fn((principal: any) => ({
    id: principal?.id,
    type: principal?.type
  }))
}))

import { resolveLogLevels, withAdminLogging, logAdminDataOperation, __resetLoggingSettingsCache } from '../../functions/_shared/logging'
import { adminDb } from '../../functions/_shared/db'


function makePrincipal(overrides: any = {}) {
  return {
    id: 'user-123',
    type: 'human',
    accountId: 'account-123',
    provenance: {
      sourceType: 'jwt',
      createdBy: 'user-123',
      invokedAt: new Date().toISOString()
    },
    ...overrides
  }
}


function makeCtx(overrides: any = {}) {
  return {
    requestId: 'req-123',
    principal: makePrincipal(),
    accountId: 'account-123',
    db: adminDb,
    appId: 'app-123',
    ...overrides
  }
}


function mockDb(settings: any[] = []) {
  const insertMock = vi.fn(() => Promise.resolve({ data: { id: 'log-1' }, error: null }))

  ;(adminDb.from as any).mockImplementation((table: string) => {
    if (table === 'system_settings') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: settings, error: null }))
        }))
      }
    }

    if (table === 'logs') {
      return {
        insert: insertMock
      }
    }

    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }
  })

  return { insertMock }
}


describe('admin-data logger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    __resetLoggingSettingsCache()
  })

  describe('resolveLogLevels', () => {
    it('returns default timing and errors when no settings exist', async () => {
      mockDb([])
      const ctx = makeCtx()
      const levels = await resolveLogLevels(ctx, { entity: 'items', action: 'list' })
      expect(levels).toEqual(['timing', 'errors'])
    })

    it('uses global levels from system_settings', async () => {
      mockDb([{ scope: 'global', scope_id: null, value: { levels: ['all'] } }])
      const ctx = makeCtx()
      const levels = await resolveLogLevels(ctx, { entity: 'items', action: 'list' })
      expect(levels).toEqual(['all'])
    })

    it('header x-log-level wins over global config', async () => {
      mockDb([{ scope: 'global', scope_id: null, value: { levels: ['timing'] } }])
      const ctx = makeCtx({ logLevel: 'errors' })
      const levels = await resolveLogLevels(ctx, { entity: 'items', action: 'list' })
      expect(levels).toEqual(['errors'])
    })

    it('source override wins over global', async () => {
      mockDb([
        { scope: 'global', scope_id: null, value: { levels: ['timing'] } },
        { scope: 'source', scope_id: 'synthetic-test', value: { levels: ['all'] } }
      ])
      const ctx = makeCtx({ source: 'synthetic-test' })
      const levels = await resolveLogLevels(ctx, { entity: 'items', action: 'list' })
      expect(levels).toEqual(['all'])
    })

    it('entity tool override wins over global', async () => {
      mockDb([
        { scope: 'global', scope_id: null, value: { levels: ['timing'] } },
        { scope: 'tool', scope_id: 'items', value: { levels: ['errors'] } }
      ])
      const ctx = makeCtx()
      const levels = await resolveLogLevels(ctx, { entity: 'items', action: 'list' })
      expect(levels).toEqual(['errors'])
    })
  })

  describe('logAdminDataOperation', () => {
    it('skips logging for logs entity to avoid recursion', async () => {
      const { insertMock } = mockDb()
      const ctx = makeCtx()
      await logAdminDataOperation(ctx, { entity: 'logs', action: 'create' })
      expect(insertMock).not.toHaveBeenCalled()
    })

    it('writes a timing log for default levels', async () => {
      const { insertMock } = mockDb([
        { scope: 'global', scope_id: null, value: { levels: ['timing', 'errors'] } }
      ])
      const ctx = makeCtx()
      await logAdminDataOperation(ctx, {
        entity: 'items',
        action: 'list',
        durationMs: 12,
        rowCount: 5
      })

      expect(insertMock).toHaveBeenCalledOnce()
      const inserted = insertMock.mock.calls[0][0]
      expect(inserted.source).toBe('admin-data')
      expect(inserted.source_type).toBe('items')
      expect(inserted.context.duration_ms).toBe(12)
      expect(inserted.context.row_count).toBe(5)
    })

    it('writes an error log when an error is provided', async () => {
      const { insertMock } = mockDb([
        { scope: 'global', scope_id: null, value: { levels: ['errors'] } }
      ])
      const ctx = makeCtx()
      await logAdminDataOperation(ctx, {
        entity: 'items',
        action: 'create',
        error: new Error('db failed')
      })

      expect(insertMock).toHaveBeenCalledOnce()
      const inserted = insertMock.mock.calls[0][0]
      expect(inserted.level).toBe('error')
      expect(inserted.message).toContain('failed')
      expect(inserted.context.error_message).toBe('db failed')
    })

    it('does not write timing logs when only errors are enabled', async () => {
      const { insertMock } = mockDb([
        { scope: 'global', scope_id: null, value: { levels: ['errors'] } }
      ])
      const ctx = makeCtx()
      await logAdminDataOperation(ctx, {
        entity: 'items',
        action: 'list',
        durationMs: 12
      })

      expect(insertMock).not.toHaveBeenCalled()
    })
  })

  describe('withAdminLogging', () => {
    it('returns operation result and logs timing', async () => {
      const { insertMock } = mockDb([
        { scope: 'global', scope_id: null, value: { levels: ['timing', 'errors'] } }
      ])
      const ctx = makeCtx()

      const result = await withAdminLogging(
        ctx,
        { entity: 'items', action: 'create' },
        async () => ({ id: 'item-1', title: 'Test' })
      )

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(result).toEqual({ id: 'item-1', title: 'Test' })
      expect(insertMock).toHaveBeenCalledOnce()
      const inserted = insertMock.mock.calls[0][0]
      expect(inserted.source_id).toBe('item-1')
      expect(inserted.metadata.record_id).toBe('item-1')
      expect(inserted.message).toContain('admin-data create items')
    })

    it('logs errors and rethrows', async () => {
      const { insertMock } = mockDb([
        { scope: 'global', scope_id: null, value: { levels: ['errors'] } }
      ])
      const ctx = makeCtx()

      await expect(
        withAdminLogging(
          ctx,
          { entity: 'items', action: 'create' },
          async () => {
            throw new Error('boom')
          }
        )
      ).rejects.toThrow('boom')

      await new Promise(resolve => setTimeout(resolve, 0))

      expect(insertMock).toHaveBeenCalledOnce()
      const inserted = insertMock.mock.calls[0][0]
      expect(inserted.level).toBe('error')
    })
  })
})
