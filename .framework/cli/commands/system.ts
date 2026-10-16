// CIL[BEGIN stable_id="~/.framework/cli/commands/system.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/system.ts"]
// CIL[DOC-MACRO purpose="Provides CLI commands for system discovery and health."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose system discovery and health commands via the CLI."]
// CIL[DOC-CONTEXT module="system" layer="cli" related_files=".framework/cli/context.ts"]
// CIL[DOC-CONTRACT inputs="[]" outputs="[]" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Defines the system command module and its intent, related utilities, and default exports." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="internal"]



import type { Command } from 'commander'
import { buildCliContext, printResult, handleError } from '../context.ts'
// CIL[DOC-VECTOR type="context" content="purpose='Provides CLI commands for system discovery and health.'; No verified external callers; imports: .framework/cli/context.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/system.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/system.ts:fetchSystemEndpoint:function" type="function" identity="fetchSystemEndpoint" parent="~/.framework/cli/commands/system.ts"]
// CIL[DOC-MACRO purpose="Calls the local system endpoint for a given action."]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch system data from the local dev server."]
// CIL[DOC-CONTEXT module="system" layer="cli" related_files=".framework/cli/commands/system.ts,.framework/cli/context.ts"]
// CIL[DOC-CONTRACT inputs="ctx: any, action: string" outputs="Promise<any>" errors="Error when SUPABASE_URL missing, HTTP error, or connection refused" side_effects="Performs an HTTP GET to the local dev server."]
// CIL[DOC-MICRO logic_summary="Build a local URL with the action query param, fetch JSON, and map connection failures to a helpful error." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

async function fetchSystemEndpoint(ctx: any, action: string): Promise<any> {
  const supabaseUrl = process.env.SUPABASE_URL
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL not configured')
  }

  const localUrl = 'http://localhost:8888/.netlify/functions/system'
  const url = `${localUrl}?action=${action}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'x-app-id': 'cli-system'
      }
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`HTTP ${response.status}: ${text}`)
    }

    return await response.json()
  } catch (err: any) {
    if (err.message.includes('fetch failed') || err.message.includes('ECONNREFUSED')) {
      throw new Error(
        'Cannot connect to local dev server. ' +
        'Ensure `spine dev` or `netlify dev` is running on port 8888.'
      )
    }
    throw err
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Calls the local system endpoint for a given action.'; No verified external callers; imports: .framework/cli/context.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/system.ts:fetchSystemEndpoint:function"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/system.ts:registerSystemCommands:function" type="function" identity="registerSystemCommands" parent="~/.framework/cli/commands/system.ts"]
// CIL[DOC-MACRO purpose="Registers the 'system' CLI command and its subcommands (manifest, health, openapi)."]
// CIL[DOC-RESPONSIBILITY responsibility="Expose system discovery and health CLI subcommands."]
// CIL[DOC-CONTEXT module="system" layer="cli" related_files=".framework/cli/commands/system.ts,.framework/cli/context.ts"]
// CIL[DOC-CONTRACT inputs="program: Command" outputs="void" errors="[]" side_effects="Writes formatted manifest/health output or JSON to stdout."]
// CIL[DOC-MICRO logic_summary="Attach a 'system' command to the program, define manifest, health, and openapi subcommands, and render results as JSON or formatted console output." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function registerSystemCommands(program: Command) {
  const system = program
    .command('system')
    .description('System discovery and health commands')

  system
    .command('manifest')
    .description('Fetch system manifest (version, functions, migrations)')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const ctx = await buildCliContext()
        const result = await fetchSystemEndpoint(ctx, 'manifest')

        if (opts.json) {
          console.log(JSON.stringify(result, null, 2))
        } else {
          console.log('\n📋 Spine System Manifest')
          console.log('─'.repeat(50))

          if (result.data) {
            const m = result.data
            console.log(`Version:     ${m.version}`)
            console.log(`Schema:      ${m.schema}`)
            console.log(`Migrations:  ${m.migrations?.applied || 0} applied` +
              (m.migrations?.pending ? `, ${m.migrations.pending} pending` : ''))
            console.log(`Functions:   ${m.functions?.length || 0} endpoints`)
            console.log(`Integrity:   ${m.integrity?.verified ? '✓ verified' : '⚠ not verified'}`)

            if (m.functions?.length > 0) {
              console.log('\nAvailable Functions:')
              for (const fn of m.functions.slice(0, 10)) {
                console.log(`  • ${fn.name} (${fn.methods.join(',')})`)
              }
              if (m.functions.length > 10) {
                console.log(`  ... and ${m.functions.length - 10} more`)
              }
            }
          } else {
            console.log('No manifest data returned')
          }
          console.log()
        }
      } catch (err: any) {
        handleError(err)
      }
    })

  system
    .command('health')
    .description('Fetch health check status')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const ctx = await buildCliContext()
        const result = await fetchSystemEndpoint(ctx, 'health')

        if (opts.json) {
          console.log(JSON.stringify(result, null, 2))
        } else {
          console.log('\n🏥 Spine Health Check')
          console.log('─'.repeat(50))

          if (result.data) {
            const h = result.data
            const statusIcon = h.status === 'healthy' ? '✓' :
                              h.status === 'degraded' ? '⚠' : '✗'
            console.log(`Status: ${statusIcon} ${h.status.toUpperCase()}`)
            console.log()

            if (h.checks) {
              for (const [name, check] of Object.entries(h.checks)) {
                const c = check as any
                const icon = c.connected || c.current || c.verified ? '✓' :
                            c.status === 'passed' ? '✓' : '⚠'
                console.log(`${icon} ${name}:`)
                if (c.latency_ms !== undefined) {
                  console.log(`    latency: ${c.latency_ms}ms`)
                }
                if (c.applied !== undefined) {
                  console.log(`    applied: ${c.applied}, pending: ${c.pending}`)
                }
                if (c.last_suite) {
                  console.log(`    last run: ${c.last_suite} (${c.last_status})`)
                }
              }
            }
          } else {
            console.log('No health data returned')
          }
          console.log()
        }
      } catch (err: any) {
        handleError(err)
      }
    })

  system
    .command('openapi')
    .description('Fetch OpenAPI specification')
    .action(async () => {
      try {
        const ctx = await buildCliContext()
        const result = await fetchSystemEndpoint(ctx, 'openapi')
        console.log(JSON.stringify(result.data || result, null, 2))
      } catch (err: any) {
        handleError(err)
      }
    })
}
// CIL[DOC-VECTOR type="context" content="purpose='Registers the 'system' CLI command and its subcommands (manifest, health, openapi).'; No verified external callers; imports: .framework/cli/context.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/system.ts:registerSystemCommands:function"]
