// CIL[BEGIN stable_id="~/.framework/src/hooks/useListSchema.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/hooks/useListSchema.ts"]
// CIL[DOC-AUDIENCE audience="frontend"]
// CIL[DOC-CONTEXT module="useListSchema" layer="hooks" related_files=".framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="React hooks, apiFetch and DesignSchema/View imports available to the module" errors="none" side_effects="none"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MACRO purpose="React hook module for loading entity list design schemas"]
// CIL[DOC-MICRO logic_summary="Imports useState, useEffect, apiFetch and local DesignSchema/View types" notable_decisions="[]"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the useListSchema hook and its option/result type definitions"]
// CIL[DOC-STABILITY stability="stable"]

import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import { DesignSchema, View } from '../types/types'
// CIL[DOC-VECTOR type="context" content="purpose='React hook module for loading entity list design schemas'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useListSchema.ts:module_header:module_header"]




// CIL[BEGIN stable_id="~/.framework/src/hooks/useListSchema.ts:UseListSchemaOptions:interface" type="interface" identity="UseListSchemaOptions" parent="~/.framework/src/hooks/useListSchema.ts"]
// CIL[DOC-MACRO purpose="Defines the input options for the useListSchema hook"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare entity and optional viewSlug used to resolve the list schema"]
// CIL[DOC-CONTEXT module="useListSchema" layer="hooks" related_files=".framework/src/hooks/useListSchema.ts,.framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="entity: string and viewSlug?: string" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface UseListSchemaOptions {
  entity: string
  viewSlug?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the input options for the useListSchema hook'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useListSchema.ts:UseListSchemaOptions:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useListSchema.ts:UseListSchemaResult:interface" type="interface" identity="UseListSchemaResult" parent="~/.framework/src/hooks/useListSchema.ts"]
// CIL[DOC-MACRO purpose="Defines the return shape of the useListSchema hook"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare schema, view, loading state, error and refetch callback"]
// CIL[DOC-CONTEXT module="useListSchema" layer="hooks" related_files=".framework/src/hooks/useListSchema.ts,.framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="schema, view, loading, error and refetch fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface UseListSchemaResult {
  schema: DesignSchema | null
  view: View | null
  loading: boolean
  error: string | null
  refetch: () => void
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the return shape of the useListSchema hook'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useListSchema.ts:UseListSchemaResult:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useListSchema.ts:useListSchema:hook" type="hook" identity="useListSchema" parent="~/.framework/src/hooks/useListSchema.ts"]
// CIL[DOC-CONTEXT module="useListSchema" layer="hooks" related_files=".framework/src/hooks/useListSchema.ts,.framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="options: UseListSchemaOptions" outputs="UseListSchemaResult" errors="Network or API errors set the error string" side_effects="Calls apiFetch on mount and when entity/viewSlug changes; updates local state"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-MACRO purpose="React hook that loads the design schema and view definition for an entity list"]
// CIL[DOC-MICRO logic_summary="Fetches a sample record to read stamped design_schema; falls back to type lookup and generic fallback views; supports JWT retry" notable_decisions="[]"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch and resolve the list design schema and selected view for a given entity"]
// CIL[DOC-STABILITY stability="stable"]
export function useListSchema(options: UseListSchemaOptions): UseListSchemaResult {
  const { entity, viewSlug = 'default_list' } = options
  
  const [schema, setSchema] = useState<DesignSchema | null>(null)
  const [view, setView] = useState<View | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchema = async () => {
    let cancelled = false
    
    try {
      setLoading(true)
      setError(null)

      const response = await apiFetch(`/api/admin-data?action=list&entity=${entity}&limit=1`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sample record: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        if (
          data.error.includes('Invalid authentication') ||
          data.error.includes('Unauthorized') ||
          data.error.includes('JWT')
        ) {
          if (cancelled) return
          await new Promise(resolve => setTimeout(resolve, 300))
          if (!cancelled) fetchSchema()
          return
        }
        throw new Error(data.error || 'Failed to fetch records')
      }

      if (!data.data || data.data.length === 0) {
        if (cancelled) return
        const fallback: DesignSchema = {
          fields: {},
          record_permissions: {},
          views: {
            [viewSlug]: {
              type: 'list',
              label: 'Default List',
              fields: {
                id: { sortable: false, display_type: 'text' },
                created_at: { sortable: true, display_type: 'timestamp' }
              },
              display: 'table',
              default_sort: { field: 'created_at', direction: 'desc' }
            }
          }
        }
        setSchema(fallback)
        setView(fallback.views![viewSlug]!)
        setLoading(false)
        return
      }

      const sampleRecord = data.data[0]
      
      const stampedSchema = sampleRecord.design_schema as DesignSchema | undefined
      const stampedView = stampedSchema?.views?.[viewSlug]

      if (stampedSchema && stampedView) {
        if (cancelled) return
        setSchema(stampedSchema)
        setView(stampedView)
      } else {
        const kindMap: Record<string, string> = { accounts: 'account', people: 'person', items: 'item', threads: 'thread', messages: 'message', links: 'link', attachments: 'attachment', watchers: 'watcher', item_progress: 'progress' }
        const kind = kindMap[entity]
        let resolvedSchema: DesignSchema | null = null

        if (kind) {
          const typeResp = await apiFetch(`/api/types?kind=${kind}&limit=1`)
          if (typeResp.ok) {
            const typeData = await typeResp.json()
            const typeRecord = typeData.data?.[0]
            if (typeRecord?.design_schema) {
              resolvedSchema = typeRecord.design_schema as DesignSchema
            }
          }
        }

        if (resolvedSchema) {
          const resolvedView = resolvedSchema.views?.[viewSlug]
          if (resolvedView) {
            if (cancelled) return
            setSchema(resolvedSchema)
            setView(resolvedView)
          } else {
            const fallback: DesignSchema = {
              fields: {},
              record_permissions: {},
              views: {
                [viewSlug]: {
                  type: 'list',
                  label: entity.charAt(0).toUpperCase() + entity.slice(1),
                  fields: {
                    id: { sortable: false, display_type: 'text' },
                    created_at: { sortable: true, display_type: 'timestamp' }
                  },
                  display: 'table',
                  default_sort: { field: 'created_at', direction: 'desc' }
                }
              }
            }
            if (cancelled) return
            setSchema(fallback)
            setView(fallback.views![viewSlug]!)
          }
        } else {
          const fallback: DesignSchema = {
            fields: {},
            record_permissions: {},
            views: {
              [viewSlug]: {
                type: 'list',
                label: entity.charAt(0).toUpperCase() + entity.slice(1),
                fields: {
                  id: { sortable: false, display_type: 'text' },
                  created_at: { sortable: true, display_type: 'timestamp' }
                },
                display: 'table',
                default_sort: { field: 'created_at', direction: 'desc' }
              }
            }
          }
          if (cancelled) return
          setSchema(fallback)
          setView(fallback.views![viewSlug]!)
        }
      }

    } catch (err) {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'Failed to load schema')
        setSchema(null)
        setView(null)
      }
    } finally {
      if (!cancelled) {
        setLoading(false)
      }
    }

    return () => {
      cancelled = true
    }
  }

  useEffect(() => {
    if (entity) {
      fetchSchema()
    } else {
      setError('Entity is required')
      setLoading(false)
    }
  }, [entity, viewSlug])

  return {
    schema,
    view,
    loading,
    error,
    refetch: fetchSchema
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='React hook that loads the design schema and view definition for an entity list'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/types/types.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useListSchema.ts:useListSchema:hook"]