// internal articles cannot appear — they live in spine-system with account scope, so RLS never returns them to a member
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { apiFetch } from '@core/lib/api'
import { SearchFilterBar } from '../../components/SearchFilterBar'
import { Badge } from '@core/components/ui/badge'
import { Skeleton } from '@core/components/ui/skeleton'

interface Article {
  id: string
  title: string
  status?: string
  description?: string
  created_at: string
  data?: Record<string, any>
}

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

export default function KBPage() {
  const appPath = useAppPath()
  const navigate = useNavigate()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchJSON('/api/admin-data?entity=items&type_slugs=ao_kb_article,ao_kb_shared&status=published&limit=200')
      // RLS scopes this already: own-account privates + platform shared.
      // Candidates stamped learning_scope=shared are the draft source of a
      // shared artifact — members should see the artifact, not the draft.
      setArticles((data || []).filter((a: any) => a?.data?.learning_scope !== 'shared'))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-border">
        <h1 className="text-lg font-semibold">Knowledgebase</h1>
        <p className="text-sm text-muted-foreground">Approved answers from your team</p>
      </div>

      <div className="px-6 py-3 border-b border-border">
        <SearchFilterBar
          placeholder="Search articles…"
          value={search}
          onChange={setSearch}
        />
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            {search ? 'No articles match your search.' : 'No published articles yet.'}
          </div>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {filtered.map((a) => {
              // Everything the customer sees here is published + shared by
              // definition — badge only their own private articles. List rows
              // carry stamped design_schema (platform scope = shared artifact),
              // not necessarily type_slug; learning_scope=shared marks the
              // source candidate of a shared artifact (filtered above anyway).
              const isPrivate =
                a?.design_schema?.scope !== 'platform' &&
                a?.type_slug !== 'ao_kb_shared' &&
                a?.data?.learning_scope !== 'shared'
              return (
                <button
                  key={a.id}
                  onClick={() => navigate(appPath(`/kb/${a.id}`))}
                  className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-brand-gray transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm truncate">{a.title}</h3>
                      {a.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                      )}
                    </div>
                    {isPrivate && (
                      <Badge variant="secondary" className="shrink-0">Private</Badge>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
