
import { adminDb } from './db'
import { Principal } from './principal'
import { CoreContext } from './middleware'


export interface PermissionResult {
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
  fieldPermissions: Record<string, { read: boolean; write: boolean }>
}


type RequestContext = CoreContext

class _PermissionEngineInternal {
  private static instance: _PermissionEngineInternal

  // personId → role slug, short-TTL. resolveFirstSurfacePermissions runs once
  // per record inside list-sanitize loops — without this cache a 20-message
  // poll is 20 sequential people lookups.
  private roleSlugCache = new Map<string, { slug: string | null; expiresAt: number }>()
  private static readonly ROLE_CACHE_TTL_MS = 60_000

  private readonly SECOND_SURFACE_TABLES = new Set([
    'apps', 'app', 'pipelines', 'triggers', 'ai_agents', 'embeddings', 
    'timers', 'integrations', 'roles', 'types', 'prompt_configs'
  ])

  private readonly THIRD_SURFACE_TABLES = new Set([
    'logs', 'pipeline_executions', 'trigger_executions',
    'link_types', 'links'
  ])

  private constructor() {}

  private detectSurface(tableName: string): 'first' | 'second' | 'third' {
    if (this.SECOND_SURFACE_TABLES.has(tableName)) {
      return 'second'
    }
    if (this.THIRD_SURFACE_TABLES.has(tableName)) {
      return 'third'
    }
    return 'first'
  }

  private extractTableName(record: any, typeSlug?: string): string {
    if (record?.table_name) {
      return record.table_name
    }
    
    if (record?.type) {
      return record.type
    }
    
    if (record?.item_type) {
      return record.item_type
    }
    
    if (typeSlug) {
      return typeSlug
    }
    
    return 'unknown'
  }

  static getInstance(): _PermissionEngineInternal {
    if (!_PermissionEngineInternal.instance) {
      _PermissionEngineInternal.instance = new _PermissionEngineInternal()
    }
    return _PermissionEngineInternal.instance
  }
// record_permissions keys are matched verbatim against the seeded roles.slug — nothing normalizes hyphens. 'system-admin' is a dead key that silently denies system_admin; only real slugs (system_admin, member, support, ...) or the 'all' wildcard are valid. Proven by a shipped downstream-app defect (403 on create for system_admin).
  async resolveFirstSurfacePermissions(
    personId: string,
    accountId: string,
    typeSlug: string,
    _action: 'create' | 'read' | 'update' | 'delete',
    designSchema?: any
  ): Promise<PermissionResult> {
    // Default deny result
    const defaultResult: PermissionResult = {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      fieldPermissions: {}
    }

    try {
      // 1. Load type design schema if not provided (pre-stamped on record is preferred)
      let schema = designSchema
      if (!schema || !schema.record_permissions) {
        // Runtime records are stamped with design_schema at creation. We do not
        // fall back to the type definition because the runtime record is the
        // source of truth for its own schema and permissions.
        return defaultResult
      }

      // 2. Get user's role via people.role_id FK — cached by personId so
      //    per-record sanitize calls don't each hit the database.
      const cachedRole = this.roleSlugCache.get(personId)
      let roleSlug: string | null | undefined
      if (cachedRole && cachedRole.expiresAt > Date.now()) {
        roleSlug = cachedRole.slug
      } else {
        const { data: person } = await adminDb
          .from('people')
          .select('role:role_id(slug)')
          .eq('id', personId)
          .eq('is_active', true)
          .single()
        roleSlug = (person?.role as any)?.slug || Array.isArray(person?.role) && (person.role as any)[0]?.slug || null
        this.roleSlugCache.set(personId, { slug: roleSlug, expiresAt: Date.now() + _PermissionEngineInternal.ROLE_CACHE_TTL_MS })
      }
      if (!roleSlug) {
        return defaultResult
      }

      const userRoles = [roleSlug]

      // 3. Evaluate record permissions for each role
      const recordPermissions = schema.record_permissions || {}
      const fieldDefinitions = schema.fields || {}

      let mergedResult: PermissionResult = {
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        fieldPermissions: {}
      }

      // 4. Merge permissions across all roles (union of actions)
      // 'all' is a special wildcard role key: grants access to every authenticated principal
      // that passed RLS, regardless of their named role. Always evaluated.
      const rolesToEvaluate = recordPermissions['all'] ? [...userRoles, 'all'] : userRoles
      for (const role of rolesToEvaluate) {
        const rolePerms = recordPermissions[role]
        if (!rolePerms || !Array.isArray(rolePerms)) continue

        // Merge record permissions using array format: ["create", "read", "update", "delete"]
        mergedResult.canCreate = mergedResult.canCreate || rolePerms.includes('create')
        mergedResult.canRead = mergedResult.canRead || rolePerms.includes('read')
        mergedResult.canUpdate = mergedResult.canUpdate || rolePerms.includes('update')
        mergedResult.canDelete = mergedResult.canDelete || rolePerms.includes('delete')

        // 5. Merge field permissions for this role
        for (const [fieldName, fieldDef] of Object.entries(fieldDefinitions)) {
          const fieldPerms = (fieldDef as any).permissions?.[role]
          if (!fieldPerms || !Array.isArray(fieldPerms)) continue

          if (!mergedResult.fieldPermissions[fieldName]) {
            mergedResult.fieldPermissions[fieldName] = { read: false, write: false }
          }

          // Merge field permissions using array format: ["read", "write"]
          mergedResult.fieldPermissions[fieldName].read = 
            mergedResult.fieldPermissions[fieldName].read || fieldPerms.includes('read')
          mergedResult.fieldPermissions[fieldName].write = 
            mergedResult.fieldPermissions[fieldName].write || fieldPerms.includes('write')
        }
      }

      // 6. Apply record-level access to fields without explicit permissions
      for (const [fieldName, _fieldDef] of Object.entries(fieldDefinitions)) {
        if (!mergedResult.fieldPermissions[fieldName]) {
          mergedResult.fieldPermissions[fieldName] = {
            read: mergedResult.canRead,
            write: mergedResult.canUpdate
          }
        }
      }

      return mergedResult

    } catch (error) {
      console.error('Error resolving permissions:', error)
      return defaultResult
    }
  }
  private canAccessConfigObject(ctx: RequestContext, action: 'create' | 'read' | 'update' | 'delete'): boolean {
    // System admin has full access
    if (this.isSystemAdmin(ctx)) {
      return true
    }
    
    // Only internal machines read config objects — account-bound API keys
    // must not get blanket access to other tenants' config tables.
    if (ctx.principal?.type === 'machine' && action === 'read' && ctx.principal?.isInternal === true) {
      return true
    }
    
    // All other access denied
    return false
  }

  private sanitizeConfigObject(ctx: RequestContext, record: any): any {
    // Debug logging
    console.log('sanitizeConfigObject called with record:', {
      id: record.id,
      slug: record.slug,
      route_prefix: record.route_prefix,
      renderer: record.renderer,
      is_system: record.is_system,
      min_role: record.min_role
    })
    
    // System admin sees everything
    if (this.isSystemAdmin(ctx)) {
      return record
    }
    
    // Internal machines see everything; account-bound keys only see rows
    // that carry their own account_id.
    if (ctx.principal?.type === 'machine') {
      if (ctx.principal?.isInternal === true || record?.account_id === ctx.accountId) {
        return record
      }
      return null
    }
    
    // For apps table, include essential routing fields needed by React app
    // Check multiple app-specific fields to properly identify apps records
    if (record.route_prefix !== undefined || record.renderer !== undefined || 
        (record.slug && (record.is_system !== undefined || record.min_role !== undefined))) {
      console.log('Detected apps record, returning full fields')
      return {
        id: record.id,
        slug: record.slug,
        name: record.name,
        description: record.description,
        route_prefix: record.route_prefix,
        min_role: record.min_role,
        required_roles: record.required_roles,
        preview_domain: record.preview_domain,
        prod_domain: record.prod_domain,
        prod_domains: record.prod_domains,
        preview_route_prefix: record.preview_route_prefix,
        prod_route_prefix: record.prod_route_prefix,
        config: record.config?.analytics ? { analytics: record.config.analytics } : undefined,
        is_active: record.is_active,
        is_system: record.is_system,
        renderer: record.renderer,
        created_at: record.created_at,
        updated_at: record.updated_at
      }
    }
    
    console.log('Not detected as apps record, returning minimal data')
    // Others see minimal data for other config objects
    return {
      id: record.id,
      created_at: record.created_at,
      updated_at: record.updated_at
    }
  }

  private validateConfigObjectPermissions(ctx: RequestContext, action: 'create' | 'read' | 'update' | 'delete'): { valid: boolean; error?: string } {
    if (this.canAccessConfigObject(ctx, action)) {
      return { valid: true }
    }
    
    return { valid: false, error: 'Insufficient permissions for this operation' }
  }

  private canAccessSystemMetadata(ctx: RequestContext, record: any, action: 'create' | 'read' | 'update' | 'delete'): boolean {
    // System admin has full access
    if (this.isSystemAdmin(ctx)) {
      return true
    }
    
    // Only internal machines write system metadata — account-bound keys
    // must not update other tenants' links/system rows.
    if (ctx.principal?.type === 'machine') {
      return ctx.principal?.isInternal === true || record?.account_id === ctx.accountId
    }
    
    // Users can only read their own data
    if (action === 'read') {
      // Check if user owns this record or is related to it
      if (record.created_by === ctx.principal?.id) {
        return true
      }
      
      // Check account ownership
      if (record.account_id && record.account_id === ctx.accountId) {
        return true
      }
      
      // Check person-specific records
      if (record.person_id && record.person_id === ctx.principal?.id) {
        return true
      }
    }
    
    // Users cannot create/update/delete system metadata
    return false
  }

  private sanitizeSystemMetadata(ctx: RequestContext, record: any): any {
    // System admin and internal machines see everything; account-bound
    // keys only see rows stamped with their own account.
    if (this.isSystemAdmin(ctx) ||
        (ctx.principal?.type === 'machine' &&
         (ctx.principal?.isInternal === true || record?.account_id === ctx.accountId))) {
      return record
    }
    
    // Users see only their own data
    if (this.canAccessSystemMetadata(ctx, record, 'read')) {
      return record
    }
    
    // Others see minimal data
    return {
      id: record.id,
      created_at: record.created_at,
      updated_at: record.updated_at
    }
  }

  private validateSystemMetadataPermissions(ctx: RequestContext, record: any, action: 'create' | 'read' | 'update' | 'delete'): { valid: boolean; error?: string } {
    if (this.canAccessSystemMetadata(ctx, record, action)) {
      return { valid: true }
    }
    
    return { valid: false, error: 'Insufficient permissions for this operation' }
  }

  isSystemAdmin(ctx: RequestContext): boolean {
    return ctx.principal?.roles?.some((r: any) => r?.slug === 'system_admin' || r === 'system_admin') || false
  }

  async canAccessRecord(
    ctx: RequestContext,
    record: any,
    action: 'create' | 'read' | 'update' | 'delete'
  ): Promise<boolean> {
    // System admin bypasses all checks
    if (this.isSystemAdmin(ctx)) {
      return true
    }

    // Extract table name to determine surface
    const tableName = this.extractTableName(record)
    const surface = this.detectSurface(tableName)

    // Route to appropriate surface logic
    switch (surface) {
      case 'second':
        return this.canAccessConfigObject(ctx, action)
      
      case 'third':
        return this.canAccessSystemMetadata(ctx, record, action)
      
      case 'first':
      default:
        return this.canAccessFirstSurfaceRecord(ctx, record, action)
    }
  }

  private async canAccessFirstSurfaceRecord(
    ctx: RequestContext,
    record: any,
    action: 'create' | 'read' | 'update' | 'delete'
  ): Promise<boolean> {
    if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
      return false
    }

    // For create operations, check if user can create in this account
    if (action === 'create') {
      const perms = await this.resolveFirstSurfacePermissions(
        ctx.principal.id,
        ctx.accountId,
        record.item_type || record.type || 'unknown',
        'create'
      )
      return perms.canCreate
    }

    // For read/update/delete, check record ownership and permissions
    const perms = await this.resolveFirstSurfacePermissions(
      ctx.principal.id,
      record.account_id || ctx.accountId,
      record.item_type || record.type || 'unknown',
      action
    )

    // Check record-level permission
    const canPerformAction = 
      (action === 'read' && perms.canRead) ||
      (action === 'update' && perms.canUpdate) ||
      (action === 'delete' && perms.canDelete)

    if (!canPerformAction) {
      return false
    }

    // For 'own' access level, check if user owns the record
    const userRoles = ctx.principal?.roles || []
    const hasOwnAccess = userRoles.some(role => {
      const rolePerms = (record.type_schema?.record_permissions || {})[role]
      return rolePerms?.read === 'own' || rolePerms?.update === 'own'
    })

    if (hasOwnAccess && record.created_by !== ctx.principal?.id) {
      return false
    }

    return true
  }

  async sanitizeRecordData(
    ctx: RequestContext,
    record: any,
    typeSlug?: string
  ): Promise<any> {
    // System admin sees everything
    if (this.isSystemAdmin(ctx)) {
      return record
    }

    // Extract table name to determine surface
    const tableName = this.extractTableName(record, typeSlug)
    const surface = this.detectSurface(tableName)

    // Route to appropriate surface logic
    switch (surface) {
      case 'second':
        return this.sanitizeConfigObject(ctx, record)
      
      case 'third':
        return this.sanitizeSystemMetadata(ctx, record)
      
      case 'first':
      default:
        return this.sanitizeFirstSurfaceRecordData(ctx, record, typeSlug || '')
    }
  }

  private async sanitizeFirstSurfaceRecordData(
    ctx: RequestContext,
    record: any,
    typeSlug: string
  ): Promise<any> {
    if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
      // Return minimal data for unauthenticated users
      return {
        id: record.id,
        created_at: record.created_at,
        updated_at: record.updated_at
      }
    }

    // Special case for apps table - return essential routing fields
    if (typeSlug === 'app') {
      console.log('Processing app record, returning routing fields')
      return {
        id: record.id,
        slug: record.slug,
        name: record.name,
        description: record.description,
        route_prefix: record.route_prefix,
        min_role: record.min_role,
        required_roles: record.required_roles,
        preview_domain: record.preview_domain,
        prod_domain: record.prod_domain,
        prod_domains: record.prod_domains,
        preview_route_prefix: record.preview_route_prefix,
        prod_route_prefix: record.prod_route_prefix,
        config: record.config?.analytics ? { analytics: record.config.analytics } : undefined,
        is_active: record.is_active,
        is_system: record.is_system,
        renderer: record.renderer,
        created_at: record.created_at,
        updated_at: record.updated_at
      }
    }

    // Use record's design_schema stamped at creation time.
    // No schema or missing record_permissions = deny. RLS controls row access;
    // design_schema controls what the principal can do. No permissions granted = none given.
    const designSchema = record.design_schema
    if (!designSchema || !designSchema.record_permissions) {
      if (['logs', 'test_runs'].includes(typeSlug) && record.account_id === ctx.accountId) {
        return record
      }
      return { id: record.id }
    }

    const perms = await this.resolveFirstSurfacePermissions(
      ctx.principal.id,
      record.account_id || ctx.accountId,
      typeSlug,
      'read',
      designSchema
    )

    if (!perms.canRead) {
      // Return minimal data if no read access
      return {
        id: record.id,
        created_at: record.created_at,
        updated_at: record.updated_at
      }
    }

    // When no field definitions are provided, allow the full data object at the record read level.
    // Field-level permissions can still be added later by populating design_schema.fields.
    if (Object.keys(designSchema.fields || {}).length === 0) {
      const sanitized = { ...record }
      if (sanitized.metadata) delete sanitized.metadata
      return sanitized
    }

    // Clone record to avoid mutation
    const sanitized = { ...record }

    // Filter and format data fields based on permissions
    if (sanitized.data && typeof sanitized.data === 'object') {
      const filteredData: any = {}
      
      for (const [fieldName, fieldValue] of Object.entries(sanitized.data)) {
        const fieldPerms = perms.fieldPermissions[fieldName]
        if (fieldPerms && fieldPerms.read) {
          // Apply data formatting using validation schema
          const validationSchema = record.validation_schema || {}
          const fieldValidation = validationSchema.fields?.[fieldName]
          
          if (fieldValidation) {
            // Import formatFieldData function
            const { formatFieldData } = await import('./schema-utils')
            filteredData[fieldName] = formatFieldData(fieldValue, fieldValidation.data_type, {
              currency_code: fieldValidation.currency_code
            })
          } else {
            filteredData[fieldName] = fieldValue
          }
        }
      }
      
      sanitized.data = filteredData
    }

    // Remove metadata field if it exists (should be migrated to data)
    if (sanitized.metadata) {
      delete sanitized.metadata
    }

    return sanitized
  }

  async validateUpdatePermissions(
    ctx: RequestContext,
    updateData: any,
    existingRecord: any,
    typeSlug?: string
  ): Promise<{ valid: boolean; error?: string }> {
    // System admin can update anything — pass data through unsanitized
    if (this.isSystemAdmin(ctx)) {
      return { valid: true, sanitizedData: updateData } as any
    }

    // Extract table name to determine surface
    const tableName = this.extractTableName(existingRecord, typeSlug)
    const surface = this.detectSurface(tableName)

    // Route to appropriate surface logic
    switch (surface) {
      case 'second':
        return this.validateConfigObjectPermissions(ctx, 'update')
      
      case 'third':
        return this.validateSystemMetadataPermissions(ctx, existingRecord, 'update')
      
      case 'first':
      default:
        return this.validateFirstSurfaceUpdatePermissions(ctx, updateData, existingRecord, typeSlug || '')
    }
  }

  private async validateFirstSurfaceUpdatePermissions(
    ctx: RequestContext,
    updateData: any,
    existingRecord: any,
    typeSlug: string
  ): Promise<{ valid: boolean; error?: string; sanitizedData?: any }> {
    if (!ctx.principal || ctx.principal.id === 'anonymous' || !ctx.accountId) {
      return { valid: false, error: 'Authentication required' }
    }

    // Use record's design_schema stamped at creation time.
    // No schema or missing record_permissions = deny. RLS controls row access;
    // design_schema controls what the principal can do. No permissions granted = none given.
    const designSchema = existingRecord.design_schema
    if (!designSchema || !designSchema.record_permissions) {
      return { valid: false, error: 'No permissions defined on this record type' }
    }

    const perms = await this.resolveFirstSurfacePermissions(
      ctx.principal.id,
      existingRecord.account_id || ctx.accountId,
      typeSlug,
      'update',
      designSchema
    )

    if (!perms.canUpdate) {
      return { valid: false, error: 'Insufficient permissions to update this record' }
    }

    // When no field definitions are provided, allow the whole update through at the record update level.
    if (Object.keys(designSchema.fields || {}).length === 0) {
      return { valid: true, sanitizedData: updateData }
    }

    // Check field-level permissions and sanitize data
    const sanitizedData: any = {}
    const validationSchema = existingRecord.validation_schema || {}

    // Process data fields
    if (updateData.data && typeof updateData.data === 'object') {
      sanitizedData.data = {}
      
      for (const [fieldName, fieldValue] of Object.entries(updateData.data)) {
        const fieldPerms = perms.fieldPermissions[fieldName]
        if (!fieldPerms || !fieldPerms.write) {
          return { valid: false, error: `Insufficient permissions to update field '${fieldName}'` }
        }

        // Apply data sanitization using validation schema
        const fieldValidation = validationSchema.fields?.[fieldName]
        
        if (fieldValidation) {
          // Import sanitizeFieldData function
          const { sanitizeFieldData } = await import('./schema-utils')
          try {
            sanitizedData.data[fieldName] = sanitizeFieldData(
              fieldValue, 
              fieldValidation.data_type, 
              fieldValidation
            )
          } catch (sanitizeError: any) {
            return { valid: false, error: `Field '${fieldName}' validation error: ${sanitizeError.message}` }
          }
        } else {
          sanitizedData.data[fieldName] = fieldValue
        }
      }
    }

    // Process metadata fields (if still present during migration)
    if (updateData.metadata && typeof updateData.metadata === 'object') {
      sanitizedData.metadata = {}
      
      for (const [fieldName, fieldValue] of Object.entries(updateData.metadata)) {
        const fieldPerms = perms.fieldPermissions[fieldName]
        if (!fieldPerms || !fieldPerms.write) {
          return { valid: false, error: `Insufficient permissions to update field '${fieldName}'` }
        }

        // Apply basic sanitization for legacy metadata
        sanitizedData.metadata[fieldName] = fieldValue
      }
    }

    // Copy non-data/metadata fields through
    for (const [key, value] of Object.entries(updateData)) {
      if (key !== 'data' && key !== 'metadata') {
        sanitizedData[key] = value
      }
    }

    return { valid: true, sanitizedData }
  }

  async canPrincipalAccessRecord(
    principal: Principal,
    record: { account_id: string; type?: string; [key: string]: any },
    action: 'create' | 'read' | 'update' | 'delete'
  ): Promise<boolean> {
    // System admin bypass
    if (principal.type === 'human' && principal.roles?.includes('system_admin')) {
      return true
    }
    
    // Machine scope check
    if (principal.type === 'machine') {
      return this.checkMachineScope(principal, record, action)
    }
    
    // Human: Use existing schema-driven permissions
    if (principal.type === 'human' && principal.accountId) {
      return this.canAccessFirstSurfaceRecord(
        {
          requestId: '',
          principal,
          db: null as any,
          accountId: principal.accountId,
          appId: null,
          query: {}
        } as any,
        record,
        action
      )
    }
    
    return false
  }

  private checkMachineScope(
    principal: Principal,
    record: any,
    action: string
  ): boolean {
    if (principal.type !== 'machine') return false
    
    const scopes = principal.scopes || []
    const requiredScope = `${record.type || 'resource'}:${action}`
    const [resource] = requiredScope.split(':')
    
    // Exact match
    if (scopes.includes(requiredScope)) return true
    
    // Wildcard resource match (e.g., "items:*" matches "items:read")
    if (scopes.includes(`${resource}:*`)) return true
    
    // Global wildcard
    if (scopes.includes('*:*')) return true
    
    return false
  }

  getPrincipalPermissionSummary(principal: Principal): object {
    if (principal.type === 'human') {
      return {
        type: 'human',
        roles: principal.roles || [],
        is_system_admin: principal.roles?.includes('system_admin') || false
      }
    }
    
    if (principal.type === 'machine') {
      return {
        type: 'machine',
        machine_type: principal.machineType,
        scopes: principal.scopes || [],
        is_internal: principal.isInternal
      }
    }
    
    return { type: 'unknown' }
  }
}




export const PermissionEngine: _PermissionEngineInternal = _PermissionEngineInternal.getInstance()







export const resolveFirstSurfacePermissions = PermissionEngine.resolveFirstSurfacePermissions.bind(PermissionEngine)






export const isSystemAdmin = PermissionEngine.isSystemAdmin.bind(PermissionEngine)






export const canAccessRecord = PermissionEngine.canAccessRecord.bind(PermissionEngine)






export const sanitizeRecordData = PermissionEngine.sanitizeRecordData.bind(PermissionEngine)






export const validateUpdatePermissions = PermissionEngine.validateUpdatePermissions.bind(PermissionEngine)



