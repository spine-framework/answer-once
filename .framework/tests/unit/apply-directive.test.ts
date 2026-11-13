import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CoreContext } from '../../functions/_shared/middleware.ts'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: { from: vi.fn(), rpc: vi.fn() }
}))
vi.mock('../../functions/_shared/audit.ts', () => ({
  emitAudit: vi.fn().mockResolvedValue(undefined),
  emitLog: vi.fn().mockResolvedValue(undefined),
  emitSpan: vi.fn().mockResolvedValue(undefined)
}))
vi.mock('../../functions/_shared/outcomes.ts', () => ({
  emitOutcome: vi.fn().mockResolvedValue(undefined)
}))
vi.mock('../../functions/_shared/llm.ts', () => ({
  callOpenAIChat: vi.fn(),
  callOpenAIEmbeddings: vi.fn().mockResolvedValue({ data: [{ embedding: [0.1] }] })
}))
vi.mock('../../functions/admin-data.ts', () => ({
  create: vi.fn().mockResolvedValue({ id: 'msg-1', content: 'stub' })
}))
vi.mock('../../functions/integration-outbound.ts', () => ({
  execute: vi.fn()
}))
vi.mock('../../functions/_shared/pipeline-runner.ts', () => ({
  runPipeline: vi.fn().mockResolvedValue({ status: 'completed' })
}))
vi.mock('../../functions/_shared/notify.ts', () => ({
  resolveNotificationRecipients: vi.fn().mockResolvedValue(['person-9'])
}))
vi.mock('../../functions/_shared/resolve-ids.ts', () => ({
  resolveTypeId: vi.fn().mockResolvedValue('watcher-type-1'),
  resolveLinkTypeId: vi.fn().mockResolvedValue('link-type-1')
}))
vi.mock('../../functions/_shared/funnel.ts', () => ({
  emitSignal: vi.fn().mockResolvedValue(undefined),
  accountDataFlag: vi.fn().mockResolvedValue(true)
}))
vi.mock('../../functions/_shared/kb.ts', async (importOriginal) => {
  const actual = await importOriginal<any>()
  return { ...actual, resolveKnowledgeScope: vi.fn() }
})

import { adminDb } from '../../functions/_shared/db.ts'
import { resolveKnowledgeScope } from '../../functions/_shared/kb.ts'
import { executeApplyDirective, renderDirectiveTemplate } from '../../functions/_shared/agent-runner.ts'

function makeCtx(): CoreContext {
  return {
    principal: { id: 'person-1', type: 'human', accountId: 'acct-1', roles: ['member'], provenance: {} },
    accountId: 'acct-1',
    db: {},
    requestId: 'req-test',
    appId: 'test-app',
  } as CoreContext
}

const TICKET_FIELDS = {
  title: { system: true, data_type: 'text' },
  status: { system: true, data_type: 'select' },
  priority: { system: true, data_type: 'select' },
  team: { system: false, data_type: 'text' },
  secret_field: { system: true, data_type: 'text' },
}

function makeDirective(overrides: any = {}) {
  return {
    id: 'dir-1',
    account_id: 'acct-1',
    type: { slug: 'ao_triage_directive' },
    data: {
      title: 'Sales handoff',
      status: 'active',
      mode: 'suggest',
      actions: { record_ops: { tags: ['sales'] } },
      ...overrides,
    },
  }
}

// adminDb.from returns a per-table fluent mock. For 'items' the .single()
// resolves by the last .eq('id', <value>) — ticket vs directive.
function mockDb(opts: {
  threadTarget?: string | null
  ticket?: any
  directive?: any
  subscriptions?: any[]
  pipelineOwner?: 'tenant' | 'platform' | 'unscoped' | 'missing'
}) {
  const updates: { table: string; payload: any }[] = []
  const inserts: { table: string; payload: any }[] = []
  const eqLog: { table: string; col: string; val: any }[] = []
  const pipelineOwnerAcct: Record<string, string | undefined> = {
    tenant: 'acct-1',
    platform: 'platform-1',
    unscoped: undefined,
    missing: '__never__',
  }
  vi.mocked(adminDb.from).mockImplementation((table: string) => {
    const q: any = {
      _eqVal: undefined,
      _accountEq: undefined,
      select: vi.fn(() => q),
      eq: vi.fn((col: string, val: any) => {
        eqLog.push({ table, col, val })
        if (col === 'id') q._eqVal = val
        if (col === 'account_id') q._accountEq = val
        return q
      }),
      or: vi.fn(() => q),
      in: vi.fn(() => q),
      order: vi.fn(() => q),
      limit: vi.fn(() => q),
      filter: vi.fn(() => q),
      update: vi.fn((payload: any) => { updates.push({ table, payload }); return q }),
      insert: vi.fn((payload: any) => { inserts.push({ table, payload }); return Promise.resolve({ error: null }) }),
      maybeSingle: vi.fn(() => {
        if (table === 'pipelines') {
          const owner = opts.pipelineOwner ?? 'unscoped'
          const wants = pipelineOwnerAcct[owner]
          const hasAccountFilter = q._accountEq !== undefined
          const hit = owner === 'missing'
            ? false
            : hasAccountFilter ? q._accountEq === wants : owner === 'unscoped'
          return Promise.resolve({ data: hit ? { id: `pipe-${owner}` } : null, error: null })
        }
        return Promise.resolve({ data: null, error: null })
      }),
      single: vi.fn(() => {
        if (table === 'threads') {
          return Promise.resolve({ data: { id: 'thread-1', target_id: opts.threadTarget === undefined ? 'ticket-1' : opts.threadTarget, data: {}, type: { slug: 'ao_ticket_thread' } }, error: null })
        }
        if (table === 'items') {
          const row = q._eqVal === 'dir-1' ? opts.directive : opts.ticket
          return Promise.resolve({ data: row ?? null, error: row ? null : { message: 'not found' } })
        }
        if (table === 'pipelines') {
          return Promise.resolve({ data: { id: 'pipe-1' }, error: null })
        }
        return Promise.resolve({ data: null, error: null })
      }),
      // PostgREST chains are thenable — bare awaits on a chain (e.g. the
      // subscription items query) resolve with the fixture's row list.
      then: (res: any) => Promise.resolve({ data: opts.subscriptions || [], error: null }).then(res),
    }
    return q
  })
  return { updates, inserts, eqLog }
}

const TICKET = {
  id: 'ticket-1',
  account_id: 'acct-1',
  data: {},
  type: { slug: 'ao_support_ticket', design_schema: { fields: TICKET_FIELDS } },
}

const RUN_CTX = {
  threadId: 'thread-1',
  config: {
    agent: { id: 'agent-1' },
    promptConfig: { id: 'pc-1', metadata: { directive_type_slug: 'ao_triage_directive' } },
    matched_directive_ids: ['dir-1'],
  } as any,
}

// runCtx variants for the episode-scoped apply guard
const RUN_CTX_NO_MATCHES = {
  threadId: 'thread-1',
  config: {
    agent: { id: 'agent-1' },
    promptConfig: { id: 'pc-1', metadata: { directive_type_slug: 'ao_triage_directive' } },
    matched_directive_ids: [],
  } as any,
}
const RUN_CTX_OTHER_MATCH = {
  threadId: 'thread-1',
  config: {
    agent: { id: 'agent-1' },
    promptConfig: { id: 'pc-1', metadata: { directive_type_slug: 'ao_triage_directive' } },
    matched_directive_ids: ['dir-9'],
  } as any,
}

// The cross-account path calls resolveKnowledgeScope to check the app
// envelope's platform action allowlist. Default: platform account exists but
// grants nothing — platform directives only execute when a test opts in.
const DENIED_SCOPE = {
  allowed: true,
  platformAccountId: 'platform-1',
  platformActionItemTypes: [] as string[],
  accountIds: ['acct-1', 'platform-1'],
  selfAccountIds: ['acct-1'],
  accountItemTypes: null,
  platformItemTypes: [],
  cilProjectIds: null,
  rpcItemTypes: null,
  violations: [],
}
const ALLOWED_SCOPE = { ...DENIED_SCOPE, platformActionItemTypes: ['ao_triage_directive'] }

const RUN_CTX_SUB = {
  threadId: 'thread-1',
  config: {
    agent: { id: 'agent-1' },
    promptConfig: { id: 'pc-1', metadata: { directive_type_slug: 'ao_triage_directive', directive_subscription_type_slug: 'ao_directive_subscription' } },
    matched_directive_ids: ['dir-1'],
  } as any,
}

describe('executeApplyDirective — gates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(resolveKnowledgeScope).mockResolvedValue(DENIED_SCOPE as any)
  })

  it('throws without a thread context', async () => {
    await expect(executeApplyDirective({ directive_id: 'dir-1' }, makeCtx()))
      .rejects.toThrow('requires an active agent thread context')
  })

  it('rejects when the agent has no directive_type_slug configured', async () => {
    mockDb({})
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), {
      threadId: 'thread-1',
      config: { promptConfig: { id: 'pc-1', metadata: {} } } as any,
    })
    expect(res.applied).toBe(false)
    expect(res.error).toMatch(/not configured/)
  })

  it('rejects a record of the wrong type', async () => {
    mockDb({ ticket: TICKET, directive: { ...makeDirective(), type: { slug: 'ao_kb_article' } } })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX)
    expect(res.applied).toBe(false)
    expect(res.error).toMatch(/not the declared directive type/)
  })

  it('rejects a non-active directive', async () => {
    mockDb({ ticket: TICKET, directive: makeDirective({ status: 'draft' }) })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX)
    expect(res.applied).toBe(false)
    expect(res.error).toMatch(/only active directives/)
  })

  it('rejects a directive from another account', async () => {
    mockDb({ ticket: TICKET, directive: { ...makeDirective(), account_id: 'acct-other' } })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX)
    expect(res.applied).toBe(false)
    expect(res.error).toMatch(/different account/)
  })

  it('is idempotent — same directive on the same ticket is skipped', async () => {
    mockDb({ ticket: { ...TICKET, data: { matched_directive_id: 'dir-1' } }, directive: makeDirective() })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX)
    expect(res.already_applied).toBe(true)
  })

  it('rejects when recall matched zero directives this episode', async () => {
    mockDb({ ticket: TICKET, directive: makeDirective() })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX_NO_MATCHES)
    expect(res.applied).toBe(false)
    expect(res.error).toMatch(/no routing directives were matched/)
  })

  it('rejects a directive_id outside the episode match set (invented id)', async () => {
    mockDb({ ticket: TICKET, directive: makeDirective() })
    const res = await executeApplyDirective({ directive_id: 'dir-1', rationale: 'guessing' }, makeCtx(), RUN_CTX_OTHER_MATCH)
    expect(res.applied).toBe(false)
    expect(res.error).toMatch(/not among the directives matched/)
  })

  it('rejects set_fields on undeclared or non-allowlisted system fields', async () => {
    mockDb({
      ticket: TICKET,
      directive: makeDirective({ actions: { record_ops: { set_fields: { secret_field: 'x', nope: 1 } } } }),
    })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX)
    expect(res.applied).toBe(false)
    expect(res.error).toMatch(/rejected undeclared or system fields/)
    expect(res.error).toMatch(/secret_field/)
  })
})

describe('executeApplyDirective — execution', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(resolveKnowledgeScope).mockResolvedValue(DENIED_SCOPE as any)
  })

  it('applies tags + stamps and ends the episode (suggest mode, no reply)', async () => {
    const { updates } = mockDb({
      ticket: TICKET,
      directive: makeDirective({ actions: { record_ops: { tags: ['sales'], set_fields: { team: 'sales' } } } }),
    })
    const res = await executeApplyDirective({ directive_id: 'dir-1', rationale: 'asked for sales', confidence: 0.9 }, makeCtx(), RUN_CTX)
    expect(res.applied).toBe(true)
    expect(res.ends_episode).toBe(true)
    expect(res.actions_taken).toContain('tags')
    expect(res.actions_taken).toContain('set_fields')
    const itemsUpdate = updates.find(u => u.table === 'items')
    expect(itemsUpdate.payload.data.tags).toEqual(['sales'])
    expect(itemsUpdate.payload.data.team).toBe('sales')
    expect(itemsUpdate.payload.data.matched_directive_id).toBe('dir-1')
    expect(itemsUpdate.payload.data.directive_match_confidence).toBe(0.9)
  })

  it('continue:true keeps the episode alive', async () => {
    mockDb({ ticket: TICKET, directive: makeDirective({ actions: { continue: true } }) })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX)
    expect(res.applied).toBe(true)
    expect(res.ends_episode).toBe(false)
  })

  it('suggest mode writes an internal note and stamps suggested_reply', async () => {
    const { updates } = mockDb({
      ticket: TICKET,
      directive: makeDirective({ reply_template: 'Thanks — sales will call about {{ticket.title}}.', actions: {} }),
    })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX)
    expect(res.applied).toBe(true)
    expect(res.mode).toBe('suggest')
    expect(res.reply_posted).toBe(false)
    const itemsUpdate = updates.find(u => u.table === 'items')
    expect(itemsUpdate.payload.data.suggested_directive_id).toBe('dir-1')
    expect(itemsUpdate.payload.data.suggested_reply).toContain('sales will call')
  })

  it('auto_reply posts an external reply and reports reply_posted', async () => {
    mockDb({
      ticket: TICKET,
      directive: makeDirective({ mode: 'auto_reply', reply_template: 'Sales will call you.', actions: {} }),
    })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX)
    expect(res.applied).toBe(true)
    expect(res.reply_posted).toBe(true)
  })

  it('creates deduped watcher rows from record_ops.watchers', async () => {
    const { inserts } = mockDb({
      ticket: TICKET,
      directive: makeDirective({ actions: { record_ops: { watchers: ['role:sales'] } } }),
    })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX)
    expect(res.applied).toBe(true)
    const watcherInsert = inserts.find(i => i.table === 'watchers')
    expect(watcherInsert.payload.person_id).toBe('person-9')
    expect(watcherInsert.payload.target_id).toBe('ticket-1')
    expect(watcherInsert.payload.watch_type).toBe('all')
  })

  it('runs named pipelines with directive trigger data, non-fatally', async () => {
    mockDb({
      ticket: TICKET,
      directive: makeDirective({ actions: { run_pipelines: ['ao_sales_handoff'] } }),
    })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX)
    expect(res.applied).toBe(true)
    expect(res.actions_taken).toContain('pipeline:ao_sales_handoff')
  })
})

describe('executeApplyDirective — platform directives', () => {
  const platformDirective = (dataOverrides: any = {}, topOverrides: any = {}) => ({
    ...makeDirective(dataOverrides),
    account_id: 'platform-1',
    ...topOverrides,
  })
  const sub = (overrides: any = {}) => ({
    id: 'sub-1',
    data: { directive_id: 'dir-1', status: 'active', max_tier: 'orchestrate', ...overrides },
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(resolveKnowledgeScope).mockResolvedValue(ALLOWED_SCOPE as any)
  })

  it('applies an annotate-tier platform directive with no subscription', async () => {
    const { updates } = mockDb({ ticket: TICKET, directive: platformDirective() })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX)
    expect(res.applied).toBe(true)
    expect(res.actions_taken).toContain('tags')
    const itemsUpdate = updates.find(u => u.table === 'items')
    expect(itemsUpdate.payload.data.directive_scope).toBe('platform')
    expect(itemsUpdate.payload.data.directive_account_id).toBe('platform-1')
  })

  it('rejects a cross-account directive that is not platform-owned', async () => {
    mockDb({ ticket: TICKET, directive: { ...makeDirective(), account_id: 'acct-other' } })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX)
    expect(res.applied).toBe(false)
    expect(res.error).toMatch(/different account/)
  })

  it('rejects a platform directive whose type is not action-allowlisted', async () => {
    vi.mocked(resolveKnowledgeScope).mockResolvedValue(DENIED_SCOPE as any)
    mockDb({ ticket: TICKET, directive: platformDirective() })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX)
    expect(res.applied).toBe(false)
    expect(res.error).toMatch(/not action-allowlisted/)
  })

  it('rejects a mutate-tier platform directive when no subscription type is configured', async () => {
    mockDb({
      ticket: TICKET,
      directive: platformDirective({ actions: { record_ops: { set_fields: { team: 'sales' } } } }),
    })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX)
    expect(res.applied).toBe(false)
    expect(res.error).toMatch(/directive_subscription_type_slug/)
  })

  it('rejects a mutate-tier platform directive with no active subscription', async () => {
    mockDb({
      ticket: TICKET,
      directive: platformDirective({ actions: { record_ops: { set_fields: { team: 'sales' } } } }),
      subscriptions: [],
    })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX_SUB)
    expect(res.applied).toBe(false)
    expect(res.error).toMatch(/requires tenant opt-in/)
  })

  it('rejects when subscription max_tier is insufficient for the directive', async () => {
    mockDb({
      ticket: TICKET,
      directive: platformDirective({ actions: { run_pipelines: ['ao_sales_handoff'] } }),
      subscriptions: [sub({ max_tier: 'respond' })],
    })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX_SUB)
    expect(res.applied).toBe(false)
    expect(res.error).toMatch(/does not permit/)
  })

  it('applies an orchestrate-tier platform directive once subscribed', async () => {
    mockDb({
      ticket: TICKET,
      directive: platformDirective({ actions: { run_pipelines: ['ao_sales_handoff'] } }),
      subscriptions: [sub()],
      pipelineOwner: 'platform',
    })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX_SUB)
    expect(res.applied).toBe(true)
    expect(res.actions_taken).toContain('pipeline:ao_sales_handoff')
  })

  it('resolves pipeline slugs tenant-first, then platform', async () => {
    const { eqLog } = mockDb({
      ticket: TICKET,
      directive: platformDirective({ actions: { run_pipelines: ['ao_sales_handoff'] } }),
      subscriptions: [sub()],
      pipelineOwner: 'platform',
    })
    await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX_SUB)
    const pipelineAccountEqs = eqLog.filter(e => e.table === 'pipelines' && e.col === 'account_id')
    expect(pipelineAccountEqs.map(e => e.val)).toEqual(['acct-1', 'platform-1'])
  })

  it('auto_reply platform directive requires respond-tier opt-in', async () => {
    mockDb({
      ticket: TICKET,
      directive: platformDirective({ mode: 'auto_reply', reply_template: 'Sales will call.' }),
      subscriptions: [],
    })
    const res = await executeApplyDirective({ directive_id: 'dir-1' }, makeCtx(), RUN_CTX_SUB)
    expect(res.applied).toBe(false)
    expect(res.error).toMatch(/requires tenant opt-in/)
  })
})

describe('renderDirectiveTemplate', () => {
  it('interpolates ticket top-level and data fields', () => {
    const ticket = { title: 'Billing issue', status: 'open', data: { priority: 'high' } }
    expect(renderDirectiveTemplate('Re: {{ticket.title}} ({{ticket.priority}})', ticket)).toBe('Re: Billing issue (high)')
  })
  it('blanks unknown paths', () => {
    expect(renderDirectiveTemplate('{{ticket.missing.deep}}', { data: {} })).toBe('')
  })
})
