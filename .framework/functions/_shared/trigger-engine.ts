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
// CIL[BEGIN stable_id="~/.framework/functions/_shared/trigger-engine.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/trigger-engine.ts"]
// CIL[DOC-MACRO purpose="This module serves as the trigger engine for processing events within the system, coordinating various actions based on incoming triggers."]
// CIL[DOC-RESPONSIBILITY responsibility="This module serves as the trigger engine for processing events within the system, coordinating various actions based on incoming triggers. It integrates with core middleware and database functionalities to ensure that events are handled efficiently and securely. INVARIANT: All triggers must be validated before processing to maintain system integrity."]
// CIL[DOC-CONTEXT module="trigger-engine" layer="shared-core" related_files="middleware.ts (provides core context for event handling).,db.ts (handles database interactions necessary for trigger processing).,audit.ts (ensures auditing of actions taken during event processing).,pipeline-runner.ts (executes the defined processing pipeline for triggers)."]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="This module serves as the trigger engine for processing events within the system, coordinating various actions based on incoming triggers. It integrates with core middleware and database functionalities to ensure that events are handled efficiently and securely. INVARIANT: All triggers must be validated before processing to maintain system integrity." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]










import { CoreContext } from './middleware'
import { adminDb } from './db'
import { emitAudit } from './audit'
import { runPipeline } from './pipeline-runner'
// CIL[END stable_id="~/.framework/functions/_shared/trigger-engine.ts:module_header:module_header"]
// CIL[DOC-VECTOR type="context" content="purpose='This module serves as the trigger engine for processing events within the system, coordinating various actions based on incoming triggers.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// Callers pass the runtime table name (plural); seeded triggers and the
// EventType union use the singular kind. Mirrors ENTITY_TO_KIND in admin-data.
// CIL[DOC-MACRO purpose="ENTITY_EVENT_NAME is a constant that maps various entity types to their corresponding singular names."]
// CIL[DOC-RESPONSIBILITY responsibility="ENTITY_EVENT_NAME is a constant that maps various entity types to their corresponding singular names. It exists to provide a standardized reference for entity names throughout the module."]
// CIL[DOC-CONTEXT module="trigger-engine" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/pipeline-runner"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="ENTITY_EVENT_NAME is a constant that maps various entity types to their corresponding singular names. It exists to provide a standardized reference for entity names throughout the module." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * ENTITY_EVENT_NAME is a constant that maps various entity types to their corresponding singular names. It exists to provide a standardized reference for entity names throughout the module.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/trigger-engine.ts:entity_event_name:constant" type="constant" identity="ENTITY_EVENT_NAME" parent="~/.framework/functions/_shared/trigger-engine.ts"]
// CIL[DOC-MACRO purpose="ENTITY_EVENT_NAME constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the ENTITY_EVENT_NAME constant."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/trigger-engine.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the ENTITY_EVENT_NAME constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/.framework/functions/_shared/trigger-engine.ts:entity_event_name:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='ENTITY_EVENT_NAME is a constant that maps various entity types to their corresponding singular names.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="This function retrieves the event name associated with a given entity type, defaulting to the entity type itself if no mapping exists."]
// CIL[DOC-RESPONSIBILITY responsibility="This function retrieves the event name associated with a given entity type, defaulting to the entity type itself if no mapping exists. It exists to provide a consistent way to reference event names throughout the module."]
// CIL[DOC-CONTEXT module="trigger-engine" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/pipeline-runner"]
// CIL[DOC-CONTRACT inputs="entityType: string (required) — the type of the entity for which to retrieve the event name." outputs="string — the event name corresponding to the entity type or the entity type itself if no mapping exists." errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="This function retrieves the event name associated with a given entity type, defaulting to the entity type itself if no mapping exists. It exists to provide a consistent way to reference event names throughout the module." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[BEGIN stable_id="~/.framework/functions/_shared/trigger-engine.ts:eventnamefor:constant" type="constant" identity="eventNameFor" parent="~/.framework/functions/_shared/trigger-engine.ts"]
// CIL[DOC-MACRO purpose="eventNameFor constant"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the eventNameFor constant."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/trigger-engine.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the eventNameFor constant." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const eventNameFor = (entityType: string) =>
  ENTITY_EVENT_NAME[entityType] ?? entityType
// CIL[END stable_id="~/.framework/functions/_shared/trigger-engine.ts:eventnamefor:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='This function retrieves the event name associated with a given entity type, defaulting to the entity type itself if no mapping exists.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="EventType defines a set of string literals representing various event types related to items, accounts, persons, threads, messages, attachments, and links."]
// CIL[DOC-RESPONSIBILITY responsibility="EventType defines a set of string literals representing various event types related to items, accounts, persons, threads, messages, attachments, and links. It exists to provide a consistent and type-safe way to handle different events within the trigger engine module."]
// CIL[DOC-CONTEXT module="trigger-engine" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/pipeline-runner"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="EventType defines a set of string literals representing various event types related to items, accounts, persons, threads, messages, attachments, and links. It exists to provide a consistent and type-safe way to handle different events within the trigger engine module." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * EventType defines a set of string literals representing various event types related to items, accounts, persons, threads, messages, attachments, and links. It exists to provide a consistent and type-safe way to handle different events within the trigger engine module.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/trigger-engine.ts:eventtype:type" type="type" identity="EventType" parent="~/.framework/functions/_shared/trigger-engine.ts"]
// CIL[DOC-MACRO purpose="EventType type"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the EventType type."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/trigger-engine.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the EventType type." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export type EventType = 
  | 'item_created' | 'item_updated' | 'item_deleted'
  | 'account_created' | 'account_updated' | 'account_deleted'
  | 'person_created' | 'person_updated' | 'person_deleted'
  | 'thread_created' | 'thread_updated' | 'thread_deleted'
  | 'message_created' | 'message_updated' | 'message_deleted'
  | 'attachment_created' | 'attachment_updated' | 'attachment_deleted'
  | 'link_created' | 'link_updated' | 'link_deleted'
// CIL[END stable_id="~/.framework/functions/_shared/trigger-engine.ts:eventtype:type"]
// CIL[DOC-VECTOR type="context" content="purpose='EventType defines a set of string literals representing various event types related to items, accounts, persons, threads, messages, attachments, and links.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="The Trigger interface defines the structure for a trigger object used in event-driven architectures."]
// CIL[DOC-RESPONSIBILITY responsibility="The Trigger interface defines the structure for a trigger object used in event-driven architectures. It encapsulates the necessary properties to identify and configure triggers within a pipeline."]
// CIL[DOC-CONTEXT module="trigger-engine" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/pipeline-runner"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="The Trigger interface defines the structure for a trigger object used in event-driven architectures. It encapsulates the necessary properties to identify and configure triggers within a pipeline." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * The Trigger interface defines the structure for a trigger object used in event-driven architectures. It encapsulates the necessary properties to identify and configure triggers within a pipeline.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/trigger-engine.ts:trigger:interface" type="interface" identity="Trigger" parent="~/.framework/functions/_shared/trigger-engine.ts"]
// CIL[DOC-MACRO purpose="Trigger interface"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the Trigger interface."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/trigger-engine.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the Trigger interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/.framework/functions/_shared/trigger-engine.ts:trigger:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='The Trigger interface defines the structure for a trigger object used in event-driven architectures.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="This function checks for active triggers based on the specified event type and fires them if their conditions are met."]
// CIL[DOC-RESPONSIBILITY responsibility="This function checks for active triggers based on the specified event type and fires them if their conditions are met. It exists to facilitate the execution of defined actions in response to specific events within the system."]
// CIL[DOC-CONTEXT module="trigger-engine" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/pipeline-runner"]
// CIL[DOC-CONTRACT inputs="- eventType: EventType (required) — the type of event that triggers the action.\\n- entityType: string (required) — the type of entity associated with the event.\\n- entityId: string (required) — the unique identifier of the entity.\\n- entityData: any (required) — the data associated with the entity.\\n- ctx: CoreContext (required) — the context for the current operation." outputs="Promise<void>" errors="none" side_effects="Database writes to update trigger last triggered time and count, RPC calls to increment trigger count, and audit log emissions. dependencies="adminDb.from('triggers'), adminDb.from('types'), runPipeline, emitAudit, adminDb.from('triggers').update"]
// CIL[DOC-MICRO logic_summary="This function checks for active triggers based on the specified event type and fires them if their conditions are met. It exists to facilitate the execution of defined actions in response to specific events within the system." notable_decisions="Logs errors to the console and emits audit logs for failures."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * This function checks for active triggers based on the specified event type and fires them if their conditions are met. It exists to facilitate the execution of defined actions in response to specific events within the system.
 *
 * @inputSpec
 *   - eventType: EventType (required) — the type of event that triggers the action.
 *   - entityType: string (required) — the type of entity associated with the event.
 *   - entityId: string (required) — the unique identifier of the entity.
 *   - entityData: any (required) — the data associated with the entity.
 *   - ctx: CoreContext (required) — the context for the current operation.
 * @outputSpec  Promise<void>
 * @sideEffects Database writes to update trigger last triggered time and count, RPC calls to increment trigger count, and audit log emissions.
 * @stability   stable
 * @calls       adminDb.from('triggers'), adminDb.from('types'), runPipeline, emitAudit, adminDb.from('triggers').update
 * @errorHandling Logs errors to the console and emits audit logs for failures.
 * @cil-generated
 */
// CIL[BEGIN stable_id="~/.framework/functions/_shared/trigger-engine.ts:checkandfiretriggers:function" type="function" identity="checkAndFireTriggers" parent="~/.framework/functions/_shared/trigger-engine.ts"]
// CIL[DOC-MACRO purpose="checkAndFireTriggers function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the checkAndFireTriggers function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/trigger-engine.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the checkAndFireTriggers function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function checkAndFireTriggers(
  eventType: EventType,
  entityType: string,
  entityId: string,
  entityData: any,
  ctx: CoreContext
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

      const result = await runPipeline(trigger.pipeline_id, triggerData, ctx)

      await adminDb
        .from('triggers')
        .update({
          last_triggered: new Date().toISOString(),
          trigger_count: adminDb.rpc('increment_trigger_count', { p_trigger_id: trigger.id })
        })
        .eq('id', trigger.id)

      await emitAudit(ctx, 'trigger.fired', {
        type: 'trigger',
        id: trigger.id,
        account_id: ctx.accountId ?? undefined
      }, {
        event_type: eventType,
        entity_type: entityType,
        entity_id: entityId,
        pipeline_id: trigger.pipeline_id,
        execution_id: result.executionId,
        execution_status: result.status
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
// CIL[END stable_id="~/.framework/functions/_shared/trigger-engine.ts:checkandfiretriggers:function"]
// CIL[DOC-VECTOR type="context" content="purpose='This function checks for active triggers based on the specified event type and fires them if their conditions are met.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Evaluates trigger conditions based on the provided trigger configuration, entity type, and entity data."]
// CIL[DOC-RESPONSIBILITY responsibility="Evaluates trigger conditions based on the provided trigger configuration, entity type, and entity data. It determines if the conditions are met for a specific trigger to activate."]
// CIL[DOC-CONTEXT module="trigger-engine" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/pipeline-runner"]
// CIL[DOC-CONTRACT inputs="- trigger: Trigger (required) — the trigger configuration to evaluate against.\\n- entityType: string (required) — the type of the entity being evaluated.\\n- entityData: any (required) — the data associated with the entity." outputs="boolean — returns true if all conditions are met, false otherwise." errors="none" side_effects="none dependencies="getNestedValue, evaluateOperator"]
// CIL[DOC-MICRO logic_summary="Evaluates trigger conditions based on the provided trigger configuration, entity type, and entity data. It determines if the conditions are met for a specific trigger to activate." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[BEGIN stable_id="~/.framework/functions/_shared/trigger-engine.ts:evaluatetriggerconditions:function" type="function" identity="evaluateTriggerConditions" parent="~/.framework/functions/_shared/trigger-engine.ts"]
// CIL[DOC-MACRO purpose="evaluateTriggerConditions function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the evaluateTriggerConditions function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/trigger-engine.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the evaluateTriggerConditions function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/.framework/functions/_shared/trigger-engine.ts:evaluatetriggerconditions:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Evaluates trigger conditions based on the provided trigger configuration, entity type, and entity data.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Retrieves a nested value from an object using a specified path, normalizing Postgres-style accessors to dot notation."]
// CIL[DOC-RESPONSIBILITY responsibility="Retrieves a nested value from an object using a specified path, normalizing Postgres-style accessors to dot notation. This function exists to facilitate easier access to deeply nested properties in objects."]
// CIL[DOC-CONTEXT module="trigger-engine" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/pipeline-runner"]
// CIL[DOC-CONTRACT inputs="- obj: any (required) — the object from which to retrieve the nested value.\\n- path: string (required) — the path to the nested value, potentially using Postgres-style accessors." outputs="any — the value found at the specified path, or undefined if not found." errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Retrieves a nested value from an object using a specified path, normalizing Postgres-style accessors to dot notation. This function exists to facilitate easier access to deeply nested properties in objects." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[BEGIN stable_id="~/.framework/functions/_shared/trigger-engine.ts:getnestedvalue:function" type="function" identity="getNestedValue" parent="~/.framework/functions/_shared/trigger-engine.ts"]
// CIL[DOC-MACRO purpose="getNestedValue function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the getNestedValue function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/trigger-engine.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the getNestedValue function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function getNestedValue(obj: any, path: string): any {
  // Trigger filters may use Postgres-style accessors (data->>'status');
  // normalize them to dot notation before traversing.
  const normalized = path.replace(/->>'?([^']+)'?/g, '.$1')
  return normalized.split('.').reduce((current, key) => {
    return current?.[key]
  }, obj)
}
// CIL[END stable_id="~/.framework/functions/_shared/trigger-engine.ts:getnestedvalue:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Retrieves a nested value from an object using a specified path, normalizing Postgres-style accessors to dot notation.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Evaluates a set of operators against an actual value to determine if the conditions are met."]
// CIL[DOC-RESPONSIBILITY responsibility="Evaluates a set of operators against an actual value to determine if the conditions are met. This function is used for validating data against specified criteria."]
// CIL[DOC-CONTEXT module="trigger-engine" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/pipeline-runner"]
// CIL[DOC-CONTRACT inputs="- actual: any (required) — the value to be evaluated against the operators.\\n- operators: Record<string, any> (required) — a collection of operators and their expected values." outputs="boolean — returns true if all operators are satisfied, otherwise false." errors="none" side_effects="none dependencies="console.warn"]
// CIL[DOC-MICRO logic_summary="Evaluates a set of operators against an actual value to determine if the conditions are met. This function is used for validating data against specified criteria." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[BEGIN stable_id="~/.framework/functions/_shared/trigger-engine.ts:evaluateoperator:function" type="function" identity="evaluateOperator" parent="~/.framework/functions/_shared/trigger-engine.ts"]
// CIL[DOC-MACRO purpose="evaluateOperator function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the evaluateOperator function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/trigger-engine.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the evaluateOperator function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/.framework/functions/_shared/trigger-engine.ts:evaluateoperator:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Evaluates a set of operators against an actual value to determine if the conditions are met.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Triggers the creation event for a specified entity type, allowing for associated actions to be executed."]
// CIL[DOC-RESPONSIBILITY responsibility="Triggers the creation event for a specified entity type, allowing for associated actions to be executed. This function is essential for managing entity lifecycle events within the system."]
// CIL[DOC-CONTEXT module="trigger-engine" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/pipeline-runner"]
// CIL[DOC-CONTRACT inputs="- entityType: string (required) — the type of the entity being created.\\n- entityId: string (required) — the unique identifier of the entity.\\n- entityData: any (required) — the data associated with the entity.\\n- ctx: CoreContext (required) — the context in which the operation is performed." outputs="Promise<void>" errors="none" side_effects="none dependencies="eventNameFor, checkAndFireTriggers"]
// CIL[DOC-MICRO logic_summary="Triggers the creation event for a specified entity type, allowing for associated actions to be executed. This function is essential for managing entity lifecycle events within the system." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[BEGIN stable_id="~/.framework/functions/_shared/trigger-engine.ts:firecreatetriggers:function" type="function" identity="fireCreateTriggers" parent="~/.framework/functions/_shared/trigger-engine.ts"]
// CIL[DOC-MACRO purpose="fireCreateTriggers function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the fireCreateTriggers function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/trigger-engine.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the fireCreateTriggers function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function fireCreateTriggers(
  entityType: string,
  entityId: string,
  entityData: any,
  ctx: CoreContext
): Promise<void> {
  const eventType = `${eventNameFor(entityType)}_created` as EventType
  await checkAndFireTriggers(eventType, entityType, entityId, entityData, ctx)
}
// CIL[END stable_id="~/.framework/functions/_shared/trigger-engine.ts:firecreatetriggers:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Triggers the creation event for a specified entity type, allowing for associated actions to be executed.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Triggers an update event for a specified entity type and ID, allowing for associated actions to be executed."]
// CIL[DOC-RESPONSIBILITY responsibility="Triggers an update event for a specified entity type and ID, allowing for associated actions to be executed. This function is essential for maintaining consistency and triggering necessary updates in response to entity changes."]
// CIL[DOC-CONTEXT module="trigger-engine" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/pipeline-runner"]
// CIL[DOC-CONTRACT inputs="entityType: string (required) — the type of the entity being updated.\\nentityId: string (required) — the unique identifier of the entity.\\nentityData: any (required) — the data associated with the entity update.\\nctx: CoreContext (required) — the context in which the operation is executed." outputs="Promise<void>" errors="none" side_effects="none dependencies="checkAndFireTriggers, eventNameFor"]
// CIL[DOC-MICRO logic_summary="Triggers an update event for a specified entity type and ID, allowing for associated actions to be executed. This function is essential for maintaining consistency and triggering necessary updates in response to entity changes." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[BEGIN stable_id="~/.framework/functions/_shared/trigger-engine.ts:fireupdatetriggers:function" type="function" identity="fireUpdateTriggers" parent="~/.framework/functions/_shared/trigger-engine.ts"]
// CIL[DOC-MACRO purpose="fireUpdateTriggers function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the fireUpdateTriggers function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/trigger-engine.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the fireUpdateTriggers function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function fireUpdateTriggers(
  entityType: string,
  entityId: string,
  entityData: any,
  ctx: CoreContext
): Promise<void> {
  const eventType = `${eventNameFor(entityType)}_updated` as EventType
  await checkAndFireTriggers(eventType, entityType, entityId, entityData, ctx)
}
// CIL[END stable_id="~/.framework/functions/_shared/trigger-engine.ts:fireupdatetriggers:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Triggers an update event for a specified entity type and ID, allowing for associated actions to be executed.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="The fireDeleteTriggers function triggers delete events for a specified entity type and ID."]
// CIL[DOC-RESPONSIBILITY responsibility="The fireDeleteTriggers function triggers delete events for a specified entity type and ID. It ensures that any associated triggers are executed when an entity is deleted."]
// CIL[DOC-CONTEXT module="trigger-engine" layer="app-specific" related_files=".framework/functions/_shared/middleware,.framework/functions/_shared/db,.framework/functions/_shared/audit,.framework/functions/_shared/pipeline-runner"]
// CIL[DOC-CONTRACT inputs="- entityType: string (required) — the type of the entity being deleted.\\n- entityId: string (required) — the unique identifier of the entity.\\n- entityData: any (required) — the data associated with the entity.\\n- ctx: CoreContext (required) — the context in which the operation is performed." outputs="Promise<void>" errors="none" side_effects="none dependencies="eventNameFor, checkAndFireTriggers"]
// CIL[DOC-MICRO logic_summary="The fireDeleteTriggers function triggers delete events for a specified entity type and ID. It ensures that any associated triggers are executed when an entity is deleted." notable_decisions="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[BEGIN stable_id="~/.framework/functions/_shared/trigger-engine.ts:firedeletetriggers:function" type="function" identity="fireDeleteTriggers" parent="~/.framework/functions/_shared/trigger-engine.ts"]
// CIL[DOC-MACRO purpose="fireDeleteTriggers function"]
// CIL[DOC-RESPONSIBILITY responsibility="Implements the fireDeleteTriggers function."]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/trigger-engine.ts" layer="app-specific" related_files=""]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Implements the fireDeleteTriggers function." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.8" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function fireDeleteTriggers(
  entityType: string,
  entityId: string,
  entityData: any,
  ctx: CoreContext
): Promise<void> {
  const eventType = `${eventNameFor(entityType)}_deleted` as EventType
  await checkAndFireTriggers(eventType, entityType, entityId, entityData, ctx)
}
// CIL[END stable_id="~/.framework/functions/_shared/trigger-engine.ts:firedeletetriggers:function"]
// CIL[DOC-VECTOR type="context" content="purpose='The fireDeleteTriggers function triggers delete events for a specified entity type and ID.'; No verified external callers" status="ready"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only" status="ready"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified" status="ready"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented" status="ready"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]