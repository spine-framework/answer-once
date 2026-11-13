



import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import { resolveAppMount } from '../lib/app-mount'
import { useAuth } from '../contexts/AuthContext'


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
  prod_domains?: string[] | null
  preview_route_prefix?: string | null
  prod_route_prefix?: string | null
}


interface UseAppsResult {
  apps: AppRecord[]
  loading: boolean
  error: string | null
  refetch: () => void
}

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

export function useRoutableApps() {
  const result = useApps()
  return {
    ...result,
    apps: result.apps.filter(app => app.route_prefix != null && app.renderer !== 'none')
  }
}