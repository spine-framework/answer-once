// Decision spine-framework:0033 — record-layer atomicity: the 086 migration
// must ship record_atomic_update as service_role-only with a strict
// whitelist grammar, plus the dedupe index that makes insert_once atomic;
// admin-data must route the atomic/insert_once actions.
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join, resolve } from 'path'

const REPO = resolve(__dirname, '../../..')
const MIGRATION = join(REPO, '.framework/migrations/086_atomic_record_ops.sql')
const MIGRATION_FIX = join(REPO, '.framework/migrations/088_record_atomic_update_keys.sql')
const ADMIN_DATA = join(REPO, '.framework/functions/admin-data.ts')

const sql = existsSync(MIGRATION) ? readFileSync(MIGRATION, 'utf8') : ''
const fixSql = existsSync(MIGRATION_FIX) ? readFileSync(MIGRATION_FIX, 'utf8') : ''
const src = existsSync(ADMIN_DATA) ? readFileSync(ADMIN_DATA, 'utf8') : ''

describe('migration 086 — record_atomic_update', () => {
  it('exists and defines the RPC', () => {
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.record_atomic_update\(/)
  })

  it('is SECURITY DEFINER with pinned search_path', () => {
    expect(sql).toMatch(/SECURITY DEFINER/)
    expect(sql).toMatch(/SET search_path = public/)
  })

  it('revokes PUBLIC/anon/authenticated EXECUTE and grants service_role', () => {
    expect(sql).toMatch(/REVOKE ALL ON FUNCTION public\.record_atomic_update\([^)]*\)\s*FROM PUBLIC, anon, authenticated/i)
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.record_atomic_update\([^)]*\)\s*TO service_role/i)
  })

  it('whitelists the typed runtime tables', () => {
    for (const t of ['items', 'threads', 'messages', 'watchers', 'item_progress']) {
      expect(sql).toContain(`'${t}'`)
    }
    // accounts/people/items-adjacent config tables must not be updatable
    expect(sql).not.toMatch(/v_tables[^;]*'accounts'/)
    expect(sql).not.toMatch(/v_tables[^;]*'people'/)
  })

  it('creates the per-type dedupe index for insert_once', () => {
    expect(sql).toMatch(/CREATE UNIQUE INDEX IF NOT EXISTS items_dedupe_key\s+ON public\.items \(type_id, \(data->>'dedupe_key'\)\)/)
    expect(sql).toMatch(/WHERE data \? 'dedupe_key'/)
  })
})

describe('migration 088 — record_atomic_update SRF alias fix', () => {
  // 086 shipped `SELECT key FROM jsonb_object_keys(...)` — the SRF column is
  // named after the function, so every call 42703'd on first invocation.
  // The replacement body must alias the SRF output; db:fixtures also invokes
  // the RPC for real (applied ≠ working).
  it('aliases jsonb_object_keys output in both loops', () => {
    expect(fixSql.match(/FOR v_key IN SELECT t\.key FROM jsonb_object_keys/g)?.length).toBe(2)
    expect(fixSql).not.toMatch(/FOR v_key IN SELECT key FROM/)
  })

  it('keeps the whitelist grammar and service_role-only grants', () => {
    expect(fixSql).toMatch(/SECURITY DEFINER/)
    expect(fixSql).toMatch(/REVOKE ALL ON FUNCTION public\.record_atomic_update\([^)]*\)\s*FROM PUBLIC, anon, authenticated/i)
    expect(fixSql).toMatch(/GRANT EXECUTE ON FUNCTION public\.record_atomic_update\([^)]*\)\s*TO service_role/i)
  })
})

describe('admin-data atomic surface', () => {
  it('routes atomic and insert_once actions', () => {
    expect(src).toMatch(/case 'atomic':/)
    expect(src).toMatch(/case 'insert_once':/)
    expect(src).toMatch(/export const atomic\b/)
    expect(src).toMatch(/export const insertOnce\b/)
  })

  it('validates condition ops against the RPC whitelist', () => {
    expect(src).toContain("'eq'")
    expect(src).toContain("'lte'")
    expect(src).toMatch(/ATOMIC_OPS\s*=\s*\[/)
  })

  it('re-checks update permissions before invoking the RPC', () => {
    // the atomic path must run validateUpdatePermissions — atomicity narrows
    // races, not grants
    const atomicStart = src.indexOf('export const atomic')
    const atomicBody = src.slice(atomicStart, atomicStart + 8000)
    expect(atomicBody).toContain('validateUpdatePermissions')
    expect(atomicBody).toContain("adminDb.rpc('record_atomic_update'")
    expect(atomicBody).toContain('409')
  })

  it('insert_once reuses the create path and returns the existing row on conflict', () => {
    const ioStart = src.indexOf('export const insertOnce')
    const ioBody = src.slice(ioStart, ioStart + 5000)
    expect(ioBody).toContain("'23505'")
    expect(ioBody).toContain('deduplicated')
  })
})
