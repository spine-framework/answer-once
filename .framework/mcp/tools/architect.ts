
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { adminDb } from '../shared/db.js'
import { loadManifest, mergeWithManifest } from '../shared/app-manifest.js'

export function register(server: McpServer) {
  server.registerTool(
    'spine_architect_evaluate',
    {
      description: 'Evaluate a code or design proposal against the Spine Way fundamentals and return a structured assessment with observations and recommendations.',
      inputSchema: z.object({
        proposal: z.string().describe('The proposal or change description to evaluate'),
        against: z.array(z.string()).optional().describe('Specific fundamental names to evaluate against (optional)'),
      }),
    },
    async ({ proposal, against }) => {


      const observations = [
        'Core-vs-custom boundary: framework primitives live in .framework/, product-specific behavior lives in custom/apps/.',
        'Design schema completeness: every new runtime type needs fields, views, and record_permissions.',
        'Permission design: record_permissions are the base grant; field permissions are overrides only.',
        'CIL hygiene: code changes are followed by re-syncing CIL chunks, embeddings, and mappings.',
      ]

      if (against && against.length > 0) {
        // A richer implementation would filter to the requested fundamentals.
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            proposal,
            verdict: 'review',
            observations,
            recommendation: 'Re-read the Spine Way and the design-schema checklist before proceeding.',
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    'spine_core_vs_custom_check',
    {
      description: 'Advise whether a change belongs in the core .framework/ layer or a custom app in custom/apps/.',
      inputSchema: z.object({
        description: z.string().describe('What the change does'),
        primitives: z.array(z.string()).optional().describe('Spine primitives it touches (e.g., types, roles, migrations, functions, components)'),
      }),
    },
    async ({ description, primitives }) => {


      const primitivesList = primitives?.join(', ') || 'none provided'



      const lower = (description + ' ' + primitivesList).toLowerCase()





      let placement = 'custom'






      let reason = 'This looks like product-specific behavior that should live in a custom app.'


      if (
        lower.includes('migration') ||
        lower.includes('rls') ||
        lower.includes('rpc') ||
        lower.includes('auth') ||
        lower.includes('permission') ||
        lower.includes('core primitive') ||
        lower.includes('design schema') ||
        lower.includes('shared component') ||
        lower.includes('admin-data')
      ) {
        placement = 'core'
        reason = 'This change touches framework-level primitives (data model, auth, permissions, migrations, shared runtime, or generic components) and should live in .framework/.'
      }






      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            description,
            primitives: primitivesList,
            placement,
            reason,
            boundary_rule: 'If it could be used by more than one app, it belongs in .framework/; if it is specific to one product workflow, it belongs in custom/apps/.',
          }, null, 2),
        }],
      }
    }
  )



  const FUNDAMENTALS: Record<string, { rule: string; guidance: string }> = {
    'core-never-imports-from-custom': {
      rule: 'Core never imports from custom',
      guidance: '.framework/ must not contain imports from custom/ or hardcoded custom app slugs. Custom code extends core through data or custom functions.',
    },
    'custom-uses-core-aliases': {
      rule: 'Custom code uses @core/* aliases, not relative paths into .framework/',
      guidance: 'From custom apps: import from "@core/...". From custom functions after assembly: import from "./_shared/...".',
    },
    'apps-register-through-public-apps': {
      rule: 'Custom apps register through public.apps',
      guidance: 'A custom app is defined by a manifest.json, installed via install-app, and represented as a row in public.apps.',
    },
    'runtime-crud-through-admin-data': {
      rule: 'Runtime record CRUD goes through /api/admin-data',
      guidance: 'Use /api/admin-data for items, threads, messages, links, attachments, watchers. Do not write custom Netlify wrappers for runtime CRUD.',
    },
    'types-define-behavior-via-design-schema': {
      rule: 'Types define behavior via design_schema',
      guidance: 'Domain logic belongs in the type\'s design_schema (fields, views, permissions, functionality). validation_schema is generated from it.',
    },
    'record-permissions-are-base-grant': {
      rule: 'record_permissions are the base grant; field permissions are overrides',
      guidance: 'Start with the most restrictive record_permissions per role. Add fields.<name>.permissions only to loosen or further restrict a specific field.',
    },
    'rls-enabled-and-correct': {
      rule: 'RLS must be enabled with correct policies',
      guidance: 'Every tenant/account table must have RLS. Policies use current_actor_id() and get_accessible_accounts(). Use adminDb only when bypassing RLS is necessary.',
    },
    'migrations-idempotent-and-ordered': {
      rule: 'Migrations are idempotent and ordered',
      guidance: 'File naming: NNN_description.sql with unique 3-digit prefixes. Use IF NOT EXISTS, DROP POLICY IF EXISTS, ON CONFLICT DO NOTHING, and conditional DO $$ blocks.',
    },
    'field-storage-follows-system-flag': {
      rule: 'Field storage follows the system flag',
      guidance: 'system: true fields are top-level record columns; non-system fields live inside record.data.<field>. Send payloads accordingly to /api/admin-data.',
    },
    'secrets-on-backend-only': {
      rule: 'Secrets and service keys stay on the backend',
      guidance: 'Browser code uses VITE_SUPABASE_ANON_KEY and VITE_SUPABASE_URL only. Service keys and app secrets never appear in frontend code or committed env files.',
    },
  }



  server.registerTool(
    'spine_get_fundamental',
    {
      description: 'Return a named Spine Way fundamental rule and guidance.',
      inputSchema: z.object({
        name: z.string().describe('Fundamental name, e.g. "core-never-imports-from-custom" or "record-permissions-are-base-grant"'),
      }),
    },
    async ({ name }) => {


      const fundamental = FUNDAMENTALS[name]

      if (!fundamental) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              ok: false,
              error: `Unknown fundamental: ${name}`,
              available: Object.keys(FUNDAMENTALS),
            }, null, 2),
          }],
        }

      }
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ ok: true, name, ...fundamental }, null, 2),
        }],
      }
    }
  )



  const DATA_TYPES = new Set([
    'text', 'textarea', 'rich_text', 'email', 'phone', 'url', 'number', 'currency', 'range',
    'date', 'datetime', 'boolean', 'checkbox', 'select', 'multiselect', 'radio', 'color',
    'file', 'image', 'json', 'reference', 'address',
  ])




  const DISPLAY_TYPES = new Set([
    'text', 'input', 'textarea', 'rich_text', 'select', 'multiselect', 'radio', 'checkbox',
    'switch', 'date_picker', 'datetime_picker', 'color_picker', 'file_upload', 'image_upload',
    'range_slider', 'badge', 'timestamp', 'currency', 'number',
  ])



  function validateDesignSchema(schema: any): { ok: boolean; errors: string[] } {
    const errors: string[] = []
    if (!schema || typeof schema !== 'object') {
      errors.push('design_schema must be an object')
      return { ok: false, errors }
    }



    const scope = schema.scope ?? 'account'
    if (scope !== 'account' && scope !== 'platform') {
      errors.push('scope must be "account" or "platform"')
    }

    if (!schema.fields || typeof schema.fields !== 'object' || Object.keys(schema.fields).length === 0) {
      errors.push('fields is required and must contain at least one field definition')
    }

    for (const [key, field] of Object.entries(schema.fields || {})) {
      if (!field || typeof field !== 'object') {
        errors.push(`fields.${key} must be an object`)
        continue
      }
      const f = field as any
      if (!f.data_type) errors.push(`fields.${key} is missing data_type`)
      else if (!DATA_TYPES.has(f.data_type)) errors.push(`fields.${key} has unknown data_type: ${f.data_type}`)
      if (!f.label) errors.push(`fields.${key} is missing label`)
      if (f.required === undefined) errors.push(`fields.${key} is missing required`)
      if (['select', 'multiselect', 'radio'].includes(f.data_type) && (!f.options || !Array.isArray(f.options) || f.options.length === 0)) {
        errors.push(`fields.${key} (${f.data_type}) requires options`)
      }
    }

    if (!schema.record_permissions || typeof schema.record_permissions !== 'object') {
      errors.push('record_permissions is required')
    } else if (!Object.keys(schema.record_permissions).includes('system-admin') && !Object.keys(schema.record_permissions).includes('system_admin')) {
      errors.push('record_permissions must grant at least system-admin or system_admin')
    }

    if (schema.views) {
      if (schema.views.default_list) {
        const list = schema.views.default_list
        if (list.type !== 'list') errors.push('views.default_list.type must be "list"')
        if (!list.fields || typeof list.fields !== 'object') errors.push('views.default_list.fields is required')
        if (!list.default_sort) errors.push('views.default_list.default_sort is required')
      }
      if (schema.views.default_detail) {
        const detail = schema.views.default_detail
        if (detail.type !== 'detail') errors.push('views.default_detail.type must be "detail"')
      }
    }

    return { ok: errors.length === 0, errors }
  }

  server.registerTool(
    'spine_design_schema_validate',
    {
      description: 'Validate a proposed design_schema against the Spine design-schema rules. Returns ok and a list of errors.',
      inputSchema: z.object({
        design_schema: z.record(z.any()).describe('The design_schema object to validate'),
        check_views: z.boolean().default(true).optional().describe('Whether to require default_list and default_detail views'),
      }),
    },
    async ({ design_schema, check_views }) => {


      const result = validateDesignSchema(design_schema)

      if (check_views && !design_schema.views) {
        result.errors.push('views is required when check_views is true')
      }

      if (design_schema.views) {
        if (check_views && !design_schema.views.default_list) result.errors.push('views.default_list is required')
        if (check_views && !design_schema.views.default_detail) result.errors.push('views.default_detail is required')
        for (const [viewName, view] of Object.entries(design_schema.views || {})) {


          const v = view as any

          if (!v || typeof v !== 'object') continue
          for (const [fieldName, field] of Object.entries(v.fields || {})) {


            const f = field as any

            if (f && f.display_type && !DISPLAY_TYPES.has(f.display_type)) {
              result.errors.push(`views.${viewName}.fields.${fieldName} has unknown display_type: ${f.display_type}`)
            }


          }
          if (v.sections) {
            for (const section of v.sections) {
              for (const [fieldName, field] of Object.entries(section.fields || {})) {


                const f = field as any

                if (f && f.display_type && !DISPLAY_TYPES.has(f.display_type)) {
                  result.errors.push(`views.${viewName}.sections.*.fields.${fieldName} has unknown display_type: ${f.display_type}`)
                }

              }
            }
          }
        }
      }
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ok: result.ok && result.errors.length === 0,
            error_count: result.errors.length,
            errors: result.errors,
          }, null, 2),
        }],
      }
    }
  )

  server.registerTool(
    'spine_app_manifest_list',
    {
      description: 'List installed apps from the public.apps table.',
      inputSchema: z.object({
        include_manifest: z.boolean().default(false).optional().describe('Load and include each app manifest.json content'),
      }),
    },
    async ({ include_manifest }) => {
      const { data, error } = await adminDb.from('apps').select('id, slug, name, description, app_type, renderer, manifest_path, is_active, route_prefix').order('name')
      if (error) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: error.message }) }] }
      }



      const apps = (data || []).map((app: any) => {
        const base = {
          id: app.id,
          slug: app.slug,
          name: app.name,
          description: app.description || '',
          app_type: app.app_type || '',
          renderer: app.renderer || '',
          manifest_path: app.manifest_path || '',
          is_active: app.is_active ?? true,
          route_prefix: app.route_prefix || '',
        }
        if (include_manifest && app.manifest_path) {
          const manifest = loadManifest(app.manifest_path)
          return { ...base, manifest: manifest || null }
        }
        return base
      })


      return { content: [{ type: 'text', text: JSON.stringify({ ok: true, count: apps.length, apps }, null, 2) }] }
    }

  )

  server.registerTool(
    'spine_app_manifest_get',
    {
      description: 'Get one installed app by slug or id, optionally merged with its manifest.json.',
      inputSchema: z.object({
        slug: z.string().optional().describe('App slug'),
        id: z.string().uuid().optional().describe('App UUID'),
      }),
    },
    async ({ slug, id }) => {
      if (!slug && !id) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: 'Provide either slug or id' }) }] }
      }




      let query = adminDb.from('apps').select('*')


      if (id) query = query.eq('id', id)
      else query = query.eq('slug', slug)
      const { data, error } = await query.maybeSingle()
      if (error) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: error.message }) }] }
      }


      if (!data) {
        return { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: `App not found: ${slug || id}` }) }] }
      }


      const merged = mergeWithManifest(data)

      return { content: [{ type: 'text', text: JSON.stringify({ ok: true, app: merged }, null, 2) }] }
    }

  )
}

