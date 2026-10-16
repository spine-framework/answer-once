// CIL[BEGIN stable_id="~/.framework/tests/unit/admin-data-logger.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Provide imports, mocks, and test helpers for the admin-data logger unit test"]
// CIL[DOC-RESPONSIBILITY responsibility="Load dependencies, mock shared modules, and expose functions used by the test suite"]
// CIL[DOC-CONTEXT module="admin-data-logger" layer="unit" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="imported modules and vi mocks" errors="none" side_effects="mocks db and principal helpers"]
// CIL[DOC-MICRO logic_summary="Imports vitest utilities, mocks the shared db and principal modules, and pulls in the logging functions under test" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]

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
// CIL[DOC-VECTOR type="context" content="purpose='Provide imports, mocks, and test helpers for the admin-data logger unit test'; No verified external callers; imports: .framework/functions/_shared/logging.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/admin-data-logger.test.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/admin-data-logger.test.ts:makeprincipal:function" type="function" identity="makePrincipal" parent="none"]
// CIL[DOC-MACRO purpose="Create a test principal object with sensible defaults and optional overrides"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a reusable principal fixture for unit tests"]
// CIL[DOC-CONTEXT module="admin-data-logger" layer="unit" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/tests/unit/admin-data-logger.test.ts"]
// CIL[DOC-CONTRACT inputs="overrides: any" outputs="Principal object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns a default principal and spreads any overrides" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

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
// CIL[DOC-VECTOR type="context" content="purpose='Create a test principal object with sensible defaults and optional overrides'; No verified external callers; imports: .framework/functions/_shared/logging.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/admin-data-logger.test.ts:makeprincipal:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/admin-data-logger.test.ts:makectx:function" type="function" identity="makeCtx" parent="none"]
// CIL[DOC-MACRO purpose="Build a test request context using a default principal and optional overrides"]
// CIL[DOC-RESPONSIBILITY responsibility="Supply a standard RequestContext fixture for unit tests"]
// CIL[DOC-CONTEXT module="admin-data-logger" layer="unit" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/tests/unit/admin-data-logger.test.ts"]
// CIL[DOC-CONTRACT inputs="overrides: any" outputs="RequestContext object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Constructs a context with request id, principal, account, db, and app id then applies overrides" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

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
// CIL[DOC-VECTOR type="context" content="purpose='Build a test request context using a default principal and optional overrides'; No verified external callers; imports: .framework/functions/_shared/logging.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/admin-data-logger.test.ts:makectx:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/admin-data-logger.test.ts:mockdb:function" type="function" identity="mockDb" parent="none"]
// CIL[DOC-MACRO purpose="Mock Supabase client methods to simulate logging settings and log inserts"]
// CIL[DOC-RESPONSIBILITY responsibility="Configure vi.fn mocks for adminDb.from so tests can control select and insert behavior"]
// CIL[DOC-CONTEXT module="admin-data-logger" layer="unit" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/tests/unit/admin-data-logger.test.ts"]
// CIL[DOC-CONTRACT inputs="settings: any[]" outputs="insertMock spy" errors="none" side_effects="mutates adminDb.from implementation"]
// CIL[DOC-MICRO logic_summary="Sets up mock implementations for system_settings and logs tables and returns the insert spy" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

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
// CIL[DOC-VECTOR type="context" content="purpose='Mock Supabase client methods to simulate logging settings and log inserts'; No verified external callers; imports: .framework/functions/_shared/logging.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/admin-data-logger.test.ts:mockdb:function"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/admin-data-logger.test.ts:admin_data_logger_tests:function" type="function" identity="admin_data_logger_tests" parent="none"]
// CIL[DOC-MACRO purpose="Unit test suite for admin-data logging utilities"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify resolveLogLevels, logAdminDataOperation, and withAdminLogging under mocked database conditions"]
// CIL[DOC-CONTEXT module="admin-data-logger" layer="unit" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/logging.ts,.framework/tests/unit/admin-data-logger.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="vitest assertions and mock expectations" errors="assertion failures" side_effects="reads and writes to mocked adminDb"]
// CIL[DOC-MICRO logic_summary="Groups tests for log level resolution, conditional inserts, timing and error logging, and wrapper behavior" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

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
// CIL[DOC-VECTOR type="context" content="purpose='Unit test suite for admin-data logging utilities'; No verified external callers; imports: .framework/functions/_shared/logging.ts,.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/admin-data-logger.test.ts:admin_data_logger_tests:function"]
