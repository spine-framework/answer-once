


import type { Command } from 'commander'
import { buildCliContext, printResult, handleError } from '../context.ts'


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
