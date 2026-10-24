// CIL[BEGIN stable_id="~/.framework/tests/unit/episode-lease.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Unit tests for the atomic episode-lease arbitration in agent-runner"]
// CIL[DOC-RESPONSIBILITY responsibility="Exercise acquireEpisodeLease verdict mapping (claimed/held/error/malformed), kickAgentEpisode claim-vs-refuse behavior with legacy fallback, heartbeat fencing (EpisodeLeaseLost quiet abort), and terminal lease release in runAgent"]
// CIL[DOC-CONTEXT module="tests/unit/episode-lease" layer="test-unit" related_files=".framework/functions/_shared/agent-runner.ts,.framework/migrations/064_episode_leases.sql,.framework/tests/unit/agent-runner.test.ts,.framework/tests/unit/kb-ingest-lease.test.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="vitest assertions" errors="none" side_effects="Mocks _shared/db.ts adminDb (from + rpc), audit, outcomes, llm, admin-data create, integration-outbound, pipeline-runner, funnel"]
// CIL[DOC-MICRO logic_summary="Per-table thenable mock mirrors agent-runner.test.ts scaffolding; adminDb.rpc is programmed per-RPC-name so acquire/heartbeat/release outcomes can be driven independently" notable_decisions="kickAgentEpisode's detached void runAgent is real — config mocks keep it a quiet no-op run rather than spying on same-module internals"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="test maintainers"]
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CoreContext } from '../../functions/_shared/middleware.ts'

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
  callOpenAIEmbeddings: vi.fn().mockResolvedValue({ data: [{ embedding: [0.1, 0.2] }] })
}))

vi.mock('../../functions/admin-data.ts', () => ({
  create: vi.fn()
}))

vi.mock('../../functions/integration-outbound.ts', () => ({
  execute: vi.fn()
}))

vi.mock('../../functions/_shared/pipeline-runner.ts', () => ({
  runPipeline: vi.fn()
}))

vi.mock('../../functions/_shared/funnel.ts', () => ({
  emitSignal: vi.fn().mockResolvedValue(undefined),
  accountDataFlag: vi.fn().mockResolvedValue(true)
}))

import { adminDb } from '../../functions/_shared/db.ts'
import { callOpenAIChat } from '../../functions/_shared/llm.ts'
import { create as createRecord } from '../../functions/admin-data.ts'
import {
  acquireEpisodeLease,
  claimAgentEpisode,
  kickAgentEpisode,
  runAgent,
} from '../../functions/_shared/agent-runner.ts'
// CIL[END stable_id="~/.framework/tests/unit/episode-lease.test.ts:module_header:module_header"]

const THREAD_ID = 'thread-1'
const AGENT_ID = 'agent-1'
const PROMPT_CONFIG_ID = 'prompt-1'
const LEASE_TOKEN = 'lease-token-1'

function makeCtx(overrides: Partial<CoreContext> = {}): CoreContext {
  return {
    principal: {
      id: 'person-1',
      type: 'human',
      accountId: 'acct-1',
      roles: ['member'],
      provenance: { sourceType: 'jwt', createdBy: 'person-1', invokedAt: new Date().toISOString() }
    },
    accountId: 'acct-1',
    db: {},
    requestId: 'req-test',
    appId: 'test-app',
    ...overrides
  } as CoreContext
}

function mockThread(overrides: Record<string, any> = {}) {
  return {
    id: THREAD_ID,
    account_id: 'acct-1',
    visibility: 'external',
    data: {
      agent_id: AGENT_ID,
      prompt_config_id: PROMPT_CONFIG_ID
    },
    type: { slug: 'support_thread', design_schema: {} },
    ...overrides
  }
}

function mockAgent(overrides: Record<string, any> = {}) {
  return {
    id: AGENT_ID,
    account_id: 'acct-1',
    is_active: true,
    system_prompt: 'You are a research assistant.',
    model_config: {},
    metadata: {},
    ...overrides
  }
}

function mockPromptConfig(overrides: Record<string, any> = {}) {
  return {
    id: PROMPT_CONFIG_ID,
    app_id: 'test-app',
    is_active: true,
    is_multi_turn: true,
    available_tools: ['search_knowledge', 'ask_user'],
    metadata: { max_turns: 5 },
    ...overrides
  }
}

// Same scaffolding shape as agent-runner.test.ts — a thenable builder per
// table so resolveAgentConfig/messages/state writes resolve quietly.
// inboundRows feeds messages.limit() — replay detection reads the latest
// inbound created_at through that chain.
function setupAgentConfigMocks(
  threadOverrides: Record<string, any> = {},
  agentOverrides: Record<string, any> = {},
  promptOverrides: Record<string, any> = {},
  inboundRows: any[] = []
) {
  vi.mocked(adminDb.from).mockImplementation((table: string) => {
    if (table === 'threads') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockThread(threadOverrides),
          error: null
        }),
        update: vi.fn().mockReturnThis()
      } as any
    }
    if (table === 'ai_agents') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockAgent(agentOverrides),
          error: null
        })
      } as any
    }
    if (table === 'prompt_configs') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockPromptConfig(promptOverrides),
          error: null
        })
      } as any
    }
    if (table === 'messages') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: inboundRows, error: null }),
        update: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis()
      } as any
    }
    if (table === 'accounts') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'sys-acct' }, error: null })
      } as any
    }
    if (table === 'apps') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: {
            id: 'app-1',
            slug: 'test-app',
            required_roles: [],
            config: { knowledge: { account: true, platform: true } }
          },
          error: null
        })
      } as any
    }
    if (table === 'embeddings') {
      const q: any = {
        select: vi.fn(() => q),
        in: vi.fn(() => q),
        is: vi.fn(() => q),
        not: vi.fn(() => q),
        or: vi.fn(() => q),
        textSearch: vi.fn(() => q),
        limit: vi.fn(() => q),
        then: (onFulfilled: any, onRejected: any) =>
          Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected),
      }
      return q
    }
    return {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis()
    } as any
  })
}

// Program adminDb.rpc per RPC name — episode-lease tests drive each
// primitive's outcome independently.
function mockRpc(handlers: Record<string, any>) {
  vi.mocked(adminDb.rpc).mockImplementation((name: string) => {
    const v = handlers[name]
    return Promise.resolve(v instanceof Error ? { data: null, error: v } : { data: v, error: null }) as any
  })
}

function mockFinalLlm(content = 'Final answer.') {
  vi.mocked(callOpenAIChat).mockResolvedValue({
    choices: [{
      message: { content, tool_calls: undefined },
      logprobs: { content: [{ logprob: -0.1 }] }
    }],
    model: 'gpt-4o'
  } as any)
}

// CIL[BEGIN stable_id="~/.framework/tests/unit/episode-lease.test.ts:describe_acquireEpisodeLease:block" type="block" identity="describe_acquireEpisodeLease" parent="none"]
// CIL[DOC-MACRO purpose="Test acquireEpisodeLease verdict mapping"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify claimed/held/error/malformed RPC responses map to the documented return contract"]
describe('acquireEpisodeLease', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns claimed with lease_token on a fresh claim', async () => {
    mockRpc({ acquire_episode_lease: { outcome: 'claimed', lease_token: LEASE_TOKEN } })
    const r = await acquireEpisodeLease(THREAD_ID, 'acct-1', 'driver-a')
    expect(r).toEqual({ outcome: 'claimed', lease_token: LEASE_TOKEN })
    expect(vi.mocked(adminDb.rpc)).toHaveBeenCalledWith('acquire_episode_lease', expect.objectContaining({
      p_thread_id: THREAD_ID,
      p_account_id: 'acct-1',
      p_driver_id: 'driver-a'
    }))
  })

  it('returns held with the live holder driver_id', async () => {
    mockRpc({ acquire_episode_lease: { outcome: 'held', holder_driver_id: 'driver-b' } })
    const r = await acquireEpisodeLease(THREAD_ID, 'acct-1', 'driver-a')
    expect(r).toEqual({ outcome: 'held', holder_driver_id: 'driver-b' })
  })

  it('fails open (null) when the RPC errors — un-migrated deployments', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockRpc({ acquire_episode_lease: new Error('function acquire_episode_lease does not exist') })
    const r = await acquireEpisodeLease(THREAD_ID, 'acct-1', 'driver-a')
    expect(r).toBeNull()
  })

  it('fails open (null) on a malformed verdict', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockRpc({ acquire_episode_lease: [] })
    const r = await acquireEpisodeLease(THREAD_ID, 'acct-1', 'driver-a')
    expect(r).toBeNull()
  })

  it('passes p_steal_detached to the RPC when the caller is request-bound', async () => {
    mockRpc({ acquire_episode_lease: { outcome: 'claimed', lease_token: LEASE_TOKEN } })
    const r = await acquireEpisodeLease(THREAD_ID, 'acct-1', 'driver-a', 90, true)
    expect(r?.outcome).toBe('claimed')
    expect(vi.mocked(adminDb.rpc)).toHaveBeenCalledWith('acquire_episode_lease', expect.objectContaining({
      p_steal_detached: true
    }))
  })

  it('defaults p_steal_detached to false — detached kicks never preempt a live holder', async () => {
    mockRpc({ acquire_episode_lease: { outcome: 'held', holder_driver_id: 'driver-b' } })
    await acquireEpisodeLease(THREAD_ID, 'acct-1', 'driver-a')
    expect(vi.mocked(adminDb.rpc)).toHaveBeenCalledWith('acquire_episode_lease', expect.objectContaining({
      p_steal_detached: false
    }))
  })

  it('passes p_stale_seconds so the RPC can refuse a healthy detached holder', async () => {
    mockRpc({ acquire_episode_lease: { outcome: 'held', holder_driver_id: 'detached:driver-b' } })
    const r = await acquireEpisodeLease(THREAD_ID, 'acct-1', 'driver-a', 90, true)
    expect(r?.outcome).toBe('held')
    expect(vi.mocked(adminDb.rpc)).toHaveBeenCalledWith('acquire_episode_lease', expect.objectContaining({
      p_steal_detached: true,
      p_stale_seconds: 30
    }))
  })
})
// CIL[END stable_id="~/.framework/tests/unit/episode-lease.test.ts:describe_acquireEpisodeLease:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/episode-lease.test.ts:describe_kickAgentEpisode:block" type="block" identity="describe_kickAgentEpisode" parent="none"]
// CIL[DOC-MACRO purpose="Test kickAgentEpisode atomic claim and legacy fallback"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify a held lease refuses without a state write, a claimed lease stamps driver_id and detaches the run, and an unavailable RPC degrades to the legacy heartbeat check"]
describe('kickAgentEpisode', () => {
  beforeEach(() => vi.clearAllMocks())

  it('refuses when the atomic lease is held by another driver — no state write, no run', async () => {
    setupAgentConfigMocks()
    mockRpc({ acquire_episode_lease: { outcome: 'held', holder_driver_id: 'driver-b' } })
    const ctx = makeCtx()
    const r = await kickAgentEpisode(THREAD_ID, 'Question?', ctx, 'driver-a', mockThread().data)
    expect(r).toEqual({ claimed: false, driver_id: 'driver-b' })
    // threads.update must not have run — a refused caller never stamps state.
    const threadsBuilder = vi.mocked(adminDb.from).mock.results
      .map((x: any) => x.value)
    expect(
      threadsBuilder.some((b: any) => b?.update?.mock?.calls?.length > 0)
    ).toBe(false)
  })

  it('claims via the RPC, stamps the detached driver_id, and detaches the run', async () => {
    setupAgentConfigMocks()
    mockFinalLlm()
    vi.mocked(createRecord).mockResolvedValue({ id: 'msg-1', content: 'Final answer.' } as any)
    mockRpc({
      acquire_episode_lease: { outcome: 'claimed', lease_token: LEASE_TOKEN },
      merge_thread_data: true,
      heartbeat_episode_lease: true,
      release_episode_lease: true
    })
    const ctx = makeCtx()
    const r = await kickAgentEpisode(THREAD_ID, 'Question?', ctx, 'driver-a', mockThread().data)
    // Spawned drivers carry the 'detached:' prefix so request-bound
    // callers can steal the lease without waiting out the TTL.
    expect(r).toMatchObject({ claimed: true, driver_id: 'detached:driver-a' })
    // The research_state stamp goes through the fenced merge RPC.
    expect(vi.mocked(adminDb.rpc)).toHaveBeenCalledWith('merge_thread_data', expect.objectContaining({
      p_thread_id: THREAD_ID,
      p_lease_token: LEASE_TOKEN,
      p_patch: expect.objectContaining({
        research_state: expect.objectContaining({ driver_id: 'detached:driver-a' })
      })
    }))
    // Intake narration is written synchronously inside the claim.
    const narrations = vi.mocked(createRecord).mock.calls.filter(([, body]: any) =>
      body?.data?.message_type === 'plan' && body?.data?.phase === 'intake'
    )
    expect(narrations).toHaveLength(1)
    // The detached run proceeds against the mocked config — let it
    // settle so its writes can't bleed into the next test's mocks.
    await new Promise((res) => setTimeout(res, 250))
  })

  it('does not re-narrate when continuing an already-announced live episode', async () => {
    const continuing = {
      agent_id: AGENT_ID,
      prompt_config_id: PROMPT_CONFIG_ID,
      research_state: {
        status: 'gathering',
        driver_id: 'detached:driver-a',
        driver_heartbeat_at: new Date().toISOString(),
        intake_announced: true
      }
    }
    setupAgentConfigMocks({ data: continuing })
    mockFinalLlm()
    vi.mocked(createRecord).mockResolvedValue({ id: 'msg-1' } as any)
    mockRpc({
      acquire_episode_lease: { outcome: 'claimed', lease_token: LEASE_TOKEN },
      merge_thread_data: true,
      heartbeat_episode_lease: true,
      release_episode_lease: true
    })
    const ctx = makeCtx()
    const r = await claimAgentEpisode(THREAD_ID, 'Question?', ctx, 'driver-a', continuing)
    expect(r.claimed).toBe(true)
    const narrations = vi.mocked(createRecord).mock.calls.filter(([, body]: any) =>
      body?.data?.message_type === 'plan' && body?.data?.phase === 'intake'
    )
    expect(narrations).toHaveLength(0)
  })

  it('releases and reports already_done when the carried question was already answered', async () => {
    // Latest inbound predates the terminal write — a re-delivered
    // question, not a re-ask. This is the production duplicate path: a
    // queued kick claiming the just-released lease.
    const threadData = {
      agent_id: AGENT_ID,
      prompt_config_id: PROMPT_CONFIG_ID,
      research_state: {
        status: 'complete',
        user_question: 'Question?',
        completed_at: new Date(Date.now() - 5000).toISOString(),
        driver_id: 'req:earlier'
      }
    }
    setupAgentConfigMocks({ data: threadData }, {}, {}, [{ created_at: new Date(Date.now() - 30000).toISOString() }])
    mockRpc({
      acquire_episode_lease: { outcome: 'claimed', lease_token: LEASE_TOKEN },
      release_episode_lease: true
    })
    const ctx = makeCtx()
    const r = await claimAgentEpisode(THREAD_ID, 'Question?', ctx, 'kick-late', threadData)
    expect(r).toMatchObject({ claimed: false, already_done: true })
    expect(vi.mocked(adminDb.rpc)).toHaveBeenCalledWith('release_episode_lease', expect.objectContaining({
      p_thread_id: THREAD_ID,
      p_lease_token: LEASE_TOKEN
    }))
    // No state stamp and no intake narration for a replay.
    expect(createRecord).not.toHaveBeenCalled()
    const merges = vi.mocked(adminDb.rpc).mock.calls.filter(([n]: any) => n === 'merge_thread_data')
    expect(merges).toHaveLength(0)
  })

  it('falls back to the legacy heartbeat check when the RPC is unavailable and a lease is live', async () => {
    const liveState = {
      agent_id: AGENT_ID,
      prompt_config_id: PROMPT_CONFIG_ID,
      research_state: {
        status: 'gathering',
        driver_id: 'driver-b',
        driver_heartbeat_at: new Date().toISOString()
      }
    }
    setupAgentConfigMocks({ data: liveState })
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockRpc({ acquire_episode_lease: new Error('does not exist') })
    const ctx = makeCtx()
    const r = await kickAgentEpisode(THREAD_ID, 'Question?', ctx, 'driver-a', liveState)
    expect(r).toEqual({ claimed: false, driver_id: 'driver-b' })
  })

  it('claims through the legacy path when the RPC is unavailable and no lease is live', async () => {
    setupAgentConfigMocks()
    mockFinalLlm()
    vi.mocked(createRecord).mockResolvedValue({ id: 'msg-1', content: 'Final answer.' } as any)
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockRpc({ acquire_episode_lease: new Error('does not exist') })
    const ctx = makeCtx()
    const r = await kickAgentEpisode(THREAD_ID, 'Question?', ctx, 'driver-a', mockThread().data)
    expect(r).toMatchObject({ claimed: true, driver_id: 'detached:driver-a' })
    await new Promise((res) => setTimeout(res, 250))
  })
})
// CIL[END stable_id="~/.framework/tests/unit/episode-lease.test.ts:describe_kickAgentEpisode:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/episode-lease.test.ts:describe_runAgentFencing:block" type="block" identity="describe_runAgentFencing" parent="none"]
// CIL[DOC-MACRO purpose="Test runAgent lease heartbeat fencing and terminal release"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify a false heartbeat aborts the run quietly without persisting a final message, and a terminal episode releases the lease token"]
describe('runAgent — lease fencing and release', () => {
  beforeEach(() => vi.clearAllMocks())

  it('aborts quietly when the heartbeat reports a takeover — no final write', async () => {
    setupAgentConfigMocks()
    mockFinalLlm()
    vi.mocked(createRecord).mockResolvedValue({ id: 'msg-x', content: 'x' } as any)
    mockRpc({ heartbeat_episode_lease: false, release_episode_lease: true })
    const ctx = makeCtx()
    const result = await runAgent(THREAD_ID, 'Question?', ctx, 'complete', 'driver-a', LEASE_TOKEN)
    // Quiet abort: resolves (does not throw), and never persisted a
    // customer-facing final — the takeover owner writes it.
    expect(result).toBeUndefined()
    const finalWrites = vi.mocked(createRecord).mock.calls.filter(([, body]: any) =>
      body?.data?.message_type === 'final'
    )
    expect(finalWrites).toHaveLength(0)
    // Token-gated release still attempted (warn-only when superseded).
    expect(vi.mocked(adminDb.rpc)).toHaveBeenCalledWith('release_episode_lease', expect.objectContaining({
      p_thread_id: THREAD_ID,
      p_lease_token: LEASE_TOKEN
    }))
  })

  it('releases the lease when the episode reaches a terminal state', async () => {
    setupAgentConfigMocks()
    mockFinalLlm()
    vi.mocked(createRecord).mockResolvedValue({ id: 'msg-final', content: 'Final answer.' } as any)
    mockRpc({ heartbeat_episode_lease: true, release_episode_lease: true })
    const ctx = makeCtx()
    const result = await runAgent(THREAD_ID, 'Question?', ctx, 'complete', 'driver-a', LEASE_TOKEN)
    expect(result).toBeDefined()
    expect(vi.mocked(adminDb.rpc)).toHaveBeenCalledWith('release_episode_lease', expect.objectContaining({
      p_thread_id: THREAD_ID,
      p_lease_token: LEASE_TOKEN
    }))
  })

  it('drops a fenced research_state write — merge_thread_data false means the driver was displaced', async () => {
    setupAgentConfigMocks()
    mockFinalLlm()
    vi.mocked(createRecord).mockResolvedValue({ id: 'msg-final', content: 'Final answer.' } as any)
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockRpc({
      heartbeat_episode_lease: true,
      merge_thread_data: false,
      release_episode_lease: true
    })
    const ctx = makeCtx()
    // The fenced checkpoint throws EpisodeLeaseLost — runAgent converts
    // it to a quiet abort rather than an inference failure.
    const result = await runAgent(THREAD_ID, 'Question?', ctx, 'complete', 'driver-a', LEASE_TOKEN)
    expect(result).toBeUndefined()
    expect(vi.mocked(console.warn)).toHaveBeenCalledWith(
      expect.stringContaining('episode lease lost')
    )
  })

  it('returns a partial result without releasing when the deadline budget expires mid-episode', async () => {
    setupAgentConfigMocks()
    // Every turn is a nonterminal tool call — without a deadline this
    // would loop to max_turns.
    vi.mocked(callOpenAIChat).mockResolvedValue({
      choices: [{
        message: {
          content: '',
          tool_calls: [{
            id: 'call-1',
            function: { name: 'search_knowledge', arguments: '{"query":"x"}' }
          }]
        }
      }],
      model: 'gpt-4o'
    } as any)
    vi.mocked(createRecord).mockResolvedValue({ id: 'msg-tool', content: 'Using search_knowledge...' } as any)
    mockRpc({
      heartbeat_episode_lease: true,
      merge_thread_data: true,
      release_episode_lease: true
    })
    const ctx = makeCtx()
    const result = await runAgent(THREAD_ID, 'Question?', ctx, 'complete', 'driver-a', LEASE_TOKEN, { deadlineMs: -1 })
    // Nonterminal partial return — the lease stays held so the caller's
    // next step request continues the episode instead of double-driving.
    expect(result).toBeDefined()
    const releases = vi.mocked(adminDb.rpc).mock.calls.filter(([n]: any) => n === 'release_episode_lease')
    expect(releases).toHaveLength(0)
    const mergeCalls = vi.mocked(adminDb.rpc).mock.calls
      .filter(([n]: any) => n === 'merge_thread_data')
      .map(([, p]: any) => p?.p_patch?.research_state?.status)
    expect(mergeCalls).not.toContain('failed')
    expect(mergeCalls).not.toContain('complete')
  })

  it('keeps the lease on a nonterminal step return so the same driver renews it', async () => {
    setupAgentConfigMocks({
      data: {
        agent_id: AGENT_ID,
        prompt_config_id: PROMPT_CONFIG_ID,
        research_state: {
          status: 'gathering',
          turn_count: 1,
          max_turns: 5,
          gathered_results: [{ tool: 'search_knowledge', id: 't0', result: { chunks: [] } }]
        }
      }
    })
    // Tool call turn → state stays 'gathering' (nonterminal).
    vi.mocked(callOpenAIChat).mockResolvedValue({
      choices: [{
        message: {
          content: '',
          tool_calls: [{
            id: 'call-1',
            function: { name: 'search_knowledge', arguments: '{"query":"x"}' }
          }]
        }
      }],
      model: 'gpt-4o'
    } as any)
    vi.mocked(createRecord).mockResolvedValue({ id: 'msg-tool', content: 'Using search_knowledge...' } as any)
    mockRpc({ heartbeat_episode_lease: true, release_episode_lease: true })
    const ctx = makeCtx()
    await runAgent(THREAD_ID, 'Question?', ctx, 'step', 'driver-a', LEASE_TOKEN)
    const releases = vi.mocked(adminDb.rpc).mock.calls.filter(([n]: any) => n === 'release_episode_lease')
    expect(releases).toHaveLength(0)
  })

  it('treats a re-delivered terminal question as a replay — returns without re-running', async () => {
    setupAgentConfigMocks({
      data: {
        agent_id: AGENT_ID,
        prompt_config_id: PROMPT_CONFIG_ID,
        research_state: {
          status: 'complete',
          user_question: 'Question?',
          completed_at: new Date(Date.now() - 5000).toISOString(),
          turn_count: 1,
          max_turns: 5,
          gathered_results: []
        }
      }
    }, {}, {}, [{ created_at: new Date(Date.now() - 30000).toISOString() }])
    vi.mocked(createRecord).mockResolvedValue({ id: 'msg-x' } as any)
    mockRpc({ heartbeat_episode_lease: true, merge_thread_data: true, release_episode_lease: true })
    const ctx = makeCtx()
    const result = await runAgent(THREAD_ID, 'Question?', ctx, 'complete', 'driver-a', LEASE_TOKEN)
    expect(result).toBeUndefined()
    // The replay no-ops before any turn: no inference, and no agent-side
    // writes (an inbound persist by the caller path is legitimate).
    expect(vi.mocked(callOpenAIChat)).not.toHaveBeenCalled()
    const agentWrites = vi.mocked(createRecord).mock.calls.filter(([, body]: any) =>
      ['final', 'plan', 'tool_call', 'escalation'].includes(body?.data?.message_type)
    )
    expect(agentWrites).toHaveLength(0)
    expect(vi.mocked(adminDb.rpc)).toHaveBeenCalledWith('release_episode_lease', expect.objectContaining({
      p_lease_token: LEASE_TOKEN
    }))
  })

  it('runs a new episode when a same-text re-ask posts after completion', async () => {
    // Latest inbound is NEWER than the terminal write — the user really
    // asked again, so the reset path must fire.
    setupAgentConfigMocks({
      data: {
        agent_id: AGENT_ID,
        prompt_config_id: PROMPT_CONFIG_ID,
        research_state: {
          status: 'complete',
          user_question: 'Question?',
          completed_at: new Date(Date.now() - 30000).toISOString(),
          turn_count: 1,
          max_turns: 5,
          gathered_results: []
        }
      }
    }, {}, {}, [{ created_at: new Date().toISOString() }])
    mockFinalLlm()
    vi.mocked(createRecord).mockResolvedValue({ id: 'msg-final', content: 'Final answer.' } as any)
    mockRpc({ heartbeat_episode_lease: true, merge_thread_data: true, release_episode_lease: true })
    const ctx = makeCtx()
    await runAgent(THREAD_ID, 'Question?', ctx, 'complete', 'driver-a', LEASE_TOKEN)
    expect(vi.mocked(callOpenAIChat)).toHaveBeenCalled()
  })
})
// CIL[END stable_id="~/.framework/tests/unit/episode-lease.test.ts:describe_runAgentFencing:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/episode-lease.test.ts:describe_humanOwnerGate:block" type="block" identity="describe_humanOwnerGate" parent="none"]
// CIL[DOC-MACRO purpose="Test the human-owner thread gate"]
// CIL[DOC-RESPONSIBILITY responsibility="Verify owner:'human' (and the legacy escalation_status:'pending' key) refuses episode claims, narrations, and inference — the semantic gate that stops frozen serverless resumes from re-entering human-owned threads"]
describe('human-owner gate', () => {
  beforeEach(() => vi.clearAllMocks())

  it('claimAgentEpisode refuses owner:human — no lease acquire, no state write, no narration', async () => {
    setupAgentConfigMocks({
      data: { agent_id: AGENT_ID, prompt_config_id: PROMPT_CONFIG_ID, owner: 'human' }
    })
    const ctx = makeCtx()
    const r = await claimAgentEpisode(THREAD_ID, 'Question?', ctx, 'driver-a')
    expect(r).toEqual({ claimed: false, already_done: true })
    expect(vi.mocked(adminDb.rpc)).not.toHaveBeenCalledWith('acquire_episode_lease', expect.anything())
    expect(vi.mocked(createRecord)).not.toHaveBeenCalled()
  })

  it('claimAgentEpisode refuses the legacy escalation_status:pending key', async () => {
    setupAgentConfigMocks({
      data: { agent_id: AGENT_ID, prompt_config_id: PROMPT_CONFIG_ID, escalation_status: 'pending' }
    })
    const ctx = makeCtx()
    const r = await claimAgentEpisode(THREAD_ID, 'Question?', ctx, 'driver-a')
    expect(r).toEqual({ claimed: false, already_done: true })
    expect(vi.mocked(adminDb.rpc)).not.toHaveBeenCalledWith('acquire_episode_lease', expect.anything())
  })

  it('runAgent returns the prior outbound and never runs inference on a human-owned thread', async () => {
    setupAgentConfigMocks(
      { data: { agent_id: AGENT_ID, prompt_config_id: PROMPT_CONFIG_ID, owner: 'human' } },
      {},
      {},
      [{ id: 'msg-prior', content: 'A human is on it.', data: { message_type: 'final' } }]
    )
    vi.mocked(createRecord).mockResolvedValue({ id: 'msg-in' } as any)
    mockRpc({ heartbeat_episode_lease: true, release_episode_lease: true })
    const ctx = makeCtx()
    const result = await runAgent(THREAD_ID, 'Follow-up?', ctx, 'complete', 'driver-a', LEASE_TOKEN)
    expect(result?.id).toBe('msg-prior')
    expect(vi.mocked(callOpenAIChat)).not.toHaveBeenCalled()
    // No agent narration or tool messages — the customer's own inbound
    // persist is legitimate but no agent message_type may be written.
    const agentWrites = vi.mocked(createRecord).mock.calls.filter(([, body]: any) =>
      ['final', 'plan', 'tool_call', 'escalation'].includes(body?.data?.message_type)
    )
    expect(agentWrites).toHaveLength(0)
    expect(vi.mocked(adminDb.rpc)).toHaveBeenCalledWith('release_episode_lease', expect.objectContaining({
      p_lease_token: LEASE_TOKEN
    }))
  })
})
// CIL[END stable_id="~/.framework/tests/unit/episode-lease.test.ts:describe_humanOwnerGate:block"]
