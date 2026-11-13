/**
 * @module   bootstrap
 * @audience engineers
 * @layer    cli
 * @stability stable
 *
 * `spine-framework bootstrap` — scriptable first-run provisioning. Creates
 * the first `system_admin` person (bound to the `spine-system` account,
 * mirroring the `handle_new_auth_user` trigger columns) and mints the first
 * `sk_` API key, entirely without a browser. With `--email`/`--password` it
 * additionally provisions a login-able Supabase auth user via the admin API.
 *
 * INVARIANT: the raw API key is printed exactly once and only its PBKDF2 hash
 * is persisted — identical to the `api-keys` create path.
 *
 * @seeAlso .framework/migrations/052_registration_security.sql (trigger row shape)
 * @seeAlso .framework/functions/api-keys.ts (key minting/hash logic)
 */

import type { Command } from 'commander'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'
import { hashApiKey } from '../../functions/_shared/hash-api-key.ts'
import { emitLog } from '../../functions/_shared/audit.ts'
import { SYSTEM_PRINCIPAL } from '../../functions/_shared/principal.ts'

const PROJECT_ROOT = process.cwd()

/**
 * Options accepted by `runBootstrap`. `scopes` entries of `system_admin`
 * normalize to the `*:*` wildcard — `resolveMachinePrincipal` maps `*:*` to
 * the `system_admin` role on the machine principal.
 */
export interface BootstrapOptions {
  email?: string
  password?: string
  fullName?: string
  keyName?: string
  scopes?: string[]
}

export interface BootstrapResult {
  /** 'created' when a new admin person was provisioned, 'existing' when a
      system_admin already occupied the spine-system account (idempotent skip). */
  admin: 'created' | 'existing'
  personId: string
  personEmail: string
  /** True when a Supabase auth user was created via the admin API — without
      it the person row exists but cannot log in through the UI. */
  authUserCreated: boolean
  apiKey: {
    id: string
    name: string
    key_prefix: string
    scopes: string[]
    /** Raw `sk_` key — returned once, never stored. */
    raw_key: string
  }
}

/**
 * Loads key=value pairs from the project .env into process.env without
 * overwriting already-set variables. Mirrors the helper in migrate.ts so the
 * command works when its module is exercised outside cli/index.ts.
 */
function loadEnv() {
  const envPath = join(PROJECT_ROOT, '.env')
  if (!existsSync(envPath)) return
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (key && !(key in process.env)) process.env[key] = val
  }
}

/** Normalize requested scopes; default is the system_admin wildcard. */
function normalizeScopes(scopes?: string[]): string[] {
  const requested = (scopes || []).filter(Boolean)
  if (requested.length === 0) return ['*:*']
  return requested.map((s) => (s === 'system_admin' ? '*:*' : s))
}

/**
 * Provision the first system admin and mint the first API key.
 *
 * Idempotent on the admin side: when a `people` row carrying the
 * `system_admin` role already exists in the `spine-system` account, creation
 * is skipped and that person is reused as the key's `created_by`. A new API
 * key is minted on every run — re-running produces an additional key, never
 * an error, and the raw key is only ever returned to the caller once.
 *
 * @throws Error when the spine-system account, system_admin role, or person
 *   type seeds are missing (i.e. `migrate` has not run), or when the auth
 *   admin API / people upsert fails.
 */
export async function runBootstrap(db: any, options: BootstrapOptions = {}): Promise<BootstrapResult> {
  if (options.password && !options.email) {
    throw new Error('--password requires --email')
  }

  // --- Required seeds (created by migrate / framework seeds) ---
  const { data: account, error: accountErr } = await db
    .from('accounts')
    .select('id')
    .eq('slug', 'spine-system')
    .maybeSingle()
  if (accountErr) throw accountErr
  if (!account) {
    throw new Error('spine-system account not found — run `npx spine-framework migrate` first')
  }

  const { data: role, error: roleErr } = await db
    .from('roles')
    .select('id')
    .eq('slug', 'system_admin')
    .maybeSingle()
  if (roleErr) throw roleErr
  if (!role) {
    throw new Error('system_admin role not found — run `npx spine-framework migrate` first')
  }

  const { data: personType, error: typeErr } = await db
    .from('types')
    .select('id, design_schema, validation_schema')
    .eq('kind', 'person')
    .eq('slug', 'person')
    .maybeSingle()
  if (typeErr) throw typeErr
  if (!personType) {
    throw new Error('person type (kind=person, slug=person) not found — run framework seeds first')
  }

  const auditCtx = {
    principal: SYSTEM_PRINCIPAL,
    accountId: account.id,
    db,
    requestId: crypto.randomUUID(),
  }

  // --- Idempotent admin check ---
  const { data: existingAdmins, error: existErr } = await db
    .from('people')
    .select('id, email')
    .eq('account_id', account.id)
    .eq('role_id', role.id)
    .limit(1)
  if (existErr) throw existErr

  let admin: 'created' | 'existing' = 'existing'
  let personId: string | undefined = existingAdmins?.[0]?.id
  let personEmail: string = existingAdmins?.[0]?.email
  let authUserCreated = false

  if (!personId) {
    admin = 'created'
    const email = options.email || 'admin@spine.local'
    const fullName = options.fullName || email.split('@')[0]

    // Optional login-able auth user. handle_new_auth_user fires on insert and
    // may create the people row itself (first user gets system_admin); the
    // upsert below converges the row to the same binding either way, so the
    // command does not depend on the trigger being installed.
    let authUid: string | null = null
    if (options.email && options.password) {
      const { data: created, error: createErr } = await db.auth.admin.createUser({
        email,
        password: options.password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      })
      if (createErr) {
        // An already-registered email still gets a bound person record — the
        // auth user can be re-linked or password-reset later.
        if (/already|exists|registered/i.test(createErr.message || '')) {
          console.warn(`  ⚠ auth user for ${email} already exists — binding a person record without touching auth`)
        } else {
          throw new Error(`Failed to create auth user: ${createErr.message}`)
        }
      } else {
        authUid = created?.user?.id || null
        authUserCreated = !!authUid
      }
    }

    // Mirror the handle_new_auth_user INSERT columns exactly (052), keyed on
    // people.email's UNIQUE constraint: claim/upgrade an existing row or
    // insert a fresh one stamped with the person type's schemas.
    const { data: existingPerson, error: personLookupErr } = await db
      .from('people')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (personLookupErr) throw personLookupErr

    if (existingPerson) {
      const { error: updateErr } = await db
        .from('people')
        .update({
          account_id: account.id,
          role_id: role.id,
          type_id: personType.id,
          status: 'active',
          is_active: true,
          design_schema: personType.design_schema || {},
          validation_schema: personType.validation_schema || {},
          ...(authUid ? { auth_uid: authUid } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPerson.id)
      if (updateErr) throw updateErr
      personId = existingPerson.id
    } else {
      const { data: inserted, error: insertErr } = await db
        .from('people')
        .insert({
          id: authUid || crypto.randomUUID(),
          auth_uid: authUid,
          email,
          full_name: fullName,
          account_id: account.id,
          type_id: personType.id,
          role_id: role.id,
          status: 'active',
          is_active: true,
          design_schema: personType.design_schema || {},
          validation_schema: personType.validation_schema || {},
        })
        .select('id')
        .single()
      if (insertErr) throw insertErr
      personId = inserted.id
    }
    personEmail = email

    await emitLog(auditCtx as any, 'person.created', { type: 'person', id: personId! }, {
      after: { email, role: 'system_admin', account: 'spine-system', auth_user: authUserCreated },
    }, { source: 'cli bootstrap' })
  }

  // --- Mint the API key (always — each run yields one new credential) ---
  const scopes = normalizeScopes(options.scopes)
  const keyName = options.keyName || 'bootstrap-admin'
  const slug = `${keyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'bootstrap'}-${crypto.randomUUID().slice(0, 6)}`

  const rawKey = `sk_${crypto.randomUUID().replace(/-/g, '')}`
  const { key_prefix, key_hash } = hashApiKey(rawKey)

  const { data: key, error: keyErr } = await db
    .from('api_keys')
    .insert({
      integration_id: null,
      app_id: null,
      account_id: account.id,
      slug,
      name: keyName,
      key_prefix,
      key_hash,
      key_type: 'cli',
      permissions: [],
      scopes,
      rate_limit: 100,
      expires_at: null,
      metadata: { source: 'cli bootstrap' },
      machine_type: 'service_account',
      is_internal: false,
      is_active: true,
      created_by: personId,
    })
    .select('id, name, key_prefix, scopes')
    .single()
  if (keyErr) throw keyErr

  await emitLog(auditCtx as any, 'api_key.created', { type: 'api_key', id: key.id }, {
    after: { name: keyName, key_type: 'cli', scopes, machine_type: 'service_account' },
  }, { source: 'cli bootstrap' })

  return {
    admin,
    personId: personId!,
    personEmail,
    authUserCreated,
    apiKey: {
      id: key.id,
      name: key.name,
      key_prefix: key.key_prefix,
      scopes: key.scopes,
      raw_key: rawKey,
    },
  }
}

async function bootstrapCommand(options: {
  email?: string
  password?: string
  fullName?: string
  name?: string
  scope?: string[]
  json?: boolean
}): Promise<void> {
  console.log('\nBootstrapping Spine instance...\n')

  loadEnv()

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    console.error('  Set them in .env or export them before running this command.')
    process.exit(1)
  }

  const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const result = await runBootstrap(db, {
    email: options.email,
    password: options.password,
    fullName: options.fullName,
    keyName: options.name,
    scopes: options.scope,
  })

  if (options.json) {
    console.log(JSON.stringify(result, null, 2))
    return
  }

  if (result.admin === 'existing') {
    console.log(`  ✓ system_admin already exists (${result.personEmail}) — skipped person creation`)
  } else {
    console.log(`  ✓ Created system_admin person ${result.personEmail} in the spine-system account`)
    if (result.authUserCreated) {
      console.log('  ✓ Auth user created and email confirmed — sign in at /login')
    } else {
      console.log('  ℹ No auth user created. UI login requires registration or an')
      console.log('    admin-supplied auth user (rerun with --email/--password, or')
      console.log('    create one in Supabase Dashboard → Authentication → Users).')
    }
  }

  console.log(`\n  ✓ Minted API key "${result.apiKey.name}" (scopes: ${result.apiKey.scopes.join(', ')})`)
  console.log('\n  ' + '─'.repeat(52))
  console.log(`  API key (shown once — store it now):  ${result.apiKey.raw_key}`)
  console.log('  ' + '─'.repeat(52))
  console.log('\n  Use it as:  SPINE_CLI_API_KEY / x-api-key header / SPINE_API_KEY')
  console.log('\n✅ Bootstrap complete.\n')
}

export function registerBootstrapCommands(program: Command) {
  const collect = (value: string, previous: string[]) => previous.concat([value])

  program
    .command('bootstrap')
    .description('Create the first system_admin and mint the first API key — no browser required')
    .option('--email <email>', 'Email for the admin person (default: admin@spine.local)')
    .option('--password <password>', 'With --email, also creates a confirmed login-able auth user')
    .option('--full-name <name>', 'Display name for the admin person (default: email local part)')
    .option('--name <name>', 'API key name', 'bootstrap-admin')
    .option('--scope <scope>', 'API key scope, repeatable (default: system_admin i.e. *:*)', collect, [] as string[])
    .option('--json', 'Output as JSON (includes the raw key — capture it now)')
    .action(async (opts) => {
      try {
        await bootstrapCommand(opts)
      } catch (err: any) {
        console.error('Error:', err.message)
        if (process.env.SPINE_CLI_DEBUG) console.error(err.stack)
        process.exit(1)
      }
    })
}
