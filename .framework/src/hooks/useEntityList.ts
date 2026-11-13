


import { useState, useEffect, useCallback } from 'react'
import { useApi } from './useApi'
import { apiFetch } from '../lib/api'


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
        // data.<field> is the documented way to filter on non-system fields;
        // PostgREST needs the ->> operator form.
        const paramKey = key.startsWith('data.') ? `data->>${key.slice(5)}` : key
        params.append(paramKey, value.toString())
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