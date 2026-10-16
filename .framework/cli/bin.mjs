#!/usr/bin/env node
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { spawnSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tsEntry = resolve(__dirname, 'index.ts')

// Find tsx relative to this package or globally
const result = spawnSync('npx', ['--yes', 'tsx', tsEntry, ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
})

process.exit(result.status ?? 0)
