



















import { createHandler } from './_shared/middleware'
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
export const health = createHandler(async (ctx, _body) => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'auth'
  }
})
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
