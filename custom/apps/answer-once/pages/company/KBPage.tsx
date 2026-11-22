import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { apiFetch } from '@core/lib/api'
import { SearchFilterBar } from '../../components/SearchFilterBar'
import { StatusBadge } from '../../components/StatusBadge'
import { decodeEntities } from '../../utils/text'
import { Badge } from '@core/components/ui/badge'
import { Skeleton } from '@core/components/ui/skeleton'

async function fetchJSON(path: string, options?: RequestInit) {
  const res = await apiFetch(path, { ...options, headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) } })
  const text = await res.text()
  let json: any
  try { json = JSON.parse(text) } catch { throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`) }
  if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`)
  return json.data
}

const FLAVOR_LABEL: Record<string, string> = {
  private: 'Private',
  internal: 'Internal',
  shared: 'Shared',
}

// admin-data returns whole rows — 500+ articles each carrying data.content
// blows Netlify's 6MB function-response cap, so fetch in 150-row pages
// (each ~1.5MB) until a short page.
async function fetchPaged(path: string, pageSize = 150, cap = 1200) {
  const out: any[] = []
  for (let off = 0; off < cap; off += pageSize) {
    const page = await fetchJSON(`${path}&limit=${pageSize}&offset=${off}`)
    if (!Array.isArray(page) || page.length === 0) break
    out.push(...page)
    if (page.length < pageSize) break
  }
  return out
}

function flavorOf(a: any): string | null {
  if (a?.type_slug === 'ao_kb_shared' || a?.design_schema?.scope === 'platform') return 'shared'
  const scope = a?.data?.learning_scope
  if (a?.status === 'published' && scope) return scope
  return null
}

export default function KBPage() {
  const appPath = useAppPath()
  const navigate = useNavigate()
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPaged('/api/admin-data?entity=items&type_slugs=ao_kb_article,ao_kb_shared')
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // A shared publish mints a platform-scope ao_kb_shared artifact alongside
  // the source article — listing both shows every article twice. List rows
  // carry type_id/design_schema (no type_slug), so the artifact discriminator
  // is design_schema.scope === 'platform'. Drop artifacts whose source is in
  // the result set; the source row already carries its badge.
  const ids = new Set(articles.map((a) => a.id))
  const deduped = articles.filter(
    (a) => !(a?.design_schema?.scope === 'platform' && a.data?.source_article_id && ids.has(a.data.source_article_id))
  )
  const filtered = deduped.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.description || '').toLowerCase().includes(search.toLowerCase())
  )

  // Imported product docs (data.product stamped by scripts/ao-docs-ingest.ts)
  // get their own section — hundreds of them would bury the organic articles.
  const isDoc = (a: any) => a?.data?.product === 'spine-framework'
  const organicArticles = filtered.filter((a) => !isDoc(a))
  const docArticles = filtered.filter(isDoc).sort((a, b) => a.title.localeCompare(b.title))

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-3 border-b border-border">
        <h1 className="text-lg font-semibold">Knowledgebase</h1>
        <p className="text-sm text-muted-foreground">All articles and candidates — private, internal, and shared</p>
      </div>
      <div className="px-6 py-3 border-b border-border">
        <SearchFilterBar placeholder="Search articles…" value={search} onChange={setSearch} />
      </div>
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="space-y-2"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">No articles found.</div>
        ) : (
          <div className="space-y-6 max-w-2xl">
            {([
              ['Your articles', organicArticles],
              ['Product documentation', docArticles],
            ] as Array<[string, any[]]>).map(([label, group]) =>
              group.length === 0 ? null : (
                <div key={label} className="space-y-2">
                  <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</h2>
                  {group.map((a) => {
                    const flavor = flavorOf(a)
                    return (
                      <button
                        key={a.id}
                        onClick={() => navigate(appPath(`/company/kb/${a.id}`))}
                        className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-brand-gray transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm truncate">{a.title}</h3>
                            {a.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{decodeEntities(a.description)}</p>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {flavor && <Badge variant="outline">{FLAVOR_LABEL[flavor] || flavor}</Badge>}
                            <StatusBadge status={a.status || 'draft'} />
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
