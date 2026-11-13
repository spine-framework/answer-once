
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { AppRecord } from '../hooks/useApps'
import { apiFetch } from '../lib/api'
import { resolveAppMount } from '../lib/app-mount'
import { useAuth } from './AuthContext'

interface AppContextType {
  app: AppRecord
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useCurrentApp(): AppRecord {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useCurrentApp must be used within an AppProvider')
  }



  return context.app
}

interface AppProviderProps {
  app: AppRecord
  children: React.ReactNode
}

export function AppProvider({ app, children }: AppProviderProps) {
  return (
    <AppContext.Provider value={{ app }}>
      {children}
    </AppContext.Provider>
  )
}

interface AppsRegistryContextType {
  apps: AppRecord[]
  routableApps: AppRecord[]
  loading: boolean
  error: string | null
  refetch: () => void
}

const AppsRegistryContext = createContext<AppsRegistryContextType | undefined>(undefined)

export function useAppsRegistry(): AppsRegistryContextType {
  const context = useContext(AppsRegistryContext)
  if (context === undefined) {
    throw new Error('useAppsRegistry must be used within an AppsRegistryProvider')
  }



  return context
}

interface AppsRegistryProviderProps {
  children: React.ReactNode
}

export function AppsRegistryProvider({ children }: AppsRegistryProviderProps) {
  const { user } = useAuth()
  const [apps, setApps] = useState<AppRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const loadedForUserRef = useRef<string | null>(null)

  const fetchApps = useCallback(async (signal?: AbortSignal) => {
    if (!user) {
      setApps([])
      setLoading(false)
      loadedForUserRef.current = null
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await apiFetch('/api/apps?action=list', { signal })

      if (signal?.aborted) return

      if (!response.ok) throw new Error(`Failed to fetch apps: ${response.statusText}`)

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      const allApps: AppRecord[] = data.data || data || []
      // Resolve the host-keyed mount up front so every consumer sees the
      // effective route_prefix ('/' on the app's own prod/preview domain).
      setApps(allApps.map(app => ({ ...app, route_prefix: resolveAppMount(app).route_prefix })))
      loadedForUserRef.current = user.id
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Failed to load apps')
      setApps([])
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [user])

  const rolesKey = user?.roles?.join(',') || ''
  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    fetchApps(controller.signal)

    return () => controller.abort()
  }, [user?.id, user?.account_id, rolesKey, fetchApps])

  const effectiveLoading = loading || (!!user && loadedForUserRef.current !== user.id)

  const routableApps = apps.filter(
    app => app.route_prefix != null && app.renderer !== 'none' && resolveAppMount(app).routable
  )

  const refetch = useCallback(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    fetchApps(controller.signal)
  }, [fetchApps])

  return (
    <AppsRegistryContext.Provider value={{ apps, routableApps, loading: effectiveLoading, error, refetch }}>
      {children}
    </AppsRegistryContext.Provider>
  )
}
