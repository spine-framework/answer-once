import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const __dirname = dirname(__filename)

function loadEnvFile(envPath: string) {
  if (!existsSync(envPath)) return
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

// `.env` at the project root is the single documented env file — the
// framework-internal `.xenv` name was undocumented drift (env-vars.md,
// .env.example, and the install skill all say `.env`).
loadEnvFile(resolve(process.cwd(), '.env'))
