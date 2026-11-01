// Tests for system-cron's per-tick maintenance blocks (F-052).
// Regression: when get_due_schedules returns zero rows the handler used to
// return early, skipping due timers, threshold alerts, delivery retries,
// and log cleanup. These tests exercise the handler with all shared deps
// mocked; createHandler is stubbed to identity so a fabricated
// RequestContext flows straight into the handler body.
import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  rpcMock,
  fromMock,
  emitAuditMock,
  runPipelineMock,
  sweepMock,
  retryMock,
} = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  fromMock: vi.fn(),
  emitAuditMock: vi.fn(),
  runPipelineMock: vi.fn(),
  sweepMock: vi.fn(),
  retryMock: vi.fn(),
}))

vi.mock('../../functions/_shared/middleware.ts', () => ({
  createHandler: (fn: any) => fn,
}))

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: { rpc: rpcMock, from: fromMock },
}))

vi.mock('../../functions/_shared/audit.ts', () => ({
  emitAudit: emitAuditMock,
}))

vi.mock('../../functions/_shared/pipeline-runner.ts', () => ({
  runPipeline: runPipelineMock,
  sweepStaleExecutions: sweepMock,
}))

vi.mock('../../functions/_shared/retry-deliveries.ts', () => ({
  retryPendingDeliveries: retryMock,
}))

import { handler } from '../../functions/system-cron.ts'

function makeCtx() {
  return {
    requestId: 'test-req',
    principal: {
      id: 'system',
      type: 'machine',
      machineType: 'internal',
      accountId: null,
      scopes: ['*:*'],
      isInternal: true,
    },
    db: {},
    accountId: null,
    appId: null,
    query: {},
    requestPath: '/.netlify/functions/system-cron',
    headers: {},
  }
}

// Per-RPC-name responses; anything not listed resolves to an empty list.
function rpcImpl(overrides: Record<string, any> = {}) {
  return (name: string) => {
    if (name in overrides) {
      const v = overrides[name]
      return v instanceof Error ? Promise.reject(v) : Promise.resolve(v)
    }
    return Promise.resolve({ data: [], error: null })
  }
}

// Chainable thenable query builder; terminal result is keyed by table name.
function fromImpl(tableData: Record<string, any> = {}) {
  return (table: string) => {
    const result = table in tableData ? tableData[table] : { data: [], error: null }
    const chain: any = {}
    for (const m of ['select', 'eq', 'neq', 'lt', 'gt', 'or', 'in', 'order', 'limit', 'insert', 'update', 'single', 'maybeSingle']) {
      chain[m] = vi.fn(() => chain)
    }
    chain.then = (onF: any, onR: any) => Promise.resolve(result).then(onF, onR)
    return chain
  }
}

const RETRY_SUMMARY = {
  outbound_retried: 0,
  outbound_succeeded: 0,
  outbound_failed: 0,
  inbound_retried: 0,
  inbound_succeeded: 0,
  inbound_failed: 0,
  errors: [],
}

describe('system-cron', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sweepMock.mockResolvedValue(undefined)
    retryMock.mockResolvedValue(RETRY_SUMMARY)
  })

  it('runs per-tick maintenance when no schedules are due', async () => {
    rpcMock.mockImplementation(rpcImpl({
      get_due_schedules: { data: [], error: null },
      get_due_timers: { data: [], error: null },
    }))
    fromMock.mockImplementation(fromImpl({
      threshold_alerts: { data: [], error: null },
    }))

    const res = await handler(makeCtx())
    expect(res.statusCode).toBe(200)

    // Every per-tick block still ran despite the empty schedule list.
    expect(sweepMock).toHaveBeenCalledOnce()
    expect(rpcMock).toHaveBeenCalledWith('get_due_timers', expect.anything())
    expect(fromMock).toHaveBeenCalledWith('threshold_alerts')
    expect(retryMock).toHaveBeenCalledOnce()

    const body = JSON.parse(res.body)
    expect(body.schedules_due).toBe(0)
    expect(body.executed).toBe(0)
    expect(body.results).toEqual([])
    expect(body.thresholds_evaluated).toBe(0)
    expect(body.deliveries_retried).toEqual(RETRY_SUMMARY)
  })

  it('executes due timers on a tick with no due schedules', async () => {
    const timer = {
      timer_id: 't1',
      pipeline_id: 'p1',
      account_id: 'a1',
      name: 'nightly',
      execution_count: 3,
      created_by: 'u1',
      app_id: null,
    }
    rpcMock.mockImplementation(rpcImpl({
      get_due_schedules: { data: [], error: null },
      get_due_timers: { data: [timer], error: null },
      update_timer_after_run: { data: null, error: null },
    }))
    fromMock.mockImplementation(fromImpl({
      threshold_alerts: { data: [], error: null },
    }))
    runPipelineMock.mockResolvedValue({ status: 'completed' })

    const res = await handler(makeCtx())
    expect(res.statusCode).toBe(200)

    expect(runPipelineMock).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ timer_id: 't1' }),
      expect.objectContaining({ accountId: 'a1' }),
    )
    expect(rpcMock).toHaveBeenCalledWith('update_timer_after_run',
      expect.objectContaining({ p_timer_id: 't1', p_success: true }))

    const body = JSON.parse(res.body)
    expect(body.schedules_due).toBe(0)
    expect(body.executed).toBe(1)
    expect(body.success).toBe(1)
    expect(body.results[0].scheduleId).toBe('t1')
    expect(retryMock).toHaveBeenCalledOnce()
  })

  it('still reaches delivery retries when the timer block throws', async () => {
    rpcMock.mockImplementation(rpcImpl({
      get_due_schedules: { data: [], error: null },
      get_due_timers: new Error('rpc down'),
    }))
    fromMock.mockImplementation(fromImpl({
      threshold_alerts: { data: [], error: null },
    }))

    const res = await handler(makeCtx())
    expect(res.statusCode).toBe(200)
    expect(retryMock).toHaveBeenCalledOnce()
  })

  it('still processes due schedules and then runs maintenance', async () => {
    const schedule = {
      schedule_id: 's1',
      action_id: 'act1',
      account_id: 'a1',
      machine_principal_id: 'm1',
      delegated_scopes: ['*:*'],
      config: {},
    }
    const action = {
      id: 'act1',
      handler: 'send_email',
      handler_module: 'functions',
      config: {},
      required_scopes: ['*:*'],
    }
    const machine = {
      id: 'm1',
      account_id: 'a1',
      scopes: ['*:*'],
      machine_type: 'internal',
      is_internal: true,
      created_by: 'u1',
    }

    rpcMock.mockImplementation(rpcImpl({
      get_due_schedules: { data: [schedule], error: null },
      get_due_timers: { data: [], error: null },
      validate_schedule_creator: { data: { is_valid: true }, error: null },
      update_schedule_after_run: { data: null, error: null },
    }))
    fromMock.mockImplementation(fromImpl({
      actions: { data: action, error: null },
      api_keys: { data: machine, error: null },
      threshold_alerts: { data: [], error: null },
      schedule_executions: { data: null, error: null },
    }))

    const res = await handler(makeCtx())
    expect(res.statusCode).toBe(200)

    const body = JSON.parse(res.body)
    expect(body.schedules_due).toBe(1)
    expect(body.executed).toBe(1)
    expect(body.success).toBe(1)
    expect(body.results[0].scheduleId).toBe('s1')

    // Maintenance blocks still ran after schedule processing.
    expect(rpcMock).toHaveBeenCalledWith('get_due_timers', expect.anything())
    expect(fromMock).toHaveBeenCalledWith('threshold_alerts')
    expect(retryMock).toHaveBeenCalledOnce()
  })
})
