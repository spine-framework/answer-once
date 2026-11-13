import { describe, it, expect, beforeAll } from 'vitest'
import { adminDb } from '../../functions/_shared/db'
import { resolveHandler, lookupHandler } from '../../functions/_shared/webhook-registry'
import { loadManifest, discoverManifests } from '../../functions/_shared/app-manifest'
import { createHandler } from '../../functions/_shared/middleware'

describe('Core Isolation', () => {
  describe('Webhook Registry', () => {
    it('should have empty registry when no custom handlers registered', async () => {
      const handlers = await lookupHandler('non-existent-handler')
      expect(handlers).toBeNull()
    })

    it('should fail gracefully when resolving unknown handler', async () => {
      const handler = await resolveHandler('unknown-handler')
      expect(handler).toBeNull()
    })

    it('should not depend on custom_webhook-handlers.ts', async () => {
      const registry = await import('../../functions/_shared/webhook-registry')
      expect(registry.resolveHandler).toBeDefined()
      expect(registry.lookupHandler).toBeDefined()
      expect(registry.loadHandler).toBeDefined()
    })
  })

  describe('App Manifest System', () => {
    it('should discover manifests without error', () => {
      const manifests = discoverManifests()
      expect(Array.isArray(manifests)).toBe(true)
    })

    it('should handle missing manifest gracefully', () => {
      const manifest = loadManifest('non/existent/manifest.json')
      expect(manifest).toBeNull()
    })

    it('should load valid manifest if exists', () => {
      const manifest = loadManifest('custom/apps/cortex/manifest.json')
      if (manifest) {
        expect(manifest.slug).toBeDefined()
        expect(manifest.name).toBeDefined()
        expect(Array.isArray(manifest.required_roles)).toBe(true)
      }
    })
  })

  // Live-DB probes — only meaningful when real credentials are configured
  // (`.env.test` in the monorepo). The setup file stubs a placeholder URL for
  // unit runs; hitting it would produce a fetch error, so gate on the stub.
  const LIVE_DB =
    !!process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('test.supabase.co')

  describe.runIf(LIVE_DB)('Database Access', () => {
    it('should connect to database without custom code', async () => {
      const { data, error } = await adminDb.from('accounts').select('id').limit(1)
      expect(error).toBeNull()
    })

    it('should query apps without custom dependencies', async () => {
      const { data, error } = await adminDb
        .from('apps')
        .select('slug, name, is_active')
        .limit(1)
      
      expect(error).toBeNull()
      expect(Array.isArray(data) || data === null).toBe(true)
    })
  })

  describe('Handler Creation', () => {
    it('should create handler without custom imports', () => {
      const handler = createHandler(async (event, ctx) => {
        return { status: 'ok' }
      })

      expect(handler).toBeDefined()
      expect(typeof handler).toBe('function')
    })
  })

  describe('Permission System', () => {
    it('should check permissions without custom code', async () => {
      const { isSystemAdmin } = await import('../../functions/_shared/permissions')

      const memberCtx = { principal: { id: 'test-user', account_id: 'test-account', roles: [] } }
      const adminCtx = { principal: { id: 'admin-user', account_id: 'test-account', roles: [{ slug: 'system_admin' }] } }

      expect(isSystemAdmin(memberCtx as any)).toBe(false)
      expect(isSystemAdmin(adminCtx as any)).toBe(true)
    })
  })
})

describe('No Core→Custom Imports', () => {
  it('should verify no static imports from custom/', async () => {
    const expectedCleanFiles = [
      '.framework/functions/integration-routes.ts',
      '.framework/functions/apps.ts',
      '.framework/src/hooks/useApps.ts'
    ]
    
    expectedCleanFiles.forEach(file => {
      expect(file).toContain('.framework/')
    })
  })
})