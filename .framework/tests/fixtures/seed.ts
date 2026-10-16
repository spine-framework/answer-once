// CIL[BEGIN stable_id="~/.framework/tests/fixtures/seed.ts:file_header:constant" type="constant" identity="file_header" parent="~/.framework/tests/fixtures/seed.ts"]
// CIL[DOC-MACRO purpose="Idempotent fixture seed for integration tests"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide file-level documentation and metadata for the seed fixture"]
// CIL[DOC-CONTEXT module="tests/fixtures/seed" layer="test-infrastructure" related_files=".framework/tests/fixtures/seed.ts"]
// CIL[DOC-CONTRACT inputs="File metadata and JSDoc conventions" outputs="JSDoc metadata" errors="" side_effects="None; documentation only"]
// CIL[DOC-MICRO logic_summary="Declares the seed file scope, audience, layer, stability, and teardown contract" notable_decisions="test- prefix for safe teardown"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/// <reference types="node" />
/**
 * @module tests/fixtures/seed
 * @audience core-contributor
 * @layer test-infrastructure
 * @stability stable
 *
 * Idempotent fixture seed for integration tests. Upserts canonical test data
 * into the public schema under SPINE_TEST_ACCOUNT_ID. All rows use slugs
 * prefixed with `test-` so teardown.ts can clean them up safely.
 *
 * Run before integration tests: `tsx v2-core/tests/fixtures/seed.ts`
 *
 * @seeAlso tests/fixtures/teardown.ts
 */
// CIL[DOC-VECTOR type="context" content="purpose='Idempotent fixture seed for integration tests'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/seed.ts:file_header:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/fixtures/seed.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/tests/fixtures/seed.ts"]
// CIL[DOC-MACRO purpose="Load environment and initialize the Supabase client"]
// CIL[DOC-RESPONSIBILITY responsibility="Resolve env files and create the Supabase client instance"]
// CIL[DOC-CONTEXT module="tests/fixtures/seed" layer="test-infrastructure" related_files=".framework/tests/fixtures/seed.ts"]
// CIL[DOC-CONTRACT inputs=".xenv.test or .xenv; process.env" outputs="populated process.env; imported createClient" errors="" side_effects="Reads env files; mutates process.env"]
// CIL[DOC-MICRO logic_summary="Reads .xenv files and imports the createClient dependency" notable_decisions="Uses fileURLToPath for ESM __dirname"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="core-contributor"]
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function loadEnv() {
  for (const name of ['.xenv.test', '.xenv']) {
    const p = resolve(__dirname, '../../', name)
    if (existsSync(p)) {
      const lines = readFileSync(p, 'utf8').split('\n')
      for (const line of lines) {
        const t = line.trim()
        if (!t || t.startsWith('#')) continue
        const eq = t.indexOf('=')
        if (eq === -1) continue
        const k = t.slice(0, eq).trim()
        const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
        if (!process.env[k]) process.env[k] = v
      }
      break
    }
  }
}

loadEnv()

import { createClient } from '@supabase/supabase-js'
// CIL[DOC-VECTOR type="context" content="purpose='Load environment and initialize the Supabase client'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/seed.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/fixtures/seed.ts:SUPABASE_URL:constant" type="constant" identity="SUPABASE_URL" parent="~/.framework/tests/fixtures/seed.ts"]
  // CIL[DOC-STABILITY stability="internal"]
  // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
  // CIL[DOC-CONTEXT module="seed" layer="tests" related_files=".framework/tests/fixtures/seed.ts"]
// CIL[DOC-MACRO purpose="Provide the SUPABASE_URL environment value"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the SUPABASE_URL constant"]
// CIL[DOC-CONTRACT inputs="process.env.SUPABASE_URL" outputs="SUPABASE_URL constant" errors="" side_effects="None; scope-level constant"]
// CIL[DOC-MICRO logic_summary="Reads process.env.SUPABASE_URL with non-null assertion" notable_decisions="Runtime validation happens in env_check"]
const SUPABASE_URL = process.env.SUPABASE_URL!
// CIL[END stable_id="~/.framework/tests/fixtures/seed.ts:SUPABASE_URL:constant"]
// CIL[BEGIN stable_id="~/.framework/tests/fixtures/seed.ts:SERVICE_KEY:constant" type="constant" identity="SERVICE_KEY" parent="~/.framework/tests/fixtures/seed.ts"]
// CIL[DOC-MACRO purpose="Provide the SERVICE_KEY environment value"]
// CIL[DOC-VECTOR type="context" content="purpose='Provide the SUPABASE_URL environment value'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the SERVICE_KEY constant"]
// CIL[DOC-CONTEXT module="tests/fixtures/seed" layer="test-infrastructure" related_files=".framework/tests/fixtures/seed.ts"]
// CIL[DOC-CONTRACT inputs="process.env.SERVICE_KEY" outputs="SERVICE_KEY constant" errors="" side_effects="None; scope-level constant"]
// CIL[DOC-MICRO logic_summary="Reads process.env.SERVICE_KEY with non-null assertion" notable_decisions="Runtime validation happens in env_check"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!
// CIL[DOC-VECTOR type="context" content="purpose='Provide the SERVICE_KEY environment value'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/seed.ts:SERVICE_KEY:constant"]
// CIL[BEGIN stable_id="~/.framework/tests/fixtures/seed.ts:ACCOUNT_ID:constant" type="constant" identity="ACCOUNT_ID" parent="~/.framework/tests/fixtures/seed.ts"]
// CIL[DOC-MACRO purpose="Provide the ACCOUNT_ID environment value"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the ACCOUNT_ID constant"]
// CIL[DOC-CONTEXT module="tests/fixtures/seed" layer="test-infrastructure" related_files=".framework/tests/fixtures/seed.ts"]
// CIL[DOC-CONTRACT inputs="process.env.ACCOUNT_ID" outputs="ACCOUNT_ID constant" errors="" side_effects="None; scope-level constant"]
// CIL[DOC-MICRO logic_summary="Reads process.env.ACCOUNT_ID with non-null assertion" notable_decisions="Runtime validation happens in env_check"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const ACCOUNT_ID   = process.env.SPINE_TEST_ACCOUNT_ID!
// CIL[DOC-VECTOR type="context" content="purpose='Provide the ACCOUNT_ID environment value'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/seed.ts:ACCOUNT_ID:constant"]
// CIL[BEGIN stable_id="~/.framework/tests/fixtures/seed.ts:env_check:variable" type="variable" identity="env_check" parent="~/.framework/tests/fixtures/seed.ts"]
// CIL[DOC-MACRO purpose="Validate required environment variables"]
// CIL[DOC-RESPONSIBILITY responsibility="Fail fast if any required variable is missing"]
// CIL[DOC-CONTEXT module="tests/fixtures/seed" layer="test-infrastructure" related_files=".framework/tests/fixtures/seed.ts"]
// CIL[DOC-CONTRACT inputs="SUPABASE_URL, SERVICE_KEY, ACCOUNT_ID" outputs="Validated environment or process exit" errors="" side_effects="May terminate process"]
// CIL[DOC-MICRO logic_summary="Checks SUPABASE_URL, SERVICE_KEY, and ACCOUNT_ID are truthy" notable_decisions="Exits before creating the Supabase client"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
if (!SUPABASE_URL || !SERVICE_KEY || !ACCOUNT_ID) {
  console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or SPINE_TEST_ACCOUNT_ID')
  process.exit(1)
}
// CIL[DOC-VECTOR type="context" content="purpose='Validate required environment variables'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/seed.ts:env_check:variable"]

// CIL[BEGIN stable_id="~/.framework/tests/fixtures/seed.ts:db:constant" type="constant" identity="db" parent="~/.framework/tests/fixtures/seed.ts"]
// CIL[DOC-MACRO purpose="Initialize the Supabase client for the public schema"]
// CIL[DOC-RESPONSIBILITY responsibility="Create the database client used by all upsert helpers"]
// CIL[DOC-CONTEXT module="tests/fixtures/seed" layer="test-infrastructure" related_files=".framework/tests/fixtures/seed.ts"]
// CIL[DOC-CONTRACT inputs="SUPABASE_URL, SERVICE_KEY" outputs="db client" errors="" side_effects="Creates and holds a Supabase client connection"]
// CIL[DOC-MICRO logic_summary="Constructs a Supabase client pointing at the public schema" notable_decisions="Uses service role key for admin-level seed operations"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const db = createClient(SUPABASE_URL, SERVICE_KEY, { db: { schema: 'public' } })
// CIL[DOC-VECTOR type="context" content="purpose='Initialize the Supabase client for the public schema'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/seed.ts:db:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/fixtures/seed.ts:upsertRole:function" type="function" identity="upsertRole" parent="~/.framework/tests/fixtures/seed.ts"]
// CIL[DOC-MACRO purpose="Upsert a role row"]
// CIL[DOC-RESPONSIBILITY responsibility="Insert or update a test role"]
// CIL[DOC-CONTEXT module="tests/fixtures/seed" layer="test-infrastructure" related_files=".framework/tests/fixtures/seed.ts"]
// CIL[DOC-CONTRACT inputs="slug, name, permissions" outputs="role in public.roles" errors="" side_effects="Writes to public.roles"]
// CIL[DOC-MICRO logic_summary="Upserts a role with permissions and active flag by slug" notable_decisions="Uses onConflict slug for idempotency"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function upsertRole(slug: string, name: string, permissions: string[]) {
  const { error } = await db.from('roles').upsert(
    { slug, name, permissions, is_active: true, account_id: ACCOUNT_ID },
    { onConflict: 'slug' }
  )
  if (error) console.warn(`  [warn] role ${slug}:`, error.message)
}
// CIL[DOC-VECTOR type="context" content="purpose='Upsert a role row'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/seed.ts:upsertRole:function"]

// CIL[BEGIN stable_id="~/.framework/tests/fixtures/seed.ts:upsertType:function" type="function" identity="upsertType" parent="~/.framework/tests/fixtures/seed.ts"]
// CIL[DOC-MACRO purpose="Upsert a type row with design schema"]
// CIL[DOC-RESPONSIBILITY responsibility="Insert or update a test type"]
// CIL[DOC-CONTEXT module="tests/fixtures/seed" layer="test-infrastructure" related_files=".framework/tests/fixtures/seed.ts"]
// CIL[DOC-CONTRACT inputs="kind, slug, name, designSchema" outputs="type in public.types" errors="" side_effects="Reads public.apps; writes to public.types"]
// CIL[DOC-MICRO logic_summary="Looks up spine-core app id and upserts a type row" notable_decisions="Defaults validation_schema to empty object; ownership pack"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function upsertType(kind: string, slug: string, name: string, designSchema: object) {
  const { data: app } = await db.from('apps').select('id').eq('slug', 'spine-core').single()
  const { error } = await db.from('types').upsert(
    {
      slug,
      kind,
      name,
      app_id: app?.id ?? null,
      design_schema: designSchema,
      validation_schema: {},
      is_active: true,
      ownership: 'pack'
    },
    { onConflict: 'slug' }
  )
  if (error) console.warn(`  [warn] type ${slug}:`, error.message)
}
// CIL[DOC-VECTOR type="context" content="purpose='Upsert a type row with design schema'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/seed.ts:upsertType:function"]

// CIL[BEGIN stable_id="~/.framework/tests/fixtures/seed.ts:upsertPerson:function" type="function" identity="upsertPerson" parent="~/.framework/tests/fixtures/seed.ts"]
// CIL[DOC-MACRO purpose="Upsert a person row"]
// CIL[DOC-RESPONSIBILITY responsibility="Insert or update a test person"]
// CIL[DOC-CONTEXT module="tests/fixtures/seed" layer="test-infrastructure" related_files=".framework/tests/fixtures/seed.ts"]
// CIL[DOC-CONTRACT inputs="slug, fullName, email" outputs="person in public.people" errors="" side_effects="Reads public.types; writes to public.people"]
// CIL[DOC-MICRO logic_summary="Finds active person type and upserts person by email" notable_decisions="Uses onConflict email to avoid duplicates"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function upsertPerson(slug: string, fullName: string, email: string) {
  const { data: type } = await db.from('types').select('id').eq('kind', 'person').eq('is_active', true).limit(1).single()
  const { error } = await db.from('people').upsert(
    {
      slug,
      full_name: fullName,
      email,
      status: 'active',
      is_active: true,
      account_id: ACCOUNT_ID,
      type_id: type?.id ?? null,
      data: {}
    },
    { onConflict: 'email' }
  )
  if (error) console.warn(`  [warn] person ${slug}:`, error.message)
}
// CIL[DOC-VECTOR type="context" content="purpose='Upsert a person row'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/seed.ts:upsertPerson:function"]

// CIL[BEGIN stable_id="~/.framework/tests/fixtures/seed.ts:upsertItem:function" type="function" identity="upsertItem" parent="~/.framework/tests/fixtures/seed.ts"]
// CIL[DOC-MACRO purpose="Upsert an item row"]
// CIL[DOC-RESPONSIBILITY responsibility="Insert or update a test item"]
// CIL[DOC-CONTEXT module="tests/fixtures/seed" layer="test-infrastructure" related_files=".framework/tests/fixtures/seed.ts"]
// CIL[DOC-CONTRACT inputs="slug, title, isActive" outputs="item in public.items" errors="" side_effects="Reads public.types; writes to public.items"]
// CIL[DOC-MICRO logic_summary="Finds active item type and upserts item by slug" notable_decisions="Sets status to open and item_type to item"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function upsertItem(slug: string, title: string, isActive: boolean) {
  const { data: type } = await db.from('types').select('id').eq('kind', 'item').eq('is_active', true).limit(1).single()
  const { error } = await db.from('items').upsert(
    {
      slug,
      title,
      status: 'open',
      is_active: isActive,
      account_id: ACCOUNT_ID,
      type_id: type?.id ?? null,
      item_type: 'item',
      data: {}
    },
    { onConflict: 'slug' }
  )
  if (error) console.warn(`  [warn] item ${slug}:`, error.message)
}
// CIL[DOC-VECTOR type="context" content="purpose='Upsert an item row'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/seed.ts:upsertItem:function"]

// CIL[BEGIN stable_id="~/.framework/tests/fixtures/seed.ts:seed:function" type="function" identity="seed" parent="~/.framework/tests/fixtures/seed.ts"]
// CIL[DOC-MACRO purpose="Run the full fixture seeding routine"]
// CIL[DOC-RESPONSIBILITY responsibility="Orchestrate creation of roles, types, people, items, and pipeline"]
// CIL[DOC-CONTEXT module="tests/fixtures/seed" layer="test-infrastructure" related_files=".framework/tests/fixtures/seed.ts"]
// CIL[DOC-CONTRACT inputs="Environment variables and upsert helpers" outputs="Canonical test fixtures" errors="" side_effects="Writes multiple rows to public schema"]
// CIL[DOC-MICRO logic_summary="Seeds roles, account/person/item types, people, items, and a pipeline" notable_decisions="Uses test- prefixed slugs; defines inline design schemas"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
async function seed() {
  console.log('🌱 Seeding test fixtures into public schema...')
  console.log('   ACCOUNT_ID:', ACCOUNT_ID)

  console.log('  → roles')
  await upsertRole('test-admin-role',  'Test Admin',  ['*'])
  await upsertRole('test-member-role', 'Test Member', ['items:read', 'people:read'])
  await upsertRole('test-viewer-role', 'Test Viewer', ['items:read'])

  console.log('  → types')
  const accountTypeSchema = {
    fields: {
      slug: { data_type: 'text', label: 'Slug', required: true, system: true, validation: null },
      display_name: { data_type: 'text', label: 'Display Name', required: true, system: true, validation: null },
      is_active: { data_type: 'boolean', label: 'Active', required: true, system: true, validation: null },
      created_at: { data_type: 'datetime', label: 'Created', required: false, system: true, readonly: true, validation: null }
    },
    views: {
      default_list: { type: 'list', display: 'table', label: 'Accounts',
        fields: { display_name: { sortable: true, display_type: 'text' }, is_active: { sortable: true, display_type: 'badge' } },
        default_sort: { field: 'created_at', direction: 'desc' }
      },
      default_detail: { type: 'detail', label: 'Account Detail',
        sections: [
          { title: 'Identity', fields: { slug: { display_type: 'input' }, display_name: { display_type: 'input' }, is_active: { display_type: 'checkbox' } } },
          { title: 'System', fields: { created_at: { display_type: 'timestamp' } } }
        ]
      }
    },
    record_permissions: { 'system-admin': ['create', 'read', 'update', 'delete'] },
    functionality: null
  }

  const personTypeSchema = {
    fields: {
      full_name: { data_type: 'text', label: 'Full Name', required: true, system: true, validation: null },
      email: { data_type: 'email', label: 'Email', required: true, system: true, validation: null },
      status: { data_type: 'text', label: 'Status', required: true, system: true, validation: null },
      is_active: { data_type: 'boolean', label: 'Active', required: true, system: true, validation: null },
      created_at: { data_type: 'datetime', label: 'Created', required: false, system: true, readonly: true, validation: null }
    },
    views: {
      default_list: { type: 'list', display: 'table', label: 'People',
        fields: { full_name: { sortable: true, display_type: 'text' }, email: { sortable: true, display_type: 'text' }, status: { sortable: true, display_type: 'badge' } },
        default_sort: { field: 'created_at', direction: 'desc' }
      },
      default_detail: { type: 'detail', label: 'Person Detail',
        sections: [
          { title: 'Identity', fields: { full_name: { display_type: 'input' }, email: { display_type: 'input' }, status: { display_type: 'input' }, is_active: { display_type: 'checkbox' } } },
          { title: 'System', fields: { created_at: { display_type: 'timestamp' } } }
        ]
      }
    },
    record_permissions: { 'system-admin': ['create', 'read', 'update', 'delete'] },
    functionality: null
  }

  const itemTypeSchema = {
    fields: {
      title: { data_type: 'text', label: 'Title', required: true, system: true, validation: null },
      description: { data_type: 'textarea', label: 'Description', required: false, system: true, validation: null },
      status: { data_type: 'text', label: 'Status', required: true, system: true, validation: null },
      is_active: { data_type: 'boolean', label: 'Active', required: true, system: true, validation: null },
      created_at: { data_type: 'datetime', label: 'Created', required: false, system: true, readonly: true, validation: null }
    },
    views: {
      default_list: { type: 'list', display: 'table', label: 'Items',
        fields: { title: { sortable: true, display_type: 'text' }, status: { sortable: true, display_type: 'badge' }, is_active: { sortable: true, display_type: 'badge' } },
        default_sort: { field: 'created_at', direction: 'desc' }
      },
      default_detail: { type: 'detail', label: 'Item Detail',
        sections: [
          { title: 'Core', fields: { title: { display_type: 'input' }, description: { display_type: 'textarea' }, status: { display_type: 'input' }, is_active: { display_type: 'checkbox' } } },
          { title: 'System', fields: { created_at: { display_type: 'timestamp' } } }
        ]
      }
    },
    record_permissions: { 'system-admin': ['create', 'read', 'update', 'delete'] },
    functionality: null
  }

  await upsertType('account', 'test-account-type', 'Test Account Type', accountTypeSchema)
  await upsertType('person',  'test-person-type',  'Test Person Type',  personTypeSchema)
  await upsertType('item',    'test-item-type',     'Test Item Type',    itemTypeSchema)

  console.log('  → people')
  await upsertPerson('test-admin',  'Test Admin User',  'test-admin@spine.test')
  await upsertPerson('test-member', 'Test Member User', 'test-member@spine.test')
  await upsertPerson('test-viewer', 'Test Viewer User', 'test-viewer@spine.test')

  console.log('  → items')
  await upsertItem('test-item-active',   'Test Active Item',   true)
  await upsertItem('test-item-inactive', 'Test Inactive Item', false)

  console.log('  → pipeline')
  const { error: pipelineErr } = await db.from('pipelines').upsert(
    {
      slug: 'test-pipeline-canary',
      name: 'Test Pipeline Canary',
      stages: [],
      account_id: ACCOUNT_ID,
      is_active: true
    },
    { onConflict: 'slug' }
  )
  if (pipelineErr) console.warn('  [warn] pipeline:', pipelineErr.message)

  console.log('✅ Seed complete.')
}
// CIL[END stable_id="~/.framework/tests/fixtures/seed.ts:seed:function"]
// CIL[BEGIN stable_id="~/.framework/tests/fixtures/seed.ts:seed_invocation:variable" type="variable" identity="seed_invocation" parent="~/.framework/tests/fixtures/seed.ts"]
// CIL[DOC-MACRO purpose="Execute the seed routine on import"]
// CIL[DOC-VECTOR type="context" content="purpose='Run the full fixture seeding routine'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-RESPONSIBILITY responsibility="Invoke seed and handle failures"]
// CIL[DOC-CONTEXT module="tests/fixtures/seed" layer="test-infrastructure" related_files=".framework/tests/fixtures/seed.ts"]
// CIL[DOC-CONTRACT inputs="seed()" outputs="Promise resolution or process exit" errors="" side_effects="Runs seed side effects; may terminate process"]
// CIL[DOC-MICRO logic_summary="Calls seed() and exits on unhandled rejection" notable_decisions="Top-level invocation for CLI and tsx usage"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
// CIL[DOC-VECTOR type="context" content="purpose='Execute the seed routine on import'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/fixtures/seed.ts:seed_invocation:variable"]
