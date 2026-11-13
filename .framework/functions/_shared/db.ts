





import { createClient } from '@supabase/supabase-js'

const _env = (globalThis as any).process?.env || {}

const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'placeholder'


function isValidUrl(url: string): boolean {
  try { new URL(url); return true } catch { return false }
}










const rawUrl = _env.SUPABASE_URL || ''










const supabaseUrl: string = rawUrl && isValidUrl(rawUrl) ? rawUrl : PLACEHOLDER_URL










const supabaseServiceKey: string = _env.SUPABASE_SERVICE_ROLE_KEY || PLACEHOLDER_KEY










const supabaseAnonKey: string = _env.SUPABASE_ANON_KEY || PLACEHOLDER_KEY










const dbSchema: string = _env.DB_SCHEMA || 'public'










export const adminDb = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: dbSchema },
})


// Uses the anon key plus Bearer token for row-level security. Realtime transport omitted for same reasons as adminDb.
export function getUserDb(jwt: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: dbSchema },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  })
}

















































export type DbResult<T> = {
  data: T | null
  error: any
}









export const joins = {
  type:         'type:types!type_id(id, slug, name, icon, color, design_schema)',
  app:          'app:apps!app_id(id, slug, name)',
  ownerAccount: 'owner_account:accounts!owner_account_id(id, slug, display_name)',
  createdBy:    'created_by_person:people!created_by(id, full_name, email)',
  parentAccount:'parent:accounts!parent_id(id, slug, display_name)',
  role:         'role:roles!role_id(id, slug, name)',
  pipeline:     'pipeline:pipelines!pipeline_id(id, name)',
}








