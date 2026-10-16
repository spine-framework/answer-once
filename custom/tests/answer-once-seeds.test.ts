// Unit tests for the Answer Once seed + manifest consistency contract.
// These checks validate what `seed-app answer-once` must materialize on a
// virgin database — they read only files, never a database.
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const APP = join(__dirname, '../apps/answer-once')
const SEED = join(APP, 'seed')
const load = (file: string) => JSON.parse(readFileSync(join(SEED, file), 'utf8'))
const manifest = JSON.parse(readFileSync(join(APP, 'manifest.json'), 'utf8'))

const roles = load('roles.json')
const types = load('types.json')
const linkTypes = load('link-types.json')
const agents = load('ai-agents.json')
const prompts = load('prompt-configs.json')

// Unique constraints the seed upserts rely on (fresh-install schema):
//   roles(slug), types(kind,slug), link_types(app_id,slug),
//   ai_agents(app_id,slug), prompt_configs(app_id,slug)
const EXPECTED_CONFLICTS: Record<string, string> = {
  'seed/roles.json': 'slug',
  'seed/types.json': 'kind,slug',
  'seed/link-types.json': 'app_id,slug',
  'seed/ai-agents.json': 'app_id,slug',
  'seed/prompt-configs.json': 'app_id,slug',
}

describe('answer-once manifest seed contract', () => {
  it('declares every existing seed file', () => {
    const declared = new Set(manifest.seed.map((s: any) => s.file))
    for (const f of ['seed/roles.json', 'seed/types.json', 'seed/link-types.json', 'seed/ai-agents.json', 'seed/prompt-configs.json']) {
      expect(declared.has(f), `manifest.seed missing ${f}`).toBe(true)
    }
  })

  it('uses conflict specs that match real unique constraints', () => {
    for (const entry of manifest.seed) {
      const expected = EXPECTED_CONFLICTS[entry.file]
      if (!expected) continue
      expect(entry.conflict, `${entry.file} conflict`).toBe(expected)
    }
  })
})

describe('answer-once seed identity fields', () => {
  it('every ai_agents row carries slug (NOT NULL on fresh schema)', () => {
    for (const a of agents) {
      expect(typeof a.slug === 'string' && a.slug.length > 0,
        `ai_agents row "${a.name}" is missing slug`).toBe(true)
    }
  })

  it('agent slugs are namespaced ao_*', () => {
    for (const a of agents) {
      expect(a.slug, `agent "${a.name}"`).toMatch(/^ao_/)
    }
  })

  it('every prompt_configs row carries slug', () => {
    for (const p of prompts) {
      expect(typeof p.slug === 'string' && p.slug.length > 0, `prompt "${p.name}"`).toBe(true)
    }
  })

  it('every roles row carries slug', () => {
    for (const r of roles) {
      expect(typeof r.slug === 'string' && r.slug.length > 0, `role "${r.name}"`).toBe(true)
    }
  })

  it('every types row carries kind + slug', () => {
    for (const t of types) {
      expect(typeof t.kind === 'string' && t.kind.length > 0, `type "${t.slug}"`).toBe(true)
      expect(typeof t.slug === 'string' && t.slug.length > 0, `type "${t.name}"`).toBe(true)
    }
  })
})

describe('answer-once seeded roles', () => {
  it('seeds the four app roles', () => {
    const slugs = new Set(roles.map((r: any) => r.slug))
    for (const s of ['member', 'member_admin', 'support', 'support_admin']) {
      expect(slugs.has(s), `role seed missing ${s}`).toBe(true)
    }
  })

  it('does not re-seed the framework-owned system_admin role', () => {
    expect(roles.some((r: any) => r.slug === 'system_admin' || r.slug === 'system-admin')).toBe(false)
  })
})

describe('answer-once type design_schemas', () => {
  it('seeds the five ao_* types', () => {
    const slugs = new Set(types.map((t: any) => t.slug))
    for (const s of ['ao_support_ticket', 'ao_kb_article', 'ao_kb_shared', 'ao_ticket_thread', 'ao_ticket_message']) {
      expect(slugs.has(s), `types seed missing ${s}`).toBe(true)
    }
  })

  it('every type has design_schema with fields + record_permissions', () => {
    for (const t of types) {
      const ds = t.design_schema
      expect(ds && typeof ds === 'object', `${t.slug} design_schema`).toBeTruthy()
      expect(ds.fields && typeof ds.fields === 'object', `${t.slug} fields`).toBeTruthy()
      expect(ds.record_permissions && typeof ds.record_permissions === 'object',
        `${t.slug} record_permissions`).toBeTruthy()
    }
  })

  it('thread type declares its reply message binding', () => {
    const thread = types.find((t: any) => t.slug === 'ao_ticket_thread')
    expect(thread?.design_schema?.functionality?.thread?.reply_type_slug).toBe('ao_ticket_message')
  })

  it('thread type declares the agent-driver data keys', () => {
    // create_ticket stamps data.agent_id/prompt_config_id; the episode driver
    // merges research_state into a whole-column data write; analyze_ticket
    // stamps thread_purpose. sanitizeRecordData strips undeclared data.* keys
    // from the create() return for non-system-admin callers — for a member the
    // driver's merge then clobbers agent_id/prompt_config_id and the episode
    // dies with "Could not resolve agent configuration". Demo declares all of
    // these on demo_support_thread; this assertion keeps AO at parity.
    const fields = (types.find((t: any) => t.slug === 'ao_ticket_thread')?.design_schema?.fields) || {}
    for (const key of ['agent_id', 'prompt_config_id', 'research_state', 'thread_purpose']) {
      expect(fields[key], `ao_ticket_thread missing data.${key}`).toBeTruthy()
    }
  })

  it('kb item types declare vector_fields + security_level', () => {
    for (const slug of ['ao_kb_article', 'ao_kb_shared']) {
      const t = types.find((r: any) => r.slug === slug)
      const kb = t?.design_schema?.functionality?.kb
      expect(Array.isArray(kb?.vector_fields) && kb.vector_fields.length > 0,
        `${slug} kb.vector_fields`).toBe(true)
      expect(typeof kb?.security_level === 'string', `${slug} kb.security_level`).toBe(true)
    }
  })

  it('record_permissions keys are exact seeded/system role slugs — no dead keys', () => {
    // The permission engine exact-matches record_permissions[roleSlug]; a key
    // like "system-admin" (hyphen) never matches the seeded "system_admin" slug
    // and silently denies that role — this is a proven install-time defect.
    const validKeys = new Set([...roles.map((r: any) => r.slug), 'system_admin', 'all'])
    for (const t of types) {
      for (const k of Object.keys(t.design_schema.record_permissions)) {
        expect(validKeys.has(k), `${t.slug} record_permissions has unseeded role key "${k}"`).toBe(true)
      }
    }
  })

  it('record_permissions grant the five product personas', () => {
    const ticket = types.find((t: any) => t.slug === 'ao_support_ticket')
    const perms = Object.keys(ticket.design_schema.record_permissions)
    for (const r of ['system_admin', 'support', 'support_admin', 'member_admin', 'member']) {
      expect(perms, `ao_support_ticket missing role ${r}`).toContain(r)
    }
  })

  it('every type uses the canonical five-role grant map', () => {
    const CRU = ['create', 'read', 'update']
    const want = {
      member: CRU,
      member_admin: CRU,
      system_admin: ['create', 'read', 'update', 'delete'],
      support: CRU,
      support_admin: CRU,
    }
    for (const t of types) {
      expect(t.design_schema.record_permissions, `${t.slug} record_permissions`).toEqual(want)
    }
  })

  it('seeds no KB content — types only, no article/thread/message rows', () => {
    // The seed materializes type definitions; runtime records are created by
    // real support work. Any row here that isn't a type definition is a bug.
    for (const t of types) {
      expect(['item', 'thread', 'message']).toContain(t.kind)
      expect(t.id, `${t.slug} must not pin a record id`).toBeUndefined()
    }
  })
})

describe('answer-once agent/prompt wiring', () => {
  it('agent default_prompt_config_slug resolves to a seeded prompt', () => {
    const promptSlugs = new Set(prompts.map((p: any) => p.slug))
    for (const a of agents) {
      const ref = a.metadata?.default_prompt_config_slug
      if (ref) {
        expect(promptSlugs.has(ref), `agent "${a.name}" references unseeded prompt ${ref}`).toBe(true)
      }
    }
  })

  it('agents used by the journey function exist by name', () => {
    // resolveIds() in custom_answeronce-journey.ts resolves agents by name —
    // these exact strings are the contract.
    const names = new Set(agents.map((a: any) => a.name))
    expect(names.has('AO Triage Agent')).toBe(true)
    expect(names.has('AO Case Resolution Analysis Agent')).toBe(true)
  })

  it('prompts used by the journey function exist by slug', () => {
    const slugs = new Set(prompts.map((p: any) => p.slug))
    expect(slugs.has('ao_triage')).toBe(true)
    expect(slugs.has('ao_case_analysis')).toBe(true)
  })
})

describe('answer-once manifest consistency', () => {
  it('required_roles are exact seeded/system role slugs — no hyphen aliases', () => {
    // get_account_apps compares required_roles verbatim (= ANY(user_role_slugs));
    // nothing normalizes hyphens, so only real slugs are valid.
    const seeded = new Set([...roles.map((r: any) => r.slug), 'system_admin'])
    for (const rr of manifest.required_roles) {
      expect(seeded.has(rr), `required_role ${rr} has no seeded/system role`).toBe(true)
    }
  })

  it('knowledge envelope references only seeded ao_* types', () => {
    const platformSources: string[] = manifest.config?.knowledge?.platform?.sources ?? []
    const typeSlugs = new Set(types.map((t: any) => t.slug))
    for (const s of platformSources) {
      expect(typeSlugs.has(s), `platform source ${s} is not a seeded type`).toBe(true)
    }
    const accountPatterns: string[] = manifest.config?.knowledge?.account?.item_types ?? []
    for (const p of accountPatterns) {
      expect(p.startsWith('ao_'), `account item_types pattern ${p} outside ao_ namespace`).toBe(true)
    }
  })

  it('no CIL knowledge block — Answer Once runs without CIL', () => {
    expect(manifest.config?.knowledge?.cil).toBeUndefined()
  })
})
