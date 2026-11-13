import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

// record_permissions keys are matched verbatim against roles.slug — nothing
// normalizes hyphens, so a key that names no seeded role is a dead key that
// silently denies (see .framework/decisions/, triage B1).
// Valid universe = builtin roles (migrations 003/073) + each app's roles.json.

const ROOT = join(__dirname, '../../..')
const APPS = join(ROOT, 'custom/apps')

function builtinRoleSlugs(): Set<string> {
  const sql = ['003_core_system_data.sql', '073_seed_member_roles.sql']
    .map((f) => readFileSync(join(ROOT, '.framework/migrations', f), 'utf8'))
    .join('\n')
  return new Set([...sql.matchAll(/\(\s*gen_random_uuid\(\)\s*,\s*'([a-z0-9_]+)'/gi)].map((m) => m[1]))
}

function recordPermissionKeys(node: unknown, out: string[] = []): string[] {
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === 'record_permissions' && v && typeof v === 'object') out.push(...Object.keys(v))
      else recordPermissionKeys(v, out)
    }
  }
  return out
}

describe('seed record_permissions', () => {
  const valid = builtinRoleSlugs()
  const apps = readdirSync(APPS, { withFileTypes: true }).filter((d) => d.isDirectory())
  const appRoles = new Map<string, Set<string>>()
  for (const app of apps) {
    const rolesFile = join(APPS, app.name, 'seed/roles.json')
    if (existsSync(rolesFile)) {
      appRoles.set(app.name, new Set(JSON.parse(readFileSync(rolesFile, 'utf8')).map((r: any) => r.slug)))
    }
  }

  it('has a non-empty builtin role universe', () => {
    for (const slug of ['system_admin', 'member', 'member_admin']) expect(valid.has(slug)).toBe(true)
  })

  for (const app of apps) {
    const typesFile = join(APPS, app.name, 'seed/types.json')
    if (!existsSync(typesFile)) continue
    it(`${app.name}: every record_permissions key is a seeded role slug`, () => {
      const universe = new Set([...valid, ...(appRoles.get(app.name) ?? [])])
      const offenders = new Set<string>()
      for (const t of JSON.parse(readFileSync(typesFile, 'utf8'))) {
        for (const key of recordPermissionKeys(t)) {
          if (!universe.has(key)) offenders.add(key)
        }
      }
      expect([...offenders], `dead permission keys in ${app.name} types.json`).toEqual([])
    })
  }
})

// install-app validates notification recipients so bad shapes fail install
// rather than warn-skip at send time; its regexes must mirror
// _shared/notify.ts resolveNotificationRecipients (triage E5). Source-level
// co-change tripwire.
describe('install-app ↔ notify.ts recipient contract', () => {
  const install = readFileSync(join(ROOT, '.framework/cli/commands/install-app.ts'), 'utf8')
  const notify = readFileSync(join(ROOT, '.framework/functions/_shared/notify.ts'), 'utf8')

  const grab = (src: string, name: string) =>
    new RegExp(`const ${name} = (\\/[^/]+\\/[a-z]*)`).exec(src)?.[1]

  it('UUID and role:<slug> regexes are identical in both files', () => {
    expect(grab(install, 'NOTIFICATION_UUID_RE')).toBe(grab(notify, 'UUID_RE'))
    expect(grab(install, 'NOTIFICATION_ROLE_RE')).toBe(grab(notify, 'ROLE_RE'))
    expect(grab(install, 'NOTIFICATION_UUID_RE')).toBeTruthy()
    expect(grab(install, 'NOTIFICATION_ROLE_RE')).toBeTruthy()
  })
})
