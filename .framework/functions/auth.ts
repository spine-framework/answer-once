// CIL[BEGIN stable_id="~/.framework/functions/auth.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/auth.ts"]
// CIL[DOC-MACRO purpose="Authentication edge functions for user context, health checks, and method dispatch"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides createHandler-based Netlify functions for /api/auth (context, health, handler)"]
// CIL[DOC-CONTEXT module="auth" layer="edge" related_files=".framework/functions/_shared/middleware.ts"]
// CIL[DOC-CONTRACT inputs="HTTP request via createHandler" outputs="JSON context, health, or dispatch response" errors="Error" side_effects="database reads"]
// CIL[DOC-MICRO logic_summary="Exports context, health, and handler handlers for auth routes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="api consumers, maintainers"]




















import { createHandler } from './_shared/middleware'
// CIL[DOC-VECTOR type="context" content="purpose='Authentication edge functions for user context, health checks, and method dispatch'; No verified external callers; imports: .framework/functions/_shared/middleware.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/auth.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/functions/auth.ts:context:constant" type="constant" identity="context" parent="~/.framework/functions/auth.ts"]
// CIL[DOC-MACRO purpose="Fetch authenticated user context with account, role, and permissions"]
// CIL[DOC-RESPONSIBILITY responsibility="Validate principal, load person/account/role from DB, derive permissions, return normalized context object"]
// CIL[DOC-CONTEXT module="auth" layer="edge" related_files=".framework/functions/_shared/middleware.ts,.framework/functions/auth.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, _body: unknown" outputs="User context object" errors="Error('Authentication required'), Error('User not found: ...')" side_effects="Supabase DB query for people, accounts, roles; get_account_hierarchy RPC"]
// CIL[DOC-MICRO logic_summary="Require principal, fetch person with joins, normalize account and role, load account hierarchy, compute permissions based on role, return user context" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const context = createHandler(async (ctx, _body) => {
  
  if (!ctx.principal || ctx.principal.id === 'anonymous') {
    throw new Error('Authentication required')
  }

  console.log('Backend: Fetching user context for person:', ctx.principal.id)
  const { data: personData, error: personError } = await ctx.db
    .from('people')
    .select(`
      id,
      email,
      full_name,
      avatar_url,
      account_id,
      role_id,
      status,
      account:accounts!people_account_id_fkey(
        id,
        slug,
        display_name,
        parent_id
      ),
      role:roles!people_role_id_fkey(
        id,
        slug,
        name,
        is_system,
        permissions
      )
    `)
    .eq('id', ctx.principal.id)
    .eq('is_active', true)
    .single()

  if (personError) {
    console.error('Backend: Error fetching person:', personError)
  }

  if (!personData) {
    throw new Error('User not found: ' + ctx.principal.id)
  }

  console.log('Backend: Person data found:', {
    id: personData.id,
    email: personData.email,
    account_id: personData.account_id,
    role_id: personData.role_id
  })

  
  const account = Array.isArray(personData.account) ? personData.account[0] : personData.account
  const role = Array.isArray(personData.role) ? personData.role[0] : personData.role

  
  let accessibleAccounts: any[] = []
  if (personData.id) {
    try {
      // get_accessible_accounts resolves the person's own account plus all
      // descendants via account_paths (all accounts for system_admin).
      const { data: accessibleIds, error: hierarchyError } = await Promise.race([
        ctx.db.rpc('get_accessible_accounts', {
          actor_id: personData.id
        }),
        new Promise<never>((_resolve, reject) =>
          setTimeout(() => reject(new Error('get_accessible_accounts timed out')), 5000)
        )
      ])

      if (hierarchyError) {
        console.warn('Backend: get_accessible_accounts error:', hierarchyError)
      } else {
        const accountIds = (accessibleIds || [])
          .map((r: any) => r.account_id ?? r)
          .filter(Boolean)
        if (accountIds.length) {
          const { data: rows } = await ctx.db
            .from('accounts')
            .select('id, slug, display_name, parent_id')
            .in('id', accountIds)
          accessibleAccounts = rows || []
        }
      }
    } catch (e) {
      console.warn('Backend: get_accessible_accounts failed or timed out:', e)
    }

    console.log('Backend: Found', accessibleAccounts.length, 'accessible accounts')
  }

  
  let effectivePermissions = []
  const roleSlug = role?.slug
  
  if (roleSlug === 'system_admin') {
    effectivePermissions = ['read', 'write', 'admin', 'system']
  } else if (role?.permissions && Array.isArray(role.permissions)) {
    effectivePermissions = role.permissions
  }

  console.log('Backend: User context complete:', {
    id: personData.id,
    email: personData.email,
    account: account?.slug,
    role: roleSlug,
    permissionsCount: effectivePermissions.length
  })

  
  return {
    id: personData.id,
    email: personData.email,
    full_name: personData.full_name,
    account_id: personData.account_id,
    account: account,
    roles: [roleSlug].filter(Boolean),
    permissions: effectivePermissions,
    is_system_admin: roleSlug === 'system_admin',
    status: personData.status ?? 'active',
    accessible_accounts: accessibleAccounts
  }
})
// CIL[DOC-VECTOR type="context" content="purpose='Fetch authenticated user context with account, role, and permissions'; No verified external callers; imports: .framework/functions/_shared/middleware.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/auth.ts:context:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/auth.ts:health:constant" type="constant" identity="health" parent="~/.framework/functions/auth.ts"]
// CIL[DOC-MACRO purpose="Health check endpoint for auth service"]
// CIL[DOC-RESPONSIBILITY responsibility="Return healthy status, timestamp, and service name"]
// CIL[DOC-CONTEXT module="auth" layer="edge" related_files=".framework/functions/_shared/middleware.ts,.framework/functions/auth.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, _body: unknown" outputs="{ status, timestamp, service }" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Return a static healthy payload with current timestamp" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const health = createHandler(async (ctx, _body) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'auth'
  }
})
// CIL[DOC-VECTOR type="context" content="purpose='Health check endpoint for auth service'; No verified external callers; imports: .framework/functions/_shared/middleware.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/auth.ts:health:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/auth.ts:handler:constant" type="constant" identity="handler" parent="~/.framework/functions/auth.ts"]
// CIL[DOC-MACRO purpose="Dispatch incoming auth requests by HTTP method"]
// CIL[DOC-RESPONSIBILITY responsibility="Route GET to context and HEALTH to health, otherwise throw unsupported method"]
// CIL[DOC-CONTEXT module="auth" layer="edge" related_files=".framework/functions/_shared/middleware.ts,.framework/functions/auth.ts"]
// CIL[DOC-CONTRACT inputs="ctx: RequestContext, _body: unknown" outputs="Response from context or health handler" errors="Error('Unsupported method: ...')" side_effects="calls context or health handler"]
// CIL[DOC-MICRO logic_summary="Read method from ctx.query, dispatch to context or health handler" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export const handler = createHandler(async (ctx, _body) => {
  const method = ctx.query?.method || 'GET'

  switch (method) {
    case 'GET':
      return await context(ctx, _body)
    case 'HEALTH':
      return await health(ctx, _body)
    default:
      throw new Error(`Unsupported method: ${method}`)
  }
})
// CIL[DOC-VECTOR type="context" content="purpose='Dispatch incoming auth requests by HTTP method'; No verified external callers; imports: .framework/functions/_shared/middleware.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/auth.ts:handler:constant"]
