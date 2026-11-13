/**
 * @module   trigger-engine
 * @audience internal
 * @layer    shared-core
 * @stability stable
 *
 * This module serves as the trigger engine for processing events within the system, coordinating various actions based on incoming triggers. It integrates with core middleware and database functionalities to ensure that events are handled efficiently and securely.
 * 
 * INVARIANT: All triggers must be validated before processing to maintain system integrity.
 *
 * @seeAlso middleware.ts (provides core context for event handling).
 * @seeAlso db.ts (handles database interactions necessary for trigger processing).
 * @seeAlso audit.ts (ensures auditing of actions taken during event processing).
 * @seeAlso pipeline-runner.ts (executes the defined processing pipeline for triggers).
 *
 * @cil-generated
 */










import { CoreContext } from './middleware'
import { adminDb } from './db'
import { emitAudit } from './audit'

// Callers pass the runtime table name (plural); seeded triggers and the
// EventType union use the singular kind. Mirrors ENTITY_TO_KIND in admin-data.
/**
 * ENTITY_EVENT_NAME is a constant that maps various entity types to their corresponding singular names. It exists to provide a standardized reference for entity names throughout the module.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const ENTITY_EVENT_NAME: Record<string, string> = {
  accounts: 'account',
  people: 'person',
  items: 'item',
  threads: 'thread',
  messages: 'message',
  links: 'link',
  attachments: 'attachment',
  watchers: 'watcher',
  item_progress: 'item_progress',
}
/**
 * This function retrieves the event name associated with a given entity type, defaulting to the entity type itself if no mapping exists. It exists to provide a consistent way to reference event names throughout the module.
 *
 * @inputSpec
 *   entityType: string (required) — the type of the entity for which to retrieve the event name.
 * @outputSpec  string — the event name corresponding to the entity type or the entity type itself if no mapping exists.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const eventNameFor = (entityType: string) =>
  ENTITY_EVENT_NAME[entityType] ?? entityType

/**
 * EventType defines a set of string literals representing various event types related to items, accounts, persons, threads, messages, attachments, and links. It exists to provide a consistent and type-safe way to handle different events within the trigger engine module.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
export type EventType = 
  | 'item_created' | 'item_updated' | 'item_deleted'
  | 'account_created' | 'account_updated' | 'account_deleted'
  | 'person_created' | 'person_updated' | 'person_deleted'
  | 'thread_created' | 'thread_updated' | 'thread_deleted'
  | 'message_created' | 'message_updated' | 'message_deleted'
  | 'attachment_created' | 'attachment_updated' | 'attachment_deleted'
  | 'link_created' | 'link_updated' | 'link_deleted'

/**
 * The Trigger interface defines the structure for a trigger object used in event-driven architectures. It encapsulates the necessary properties to identify and configure triggers within a pipeline.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
interface Trigger {
  id: string
  name: string
  event_type: string
  pipeline_id: string
  config: {
    filters?: Record<string, any>
    entity_type?: string
    type_slug?: string
  }
  is_active: boolean
}

/**
 * POST a pipeline dispatch to the internal background function.
 * Returns immediately; the pipeline runs in a separate process.
 * Any dispatch failure leaves the pre-created execution row 'queued' —
 * the sweeper in pipeline-runner.ts marks it 'failed' after 10 minutes.
 */
export async function dispatchTriggerPipeline(
  pipelineId: string,
  triggerData: any,
  ctx: CoreContext,
  opts: { executionId: string; triggerId: string }
): Promise<void> {
  const secret = (globalThis as any).process?.env?.INTERNAL_INVOKE_SECRET
  if (!secret) {
    console.error(`[${ctx.requestId}] INTERNAL_INVOKE_SECRET not set — cannot dispatch trigger pipeline ${pipelineId}`)
    return
  }

  const siteUrl = (globalThis as any).process?.env?.SITE_URL ||
                  (globalThis as any).process?.env?.URL ||
                  'http://localhost:8888'
  const url = `${siteUrl.replace(/\/$/, '')}/.netlify/functions/pipeline-runner-background`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': secret,
      },
      body: JSON.stringify({
        pipeline_id: pipelineId,
        trigger_data: triggerData,
        account_id: ctx.accountId,
        execution_id: opts.executionId,
        trigger_id: opts.triggerId,
      }),
      // Bound the caller's wait: the background function normally answers
      // 202 in well under a second, but a stuck connection (deploy rollout,
      // slow Netlify queue ack) once held a caller for ~34s.  Aborting only
      // releases this caller — if Netlify already received the POST the
      // queued invocation still runs; if not, the pre-created 'queued'
      // execution row is left for the sweeper.
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => `HTTP ${response.status}`)
      console.error(`[${ctx.requestId}] trigger dispatch failed for pipeline ${pipelineId} (execution ${opts.executionId}): HTTP ${response.status} — ${errText}`)
    }
  } catch (err: any) {
    const timedOut = err?.name === 'AbortError' || err?.name === 'TimeoutError'
    console.error(`[${ctx.requestId}] trigger dispatch ${timedOut ? 'timed out after 5s' : 'error'} for pipeline ${pipelineId} (execution ${opts.executionId}):`, err.message || err)
  }
}


/**
 * Check for active triggers matching the event type and dispatch each to the
 * background pipeline-runner function.  Returns immediately — pipeline
 * completion is tracked in pipeline_executions independently.
 *
 * @inputSpec
 *   - eventType: EventType — the event that occurred.
 *   - entityType: string — the entity type (plural runtime table name).
 *   - entityId: string — the affected entity ID.
 *   - entityData: any — the entity snapshot at the time of the event.
 *   - ctx: CoreContext — request context (account scope, request ID, principal).
 * @outputSpec  Promise<void>
 * @sideEffects INSERTs pipeline_executions rows (status: queued),
 *              RPC record_trigger_fire per matching trigger,
 *              emits trigger.fired / trigger.failed audit events.
 * @stability   stable
 */
export async function checkAndFireTriggers(
  eventType: EventType,
  entityType: string,
  entityId: string,
  entityData: any,
  ctx: CoreContext,
  previousEntityData?: any
): Promise<void> {
  const { data: triggers, error } = await adminDb
    .from('triggers')
    .select('*')
    .eq('event_type', eventType)
    .eq('is_active', true)
    .order('created_at')

  if (error) {
    console.error(`[${ctx.requestId}] Trigger query error:`, error)
    return
  }

  if (!triggers || triggers.length === 0) {
    return
  }

  // entityData carries type_id, never the slug — resolve it once when a
  // trigger for this event filters on config.type_slug, otherwise those
  // triggers can never match.
  if (entityData && entityData.type_slug === undefined && entityData.type_id &&
      triggers.some(t => t.config?.type_slug)) {
    const { data: typeRow } = await adminDb
      .from('types').select('slug').eq('id', entityData.type_id).maybeSingle()
    if (typeRow?.slug) entityData = { ...entityData, type_slug: typeRow.slug }
  }

  for (const trigger of triggers) {
    try {
      const shouldFire = evaluateTriggerConditions(trigger, entityType, entityData)

      if (!shouldFire) {
        continue
      }

      // Transition-only triggers (config.fire_on_transition): fire only when
      // the record moves INTO the matching state.  Without this, every
      // update to an already-matching record re-fires the pipeline — e.g.
      // each write to a published KB article re-dispatched auto_embed (3×
      // per publish) and revoke fired on articles that never left
      // 'published'.  When no previous snapshot is available the trigger
      // fires normally (conservative: matches pre-flag behavior).
      if (trigger.config?.fire_on_transition && previousEntityData) {
        const prevEntityData = {
          ...previousEntityData,
          // Same record → same type; the slug was resolved on the new
          // snapshot only, so carry it over for config.type_slug checks.
          type_slug: previousEntityData.type_slug ?? entityData?.type_slug
        }
        if (evaluateTriggerConditions(trigger, entityType, prevEntityData)) {
          continue
        }
      }

      const triggerData = {
        event: eventType,
        entity_id: entityId,
        entity: {
          type: entityType,
          id: entityId,
          data: entityData
        },
        trigger: {
          id: trigger.id,
          name: trigger.name
        },
        fired_at: new Date().toISOString()
      }

      // Reserve the execution row before dispatch so the audit trail has a
      // stable execution_id even though the pipeline has not started yet.
      // The background function claims this row (queued → running) via
      // runPipeline's opts.executionId parameter.  If dispatch fails, this
      // row stays 'queued' and the sweeper marks it 'failed' after 10 min.
      const { data: execRow } = await adminDb
        .from('pipeline_executions')
        .insert({
          pipeline_id: trigger.pipeline_id,
          status: 'queued',
          trigger_data: triggerData,
          account_id: ctx.accountId,
          // Same guard as runPipeline's own insert: created_by is uuid-typed,
          // non-UUID principals (machine ids like 'system', 'timer:*') → null.
          created_by: ctx.principal?.id &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ctx.principal.id)
            ? ctx.principal.id : null,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      const executionId = execRow?.id ?? crypto.randomUUID()

      await dispatchTriggerPipeline(trigger.pipeline_id, triggerData, ctx, {
        executionId,
        triggerId: trigger.id,
      })

      // Atomic bookkeeping: the previous update embedded an
      // adminDb.rpc() Promise as a column value, so the whole write
      // failed silently — trigger_count stayed 0 and last_triggered
      // stayed null on every fire.
      const { error: fireError } = await adminDb.rpc('record_trigger_fire', {
        p_trigger_id: trigger.id
      })
      if (fireError) {
        console.error(`[${ctx.requestId}] record_trigger_fire failed for ${trigger.id}:`, fireError.message)
      }

      await emitAudit(ctx, 'trigger.fired', {
        type: 'trigger',
        id: trigger.id,
        account_id: ctx.accountId ?? undefined
      }, {
        event_type: eventType,
        entity_type: entityType,
        entity_id: entityId,
        pipeline_id: trigger.pipeline_id,
        execution_id: executionId,
        execution_status: 'queued'
      })

    } catch (error: any) {
      console.error(`[${ctx.requestId}] Trigger ${trigger.id} failed:`, error)

      await emitAudit(ctx, 'trigger.failed', {
        type: 'trigger',
        id: trigger.id,
        account_id: ctx.accountId ?? undefined
      }, {
        event_type: eventType,
        error: error.message
      })
    }
  }
}

/**
 * Evaluates trigger conditions based on the provided trigger configuration, entity type, and entity data. It determines if the conditions are met for a specific trigger to activate.
 *
 * @inputSpec
 *   - trigger: Trigger (required) — the trigger configuration to evaluate against.
 *   - entityType: string (required) — the type of the entity being evaluated.
 *   - entityData: any (required) — the data associated with the entity.
 * @outputSpec  boolean — returns true if all conditions are met, false otherwise.
 * @sideEffects none
 * @stability   stable
 * @calls       getNestedValue, evaluateOperator
 * @cil-generated
 */
function evaluateTriggerConditions(
  trigger: Trigger,
  entityType: string,
  entityData: any
): boolean {
  const config = trigger.config || {}

  if (config.entity_type && config.entity_type !== entityType) {
    return false
  }

  if (config.type_slug && entityData?.type_slug !== config.type_slug) {
    return false
  }

  if (config.filters) {
    for (const [key, expectedValue] of Object.entries(config.filters)) {
      const actualValue = getNestedValue(entityData, key)
      
      if (Array.isArray(expectedValue)) {
        if (!expectedValue.includes(actualValue)) {
          return false
        }
      } else if (typeof expectedValue === 'object' && expectedValue !== null) {
        if (!evaluateOperator(actualValue, expectedValue)) {
          return false
        }
      } else {
        if (actualValue !== expectedValue) {
          return false
        }
      }
    }
  }

  return true
}

/**
 * Retrieves a nested value from an object using a specified path, normalizing Postgres-style accessors to dot notation. This function exists to facilitate easier access to deeply nested properties in objects.
 *
 * @inputSpec
 *   - obj: any (required) — the object from which to retrieve the nested value.
 *   - path: string (required) — the path to the nested value, potentially using Postgres-style accessors.
 * @outputSpec  any — the value found at the specified path, or undefined if not found.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
function getNestedValue(obj: any, path: string): any {
  // Trigger filters may use Postgres-style accessors (data->>'status');
  // normalize them to dot notation before traversing.
  const normalized = path.replace(/->>'?([^']+)'?/g, '.$1')
  return normalized.split('.').reduce((current, key) => {
    return current?.[key]
  }, obj)
}

/**
 * Evaluates a set of operators against an actual value to determine if the conditions are met. This function is used for validating data against specified criteria.
 *
 * @inputSpec
 *   - actual: any (required) — the value to be evaluated against the operators.
 *   - operators: Record<string, any> (required) — a collection of operators and their expected values.
 * @outputSpec  boolean — returns true if all operators are satisfied, otherwise false.
 * @sideEffects none
 * @stability   stable
 * @calls       console.warn
 * @cil-generated
 */
function evaluateOperator(actual: any, operators: Record<string, any>): boolean {
  for (const [op, expected] of Object.entries(operators)) {
    switch (op) {
      case '$eq':
        if (actual !== expected) return false
        break
      case '$ne':
        if (actual === expected) return false
        break
      case '$gt':
        if (!(actual > expected)) return false
        break
      case '$gte':
        if (!(actual >= expected)) return false
        break
      case '$lt':
        if (!(actual < expected)) return false
        break
      case '$lte':
        if (!(actual <= expected)) return false
        break
      case '$in':
        if (!Array.isArray(expected) || !expected.includes(actual)) return false
        break
      case '$nin':
        if (!Array.isArray(expected) || expected.includes(actual)) return false
        break
      case '$exists':
        const exists = actual !== undefined && actual !== null
        if (exists !== expected) return false
        break
      default:
        console.warn(`Unknown operator: ${op}`)
        return false
    }
  }
  return true
}

/**
 * Triggers the creation event for a specified entity type, allowing for associated actions to be executed. This function is essential for managing entity lifecycle events within the system.
 *
 * @inputSpec
 *   - entityType: string (required) — the type of the entity being created.
 *   - entityId: string (required) — the unique identifier of the entity.
 *   - entityData: any (required) — the data associated with the entity.
 *   - ctx: CoreContext (required) — the context in which the operation is performed.
 * @outputSpec  Promise<void>
 * @sideEffects none
 * @stability   stable
 * @calls       eventNameFor, checkAndFireTriggers
 * @cil-generated
 */
export async function fireCreateTriggers(
  entityType: string,
  entityId: string,
  entityData: any,
  ctx: CoreContext
): Promise<void> {
  const eventType = `${eventNameFor(entityType)}_created` as EventType
  await checkAndFireTriggers(eventType, entityType, entityId, entityData, ctx)
}

/**
 * Triggers an update event for a specified entity type and ID, allowing for associated actions to be executed. This function is essential for maintaining consistency and triggering necessary updates in response to entity changes.
 *
 * @inputSpec
 *   entityType: string (required) — the type of the entity being updated.
 *   entityId: string (required) — the unique identifier of the entity.
 *   entityData: any (required) — the data associated with the entity update.
 *   ctx: CoreContext (required) — the context in which the operation is executed.
 * @outputSpec  Promise<void>
 * @sideEffects none
 * @stability   stable
 * @calls       checkAndFireTriggers, eventNameFor
 * @cil-generated
 */
export async function fireUpdateTriggers(
  entityType: string,
  entityId: string,
  entityData: any,
  ctx: CoreContext,
  previousEntityData?: any
): Promise<void> {
  const eventType = `${eventNameFor(entityType)}_updated` as EventType
  await checkAndFireTriggers(eventType, entityType, entityId, entityData, ctx, previousEntityData)
}

/**
 * The fireDeleteTriggers function triggers delete events for a specified entity type and ID. It ensures that any associated triggers are executed when an entity is deleted.
 *
 * @inputSpec
 *   - entityType: string (required) — the type of the entity being deleted.
 *   - entityId: string (required) — the unique identifier of the entity.
 *   - entityData: any (required) — the data associated with the entity.
 *   - ctx: CoreContext (required) — the context in which the operation is performed.
 * @outputSpec  Promise<void>
 * @sideEffects none
 * @stability   stable
 * @calls       eventNameFor, checkAndFireTriggers
 * @cil-generated
 */
export async function fireDeleteTriggers(
  entityType: string,
  entityId: string,
  entityData: any,
  ctx: CoreContext
): Promise<void> {
  const eventType = `${eventNameFor(entityType)}_deleted` as EventType
  await checkAndFireTriggers(eventType, entityType, entityId, entityData, ctx)
}