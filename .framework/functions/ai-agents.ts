// CIL[BEGIN stable_id="~/.framework/functions/ai-agents.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/ai-agents.ts"]
/**
 * @module   functions/ai-agents
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * This module provides functionality for AI agents within the application, facilitating their execution and management. It integrates middleware for handling requests, checks permissions, and manages rate limits to ensure system integrity. INVARIANT: Only system administrators can execute certain actions related to agents.
 *
 * @seeAlso functions/_shared/middleware (provides request handling)
 * @seeAlso functions/_shared/permissions (manages access control)
 * @seeAlso functions/_shared/rate-limit (ensures system stability)
 * @seeAlso functions/_shared/agent-runner (executes agent logic)
 *
 * @cil-generated
 */











import { createHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { isSystemAdmin } from './_shared/principal'
import { PermissionEngine, sanitizeRecordData } from './_shared/permissions'
import { runAgent, kickAgentEpisode } from './_shared/agent-runner'
import { checkRateLimit } from './_shared/rate-limit'
import { detectInjection, emitSecurityEvent, getAppSecurityConfig } from './_shared/security'
// CIL[END stable_id="~/.framework/functions/ai-agents.ts:module_header:module_header"]
















// CIL[BEGIN stable_id="~/.framework/functions/ai-agents.ts:permissions:constant" type="constant" identity="permissions" parent="~/.framework/functions/ai-agents.ts"]
/**
 * The 'permissions' constant provides access to the PermissionEngine, allowing for permission management within the module. It exists to facilitate the handling of user permissions in AI agent functionalities.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */








const permissions = PermissionEngine as any
// CIL[END stable_id="~/.framework/functions/ai-agents.ts:permissions:constant"]























// CIL[BEGIN stable_id="~/.framework/functions/ai-agents.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/ai-agents.ts"]
/**
 * Fetches a list of AI agents based on query parameters such as agent type and active status. This function is designed to provide a sanitized view of AI agents for the requesting account.
 *
 * @throws      Error — Account context required.
 * @sideEffects none
 * @stability   stable
 * @calls       isSystemAdmin, adminDb.from, ctx.db.from, sanitizeRecordData
 * @cil-generated
 */








export const list = createHandler(async (ctx, _body) => {
  const { agent_type, is_active, limit = 100, offset = 0 } = ctx.query || {}

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let query = db
    .from('ai_agents')
    .select('*')
    .order('name')

  if (agent_type) {
    query = query.eq('agent_type', agent_type)
  }
  if (is_active !== undefined) {
    query = query.eq('is_active', is_active === 'true')
  }

  const { data, error: err } = await query.range(
    parseInt(offset.toString()),
    parseInt(offset.toString()) + parseInt(limit.toString()) - 1
  )

  if (err) throw err

  const sanitized = []
  for (const agent of data || []) {
    sanitized.push(await sanitizeRecordData(ctx, agent, 'ai_agent'))
  }

  return sanitized
})
// CIL[END stable_id="~/.framework/functions/ai-agents.ts:list:constant"]
















// CIL[BEGIN stable_id="~/.framework/functions/ai-agents.ts:get:constant" type="constant" identity="get" parent="~/.framework/functions/ai-agents.ts"]
/**
 * Fetches an AI agent record by its ID from the database. This function ensures that only authorized users can access the data based on their role.
 *
 * @throws      Error — Agent ID is required, Error — database query error
 * @sideEffects none
 * @stability   stable
 * @calls       adminDb.from('ai_agents'), ctx.db.from('ai_agents'), sanitizeRecordData
 * @cil-generated
 */








export const get = createHandler(async (ctx, _body) => {
  const { id } = ctx.query || {}

  if (!id) {
    throw new Error('Agent ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  const { data, error: err } = await db
    .from('ai_agents')
    .select('*')
    .eq('id', id)
    .single()

  if (err) throw err

  return await sanitizeRecordData(ctx, data, 'ai_agent')
})
// CIL[END stable_id="~/.framework/functions/ai-agents.ts:get:constant"]
















// CIL[BEGIN stable_id="~/.framework/functions/ai-agents.ts:create:constant" type="constant" identity="create" parent="~/.framework/functions/ai-agents.ts"]
/**
 * Creates a new AI agent in the database based on the provided parameters. It ensures that required fields are present and that the user context is valid before performing the insertion.
 *
 * @throws      Error — name and agent_type are required; Error — User context (person and account) required; Error — database insertion error.
 * @sideEffects Inserts a new record into the 'ai_agents' table; emits a log event for the creation of the AI agent.
 * @stability   stable
 * @calls       ctx.db.from('ai_agents'), emitLog
 * @cil-generated
 */








export const create = createHandler(async (ctx, body) => {
  const { app_id, name, description, agent_type, model_config, system_prompt, tools, capabilities, constraints, metadata } = body

  if (!name || !agent_type) {
    throw new Error('name and agent_type are required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  const { data, error: err } = await ctx.db
    .from('ai_agents')
    .insert({
      app_id: app_id || null,
      account_id: ctx.accountId,
      name,
      description: description || null,
      agent_type,
      model_config: model_config || {},
      system_prompt: system_prompt || null,
      tools: tools || [],
      capabilities: capabilities || [],
      constraints: constraints || {},
      metadata: metadata || {},
      created_by: ctx.principal.id
    })
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'ai_agent.created', 
    { type: 'ai_agent', id: data.id }, 
    { after: { name, agent_type } }
  )

  return data
})
// CIL[END stable_id="~/.framework/functions/ai-agents.ts:create:constant"]
















// CIL[BEGIN stable_id="~/.framework/functions/ai-agents.ts:update:constant" type="constant" identity="update" parent="~/.framework/functions/ai-agents.ts"]
/**
 * Updates an AI agent's properties in the database based on the provided ID and update data. It ensures that the user context is valid and that the ID is provided before performing the update.
 *
 * @throws      Error — Agent ID is required, Error — User context (person and account) required
 * @sideEffects Database update on 'ai_agents' table, logging of the update event.
 * @stability   stable
 * @calls       ctx.db.from('ai_agents'), emitLog
 * @cil-generated
 */








export const update = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id
  const { id: _bodyId, ...updates } = body || {}

  if (!id) {
    throw new Error('Agent ID is required')
  }

  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  const allowed = ['name', 'description', 'agent_type', 'model_config', 'system_prompt', 'tools', 'capabilities', 'constraints', 'metadata', 'is_active', 'app_id']
  const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (updates[key] !== undefined) updateData[key] = updates[key]
  }

  const { data, error: err } = await ctx.db
    .from('ai_agents')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'ai_agent.updated', 
    { type: 'ai_agent', id }, 
    { after: updateData }
  )

  return data
})
// CIL[END stable_id="~/.framework/functions/ai-agents.ts:update:constant"]
















// CIL[BEGIN stable_id="~/.framework/functions/ai-agents.ts:remove:constant" type="constant" identity="remove" parent="~/.framework/functions/ai-agents.ts"]
/**
 * The 'remove' constant defines a handler for deleting an AI agent from the database based on its ID. It ensures that the ID is provided and logs the deletion event.
 *
 * @throws      Error — Agent ID is required, Error — Agent not found, Error — database error during deletion
 * @sideEffects Deletes an entry from the 'ai_agents' table, emits a log event.
 * @stability   stable
 * @calls       ctx.db.from('ai_agents'), ctx.db.select, ctx.db.eq, ctx.db.single, ctx.db.delete, emitLog
 * @cil-generated
 */








export const remove = createHandler(async (ctx, _body) => {
  const id = ctx.query?.id

  if (!id) {
    throw new Error('Agent ID is required')
  }

  const { data: current } = await ctx.db
    .from('ai_agents')
    .select('id, name')
    .eq('id', id)
    .single()

  if (!current) throw new Error('Agent not found')

  const { error: err } = await ctx.db
    .from('ai_agents')
    .delete()
    .eq('id', id)

  if (err) throw err

  await emitLog(ctx, 'ai_agent.deleted', 
    { type: 'ai_agent', id }, 
    { before: current }
  )

  return { success: true }
})
// CIL[END stable_id="~/.framework/functions/ai-agents.ts:remove:constant"]
















// CIL[BEGIN stable_id="~/.framework/functions/ai-agents.ts:run:constant" type="constant" identity="run" parent="~/.framework/functions/ai-agents.ts"]
/**
 * The 'run' constant defines an asynchronous handler that processes user messages within a specified thread context. It ensures that necessary parameters are provided and manages the execution of an agent based on the provided mode.
 *
 * @throws      Error — thread_id is required, Error — User context (person and account) required, Error — Thread not found
 * @sideEffects Database reads from 'threads' and updates to 'threads' based on agent execution.
 * @stability   stable
 * @calls       checkRateLimit, runAgent, adminDb.from('threads'), adminDb.select, adminDb.eq, adminDb.single
 * @cil-generated
 */








export const run = createHandler(async (ctx, body) => {
  const { thread_id, user_message, mode } = body || {}
  if (!thread_id) {
    throw new Error('thread_id is required')
  }
  if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
    throw new Error('User context (person and account) required')
  }

  const { data, error: err } = await ctx.db
    .from('threads')
    .select('*, type:types(*)')
    .eq('id', thread_id)
    .single()
  if (err || !data) throw new Error(err?.message || 'Thread not found')

  // Prompt-injection pre-flight. Mode comes from the calling app's
  // config.security.prompt_injection: 'off' | 'flag' (default) | 'block'.
  // 'block' refuses before any tokens are spent — callers translate the
  // error into human-routing; 'flag' audits the hit so the security
  // report can aggregate repeat offenders.
  const injectionHit = detectInjection(user_message)
  if (injectionHit) {
    const secCfg = await getAppSecurityConfig(ctx.appId)
    const injectionMode = secCfg?.prompt_injection ?? 'flag'
    void emitSecurityEvent(ctx, 'security.injection_detected', {
      type: 'thread', id: thread_id, account_id: ctx.accountId
    }, {
      result: injectionMode === 'block' ? 'denied' : 'flagged',
      pattern: injectionHit,
      injection_mode: injectionMode,
    })
    if (injectionMode === 'block') {
      const e: any = new Error('Your message could not be processed automatically. A support specialist will review it.')
      e.statusCode = 400
      throw e
    }
  }

  const runMode = (mode as 'step' | 'complete' | 'episode') || 'complete'

  // Episode single-flight: the in-flight driver stamps driver_id +
  // driver_heartbeat_at into research_state. A different driver asking to
  // step/kick while the lease is fresh gets 'running' instead of a second
  // interleaved write pass. The owner itself is never refused (its own
  // staleness check is finer-grained), and a lease expires after
  // DRIVER_LEASE_MS so a crashed driver can't wedge the thread.
  const DRIVER_LEASE_MS = 60000
  const existingState = (data as any)?.data?.research_state
  const heartbeatAt = Date.parse(existingState?.driver_heartbeat_at || '')
  const leaseHolder = existingState?.driver_id
  const callerToken = (body?.driver_token as string) || null
  const callerId = callerToken || ctx.requestId
  const leaseLive =
    !!leaseHolder &&
    leaseHolder !== callerId &&
    !!existingState?.status &&
    !['complete', 'awaiting_input', 'failed'].includes(existingState.status) &&
    Number.isFinite(heartbeatAt) &&
    Date.now() - heartbeatAt < DRIVER_LEASE_MS

  if ((runMode === 'step' || runMode === 'complete') && leaseLive) {
    return { ok: true, thread_id, status: 'running', driver_id: leaseHolder }
  }

  if (runMode === 'episode') {
    if (leaseLive) {
      return { ok: true, thread_id, status: 'running', detached: true, already_running: true }
    }
    // Debit agent_step only when a new driver will actually start work —
    // lease-refused requests and ticket-creation kicks already debited or
    // started nothing, and counting them would double-charge each episode.
    await checkRateLimit(ctx, 'agent_step')
    // Claim the lease before detaching so a step request landing during
    // resolveAgentConfig still sees a live driver. Shared implementation lives
    // in kickAgentEpisode (also used by ticket-creation handlers).
    const leaseId = callerToken || ctx.requestId
    const kick = await kickAgentEpisode(thread_id, user_message || '', ctx, leaseId, (data as any)?.data)
    if (!kick.claimed) {
      return { ok: true, thread_id, status: 'running', detached: true, already_running: true }
    }
    return { ok: true, thread_id, status: 'running', detached: true }
  }

  // step/complete modes debit here — same rule: only when work will start.
  await checkRateLimit(ctx, 'agent_step')
  const message = await runAgent(thread_id, user_message || '', ctx, runMode, callerToken || undefined)

  const { data: updatedThread } = await adminDb
    .from('threads')
    .select('data')
    .eq('id', thread_id)
    .single()

  const state = updatedThread?.data?.research_state || {}
  const messageType = message?.data?.message_type ||
    (state.status === 'awaiting_input' ? 'awaiting_input' : 'final')

  return {
    ok: true,
    thread_id,
    message_id: message?.id || null,
    status: state.status || (message ? 'complete' : 'failed'),
    turn_count: state.turn_count ?? 0,
    content: message?.content || '',
    message_type: messageType,
    data: message?.data || null,
    // Intermediate research messages (tool_call/tool_result/plan) don't carry
    // agent/prompt ids — fall back to the thread's resolved config.
    agent_id: message?.data?.agent_id || updatedThread?.data?.agent_id || null,
    prompt_config_id: message?.data?.prompt_config_id || updatedThread?.data?.prompt_config_id || null,
  }
})
// CIL[END stable_id="~/.framework/functions/ai-agents.ts:run:constant"]
















// CIL[BEGIN stable_id="~/.framework/functions/ai-agents.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/ai-agents.ts"]
/**
 * The handler processes incoming requests based on the specified action and HTTP method, routing them to the appropriate function. It exists to manage different operations like retrieving, creating, or deleting resources in a structured manner.
 *
 * @throws      Error — Invalid action or method
 * @sideEffects none
 * @stability   stable
 * @calls       run, get, list, create, remove
 * @cil-generated
 */








export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  switch (action) {
    case 'run':
      return await run(ctx, body)
    default:
      if (method === 'GET') {
        if (ctx.query?.id) {
          return await get(ctx, body)
        } else {
          return await list(ctx, body)
        }
      } else if (method === 'POST') {
        return await create(ctx, body)
      } else if (method === 'PATCH') {
        return await update(ctx, body)
      } else if (method === 'DELETE') {
        return await remove(ctx, body)
      }
  }

  throw new Error('Invalid action or method')
})
// CIL[END stable_id="~/.framework/functions/ai-agents.ts:handler:constant"]







