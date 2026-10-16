// CIL[BEGIN stable_id="~/custom/apps/answer-once/pages/customer/TeamPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Customer team page — people in the account"]
// CIL[DOC-RESPONSIBILITY responsibility="List people associated with the customer's account"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/pages/customer/TeamPage.tsx" layer="custom_app" related_files=".framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX page" errors="none" side_effects="renders DOM"]
// CIL[DOC-MICRO logic_summary="Placeholder — lists people via admin-data" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
import { useState, useEffect } from 'react'
import { apiFetch } from '@core/lib/api'
import { Skeleton } from '@core/components/ui/skeleton'
// CIL[END stable_id="~/custom/apps/answer-once/pages/customer/TeamPage.tsx:module_header:module_header"]

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
