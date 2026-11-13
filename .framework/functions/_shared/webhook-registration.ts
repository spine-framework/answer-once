
import { adminDb } from './db'

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
