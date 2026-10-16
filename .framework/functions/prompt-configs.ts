// CIL[BEGIN stable_id="~/.framework/functions/prompt-configs.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/prompt-configs.ts"]
// CIL[DOC-MACRO purpose="Import shared dependencies for prompt configuration handlers."]
// CIL[DOC-RESPONSIBILITY responsibility="Declare module-level imports used by prompt-config handlers."]
// CIL[DOC-CONTEXT module="prompt-configs" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="imported utilities" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports middleware, audit, permissions, database, and principal utilities." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework"]
import { createHandler } from './_shared/middleware'
import { emitLog } from './_shared/audit'
import { sanitizeRecordData } from './_shared/permissions'
import { adminDb } from './_shared/db'
import { isSystemAdmin } from './_shared/principal'
// CIL[DOC-VECTOR type="context" content="purpose='Import shared dependencies for prompt configuration handlers.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/prompt-configs.ts:module_header:module_header"]







// CIL[BEGIN stable_id="~/.framework/functions/prompt-configs.ts:list:constant" type="constant" identity="list" parent="~/.framework/functions/prompt-configs.ts"]
// CIL[DOC-MACRO purpose="List prompt configuration records with optional filtering."]
// CIL[DOC-RESPONSIBILITY responsibility="Return a paginated, filtered list of prompt configs for the current account."]
// CIL[DOC-CONTEXT module="prompt-configs" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/prompt-configs.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query optional model, is_active, limit, offset" outputs="sanitized prompt_config records array" errors="throws if account missing or db error" side_effects="queries prompt_configs table"]
// CIL[DOC-MICRO logic_summary="Determines db context, builds query with filters and pagination, sanitizes each record." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const list = createHandler(async (ctx, _body) => {
  const { model, is_active, limit = 100, offset = 0 } = ctx.query || {}

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db

  let query = db
    .from('prompt_configs')
    .select('*')
    .order('name')

  if (model) {
    query = query.eq('model', model)
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
  for (const config of data || []) {
    sanitized.push(await sanitizeRecordData(ctx, config, 'prompt_config'))
  }

  return sanitized
})
// CIL[DOC-VECTOR type="context" content="purpose='List prompt configuration records with optional filtering.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/prompt-configs.ts:list:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/prompt-configs.ts:get:constant" type="constant" identity="get" parent="~/.framework/functions/prompt-configs.ts"]
// CIL[DOC-MACRO purpose="Retrieve a single prompt configuration by ID."]
// CIL[DOC-RESPONSIBILITY responsibility="Return the sanitized prompt config for the given id."]
// CIL[DOC-CONTEXT module="prompt-configs" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/prompt-configs.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.id" outputs="sanitized prompt_config record" errors="throws if id missing or db error" side_effects="queries prompt_configs table"]
// CIL[DOC-MICRO logic_summary="Validates id, fetches the single matching record, sanitizes and returns it." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const get = createHandler(async (ctx, _body) => {
  const { id } = ctx.query || {}

  if (!id) {
    throw new Error('Config ID is required')
  }

  const db = isSystemAdmin(ctx.principal) ? adminDb : ctx.db
  const { data, error: err } = await db
    .from('prompt_configs')
    .select('*')
    .eq('id', id)
    .single()

  if (err) throw err

  return await sanitizeRecordData(ctx, data, 'prompt_config')
})
// CIL[DOC-VECTOR type="context" content="purpose='Retrieve a single prompt configuration by ID.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/prompt-configs.ts:get:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/prompt-configs.ts:create:constant" type="constant" identity="create" parent="~/.framework/functions/prompt-configs.ts"]
// CIL[DOC-MACRO purpose="Create a new prompt configuration record."]
// CIL[DOC-RESPONSIBILITY responsibility="Insert a new prompt_config with defaults and return the created record."]
// CIL[DOC-CONTEXT module="prompt-configs" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/prompt-configs.ts"]
// CIL[DOC-CONTRACT inputs="body with name, slug and optional fields" outputs="created prompt_config record" errors="throws if name/slug missing, account missing, or db error" side_effects="inserts into prompt_configs table and emits audit log"]
// CIL[DOC-MICRO logic_summary="Validates required fields, applies defaults, inserts the row, and emits an audit log." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const create = createHandler(async (ctx, body) => {
  const { app_id, name, slug, description, system_prompt, context_template, model, temperature, max_tokens,
    is_multi_turn, max_history_messages, confidence_threshold, escalation_action, escalation_target,
    output_mode, output_field, requires_review, knowledge_sources, available_tools, tool_constraints,
    metadata } = body

  if (!name || !slug) {
    throw new Error('name and slug are required')
  }

  if (!ctx.accountId) {
    throw new Error('Account context required')
  }

  const { data, error: err } = await ctx.db
    .from('prompt_configs')
    .insert({
      app_id: app_id || null,
      account_id: ctx.accountId,
      name,
      slug,
      description: description || null,
      system_prompt: system_prompt || null,
      context_template: context_template || null,
      model: model || 'gpt-4o',
      temperature: temperature ?? 0.7,
      max_tokens: max_tokens ?? 4000,
      is_multi_turn: is_multi_turn ?? true,
      max_history_messages: max_history_messages ?? 20,
      confidence_threshold: confidence_threshold || null,
      escalation_action: escalation_action || null,
      escalation_target: escalation_target || null,
      output_mode: output_mode || null,
      output_field: output_field || null,
      requires_review: requires_review ?? false,
      knowledge_sources: knowledge_sources || [],
      available_tools: available_tools || [],
      tool_constraints: tool_constraints || {},
      metadata: metadata || {}
    })
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'prompt_config.created', 
    { type: 'prompt_config', id: data.id }, 
    { after: { name, slug, model: data.model } }
  )

  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='Create a new prompt configuration record.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/prompt-configs.ts:create:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/prompt-configs.ts:update:constant" type="constant" identity="update" parent="~/.framework/functions/prompt-configs.ts"]
// CIL[DOC-MACRO purpose="Update an existing prompt configuration."]
// CIL[DOC-RESPONSIBILITY responsibility="Apply allowed field updates to a prompt config and return the updated record."]
// CIL[DOC-CONTEXT module="prompt-configs" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/prompt-configs.ts"]
// CIL[DOC-CONTRACT inputs="body or query with id plus allowed updates" outputs="updated prompt_config record" errors="throws if id missing or db error" side_effects="updates prompt_configs table and emits audit log"]
// CIL[DOC-MICRO logic_summary="Merges allowed updates with updated_at timestamp, performs the update, and emits an audit log." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const update = createHandler(async (ctx, body) => {
  const id = body?.id || ctx.query?.id
  const { id: _bodyId, ...updates } = body || {}

  if (!id) {
    throw new Error('Config ID is required')
  }

  const allowed = ['name', 'slug', 'description', 'app_id', 'system_prompt', 'context_template', 'model', 'temperature',
    'max_tokens', 'is_multi_turn', 'max_history_messages', 'confidence_threshold',
    'escalation_action', 'escalation_target', 'output_mode', 'output_field', 'requires_review',
    'knowledge_sources', 'available_tools', 'tool_constraints', 'metadata', 'is_active']
  const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (updates[key] !== undefined) updateData[key] = updates[key]
  }

  const { data, error: err } = await ctx.db
    .from('prompt_configs')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (err) throw err

  await emitLog(ctx, 'prompt_config.updated', 
    { type: 'prompt_config', id }, 
    { after: updateData }
  )

  return data
})
// CIL[DOC-VECTOR type="context" content="purpose='Update an existing prompt configuration.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/prompt-configs.ts:update:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/prompt-configs.ts:remove:constant" type="constant" identity="remove" parent="~/.framework/functions/prompt-configs.ts"]
// CIL[DOC-MACRO purpose="Delete a prompt configuration by ID."]
// CIL[DOC-RESPONSIBILITY responsibility="Remove a prompt_config record and confirm success."]
// CIL[DOC-CONTEXT module="prompt-configs" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/prompt-configs.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query.id" outputs="{ success: true }" errors="throws if id missing, not found, or db error" side_effects="deletes from prompt_configs table and emits audit log"]
// CIL[DOC-MICRO logic_summary="Fetches the current record for audit, deletes the row, and emits an audit log." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const remove = createHandler(async (ctx, _body) => {
  const id = ctx.query?.id

  if (!id) {
    throw new Error('Config ID is required')
  }

  const { data: current } = await ctx.db
    .from('prompt_configs')
    .select('id, name, slug')
    .eq('id', id)
    .single()

  if (!current) throw new Error('Prompt config not found')

  const { error: err } = await ctx.db
    .from('prompt_configs')
    .delete()
    .eq('id', id)

  if (err) throw err

  await emitLog(ctx, 'prompt_config.deleted', 
    { type: 'prompt_config', id }, 
    { before: current }
  )

  return { success: true }
})
// CIL[DOC-VECTOR type="context" content="purpose='Delete a prompt configuration by ID.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/prompt-configs.ts:remove:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/prompt-configs.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/prompt-configs.ts"]
// CIL[DOC-MACRO purpose="Dispatch prompt configuration requests by HTTP method and query."]
// CIL[DOC-RESPONSIBILITY responsibility="Route incoming requests to list, get, create, update, or remove handlers."]
// CIL[DOC-CONTEXT module="prompt-configs" layer="functions" related_files=".framework/functions/_shared/audit.ts,.framework/functions/_shared/db.ts,.framework/functions/_shared/middleware.ts,.framework/functions/_shared/permissions.ts,.framework/functions/_shared/principal.ts,.framework/functions/prompt-configs.ts"]
// CIL[DOC-CONTRACT inputs="ctx.query action and method, optional body" outputs="result from delegated handler" errors="throws if invalid action or method" side_effects="delegates to other handlers"]
// CIL[DOC-MICRO logic_summary="Switches on HTTP method and query id/action to call the appropriate handler." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  switch (action) {
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
// CIL[DOC-VECTOR type="context" content="purpose='Dispatch prompt configuration requests by HTTP method and query.'; No verified external callers; imports: .framework/functions/_shared/middleware.ts,.framework/functions/_shared/audit.ts,.framework/functions/_shared/permissions.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/prompt-configs.ts:handler:constant"]
