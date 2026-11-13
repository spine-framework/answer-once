import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { apiFetch } from '@core/lib/api'
import { StatusBadge } from '../../components/StatusBadge'
import { Skeleton } from '@core/components/ui/skeleton'

async function fetchJSON(path: string, options?: RequestInit) {
  const res = await apiFetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) } })
  const text = await res.text()
  let json: any
  try { json = JSON.parse(text) } catch { throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`) }
  if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`)
  return json.data
}

export default function KBReviewPage() {
  const appPath = useAppPath()
  const navigate = useNavigate()
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchJSON('/api/admin-data?entity=items&type_slug=ao_kb_article')
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setArticles(list.filter((a: any) => a.status === 'candidate' || a.status === 'in_review'))
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-border">
        <h1 className="text-lg font-semibold">Knowledge Review</h1>
        <p className="text-sm text-muted-foreground">Candidates awaiting approval</p>
      </div>
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="space-y-2"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : articles.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-lg max-w-2xl mx-auto">
            No knowledge candidates awaiting review.
          </div>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {articles.map((a) => (
              <button
                key={a.id}
                onClick={() => navigate(appPath(`/company/kb/${a.id}`))}
                className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-brand-gray transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm truncate">{a.title}</h3>
                    {a.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>}
                  </div>
                  <StatusBadge status={a.status || 'candidate'} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
