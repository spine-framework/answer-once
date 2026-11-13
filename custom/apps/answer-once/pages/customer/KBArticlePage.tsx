import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { apiFetch } from '@core/lib/api'
import { Button } from '@core/components/ui/button'
import { Badge } from '@core/components/ui/badge'
import { Skeleton } from '@core/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import { RichTextEditor } from '@core/components/ui/RichTextEditor'

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

export default function KBArticlePage() {
  const { id } = useParams<{ id: string }>()
  const appPath = useAppPath()
  const navigate = useNavigate()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchJSON(`/api/admin-data?entity=items&id=${id}`)
      .then(setArticle)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(appPath('/kb'))}>
          <ArrowLeft size={16} />
        </Button>
        <div className="min-w-0 flex-1">
          {loading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold truncate">{article?.title}</h1>
              {/* Visibility here implies published+shared — badge only the
                  customer's own private articles (excludes shared artifacts and
                  their source candidates) */}
              {article && article?.design_schema?.scope !== 'platform' &&
                article?.type_slug !== 'ao_kb_shared' &&
                article?.data?.learning_scope !== 'shared' && (
                <Badge variant="secondary">Private</Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4 max-w-2xl">
        {error && <div className="text-sm text-destructive">{error}</div>}
        {!loading && article && (
          <div>
            {article.description && <p className="text-sm text-muted-foreground mb-4">{article.description}</p>}
            <RichTextEditor value={article.data?.content || ''} readonly />
          </div>
        )}
      </div>
    </div>
  )
}
