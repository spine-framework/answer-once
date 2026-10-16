// CIL[BEGIN stable_id="~/.framework/functions/_shared/webhook-registration.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/webhook-registration.ts"]
// CIL[DOC-MACRO purpose="Module header for webhook-registration; imports shared database access."]
// CIL[DOC-RESPONSIBILITY responsibility="Declares module-level imports and identifies file scope."]
// CIL[DOC-CONTEXT module="webhook-registration" layer="functions" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports adminDb from ./db for use by webhook registration helpers" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="spine-functions maintainers"]

import { adminDb } from './db'
// CIL[DOC-VECTOR type="context" content="purpose='Module header for webhook-registration; imports shared database access.'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/webhook-registration.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/webhook-registration.ts:WebhookHandlerRegistration:interface" type="interface" identity="WebhookHandlerRegistration" parent="~/.framework/functions/_shared/webhook-registration.ts"]
// CIL[DOC-MACRO purpose="Defines the configuration shape for registering a webhook handler"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe the fields required to register a webhook handler"]
// CIL[DOC-CONTEXT module="webhook-registration" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/webhook-registration.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="WebhookHandlerRegistration interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exported interface describing name, functionName, optional description, events, appId, accountId, isSystem, and an optional db override" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface WebhookHandlerRegistration {
  name: string
  functionName: string
  description?: string
  events?: string[]
  appId?: string | null
  accountId?: string | null
  isSystem?: boolean
  db?: typeof adminDb
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the configuration shape for registering a webhook handler'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/webhook-registration.ts:WebhookHandlerRegistration:interface"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/webhook-registration.ts:registerWebhookHandler:function" type="function" identity="registerWebhookHandler" parent="~/.framework/functions/_shared/webhook-registration.ts"]
// CIL[DOC-MACRO purpose="Registers or updates a webhook handler record in the database"]
// CIL[DOC-RESPONSIBILITY responsibility="Upsert an active webhook_handlers row for the given configuration"]
// CIL[DOC-CONTEXT module="webhook-registration" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/webhook-registration.ts"]
// CIL[DOC-CONTRACT inputs="config: WebhookHandlerRegistration" outputs="void" errors="Supabase upsert error or thrown error" side_effects="Inserts/updates a row in webhook_handlers and logs to console"]
// CIL[DOC-MICRO logic_summary="Uses provided db or adminDb, upserts a row with name, function_name, description, events, app_id, account_id, is_system, is_active, is_deleted, and timestamps, on conflict on app_id,account_id,name; throws on error" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function registerWebhookHandler(
  config: WebhookHandlerRegistration
): Promise<void> {
  const db = config.db || adminDb

  try {
    const { error } = await db
      .from('webhook_handlers')
      .upsert({
        name: config.name,
        function_name: config.functionName,
        description: config.description || `${config.name} webhook handler`,
        events: config.events || [],
        app_id: config.appId || null,
        account_id: config.accountId || null,
        is_system: config.isSystem || false,
        is_active: true,
        is_deleted: false,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }, {
        onConflict: 'app_id,account_id,name'
      })

    if (error) {
      console.error(`[webhook-registration] Failed to register ${config.name}:`, error)
      throw error
    }

    console.log(`[webhook-registration] Registered handler: ${config.name}`)
  } catch (err) {
    console.error(`[webhook-registration] Error registering ${config.name}:`, err)
    throw err
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Registers or updates a webhook handler record in the database'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/webhook-registration.ts:registerWebhookHandler:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/webhook-registration.ts:deregisterWebhookHandler:function" type="function" identity="deregisterWebhookHandler" parent="~/.framework/functions/_shared/webhook-registration.ts"]
// CIL[DOC-MACRO purpose="Marks a webhook handler as inactive and deleted in the database"]
// CIL[DOC-RESPONSIBILITY responsibility="Soft-delete a webhook handler by name and optional scope"]
// CIL[DOC-CONTEXT module="webhook-registration" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/webhook-registration.ts"]
// CIL[DOC-CONTRACT inputs="name: string, appId: string | null, accountId: string | null, db: typeof adminDb" outputs="void" errors="Supabase update error or thrown error" side_effects="Updates webhook_handlers setting is_active=false, is_deleted=true, deleted_at; logs to console"]
// CIL[DOC-MICRO logic_summary="Builds an update query filtered by name and optional appId/accountId, sets is_active and is_deleted flags with deleted_at, throws on error" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function deregisterWebhookHandler(
  name: string,
  appId: string | null = null,
  accountId: string | null = null,
  db: typeof adminDb = adminDb
): Promise<void> {
  try {
    let query = db
      .from('webhook_handlers')
      .update({
        is_active: false,
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('name', name)

    if (appId !== undefined) query = query.eq('app_id', appId)
    if (accountId !== undefined) query = query.eq('account_id', accountId)

    const { error } = await query

    if (error) {
      console.error(`[webhook-registration] Failed to deregister ${name}:`, error)
      throw error
    }

    console.log(`[webhook-registration] Deregistered handler: ${name}`)
  } catch (err) {
    console.error(`[webhook-registration] Error deregistering ${name}:`, err)
    throw err
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Marks a webhook handler as inactive and deleted in the database'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/webhook-registration.ts:deregisterWebhookHandler:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/webhook-registration.ts:isHandlerRegistered:function" type="function" identity="isHandlerRegistered" parent="~/.framework/functions/_shared/webhook-registration.ts"]
// CIL[DOC-MACRO purpose="Checks whether an active, non-deleted webhook handler exists"]
// CIL[DOC-RESPONSIBILITY responsibility="Query the database and return a boolean indicating registration status"]
// CIL[DOC-CONTEXT module="webhook-registration" layer="functions" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/webhook-registration.ts"]
// CIL[DOC-CONTRACT inputs="name: string, db: typeof adminDb" outputs="boolean" errors="Supabase query error" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Selects name from webhook_handlers filtered by name, is_active, is_deleted with maybeSingle; returns true if a row exists, false on error" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export async function isHandlerRegistered(
  name: string,
  db: typeof adminDb = adminDb
): Promise<boolean> {
  try {
    const { data, error } = await db
      .from('webhook_handlers')
      .select('name')
      .eq('name', name)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .maybeSingle()

    if (error) {
      console.error(`[webhook-registration] Error checking ${name}:`, error)
      return false
    }

    return !!data
  } catch (err) {
    console.error(`[webhook-registration] Exception checking ${name}:`, err)
    return false
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Checks whether an active, non-deleted webhook handler exists'; No verified external callers; imports: .framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/webhook-registration.ts:isHandlerRegistered:function"]
