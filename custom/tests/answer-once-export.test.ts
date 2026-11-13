// Unit tests for the Answer Once standalone export profile + exporter
// schedule/provenance behavior. Filesystem checks only — no DB, no export run.
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { generateNetlifyToml } from '../../scripts/export-standalone'

const ROOT = join(__dirname, '../..')
const APP_DIR = join(ROOT, 'custom/apps/answer-once')
const profile = JSON.parse(readFileSync(join(APP_DIR, 'standalone.config.json'), 'utf8'))

const SAMPLE_TOML = `[build]
  command = "npm run build"

[functions."trigger-scheduler"]
  schedule = "* * * * *"

# sibling app cron — must never ship in another app's standalone
[functions."custom_demo-nightly"]
  schedule = "0 0 * * *"

[functions."ai-agents"]
  timeout = 120

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`

describe('answer-once standalone profile', () => {
  it('app_slug matches the app', () => {
    expect(profile.app_slug).toBe('answer-once')
  })

  it('copies only the answer-once custom app — no siblings', () => {
    expect(profile.copy.app_dirs).toEqual(['custom/apps/answer-once'])
  })

  it('every declared app dir and test file exists', () => {
    for (const d of profile.copy.app_dirs) {
      expect(existsSync(join(ROOT, d)), d).toBe(true)
    }
    for (const t of profile.copy.custom_tests) {
      expect(existsSync(join(ROOT, t)), t).toBe(true)
    }
  })

  it('declared custom migrations all exist on disk', () => {
    for (const prefix of profile.copy.custom_migrations) {
      const dir = join(ROOT, 'custom/migrations')
      const matches = existsSync(dir)
        ? readdirSync(dir).filter((n) => n.startsWith(`${prefix}_`) && n.endsWith('.sql'))
        : []
      expect(matches.length, `migration prefix ${prefix}`).toBeGreaterThan(0)
    }
  })

  it('registration defaults place public signups as member_admin on a new child account', () => {
    const sc = profile.spine_config
    expect(sc.default_app).toBe('answer-once')
    expect(sc.default_role).toBe('member_admin')
    expect(sc.account_strategy).toBe('new')
    expect(sc.parent_account).toBe('spine-system')
    expect(sc.allow_domain_join).toBe(false)
    expect(sc.route_prefix).toBe('/')
  })

  it('app_roles never maps system_admin to the app', () => {
    expect(profile.spine_config.app_roles).not.toContain('system_admin')
    expect(profile.spine_config.app_roles).not.toContain('system-admin')
  })

  it('scheduled function names point at real exported function files', () => {
    const fnDir = join(APP_DIR, 'functions')
    const names = new Set(readdirSync(fnDir).filter((n) => n.endsWith('.ts')).map((n) => n.slice(0, -3)))
    for (const s of profile.netlify?.scheduled_functions ?? []) {
      expect(names.has(s.name), `schedule for missing function ${s.name}`).toBe(true)
      expect(s.schedule.trim().length, `${s.name} schedule`).toBeGreaterThan(0)
    }
  })
})

describe('generateNetlifyToml', () => {
  it('strips sibling-app custom_* schedules', () => {
    const out = generateNetlifyToml(SAMPLE_TOML)
    expect(out).not.toContain('custom_demo-nightly')
    expect(out).toContain('[functions."trigger-scheduler"]')
    expect(out).toContain('[functions."ai-agents"]')
    expect(out).toContain('[[redirects]]')
  })

  it('appends the app profile declared schedules', () => {
    const out = generateNetlifyToml(SAMPLE_TOML, [
      { name: 'custom_answeronce-autoresolve-cron', schedule: '0 0 * * *' },
    ])
    expect(out).toContain('[functions."custom_answeronce-autoresolve-cron"]')
    expect(out).toContain('schedule = "0 0 * * *"')
    expect(out).not.toContain('custom_demo-nightly')
  })

  it('the AO profile schedule produces a valid section', () => {
    const out = generateNetlifyToml(
      SAMPLE_TOML,
      profile.netlify?.scheduled_functions ?? [],
    )
    for (const s of profile.netlify?.scheduled_functions ?? []) {
      expect(out).toContain(`[functions."${s.name}"]`)
      expect(out).toContain(`schedule = "${s.schedule}"`)
    }
  })
})
