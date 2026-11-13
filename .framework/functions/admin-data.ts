/**
 * @module   admin-data
 * @audience internal
 * @layer    app-specific
 * @stability stable
 *
 * This module handles administrative data operations within the system, providing essential functionalities for managing records and permissions. It serves as an API handler for various administrative actions, ensuring that only authorized users can perform updates and access sensitive data. INVARIANT: Only users with system admin privileges can execute these operations.
 *
 * @seeAlso middleware.ts (provides request handling logic).
 * @seeAlso permissions.ts (manages access control and validation).
 * @seeAlso db.ts (interfaces with the database for data operations).
 * @seeAlso principal.ts (determines user roles and permissions).
 *
 * @cil-generated
 */









import { createHandler } from './_shared/middleware'
import { sanitizeRecordData, resolveFirstSurfacePermissions, validateUpdatePermissions } from './_shared/permissions'
import { adminDb } from './_shared/db'
import { isSystemAdmin, isSystemPrincipal, resolveAccessibleAccountIds } from './_shared/principal'
import { applyAccountScope, assertRecordAccess, canAccessAccount, ENTITY_ACCOUNT_KEY } from './_shared/account-scope'
import { isAccountAdmin } from './_shared/access'
import { resolveTypeId, resolveTypeIds, resolveTypeRecord } from './_shared/resolve-ids'
import { fireCreateTriggers, fireUpdateTriggers, fireDeleteTriggers } from './_shared/trigger-engine'
import { withAdminLogging } from './_shared/logging'
import { hasInternalAudience, projectMessageForCustomer } from './_shared/access'
import { checkTypeSlugRateLimit } from './_shared/security'

/**
 * PERMISSIONS_ALL defines a comprehensive set of permissions for record management, including create, read, update, and delete actions. It serves as a centralized reference for managing access control in the application.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const PERMISSIONS_ALL = {
  record_permissions: { all: ['create', 'read', 'update', 'delete'] },
  fields: {}
}

/**
 * VALID_ENTITIES is a constant array that defines the valid entity types used throughout the admin data functions. It ensures that only recognized entity types are processed in the module.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const VALID_ENTITIES = ['accounts', 'people', 'items', 'threads', 'messages', 'links', 'attachments', 'watchers', 'item_progress', 'logs', 'test_runs', 'observability', 'test_cases', 'types', 'link_types', 'ai_agents', 'prompt_configs']
const ENTITIES_WITHOUT_IS_ACTIVE = new Set(['links', 'attachments', 'watchers', 'logs', 'observability'])

/**
 * RAW_ENTITIES is a constant array that defines a set of entity names used in the admin data functions. It exists to provide a centralized reference for these entity types, ensuring consistency across the module.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const RAW_ENTITIES = ['logs', 'test_runs', 'observability', 'test_cases']
// Entities with no created_by/updated_by columns — audit stamps must be
// omitted or writes fail with schema-cache errors.
const UNAUDITED_ENTITIES = ['types', 'link_types']

/**
 * ENTITY_TO_KIND is a mapping of entity names to their corresponding kind identifiers. It exists to provide a centralized reference for translating entity types within the application.
 *
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
const ENTITY_TO_KIND: Record<string, string> = {
  accounts: 'account',
  people: 'person',
  items: 'item',
  threads: 'thread',
  messages: 'message',
  links: 'link',
  attachments: 'attachment',
  watchers: 'watcher',
  item_progress: 'item_progress'
}
/**
 * The 'list' constant defines an asynchronous handler for listing entities based on various query parameters. It validates input parameters and constructs a database query to retrieve the requested data.
 *
 * @throws      Error — Valid entity parameter is required
 * @sideEffects none
 * @stability   stable
 * @calls       withAdminLogging, resolveTypeIds, getSearchField
 * @cil-generated
 */
export const list = createHandler(async (ctx, _body) => {
  const { entity, action, method, search, sort_field = 'created_at', sort_direction = 'desc', limit = 50, offset = 0, type_slug, type_slugs, view: viewSlug, flag_only, exclude_flag, include_inactive, ...filters } = ctx.query || {}

  return await withAdminLogging(
    ctx,
    {
      entity: entity || 'unknown',
      action: 'list',
      method: method || 'GET',
      filters,
      typeSlug: type_slug
    },
    async () => {
      if (!entity || !VALID_ENTITIES.includes(entity)) {
        throw new Error('Valid entity parameter is required')
      }

      const db = isSystemPrincipal(ctx) ? adminDb : ctx.db
      const accountIds = await resolveAccessibleAccountIds(ctx)
      let query = db.from(entity).select('*')
      query = applyAccountScope(query, entity, accountIds)

      // Customer-scoped principals never receive internal threads.
      const internalAudience = hasInternalAudience(ctx.principal)
      if (entity === 'threads' && !internalAudience) {
        query = query.neq('visibility', 'internal')
      }

      const targetSlugs: string[] = []
      if (type_slug) targetSlugs.push(type_slug)
      if (type_slugs) {
        const raw = Array.isArray(type_slugs) ? type_slugs : (type_slugs as string).split(',').map(s => s.trim()).filter(Boolean)
        targetSlugs.push(...raw)
      }
      if (targetSlugs.length) {
        const kind = ENTITY_TO_KIND[entity]
        if (kind) {
          try {
            const resolved = await resolveTypeIds(targetSlugs.map(slug => ({ kind, slug })))
            const typeIds = Object.values(resolved)
            if (typeIds.length === 1) {
              query = query.eq('type_id', typeIds[0])
            } else if (typeIds.length > 1) {
              query = query.in('type_id', typeIds)
            }
          } catch (err: any) {
            if (err?.message?.includes('Type not found')) {
              return []
            }
            throw err
          }
        }
      }

      if (search) {
        const searchField = getSearchField(entity)
        query = query.ilike(searchField, `%${search}%`)
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'is_active' || key === 'is_verified' || key === 'is_primary') {
            query = query.eq(key, value === 'true')
          } else {
            query = query.eq(key, value)
          }
        }
      })

      // Soft-deleted rows are hidden by default — pass is_active=false or
      // include_inactive=true to see them. Entities without an is_active
      // column (links, attachments, watchers, logs, observability) skip the
      // default filter — it would 500 with 42703 column-does-not-exist.
      if (filters.is_active === undefined && include_inactive !== 'true' && !ENTITIES_WITHOUT_IS_ACTIVE.has(entity)) {
        query = query.eq('is_active', true)
      }

      // Generic record-flag filters on the row's data jsonb. flag_only=<field>
      // returns only rows where data->>field is 'true'; exclude_flag=<field>
      // hides them (null counts as unset). Flag fields are stamped server-side
      // — clients can only filter on them, never set them. Only entities whose
      // rows carry flaggable data payloads are eligible (accounts/people are
      // excluded). The field name is validated before it is interpolated into
      // the PostgREST filter string.
      const FLAGGABLE_ENTITIES = ['items', 'threads', 'messages', 'links', 'attachments', 'watchers']
      const flagParam = flag_only ?? exclude_flag
      if (flagParam !== undefined && !/^[a-z][a-z0-9_]{0,62}$/.test(String(flagParam))) {
        const e: any = new Error('Invalid flag field name'); e.statusCode = 400; throw e
      }
      if (FLAGGABLE_ENTITIES.includes(entity)) {
        if (flag_only) {
          query = query.eq(`data->>${flag_only}`, 'true')
        } else if (exclude_flag) {
          query = query.or(`data->>${exclude_flag}.is.null,data->>${exclude_flag}.eq.false`)
        }
      }

      query = query.order(sort_field, { ascending: sort_direction === 'asc' })

      const { count, error: countError } = await db.from(entity)
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('List count error:', countError)
        throw new Error(countError.message || 'Database error getting count')
      }

      query = query.range(parseInt(offset.toString()), parseInt(offset.toString()) + parseInt(limit.toString()) - 1)

      const { data, error: err } = await query

      if (err) {
        console.error('List query error:', err)
        throw new Error(err.message || 'Database error listing records')
      }

      // Customer-scoped message reads project internal rows into safe
      // step summaries — only when the parent thread itself is external.
      let threadIsInternal = true
      if (entity === 'messages' && !internalAudience && filters.thread_id) {
        const { data: parentThread } = await adminDb
          .from('threads')
          .select('visibility')
          .eq('id', filters.thread_id)
          .maybeSingle()
        threadIsInternal = parentThread?.visibility !== 'external' && parentThread?.visibility !== 'public'
          ? true
          : false
      }

      // Sanitize rows concurrently — the sequential loop turned every list
      // request into an N+1 of permission lookups.
      const sanitizedData = (
        await Promise.all((data || []).map(async (record: any) => {
          const sanitizedRecord = await sanitizeRecordData(ctx, record, entity)
          if (entity === 'messages' && !internalAudience) {
            return projectMessageForCustomer(sanitizedRecord, { threadIsInternal })
          }
          return sanitizedRecord
        }))
      ).filter(Boolean)

      if (viewSlug && type_slug) {
        const { data: typeRecord } = await adminDb
          .from('types')
          .select('design_schema')
          .eq('slug', type_slug)
          .eq('is_active', true)
          .single()

        if (typeRecord?.design_schema) {
          const schema = typeRecord.design_schema
          const resolvedView = schema.views?.[viewSlug] || null
          return { data: sanitizedData, schema, view: resolvedView }
        }
      }

      return sanitizedData
    }
  )
})
/**
 * The attachLineage function retrieves and attaches parent and child records to a given record based on its lineage in a hierarchical structure. It is designed to facilitate the understanding of relationships between different entities in the database.
 *
 * @macro       Async function that resolves and attaches hierarchical lineage data to a record.
 * @micro       Reads the type-declared functionality.lineage config (parent_fields, link_type, children) and resolves parents via link + data-field walks and children via reverse links + per-type field lookups.
 * @inputSpec
 *   - record: any (required) — the record to which lineage will be attached.
 *   - ctx: any (required) — the context containing database access and other utilities.
 * @outputSpec  Promise<void>
 * @sideEffects Database reads from 'types', 'links' and 'items' tables.
 * @stability   stable
 * @calls       adminDb.from, ctx.db.from, ctx.db.select, ctx.db.eq, ctx.db.limit, ctx.db.single, sanitizeRecordData, resolveTypeIds
 * @errorHandling returns null on error during data fetching.
 * @cil-generated
 */
async function attachLineage(record: any, ctx: any): Promise<void> {
  // Lineage is declared per item type in design_schema.functionality.lineage:
  //   { parent_fields: string[], link_type: string, children: { [childTypeSlug]: field } }
  // Each leg is guarded by its own declaration — link queries run only when
  // link_type is declared, the parent field-scan only iterates declared
  // parent_fields, and data-field child lookups only run for declared children
  // entries. A type with no lineage block gets empty parents/children and no
  // link/data queries run at all.
  const { data: typeRow } = await adminDb
    .from('types')
    .select('slug, design_schema')
    .eq('id', record.type_id)
    .single()
  const lineage = typeRow?.design_schema?.functionality?.lineage
  const linkType = typeof lineage?.link_type === 'string' && lineage.link_type ? lineage.link_type : null
  const parentFields: string[] = Array.isArray(lineage?.parent_fields)
    ? lineage.parent_fields.filter((f: any) => typeof f === 'string' && f)
    : []
  const childrenMap: Record<string, string> =
    lineage?.children && typeof lineage.children === 'object' ? lineage.children : {}

  async function parentIdFor(current: any, visited: Set<string>): Promise<string | null> {
    if (linkType) {
      const { data: links } = await ctx.db.from('links').select('target_id').eq('source_id', current.id).eq('link_type', linkType).eq('source_type', 'items').limit(1)
      const linkTarget = links?.[0]?.target_id
      if (linkTarget && !visited.has(linkTarget)) return linkTarget
    }
    const d = current.data || {}
    for (const key of parentFields) {
      const id = d[key]
      if (id && !visited.has(id)) return id
    }
    return null
  }

  async function getParents(record: any): Promise<any[]> {
    if (!linkType && parentFields.length === 0) return []
    const parents: any[] = []
    const visited = new Set<string>([record.id])
    let current: any = record
    for (let i = 0; i < 5; i++) {
      const parentId = await parentIdFor(current, visited)
      if (!parentId) break
      visited.add(parentId)
      const { data, error } = await ctx.db.from('items').select('*').eq('id', parentId).single()
      if (error || !data) break
      current = data
      const sanitized = await sanitizeRecordData(ctx, data, 'items')
      parents.push(sanitized)
    }
    return parents
  }

  async function getChildren(record: any): Promise<any[]> {
    const childIds = new Set<string>()
    if (linkType) {
      const { data: linkRows } = await ctx.db.from('links').select('source_id').eq('target_id', record.id).eq('link_type', linkType).eq('target_type', 'items').limit(50)
      for (const row of linkRows || []) {
        if (row.source_id && row.source_id !== record.id) childIds.add(row.source_id)
      }
    }
    const childEntries = Object.entries(childrenMap)
      .filter(([slug, field]) => slug && typeof field === 'string' && field)
    if (childEntries.length) {
      try {
        const resolved = await resolveTypeIds(childEntries.map(([slug]) => ({ kind: 'item', slug })))
        for (const [slug, field] of childEntries) {
          const childTypeId = resolved[`item/${slug}`]
          if (!childTypeId) continue
          const { data: dataChildren } = await ctx.db.from('items').select('id').eq('type_id', childTypeId).eq(`data->>${field}`, record.id)
          for (const child of dataChildren || []) {
            if (child.id && child.id !== record.id) childIds.add(child.id)
          }
        }
      } catch (e) {
        // ignore missing child types
      }
    }
    if (childIds.size === 0) return []
    const { data: rawChildren } = await ctx.db.from('items').select('*').in('id', Array.from(childIds))
    const children: any[] = []
    for (const child of rawChildren || []) {
      if (child.id === record.id) continue
      children.push(await sanitizeRecordData(ctx, child, 'items'))
    }
    return children
  }

  const [parents, children] = await Promise.all([getParents(record), getChildren(record)])

  const typeIds = new Set<string>()
  typeIds.add(record.type_id)
  for (const p of parents) if (p?.type_id) typeIds.add(p.type_id)
  for (const c of children) if (c?.type_id) typeIds.add(c.type_id)
  const { data: typeRows } = await adminDb.from('types').select('id, slug').in('id', Array.from(typeIds))
  const slugById = new Map((typeRows || []).map((t: any) => [t.id, t.slug] as [string, string]))
  record.type_slug = slugById.get(record.type_id) || ''
  for (const p of parents) p.type_slug = slugById.get(p.type_id) || ''
  for (const c of children) c.type_slug = slugById.get(c.type_id) || ''

  record.parents = parents
  record.children = children
}

/**
 * The 'get' constant defines an asynchronous handler for retrieving records from a database based on entity type and ID. It ensures proper logging and validation of input parameters before fetching and sanitizing the requested data.
 *
 * @throws      Error — Valid entity parameter is required, Error — ID parameter is required, Error — Record not found
 * @sideEffects none
 * @stability   stable
 * @calls       withAdminLogging, ctx.db.from, sanitizeRecordData, adminDb.from, attachLineage, projectMessageForCustomer
 * @cil-generated
 */
export const get = createHandler(async (ctx, _body) => {
  const { entity, id, view: viewSlug } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  return await withAdminLogging(
    ctx,
    {
      entity: entity || 'unknown',
      action: 'get',
      method,
      typeSlug: viewSlug
    },
    async () => {
      if (!entity || !VALID_ENTITIES.includes(entity)) {
        throw new Error('Valid entity parameter is required')
      }

      if (!id) {
        throw new Error('ID parameter is required')
      }

      const { data, error: err } = await ctx.db.from(entity)
        .select('*')
        .eq('id', id)
        .single()

      if (err) throw err

      if (!data) {
        throw new Error('Record not found')
      }

      await assertRecordAccess(ctx, entity, data)

      let sanitizedRecord = await sanitizeRecordData(ctx, data, entity)

      // Customer-scoped principals cannot fetch internal threads or
      // unprojectable internal messages by id.
      if (!hasInternalAudience(ctx.principal) && sanitizedRecord?.visibility === 'internal') {
        if (entity === 'threads') {
          throw new Error('Record not found')
        }
        if (entity === 'messages') {
          const { data: parentThread } = await adminDb
            .from('threads')
            .select('visibility')
            .eq('id', sanitizedRecord.thread_id)
            .maybeSingle()
          const threadIsInternal = parentThread?.visibility !== 'external' && parentThread?.visibility !== 'public'
          sanitizedRecord = projectMessageForCustomer(sanitizedRecord, { threadIsInternal })
          if (!sanitizedRecord) throw new Error('Record not found')
        }
      }

      // Lineage traversal costs several sequential reads — polling callers
      // that never render it pass lineage=0 to skip it.
      if (entity === 'items' && (ctx as any).query?.lineage !== '0') {
        await attachLineage(sanitizedRecord, ctx)
      }

      if (viewSlug && sanitizedRecord?.design_schema) {
        const schema = sanitizedRecord.design_schema
        const resolvedView = schema.views?.[viewSlug] || null
        return { data: sanitizedRecord, schema, view: resolvedView }
      }

      return sanitizedRecord
    }
  )
})
/**
 * The 'create' constant defines an asynchronous handler for creating new entities in the admin data context. It validates input data and logs the creation action while handling various entity types.
 *
 * @throws      Error — Valid entity parameter is required; Error — level and message are required for logs; Error — suite is required for test_runs; Error — metric_name and metric_value are required for observability; Error — slug and name are required for test_cases.
 * @sideEffects Database writes for new entity records, logging actions, and triggering additional processes.
 * @stability   stable
 * @calls       withAdminLogging, ctx.db.from, fireCreateTriggers, sanitizeRecordData
 * @cil-generated
 */
export const create = createHandler(async (ctx, body) => {
  const entity = body?.entity || ctx.query?.entity
  const type_slug = body?.type_slug
  const method = ctx.query?.method || 'POST'

  return await withAdminLogging(
    ctx,
    {
      entity: entity || 'unknown',
      action: 'create',
      method,
      typeSlug: type_slug
    },
    async () => {
      const { entity: _e, type_slug: _ts, design_schema: _ds, validation_schema: _vs, account_id: requestedAccountId, id: _id, ...recordData } = body || {}

      if (!entity || !VALID_ENTITIES.includes(entity)) {
        const e: any = new Error('Valid entity parameter is required'); e.statusCode = 400; throw e
      }

      // A body-supplied account_id is only honored for system principals —
      // checked up front so foreign-account writes fail before any work.
      if (requestedAccountId && !isSystemPrincipal(ctx) && !(await canAccessAccount(ctx, requestedAccountId))) {
        const e: any = new Error('Cannot create records in a different account')
        e.statusCode = 403
        throw e
      }

      if (RAW_ENTITIES.includes(entity)) {
        const allowed: Record<string, string[]> = {
          logs: ['level', 'message', 'context', 'source', 'source_type', 'source_id', 'person_id', 'account_id', 'app_id', 'created_by', 'metadata', 'created_at'],
          test_runs: ['suite', 'status', 'started_at', 'finished_at', 'duration_ms', 'total', 'passed', 'failed', 'skipped', 'triggered_by', 'account_id'],
          observability: ['app_id', 'account_id', 'type_id', 'metric_name', 'metric_value', 'metric_unit', 'context', 'metadata', 'created_at'],
          test_cases: ['app_id', 'account_id', 'type_id', 'slug', 'name', 'description', 'config', 'metadata', 'is_active', 'is_system', 'created_at', 'updated_at']
        }
        const fields = allowed[entity] || []
        const raw: any = {}
        for (const key of fields) {
          if (recordData[key] !== undefined) raw[key] = recordData[key]
        }
        // Non-system callers may never write into a foreign account — a
        // body-supplied account_id is only honored for system principals.
        if (fields.includes('account_id')) {
          if (isSystemPrincipal(ctx)) {
            if (raw.account_id === undefined) raw.account_id = ctx.accountId
          } else {
            raw.account_id = ctx.accountId
          }
        }
        if (entity === 'logs' && !raw.created_at) raw.created_at = new Date().toISOString()
        if (entity === 'logs' && (!raw.level || !raw.message)) { const e: any = new Error('level and message are required for logs'); e.statusCode = 400; throw e }
        if (entity === 'test_runs' && !raw.suite) { const e: any = new Error('suite is required for test_runs'); e.statusCode = 400; throw e }
        if (entity === 'observability' && (!raw.metric_name || raw.metric_value === undefined)) { const e: any = new Error('metric_name and metric_value are required for observability'); e.statusCode = 400; throw e }
        if (entity === 'test_cases' && (!raw.slug || !raw.name)) { const e: any = new Error('slug and name are required for test_cases'); e.statusCode = 400; throw e }

        const rawInsertDb = (ctx.principal?.isInternal || isSystemAdmin(ctx.principal)) ? adminDb : ctx.db
        const { data, error: err } = await rawInsertDb.from(entity).insert(raw).select().single()
        if (err) throw err
        // Await the trigger check: the heavy work already offloads to
        // pipeline-runner-background, so this only adds eval + queue insert
        // + dispatch. Detached post-response work is CPU-frozen on Netlify
        // and silently dropped trigger fires in production.
        await fireCreateTriggers(entity, data.id, raw, ctx).catch(console.error)
        return await sanitizeRecordData(ctx, data, entity)
      }

      let typeRecord: { id: string; design_schema: Record<string, any>; validation_schema: Record<string, any> }

      if (body?.type_slug) {
        const kind = ENTITY_TO_KIND[entity]
        if (!kind) {
          const e: any = new Error(`type_slug is not supported for entity: ${entity}`); e.statusCode = 400; throw e
        }
        typeRecord = await resolveTypeRecord(kind, body.type_slug)
      } else if (recordData.type_id) {
        const { data, error: typeErr } = await adminDb
          .from('types')
          .select('id, design_schema, validation_schema, is_active')
          .eq('id', recordData.type_id)
          .single()
        if (typeErr || !data) throw new Error(`type_id not found: ${recordData.type_id}`)
        if (!data.is_active) throw new Error(`type_id references an inactive type: ${recordData.type_id}`)
        typeRecord = { id: data.id, design_schema: data.design_schema || {}, validation_schema: data.validation_schema || {} }
      } else {
        const e: any = new Error('type_id or type_slug is required — every runtime record must reference a type'); e.statusCode = 400; throw e
      }

      recordData.type_id = typeRecord.id

      // Per-type create rate limit. Apps opt in by declaring
      // config.rate_limits['<type_slug>_create'] in their manifest;
      // with no policy the cached config read is the only cost.
      await checkTypeSlugRateLimit(ctx, body?.type_slug)

      let designSchema = typeRecord.design_schema || {}
      if (!designSchema.record_permissions) {
        designSchema = { ...PERMISSIONS_ALL, ...designSchema }
      }

      let recordAccountId = requestedAccountId || ctx.accountId
      const parentRef = recordData.thread_id || recordData.target_id || recordData.parent_id
      if (parentRef) {
        const parentTable = recordData.thread_id
          ? 'threads'
          : recordData.target_type === 'account'
            ? 'accounts'
            : recordData.target_type === 'person'
              ? 'people'
              : 'items'
        const parentColumns = parentTable === 'accounts' ? 'id' : 'account_id, design_schema'
        const { data: parentRecord } = await ctx.db
          .from(parentTable)
          .select(parentColumns)
          .eq('id', parentRef)
          .maybeSingle()
        if (!parentRecord) {
          const e: any = new Error('Parent record not found or not accessible'); e.statusCode = 403; throw e
        }
        if (parentTable === 'accounts') {
          recordAccountId = parentRecord.id
        } else {
          recordAccountId = parentRecord.account_id
          const parentScope = parentRecord.design_schema?.scope
          if (parentScope) {
            designSchema = { ...designSchema, scope: parentScope }
          }
        }
      }

      const resolvedScope: string = designSchema.scope ?? 'account'
      if (resolvedScope === 'platform') {
        const { data: sysAccount } = await adminDb
          .from('accounts')
          .select('id')
          .eq('slug', 'spine-system')
          .single()
        if (sysAccount?.id) recordAccountId = sysAccount.id
      }

      // The parent-ref override above can move the write outside the caller's
      // account — for machine principals the parent lookup ran on adminDb
      // (no RLS), so re-check the final account. Platform-scope creates are
      // exempt: the type's own design_schema stamps them into spine-system.
      if (!isSystemPrincipal(ctx) && entity !== 'accounts' && resolvedScope !== 'platform' &&
          !(await canAccessAccount(ctx, recordAccountId))) {
        const e: any = new Error('Cannot create records in a different account')
        e.statusCode = 403
        throw e
      }

      const dataToInsert: Record<string, any> = {
        ...recordData,
        design_schema:     designSchema,
        validation_schema: typeRecord.validation_schema || {},
        ...(UNAUDITED_ENTITIES.includes(entity) ? {} : { created_by: ctx.principal?.type === 'human' ? ctx.principal.id : null }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // accounts is the source-of-truth table; it does not have an account_id column
      if (entity !== 'accounts') {
        dataToInsert.account_id = recordAccountId
      } else if (dataToInsert.parent_id === undefined) {
        dataToInsert.parent_id = ctx.principal?.accountId || null
      }

      const permissionAccountId = entity === 'accounts' ? ctx.principal?.accountId : recordAccountId
      const typeSlugForPermissions = type_slug || ENTITY_TO_KIND[entity]
      const perms = await resolveFirstSurfacePermissions(
        ctx.principal?.id,
        permissionAccountId,
        typeSlugForPermissions,
        'create',
        designSchema
      )
      const isMachineGlobal = ctx.principal?.type === 'machine' &&
        (ctx.principal.scopes || []).includes('*:*')
      if (!perms.canCreate && !isMachineGlobal) {
        const e: any = new Error('Insufficient permissions to create this record')
        e.statusCode = 403
        throw e
      }

      // Function-side permission check already ran — write via service role.
      // ctx.db is PostgREST `authenticated` for humans, which holds SELECT only.
      const insertDb = adminDb

      const { data, error: err } = await insertDb.from(entity)
        .insert(dataToInsert)
        .select()
        .single()

      if (err) throw err

      const entityData = { ...dataToInsert, id: data.id }
      await fireCreateTriggers(entity, data.id, entityData, ctx).catch(console.error)

      return await sanitizeRecordData(ctx, data, entity)
    }
  )
})
/**
 * The update function handles updating records in the database while ensuring proper validation and permissions. It logs the update action and sanitizes the data before performing the update.
 *
 * @throws      Error — Valid entity parameter is required; Error — ID is required for update; Error — Record not found or access denied; Error — Insufficient permissions to update this record.
 * @sideEffects Database update operation, logging actions, and triggering update events.
 * @stability   stable
 * @calls       withAdminLogging, validateUpdatePermissions, ctx.db.from, fireUpdateTriggers, sanitizeRecordData
 * @cil-generated
 */
export const update = createHandler(async (ctx, body) => {
  const { entity, id } = ctx.query || {}
  const method = ctx.query?.method || 'PATCH'
  const type_slug = body?.type_slug

  return await withAdminLogging(
    ctx,
    {
      entity: entity || 'unknown',
      action: 'update',
      method,
      typeSlug: type_slug
    },
    async () => {
      const { design_schema: _ds, validation_schema: _vs, type_id: _ti, type_slug: _ts, id: _id, account_id: requestedAccountId, entity: _entity, ...recordData } = body || {}

      if (!entity || !VALID_ENTITIES.includes(entity)) {
        throw new Error('Valid entity parameter is required')
      }

      if (!id) {
        throw new Error('ID is required for update')
      }

      const { data: existing, error: existingErr } = await ctx.db
        .from(entity)
        .select('*')
        .eq('id', id)
        .single()

      if (existingErr || !existing) {
        throw new Error('Record not found or access denied')
      }

      await assertRecordAccess(ctx, entity, existing)

      if (!isSystemPrincipal(ctx)) {
        // Privileged columns never come from the request for tenant callers —
        // sanitizedData copies every non-data key through verbatim, so these
        // must be dropped here (mass-assignment prevention).
        for (const k of ['account_id', 'auth_uid', 'app_id', 'type_id', 'created_by', 'design_schema', 'validation_schema']) {
          delete recordData[k]
        }
        if (entity === 'people') {
          const admin = isAccountAdmin(ctx, existing.account_id)
          const isSelf = existing.id === ctx.principal?.id
          if (!admin && !isSelf) {
            const e: any = new Error('Insufficient permissions to update other members')
            e.statusCode = 403
            throw e
          }
          if (!admin || isSelf) {
            delete recordData.role_id
            delete recordData.status
            delete recordData.is_active
          } else if (recordData.role_id !== undefined) {
            const { data: targetRole } = await adminDb
              .from('roles')
              .select('is_system')
              .eq('id', recordData.role_id)
              .maybeSingle()
            if (!targetRole || targetRole.is_system) {
              const e: any = new Error('Cannot assign a system role')
              e.statusCode = 403
              throw e
            }
          }
          if (recordData.data && typeof recordData.data === 'object') {
            for (const k of Object.keys(recordData.data)) {
              if (k.startsWith('invite_')) delete recordData.data[k]
            }
          }
        }
      } else if (entity === 'people' && requestedAccountId !== undefined) {
        recordData.account_id = requestedAccountId
      }

      const typeSlugForPermissions = type_slug || entity
      const validation = await validateUpdatePermissions(
        ctx,
        recordData,
        existing,
        typeSlugForPermissions
      )

      if (!validation.valid && !isSystemAdmin(ctx.principal)) {
        const e: any = new Error(validation.error || 'Insufficient permissions to update this record')
        e.statusCode = 403
        throw e
      }

      const sanitizedUpdate = (validation as any).sanitizedData || recordData
      const dataToUpdate = RAW_ENTITIES.includes(entity)
        ? { ...sanitizedUpdate }
        : {
            ...sanitizedUpdate,
            ...(UNAUDITED_ENTITIES.includes(entity) ? {} : { updated_by: ctx.principal?.type === 'human' ? ctx.principal.id : null }),
            updated_at: new Date().toISOString()
          }

      const { data, error: err } = await adminDb.from(entity)
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      const entityData = { ...data, ...dataToUpdate }
      // Await the trigger check — see note in the create path. Detached
      // post-response work is CPU-frozen on Netlify and drops trigger fires.
      await fireUpdateTriggers(entity, id, entityData, ctx, existing).catch(console.error)

      return await sanitizeRecordData(ctx, data, entity)
    }
  )
})
/**
 * The 'remove' constant defines an asynchronous handler for removing records from a database, supporting both soft and hard deletes based on the provided parameters. It ensures that the entity and ID are valid and checks for sufficient permissions before performing the delete operation.
 *
 * @throws      Error — Valid entity parameter is required, Error — ID is required for delete, Error — Record not found or access denied, Error — Insufficient permissions to delete this record.
 * @sideEffects Updates or deletes records in the database.
 * @stability   stable
 * @calls       withAdminLogging, ctx.db.from, resolveFirstSurfacePermissions, entitySupportsSoftDelete, sanitizeRecordData
 * @cil-generated
 */
export const remove = createHandler(async (ctx, _body) => {
  const { entity, id, soft = 'true' } = ctx.query || {}
  const method = ctx.query?.method || 'DELETE'

  return await withAdminLogging(
    ctx,
    {
      entity: entity || 'unknown',
      action: 'remove',
      method
    },
    async () => {
      if (!entity || !VALID_ENTITIES.includes(entity)) {
        throw new Error('Valid entity parameter is required')
      }

      if (!id) {
        throw new Error('ID is required for delete')
      }

      const { data: existing, error: existingErr } = await ctx.db
        .from(entity)
        .select('*')
        .eq('id', id)
        .single()

      if (existingErr || !existing) {
        throw new Error('Record not found or access denied')
      }

      await assertRecordAccess(ctx, entity, existing)

      const permissionAccountId = existing.account_id || ctx.principal?.accountId
      const perms = await resolveFirstSurfacePermissions(
        ctx.principal?.id,
        permissionAccountId,
        entity,
        'delete',
        existing.design_schema
      )

      if (!perms.canDelete && !isSystemAdmin(ctx.principal)) {
        const e: any = new Error('Insufficient permissions to delete this record')
        e.statusCode = 403
        throw e
      }

      const isSoftDelete = soft === 'true'

      if (isSoftDelete && entitySupportsSoftDelete(entity)) {
        const { data, error: err } = await adminDb.from(entity)
          .update({
            is_active: false,
            updated_by: ctx.principal?.type === 'human' ? ctx.principal.id : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single()

        if (err) throw err
        return { deleted: true, soft: true, data: await sanitizeRecordData(ctx, data, entity) }
      } else {
        const { error: err } = await adminDb.from(entity)
          .delete()
          .eq('id', id)

        if (err) throw err
        return { deleted: true, soft: false }
      }
    }
  )
})
/**
 * Retrieves the appropriate search field name for a given entity type. This function helps standardize search queries across different entity types in the application.
 *
 * @inputSpec
 *   entity: string (required) — the name of the entity for which to retrieve the search field.
 * @outputSpec  string — the search field name associated with the entity or 'id' if not found.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
function getSearchField(entity: string): string {
  const searchFields: Record<string, string> = {
    accounts: 'display_name',
    people: 'full_name',
    items: 'title',
    threads: 'title',
    messages: 'content',
    links: 'link_type',
    attachments: 'filename',
    watchers: 'watch_type',
    item_progress: 'title',
    logs: 'message',
    test_runs: 'suite',
    observability: 'metric_name',
    test_cases: 'name'
  }
  return searchFields[entity] || 'id'
}
/**
 * Determines if a given entity supports soft deletion by checking against a predefined list of entities. This function exists to facilitate operations that depend on the soft delete capability of certain entities.
 *
 * @inputSpec
 *   entity: string (required) — the name of the entity to check for soft delete support.
 * @outputSpec  boolean — returns true if the entity supports soft deletion, otherwise false.
 * @sideEffects none
 * @stability   stable
 * @cil-generated
 */
function entitySupportsSoftDelete(entity: string): boolean {
  const softDeleteEntities = ['accounts', 'people', 'items', 'threads', 'messages', 'watchers', 'item_progress', 'test_cases']
  return softDeleteEntities.includes(entity)
}
/**
 * The 'stats' constant provides an asynchronous handler for retrieving the count of records for a specified entity in the database. It ensures that the entity is valid and logs the request for administrative purposes.
 *
 * @throws      Error — Valid entity parameter is required, Error — database query error.
 * @sideEffects none
 * @stability   stable
 * @calls       withAdminLogging, ctx.db.from
 * @cil-generated
 */
export const stats = createHandler(async (ctx, _body) => {
  const { entity } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  return await withAdminLogging(
    ctx,
    {
      entity: entity || 'unknown',
      action: 'stats',
      method
    },
    async () => {
      if (!entity || !VALID_ENTITIES.includes(entity)) {
        throw new Error('Valid entity parameter is required')
      }

      const db = isSystemPrincipal(ctx) ? adminDb : ctx.db
      const accountIds = await resolveAccessibleAccountIds(ctx)
      let query = db.from(entity)
        .select('*', { count: 'exact', head: true })
      query = applyAccountScope(query, entity, accountIds)
      const { count, error: err } = await query

      if (err) throw err

      return { entity, count }
    }
  )
})
/**
 * The handler processes incoming requests based on the specified action and HTTP method, routing them to the appropriate function. It serves as a centralized entry point for managing various administrative data operations.
 *
 * @throws      Error — Invalid action or method
 * @sideEffects none
 * @stability   stable
 * @calls       list, get, stats, create, update, remove
 * @cil-generated
 */
export const handler = createHandler(async (ctx, body) => {
  const { action } = ctx.query || {}
  const method = ctx.query?.method || 'GET'

  switch (action) {
    case 'list':
      if (method === 'GET') return await list(ctx, body)
      break
    case 'get':
      if (method === 'GET') return await get(ctx, body)
      break
    case 'stats':
      if (method === 'GET') return await stats(ctx, body)
      break
    case 'create':
      if (method === 'POST') return await create(ctx, body)
      break
    case 'update':
      if (method === 'PATCH') return await update(ctx, body)
      break
    case 'remove':
      if (method === 'DELETE') return await remove(ctx, body)
      break
    default:
      if (method === 'GET' && ctx.query?.id) {
        return await get(ctx, body)
      } else if (method === 'GET') {
        return await list(ctx, body)
      } else if (method === 'POST') {
        return await create(ctx, body)
      } else if (method === 'PATCH') {
        return await update(ctx, body)
      } else if (method === 'DELETE') {
        return await remove(ctx, body)
      }
  }

  throw new Error('Invalid action or method')
})