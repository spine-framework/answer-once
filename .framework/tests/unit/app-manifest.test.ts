import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import * as runtimeMod from '../../functions/_shared/app-manifest.ts'
import * as mcpMod from '../../../.framework/mcp/shared/app-manifest.ts'

const modules = [
  ['runtime .framework/functions/_shared/app-manifest.ts', runtimeMod],
  ['mcp .framework/mcp/shared/app-manifest.ts', mcpMod],
] as const

let root: string
let savedRepoPath: string | undefined

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'spine-app-manifest-'))
  savedRepoPath = process.env.REPO_PATH
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
  if (savedRepoPath === undefined) delete process.env.REPO_PATH
  else process.env.REPO_PATH = savedRepoPath
})

function writeJson(dir: string, data: unknown, file = 'manifest.json'): void {
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, file), typeof data === 'string' ? data : JSON.stringify(data))
}

const VALID = {
  name: 'Test App',
  slug: 'test-app',
  routes: ['/x'],
  nav_items: [],
}

for (const [label, mod] of modules) {
  describe(`loadManifest (${label})`, () => {
    beforeEach(() => mod.clearManifestCache())

    it('returns null for a missing file', () => {
      expect(mod.loadManifest('custom/apps/none/manifest.json', root)).toBeNull()
    })

    it('returns null for malformed JSON', () => {
      writeJson(root, '{not json')
      expect(mod.loadManifest('manifest.json', root)).toBeNull()
    })

    it('returns null for JSON null', () => {
      writeJson(root, 'null')
      expect(mod.loadManifest('manifest.json', root)).toBeNull()
    })

    it('returns null for a JSON array root', () => {
      writeJson(root, [{ slug: 'x', name: 'x' }])
      expect(mod.loadManifest('manifest.json', root)).toBeNull()
    })

    it('returns null for a JSON primitive root', () => {
      for (const body of ['"x"', '7', 'true']) {
        writeJson(root, body)
        expect(mod.loadManifest('manifest.json', root), body).toBeNull()
      }
    })

    it('returns null when name or slug is missing or not a nonempty string', () => {
      writeJson(root, { name: 'x' })
      expect(mod.loadManifest('manifest.json', root)).toBeNull()
      writeJson(root, { slug: 'x' })
      expect(mod.loadManifest('manifest.json', root)).toBeNull()
      writeJson(root, { slug: '', name: 'x' })
      expect(mod.loadManifest('manifest.json', root)).toBeNull()
      writeJson(root, { slug: 7, name: 'x' })
      expect(mod.loadManifest('manifest.json', root)).toBeNull()
      writeJson(root, { slug: 'x', name: '   ' })
      expect(mod.loadManifest('manifest.json', root)).toBeNull()
    })

    it('returns null for a slug outside the allowed charset', () => {
      for (const slug of ['Demo-App', 'demo_app', '9demo', '-demo', 'demo app']) {
        writeJson(root, { ...VALID, slug })
        expect(mod.loadManifest('manifest.json', root), slug).toBeNull()
      }
    })

    it('returns null when required_roles is not an array of nonempty strings', () => {
      for (const rr of ['member', ['member', 5], ['member', ''], [null], ['member', '   ']]) {
        writeJson(root, { ...VALID, required_roles: rr })
        expect(mod.loadManifest('manifest.json', root), JSON.stringify(rr)).toBeNull()
      }
    })

    it('defaults required_roles to [] when absent and loads a valid manifest', () => {
      writeJson(root, VALID)
      const m = mod.loadManifest('manifest.json', root)
      expect(m).not.toBeNull()
      expect(m!.slug).toBe('test-app')
      expect(m!.required_roles).toEqual([])
    })

    it('keeps an OR-role array verbatim', () => {
      writeJson(root, { ...VALID, required_roles: ['member', 'member_admin'] })
      const m = mod.loadManifest('manifest.json', root)
      expect(m!.required_roles).toEqual(['member', 'member_admin'])
    })

    it('rejects a lexical path escaping the project root', () => {
      const outside = mkdtempSync(join(tmpdir(), 'spine-outside-'))
      try {
        writeJson(outside, VALID)
        expect(mod.loadManifest(relative(root, join(outside, 'manifest.json')), root)).toBeNull()
        expect(mod.loadManifest(join(outside, 'manifest.json'), root)).toBeNull()
      } finally {
        rmSync(outside, { recursive: true, force: true })
      }
    })

    it('rejects a manifest that is an external symlink', () => {
      const outside = mkdtempSync(join(tmpdir(), 'spine-outside-'))
      try {
        writeJson(outside, VALID)
        mkdirSync(join(root, 'custom/apps/ext'), { recursive: true })
        symlinkSync(join(outside, 'manifest.json'), join(root, 'custom/apps/ext/manifest.json'))
        expect(mod.loadManifest('custom/apps/ext/manifest.json', root)).toBeNull()
      } finally {
        rmSync(outside, { recursive: true, force: true })
      }
    })

    it('caches by canonical path so the same relative path in different roots never collides', () => {
      const rootB = mkdtempSync(join(tmpdir(), 'spine-app-manifest-b-'))
      try {
        writeJson(join(root, 'custom/apps/a'), { ...VALID, slug: 'a-one' })
        writeJson(join(rootB, 'custom/apps/a'), { ...VALID, slug: 'a-two' })
        const m1 = mod.loadManifest('custom/apps/a/manifest.json', root)
        const m2 = mod.loadManifest('custom/apps/a/manifest.json', rootB)
        const m1Again = mod.loadManifest('custom/apps/a/manifest.json', root)
        expect(m1!.slug).toBe('a-one')
        expect(m2!.slug).toBe('a-two')
        expect(m1Again!.slug).toBe('a-one')
      } finally {
        rmSync(rootB, { recursive: true, force: true })
      }
    })
  })

  describe(`mergeWithManifest (${label})`, () => {
    beforeEach(() => {
      mod.clearManifestCache()
      process.env.REPO_PATH = root
    })

    const dbRecord = {
      id: 'db-1',
      slug: 'db-slug',
      config_source: 'manifest',
      manifest_path: 'custom/apps/test-app/manifest.json',
      route_prefix: '/test-app',
      renderer: 'custom',
      config: { knowledge: { account: true } },
      required_roles: ['db_role_a', 'db_role_b'],
      is_active: true,
      is_system: false,
      account_id: 'acct-1',
      ownership: 'account',
    }

    it('manifest role array wins and db route_prefix/renderer/config are retained', () => {
      writeJson(join(root, 'custom/apps/test-app'), { ...VALID, required_roles: ['member', 'member_admin'] })
      const merged = mod.mergeWithManifest(dbRecord)
      expect(merged.required_roles).toEqual(['member', 'member_admin'])
      expect(merged.route_prefix).toBe('/test-app')
      expect(merged.renderer).toBe('custom')
      expect(merged.config).toEqual({ knowledge: { account: true } })
      expect(merged._source).toBe('manifest')
      expect(merged.id).toBe('db-1')
    })

    it('keeps an empty manifest role array verbatim', () => {
      writeJson(join(root, 'custom/apps/test-app'), { ...VALID, required_roles: [] })
      const merged = mod.mergeWithManifest(dbRecord)
      expect(merged.required_roles).toEqual([])
      expect(merged.min_role).toBeNull()
    })

    it('falls back to the db record preserving an existing required_roles array including empty', () => {
      const merged = mod.mergeWithManifest({ slug: 'x', config_source: 'database', required_roles: [], min_role: 'member' })
      expect(merged.required_roles).toEqual([])
      expect(merged._source).toBe('database')
      const merged2 = mod.mergeWithManifest({ slug: 'x', config_source: 'database', required_roles: ['a', 'b'] })
      expect(merged2.required_roles).toEqual(['a', 'b'])
    })

    it('derives required_roles from min_role only when db.required_roles is absent', () => {
      const merged = mod.mergeWithManifest({ slug: 'x', config_source: 'database', min_role: 'member' })
      expect(merged.required_roles).toEqual(['member'])
      const merged2 = mod.mergeWithManifest({ slug: 'x', config_source: 'database' })
      expect(merged2.required_roles).toEqual([])
    })

    it('returns the db fallback tagged database when the manifest cannot be loaded', () => {
      const merged = mod.mergeWithManifest({ ...dbRecord, manifest_path: 'custom/apps/missing/manifest.json' })
      expect(merged._source).toBe('database (manifest missing)')
      expect(merged.required_roles).toEqual(['db_role_a', 'db_role_b'])
    })

    it('returns null for a falsy record', () => {
      expect(mod.mergeWithManifest(null)).toBeNull()
    })
  })
}

describe('discoverManifests (runtime)', () => {
  beforeEach(() => runtimeMod.clearManifestCache())

  it('enumerates custom/apps children sorted lexically', () => {
    writeJson(join(root, 'custom/apps/zeta'), { ...VALID, slug: 'zeta' })
    writeJson(join(root, 'custom/apps/alpha'), { ...VALID, slug: 'alpha' })
    writeJson(join(root, 'custom/apps/mid'), { ...VALID, slug: 'mid' })
    const found = runtimeMod.discoverManifests(root)
    expect(found).toEqual([
      { slug: 'alpha', path: 'custom/apps/alpha/manifest.json' },
      { slug: 'mid', path: 'custom/apps/mid/manifest.json' },
      { slug: 'zeta', path: 'custom/apps/zeta/manifest.json' },
    ])
  })

  it('returns [] when custom/apps is absent', () => {
    expect(runtimeMod.discoverManifests(root)).toEqual([])
  })

  it('skips a directory whose name does not match the manifest slug', () => {
    writeJson(join(root, 'custom/apps/renamed'), { ...VALID, slug: 'other-slug' })
    writeJson(join(root, 'custom/apps/good'), { ...VALID, slug: 'good' })
    const found = runtimeMod.discoverManifests(root)
    expect(found).toEqual([{ slug: 'good', path: 'custom/apps/good/manifest.json' }])
  })

  it('skips an external symlink app dir but inspects an internal symlink dir', () => {
    const outside = mkdtempSync(join(tmpdir(), 'spine-outside-'))
    try {
      writeJson(outside, { ...VALID, slug: 'external' })
      mkdirSync(join(root, 'custom/apps'), { recursive: true })
      symlinkSync(outside, join(root, 'custom/apps/external'))

      const internalTarget = join(root, 'internal-target/linked')
      writeJson(internalTarget, { ...VALID, slug: 'linked' })
      symlinkSync(internalTarget, join(root, 'custom/apps/linked'))

      const found = runtimeMod.discoverManifests(root)
      expect(found).toEqual([{ slug: 'linked', path: 'custom/apps/linked/manifest.json' }])
    } finally {
      rmSync(outside, { recursive: true, force: true })
    }
  })
})
