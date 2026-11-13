// Commands must be executed within a valid CLI context.

import type { Command } from 'commander'
import { buildCliContext, handleError } from '../context.ts'
import { adminDb } from '../../functions/_shared/index.ts'
import { collectMigrations } from './migrate.ts'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { findAgentsBlock, agentsBlockVersion } from '../lib/project-files.ts'
import { hashEntry } from '../../../scripts/checksum-manifest.mts'


const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)


interface CheckResult {
  name: string
  status: 'pass' | 'fail' | 'warn'
  message: string
  details?: Record<string, any>
  fixable?: boolean
}


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

  const bad = required.filter(v => /your[-_]|placeholder|change-?me|^<[^>]*>|^xxx/i.test(process.env[v]!))
  if (bad.length > 0) {
    return {
      name: 'environment',
      status: 'fail',
      message: `Placeholder values still set: ${bad.join(', ')} — replace with real Supabase credentials`,
      details: { bad },
      fixable: true
    }
  }

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co/.test(process.env.SUPABASE_URL || '')) {
    return {
      name: 'environment',
      status: 'fail',
      message: 'SUPABASE_URL must look like https://<project-ref>.supabase.co',
      details: {},
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


async function checkMigrations(): Promise<CheckResult> {
  const migrationFiles = collectMigrations(false)

  if (migrationFiles.length === 0) {
    return {
      name: 'migrations',
      status: 'fail',
      message: 'Migrations directory not found',
      fixable: false
    }
  }

  try {
    const { data, error } = await adminDb
      .from('_spine_migrations' as any)
      .select('filename')

    if (error) {
      // A missing tracking table means `migrate` has never run on this
      // database — every file is pending, which is a warn, not a query error.
      const tableMissing = error.code === '42P01' ||
        /does not exist|schema cache/i.test(error.message)
      if (!tableMissing) {
        return {
          name: 'migrations',
          status: 'fail',
          message: `Cannot query applied migrations: ${error.message}`,
          details: { error: error.message },
          fixable: false
        }
      }
    }

    const applied = (data || []).map((r: any) => r.filename)
    const appliedSet = new Set(applied)
    const pending = migrationFiles.filter(f => !appliedSet.has(f.name))

    if (pending.length > 0) {
      return {
        name: 'migrations',
        status: 'warn',
        message: `${pending.length} pending migrations: ${pending.map(f => f.name).join(', ')}`,
        details: { pending: pending.map(f => f.name.replace('.sql', '')), applied: applied.length },
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

/**
 * Verify the agent assets init/upgrade install: AGENTS.md carries a
 * spine-framework marker block whose version matches the manifest's
 * framework_version, and every spine-* skill file listed under the
 * manifest's `agent_files` map exists and hashes clean.
 *
 * All mismatches are WARNINGS, never failures — agent assets are
 * refreshable state (`npx spine-framework upgrade` re-syncs them), and
 * customer edits outside the markers / non-spine-* skills must never
 * degrade health. Runs from process.cwd() (the project root).
 */
async function checkAgentFiles(): Promise<CheckResult> {
  const root = process.cwd()
  const manifestPath = join(root, '.spine-manifest.json')

  let manifest: any = null
  try {
    if (existsSync(manifestPath)) manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch {
    manifest = null
  }
  const agentFiles: Record<string, string> = manifest?.agent_files ?? {}
  const expectedVersion: string | null = manifest?.framework_version ?? null
  const problems: string[] = []

  // AGENTS.md — marker block presence + version agreement.
  const agentsPath = join(root, 'AGENTS.md')
  if ('AGENTS.md' in agentFiles || existsSync(agentsPath)) {
    if (!existsSync(agentsPath)) {
      problems.push('AGENTS.md missing (manifest expects it)')
    } else {
      const text = readFileSync(agentsPath, 'utf8')
      const range = findAgentsBlock(text.split(/\r?\n/))
      if (!range) {
        problems.push('AGENTS.md has no spine-framework marker block')
      } else {
        const blockVersion = agentsBlockVersion(text)
        if (expectedVersion && blockVersion && blockVersion !== expectedVersion) {
          problems.push(`AGENTS.md block is v${blockVersion}, project is v${expectedVersion}`)
        }
      }
    }
  }

  // spine-* skills — existence + hash vs manifest agent_files entries.
  for (const [rel, hash] of Object.entries(agentFiles)) {
    if (rel === 'AGENTS.md') continue
    const abs = join(root, rel)
    if (!existsSync(abs)) { problems.push(`${rel} missing`); continue }
    try {
      if (hashEntry({ rel, abs, symlink: false }) !== hash) {
        problems.push(`${rel} modified`)
      }
    } catch {
      problems.push(`${rel} unreadable`)
    }
  }

  if (problems.length) {
    return {
      name: 'agent_files',
      status: 'warn',
      message: `Agent asset drift: ${problems.join('; ')}`,
      details: { problems },
      fixable: true,
    }
  }
  const count = Object.keys(agentFiles).length
  return {
    name: 'agent_files',
    status: 'pass',
    message: count
      ? `Agent assets in sync (${count} manifest entries)`
      : 'No agent assets tracked — this framework version predates agent_files',
  }
}


async function checkTestRuns(): Promise<CheckResult> {
  try {
    const { data, error } = await adminDb
      .from('test_runs')
      .select('suite, status, started_at')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()

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

// App-agnostic — checks only that declared references resolve, never that a particular app's workflow exists; entity/kind on trigger config scopes the type check when declared
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


async function tryFix(check: CheckResult): Promise<string> {
  switch (check.name) {
    case 'environment':
      return 'Please set missing environment variables in .xenv or export them'

    case 'migrations':
      return 'Run `npx spine-framework migrate` to apply pending migrations'

    case 'integrity':
      return 'Run `npm run manifest` to regenerate the integrity manifest'

    case 'test_runs':
      return 'Run `npm run test` to execute test suites'

    case 'runtime_wiring':
      return 'Fix the dangling trigger/pipeline references listed in details (re-install the owning app or correct the type_slug / pipeline reference)'

    case 'agent_files':
      return 'Run `npx spine-framework upgrade` to re-sync AGENTS.md and .devin/skills/spine-*'

    default:
      return 'No automatic fix available'
  }
}


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
        checks.push(await checkAgentFiles())

        
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
