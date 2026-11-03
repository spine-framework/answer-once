// CIL[BEGIN stable_id="~/.framework/src/hooks/useApps.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/hooks/useApps.ts"]
// CIL[DOC-MACRO purpose="Module setup and imports for useApps.ts"]
// CIL[DOC-RESPONSIBILITY responsibility="Establish the public surface and dependencies of useApps.ts"]
// CIL[DOC-CONTEXT module=".framework/src/hooks/useApps.ts" layer="hooks" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports required modules for useApps.ts" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-AUDIENCE audience="frontend"]
// CIL[DOC-STABILITY stability="stable"]




import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import { resolveAppMount } from '../lib/app-mount'
import { useAuth } from '../contexts/AuthContext'
// CIL[DOC-VECTOR type="context" content="purpose='Module setup and imports for useApps.ts'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApps.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/src/hooks/useApps.ts:AppRecord:interface" type="interface" identity="AppRecord" parent="~/.framework/src/hooks/useApps.ts"]
// CIL[DOC-MACRO purpose="Define the AppRecord shape"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the AppRecord type contract"]
// CIL[DOC-CONTEXT module=".framework/src/hooks/useApps.ts" layer="hooks" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="AppRecord interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields of the AppRecord interface" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface AppRecord {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  color?: string
  version?: string
  app_type: string
  source: string
  config: Record<string, any>
  nav_items: any[]
  min_role?: string
  required_roles?: string[]
  is_active: boolean
  is_system: boolean
  route_prefix: string | null
  renderer: 'generic' | 'custom' | 'none'
  preview_domain?: string | null
  prod_domain?: string | null
  preview_route_prefix?: string | null
  prod_route_prefix?: string | null
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the AppRecord shape'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApps.ts:AppRecord:interface"]


// CIL[BEGIN stable_id="~/.framework/src/hooks/useApps.ts:UseAppsResult:interface" type="interface" identity="UseAppsResult" parent="~/.framework/src/hooks/useApps.ts"]
// CIL[DOC-MACRO purpose="Define the UseAppsResult shape"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the UseAppsResult type contract"]
// CIL[DOC-CONTEXT module=".framework/src/hooks/useApps.ts" layer="hooks" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="UseAppsResult interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the fields of the UseAppsResult interface" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface UseAppsResult {
  apps: AppRecord[]
  loading: boolean
  error: string | null
  refetch: () => void
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the UseAppsResult shape'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApps.ts:UseAppsResult:interface"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useApps.ts:useApps:hook" type="hook" identity="useApps" parent="~/.framework/src/hooks/useApps.ts"]
// CIL[DOC-MACRO purpose="Implement useApps"]
// CIL[DOC-RESPONSIBILITY responsibility="Execute the core logic for useApps"]
// CIL[DOC-CONTEXT module=".framework/src/hooks/useApps.ts" layer="hooks" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="UseAppsResult" errors="propagates dependency errors" side_effects="updates React state"]
// CIL[DOC-MICRO logic_summary="Processes inputs, performs work, and returns output for useApps" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function useApps(): UseAppsResult {
  const { user } = useAuth()
  const [apps, setApps] = useState<AppRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApps = async () => {
    if (!user) {
      setApps([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await apiFetch('/api/apps?action=list')

      if (!response.ok) {
        throw new Error(`Failed to fetch apps: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const allApps: AppRecord[] = data.data || data || []

      const accessible = allApps
        .map(app => ({ app, mount: resolveAppMount(app) }))
        .filter(({ app, mount }) => {
          if (!app.is_active) return false
          if (!mount.routable) return false

          const requiredRoles = app.required_roles || (app.min_role ? [app.min_role] : [])

          if (requiredRoles.length === 0) return true

          if (!user.roles || user.roles.length === 0) return false

          if (user.roles.includes('system_admin')) return true

          return requiredRoles.some(role => user.roles!.includes(role))
        })
        .map(({ app, mount }) => ({ ...app, route_prefix: mount.route_prefix }))

      setApps(accessible)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load apps')
      setApps([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [user?.id, user?.account_id])

  return { apps, loading, error, refetch: fetchApps }
}
// CIL[DOC-VECTOR type="context" content="purpose='Implement useApps'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApps.ts:useApps:hook"]

// CIL[BEGIN stable_id="~/.framework/src/hooks/useApps.ts:useRoutableApps:hook" type="hook" identity="useRoutableApps" parent="~/.framework/src/hooks/useApps.ts"]
// CIL[DOC-MACRO purpose="Implement useRoutableApps"]
// CIL[DOC-RESPONSIBILITY responsibility="Execute the core logic for useRoutableApps"]
// CIL[DOC-CONTEXT module=".framework/src/hooks/useApps.ts" layer="hooks" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="filtered UseAppsResult" errors="propagates dependency errors" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Processes inputs, performs work, and returns output for useRoutableApps" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function useRoutableApps() {
  const result = useApps()
  return {
    ...result,
    apps: result.apps.filter(app => app.route_prefix != null && app.renderer !== 'none')
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Implement useRoutableApps'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/hooks/useApps.ts:useRoutableApps:hook"]