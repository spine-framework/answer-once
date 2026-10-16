// CIL[BEGIN stable_id="~/.framework/cli/commands/doctor.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/doctor.ts"]
// CIL[DOC-MACRO purpose="Provides CLI commands for the doctor (system health) functionality, integrating with CLI context and shared database functions."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose health-check CLI commands and report system installation status."]
// CIL[DOC-CONTEXT module="doctor" layer="app-specific" related_files=".framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="[]" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Defines the doctor module and its intent, invariant, and related utilities." notable_decisions="Commands must be executed within a valid CLI context."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]

import type { Command } from 'commander'
import { buildCliContext, handleError } from '../context.ts'
import { adminDb } from '../../functions/_shared/index.ts'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// CIL[DOC-VECTOR type="context" content="purpose='Provides CLI commands for the doctor (system health) functionality, integrating with CLI context and shared database functions.'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/doctor.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/doctor.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/cli/commands/doctor.ts"]
// CIL[DOC-MACRO purpose="Resolves the current module's file URL to a filesystem path."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a stable __filename reference for the module."]
// CIL[DOC-CONTEXT module="doctor" layer="app-specific" related_files=".framework/cli/commands/doctor.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="string" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Call fileURLToPath(import.meta.url) and assign to const __filename." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const __filename = fileURLToPath(import.meta.url)
// CIL[DOC-VECTOR type="context" content="purpose='Resolves the current module's file URL to a filesystem path.'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/doctor.ts:__filename:constant"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/doctor.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/cli/commands/doctor.ts"]
// CIL[DOC-MACRO purpose="Provides the directory name of the current module for relative path resolution."]
// CIL[DOC-RESPONSIBILITY responsibility="Derive the current module's directory from __filename."]
// CIL[DOC-CONTEXT module="doctor" layer="app-specific" related_files=".framework/cli/commands/doctor.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="string" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Call dirname(__filename) and assign to const __dirname." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const __dirname = dirname(__filename)
// CIL[DOC-VECTOR type="context" content="purpose='Provides the directory name of the current module for relative path resolution.'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/doctor.ts:__dirname:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/doctor.ts:CheckResult:interface" type="interface" identity="CheckResult" parent="~/.framework/cli/commands/doctor.ts"]
// CIL[DOC-MACRO purpose="Defines the structure for health check results."]
// CIL[DOC-RESPONSIBILITY responsibility="Standardize status reporting across health checks."]
// CIL[DOC-CONTEXT module="doctor" layer="app-specific" related_files=".framework/cli/commands/doctor.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="[]" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Declare an interface with name, status, message, optional details, and fixability." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface CheckResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
  details?: Record<string, any>
  fixable?: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the structure for health check results.'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/doctor.ts:CheckResult:interface"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/doctor.ts:DoctorReport:interface" type="interface" identity="DoctorReport" parent="~/.framework/cli/commands/doctor.ts"]
// CIL[DOC-MACRO purpose="Defines the structure for aggregated doctor health reports."]
// CIL[DOC-RESPONSIBILITY responsibility="Summarize overall health and counts from a collection of CheckResult objects."]
// CIL[DOC-CONTEXT module="doctor" layer="app-specific" related_files=".framework/cli/commands/doctor.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="[]" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Declare an interface with overall status, checks array, and summary counts." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface DoctorReport {
  overall: 'healthy' | 'degraded' | 'unhealthy'
  checks: CheckResult[]
  summary: {
    passed: number
    failed: number
    warnings: number
    fixable: number
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the structure for aggregated doctor health reports.'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/doctor.ts:DoctorReport:interface"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/doctor.ts:checkEnvironment:function" type="function" identity="checkEnvironment" parent="~/.framework/cli/commands/doctor.ts"]
// CIL[DOC-MACRO purpose="Validates required environment variables and optional .xenv file presence."]
// CIL[DOC-RESPONSIBILITY responsibility="Determine whether the runtime environment is configured for Spine."]
// CIL[DOC-CONTEXT module="doctor" layer="app-specific" related_files=".framework/cli/commands/doctor.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="Promise<CheckResult>" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Filter required env vars against process.env, then check for .xenv file at the project root, returning a CheckResult." notable_decisions="Returns fail when required variables are missing; reports .xenv presence on success."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

async function checkEnvironment(): Promise<CheckResult> {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
  const missing = required.filter(v => !process.env[v])

  if (missing.length > 0) {
    return {
      name: 'environment',
      status: 'fail',
      message: `Missing required env vars: ${missing.join(', ')}`,
      details: { missing },
      fixable: true
    }
  }

  
  const xenvPath = resolve(__dirname, '../../.xenv')
  const hasXenv = existsSync(xenvPath)

  return {
    name: 'environment',
    status: 'pass',
    message: 'All required environment variables present',
    details: { has_xenv: hasXenv, vars_present: required.length }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Validates required environment variables and optional .xenv file presence.'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/doctor.ts:checkEnvironment:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/doctor.ts:checkDatabase:function" type="function" identity="checkDatabase" parent="~/.framework/cli/commands/doctor.ts"]
// CIL[DOC-MACRO purpose="Tests database connectivity and measures query latency."]
// CIL[DOC-RESPONSIBILITY responsibility="Verify that the Supabase database is reachable."]
// CIL[DOC-CONTEXT module="doctor" layer="app-specific" related_files=".framework/cli/commands/doctor.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="Promise<CheckResult>" errors="[]" side_effects="Queries the accounts table."]
// CIL[DOC-MICRO logic_summary="Select a single account row, compute elapsed latency, and return pass or fail based on the query result." notable_decisions="Catches and returns structured failure for exceptions; reports latency on success."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now()
  try {
    const { error } = await adminDb.from('accounts').select('id').limit(1)
    const latency = Date.now() - start

    if (error) {
      return {
        name: 'database',
        status: 'fail',
        message: `Database connection failed: ${error.message}`,
        details: { error: error.message },
        fixable: false
      }
    }

    return {
      name: 'database',
      status: 'pass',
      message: `Database connected (${latency}ms latency)`,
      details: { latency_ms: latency }
    }
  } catch (err: any) {
    return {
      name: 'database',
      status: 'fail',
      message: `Database connection error: ${err.message}`,
      fixable: false
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Tests database connectivity and measures query latency.'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/doctor.ts:checkDatabase:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/doctor.ts:checkMigrations:function" type="function" identity="checkMigrations" parent="~/.framework/cli/commands/doctor.ts"]
// CIL[DOC-MACRO purpose="Compares local migration files against applied database migrations."]
// CIL[DOC-RESPONSIBILITY responsibility="Identify pending or missing database migrations."]
// CIL[DOC-CONTEXT module="doctor" layer="app-specific" related_files=".framework/cli/commands/doctor.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="Promise<CheckResult>" errors="[]" side_effects="Reads migration directory and queries schema_migrations."]
// CIL[DOC-MICRO logic_summary="List local SQL files, query applied migration versions, and report any local files not yet applied." notable_decisions="Returns warn for pending migrations and fail when the directory or query errors."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

async function checkMigrations(): Promise<CheckResult> {
  const migrationsDir = resolve(__dirname, '../../migrations_dayzero')

  if (!existsSync(migrationsDir)) {
    return {
      name: 'migrations',
      status: 'fail',
      message: 'Migrations directory not found',
      fixable: false
    }
  }

  const localFiles = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  try {
    const { data, error } = await adminDb
      .schema('public' as any)
      .from('schema_migrations' as any)
      .select('version')

    if (error) {
      return {
        name: 'migrations',
        status: 'fail',
        message: `Cannot query applied migrations: ${error.message}`,
        details: { error: error.message },
        fixable: false
      }
    }

    const applied = (data || []).map((r: any) => r.version)
    const appliedSet = new Set(applied)
    const pending = localFiles.filter(f => !appliedSet.has(f.replace('.sql', '')))

    if (pending.length > 0) {
      return {
        name: 'migrations',
        status: 'warn',
        message: `${pending.length} pending migrations: ${pending.join(', ')}`,
        details: { pending: pending.map(f => f.replace('.sql', '')), applied: applied.length },
        fixable: true
      }
    }

    return {
      name: 'migrations',
      status: 'pass',
      message: `All ${applied.length} migrations applied`,
      details: { applied: applied.length, latest: applied[applied.length - 1] }
    }
  } catch (err: any) {
    return {
      name: 'migrations',
      status: 'fail',
      message: `Migration check error: ${err.message}`,
      fixable: false
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Compares local migration files against applied database migrations.'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/doctor.ts:checkMigrations:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/doctor.ts:checkIntegrity:function" type="function" identity="checkIntegrity" parent="~/.framework/cli/commands/doctor.ts"]
// CIL[DOC-MACRO purpose="Validates the presence and integrity hash of the Spine manifest."]
// CIL[DOC-RESPONSIBILITY responsibility="Confirm that the installation manifest exists and contains an integrity reference."]
// CIL[DOC-CONTEXT module="doctor" layer="app-specific" related_files=".framework/cli/commands/doctor.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="Promise<CheckResult>" errors="[]" side_effects="Reads the manifest file from disk."]
// CIL[DOC-MICRO logic_summary="Check for .spine-manifest.json, parse it, and verify that manifest.integrity.src is present." notable_decisions="Warns if manifest is missing or lacks integrity hash; returns pass when valid."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

async function checkIntegrity(): Promise<CheckResult> {
  const manifestPath = resolve(__dirname, '../../.spine-manifest.json')

  if (!existsSync(manifestPath)) {
    return {
      name: 'integrity',
      status: 'warn',
      message: 'No manifest found (integrity check skipped)',
      details: { manifest_path: manifestPath },
      fixable: true
    }
  }

  try {
    const content = readFileSync(manifestPath, 'utf8')
    const manifest = JSON.parse(content)

    if (!manifest.integrity?.src) {
      return {
        name: 'integrity',
        status: 'warn',
        message: 'Manifest exists but has no integrity hash',
        fixable: true
      }
    }

    
    return {
      name: 'integrity',
      status: 'pass',
      message: 'Core manifest present and valid',
      details: { version: manifest.version, has_integrity: true }
    }
  } catch (err: any) {
    return {
      name: 'integrity',
      status: 'fail',
      message: `Manifest error: ${err.message}`,
      fixable: true
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Validates the presence and integrity hash of the Spine manifest.'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/doctor.ts:checkIntegrity:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/doctor.ts:checkTestRuns:function" type="function" identity="checkTestRuns" parent="~/.framework/cli/commands/doctor.ts"]
// CIL[DOC-MACRO purpose="Fetches the latest test run from the database."]
// CIL[DOC-RESPONSIBILITY responsibility="Report the status of the most recent test suite execution."]
// CIL[DOC-CONTEXT module="doctor" layer="app-specific" related_files=".framework/cli/commands/doctor.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="Promise<CheckResult>" errors="[]" side_effects="Queries the test_runs table."]
// CIL[DOC-MICRO logic_summary="Select the newest test run, translate its status to pass or warn, and return details." notable_decisions="Warns on query errors or when no test runs exist; maps status 'passed' to pass."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

async function checkTestRuns(): Promise<CheckResult> {
  try {
    const { data, error } = await adminDb
      .from('test_runs')
      .select('suite, status, started_at')
      .order('started_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      return {
        name: 'test_runs',
        status: 'warn',
        message: `Cannot query test runs: ${error.message}`,
        details: { error: error.message },
        fixable: false
      }
    }

    if (!data) {
      return {
        name: 'test_runs',
        status: 'warn',
        message: 'No test runs found - run `spine test` to populate',
        fixable: true
      }
    }

    const status = data.status === 'passed' ? 'pass' : 'warn'
    return {
      name: 'test_runs',
      status,
      message: `Last test run (${data.suite}): ${data.status}`,
      details: { last_suite: data.suite, last_status: data.status, last_at: data.started_at }
    }
  } catch (err: any) {
    return {
      name: 'test_runs',
      status: 'warn',
      message: `Test run check error: ${err.message}`,
      fixable: false
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Fetches the latest test run from the database.'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/doctor.ts:checkTestRuns:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/doctor.ts:checkRuntimeWiring:function" type="function" identity="checkRuntimeWiring" parent="~/.framework/cli/commands/doctor.ts"]
// CIL[DOC-MACRO purpose="Verify declared runtime wiring resolves — generic referential integrity over triggers, pipelines, and actions"]
// CIL[DOC-RESPONSIBILITY responsibility="Confirm every active trigger's declared type slugs and pipeline references resolve to existing, active rows, and every active pipeline's stages reference existing actions"]
// CIL[DOC-CONTRACT inputs="[]" outputs="Promise<CheckResult>" errors="[]" side_effects="Queries triggers, types, pipelines, actions"]
// CIL[DOC-MICRO logic_summary="Load all active triggers, all types, all pipelines, and all active actions; report each dangling config.type_slug / config.filters.type_slug / config.pipeline_slug / pipeline_id / stage_type reference as a problem line, and flag active pipelines whose stages array is missing or empty (they complete without doing anything)" notable_decisions="App-agnostic — checks only that declared references resolve, never that a particular app's workflow exists; entity/kind on trigger config scopes the type check when declared"]
// CIL[DOC-STABILITY stability="stable"]
export async function checkRuntimeWiring(): Promise<CheckResult> {
  const problems: string[] = []
  try {
    const [{ data: triggers }, { data: types }, { data: pipelines }, { data: actions }] =
      await Promise.all([
        adminDb.from('triggers').select('id, slug, event_type, pipeline_id, config').eq('is_active', true),
        adminDb.from('types').select('slug, kind'),
        adminDb.from('pipelines').select('id, slug, is_active, stages'),
        adminDb.from('actions').select('slug').eq('is_active', true),
      ])

    // Trigger configs name entities as table names ('items'); the types
    // registry uses singular kinds ('item').
    const ENTITY_KIND: Record<string, string> = {
      items: 'item', threads: 'thread', messages: 'message', links: 'link',
      attachments: 'attachment', watchers: 'watcher', people: 'person', accounts: 'account',
    }
    const declaredKindOf = (config: any): string | null => {
      const raw = config?.kind || config?.entity || config?.entity_type || null
      return typeof raw === 'string' && raw ? (ENTITY_KIND[raw] || raw) : null
    }

    const typeSlugs = new Set<string>((types || []).map((t: any) => t.slug))
    const typeKindSlugs = new Set<string>((types || []).map((t: any) => `${t.kind}:${t.slug}`))
    const pipelinesById = new Map<string, any>((pipelines || []).map((p: any) => [p.id, p]))
    const pipelinesBySlug = new Map<string, any>((pipelines || []).map((p: any) => [p.slug, p]))
    const actionSlugs = new Set<string>((actions || []).map((a: any) => a.slug))

    for (const t of triggers || []) {
      const label = `trigger '${t.slug || t.id}'`
      const cfg = t.config || {}
      const declaredKind = declaredKindOf(cfg)
      for (const slug of new Set([cfg.type_slug, cfg.filters?.type_slug].filter(Boolean) as string[])) {
        const found = declaredKind ? typeKindSlugs.has(`${declaredKind}:${slug}`) : typeSlugs.has(slug)
        if (!found) problems.push(`${label}: type '${slug}' not found`)
      }
      if (cfg.pipeline_slug) {
        const p = pipelinesBySlug.get(cfg.pipeline_slug)
        if (!p) problems.push(`${label}: pipeline '${cfg.pipeline_slug}' not found`)
        else if (!p.is_active) problems.push(`${label}: pipeline '${cfg.pipeline_slug}' is inactive`)
      }
      if (t.pipeline_id) {
        const p = pipelinesById.get(t.pipeline_id)
        if (!p) problems.push(`${label}: pipeline_id '${t.pipeline_id}' not found`)
        else if (!p.is_active) problems.push(`${label}: pipeline '${p.slug || t.pipeline_id}' is inactive`)
      }
    }

    for (const p of (pipelines || []).filter((row: any) => row.is_active)) {
      const stages = Array.isArray(p.stages) ? p.stages : []
      // An active pipeline with no stages completes successfully while doing
      // nothing — a silent no-op worth flagging as a wiring problem.
      if (!stages.length) {
        problems.push(`pipeline '${p.slug}' is active but has no stages (completes without doing anything)`)
        continue
      }
      for (let i = 0; i < stages.length; i++) {
        const stageType = stages[i]?.stage_type
        if (stageType && !actionSlugs.has(stageType)) {
          problems.push(`pipeline '${p.slug}': stage ${i} references missing action '${stageType}'`)
        }
      }
    }

    const activePipelines = (pipelines || []).filter((p: any) => p.is_active).length
    if (problems.length) {
      return {
        name: 'runtime_wiring',
        status: 'fail',
        message: `Runtime wiring broken: ${problems.join('; ')}`,
        details: { problems },
        fixable: true,
      }
    }
    return {
      name: 'runtime_wiring',
      status: 'pass',
      message: `Runtime wiring intact (${(triggers || []).length} active triggers, ${activePipelines} active pipelines)`,
    }
  } catch (err: any) {
    return { name: 'runtime_wiring', status: 'fail', message: `Wiring check error: ${err.message}`, fixable: false }
  }
}
// CIL[END stable_id="~/.framework/cli/commands/doctor.ts:checkRuntimeWiring:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/doctor.ts:tryFix:function" type="function" identity="tryFix" parent="~/.framework/cli/commands/doctor.ts"]
// CIL[DOC-MACRO purpose="Provides automated fix instructions for failed or warned checks."]
// CIL[DOC-RESPONSIBILITY responsibility="Map a CheckResult name to a human-readable remediation hint."]
// CIL[DOC-CONTEXT module="doctor" layer="app-specific" related_files=".framework/cli/commands/doctor.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="check: CheckResult" outputs="Promise<string>" errors="[]" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Use a switch on check.name to return a context-specific remediation message." notable_decisions="Returns 'No automatic fix available' for unrecognized check names."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

async function tryFix(check: CheckResult): Promise<string> {
  switch (check.name) {
    case 'environment':
      return 'Please set missing environment variables in .xenv or export them'

    case 'migrations':
      return 'Run `npx spine migrations apply` or use Supabase CLI to apply pending migrations'

    case 'integrity':
      return 'Run `npm run manifest` to regenerate the integrity manifest'

    case 'test_runs':
      return 'Run `npm run test` to execute test suites'

    case 'runtime_wiring':
      return 'Fix the dangling trigger/pipeline references listed in details (re-install the owning app or correct the type_slug / pipeline reference)'

    default:
      return 'No automatic fix available'
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Provides automated fix instructions for failed or warned checks.'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/doctor.ts:tryFix:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/doctor.ts:registerDoctorCommands:function" type="function" identity="registerDoctorCommands" parent="~/.framework/cli/commands/doctor.ts"]
// CIL[DOC-MACRO purpose="Registers the 'doctor' CLI command and runs the health check sequence."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose a CLI entrypoint that executes health checks and renders the report."]
// CIL[DOC-CONTEXT module="doctor" layer="app-specific" related_files=".framework/cli/commands/doctor.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="program: Command" outputs="Promise<void>" errors="[]" side_effects="Writes health report to stdout and exits the process."]
// CIL[DOC-MICRO logic_summary="Chain conditional checks (environment, database, migrations, test runs, runtime wiring, integrity), build a DoctorReport, and render it as JSON or formatted console output." notable_decisions="Skips database-dependent checks when prior checks fail; exits with code 1 for unhealthy, 2 for degraded, 0 for healthy."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function registerDoctorCommands(program: Command) {
  program
    .command('doctor')
    .description('Validate Spine installation health')
    .option('--json', 'Output as JSON')
    .option('--fix', 'Show fix instructions for failed checks')
    .option('--ticket <id>', 'Attach the sanitized diagnostic report to a support ticket')
    .action(async (opts) => {
      try {
        
        let ctx
        try {
          ctx = await buildCliContext()
        } catch {
          ctx = null
        }

        
        const checks: CheckResult[] = []

        checks.push(await checkEnvironment())

        
        if (checks[0].status === 'pass') {
          checks.push(await checkDatabase())

          
          if (checks[1].status === 'pass') {
            checks.push(await checkMigrations())
            checks.push(await checkTestRuns())
            checks.push(await checkRuntimeWiring())
          } else {
            checks.push({
              name: 'migrations',
              status: 'fail',
              message: 'Skipped - database not connected',
              fixable: false
            })
            checks.push({
              name: 'test_runs',
              status: 'fail',
              message: 'Skipped - database not connected',
              fixable: false
            })
            checks.push({
              name: 'runtime_wiring',
              status: 'fail',
              message: 'Skipped - database not connected',
              fixable: false
            })
          }
        } else {
          checks.push({
            name: 'database',
            status: 'fail',
            message: 'Skipped - environment variables missing',
            fixable: false
          })
          checks.push({
            name: 'migrations',
            status: 'fail',
            message: 'Skipped - environment variables missing',
            fixable: false
          })
          checks.push({
            name: 'test_runs',
            status: 'fail',
            message: 'Skipped - environment variables missing',
            fixable: false
          })
          checks.push({
            name: 'runtime_wiring',
            status: 'fail',
            message: 'Skipped - environment variables missing',
            fixable: false
          })
        }

        checks.push(await checkIntegrity())

        
        const failed = checks.filter(c => c.status === 'fail').length
        const warnings = checks.filter(c => c.status === 'warn').length
        const fixable = checks.filter(c => c.fixable).length

        let overall: DoctorReport['overall']
        if (failed > 0) {
          overall = 'unhealthy'
        } else if (warnings > 0) {
          overall = 'degraded'
        } else {
          overall = 'healthy'
        }

        const report: DoctorReport = {
          overall,
          checks,
          summary: {
            passed: checks.filter(c => c.status === 'pass').length,
            failed,
            warnings,
            fixable
          }
        }

        // Attach the diagnostic bundle to a support ticket when requested.
        // The report contains check names and messages only — never env
        // values, credentials, or customer data — so it is safe to store.
        if (opts.ticket) {
          try {
            const { data: ticket } = await adminDb
              .from('items').select('id, data').eq('id', opts.ticket).maybeSingle()
            if (!ticket) {
              console.warn(`ticket ${opts.ticket} not found — diagnostics not attached`)
            } else {
              const diagnostics = {
                attached_at: new Date().toISOString(),
                overall: report.overall,
                checks: report.checks.map(c => ({
                  name: c.name, status: c.status, message: c.message, details: c.details,
                })),
                summary: report.summary,
                runtime: { node: process.version, platform: process.platform },
              }
              await adminDb
                .from('items')
                .update({
                  data: { ...(ticket.data || {}), diagnostics },
                  updated_at: new Date().toISOString(),
                })
                .eq('id', ticket.id)
              console.log(`Diagnostics attached to ticket ${opts.ticket}`)
            }
          } catch (err: any) {
            console.warn(`diagnostic attach failed: ${err.message}`)
          }
        }

        
        if (opts.json) {
          console.log(JSON.stringify(report, null, 2))
        } else {
          console.log('\nSpine Doctor — System Health Check')
          console.log('═'.repeat(50))
          console.log(`Overall Status: ${overall.toUpperCase()}`)
          console.log()

          for (const check of checks) {
            const icon = check.status === 'pass' ? '✓' :
                        check.status === 'warn' ? '⚠' : '✗'
            const color = check.status === 'pass' ? '\x1b[32m' :
                         check.status === 'warn' ? '\x1b[33m' : '\x1b[31m'
            const reset = '\x1b[0m'

            console.log(`${color}${icon}${reset} ${check.name}: ${check.message}`)

            if (opts.fix && check.status !== 'pass' && check.fixable) {
              const fixMsg = await tryFix(check)
              console.log(`       → ${fixMsg}`)
            }
          }

          console.log()
          console.log('Summary:', report.summary)
          console.log()
        }

        
        if (overall === 'unhealthy') {
          process.exit(1)
        } else if (overall === 'degraded') {
          process.exit(2)
        } else {
          process.exit(0)
        }

      } catch (err: any) {
        handleError(err)
      }
    })
}
// CIL[DOC-VECTOR type="context" content="purpose='Registers the 'doctor' CLI command and runs the health check sequence.'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/doctor.ts:registerDoctorCommands:function"]
