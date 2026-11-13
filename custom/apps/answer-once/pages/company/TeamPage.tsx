// spine-system membership alone is not enough — test/demo people share the account, so the role filter is the discriminator; roles table read directly because /api/roles strips slug for non-system-admins (roles_read RLS is public)
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { useAuth } from '@core/contexts/AuthContext'
import { apiFetch } from '@core/lib/api'
import { supabase } from '@core/lib/supabase'
import { Skeleton } from '@core/components/ui/skeleton'
import { Button } from '@core/components/ui/button'
import { Plus } from 'lucide-react'

async function fetchJSON(path: string, options?: RequestInit) {
  const res = await apiFetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) } })
  const text = await res.text()
  let json: any
  try { json = JSON.parse(text) } catch { throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`) }
  if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`)
  return json.data
}

const SUPPORT_ROLES = new Set(['support', 'support_admin', 'system_admin'])

export default function TeamPage() {
  const appPath = useAppPath()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canAdd = (user?.roles || []).some((r: string) => ['support_admin', 'system_admin'].includes(r))
  const [people, setPeople] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetchJSON('/api/admin-data?entity=accounts&limit=200'),
      // roles_read is a public-read RLS policy; /api/roles sanitizes slugs
      // away for non-system-admins, so read the table directly.
      supabase.from('roles').select('id, slug').eq('is_active', true),
      fetchJSON('/api/admin-data?entity=people&limit=200'),
    ])
      .then(([accounts, rolesRes, persons]) => {
        const roles = rolesRes.data || []
        const platformId = (accounts || []).find((a: any) => a.slug === 'spine-system')?.id
        const roleById = new Map((roles || []).map((r: any) => [r.id, r.slug]))
        setPeople((persons || []).filter((p: any) =>
          p.account_id === platformId && SUPPORT_ROLES.has(roleById.get(p.role_id) || ''),
        ))
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-border flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Team</h1>
          <p className="text-sm text-muted-foreground">Support staff</p>
        </div>
        {canAdd && (
          <Button size="sm" onClick={() => navigate(appPath('/company/team/new'))}>
            <Plus size={14} className="mr-1.5" /> Add support member
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="space-y-2"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : people.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">No team members found.</div>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {people.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(appPath(`/company/team/${p.id}`))}
                className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-brand-gray transition-colors"
              >
                <div className="font-medium text-sm">{p.full_name || p.email}</div>
                {p.email && p.email !== p.full_name && <div className="text-xs text-muted-foreground">{p.email}</div>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
