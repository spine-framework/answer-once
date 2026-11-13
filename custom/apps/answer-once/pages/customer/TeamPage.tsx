import { useState, useEffect } from 'react'
import { apiFetch } from '@core/lib/api'
import { Skeleton } from '@core/components/ui/skeleton'

async function fetchJSON(path: string, options?: RequestInit) {
  const res = await apiFetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  })
  const text = await res.text()
  let json: any
  try { json = JSON.parse(text) } catch {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`)
  }
  if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`)
  return json.data
}

export default function TeamPage() {
  const [people, setPeople] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJSON('/api/admin-data?entity=people')
      .then((data) => setPeople(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-border">
        <h1 className="text-lg font-semibold">Team</h1>
        <p className="text-sm text-muted-foreground">People in your organization</p>
      </div>
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : people.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">No team members found.</div>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {people.map((p) => (
              <div key={p.id} className="p-4 rounded-lg border border-border bg-card">
                <div className="font-medium text-sm">{p.name || p.email}</div>
                {p.email && <div className="text-xs text-muted-foreground">{p.email}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
