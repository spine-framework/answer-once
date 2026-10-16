// CIL[BEGIN stable_id="~/.framework/src/contexts/AppContext.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/contexts/AppContext.tsx"]
// CIL[DOC-MACRO purpose="Defines React contexts and hooks for the current app and app registry"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide AppContext and AppsRegistryContext along with their consumers and providers"]
// CIL[DOC-CONTEXT module="contexts" layer="presentation" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Module-level header with imports" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { AppRecord } from '../hooks/useApps'
import { apiFetch } from '../lib/api'
import { useAuth } from './AuthContext'
// CIL[DOC-VECTOR type="context" content="purpose='Defines React contexts and hooks for the current app and app registry'; No verified external callers; imports: .framework/src/hooks/useApps.ts,.framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AppContext.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AppContext.tsx:AppContextType:interface" type="interface" identity="AppContextType" parent="~/.framework/src/contexts/AppContext.tsx"]
// CIL[DOC-MACRO purpose="Type definition for the AppContext value"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the shape of the AppContext value"]
// CIL[DOC-CONTEXT module="contexts" layer="type" related_files=".framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="AppContextType interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares an app field of type AppRecord" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface AppContextType {
  app: AppRecord
}
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for the AppContext value'; No verified external callers; imports: .framework/src/hooks/useApps.ts,.framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AppContext.tsx:AppContextType:interface"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AppContext.tsx:AppContext:constant" type="constant" identity="AppContext" parent="~/.framework/src/contexts/AppContext.tsx"]
// CIL[DOC-MACRO purpose="Creates the React context for the current app"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a context object that holds the current AppRecord"]
// CIL[DOC-CONTEXT module="contexts" layer="presentation" related_files=".framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="AppContextType default undefined" outputs="AppContext object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="createContext with undefined default" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const AppContext = createContext<AppContextType | undefined>(undefined)
// CIL[DOC-VECTOR type="context" content="purpose='Creates the React context for the current app'; No verified external callers; imports: .framework/src/hooks/useApps.ts,.framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AppContext.tsx:AppContext:constant"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AppContext.tsx:useCurrentApp:hook" type="hook" identity="useCurrentApp" parent="~/.framework/src/contexts/AppContext.tsx"]
// CIL[DOC-MACRO purpose="Consumes AppContext and returns the current app record"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the current app from AppContext, throwing if used outside a provider"]
// CIL[DOC-CONTEXT module="contexts" layer="presentation" related_files=".framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="AppRecord" errors="throws Error if context undefined" side_effects="none"]
// CIL[DOC-MICRO logic_summary="useContext check and return the app field" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function useCurrentApp(): AppRecord {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useCurrentApp must be used within an AppProvider')
  }



  return context.app
}
// CIL[DOC-VECTOR type="context" content="purpose='Consumes AppContext and returns the current app record'; No verified external callers; imports: .framework/src/hooks/useApps.ts,.framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AppContext.tsx:useCurrentApp:hook"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AppContext.tsx:AppProviderProps:interface" type="interface" identity="AppProviderProps" parent="~/.framework/src/contexts/AppContext.tsx"]
// CIL[DOC-MACRO purpose="Props type for the AppProvider component"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare app and children props"]
// CIL[DOC-CONTEXT module="contexts" layer="type" related_files=".framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="AppProviderProps interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares app AppRecord and children ReactNode" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface AppProviderProps {
  app: AppRecord
  children: React.ReactNode
}
// CIL[DOC-VECTOR type="context" content="purpose='Props type for the AppProvider component'; No verified external callers; imports: .framework/src/hooks/useApps.ts,.framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AppContext.tsx:AppProviderProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AppContext.tsx:AppProvider:component" type="component" identity="AppProvider" parent="~/.framework/src/contexts/AppContext.tsx"]
// CIL[DOC-MACRO purpose="Provides the current app context to children"]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap children in AppContext.Provider with the provided app"]
// CIL[DOC-CONTEXT module="contexts" layer="presentation" related_files=".framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="app: AppRecord, children: React.ReactNode" outputs="JSX" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders AppContext.Provider with a value object" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function AppProvider({ app, children }: AppProviderProps) {
  return (
    <AppContext.Provider value={{ app }}>
      {children}
    </AppContext.Provider>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Provides the current app context to children'; No verified external callers; imports: .framework/src/hooks/useApps.ts,.framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AppContext.tsx:AppProvider:component"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AppContext.tsx:AppsRegistryContextType:interface" type="interface" identity="AppsRegistryContextType" parent="~/.framework/src/contexts/AppContext.tsx"]
// CIL[DOC-MACRO purpose="Type definition for the apps registry context value"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the shape of apps registry state and actions"]
// CIL[DOC-CONTEXT module="contexts" layer="type" related_files=".framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="AppsRegistryContextType interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares apps, routableApps, loading, error, and refetch fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface AppsRegistryContextType {
  apps: AppRecord[]
  routableApps: AppRecord[]
  loading: boolean
  error: string | null
  refetch: () => void
}
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for the apps registry context value'; No verified external callers; imports: .framework/src/hooks/useApps.ts,.framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AppContext.tsx:AppsRegistryContextType:interface"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AppContext.tsx:AppsRegistryContext:constant" type="constant" identity="AppsRegistryContext" parent="~/.framework/src/contexts/AppContext.tsx"]
// CIL[DOC-MACRO purpose="Creates the React context for the apps registry"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a context object for the apps registry"]
// CIL[DOC-CONTEXT module="contexts" layer="presentation" related_files=".framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="AppsRegistryContext object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="createContext with undefined default" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const AppsRegistryContext = createContext<AppsRegistryContextType | undefined>(undefined)
// CIL[DOC-VECTOR type="context" content="purpose='Creates the React context for the apps registry'; No verified external callers; imports: .framework/src/hooks/useApps.ts,.framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AppContext.tsx:AppsRegistryContext:constant"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AppContext.tsx:useAppsRegistry:hook" type="hook" identity="useAppsRegistry" parent="~/.framework/src/contexts/AppContext.tsx"]
// CIL[DOC-MACRO purpose="Consumes AppsRegistryContext and returns the registry state"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the apps registry context, throwing if used outside a provider"]
// CIL[DOC-CONTEXT module="contexts" layer="presentation" related_files=".framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="AppsRegistryContextType" errors="throws Error if context undefined" side_effects="none"]
// CIL[DOC-MICRO logic_summary="useContext check and return the context object" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function useAppsRegistry(): AppsRegistryContextType {
  const context = useContext(AppsRegistryContext)
  if (context === undefined) {
    throw new Error('useAppsRegistry must be used within an AppsRegistryProvider')
  }



  return context
}
// CIL[DOC-VECTOR type="context" content="purpose='Consumes AppsRegistryContext and returns the registry state'; No verified external callers; imports: .framework/src/hooks/useApps.ts,.framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AppContext.tsx:useAppsRegistry:hook"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AppContext.tsx:AppsRegistryProviderProps:interface" type="interface" identity="AppsRegistryProviderProps" parent="~/.framework/src/contexts/AppContext.tsx"]
// CIL[DOC-MACRO purpose="Props type for the AppsRegistryProvider component"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the children prop"]
// CIL[DOC-CONTEXT module="contexts" layer="type" related_files=".framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="AppsRegistryProviderProps interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares children ReactNode" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface AppsRegistryProviderProps {
  children: React.ReactNode
}
// CIL[DOC-VECTOR type="context" content="purpose='Props type for the AppsRegistryProvider component'; No verified external callers; imports: .framework/src/hooks/useApps.ts,.framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AppContext.tsx:AppsRegistryProviderProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/contexts/AppContext.tsx:AppsRegistryProvider:component" type="component" identity="AppsRegistryProvider" parent="~/.framework/src/contexts/AppContext.tsx"]
// CIL[DOC-MACRO purpose="Fetches and provides the list of apps for the current user"]
// CIL[DOC-RESPONSIBILITY responsibility="Load accessible apps, derive routable apps, and expose registry state"]
// CIL[DOC-CONTEXT module="contexts" layer="presentation" related_files=".framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="children: React.ReactNode" outputs="JSX" errors="network or auth errors surface as error string" side_effects="fetches /api/apps, manages an AbortController, and updates React state"]
// CIL[DOC-MICRO logic_summary="Fetches apps when the user changes, filters routable apps by domain and route, and provides the registry value" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
      setApps(allApps)
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

  const environment = (import.meta.env.VITE_ENVIRONMENT as string) || 'prod'
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : ''

  const appMatchesDomain = (app: AppRecord): boolean => {
    const domain = environment === 'preview' ? app.preview_domain : app.prod_domain
    if (!domain) return true
    const hostname = domain.includes('://') ? new URL(domain).hostname : domain.split(':')[0]
    return currentHost === hostname
  }

  const routableApps = apps.filter(
    app => app.route_prefix != null && app.renderer !== 'none' && appMatchesDomain(app)
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
// CIL[DOC-VECTOR type="context" content="purpose='Fetches and provides the list of apps for the current user'; No verified external callers; imports: .framework/src/hooks/useApps.ts,.framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/contexts/AppContext.tsx:AppsRegistryProvider:component"]
