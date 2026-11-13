import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function loadEnv(): void {
  try {
    const __filename = fileURLToPath(import.meta.url)
    const envPath = path.resolve(path.dirname(__filename), '../../.env')
    if (!fs.existsSync(envPath)) return
    const text = fs.readFileSync(envPath, 'utf-8')
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      let value = line.slice(eq + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (key && process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  } catch {
    // Ignore read/parse errors so the server still starts if .env is missing.
  }
}

loadEnv()
