import { describe, it, expect, beforeEach, vi } from 'vitest'
import { verifyApiKey } from '../../functions/_shared/hash-api-key'

// S-002: `spine-framework bootstrap` provisions the first system_admin and
// mints the first sk_ key without a browser. These tests pin the idempotent
// skip, the register-path row shape, the auth-user path, and the
// hash-only key storage.

type DbCall = { op: string; args: any[] }
type DbQuery = { table: string; calls: DbCall[] }
type DbResult = { data?: any; error?: any }

const supaState = vi.hoisted(() => ({
  responder: null as null | ((q: DbQuery) => DbResult),
  history: [] as DbQuery[],
  createUser: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from(table: string) {
      const calls: DbCall[] = []
      const query: DbQuery = { table, calls }
      const builder: any = {
        select(...a: any[]) { calls.push({ op: 'select', args: a }); return builder },
        upsert(...a: any[]) { calls.push({ op: 'upsert', args: a }); return builder },
        update(...a: any[]) { calls.push({ op: 'update', args: a }); return builder },
        insert(...a: any[]) { calls.push({ op: 'insert', args: a }); return builder },
        eq(...a: any[]) { calls.push({ op: 'eq', args: a }); return builder },
        neq(...a: any[]) { calls.push({ op: 'neq', args: a }); return builder },
        in(...a: any[]) { calls.push({ op: 'in', args: a }); return builder },
        is(...a: any[]) { calls.push({ op: 'is', args: a }); return builder },
        or(...a: any[]) { calls.push({ op: 'or', args: a }); return builder },
        order(...a: any[]) { calls.push({ op: 'order', args: a }); return builder },
        limit(...a: any[]) { calls.push({ op: 'limit', args: a }); return builder },
        range(...a: any[]) { calls.push({ op: 'range', args: a }); return builder },
        single() { supaState.history.push(query); return Promise.resolve(supaState.responder!(query)) },
        maybeSingle() { supaState.history.push(query); return Promise.resolve(supaState.responder!(query)) },
        then(res: any, rej: any) {
          supaState.history.push(query)
          return Promise.resolve(supaState.responder!(query)).then(res, rej)
        },
      }
      return builder
    },
    auth: {
      admin: {
        createUser: (...args: any[]) => supaState.createUser(...args),
      },
    },
  }),
}))

vi.mock('../../functions/_shared/audit.ts', () => ({
  emitAudit: vi.fn(async () => {}),
  emitSpan: vi.fn(async () => {}),
  emitLog: vi.fn(async () => {}),
  emitActivity: vi.fn(async () => {}),
}))

import { createClient } from '@supabase/supabase-js'
import { runBootstrap } from '../../cli/commands/bootstrap'
import { emitLog } from '../../functions/_shared/audit'

// Per-test table state. `people` routes on recorded ops: `limit` = the
// idempotent system_admin existence check, `insert`/`update` = writes,
// anything else = the email lookup (maybeSingle).
const tables = {
  account: { id: 'acct-spine' } as any,
  role: { id: 'role-admin' } as any,
  personType: { id: 'type-person', design_schema: { fields: {} }, validation_schema: {} } as any,
  existingAdmins: [] as any[],
  personByEmail: null as any,
}

function defaultResponder(q: DbQuery): DbResult {
  const ops = q.calls.map((c) => c.op)
  switch (q.table) {
    case 'accounts':
      return { data: tables.account, error: null }
    case 'roles':
      return { data: tables.role, error: null }
    case 'types':
      return { data: tables.personType, error: null }
    case 'people':
      if (ops.includes('insert')) return { data: { id: 'person-new' }, error: null }
      if (ops.includes('update')) return { data: null, error: null }
      if (ops.includes('limit')) return { data: tables.existingAdmins, error: null }
      return { data: tables.personByEmail, error: null }
    case 'api_keys': {
      const row = q.calls.find((c) => c.op === 'insert')?.args?.[0] || {}
      return {
        data: { id: 'key-1', name: row.name, key_prefix: row.key_prefix, scopes: row.scopes },
        error: null,
      }
    }
    default:
      return { data: null, error: null }
  }
}

function queriesTo(table: string, op?: string): DbQuery[] {
  return supaState.history.filter(
    (q) => q.table === table && (!op || q.calls.some((c) => c.op === op))
  )
}

function insertedRow(table: string): any {
  const q = queriesTo(table, 'insert')[0]
  return q?.calls.find((c) => c.op === 'insert')?.args?.[0]
}

beforeEach(() => {
  supaState.history = []
  supaState.createUser.mockReset()
  vi.mocked(emitLog).mockClear()
  tables.account = { id: 'acct-spine' }
  tables.role = { id: 'role-admin' }
  tables.personType = { id: 'type-person', design_schema: { fields: {} }, validation_schema: {} }
  tables.existingAdmins = []
  tables.personByEmail = null
  supaState.responder = defaultResponder
})

function db() {
  return createClient('https://example.supabase.co', 'service-key') as any
}

describe('bootstrap idempotency', () => {
  it('skips person creation when a system_admin already exists, still mints a key', async () => {
    tables.existingAdmins = [{ id: 'person-admin', email: 'root@x.com' }]

    const result = await runBootstrap(db(), {})

    expect(result.admin).toBe('existing')
    expect(result.personId).toBe('person-admin')
    expect(result.authUserCreated).toBe(false)
    expect(queriesTo('people', 'insert')).toHaveLength(0)
    expect(queriesTo('people', 'update')).toHaveLength(0)
    expect(queriesTo('api_keys', 'insert')).toHaveLength(1)
    expect(result.apiKey.raw_key).toMatch(/^sk_[0-9a-f]{32}$/)
    // Only the key mint is audited — no person.created event.
    const events = vi.mocked(emitLog).mock.calls.map((c) => c[1])
    expect(events).toEqual(['api_key.created'])
  })

  it('creates the first admin person (db-only) when none exists', async () => {
    const result = await runBootstrap(db(), {})

    expect(result.admin).toBe('created')
    expect(result.authUserCreated).toBe(false)
    expect(result.personEmail).toBe('admin@spine.local')

    const row = insertedRow('people')
    // Register-path (handle_new_auth_user) column parity.
    expect(row.account_id).toBe('acct-spine')
    expect(row.role_id).toBe('role-admin')
    expect(row.type_id).toBe('type-person')
    expect(row.status).toBe('active')
    expect(row.is_active).toBe(true)
    expect(row.auth_uid).toBeNull()
    expect(row.email).toBe('admin@spine.local')
    expect(row.full_name).toBe('admin')
    expect(row.design_schema).toEqual({ fields: {} })
    expect(supaState.createUser).not.toHaveBeenCalled()
    expect(vi.mocked(emitLog).mock.calls.map((c) => c[1])).toEqual([
      'person.created',
      'api_key.created',
    ])
  })

  it('creates a confirmed auth user + person when --email/--password are given', async () => {
    supaState.createUser.mockResolvedValue({
      data: { user: { id: 'auth-1' } },
      error: null,
    })

    const result = await runBootstrap(db(), {
      email: 'me@x.com',
      password: 's3cret',
      fullName: 'Me',
    })

    expect(supaState.createUser).toHaveBeenCalledWith({
      email: 'me@x.com',
      password: 's3cret',
      email_confirm: true,
      user_metadata: { full_name: 'Me' },
    })
    expect(result.authUserCreated).toBe(true)
    const row = insertedRow('people')
    // Register path: person id === auth user id, auth_uid === auth user id.
    expect(row.id).toBe('auth-1')
    expect(row.auth_uid).toBe('auth-1')
    expect(row.email).toBe('me@x.com')
    expect(row.full_name).toBe('Me')
  })

  it('rejects --password without --email before any DB work', async () => {
    await expect(runBootstrap(db(), { password: 'x' })).rejects.toThrow('--password requires --email')
    expect(supaState.history).toHaveLength(0)
  })

  it('fails clearly when the spine-system account seed is missing', async () => {
    tables.account = null
    await expect(runBootstrap(db(), {})).rejects.toThrow(/spine-system account not found/)
    expect(queriesTo('api_keys', 'insert')).toHaveLength(0)
  })
})

describe('bootstrap api key minting', () => {
  it('stores only the hash — raw key is returned once and verifies', async () => {
    const result = await runBootstrap(db(), {})

    const keyRow = insertedRow('api_keys')
    expect(keyRow.key_hash).toMatch(/^pbkdf2\$\d+\$/)
    expect(keyRow.key_prefix).toBe(result.apiKey.raw_key.slice(0, 8))
    expect(keyRow.raw_key).toBeUndefined()
    expect(keyRow.key_value).toBeUndefined()
    expect(verifyApiKey(result.apiKey.raw_key, keyRow.key_hash)).toBe(true)
    expect(keyRow.is_active).toBe(true)
    expect(keyRow.created_by).toBe(result.personId)
    expect(keyRow.account_id).toBe('acct-spine')
  })

  it('defaults to the system_admin wildcard scope', async () => {
    const result = await runBootstrap(db(), {})
    expect(result.apiKey.scopes).toEqual(['*:*'])
    expect(insertedRow('api_keys').scopes).toEqual(['*:*'])
  })

  it('honors repeated --scope flags for narrower keys', async () => {
    const result = await runBootstrap(db(), { scopes: ['items:read', 'items:write'] })
    expect(insertedRow('api_keys').scopes).toEqual(['items:read', 'items:write'])
    expect(result.apiKey.scopes).toEqual(['items:read', 'items:write'])
  })

  it('maps the literal system_admin scope to *:*', async () => {
    const result = await runBootstrap(db(), { scopes: ['system_admin'] })
    expect(result.apiKey.scopes).toEqual(['*:*'])
  })
})
