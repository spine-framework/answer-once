// CIL[BEGIN stable_id="~/.framework/functions/_shared/db.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/db.ts"]
// CIL[DOC-MACRO purpose="Supabase client and database relation join module"]
// CIL[DOC-RESPONSIBILITY responsibility="Owns the shared Supabase client exports and common query joins."]
// CIL[DOC-CONTEXT module="functions/_shared/db" layer="data-access" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="adminDb, getUserDb, DbResult, joins, constants" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Imports the Supabase client and exports configured admin/user clients, a result type, and join mappings. WebSocket/ws realtime transport removed — server-side functions never subscribe to Supabase channels." notable_decisions="Falls back to placeholder credentials when environment values are absent. Realtime transport removed to reduce bundle size and eliminate unnecessary module-level initialization."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="human"]






import { createClient } from '@supabase/supabase-js'
// CIL[DOC-VECTOR type="context" content="purpose='Supabase client and database relation join module'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/db.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/db.ts:_env:constant" type="constant" identity="_env" parent="~/.framework/functions/_shared/db.ts"]
// CIL[DOC-MACRO purpose="Environment variable accessor"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides a safe reference to process environment variables."]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="functions/_shared/db" layer="data-access" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="object _env" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Assigns process.env or an empty object to the _env constant." notable_decisions="Uses a globalThis cast for Node and browser compatibility."]
const _env = (globalThis as any).process?.env || {}
// CIL[END stable_id="~/.framework/functions/_shared/db.ts:_env:constant"]

// CIL[DOC-VECTOR type="context" content="purpose='Environment variable accessor'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/db.ts:PLACEHOLDER_URL:constant" type="constant" identity="PLACEHOLDER_URL" parent="~/.framework/functions/_shared/db.ts"]
// CIL[DOC-MACRO purpose="Placeholder Supabase URL"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides a fallback Supabase URL string."]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="functions/_shared/db" layer="data-access" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="string PLACEHOLDER_URL" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Declares the PLACEHOLDER_URL constant." notable_decisions="Uses a hard-coded placeholder domain."]
const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
// CIL[END stable_id="~/.framework/functions/_shared/db.ts:PLACEHOLDER_URL:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/db.ts:PLACEHOLDER_KEY:constant" type="constant" identity="PLACEHOLDER_KEY" parent="~/.framework/functions/_shared/db.ts"]
// CIL[DOC-VECTOR type="context" content="purpose='Placeholder Supabase URL'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Placeholder Supabase key"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides a fallback Supabase key string."]
// CIL[DOC-CONTEXT module="functions/_shared/db" layer="data-access" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="string PLACEHOLDER_KEY" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Declares the PLACEHOLDER_KEY constant." notable_decisions="Uses a hard-coded placeholder key."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const PLACEHOLDER_KEY = 'placeholder'
// CIL[DOC-VECTOR type="context" content="purpose='Placeholder Supabase key'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/db.ts:PLACEHOLDER_KEY:constant"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/db.ts:isValidUrl:function" type="function" identity="isValidUrl" parent="~/.framework/functions/_shared/db.ts"]
// CIL[DOC-MACRO purpose="URL validation helper"]
// CIL[DOC-RESPONSIBILITY responsibility="Checks whether a string can be parsed as a valid URL."]
// CIL[DOC-CONTEXT module="functions/_shared/db" layer="data-access" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="url: string" outputs="boolean" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Constructs a URL object and returns true on success, false on exception." notable_decisions="Swallows exceptions to return a boolean result."]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
function isValidUrl(url: string): boolean {
  try { new URL(url); return true } catch { return false }
}
// CIL[END stable_id="~/.framework/functions/_shared/db.ts:isValidUrl:function"]
// CIL[DOC-VECTOR type="context" content="purpose='URL validation helper'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]







// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/db.ts"]



// CIL[BEGIN stable_id="~/.framework/functions/_shared/db.ts:rawUrl:constant" type="constant" identity="rawUrl" parent="~/.framework/functions/_shared/db.ts"]
// CIL[DOC-MACRO purpose="Raw Supabase URL source"]
// CIL[DOC-RESPONSIBILITY responsibility="Reads the SUPABASE_URL environment value with an empty fallback."]
// CIL[DOC-CONTEXT module="functions/_shared/db" layer="data-access" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="string rawUrl" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Assigns the raw Supabase URL string from env." notable_decisions="Falls back to an empty string."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const rawUrl = _env.SUPABASE_URL || ''
// CIL[DOC-VECTOR type="context" content="purpose='Raw Supabase URL source'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/db.ts:rawUrl:constant"]










// CIL[BEGIN stable_id="~/.framework/functions/_shared/db.ts:supabaseUrl:constant" type="constant" identity="supabaseUrl" parent="~/.framework/functions/_shared/db.ts"]
// CIL[DOC-MACRO purpose="Resolved Supabase URL"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="db" layer="functions" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-RESPONSIBILITY responsibility="Selects the valid Supabase URL or a placeholder fallback."]
// CIL[DOC-CONTRACT inputs="[]" outputs="string supabaseUrl" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Returns rawUrl if isValidUrl passes, otherwise PLACEHOLDER_URL." notable_decisions="Guards malformed env URLs with validation."]
const supabaseUrl: string = rawUrl && isValidUrl(rawUrl) ? rawUrl : PLACEHOLDER_URL
// CIL[END stable_id="~/.framework/functions/_shared/db.ts:supabaseUrl:constant"]


// CIL[DOC-VECTOR type="context" content="purpose='Resolved Supabase URL'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/db.ts"]







// CIL[BEGIN stable_id="~/.framework/functions/_shared/db.ts:supabaseServiceKey:constant" type="constant" identity="supabaseServiceKey" parent="~/.framework/functions/_shared/db.ts"]
// CIL[DOC-MACRO purpose="Service role key resolver"]
// CIL[DOC-RESPONSIBILITY responsibility="Reads the SUPABASE_SERVICE_ROLE_KEY or falls back to placeholder."]
// CIL[DOC-CONTEXT module="functions/_shared/db" layer="data-access" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="string supabaseServiceKey" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Assigns supabaseServiceKey from env or PLACEHOLDER_KEY." notable_decisions="Relies on placeholder for missing secret."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const supabaseServiceKey: string = _env.SUPABASE_SERVICE_ROLE_KEY || PLACEHOLDER_KEY
// CIL[DOC-VECTOR type="context" content="purpose='Service role key resolver'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/db.ts:supabaseServiceKey:constant"]










// CIL[BEGIN stable_id="~/.framework/functions/_shared/db.ts:supabaseAnonKey:constant" type="constant" identity="supabaseAnonKey" parent="~/.framework/functions/_shared/db.ts"]
// CIL[DOC-STABILITY stability="internal"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTEXT module="db" layer="functions" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-MACRO purpose="Anon key resolver"]
// CIL[DOC-RESPONSIBILITY responsibility="Reads the SUPABASE_ANON_KEY or falls back to placeholder."]
// CIL[DOC-CONTRACT inputs="[]" outputs="string supabaseAnonKey" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Assigns supabaseAnonKey from env or PLACEHOLDER_KEY." notable_decisions="Relies on placeholder for missing secret."]
const supabaseAnonKey: string = _env.SUPABASE_ANON_KEY || PLACEHOLDER_KEY
// CIL[END stable_id="~/.framework/functions/_shared/db.ts:supabaseAnonKey:constant"]


// CIL[DOC-VECTOR type="context" content="purpose='Anon key resolver'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]








// CIL[BEGIN stable_id="~/.framework/functions/_shared/db.ts:dbSchema:constant" type="constant" identity="dbSchema" parent="~/.framework/functions/_shared/db.ts"]
// CIL[DOC-MACRO purpose="Database schema name"]
// CIL[DOC-RESPONSIBILITY responsibility="Reads the DB_SCHEMA environment value with a public default."]
// CIL[DOC-CONTEXT module="functions/_shared/db" layer="data-access" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="string dbSchema" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Assigns dbSchema from env or the literal public." notable_decisions="Defaults to the public schema."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const dbSchema: string = _env.DB_SCHEMA || 'public'
// CIL[DOC-VECTOR type="context" content="purpose='Database schema name'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/db.ts:dbSchema:constant"]










// CIL[BEGIN stable_id="~/.framework/functions/_shared/db.ts:adminDb:constant" type="constant" identity="adminDb" parent="~/.framework/functions/_shared/db.ts"]
// CIL[DOC-MACRO purpose="Admin Supabase client"]
// CIL[DOC-RESPONSIBILITY responsibility="Exports the admin-authorized Supabase client for backend use."]
// CIL[DOC-CONTEXT module="functions/_shared/db" layer="data-access" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="SupabaseClient adminDb" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Creates a createClient instance using supabaseUrl and supabaseServiceKey and sets the schema. No realtime transport: server-side functions never subscribe to Supabase channels — omitting the ws transport shrinks every function bundle and eliminates an unnecessary module-level init." notable_decisions="Realtime transport removed: ws import added ~10KB to every bundle and could attempt a WebSocket handshake on module load. REST/PostgREST queries are unaffected."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const adminDb = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: dbSchema },
})
// CIL[DOC-VECTOR type="context" content="purpose='Admin Supabase client'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/db.ts:adminDb:constant"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/db.ts:getUserDb:function" type="function" identity="getUserDb" parent="~/.framework/functions/_shared/db.ts"]
// CIL[DOC-MACRO purpose="User Supabase client factory"]
// CIL[DOC-CONTEXT module="db" layer="functions" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-RESPONSIBILITY responsibility="Creates a Supabase client scoped to an end-user JWT."]
// CIL[DOC-CONTRACT inputs="jwt: string" outputs="SupabaseClient" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Returns a createClient instance using supabaseUrl and supabaseAnonKey, schema, and an Authorization header." notable_decisions="Uses the anon key plus Bearer token for row-level security. Realtime transport omitted for same reasons as adminDb."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function getUserDb(jwt: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: dbSchema },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  })
}
// CIL[END stable_id="~/.framework/functions/_shared/db.ts:getUserDb:function"]
// CIL[DOC-VECTOR type="context" content="purpose='User Supabase client factory'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]






// CIL[DOC-CONTEXT module="unknown" layer="unknown" related_files=".framework/functions/_shared/db.ts"]











































// CIL[BEGIN stable_id="~/.framework/functions/_shared/db.ts:DbResult:type" type="type" identity="DbResult" parent="~/.framework/functions/_shared/db.ts"]
// CIL[DOC-MACRO purpose="Database result type"]
// CIL[DOC-RESPONSIBILITY responsibility="Describes the generic shape of a database query result."]
// CIL[DOC-CONTEXT module="functions/_shared/db" layer="data-access" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="[]" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Exports a generic type with data and error fields." notable_decisions="Uses any for the error field to stay permissive."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export type DbResult<T> = {
  data: T | null
  error: any
}
// CIL[DOC-VECTOR type="context" content="purpose='Database result type'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/db.ts:DbResult:type"]









// CIL[BEGIN stable_id="~/.framework/functions/_shared/db.ts:joins:constant" type="constant" identity="joins" parent="~/.framework/functions/_shared/db.ts"]
// CIL[DOC-MACRO purpose="Foreign relation join map"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides a shared map of Supabase foreign-key join expressions."]
// CIL[DOC-CONTEXT module="functions/_shared/db" layer="data-access" related_files=".framework/functions/_shared/db.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="Record<string,string> joins" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Declares an object of relation strings for query select expansion." notable_decisions="Uses Supabase !foreign-key() join syntax."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const joins = {
  type:         'type:types!type_id(id, slug, name, icon, color, design_schema)',
  app:          'app:apps!app_id(id, slug, name)',
  ownerAccount: 'owner_account:accounts!owner_account_id(id, slug, display_name)',
  createdBy:    'created_by_person:people!created_by(id, full_name, email)',
  parentAccount:'parent:accounts!parent_id(id, slug, display_name)',
  role:         'role:roles!role_id(id, slug, name)',
  pipeline:     'pipeline:pipelines!pipeline_id(id, name)',
}
// CIL[DOC-VECTOR type="context" content="purpose='Foreign relation join map'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/db.ts:joins:constant"]








