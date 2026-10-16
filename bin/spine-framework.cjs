#!/usr/bin/env node
// Thin shebang wrapper — invokes the TypeScript CLI via tsx.
// This file is the npm bin entry point for spine-framework.
const { execFileSync } = require('child_process')
const { resolve } = require('path')
const fs = require('fs')

const pkgRoot = resolve(__dirname, '..')
const projectRoot = resolve(pkgRoot, '../..')

// Handle no-args case — show welcome before spawning tsx
if (process.argv.length === 2) {
  console.log('\nSpine Framework CLI')
  console.log('Usage: spine-framework <command>\n')
  console.log('Commands:')
  console.log('  init          Scaffold a new Spine Framework project')
  console.log('  migrate       Apply database migrations')
  console.log('  install-app   Install a Spine Framework app from npm')
  console.log('  status        Show installed apps and framework version')
  console.log('\nRun spine-framework --help for full command list\n')
  process.exit(0)
}

// Pre-load .env from the consumer project root so db.ts sees env vars at module load time.
// tsx evaluates imports before Commander parses args, so we must inject here.
const args = process.argv.slice(2)
const childEnv = { ...process.env }

const dotenvPath = resolve(process.cwd(), '.env')
if (fs.existsSync(dotenvPath)) {
  const lines = fs.readFileSync(dotenvPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (key && !(key in childEnv)) childEnv[key] = val
  }
}

// CLI flags override .env values
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1])               childEnv.SUPABASE_URL = args[++i]
  if (args[i] === '--anon-key' && args[i + 1])          childEnv.SUPABASE_ANON_KEY = args[++i]
  if (args[i] === '--service-role-key' && args[i + 1])  childEnv.SUPABASE_SERVICE_ROLE_KEY = args[++i]
}

const entry = resolve(pkgRoot, 'bin/ws-shim.mts')

// Find tsx: prefer consuming project's copy, fall back to our own
const tsxPaths = [
  resolve(projectRoot, 'node_modules/.bin/tsx'),
  resolve(pkgRoot, 'node_modules/.bin/tsx'),
]
const tsx = tsxPaths.find(p => { try { fs.accessSync(p); return true } catch { return false } })

if (!tsx) {
  console.error('spine-framework: tsx not found. Run: npm install tsx')
  process.exit(1)
}

try {
  execFileSync(tsx, [entry, ...process.argv.slice(2)], { stdio: 'inherit', env: childEnv })
} catch (e) {
  process.exit(e.status ?? 1)
}
