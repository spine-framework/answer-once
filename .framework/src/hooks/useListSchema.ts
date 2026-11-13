/**
 * @module   useListSchema
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module provides hooks for managing and interacting with list schemas in the application. It utilizes React's state and effect hooks to fetch and update schema data from an API. INVARIANT: The component using this hook must be wrapped in a provider that supplies the necessary context for API calls.
 *
 * @seeAlso apiFetch (handles API requests).
 * @seeAlso DesignSchema (defines the structure of the schema data).
 * @seeAlso View (represents the UI components that utilize the schema).
 *
 * @cil-generated
 */










import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import { DesignSchema, View } from '../types/types'



















/**
 * The UseListSchemaOptions interface defines the options for using a list schema in the framework, allowing for the specification of an entity and an optional view slug for enhanced flexibility in list management.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface UseListSchemaOptions {
  entity: string
  viewSlug?: string
}
















/**
 * The UseListSchemaResult interface defines the structure of the result returned by the useListSchema hook, which is used to manage and retrieve schema data in a React application. It provides information about the loading state, any errors, and a method to refetch the data.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface UseListSchemaResult {
  schema: DesignSchema | null
  view: View | null
  loading: boolean
  error: string | null
  refetch: () => void
}
















/**
 * The useListSchema hook fetches and manages the schema and view for a specified entity in a list format, handling loading states and errors while providing a fallback schema if no data is available.
 *
 * @macro       Custom React hook for managing entity list schemas.
 * @micro       Utilizes asynchronous API calls to fetch data and updates state based on the response.
 * @inputSpec
 *   - options: UseListSchemaOptions (required) — configuration options including entity and optional viewSlug.
 * @outputSpec  UseListSchemaResult — an object containing schema, view, loading state, and error message.
 * @throws      Error — failed to fetch sample record or invalid authentication.
 * @sideEffects API calls to /api/admin-data and /api/types for fetching schema data.
 * @stability   internal
 * @calls       apiFetch
 * @errorHandling Retries fetching schema on specific authentication errors.
 * @cil-generated
 */
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
          const typeResp = await apiFetch(`/api/types?action=list&kind=${kind}`)
          if (typeResp.ok) {
            const typeData = await typeResp.json()
            const typeRecords = Array.isArray(typeData.data) ? typeData.data : []
            if (typeRecords.length === 1 && typeRecords[0]?.design_schema) {
              resolvedSchema = typeRecords[0].design_schema as DesignSchema
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






