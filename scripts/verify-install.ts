#!/usr/bin/env tsx
// no repair mode — this tool never writes; failures are reported for the operator
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

function loadEnv(): void {
  const envPath = join(process.cwd(), '.env')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const key = t.slice(0, eq).trim()
    const val = t.slice(eq + 1).trim()
    if (key && !(key in process.env)) process.env[key] = val
  }
}

const args = process.argv.slice(2)
const appIdx = args.indexOf('--app')
const appSlug = appIdx >= 0 ? args[appIdx + 1] : undefined
const expectEmptyPeople = args.includes('--expect-empty-people')
const expectEmptyAccounts = args.includes('--expect-empty-accounts')
const expectEmptyRuntime = args.includes('--expect-empty-runtime')
const refIdx = args.indexOf('--expected-project-ref')
const expectedProjectRef = refIdx >= 0 ? args[refIdx + 1] : undefined
if (!appSlug) {
  console.error('usage: tsx scripts/verify-install.ts --app <slug> [--expect-empty-people] [--expect-empty-accounts] [--expect-empty-runtime] [--expected-project-ref <ref>]')
  process.exit(2)
}

loadEnv()
const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required (.env or environment)')
  process.exit(2)
}
const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

let passed = 0
const failures: string[] = []
function check(name: string, ok: boolean, detail = ''): void {
  if (ok) { passed++; console.log(`  ✓ ${name}`) }
  else { failures.push(name); console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`) }
}

const REQUIRED_TABLES = [
  'accounts', 'actions', 'ai_agents', 'apps', 'attachments',
  'document_leases', 'embeddings', 'invites', 'items', 'link_types',
  'links', 'messages', 'notifications', 'people', 'pipeline_executions',
  'pipelines', 'prompt_configs', 'roles', 'security_blocklist',
  'system_settings', 'threads', 'trigger_executions', 'triggers',
  'types', 'watchers',
]

/** RPC name → args that resolve the signature but fail inside execution (no writes). */
const REQUIRED_RPCS: Record<string, Record<string, unknown>> = {
  complete_registration_placement: {
    p_person_id: '__probe__',
    p_app_slug: '__probe__',
    p_path: '__probe__',
    p_account_name: '__probe__',
  },
  acquire_document_lease: {
    p_document_id: '__probe__',
    p_account_id: '__probe__',
    p_content_hash: '__probe__',
    p_ttl_seconds: 1,
  },
  release_document_lease: {
    p_document_id: '__probe__',
    p_lease_id: '__probe__',
    p_status: '__probe__',
  },
}

async function tableExists(table: string): Promise<boolean> {
  const { error } = await db.from(table).select('*', { count: 'exact', head: true })
  return !error
}

async function rowCount(table: string): Promise<number> {
  const { count } = await db.from(table).select('*', { count: 'exact', head: true })
  return count ?? -1
}

async function rpcExists(name: string, probeArgs: Record<string, unknown>): Promise<boolean> {
  const { error } = await db.rpc(name, probeArgs)
  if (!error) return true
  return error.code !== 'PGRST202'
}

interface SeedCheck { table: string; label: string; key: (row: any) => string }

const SEED_KEYS: Record<string, SeedCheck> = {
  'seed/roles.json':          { table: 'roles',         label: 'role',          key: (r) => r.slug },
  'seed/types.json':          { table: 'types',         label: 'type',          key: (r) => `${r.kind}/${r.slug}` },
  'seed/link-types.json':     { table: 'link_types',    label: 'link_type',     key: (r) => r.slug },
  'seed/ai-agents.json':      { table: 'ai_agents',     label: 'ai_agent',      key: (r) => r.slug ?? r.name },
  'seed/prompt-configs.json': { table: 'prompt_configs', label: 'prompt_config', key: (r) => r.name },
  'seed/pipelines.json':      { table: 'pipelines',     label: 'pipeline',      key: (r) => r.slug },
  'seed/triggers.json':       { table: 'triggers',      label: 'trigger',       key: (r) => r.slug },
}

async function checkSeeds(appDir: string, seedEntries: any[]): Promise<void> {
  for (const entry of seedEntries) {
    const spec = SEED_KEYS[entry.file]
    if (!spec) { console.log(`  ○ no verifier for seed file ${entry.file} — skipped`); continue }
    const file = join(appDir, entry.file)
    if (!existsSync(file)) { check(`seed file ${entry.file} exists`, false); continue }
    const rows: any[] = JSON.parse(readFileSync(file, 'utf8'))
    for (const row of rows) {
      const key = spec.key(row)
      let ok = false
      if (spec.table === 'types') {
        const [kind, slug] = key.split('/')
        const { data } = await db.from('types').select('slug, validation_schema').eq('kind', kind).eq('slug', slug).limit(1)
        ok = (data?.length ?? 0) > 0
        check(`${spec.label} seeded: ${key}`, ok)
        if (ok) {
          const vs = data![0].validation_schema
          check(`${spec.label} validation_schema generated: ${key}`,
            !!vs && typeof vs === 'object' && !Array.isArray(vs) && Object.keys(vs).length > 0)
        }
        continue
      } else if (spec.table === 'prompt_configs') {
        const { data } = await db.from(spec.table).select('name').eq('name', key).limit(1)
        ok = (data?.length ?? 0) > 0
      } else if (spec.table === 'ai_agents') {
        // Seed rows may identify by slug (canonical) or name — query whichever
        // identity the seed row actually carries.
        const col = row.slug ? 'slug' : 'name'
        const { data } = await db.from(spec.table).select(col).eq(col, key).limit(1)
        ok = (data?.length ?? 0) > 0
      } else {
        const { data } = await db.from(spec.table).select('slug').eq('slug', key).limit(1)
        ok = (data?.length ?? 0) > 0
      }
      check(`${spec.label} seeded: ${key}`, ok)
    }
  }
}

async function main(): Promise<void> {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const appDir = join(repoRoot, 'custom/apps', appSlug)
  const manifestPath = join(appDir, 'manifest.json')
  if (!existsSync(manifestPath)) {
    console.error(`❌ app manifest not found: ${manifestPath}`)
    process.exit(2)
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

  console.log(`\n🔍 verify-install: ${appSlug} → ${SUPABASE_URL}\n`)

  // 1. Connectivity + target identity
  const { error: pingErr } = await db.from('apps').select('slug', { head: true, count: 'exact' })
  check('database connectivity', !pingErr, pingErr?.message ?? '')
  if (pingErr) { summarize(); return }
  if (expectedProjectRef) {
    check(`target project is ${expectedProjectRef}`,
      SUPABASE_URL === `https://${expectedProjectRef}.supabase.co`,
      `SUPABASE_URL is ${SUPABASE_URL}`)
  }

  // 2. Required tables
  for (const t of REQUIRED_TABLES) check(`table exists: ${t}`, await tableExists(t))

  // 3. Required RPCs
  for (const [name, probeArgs] of Object.entries(REQUIRED_RPCS)) {
    check(`rpc exists: ${name}`, await rpcExists(name, probeArgs))
  }

  // 4. App row + registration config
  const { data: appRows } = await db.from('apps').select('id, slug, config').eq('slug', appSlug).limit(1)
  const app = appRows?.[0]
  check(`app installed: ${appSlug}`, !!app)
  check('app registration config present', !!app?.config?.registration,
    app ? 'apps.config.registration missing' : '')

  // 5. Seed inventory vs DB
  if (Array.isArray(manifest.seed)) await checkSeeds(appDir, manifest.seed)

  // 5b. App config materialization — the seeded apps.config must carry the
  // manifest's declared knowledge envelope (runtime KB scope binding).
  if (app && manifest.config?.knowledge !== undefined) {
    const expected = JSON.stringify(manifest.config.knowledge)
    const actual = JSON.stringify((app.config as any)?.knowledge)
    check('app knowledge envelope materialized', actual === expected,
      actual === undefined ? 'apps.config.knowledge missing' : '')
  }

  // 5c. Migration inventory — every filename the export shipped must appear
  // in the _spine_migrations tracking table (no silent skips on a virgin DB).
  const exportManifestPath = join(repoRoot, '.spine-export-manifest.json')
  // npm-created projects have no export manifest — the inventory falls back to
  // the migration files on disk (.framework + custom).
  let expectedMigrations: string[] | null = null
  if (existsSync(exportManifestPath)) {
    try {
      const em = JSON.parse(readFileSync(exportManifestPath, 'utf8'))
      expectedMigrations = [
        ...(em.migrations?.framework ?? []),
        ...(em.migrations?.custom ?? []),
      ]
    } catch (e: any) {
      check('export manifest readable', false, e?.message ?? '')
    }
  } else {
    const listDir = (rel: string): string[] => {
      const dir = join(repoRoot, rel)
      return existsSync(dir)
        ? readdirSync(dir).filter((n) => n.endsWith('.sql')).sort()
        : []
    }
    expectedMigrations = [...listDir('.framework/migrations'), ...listDir('custom/migrations')]
  }
  if (expectedMigrations) {
    const { data: applied, error: migErr } = await db
      .from('_spine_migrations')
      .select('filename')
    if (migErr) {
      check('migration tracking table readable', false, migErr.message)
    } else {
      const appliedSet = new Set((applied ?? []).map((r: any) => r.filename))
      check('migration inventory complete', expectedMigrations.every((f) => appliedSet.has(f)),
        `${expectedMigrations.filter((f) => !appliedSet.has(f)).length} of ${expectedMigrations.length} not applied`)
    }
  }

  // 5d. No unexpected installed apps — builtin framework apps plus exactly
  // this app; anything else is a seed/scope defect.
  {
    const { data: appRows2 } = await db.from('apps').select('slug, source')
    const nonBuiltin = (appRows2 ?? []).filter((a: any) => a.source !== 'builtin').map((a: any) => a.slug)
    check('only expected app installed', nonBuiltin.length === 1 && nonBuiltin[0] === appSlug,
      `found: ${nonBuiltin.join(', ') || 'none'}`)
  }

  // 5e. openai integration credentials must be an env-var reference, never a
  // materialized secret. Report the source field only — never the value.
  {
    const { data: integ } = await db.from('integrations').select('slug, credentials')
      .eq('slug', 'openai').limit(1)
    const creds = (integ?.[0]?.credentials ?? {}) as any
    const src = creds?.api_token?.source ?? creds?.api_key?.source
    check('openai integration uses env-var credential reference', src === 'env_var',
      src ? `source=${src}` : 'integration or credential block missing')
  }

  // 6. Pipeline stage → action resolution (app pipelines only)
  if (app) {
    const { data: pipelineRows } = await db.from('pipelines')
      .select('slug, stages').eq('app_id', app.id)
    const { data: actionRows } = await db.from('actions').select('slug')
    const actionSlugs = new Set((actionRows ?? []).map((a: any) => a.slug))
    for (const p of pipelineRows ?? []) {
      const stages = Array.isArray(p.stages) ? p.stages : []
      check(`pipeline has stages: ${p.slug}`, stages.length > 0)
      for (const [i, st] of stages.entries()) {
        check(`pipeline ${p.slug} stage[${i}] action "${st.stage_type}" exists`, actionSlugs.has(st.stage_type))
      }
    }

    // 7. Trigger → pipeline resolution
    const { data: triggerRows } = await db.from('triggers')
      .select('slug, pipeline_id').eq('app_id', app.id)
    for (const tr of triggerRows ?? []) {
      check(`trigger ${tr.slug} resolved to pipeline`, !!tr.pipeline_id)
    }
  }

  // 8. Fresh-database assertions
  if (expectEmptyPeople) check('people table empty (fresh install)', (await rowCount('people')) === 0)
  if (expectEmptyAccounts) check('accounts table empty (fresh install)', (await rowCount('accounts')) === 0)

  // 8b. Empty runtime — no records of this app's seeded types may exist on a
  // virgin install (config seeds materialize types, not runtime content).
  if (expectEmptyRuntime && app) {
    const kinds: Record<string, string> = { item: 'items', thread: 'threads', message: 'messages' }
    const typesFile = join(appDir, 'seed/types.json')
    if (existsSync(typesFile)) {
      const typeRows: any[] = JSON.parse(readFileSync(typesFile, 'utf8'))
      for (const t of typeRows) {
        const table = kinds[t.kind]
        if (!table) continue
        const { data: tRow } = await db.from('types').select('id')
          .eq('kind', t.kind).eq('slug', t.slug).limit(1)
        if (!tRow?.[0]?.id) continue // covered by the seed checks above
        const { count } = await db.from(table).select('*', { count: 'exact', head: true })
          .eq('type_id', tRow[0].id)
        check(`no runtime records: ${t.kind}/${t.slug}`, (count ?? 0) === 0, `found ${count}`)
      }
    }
  }

  // 8c. Auth/people consistency — every auth user must resolve to a people
  // row; a stale auth user on an empty people table is the classic
  // post-purge "Loading…" failure. Read-only via the admin API.
  if (expectEmptyPeople) {
    const { data: authData, error: authErr } = await db.auth.admin.listUsers({ perPage: 1000 })
    if (authErr) {
      console.log(`  ○ auth user check skipped: ${authErr.message}`)
    } else {
      const authIds = new Set((authData?.users ?? []).map((u: any) => u.id))
      const { data: peopleRows } = await db.from('people').select('auth_uid')
      const linked = new Set((peopleRows ?? []).map((p: any) => p.auth_uid).filter(Boolean))
      const orphans = [...authIds].filter((id) => !linked.has(id))
      check('no auth users without matching people', orphans.length === 0,
        `${orphans.length} orphan auth user(s)`)
    }
  }

  summarize()
}

function summarize(): void {
  console.log('')
  if (failures.length === 0) {
    console.log(`✅ verify-install: all ${passed} checks passed`)
    process.exit(0)
  }
  console.log(`❌ verify-install: ${failures.length} failed, ${passed} passed`)
  process.exit(1)
}

main().catch((err) => {
  console.error('❌ verify-install crashed:', err)
  process.exit(1)
})
