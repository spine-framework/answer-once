/**
 * @module   invites
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * This module handles invite-related functionalities within the application, integrating with various services to manage invites effectively. It serves as an API handler for processing invite requests and includes middleware for authentication and rate limiting. INVARIANT: All invite requests must be authenticated before processing.
 *
 * @seeAlso middleware.ts (provides authentication and rate limiting)
 * @seeAlso db.ts (database interactions)
 * @seeAlso audit.ts (logging and auditing actions)
 *
 * @cil-generated
 */
















import { createHandler, createPublicHandler } from './_shared/middleware'
import { adminDb } from './_shared/db'
import { emitLog } from './_shared/audit'
import { checkRateLimit } from './_shared/rate-limit'
import { getClientGeo } from './_shared/geo'
import { checkRegistrationBlocklist, recordRegistrationGeo } from './_shared/security'
import { execute as executeOutbound } from './integration-outbound'
import { create as adminDataCreate, list as adminDataList, update as adminDataUpdate } from './admin-data'
import { getBrandsConfig, brandForHost } from './_shared/site-brand'
import { escapeHtml } from './_shared/access'
/**
 * TOKEN_LENGTH defines the length of the token used in the invite process, ensuring consistency across the application. This constant exists to centralize the token length configuration for easier maintenance and updates.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const TOKEN_LENGTH = 16
/**
 * MAX_ATTEMPTS defines the maximum number of attempts allowed for a specific operation in the invites module. This constant helps to enforce limits and prevent excessive retries.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const MAX_ATTEMPTS = 5
/**
 * INVITE_EXPIRY_DAYS defines the duration in days that an invite remains valid. This constant is used to manage the expiration of invites in the application.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const INVITE_EXPIRY_DAYS = 7

/**
 * PERSONAL_DOMAINS is a set of common email domains used to identify personal email addresses. It exists to facilitate validation or filtering of email inputs in the module.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const PERSONAL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'aol.com', 'protonmail.com', 'me.com', 'mac.com', 'live.com',
  'msn.com', 'ymail.com', 'googlemail.com', 'fastmail.com',
])
/**
 * Generates a random token string composed of alphanumeric characters. This function is used to create unique identifiers for invites.
 *
 * @outputSpec  string
 * @sideEffects none
 * @stability   stable
 * @calls       crypto.getRandomValues
 * @cil-generated
 */
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = crypto.getRandomValues(new Uint8Array(TOKEN_LENGTH))
  return Array.from(bytes).map(b => chars[b % chars.length]).join('')
}
/**
 * Generates a URL-friendly slug from a given account name by normalizing and truncating it. This function ensures that the slug is unique by appending a random hash.
 *
 * @macro       Slug generator for account names.
 * @micro       Normalizes the name by converting it to lowercase and replacing non-alphanumeric characters with hyphens.
 * @inputSpec
 *   name: string (required) — the account name to be converted into a slug.
 * @outputSpec  string — a URL-friendly slug with a random hash appended.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
function generateAccountSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  const hash = Math.random().toString(36).slice(2, 8)
  return `${base}-${hash}`
}
/**
 * Determines if a given role slug corresponds to an admin role. This function is used to validate user permissions based on their role.
 *
 * @macro       Role validation function for admin permissions.
 * @micro       Checks if the role slug is defined and matches specific admin criteria.
 * @inputSpec
 *   roleSlug: string | undefined (optional) — the role identifier to check for admin status.
 * @outputSpec  boolean — true if the role is an admin role, false otherwise.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
function isAdminRole(roleSlug: string | undefined): boolean {
  return !!roleSlug && (
    roleSlug === 'system_admin' ||
    roleSlug.endsWith('_admin')
  )
}

// Added in the registration/invitation hardening batch — previously invite mutations only required a non-anonymous principal, so any authenticated user could revoke/approve/block invites in any account.
function requireAccountAdmin(ctx: any, accountId: string | null | undefined): void {
  const principal = ctx?.principal
  if (!principal || principal.id === 'anonymous') {
    throw new Error('Authentication required')
  }
  if (
    principal.permissions?.includes('system') ||
    (principal.roles || []).includes('system_admin')
  ) {
    return
  }
  const isAdmin = (principal.roles || []).some((r: string) => isAdminRole(r))
  if (isAdmin && accountId && principal.accountId === accountId) {
    return
  }
  throw new Error('Insufficient permissions — *_admin role required for this account')
}

function appRoleAllowlist(appConfig: any): string[] | null {
  const declared = appConfig?.invitation?.allowed_roles ?? appConfig?.registration?.roles
  if (!Array.isArray(declared)) return null
  const slugs = declared.filter((r: any) => typeof r === 'string')
  return slugs.length ? slugs : null
}

async function resolveAppRoleAllowlist(ctx: any, body: any): Promise<string[] | null> {
  const appSlug = ctx?.appId || body?.app
  if (!appSlug || typeof appSlug !== 'string') return null
  const { data: appRow } = await adminDb
    .from('apps')
    .select('config')
    .eq('slug', appSlug)
    .maybeSingle()
  return appRoleAllowlist(appRow?.config)
}

async function roleAllowlistForAccount(accountId: string | null | undefined): Promise<string[] | null> {
  if (!accountId) return null
  const { data: appRows } = await adminDb
    .from('apps')
    .select('config')
    .eq('owner_account_id', accountId)
  const merged = new Set<string>()
  for (const row of appRows || []) {
    for (const slug of appRoleAllowlist(row?.config) || []) merged.add(slug)
  }
  return merged.size ? Array.from(merged) : null
}

// drops the 'https://yourapp.com' placeholder; never returns the attacker-supplied URL when it is not allowlisted — invite links can no longer be pointed at phishing origins
// base_url is client-controlled; without this check an admin tricked into creating an invite could hand out a token link on an arbitrary origin.
function resolveInviteBaseUrl(baseUrl: string | undefined): string {
  const fallback = process.env.APP_BASE_URL || 'http://localhost:8888'
  if (!baseUrl) return fallback
  try {
    const origin = new URL(baseUrl).origin
    const hostname = new URL(origin).hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') return origin
    const allowed = new Set<string>()
    if (process.env.APP_BASE_URL) {
      try { allowed.add(new URL(process.env.APP_BASE_URL).origin) } catch { /* malformed env value */ }
    }
    for (const entry of (process.env.ALLOWED_ORIGINS || '').split(',')) {
      const trimmed = entry.trim()
      if (!trimmed) continue
      try { allowed.add(new URL(trimmed).origin) } catch { /* skip malformed entry */ }
    }
    return allowed.has(origin) ? origin : fallback
  } catch {
    return fallback
  }
}
/**
 * This constant checks if there are any users in the database and determines if the current user is the first one. It exists to facilitate user onboarding by identifying if the application is being used for the first time.
 *
 * @throws      Error — failed to check first user: error message
 * @sideEffects none
 * @stability   stable
 * @calls       adminDb.from('people')
 * @cil-generated
 */
export const checkFirstUser = createPublicHandler(async (_ctx, _body) => {
  const { data, error } = await adminDb
    .from('people')
    .select('id')
    .limit(1)

  if (error) throw new Error('Failed to check first user: ' + error.message)

  return { is_first_user: (data?.length ?? 0) === 0 }
})
/**
 * Validates the provided email domain against a list of personal domains and checks for an active account associated with that domain. This function exists to ensure that only valid and non-personal email domains are processed for account matching.
 *
 * @throws      Error — Valid email is required if the email is missing or invalid.
 * @sideEffects Database read operation to check for active accounts.
 * @stability   stable
 * @calls       adminDb.from('people')
 * @cil-generated
 */
export const checkDomain = createPublicHandler(async (_ctx, _body) => {
  const email = _ctx.query?.email as string | undefined
  if (!email || !email.includes('@')) {
    throw new Error('Valid email is required')
  }

  const domain = email.split('@')[1].toLowerCase()

  if (PERSONAL_DOMAINS.has(domain)) {
    return { match: false }
  }

  // Only return whether the domain is present — the account_id powered
  // cross-tenant IDOR chains and the join flow only needs the boolean.
  // Reject wildcard metachars so % and _ can't widen the ilike probe.
  if (/[%_\\]/.test(domain)) {
    return { match: false }
  }

  const { data } = await adminDb
    .from('people')
    .select('id')
    .ilike('email', `%@${domain}`)
    .eq('status', 'active')
    .limit(1)

  return { match: !!(data && data.length) }
})
/**
 * Validates an invite token by checking its existence and status in the database. This function ensures that the invite link is valid, not expired, and not blocked before returning user details. Read-only: performs no invite-attempt writes.
 *
 * @throws      Error — Token is required, Error — Invite not found or already used, Error — This invite link has been blocked. Please contact the administrator., Error — This invite link has expired. Please request a new one., Error — Too many failed attempts. This invite has been blocked.
 * @sideEffects none — read-only preview (the invite_attempts write was removed in the registration hardening batch)
 * @stability   stable
 * @calls       adminDb.from('people')
 * @cil-generated
 */
// Registration/invitation hardening: the per-call invite_attempts write was removed entirely; MAX_ATTEMPTS is kept only to surface the blocked state on legacy rows.
export const validateToken = createPublicHandler(async (_ctx, _body) => {
  const token = _ctx.query?.token as string | undefined
  if (!token) throw new Error('Token is required')

  const { data: person } = await adminDb
    .from('people')
    .select('id, email, account_id, role_id, status, data, account:accounts!people_account_id_fkey(display_name), role:roles!people_role_id_fkey(slug, name)')
    .filter('data->>invite_token', 'eq', token)
    .in('status', ['invited', 'pending'])
    .single()

  if (!person) {
    throw new Error('Invite not found or already used')
  }

  const meta = person.data || {}

  if (meta.invite_blocked_at) {
    throw new Error('This invite link has been blocked. Please contact the administrator.')
  }

  if (meta.invite_expires_at && new Date(meta.invite_expires_at) < new Date()) {
    throw new Error('This invite link has expired. Please request a new one.')
  }

  // Read-only preview: no invite_attempts increment and no auto-block write.
  // Previously every preview call — including harmless page refreshes —
  // counted toward MAX_ATTEMPTS and could self-block the invite. Legacy rows
  // that already carry a counter at/above the cap still surface blocked.
  if ((meta.invite_attempts || 0) >= MAX_ATTEMPTS) {
    throw new Error('Too many failed attempts. This invite has been blocked.')
  }

  const account = Array.isArray(person.account) ? person.account[0] : person.account
  const role = Array.isArray(person.role) ? person.role[0] : person.role

  return {
    email: person.email,
    full_name: person.full_name ?? null,
    account_name: account?.display_name ?? null,
    role_name: role?.name ?? null,
    kind: meta.invite_kind,
  }
})
// body email never steers placement; role/account/join-target are server-resolved in the RPC
/**
 * The completeRegistration function handles the registration process for users, either linking them to an existing account or creating a new account based on the provided path. It ensures that all required fields are validated and manages role assignments and rate limiting.
 *
 * @throws      Error — Authentication required; Error — app and path are required; Error (400) — RPC placement errors from complete_registration_placement.
 * @sideEffects Rate limit checks; placement writes happen inside the complete_registration_placement RPC (migration 052); emits registration.completed audit.
 * @stability   stable
 * @calls       adminDb.rpc('complete_registration_placement'), checkRateLimit, getClientGeo
 * @cil-generated
 */
// Registration/invitation hardening: previously bound people rows by client-supplied email (identity spoofing), accepted client role_slug/target_account_id, and reported success on zero-row updates. Placement now lives in the service-role-only RPC from migration 052.
export const completeRegistration = createHandler(async (ctx, body) => {
  if (!ctx.principal || ctx.principal.id === 'anonymous') {
    throw new Error('Authentication required')
  }
  const { path, account_name, email, app } = body ?? {}

  if (!app || !path) {
    throw new Error('app and path are required')
  }

  // Registration chokepoint: deny blocklisted email / domain / client IP
  // before any placement work. Fails open pre-049. The body email is used
  // ONLY here — binding below is always ctx.principal.id.
  const clientGeo = getClientGeo(ctx)
  await checkRegistrationBlocklist(ctx, email || ctx.principal.email || '', clientGeo.ip)

  // Rate limits keyed by the server-resolved person plus the client IP —
  // a client-supplied email can no longer mint fresh limiter buckets.
  await checkRateLimit(ctx, 'registration', { identifier: `p:${ctx.principal.id}` })
  if (clientGeo.ip) {
    await checkRateLimit(ctx, 'registration', { identifier: `ip:${clientGeo.ip}` })
  }
  if (path === 'new_account') {
    // Preserve the account-creation abuse cap (config: rate_limits.account_create).
    await checkRateLimit(ctx, 'account_create', { identifier: `p:${ctx.principal.id}` })
    if (clientGeo.ip) {
      await checkRateLimit(ctx, 'account_create', { identifier: `ip:${clientGeo.ip}` })
    }
  }

  // All placement logic lives in the service-role-only RPC (migration 052):
  // app policy resolution, role allowlist/non-system validation, account
  // creation, domain-join targeting, and the role_id IS NULL idempotency
  // precondition are enforced atomically there.
  const { data: rpcResult, error: rpcError } = await adminDb.rpc('complete_registration_placement', {
    p_person_id: ctx.principal.id,
    p_app_slug: app,
    p_path: path,
    p_account_name: account_name ?? null,
    // The registration host decides the new account's brand — resolved and
    // stamped inside the RPC so placement writes stay in the RPC boundary.
    p_host: ctx.headers?.['host'] ?? null,
  })

  if (rpcError || !rpcResult) {
    const err: any = new Error(rpcError?.message || 'Registration placement failed')
    err.statusCode = 400
    throw err
  }

  const placement = typeof rpcResult === 'string' ? JSON.parse(rpcResult) : rpcResult

  void recordRegistrationGeo(ctx.principal.id, ctx)
  await emitLog(ctx, 'registration.completed', { type: 'person', id: ctx.principal.id }, {
    after: {
      app,
      path,
      status: placement.status,
      account_slug: placement.account_slug,
      role_slug: placement.role_slug,
    }
  })

  // Response shape preserved: {status, account_slug} plus role_slug and a
  // `next` passthrough when the RPC supplies them.
  const result: Record<string, any> = {
    status: placement.status,
    account_slug: placement.account_slug ?? null,
  }
  if (placement.role_slug !== undefined) result.role_slug = placement.role_slug
  if (placement.next !== undefined) result.next = placement.next
  return result
})
/**
 * Creates an invite for a user to join an account, ensuring proper authentication and authorization. It validates input and checks for existing users before generating an invite token.
 *
 * @throws      Error — Authentication required, Error — email, account_id, and role_slug are required, Error — Insufficient permissions — *_admin role required to create invites, Error — Role '{role_slug}' is not permitted in this context, Error — Role '{role_slug}' not found, Error — A person with this email already exists or has a pending invite for this account, Error — Failed to create invite.
 * @sideEffects Writes to the database to create an invite and may read from multiple tables.
 * @stability   stable
 * @calls       adminDb.from('people'), adminDb.from('roles'), adminDb.from('types'), adminDataCreate, checkRateLimit, generateToken
 * @cil-generated
 */
// Registration/invitation hardening: caller admin check is now account-scoped via requireAccountAdmin; role_slug must be non-system and inside the app's server-resolved allowlist; base_url passes the origin allowlist instead of a yourapp.com fallback.
export const createInvite = createHandler(async (ctx, body) => {
  if (!ctx.principal || ctx.principal.id === 'anonymous') {
    throw new Error('Authentication required')
  }

  const { full_name, email, account_id, role_slug, base_url } = body
  if (!email || !account_id || !role_slug) {
    throw new Error('email, account_id, and role_slug are required')
  }

  // Caller must be system_admin or an *_admin bound to THIS account.
  requireAccountAdmin(ctx, account_id)

  // Abuse control: cap invites per account (config: rate_limits.invite_create).
  await checkRateLimit(ctx, 'invite_create', { identifier: `acct:${account_id}` })

  // Privileged roles can never be assigned through invites.
  if (role_slug === 'system_admin') {
    throw new Error(`Role 'system_admin' is not permitted in this context`)
  }

  // Server-side allowlist: the calling app's config.invitation.allowed_roles
  // when declared, else config.registration.roles. Client-supplied
  // allowed_role_slugs are no longer consulted.
  const allowlist = await resolveAppRoleAllowlist(ctx, body)
  if (allowlist && !allowlist.includes(role_slug)) {
    throw new Error(`Role '${role_slug}' is not permitted in this context`)
  }

  const { data: roleRows } = await adminDb
    .from('roles')
    .select('id, slug, is_system')
    .eq('slug', role_slug)
    .limit(1)

  const resolvedRole = roleRows?.[0]
  if (!resolvedRole) throw new Error(`Role '${role_slug}' not found`)
  if (resolvedRole.is_system === true) {
    throw new Error(`Role '${role_slug}' is not permitted in this context`)
  }

  const { data: existing } = await adminDb
    .from('people')
    .select('id')
    .eq('email', email)
    .eq('account_id', account_id)
    .in('status', ['invited', 'active'])
    .single()

  if (existing) {
    throw new Error('A person with this email already exists or has a pending invite for this account')
  }

  const { data: personType } = await adminDb
    .from('types')
    .select('id, design_schema, validation_schema')
    .eq('kind', 'person')
    .eq('slug', 'person')
    .single()

  const token = generateToken()
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 86400 * 1000).toISOString()
  const stubName = (full_name && full_name.trim()) ? full_name.trim() : email.split('@')[0]

  const adminCtx = { ...ctx, query: { ...ctx.query, entity: 'people' } }
  const stub = await adminDataCreate(adminCtx, {
    entity: 'people',
    type_id: personType?.id,
    account_id,
    full_name: stubName,
    email,
    role_id: resolvedRole.id,
    status: 'invited',
    is_active: true,
    data: {
      invite_token: token,
      invite_kind: 'invite',
      invite_expires_at: expiresAt,
      invite_attempts: 0,
      invite_blocked_at: null,
      invite_invited_by: ctx.principal.id,
    },
  })

  if (!stub) throw new Error('Failed to create invite')

  const appBaseUrl = resolveInviteBaseUrl(base_url)
  const inviteUrl = `${appBaseUrl}/register?t=${token}`

  // Brand of the invite email comes from the validated origin the inviter is
  // on — correct for both customer-account and staff (spine-system) invites.
  const brandsCfg = await getBrandsConfig()
  let inviteBrandHost = ''
  try { inviteBrandHost = new URL(appBaseUrl).hostname } catch {}
  const inviteBrand = brandForHost(brandsCfg, inviteBrandHost)

  // Email delivery: when an 'invite-email' integration (or the shared
  // 'transactional-email' one) is configured, send the invite through the
  // outbound broker. Always return invite_url so the UI can fall back to a
  // copyable link when no provider is configured.
  let emailSent = false
  try {
    const { data: emailIntegrations } = await adminDb
      .from('integrations')
      .select('id, slug, config, account_id')
      .in('slug', ['invite-email', 'transactional-email'])
      .eq('is_active', true)
      .or(`account_id.eq.${account_id},account_id.is.null`)

    const emailIntegration =
      (emailIntegrations || []).find((i: any) => i.slug === 'invite-email' && i.account_id === account_id) ||
      (emailIntegrations || []).find((i: any) => i.slug === 'invite-email') ||
      (emailIntegrations || []).find((i: any) => i.account_id === account_id) ||
      (emailIntegrations || [])[0]

    if (emailIntegration) {
      const { data: account } = await adminDb
        .from('accounts')
        .select('display_name')
        .eq('id', account_id)
        .maybeSingle()
      const accountName = account?.display_name || ''

      // Email body: integration.config.templates.invite overrides the default,
      // and templates['invite:<brand>'] overrides that per brand.
      // Template placeholders are {{to_name}}, {{invite_url}}, {{account_name}},
      // {{expires_at}}, {{brand_name}}, {{brand_url}}, {{brand_logo_url}}.
      const tpl =
        emailIntegration.config?.templates?.[`invite:${inviteBrand.slug}`] ||
        emailIntegration.config?.templates?.invite || {}
      const render = (s: string) =>
        (s || '')
          .replace(/\{\{\s*to_name\s*\}\}/g, escapeHtml(stubName))
          .replace(/\{\{\s*invite_url\s*\}\}/g, escapeHtml(inviteUrl))
          .replace(/\{\{\s*account_name\s*\}\}/g, escapeHtml(accountName))
          .replace(/\{\{\s*expires_at\s*\}\}/g, escapeHtml(expiresAt))
          .replace(/\{\{\s*brand_name\s*\}\}/g, escapeHtml(inviteBrand.name))
          .replace(/\{\{\s*brand_url\s*\}\}/g, escapeHtml(inviteBrand.site_url || appBaseUrl))
          .replace(/\{\{\s*brand_logo_url\s*\}\}/g, escapeHtml(inviteBrand.email_logo_url || ''))
      const subject = render(tpl.subject) ||
        `You're invited to join ${escapeHtml(accountName) || 'your team'}`
      const html = render(tpl.html) ||
        `<p>Hi${stubName ? ' ' + escapeHtml(stubName) : ''},</p>` +
        `<p>You've been invited to join <strong>${escapeHtml(accountName) || 'the team'}</strong>.</p>` +
        `<p><a href="${inviteUrl}">Accept your invitation</a></p>` +
        `<p>This link expires ${escapeHtml(expiresAt) || 'soon'}. If the button doesn't work, paste this into your browser:<br>${inviteUrl}</p>`

      await checkRateLimit(ctx, 'invite_email', { identifier: `acct:${account_id}` })
      const result = await executeOutbound(ctx, {
        integration_slug: emailIntegration.slug,
        action_config: {
          to: email,
          subject,
          html,
          invite_url: inviteUrl,
          to_name: stubName,
          account_name: accountName,
          invited_by: ctx.principal.id,
          expires_at: expiresAt,
          ...(inviteBrand.email_from ? { from: inviteBrand.email_from } : {}),
        }
      })
      emailSent = !!result?.success
    }
  } catch (err: any) {
    console.warn('invite email send failed:', err?.message)
  }

  await emitLog(ctx, 'invite.created', { type: 'person', id: stub.id }, {
    after: { email, full_name: stubName, account_id, role_slug, expires_at: expiresAt, email_sent: emailSent }
  })

  return { id: stub.id, token, invite_url: inviteUrl, expires_at: expiresAt, email_sent: emailSent }
})
/**
 * Lists invites for a user based on their account and roles, ensuring authentication and appropriate permissions. It filters invites based on role slugs and returns relevant invite details.
 *
 * @throws      Error — Authentication required, Error — Account scope required, Error — Database error
 * @sideEffects Database read operations
 * @stability   stable
 * @calls       adminDb.from('roles'), adminDb.from('people')
 * @cil-generated
 */
export const listInvites = createHandler(async (ctx, _body) => {
  if (!ctx.principal || ctx.principal.id === 'anonymous') {
    throw new Error('Authentication required')
  }

  const isSystemAdmin = ctx.principal.permissions?.includes('system')
  const { account_id: queryAccountId, role_slugs: queryRoleSlugs } = ctx.query || {}

  const roleSlugsFilter: string[] | null = queryRoleSlugs
    ? (queryRoleSlugs as string).split(',').map((s: string) => s.trim()).filter(Boolean)
    : null

  let roleIdFilter: string[] | null = null
  if (roleSlugsFilter && roleSlugsFilter.length > 0) {
    const { data: roleRows } = await adminDb
      .from('roles')
      .select('id, slug')
      .in('slug', roleSlugsFilter)

    roleIdFilter = (roleRows || []).map(r => r.id)
    if (roleIdFilter.length === 0) {
      return []
    }
  }

  let query = adminDb
    .from('people')
    .select(`
      id, email, full_name, status, created_at, updated_at,
      account_id, role_id,
      account:accounts!people_account_id_fkey(id, slug, display_name),
      role:roles!people_role_id_fkey(id, slug, name),
      data
    `)
    .not('data->>invite_kind', 'is', null)
    .order('created_at', { ascending: false })

  if (!isSystemAdmin) {
    // A caller-supplied account_id is never honored for tenant callers —
    // they may only list invites for their own account, as its admin.
    const scopedAccountId = ctx.accountId
    if (!scopedAccountId) throw new Error('Account scope required')
    requireAccountAdmin(ctx, scopedAccountId)
    query = query.eq('account_id', scopedAccountId)
  } else if (queryAccountId) {
    query = query.eq('account_id', queryAccountId)
  }

  if (roleIdFilter) {
    query = query.in('role_id', roleIdFilter)
  }

  const { data, error } = await query
  if (error) throw error

  return (data || []).map(row => ({
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    status: row.status,
    kind: (row.data as any)?.invite_kind,
    expires_at: (row.data as any)?.invite_expires_at,
    blocked_at: (row.data as any)?.invite_blocked_at,
    created_at: row.created_at,
    account: Array.isArray(row.account) ? row.account[0] : row.account,
    role: Array.isArray(row.role) ? row.role[0] : row.role,
  }))
})
/**
 * The revokeInvite function revokes an invitation for a person by updating their status in the database. It ensures that only authenticated users can perform this action and that the person exists in a valid state before revocation.
 *
 * @throws      Error — Authentication required, person_id is required, Invite not found or already processed, error from database update
 * @sideEffects Updates the status of a person in the database, emits a log event
 * @stability   stable
 * @calls       adminDb.from('people'), emitLog
 * @cil-generated
 */
// Registration/invitation hardening: now requires an admin of the target person's account (or system_admin) via requireAccountAdmin — previously any authenticated principal could revoke.
export const revokeInvite = createHandler(async (ctx, body) => {
  if (!ctx.principal || ctx.principal.id === 'anonymous') throw new Error('Authentication required')

  const { person_id } = body
  if (!person_id) throw new Error('person_id is required')

  const { data: person } = await adminDb
    .from('people')
    .select('id, account_id, status, data')
    .eq('id', person_id)
    .in('status', ['invited', 'pending'])
    .single()

  if (!person) throw new Error('Invite not found or already processed')

  // Scope: only an admin of the invite's own account (or system_admin).
  requireAccountAdmin(ctx, person.account_id)

  const { error } = await adminDb
    .from('people')
    .update({
      status: 'inactive',
      is_active: false,
      data: { ...(person.data as any), invite_token: null },
      updated_at: new Date().toISOString(),
    })
    .eq('id', person_id)

  if (error) throw error

  await emitLog(ctx, 'invite.revoked', { type: 'person', id: person_id }, {})

  return { success: true }
})
/**
 * The reinvite constant handles the process of inviting a person by generating a new invite token and updating their status in the database. It ensures that only authenticated users can perform this action.
 *
 * @throws      Error — Authentication required, person_id is required, Person not found, error from database update.
 * @sideEffects Writes to the 'people' table in the database and emits a log entry.
 * @stability   stable
 * @calls       adminDb.from('people'), generateToken, emitLog
 * @cil-generated
 */
// Registration/invitation hardening: requires an admin of the target person's account via requireAccountAdmin, restricts reinvite to invited/inactive people, and passes base_url through the origin allowlist.
export const reinvite = createHandler(async (ctx, body) => {
  if (!ctx.principal || ctx.principal.id === 'anonymous') throw new Error('Authentication required')

  const { person_id, base_url } = body
  if (!person_id) throw new Error('person_id is required')

  const { data: person } = await adminDb
    .from('people')
    .select('id, email, account_id, role_id, data, status')
    .eq('id', person_id)
    .single()

  if (!person) throw new Error('Person not found')

  // Scope: only an admin of the person's account (or system_admin), and only
  // invited/inactive people may be re-invited — never an active member.
  requireAccountAdmin(ctx, person.account_id)
  if (person.status !== 'invited' && person.status !== 'inactive') {
    throw new Error('Person is not in a reinvitable state')
  }

  const newToken = generateToken()
  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 86400 * 1000).toISOString()

  const { error } = await adminDb
    .from('people')
    .update({
      status: 'invited',
      is_active: true,
      data: {
        ...(person.data as any),
        invite_token: newToken,
        invite_kind: 'invite',
        invite_expires_at: expiresAt,
        invite_attempts: 0,
        invite_blocked_at: null,
        invite_invited_by: ctx.principal.id,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', person_id)

  if (error) throw error

  const appBaseUrl = resolveInviteBaseUrl(base_url)
  const inviteUrl = `${appBaseUrl}/register?t=${newToken}`

  await emitLog(ctx, 'invite.reinvited', { type: 'person', id: person_id }, {
    after: { email: person.email, expires_at: expiresAt }
  })

  return { token: newToken, invite_url: inviteUrl, expires_at: expiresAt }
})
/**
 * Approves an access request for a person by updating their status to active. It ensures that the request is authenticated and that the person exists in a pending state before proceeding.
 *
 * @throws      Error — Authentication required, person_id is required, Access request not found or already processed, error from database update
 * @sideEffects Writes to the 'people' table in the database and emits a log event.
 * @stability   stable
 * @calls       adminDb.from('people'), emitLog
 * @cil-generated
 */
// Registration/invitation hardening: now requires an admin of the target person's account (or system_admin) via requireAccountAdmin — previously any authenticated principal could approve.
export const approve = createHandler(async (ctx, body) => {
  if (!ctx.principal || ctx.principal.id === 'anonymous') throw new Error('Authentication required')

  const { person_id } = body
  if (!person_id) throw new Error('person_id is required')

  const { data: person } = await adminDb
    .from('people')
    .select('id, email, account_id, data')
    .eq('id', person_id)
    .eq('status', 'pending')
    .single()

  if (!person) throw new Error('Access request not found or already processed')

  // Scope: only an admin of the requesting account (or system_admin).
  requireAccountAdmin(ctx, person.account_id)

  const { invite_token, invite_kind, invite_expires_at, invite_attempts, invite_blocked_at, invite_invited_by, ...remainingData } =
    (person.data as any) || {}

  const { error } = await adminDb
    .from('people')
    .update({
      status: 'active',
      is_active: true,
      data: remainingData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', person_id)

  if (error) throw error

  await emitLog(ctx, 'invite.approved', { type: 'person', id: person_id }, {
    after: { email: person.email, approved_by: ctx.principal.id }
  })

  return { success: true }
})
/**
 * Blocks an invite for a specified person by updating their record in the database. This function ensures that only authenticated users can perform this action.
 *
 * @throws      Error — Authentication required, person_id is required, Person not found, or database update error.
 * @sideEffects Writes to the 'people' table in the database and emits a log event.
 * @stability   stable
 * @calls       adminDb.from('people'), emitLog
 * @cil-generated
 */
// Registration/invitation hardening: now requires an admin of the target person's account (or system_admin) via requireAccountAdmin — previously any authenticated principal could block.
export const blockInvite = createHandler(async (ctx, body) => {
  if (!ctx.principal || ctx.principal.id === 'anonymous') throw new Error('Authentication required')

  const { person_id } = body
  if (!person_id) throw new Error('person_id is required')

  const { data: person } = await adminDb
    .from('people')
    .select('id, email, account_id, data')
    .eq('id', person_id)
    .single()

  if (!person) throw new Error('Person not found')

  // Scope: only an admin of the person's account (or system_admin).
  requireAccountAdmin(ctx, person.account_id)

  const meta = (person.data as any) || {}

  const { error } = await adminDb
    .from('people')
    .update({
      data: {
        ...meta,
        invite_blocked_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', person_id)

  if (error) throw error

  await emitLog(ctx, 'invite.blocked', { type: 'person', id: person_id }, {
    after: { email: person.email, blocked_by: ctx.principal.id }
  })

  return { success: true }
})
/**
 * The deny function processes an access request by marking a person as inactive and logging the action. It ensures that only authenticated users can deny requests and that the specified person exists and is pending.
 *
 * @throws      Error — Authentication required, person_id is required, Access request not found or already processed, error from database update
 * @sideEffects Updates the database record for the person and emits a log event.
 * @stability   stable
 * @calls       adminDb.from('people'), emitLog
 * @cil-generated
 */
// Registration/invitation hardening: now requires an admin of the target person's account (or system_admin) via requireAccountAdmin — previously any authenticated principal could deny.
export const deny = createHandler(async (ctx, body) => {
  if (!ctx.principal || ctx.principal.id === 'anonymous') throw new Error('Authentication required')

  const { person_id } = body
  if (!person_id) throw new Error('person_id is required')

  const { data: person } = await adminDb
    .from('people')
    .select('id, email, account_id, data')
    .eq('id', person_id)
    .eq('status', 'pending')
    .single()

  if (!person) throw new Error('Access request not found or already processed')

  // Scope: only an admin of the requesting account (or system_admin).
  requireAccountAdmin(ctx, person.account_id)

  const { error } = await adminDb
    .from('people')
    .update({
      status: 'inactive',
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', person_id)

  if (error) throw error

  await emitLog(ctx, 'invite.denied', { type: 'person', id: person_id }, {
    after: { email: person.email, denied_by: ctx.principal.id }
  })

  return { success: true }
})
/**
 * The handler processes various actions related to user invites and member management based on the provided context and body. It serves as a centralized entry point for handling invite-related operations in the application.
 *
 * @throws      Error — Unknown action: {action}
 * @sideEffects none
 * @stability   stable
 * @calls       checkFirstUser, checkDomain, validateToken, completeRegistration, createInvite, listInvites, revokeInvite, reinvite, blockInvite, approve, deny, listMembers, updateMember, deactivateMember
 * @cil-generated
 */
export const handler = createPublicHandler(async (ctx, body) => {
  const action = ctx.query?.action

  switch (action) {
    case 'check-first-user':    return await checkFirstUser(ctx, body)
    case 'check-domain':        return await checkDomain(ctx, body)
    case 'validate-token':      return await validateToken(ctx, body)
    case 'complete-registration': return await completeRegistration(ctx, body)
    case 'create-invite':       return await createInvite(ctx, body)
    case 'list-invites':        return await listInvites(ctx, body)
    case 'revoke-invite':       return await revokeInvite(ctx, body)
    case 'reinvite':            return await reinvite(ctx, body)
    case 'block-invite':        return await blockInvite(ctx, body)
    case 'approve':             return await approve(ctx, body)
    case 'deny':                return await deny(ctx, body)
    case 'list-members':        return await listMembers(ctx, body)
    case 'update-member':       return await updateMember(ctx, body)
    case 'deactivate-member':   return await deactivateMember(ctx, body)
    default:
      throw new Error(`Unknown action: ${action}`)
  }
})

// ─── Member management actions (runtime CRUD via admin-data) ─────────────────

/**
 * Determines if a user has the necessary permissions to manage members based on their principal context. This function is essential for enforcing access control in member management operations.
 *
 * @inputSpec
 *   ctx: any (required) — the context object containing user principal information.
 * @outputSpec  boolean — returns true if the user can manage members, otherwise false.
 * @sideEffects none
 * @stability   stable
 * @calls       isAdminRole
 * @cil-generated
 */
function canManageMembers(ctx: any) {
  if (!ctx.principal || ctx.principal.id === 'anonymous') return false
  if (ctx.principal.permissions?.includes('system')) return true
  return (ctx.principal.roles || []).some((r: string) => isAdminRole(r))
}

/**
 * Lists members associated with a specific account, requiring admin permissions. It retrieves member data and their roles from the database.
 *
 * @macro       Async function that retrieves and formats member data for a given account.
 * @micro       Utilizes an admin context to fetch member records and their associated roles from the database.
 * @inputSpec
 *   ctx: any (required) — the context object containing query and principal information.
 *   body: any (required) — the request body containing account_id.
 * @outputSpec  Promise<{ data: Array<any> }> — an object containing an array of member records with their roles.
 * @throws      Error — Insufficient permissions — *_admin role required to list members, Error — account_id is required
 * @sideEffects Calls to the database to retrieve member and role information.
 * @stability   stable
 * @calls       canManageMembers, adminDataList, adminDb.from
 * @cil-generated
 */
// Registration/invitation hardening: the queried account_id is now bound to the caller via requireAccountAdmin — previously any *_admin could list members of any account.
async function listMembers(ctx: any, body: any) {
  if (!canManageMembers(ctx)) {
    throw new Error('Insufficient permissions — *_admin role required to list members')
  }

  const accountId = ctx.query?.account_id || body?.account_id || ctx.principal?.accountId
  if (!accountId) throw new Error('account_id is required')

  // Scope: only an admin of the queried account (or system_admin).
  requireAccountAdmin(ctx, accountId)

  const adminCtx = { ...ctx, query: { ...ctx.query, entity: 'people', type_slug: 'person', account_id: accountId } }
  const records = await adminDataList(adminCtx, {})

  const roleIds = (records || [])
    .map((r: any) => r.role_id)
    .filter(Boolean)
  const roleMap: Record<string, { slug: string; name: string }> = {}
  if (roleIds.length) {
    const { data: roles } = await adminDb
      .from('roles')
      .select('id, slug, name')
      .in('id', roleIds)
    for (const r of roles || []) {
      roleMap[r.id] = { slug: r.slug, name: r.name }
    }
  }

  const data = (records || []).map((r: any) => ({
    ...r,
    role: r.role_id ? roleMap[r.role_id] || { id: r.role_id } : null
  }))

  return { data }
}

/**
 * Resolves the ID of a role based on its slug. This function is essential for retrieving role identifiers in the application.
 *
 * @inputSpec
 *   slug: string (required) — the unique identifier for the role.
 * @outputSpec  Promise<string> — the ID of the resolved role.
 * @throws      Error — Role 'slug' not found
 * @sideEffects none
 * @stability   stable
 * @calls       adminDb.from('roles')
 * @cil-generated
 */
// Registration/invitation hardening: rejects system_admin and is_system roles and enforces an optional server-resolved allowlist — arbitrary role_slug (incl. system_admin) could previously be assigned to any member.
async function resolveRoleId(slug: string, allowlist?: string[] | null) {
  if (slug === 'system_admin') {
    throw new Error(`Role 'system_admin' is not permitted in this context`)
  }
  const { data: roleRows } = await adminDb
    .from('roles')
    .select('id, slug, is_system')
    .eq('slug', slug)
    .limit(1)
  const resolved = roleRows?.[0]
  if (!resolved) throw new Error(`Role '${slug}' not found`)
  if (resolved.is_system === true) {
    throw new Error(`Role '${slug}' is not permitted in this context`)
  }
  if (allowlist && !allowlist.includes(slug)) {
    throw new Error(`Role '${slug}' is not permitted in this context`)
  }
  return resolved.id
}

/**
 * Updates the member's details such as full name and role based on the provided input. It ensures that the caller has the necessary permissions before making any changes.
 *
 * @macro       Function responsible for updating member information in the system.
 * @micro       Validates input fields and constructs an update record before making a database call.
 * @inputSpec
 *   ctx: any (required) — the context containing user permissions and request details.
 *   body: any (required) — the object containing member update details including person_id, full_name, and role_slug.
 * @outputSpec  Promise<{ success: boolean, data: any }> — indicates success and returns the updated member data.
 * @throws      Error — Insufficient permissions, person_id is required, No update fields provided, Failed to update member
 * @sideEffects Database update operation, logging of the update event
 * @stability   stable
 * @calls       canManageMembers, resolveRoleId, adminDataUpdate, emitLog
 * @cil-generated
 */
// Registration/invitation hardening: resolves the target person's account first and requires an admin of THAT account (or system_admin) via requireAccountAdmin — previously any *_admin could update members cross-account and assign any role incl. system_admin.
async function updateMember(ctx: any, body: any) {
  if (!canManageMembers(ctx)) {
    throw new Error('Insufficient permissions — *_admin role required to update members')
  }

  const { person_id, full_name, role_slug } = body
  if (!person_id) throw new Error('person_id is required')

  const { data: target } = await adminDb
    .from('people')
    .select('id, account_id')
    .eq('id', person_id)
    .single()

  if (!target) throw new Error('Person not found')

  // Scope: only an admin of the member's own account (or system_admin).
  requireAccountAdmin(ctx, target.account_id)

  const recordData: any = {}
  if (full_name !== undefined) recordData.full_name = full_name
  if (role_slug !== undefined) {
    // Non-system roles only; additionally constrained to the member's
    // account-app allowlist when one is declared.
    const allowlist = await roleAllowlistForAccount(target.account_id)
    recordData.role_id = await resolveRoleId(role_slug, allowlist)
  }

  if (Object.keys(recordData).length === 0) {
    throw new Error('No update fields provided')
  }

  const adminCtx = {
    ...ctx,
    query: { ...ctx.query, entity: 'people', id: person_id }
  }

  const updated = await adminDataUpdate(adminCtx, recordData)
  if (!updated) throw new Error('Failed to update member')

  await emitLog(ctx, 'member.updated', { type: 'person', id: person_id }, { after: recordData })
  return { success: true, data: updated }
}

/**
 * Deactivates a member by updating their status to inactive. This function ensures that only users with the appropriate permissions can perform this action.
 *
 * @inputSpec
 *   ctx: any (required) — the context object containing user permissions and query parameters.
 *   body: any (required) — the request body containing the person_id of the member to deactivate.
 * @outputSpec  Promise<{ success: boolean, data: any }> — indicates success and returns the updated member data.
 * @throws      Error — Insufficient permissions — *_admin role required to deactivate members, Error — person_id is required, Error — Failed to deactivate member
 * @sideEffects Updates the member's status in the database, emits a log event for the deactivation.
 * @stability   stable
 * @calls       canManageMembers, adminDataUpdate, emitLog
 * @cil-generated
 */
// Registration/invitation hardening: resolves the target person's account first and requires an admin of THAT account (or system_admin) via requireAccountAdmin — previously any *_admin could deactivate members cross-account.
async function deactivateMember(ctx: any, body: any) {
  if (!canManageMembers(ctx)) {
    throw new Error('Insufficient permissions — *_admin role required to deactivate members')
  }

  const { person_id } = body
  if (!person_id) throw new Error('person_id is required')

  const { data: target } = await adminDb
    .from('people')
    .select('id, account_id')
    .eq('id', person_id)
    .single()

  if (!target) throw new Error('Person not found')

  // Scope: only an admin of the member's own account (or system_admin).
  requireAccountAdmin(ctx, target.account_id)

  const adminCtx = {
    ...ctx,
    query: { ...ctx.query, entity: 'people', id: person_id }
  }

  const updated = await adminDataUpdate(adminCtx, {
    status: 'inactive',
    is_active: false,
  })
  if (!updated) throw new Error('Failed to deactivate member')

  await emitLog(ctx, 'member.deactivated', { type: 'person', id: person_id }, {})
  return { success: true, data: updated }
}