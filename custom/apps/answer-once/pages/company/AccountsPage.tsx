import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { useAuth } from '@core/contexts/AuthContext'
import { apiFetch } from '@core/lib/api'
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

export default function AccountsPage() {
  const appPath = useAppPath()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canCreate = (user?.roles || []).some((r: string) => ['support_admin', 'system_admin'].includes(r))
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJSON('/api/admin-data?entity=accounts')
      .then((data) => setAccounts(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-border flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Accounts</h1>
          <p className="text-sm text-muted-foreground">Customer organizations</p>
        </div>
        {canCreate && (
          <Button size="sm" onClick={() => navigate(appPath('/company/accounts/new'))}>
            <Plus size={14} className="mr-1.5" /> New account
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="space-y-2"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : accounts.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">No accounts found.</div>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {accounts.map((a) => (
              <button
                key={a.id}
                onClick={() => navigate(appPath(`/company/accounts/${a.id}`))}
                className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-brand-gray transition-colors"
              >
                <div className="font-medium text-sm">{a.display_name || a.slug || a.id}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
