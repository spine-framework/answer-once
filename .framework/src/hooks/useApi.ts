// CIL[BEGIN stable_id="~/.framework/src/hooks/useApi.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/hooks/useApi.ts"]
// CIL[DOC-MACRO purpose="React hooks for asynchronous API operations including fetching, pagination, and mutations"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide reusable React hooks that encapsulate data fetching, pagination, and mutation state"]
// CIL[DOC-CONTEXT module="hooks" layer="frontend" related_files=".framework/src/hooks/useApi.ts"]
// CIL[DOC-CONTRACT inputs="" outputs="useApi, usePaginatedApi, useMutation" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Exports three hooks for asynchronous API state management" notable_decisions="Keeps related data fetching patterns in a single module"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="frontend-developers"]













import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation } from 'react-router-dom'
// CIL[DOC-VECTOR type="context" content="purpose='React hooks for asynchronous API operations including fetching, pagination, and mutations'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApi.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useApi.ts:ApiState:interface" type="interface" identity="ApiState" parent="~/.framework/src/hooks/useApi.ts"]
// CIL[DOC-MACRO purpose="Type definition for ApiState"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the fields and shape of the ApiState interface"]
// CIL[DOC-CONTEXT module="hooks" layer="frontend" related_files=".framework/src/hooks/useApi.ts"]
// CIL[DOC-CONTRACT inputs="generic type parameters" outputs="data, loading, error, lastFetched" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the structure of the ApiState data object" notable_decisions="Tracks lastFetched to record the most recent successful fetch"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  lastFetched: Date | null
}
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for ApiState'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApi.ts:ApiState:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useApi.ts:UseApiOptions:interface" type="interface" identity="UseApiOptions" parent="~/.framework/src/hooks/useApi.ts"]
// CIL[DOC-MACRO purpose="Type definition for UseApiOptions"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the fields and shape of the UseApiOptions interface"]
// CIL[DOC-CONTEXT module="hooks" layer="frontend" related_files=".framework/src/hooks/useApi.ts"]
// CIL[DOC-CONTRACT inputs="generic type parameters" outputs="immediate, onSuccess, onError, initialData, deps" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the structure of the UseApiOptions data object" notable_decisions="Uses generics to remain flexible across concrete API payloads"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface UseApiOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  initialData?: T
  deps?: any[]
}
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for UseApiOptions'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApi.ts:UseApiOptions:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useApi.ts:UseApiReturn:interface" type="interface" identity="UseApiReturn" parent="~/.framework/src/hooks/useApi.ts"]
// CIL[DOC-MACRO purpose="Type definition for UseApiReturn"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the fields and shape of the UseApiReturn interface"]
// CIL[DOC-CONTEXT module="hooks" layer="frontend" related_files=".framework/src/hooks/useApi.ts"]
// CIL[DOC-CONTRACT inputs="generic type parameters" outputs="data, loading, error, execute, reset, refetch" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the structure of the UseApiReturn data object" notable_decisions="Returns both state and controller functions"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (params?: any) => Promise<T>
  reset: () => void
  refetch: () => Promise<T>
}
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for UseApiReturn'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApi.ts:UseApiReturn:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useApi.ts:useApi:hook" type="hook" identity="useApi" parent="~/.framework/src/hooks/useApi.ts"]
// CIL[DOC-MACRO purpose="React hook for fetching data from an API with cancellation support"]
// CIL[DOC-RESPONSIBILITY responsibility="Manage async state and lifecycle for useApi"]
// CIL[DOC-CONTEXT module="hooks" layer="frontend" related_files=".framework/src/hooks/useApi.ts"]
// CIL[DOC-CONTRACT inputs="apiFunction returning a Promise<T> and UseApiOptions<T>" outputs="UseApiReturn<T> with data, loading, error, execute, reset, refetch" errors="Throws non-AbortError after updating state.error" side_effects="Calls apiFunction, updates React state, invokes onSuccess/onError, logs metrics"]
// CIL[DOC-MICRO logic_summary="Encapsulates a single async request lifecycle with request cancellation" notable_decisions="Uses refs to keep the latest callback versions and aborts previous in-flight requests"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function useApi<T>(
  apiFunction: (params?: any) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const { immediate = false, onSuccess, onError, initialData = null } = options
  const location = useLocation()
  
  const apiFunctionRef = useRef(apiFunction)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  const immediateRef = useRef(immediate)
  const initialDataRef = useRef(initialData)
  
  apiFunctionRef.current = apiFunction
  onSuccessRef.current = onSuccess
  onErrorRef.current = onError
  immediateRef.current = immediate
  initialDataRef.current = initialData

  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
    lastFetched: null
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const execute = useCallback(async (params?: any) => {
    const abortController = new AbortController()
    const { signal } = abortController
    
    abortControllerRef.current?.abort()
    abortControllerRef.current = abortController

    console.log('useApi execute: starting request', { signalAborted: signal.aborted })
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const startTime = Date.now()
      const result = await apiFunctionRef.current({ ...params, signal })
      const duration = Date.now() - startTime

      console.log(JSON.stringify({
        type: 'spine_api_call',
        timestamp: new Date().toISOString(),
        duration_ms: duration,
        status: 'success',
        signal_aborted: signal.aborted
      }))
      if (signal.aborted) {
        console.log('useApi execute: request was aborted, returning result')
        return result
      }
      setState({
        data: result,
        loading: false,
        error: null,
        lastFetched: new Date()
      })
      onSuccessRef.current?.(result)
      return result
    } catch (error: any) {
      console.log('useApi execute: request failed', { error, signalAborted: signal.aborted, errorName: error?.name })
      if ((error as any)?.name === 'AbortError') {
        console.log('useApi execute: abort error, throwing')
        throw error
      }
      const errorMessage = error?.message || 'An error occurred'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      onErrorRef.current?.(errorMessage)
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    abortControllerRef.current?.abort()
    setState({
      data: initialDataRef.current,
      loading: false,
      error: null,
      lastFetched: null
    })
  }, [])

  const refetch = useCallback(() => {
    return execute()
  }, [execute])

  useEffect(() => {
    if (!immediateRef.current) return
    setState({
      data: initialDataRef.current,
      loading: false,
      error: null,
      lastFetched: null
    })
    const timeoutId = setTimeout(() => { execute() }, 0)
    return () => {
      clearTimeout(timeoutId)
      abortControllerRef.current?.abort()
    }
  }, [location.pathname, execute])

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
    refetch
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='React hook for fetching data from an API with cancellation support'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApi.ts:useApi:hook"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useApi.ts:PaginatedApiState:interface" type="interface" identity="PaginatedApiState" parent="~/.framework/src/hooks/useApi.ts"]
// CIL[DOC-MACRO purpose="Type definition for PaginatedApiState"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the fields and shape of the PaginatedApiState interface"]
// CIL[DOC-CONTEXT module="hooks" layer="frontend" related_files=".framework/src/hooks/useApi.ts"]
// CIL[DOC-CONTRACT inputs="generic type parameters" outputs="data, loading, error, lastFetched, pagination" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the structure of the PaginatedApiState data object" notable_decisions="Extends ApiState with a pagination block"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface PaginatedApiState<T> extends ApiState<T[]> {
  pagination: {
    page: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for PaginatedApiState'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApi.ts:PaginatedApiState:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useApi.ts:UsePaginatedApiOptions:interface" type="interface" identity="UsePaginatedApiOptions" parent="~/.framework/src/hooks/useApi.ts"]
// CIL[DOC-MACRO purpose="Type definition for UsePaginatedApiOptions"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the fields and shape of the UsePaginatedApiOptions interface"]
// CIL[DOC-CONTEXT module="hooks" layer="frontend" related_files=".framework/src/hooks/useApi.ts"]
// CIL[DOC-CONTRACT inputs="generic type parameters" outputs="immediate, onSuccess, onError, initialData, deps, itemsPerPage" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the structure of the UsePaginatedApiOptions data object" notable_decisions="Extends UseApiOptions with pagination settings"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface UsePaginatedApiOptions<T> extends UseApiOptions<T[]> {
  itemsPerPage?: number
}
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for UsePaginatedApiOptions'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApi.ts:UsePaginatedApiOptions:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useApi.ts:UsePaginatedApiReturn:interface" type="interface" identity="UsePaginatedApiReturn" parent="~/.framework/src/hooks/useApi.ts"]
// CIL[DOC-MACRO purpose="Type definition for UsePaginatedApiReturn"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the fields and shape of the UsePaginatedApiReturn interface"]
// CIL[DOC-CONTEXT module="hooks" layer="frontend" related_files=".framework/src/hooks/useApi.ts"]
// CIL[DOC-CONTRACT inputs="generic type parameters" outputs="data, loading, error, execute, reset, refetch, pagination, setPage, setItemsPerPage, nextPage, prevPage, hasNextPage, hasPrevPage" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the structure of the UsePaginatedApiReturn data object" notable_decisions="Exposes pagination control methods in addition to base useApi return values"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface UsePaginatedApiReturn<T> extends UseApiReturn<T[]> {
  pagination: PaginatedApiState<T>['pagination']
  setPage: (page: number) => void
  setItemsPerPage: (itemsPerPage: number) => void
  nextPage: () => void
  prevPage: () => void
  hasNextPage: boolean
  hasPrevPage: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for UsePaginatedApiReturn'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApi.ts:UsePaginatedApiReturn:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useApi.ts:usePaginatedApi:hook" type="hook" identity="usePaginatedApi" parent="~/.framework/src/hooks/useApi.ts"]
// CIL[DOC-MACRO purpose="React hook for paginated API fetching"]
// CIL[DOC-RESPONSIBILITY responsibility="Manage async state and lifecycle for usePaginatedApi"]
// CIL[DOC-CONTEXT module="hooks" layer="frontend" related_files=".framework/src/hooks/useApi.ts"]
// CIL[DOC-CONTRACT inputs="apiFunction returning {data: T[], pagination} and UsePaginatedApiOptions<T>" outputs="UsePaginatedApiReturn<T> with pagination controls" errors="Throws on API error after setting state.error" side_effects="Fetches new page when page or itemsPerPage changes"]
// CIL[DOC-MICRO logic_summary="Manages paginated state and refetches when pagination parameters change" notable_decisions="Resets to page 1 when itemsPerPage changes and exposes nextPage/prevPage helpers"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function usePaginatedApi<T>(
  apiFunction: (params: { page: number; itemsPerPage: number; [key: string]: any }) => Promise<{
    data: T[]
    pagination: {
      page: number
      totalPages: number
      totalItems: number
      itemsPerPage: number
    }
  }>,
  options: UsePaginatedApiOptions<T> = {}
): UsePaginatedApiReturn<T> {
  const { itemsPerPage: defaultItemsPerPage = 20, ...apiOptions } = options
  
  const [state, setState] = useState<PaginatedApiState<T>>({
    data: [],
    loading: false,
    error: null,
    lastFetched: null,
    pagination: {
      page: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: defaultItemsPerPage
    }
  })

  const execute = useCallback(async (params?: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await apiFunction({
        page: state.pagination.page,
        itemsPerPage: state.pagination.itemsPerPage,
        ...params
      })
      
      setState({
        data: result.data,
        loading: false,
        error: null,
        lastFetched: new Date(),
        pagination: result.pagination
      })
      
      apiOptions.onSuccess?.(result.data)
      return result.data
    } catch (error: any) {
      const errorMessage = error?.message || 'An error occurred'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      apiOptions.onError?.(errorMessage)
      throw error
    }
  }, [apiFunction, state.pagination.page, state.pagination.itemsPerPage, apiOptions])

  const setPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        page
      }
    }))
  }, [])

  const setItemsPerPage = useCallback((itemsPerPage: number) => {
    setState(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        itemsPerPage,
        page: 1
      }
    }))
  }, [])

  const nextPage = useCallback(() => {
    if (state.pagination.page < state.pagination.totalPages) {
      setPage(state.pagination.page + 1)
    }
  }, [state.pagination.page, state.pagination.totalPages, setPage])

  const prevPage = useCallback(() => {
    if (state.pagination.page > 1) {
      setPage(state.pagination.page - 1)
    }
  }, [state.pagination.page, setPage])

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      error: null,
      lastFetched: null,
      pagination: {
        page: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: defaultItemsPerPage
      }
    })
  }, [defaultItemsPerPage])

  const refetch = useCallback(() => {
    return execute()
  }, [execute])

  const hasNextPage = state.pagination.page < state.pagination.totalPages
  const hasPrevPage = state.pagination.page > 1

  useEffect(() => {
    if (apiOptions.immediate) {
      execute()
    }
  }, [state.pagination.page, state.pagination.itemsPerPage, apiOptions.immediate, execute])

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute,
    reset,
    refetch,
    pagination: state.pagination,
    setPage,
    setItemsPerPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='React hook for paginated API fetching'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApi.ts:usePaginatedApi:hook"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useApi.ts:MutationState:interface" type="interface" identity="MutationState" parent="~/.framework/src/hooks/useApi.ts"]
// CIL[DOC-MACRO purpose="Type definition for MutationState"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the fields and shape of the MutationState interface"]
// CIL[DOC-CONTEXT module="hooks" layer="frontend" related_files=".framework/src/hooks/useApi.ts"]
// CIL[DOC-CONTRACT inputs="generic type parameters" outputs="data, loading, error" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the structure of the MutationState data object" notable_decisions="Uses generics to remain flexible across concrete API payloads"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface MutationState<T> {
  data: T | null
  loading: boolean
  error: string | null
}
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for MutationState'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApi.ts:MutationState:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useApi.ts:UseMutationOptions:interface" type="interface" identity="UseMutationOptions" parent="~/.framework/src/hooks/useApi.ts"]
// CIL[DOC-MACRO purpose="Type definition for UseMutationOptions"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the fields and shape of the UseMutationOptions interface"]
// CIL[DOC-CONTEXT module="hooks" layer="frontend" related_files=".framework/src/hooks/useApi.ts"]
// CIL[DOC-CONTRACT inputs="generic type parameters" outputs="onSuccess, onError, onSettled" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the structure of the UseMutationOptions data object" notable_decisions="Uses generics to remain flexible across concrete API payloads"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface UseMutationOptions<T, P> {
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  onSettled?: () => void
}
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for UseMutationOptions'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApi.ts:UseMutationOptions:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useApi.ts:UseMutationReturn:interface" type="interface" identity="UseMutationReturn" parent="~/.framework/src/hooks/useApi.ts"]
// CIL[DOC-MACRO purpose="Type definition for UseMutationReturn"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the fields and shape of the UseMutationReturn interface"]
// CIL[DOC-CONTEXT module="hooks" layer="frontend" related_files=".framework/src/hooks/useApi.ts"]
// CIL[DOC-CONTRACT inputs="generic type parameters" outputs="data, loading, error, mutate, reset" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the structure of the UseMutationReturn data object" notable_decisions="Provides a mutate trigger and reset for optimistic UIs"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface UseMutationReturn<T, P> {
  data: T | null
  loading: boolean
  error: string | null
  mutate: (params: P) => Promise<T>
  reset: () => void
}
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for UseMutationReturn'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApi.ts:UseMutationReturn:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useApi.ts:useMutation:hook" type="hook" identity="useMutation" parent="~/.framework/src/hooks/useApi.ts"]
// CIL[DOC-MACRO purpose="React hook for mutation operations"]
// CIL[DOC-RESPONSIBILITY responsibility="Manage async state and lifecycle for useMutation"]
// CIL[DOC-CONTEXT module="hooks" layer="frontend" related_files=".framework/src/hooks/useApi.ts"]
// CIL[DOC-CONTRACT inputs="mutationFunction(params: P) => Promise<T> and UseMutationOptions<T, P>" outputs="UseMutationReturn<T, P> with data, loading, error, mutate, reset" errors="Throws mutation error after setting state.error" side_effects="Updates React state and calls onSuccess/onError/onSettled callbacks"]
// CIL[DOC-MICRO logic_summary="Encapsulates a mutation request and reset lifecycle" notable_decisions="Calls onSettled in a finally block to allow cleanup after success or failure"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function useMutation<T, P = void>(
  mutationFunction: (params: P) => Promise<T>,
  options: UseMutationOptions<T, P> = {}
): UseMutationReturn<T, P> {
  const { onSuccess, onError, onSettled } = options
  
  const [state, setState] = useState<MutationState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const mutate = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const result = await mutationFunction(params)
      setState({
        data: result,
        loading: false,
        error: null
      })
      onSuccess?.(result)
      return result
    } catch (error: any) {
      const errorMessage = error?.message || 'An error occurred'
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      onError?.(errorMessage)
      throw error
    } finally {
      onSettled?.()
    }
  }, [mutationFunction, onSuccess, onError, onSettled])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    })
  }, [])

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    mutate,
    reset
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='React hook for mutation operations'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApi.ts:useMutation:hook"]