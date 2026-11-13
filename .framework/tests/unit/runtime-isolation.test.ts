import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: { from: vi.fn(), rpc: vi.fn() },
  getUserDb: vi.fn()
}))

vi.mock('../../functions/_shared/audit.ts', () => ({
  emitAudit: vi.fn(async () => {}),
  emitLog: vi.fn(async () => {}),
  emitSpan: vi.fn(async () => {})
}))

vi.mock('../../functions/_shared/outcomes.ts', () => ({
  emitOutcome: vi.fn(async () => {})
}))

vi.mock('../../functions/_shared/llm.ts', () => ({
  callOpenAIChat: vi.fn(),
  callOpenAIEmbeddings: vi.fn(async () => ({ data: [{ embedding: [0.1, 0.2] }] }))
}))

vi.mock('../../functions/_shared/permissions.ts', () => ({
  sanitizeRecordData: vi.fn(async (_ctx: any, record: any) => record),
  resolveFirstSurfacePermissions: vi.fn(async () => null),
  validateUpdatePermissions: vi.fn(async () => ({ ok: true }))
}))

vi.mock('../../functions/_shared/logging.ts', () => ({
  withAdminLogging: vi.fn((_ctx: any, _meta: any, fn: any) => fn()),
  logAdminDataOperation: vi.fn(async () => {}),
  resolveLogLevels: vi.fn(async () => []),
  __resetLoggingSettingsCache: vi.fn()
}))

vi.mock('../../functions/_shared/trigger-engine.ts', () => ({
  fireCreateTriggers: vi.fn(async () => {}),
  fireUpdateTriggers: vi.fn(async () => {}),
  fireDeleteTriggers: vi.fn(async () => {})
}))

vi.mock('../../functions/_shared/security.ts', () => ({
  checkTypeSlugRateLimit: vi.fn(async () => {}),
  isBlockedRequest: vi.fn(async () => null),
  isBlockedIp: vi.fn(async () => false),
  touchPersonGeo: vi.fn(async () => {})
}))

vi.mock('../../functions/integration-outbound.ts', () => ({ execute: vi.fn() }))
vi.mock('../../functions/_shared/pipeline-runner.ts', () => ({ runPipeline: vi.fn() }))
// funnel.ts (emitSignal/accountDataFlag) and rate-limit.ts are exercised for
// real — they only depend on adminDb (mocked) and trigger-engine (mocked).
vi.mock('../../cli/context.ts', () => ({
  buildCliContext: vi.fn(),
  handleError: vi.fn()
}))
vi.mock('../../functions/_shared/index.ts', async () => {
  const db = await import('../../functions/_shared/db.ts')
  return { adminDb: db.adminDb }
})

import { adminDb } from '../../functions/_shared/db.ts'
import { getReplyTypeSlug } from '../../functions/_shared/agent-runner.ts'
import { resolveSecurityLevel } from '../../functions/_shared/kb.ts'
import { list, get } from '../../functions/admin-data.ts'
import { emitSignal, accountDataFlag } from '../../functions/_shared/funnel.ts'
import { resolveRateLimitPolicies } from '../../functions/_shared/rate-limit.ts'
import { checkRuntimeWiring } from '../../cli/commands/doctor.ts'

// Chainable + thenable query-builder fake. Every chained call is recorded on
// _calls; terminal single()/maybeSingle() and any await resolve through the
// per-table responder.
function makeBuilder(table: string, respond: (table: string, calls: any[][]) => any, sink: any[][]) {
  const builder: any = { _table: table, _calls: [] as any[][] }
  const calls = builder._calls
  for (const m of ['select', 'eq', 'neq', 'in', 'or', 'ilike', 'order', 'range', 'update', 'insert', 'upsert', 'delete', 'is', 'not', 'contains', 'textSearch', 'limit', 'gt', 'gte', 'lt', 'lte', 'filter']) {
    builder[m] = (...args: any[]) => { calls.push([m, ...args]); return builder }
  }
  builder.single = () => { calls.push(['single']); return Promise.resolve(respond(table, calls)) }
  builder.maybeSingle = () => { calls.push(['maybeSingle']); return Promise.resolve(respond(table, calls)) }
  builder.then = (onF: any, onR: any) => Promise.resolve(respond(table, calls)).then(onF, onR)
  sink.push(calls)
  return builder
}

function makeDb(respond: (table: string, calls: any[][]) => any) {
  const allCalls: any[][] = []
  const from = vi.fn((table: string) => makeBuilder(table, respond, allCalls))
  return { db: { from } as any, from, allCalls }
}

function makeCtx(db: any, query: Record<string, any> = {}) {
  return {
    requestId: 'req-test',
    principal: {
      id: 'person-1',
      type: 'human',
      accountId: 'acct-1',
      isInternal: true,
      roles: ['system_admin'],
      provenance: { sourceType: 'jwt', createdBy: 'person-1', invokedAt: new Date().toISOString() }
    },
    accountId: 'acct-1',
    db,
    appId: 'app-1',
    query
  } as any
}

describe('getReplyTypeSlug (declared thread reply binding)', () => {
  it('returns the declared reply_type_slug', () => {
    const threadType = { slug: 'support_thread', design_schema: { functionality: { thread: { reply_type_slug: 'support_reply' } } } }
    expect(getReplyTypeSlug(threadType)).toBe('support_reply')
  })

  it('honors app-specific slugs without hardcoding', () => {
    const threadType = { slug: 'whatever', design_schema: { functionality: { thread: { reply_type_slug: 'x_reply' } } } }
    expect(getReplyTypeSlug(threadType)).toBe('x_reply')
  })

  it('falls back to message when undeclared, null, or non-string', () => {
    expect(getReplyTypeSlug({ slug: 'support_thread', design_schema: {} })).toBe('message')
    expect(getReplyTypeSlug({ design_schema: { functionality: null } })).toBe('message')
    expect(getReplyTypeSlug(null)).toBe('message')
    expect(getReplyTypeSlug(undefined)).toBe('message')
    expect(getReplyTypeSlug({ design_schema: { functionality: { thread: { reply_type_slug: 42 } } } })).toBe('message')
    expect(getReplyTypeSlug({ design_schema: { functionality: { thread: { reply_type_slug: '' } } } })).toBe('message')
  })
})

describe('resolveSecurityLevel (declared kb security level)', () => {
  it('returns the declared functionality.kb.security_level', () => {
    expect(resolveSecurityLevel({ functionality: { kb: { security_level: 'external' } } })).toBe('external')
    expect(resolveSecurityLevel({ functionality: { kb: { security_level: 'restricted' } } })).toBe('restricted')
  })

  it('denies by default to internal when undeclared or malformed', () => {
    expect(resolveSecurityLevel({})).toBe('internal')
    expect(resolveSecurityLevel(null)).toBe('internal')
    expect(resolveSecurityLevel(undefined)).toBe('internal')
    expect(resolveSecurityLevel({ functionality: null })).toBe('internal')
    expect(resolveSecurityLevel({ functionality: { kb: {} } })).toBe('internal')
    expect(resolveSecurityLevel({ functionality: { kb: { security_level: 7 } } })).toBe('internal')
    // A formerly-mapped slug with no declaration must NOT keep its old level
    expect(resolveSecurityLevel({ functionality: { kb: {} } })).toBe('internal')
  })
})

describe('attachLineage via admin-data get (declared lineage config)', () => {
  const INITIATIVE_TYPE = {
    id: 't-initiative',
    slug: 'workbench_initiative',
    kind: 'item',
    design_schema: {
      functionality: {
        lineage: {
          parent_fields: ['idea_id', 'discovery_id', 'initiative_id', 'epic_id', 'sprint_id'],
          link_type: 'workbench_originated_from',
          children: { workbench_epic: 'initiative_id', workbench_work_item: 'initiative_id' }
        }
      }
    }
  }
  const PLAIN_TYPE = { id: 't-plain', slug: 'support_ticket', kind: 'item', design_schema: { functionality: null } }
  const EPIC_TYPE = { id: 't-epic', slug: 'workbench_epic', kind: 'item', design_schema: {} }
  const WI_TYPE = { id: 't-wi', slug: 'workbench_work_item', kind: 'item', design_schema: {} }
  const DISCOVERY_TYPE = { id: 't-discovery', slug: 'workbench_discovery', kind: 'item', design_schema: {} }

  function setup(opts: {
    record: any
    items?: any[]
    types?: any[]
    parentLinks?: any[]
    childLinks?: any[]
    itemsByField?: Record<string, Record<string, any[]>>
  }) {
    const itemsById: Record<string, any> = {}
    for (const it of opts.items || []) itemsById[it.id] = it
    itemsById[opts.record.id] = opts.record
    const typesById: Record<string, any> = {}
    for (const t of opts.types || []) typesById[t.id] = t
    const allTypes = Object.values(typesById)
    const itemsByField = opts.itemsByField || {}
    const parentLinks = opts.parentLinks || []
    const childLinks = opts.childLinks || []

    vi.mocked(adminDb.from).mockImplementation((table: string) => {
      const b = makeBuilder(table, (tbl, calls) => {
        if (tbl === 'types') {
          const eqId = calls.find(c => c[0] === 'eq' && c[1] === 'id')
          const inIds = calls.find(c => c[0] === 'in' && c[1] === 'id')
          const inSlugs = calls.find(c => c[0] === 'in' && c[1] === 'slug')
          if (eqId && calls.some(c => c[0] === 'single')) {
            return { data: typesById[eqId[2]] || null, error: null }
          }
          if (inIds) {
            return { data: allTypes.filter(t => inIds[2].includes(t.id)).map(t => ({ id: t.id, slug: t.slug })), error: null }
          }
          if (inSlugs) {
            return { data: allTypes.filter(t => inSlugs[2].includes(t.slug)).map(t => ({ id: t.id, kind: t.kind, slug: t.slug })), error: null }
          }
          return { data: null, error: null }
        }
        return { data: [], error: null }
      }, [] as any)
      return b
    })

    const ctxDb = makeDb((tbl, calls) => {
      if (tbl === 'items') {
        const fieldEq = calls.find(c => c[0] === 'eq' && typeof c[1] === 'string' && c[1].startsWith('data->>'))
        const typeEq = calls.find(c => c[0] === 'eq' && c[1] === 'type_id')
        const inIds = calls.find(c => c[0] === 'in' && c[1] === 'id')
        const eqId = calls.find(c => c[0] === 'eq' && c[1] === 'id')
        if (fieldEq) {
          let rows = itemsByField[fieldEq[1]]?.[fieldEq[2]] || []
          if (typeEq) rows = rows.filter((r: any) => r.type_id === typeEq[2])
          return { data: rows, error: null }
        }
        if (inIds) return { data: (inIds[2] as string[]).map(id => itemsById[id]).filter(Boolean), error: null }
        if (eqId && calls.some(c => c[0] === 'single')) return { data: itemsById[eqId[2]] || null, error: null }
        return { data: [], error: null }
      }
      if (tbl === 'links') {
        const sel = calls.find(c => c[0] === 'select')
        const eqSource = calls.find(c => c[0] === 'eq' && c[1] === 'source_id')
        const eqTarget = calls.find(c => c[0] === 'eq' && c[1] === 'target_id')
        if (sel?.[1] === 'target_id') return { data: parentLinks.filter(l => l.source_id === eqSource?.[2]), error: null }
        if (sel?.[1] === 'source_id') return { data: childLinks.filter(l => l.target_id === eqTarget?.[2]), error: null }
        return { data: [], error: null }
      }
      return { data: [], error: null }
    })
    return ctxDb
  }

  it('walks parents via declared link_type first, then declared parent_fields', async () => {
    const record = { id: 'r1', type_id: 't-initiative', data: { discovery_id: 'd-field' } }
    const parent = { id: 'd-link', type_id: 't-discovery', data: {} }
    const db = setup({
      record,
      items: [parent],
      types: [INITIATIVE_TYPE, PLAIN_TYPE, EPIC_TYPE, WI_TYPE, DISCOVERY_TYPE],
      parentLinks: [{ source_id: 'r1', target_id: 'd-link', link_type: 'workbench_originated_from' }],
      childLinks: []
    })
    const result = await get(makeCtx(db.db, { entity: 'items', id: 'r1' }), null)

    expect(result.parents.map((p: any) => p.id)).toEqual(['d-link'])
    const linkCalls = db.allCalls.filter(c => c.some(x => x[0] === 'eq' && x[1] === 'link_type'))
    expect(linkCalls.length).toBeGreaterThan(0)
    expect(linkCalls[0].some(x => x[0] === 'eq' && x[1] === 'link_type' && x[2] === 'workbench_originated_from')).toBe(true)
  })

  it('falls back to declared parent_fields scan when no link edge exists', async () => {
    const record = { id: 'r1', type_id: 't-initiative', data: { discovery_id: 'd-field' } }
    const parent = { id: 'd-field', type_id: 't-discovery', data: {} }
    const db = setup({
      record,
      items: [parent],
      types: [INITIATIVE_TYPE, DISCOVERY_TYPE],
      parentLinks: [],
      childLinks: []
    })
    const result = await get(makeCtx(db.db, { entity: 'items', id: 'r1' }), null)
    expect(result.parents.map((p: any) => p.id)).toEqual(['d-field'])
  })

  it('resolves children via declared children map fields and reverse links', async () => {
    const record = { id: 'r1', type_id: 't-initiative', data: {} }
    const epicChild = { id: 'e1', type_id: 't-epic', data: { initiative_id: 'r1' } }
    const wiChild = { id: 'w1', type_id: 't-wi', data: { initiative_id: 'r1' } }
    const linkChild = { id: 'l1', type_id: 't-discovery', data: {} }
    const db = setup({
      record,
      items: [epicChild, wiChild, linkChild],
      types: [INITIATIVE_TYPE, EPIC_TYPE, WI_TYPE, DISCOVERY_TYPE],
      childLinks: [{ source_id: 'l1', target_id: 'r1', link_type: 'workbench_originated_from' }],
      itemsByField: { 'data->>initiative_id': { r1: [epicChild, wiChild] } }
    })
    const result = await get(makeCtx(db.db, { entity: 'items', id: 'r1' }), null)
    expect(new Set(result.children.map((c: any) => c.id))).toEqual(new Set(['e1', 'w1', 'l1']))
    // child field lookups used the declared field per child type
    const fieldEqs = db.allCalls.flat().filter(c => c[0] === 'eq' && c[1] === 'data->>initiative_id')
    expect(fieldEqs.length).toBe(2)
  })

  it('attaches empty parents/children and skips link queries when the type declares no lineage', async () => {
    const record = { id: 'r2', type_id: 't-plain', data: {} }
    const db = setup({
      record,
      items: [],
      types: [PLAIN_TYPE],
      // even with a matching link present, no link_type is declared so no query runs
      childLinks: [{ source_id: 'x', target_id: 'r2', link_type: 'workbench_originated_from' }]
    })
    const result = await get(makeCtx(db.db, { entity: 'items', id: 'r2' }), null)
    expect(result.parents).toEqual([])
    expect(result.children).toEqual([])
    expect(result.type_slug).toBe('support_ticket')
    expect(db.from.mock.calls.filter((c: any[]) => c[0] === 'links').length).toBe(0)
  })
})

describe('list flag filters (generic record flags)', () => {
  function setupListDb() {
    return makeDb((_tbl, calls) => {
      const sel = calls.find(c => c[0] === 'select')
      if (sel?.[2]?.count === 'exact') return { count: 0, error: null }
      return { data: [], error: null }
    })
  }

  // list uses adminDb for internal principals — use a member principal so the
  // exercised query builder is ctx.db.
  function memberCtx(db: any, query: Record<string, any>) {
    const ctx = makeCtx(db, query)
    ctx.principal.isInternal = false
    ctx.principal.roles = ['member']
    return ctx
  }

  it('flag_only filters data->>field = true on flaggable entities', async () => {
    const db = setupListDb()
    await list(memberCtx(db.db, { entity: 'items', flag_only: 'is_demo' }), null)
    const eqCalls = db.allCalls.flat().filter(c => c[0] === 'eq' && c[1] === 'data->>is_demo' && c[2] === 'true')
    expect(eqCalls.length).toBe(1)
  })

  it('exclude_flag filters flagged rows out (null counts as unset)', async () => {
    const db = setupListDb()
    await list(memberCtx(db.db, { entity: 'items', exclude_flag: 'is_demo' }), null)
    const orCalls = db.allCalls.flat().filter(c => c[0] === 'or' && c[1] === 'data->>is_demo.is.null,data->>is_demo.eq.false')
    expect(orCalls.length).toBe(1)
  })

  it('rejects invalid flag field names with a 400 error', async () => {
    const db = setupListDb()
    await expect(list(memberCtx(db.db, { entity: 'items', flag_only: "x';drop" }), null)).rejects.toThrow('Invalid flag field name')
    await expect(list(memberCtx(db.db, { entity: 'items', exclude_flag: 'Bad-Field' }), null)).rejects.toThrow('Invalid flag field name')
    await expect(list(memberCtx(db.db, { entity: 'items', exclude_flag: '1field' }), null)).rejects.toThrow('Invalid flag field name')
  })

  it('ignores flag params on non-flaggable entities', async () => {
    const db = setupListDb()
    await list(memberCtx(db.db, { entity: 'accounts', exclude_flag: 'is_demo' }), null)
    const orCalls = db.allCalls.flat().filter(c => c[0] === 'or' && String(c[1]).includes('data->>'))
    const eqCalls = db.allCalls.flat().filter(c => c[0] === 'eq' && String(c[1]).startsWith('data->>'))
    expect(orCalls.length).toBe(0)
    expect(eqCalls.length).toBe(0)
  })
})

describe('emitSignal (generic typed signal)', () => {
  const ctx = { accountId: 'acct-1' } as any

  function signalDb(opts: { typeId?: string | null; existing?: any[]; insertError?: string }) {
    return makeDb((table, calls) => {
      if (table === 'types') return { data: opts.typeId ? { id: opts.typeId } : null, error: null }
      if (table === 'items') {
        if (calls.some(c => c[0] === 'insert')) {
          return opts.insertError
            ? { data: null, error: { message: opts.insertError } }
            : { data: { id: 'sig-1' }, error: null }
        }
        return { data: opts.existing ?? [], error: null }
      }
      return { data: null, error: null }
    })
  }

  it('resolves the declared type by (kind=item, slug) and inserts the signal', async () => {
    const db = signalDb({ typeId: 't-sig' })
    vi.mocked(adminDb.from).mockImplementation(db.from)

    const created = await emitSignal(ctx, { type_slug: 'custom_signal', action: 'my_action', data: { source: 'x' } })
    expect(created).toEqual({ id: 'sig-1' })

    const flat = db.allCalls.flat()
    expect(flat.some(c => c[0] === 'eq' && c[1] === 'kind' && c[2] === 'item')).toBe(true)
    expect(flat.some(c => c[0] === 'eq' && c[1] === 'slug' && c[2] === 'custom_signal')).toBe(true)
    const insert = flat.find(c => c[0] === 'insert')
    expect(insert?.[1]?.data?.action_type).toBe('my_action')
    expect(insert?.[1]?.account_id).toBe('acct-1')
  })

  it('dedupes on (account_id, data.action_type) by default', async () => {
    const db = signalDb({ typeId: 't-sig', existing: [{ id: 'prior' }] })
    vi.mocked(adminDb.from).mockImplementation(db.from)

    const result = await emitSignal(ctx, { type_slug: 'custom_signal', action: 'my_action' })
    expect(result).toBeNull()
    const flat = db.allCalls.flat()
    expect(flat.some(c => c[0] === 'eq' && c[1] === 'data->>action_type' && c[2] === 'my_action')).toBe(true)
    expect(flat.some(c => c[0] === 'eq' && c[1] === 'account_id' && c[2] === 'acct-1')).toBe(true)
    expect(flat.some(c => c[0] === 'insert')).toBe(false)
  })

  it('dedupe:false skips the dedupe read and always inserts', async () => {
    const db = signalDb({ typeId: 't-sig', existing: [{ id: 'prior' }] })
    vi.mocked(adminDb.from).mockImplementation(db.from)

    const created = await emitSignal(ctx, { type_slug: 'custom_signal', action: 'my_action', dedupe: false })
    expect(created).toEqual({ id: 'sig-1' })
    const flat = db.allCalls.flat()
    expect(flat.some(c => c[0] === 'eq' && c[1] === 'data->>action_type')).toBe(false)
    expect(flat.some(c => c[0] === 'insert')).toBe(true)
  })

  it('returns null when the type slug does not exist', async () => {
    const db = signalDb({ typeId: null })
    vi.mocked(adminDb.from).mockImplementation(db.from)

    const result = await emitSignal(ctx, { type_slug: 'missing_type', action: 'my_action' })
    expect(result).toBeNull()
    expect(db.from.mock.calls.filter((c: any[]) => c[0] === 'items').length).toBe(0)
  })

  it('never throws — insert failures and DB errors return null', async () => {
    const db = signalDb({ typeId: 't-sig', insertError: 'insert blew up' })
    vi.mocked(adminDb.from).mockImplementation(db.from)
    await expect(emitSignal(ctx, { type_slug: 'custom_signal', action: 'a' })).resolves.toBeNull()

    vi.mocked(adminDb.from).mockImplementation(() => { throw new Error('db down') })
    await expect(emitSignal(ctx, { type_slug: 'custom_signal', action: 'a' })).resolves.toBeNull()
  })
})

describe('accountDataFlag (generic account flag read)', () => {
  const ctx = { accountId: 'acct-1' } as any

  function acctDb(data: any) {
    return makeDb((table) =>
      table === 'accounts' ? { data, error: null } : { data: null, error: null })
  }

  it('returns true only when accounts.data[flag] === true', async () => {
    let db = acctDb({ data: { is_demo: true, other: false } })
    vi.mocked(adminDb.from).mockImplementation(db.from)
    await expect(accountDataFlag(ctx, 'is_demo')).resolves.toBe(true)
    await expect(accountDataFlag(ctx, 'other')).resolves.toBe(false)

    db = acctDb({ data: {} })
    vi.mocked(adminDb.from).mockImplementation(db.from)
    await expect(accountDataFlag(ctx, 'is_demo')).resolves.toBe(false)

    db = acctDb(null)
    vi.mocked(adminDb.from).mockImplementation(db.from)
    await expect(accountDataFlag(ctx, 'is_demo')).resolves.toBe(false)
  })

  it('returns false on DB error (never throws)', async () => {
    vi.mocked(adminDb.from).mockImplementation(() => { throw new Error('db down') })
    await expect(accountDataFlag(ctx, 'is_demo')).resolves.toBe(false)
  })
})

describe('resolveRateLimitPolicies (account-declared policy)', () => {
  function policyDb(opts: { acctData?: any; appConfig?: any }) {
    return makeDb((table) => {
      if (table === 'accounts') {
        return { data: opts.acctData === undefined ? null : { data: opts.acctData }, error: null }
      }
      if (table === 'apps') {
        return { data: opts.appConfig === undefined ? null : { config: opts.appConfig }, error: null }
      }
      return { data: null, error: null }
    })
  }

  it('account-declared rate_limits override wins and skips the apps read', async () => {
    const db = policyDb({
      acctData: { rate_limits: { agent_step: [{ limit: 5, window_seconds: 60 }] } },
      appConfig: { rate_limits: { agent_step: [{ limit: 999, window_seconds: 1 }] } },
    })
    vi.mocked(adminDb.from).mockImplementation(db.from)

    const policies = await resolveRateLimitPolicies({ accountId: 'acct-1', appId: 'app-1' } as any, 'agent_step')
    expect(policies).toEqual([{ limit: 5, window_seconds: 60 }])
    expect(db.from.mock.calls.filter((c: any[]) => c[0] === 'apps').length).toBe(0)
  })

  it('rate_limit_profile selects the named profile inside the calling app config', async () => {
    const db = policyDb({
      acctData: { rate_limit_profile: 'lite' },
      appConfig: { rate_limits: {
        profiles: { lite: { agent_step: [{ limit: 10, window_seconds: 120 }] } },
        agent_step: [{ limit: 999, window_seconds: 1 }],
      } },
    })
    vi.mocked(adminDb.from).mockImplementation(db.from)

    const policies = await resolveRateLimitPolicies({ accountId: 'acct-1', appId: 'app-1' } as any, 'agent_step')
    expect(policies).toEqual([{ limit: 10, window_seconds: 120 }])
  })

  it('profile falls back to the app base policy when the profile lacks the action', async () => {
    const db = policyDb({
      acctData: { rate_limit_profile: 'lite' },
      appConfig: { rate_limits: {
        profiles: { lite: {} },
        agent_step: [{ limit: 30, window_seconds: 60 }],
      } },
    })
    vi.mocked(adminDb.from).mockImplementation(db.from)

    const policies = await resolveRateLimitPolicies({ accountId: 'acct-1', appId: 'app-1' } as any, 'agent_step')
    expect(policies).toEqual([{ limit: 30, window_seconds: 60 }])
  })

  it('plain accounts use the calling app base policy and query exactly one app slug', async () => {
    const db = policyDb({
      acctData: {},
      appConfig: { rate_limits: { agent_step: [{ limit: 200, window_seconds: 3600 }] } },
    })
    vi.mocked(adminDb.from).mockImplementation(db.from)

    const policies = await resolveRateLimitPolicies({ accountId: 'acct-1', appId: 'app-1' } as any, 'agent_step')
    expect(policies).toEqual([{ limit: 200, window_seconds: 3600 }])
    const appsCalls = db.allCalls.filter(c => c.some(x => x[0] === 'eq' && x[1] === 'slug'))
    const flat = db.allCalls.flat()
    const slugEqs = flat.filter(c => c[0] === 'eq' && c[1] === 'slug').map(c => c[2])
    expect(slugEqs).toEqual(['app-1'])
    // exactly one apps query — no second lookup for a named app
    const appsQueries = db.from.mock.calls.filter((c: any[]) => c[0] === 'apps')
    expect(appsQueries.length).toBe(1)
    void appsCalls
  })

  it('returns [] when nothing is configured and on lookup failure', async () => {
    const db = policyDb({ acctData: {}, appConfig: {} })
    vi.mocked(adminDb.from).mockImplementation(db.from)
    await expect(resolveRateLimitPolicies({ accountId: 'acct-1', appId: 'app-1' } as any, 'agent_step'))
      .resolves.toEqual([])

    vi.mocked(adminDb.from).mockImplementation(() => { throw new Error('db down') })
    await expect(resolveRateLimitPolicies({ accountId: 'acct-1', appId: 'app-1' } as any, 'agent_step'))
      .resolves.toEqual([])
  })
})

describe('doctor checkRuntimeWiring (generic referential integrity)', () => {
  function wiringDb(opts: { triggers?: any[]; types?: any[]; pipelines?: any[]; actions?: any[] }) {
    return makeDb((table) => {
      if (table === 'triggers') return { data: opts.triggers ?? [], error: null }
      if (table === 'types') return { data: opts.types ?? [], error: null }
      if (table === 'pipelines') return { data: opts.pipelines ?? [], error: null }
      if (table === 'actions') return { data: opts.actions ?? [], error: null }
      return { data: [], error: null }
    })
  }

  it('passes when every declared reference resolves', async () => {
    const db = wiringDb({
      triggers: [{ id: 't1', slug: 'trig-a', event_type: 'item_updated', pipeline_id: 'p1',
        config: { type_slug: 'kb_article', entity_type: 'items' } }],
      types: [{ slug: 'kb_article', kind: 'item' }],
      pipelines: [{ id: 'p1', slug: 'embed', is_active: true, stages: [{ stage_type: 'update_item' }] }],
      actions: [{ slug: 'update_item' }],
    })
    vi.mocked(adminDb.from).mockImplementation(db.from)

    const res = await checkRuntimeWiring()
    expect(res.name).toBe('runtime_wiring')
    expect(res.status).toBe('pass')
  })

  it('reports dangling type, pipeline, and stage references', async () => {
    const db = wiringDb({
      triggers: [
        { id: 't1', slug: 'trig-a', event_type: 'item_updated', pipeline_id: 'p-missing',
          config: { type_slug: 'ghost_type', entity_type: 'items' } },
        { id: 't2', slug: 'trig-b', event_type: 'item_created', pipeline_id: null,
          config: { pipeline_slug: 'ghost_pipe' } },
        { id: 't3', slug: 'trig-c', event_type: 'item_created', pipeline_id: 'p-inactive', config: {} },
      ],
      types: [{ slug: 'kb_article', kind: 'item' }],
      pipelines: [
        { id: 'p1', slug: 'good', is_active: true, stages: [{ stage_type: 'update_item' }, { stage_type: 'ghost_action' }] },
        { id: 'p-inactive', slug: 'old', is_active: false, stages: [] },
      ],
      actions: [{ slug: 'update_item' }],
    })
    vi.mocked(adminDb.from).mockImplementation(db.from)

    const res = await checkRuntimeWiring()
    expect(res.name).toBe('runtime_wiring')
    expect(res.status).toBe('fail')
    const problems: string[] = res.details?.problems ?? []
    expect(problems.some(p => p === "trigger 'trig-a': type 'ghost_type' not found")).toBe(true)
    expect(problems.some(p => p.includes("pipeline_id 'p-missing' not found"))).toBe(true)
    expect(problems.some(p => p === "trigger 'trig-b': pipeline 'ghost_pipe' not found")).toBe(true)
    expect(problems.some(p => p === "trigger 'trig-c': pipeline 'old' is inactive")).toBe(true)
    expect(problems.some(p => p === "pipeline 'good': stage 1 references missing action 'ghost_action'")).toBe(true)
  })

  it('scopes the type check by declared kind/entity when present', async () => {
    const db = wiringDb({
      triggers: [{ id: 't1', slug: 'trig-x', event_type: 'item_updated', pipeline_id: null,
        config: { type_slug: 'kb_article', entity_type: 'threads' } }],
      types: [{ slug: 'kb_article', kind: 'item' }],
      pipelines: [],
      actions: [],
    })
    vi.mocked(adminDb.from).mockImplementation(db.from)

    const res = await checkRuntimeWiring()
    expect(res.status).toBe('fail')
    expect(res.details?.problems?.[0]).toBe("trigger 'trig-x': type 'kb_article' not found")
  })

  it('flags active pipelines with missing or empty stages but ignores inactive and staged ones', async () => {
    const db = wiringDb({
      pipelines: [
        { id: 'p-empty', slug: 'noop', is_active: true, stages: [] },
        { id: 'p-null', slug: 'no_stages_field', is_active: true },
        { id: 'p-inactive', slug: 'off', is_active: false, stages: [] },
        { id: 'p-ok', slug: 'good', is_active: true, stages: [{ stage_type: 'update_item' }] },
      ],
      actions: [{ slug: 'update_item' }],
    })
    vi.mocked(adminDb.from).mockImplementation(db.from)

    const res = await checkRuntimeWiring()
    expect(res.status).toBe('fail')
    const problems: string[] = res.details?.problems ?? []
    expect(problems).toContain("pipeline 'noop' is active but has no stages (completes without doing anything)")
    expect(problems).toContain("pipeline 'no_stages_field' is active but has no stages (completes without doing anything)")
    expect(problems.some(p => p.includes("'off'"))).toBe(false)
    expect(problems.some(p => p.includes("'good'"))).toBe(false)
  })
})
