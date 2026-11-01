// validate-schema — standalone design_schema validator.
//
// Ported from .framework/mcp/tools/architect.ts (the retired Spine MCP
// architect tools) so `spine-schema` and CI have a runnable validator without
// the MCP server. `validate-app` covers app packages (manifest/package.json/
// structure) — this command covers a single design_schema JSON file.

import type { Command } from 'commander'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

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

/**
 * Validate a design_schema object. `checkViews` additionally requires
 * views.default_list / views.default_detail and scans every declared
 * display_type — the generic runtime UI breaks without them.
 */
export function validateDesignSchema(
  schema: any,
  opts: { checkViews?: boolean } = {},
): { ok: boolean; errors: string[] } {
  const checkViews = opts.checkViews ?? true
  const errors: string[] = []
  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
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

  if (checkViews && !schema.views) {
    errors.push('views is required when check_views is true')
  }
  if (schema.views) {
    if (checkViews && !schema.views.default_list) errors.push('views.default_list is required')
    if (checkViews && !schema.views.default_detail) errors.push('views.default_detail is required')
    for (const [viewName, view] of Object.entries(schema.views || {})) {
      const v = view as any
      if (!v || typeof v !== 'object') continue
      for (const [fieldName, field] of Object.entries(v.fields || {})) {
        const f = field as any
        if (f && f.display_type && !DISPLAY_TYPES.has(f.display_type)) {
          errors.push(`views.${viewName}.fields.${fieldName} has unknown display_type: ${f.display_type}`)
        }
      }
      if (v.sections) {
        for (const section of v.sections) {
          for (const [fieldName, field] of Object.entries(section.fields || {})) {
            const f = field as any
            if (f && f.display_type && !DISPLAY_TYPES.has(f.display_type)) {
              errors.push(`views.${viewName}.sections.*.fields.${fieldName} has unknown display_type: ${f.display_type}`)
            }
          }
        }
      }
    }
  }

  return { ok: errors.length === 0, errors }
}

export function registerValidateSchemaCommands(program: Command) {
  program
    .command('validate-schema')
    .description('Validate a design_schema JSON file against the Spine design-schema rules')
    .argument('<file>', 'Path to a design_schema JSON file')
    .option('--no-views', 'Skip the default_list/default_detail view requirements (custom apps)')
    .option('--json', 'Output the result as JSON')
    .action(async (file: string, opts: { views: boolean; json: boolean }) => {
      const abs = resolve(file)
      if (!existsSync(abs)) {
        console.error(`❌ file not found: ${file}`)
        process.exit(1)
      }
      let schema: any
      try {
        schema = JSON.parse(readFileSync(abs, 'utf8'))
      } catch (err: any) {
        console.error(`❌ ${file} is not valid JSON: ${err.message}`)
        process.exit(1)
      }

      const result = validateDesignSchema(schema, { checkViews: opts.views })

      if (opts.json) {
        console.log(JSON.stringify({ ok: result.ok, error_count: result.errors.length, errors: result.errors }, null, 2))
      } else if (result.ok) {
        console.log(`✅ ${file}: design_schema is valid`)
      } else {
        console.error(`❌ ${file}: ${result.errors.length} design_schema error(s)`)
        for (const e of result.errors) console.error(`   - ${e}`)
      }
      if (!result.ok) process.exit(1)
    })
}
