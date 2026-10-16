// CIL[BEGIN stable_id="~/.framework/src/hooks/useEntityList.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/hooks/useEntityList.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Provide React and API imports for the useEntityList hook"]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies required by useEntityList"]
// CIL[DOC-CONTEXT module=".framework/src/hooks/useEntityList" layer="ui" related_files=".framework/src/hooks/useApi.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="module-level imports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports useState/useEffect/useCallback from React, useApi helper, and apiFetch utility" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]



import { useState, useEffect, useCallback } from 'react'
import { useApi } from './useApi'
import { apiFetch } from '../lib/api'
// CIL[DOC-VECTOR type="context" content="purpose='Provide React and API imports for the useEntityList hook'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useEntityList.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/src/hooks/useEntityList.ts:MinimalEntityListConfig:interface" type="interface" identity="MinimalEntityListConfig" parent="~/.framework/src/hooks/useEntityList.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Define the minimal configuration shape for useEntityList"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe required and optional list configuration fields"]
// CIL[DOC-CONTEXT module=".framework/src/hooks/useEntityList" layer="ui" related_files=".framework/src/hooks/useApi.ts,.framework/src/hooks/useEntityList.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="MinimalEntityListConfig interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares entity, optional typeSlug, API endpoint/listAction, and default sort settings" notable_decisions="list.defaultSort is required"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
interface MinimalEntityListConfig {
  entity: string
  typeSlug?: string
  api: {
    endpoint: string
    listAction?: string
  }
  list: {
    defaultSort: { field: string; direction: 'asc' | 'desc' }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the minimal configuration shape for useEntityList'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useEntityList.ts:MinimalEntityListConfig:interface"]


// CIL[BEGIN stable_id="~/.framework/src/hooks/useEntityList.ts:UseEntityListReturn:interface" type="interface" identity="UseEntityListReturn" parent="~/.framework/src/hooks/useEntityList.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Define the return shape for useEntityList"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose state and controls returned by the useEntityList hook"]
// CIL[DOC-CONTEXT module=".framework/src/hooks/useEntityList" layer="ui" related_files=".framework/src/hooks/useApi.ts,.framework/src/hooks/useEntityList.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="UseEntityListReturn interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares data, loading, error, refetch, filters, sort, and pagination state accessors" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
interface UseEntityListReturn {
  data: any[]
  loading: boolean
  error: string | null
  refetch: () => void
  filters: Record<string, any>
  setFilters: (filters: Record<string, any>) => void
  sort: { field: string; direction: 'asc' | 'desc' }
  setSort: (sort: { field: string; direction: 'asc' | 'desc' }) => void
  pagination: {
    page: number
    setPage: (page: number) => void
    pageSize: number
    setPageSize: (size: number) => void
    total: number
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the return shape for useEntityList'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useEntityList.ts:UseEntityListReturn:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useEntityList.ts:useEntityList:hook" type="hook" identity="useEntityList" parent="~/.framework/src/hooks/useEntityList.ts"]
// CIL[DOC-AUDIENCE audience="internal"]
// CIL[DOC-MACRO purpose="Fetch and manage a paginated, sortable, filterable list of entities"]
// CIL[DOC-RESPONSIBILITY responsibility="Manage list state, build API query parameters, and expose list controls"]
// CIL[DOC-CONTEXT module=".framework/src/hooks/useEntityList" layer="ui" related_files=".framework/src/hooks/useApi.ts,.framework/src/hooks/useEntityList.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="entity: string, config: MinimalEntityListConfig | null" outputs="UseEntityListReturn" errors="Throws on non-ok API response" side_effects="HTTP GET request, React state updates"]
// CIL[DOC-MICRO logic_summary="Computes URL parameters from filters, sort, and pagination; fetches via apiFetch; resets page on filter changes" notable_decisions="Defaults sort to created_at descending; resets page to 1 when filters change"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function useEntityList(
  entity: string,
  config: MinimalEntityListConfig | null
): UseEntityListReturn {
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [sort, setSort] = useState<{ field: string; direction: 'asc' | 'desc' }>(config?.list?.defaultSort || { field: 'created_at', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  
  const fetchData = useCallback(async () => {
    if (!config) return
    
    const params = new URLSearchParams()
    
    const endpoint = config.api.endpoint || entity
    const action = config.api.listAction || 'list'
    params.append('action', action)
    
    if (config.api.endpoint) {
      params.append('entity', entity)
    }
    
    if (config.typeSlug) {
      params.append('type_slug', config.typeSlug)
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== 'all') {
        params.append(key, value.toString())
      }
    })
    
    params.append('sort_field', sort.field)
    params.append('sort_direction', sort.direction)
    
    params.append('limit', pageSize.toString())
    params.append('offset', ((page - 1) * pageSize).toString())
    
    const response = await apiFetch(`/api/${endpoint}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${entity}: ${response.statusText}`)
    }
    
    const result = await response.json()
    return result.data || []
  }, [entity, config?.api.endpoint, config?.api.listAction, config?.typeSlug, filters, sort, page, pageSize])
  
  const { data, loading, error, execute, refetch } = useApi<any[]>(fetchData, {
    immediate: true
  })

  useEffect(() => {
    if (config) execute()
  }, [config?.api.endpoint, config?.api.listAction, config?.typeSlug])

  useEffect(() => {
    setPage(1)
  }, [filters])
  
  return {
    data: data || [],
    loading,
    error,
    refetch,
    filters,
    setFilters,
    sort,
    setSort,
    pagination: {
      page,
      setPage,
      pageSize,
      setPageSize,
      total: data?.length || 0
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Fetch and manage a paginated, sortable, filterable list of entities'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useEntityList.ts:useEntityList:hook"]