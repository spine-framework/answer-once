// datetime fields arrive display-formatted from admin-data and are rendered as-is; published articles of both types are editable because support owns the retrieval corpus; shared artifacts expose edit + re-embed/archive (edit implies re-embed)
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { apiFetch } from '@core/lib/api'
import { StatusBadge } from '../../components/StatusBadge'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Badge } from '@core/components/ui/badge'
import { Skeleton } from '@core/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/ui/select'
import { RichTextEditor } from '@core/components/ui/RichTextEditor'
import { useDirectory } from '../../hooks/useDirectory'
import { normalizeDataForWrite } from '../../hooks/useWatchers'
import { decodeEntities } from '../../utils/text'
import { ArrowLeft, Pencil, Check, X, Send, Archive, RefreshCw, AlertTriangle, Repeat } from 'lucide-react'

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


const EMBED_LABEL: Record<string, string> = {
  processing: 'Embedding…',
  embedded: 'Embedded',
  error: 'Embedding failed',
}

const WARNING_LABEL: Record<string, string> = {
  source_ticket_resolved: 'The source ticket is not marked resolved',
  analysis_validated: 'The case analysis has not been validated',
  has_resolution_message: 'No resolution message is linked to the source ticket',
  generalizable: 'Analysis flagged this article as not generalizable',
}

const FLAVOR_LABEL: Record<string, string> = {
  internal: 'Internal — support team only',
  shared: 'Shared — all customers',
}

// Private is account-scoped — name the account so support knows whose KB it is
const flavorLabel = (f: string, accountName?: string | null) =>
  f === 'private' ? `Private — ${accountName || 'this customer'} only` : FLAVOR_LABEL[f]

const ALL_FLAVORS = ['private', 'internal', 'shared'] as const
type Flavor = (typeof ALL_FLAVORS)[number]

function RepublishPicker({
  publishedFlavor,
  acting,
  accountName,
  onRepublish,
}: {
  publishedFlavor: string | null
  acting: boolean
  accountName?: string | null
  onRepublish: (flavor: Flavor) => void
}) {
  const options = ALL_FLAVORS.filter((f) => f !== publishedFlavor)
  const [target, setTarget] = useState<Flavor>(options[0])
  const effective = options.includes(target) ? target : options[0]
  return (
    <div className="space-y-2 border-t border-border pt-3">
      <span className="text-xs font-medium text-muted-foreground">Republish to another scope</span>
      <Select value={effective} onValueChange={(v) => setTarget(v as Flavor)}>
        <SelectTrigger className="w-full h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((f) => (
            <SelectItem key={f} value={f}>{flavorLabel(f, accountName)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" variant="outline" className="w-full" onClick={() => onRepublish(effective)} disabled={acting}>
        <Repeat size={14} className="mr-1" /> Republish
      </Button>
    </div>
  )
}

export default function KBArticlePage() {
  const { id } = useParams<{ id: string }>()
  const appPath = useAppPath()
  const navigate = useNavigate()
  const [article, setArticle] = useState<any>(null)
  const [sourceTicket, setSourceTicket] = useState<any>(null)
  const [sourceArticle, setSourceArticle] = useState<any>(null)
  const [linkedArticle, setLinkedArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [acting, setActing] = useState(false)
  const [pendingWarnings, setPendingWarnings] = useState<string[] | null>(null)
  const [flavor, setFlavor] = useState<'private' | 'internal' | 'shared'>('private')
  const [form, setForm] = useState({ title: '', content: '', tags: '', resolution_mode: '', est_minutes: '', automation_score: '' })
  const { accountName } = useDirectory()
  const acctName = accountName(article?.account_id)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const a = await fetchJSON(`/api/admin-data?entity=items&id=${id}`)
      setArticle(a)
      if (a?.data?.source_ticket_id) {
        setSourceTicket(await fetchJSON(`/api/admin-data?entity=items&id=${a.data.source_ticket_id}`).catch(() => null))
      }
      if (a?.data?.source_article_id) {
        setSourceArticle(await fetchJSON(`/api/admin-data?entity=items&id=${a.data.source_article_id}`).catch(() => null))
      }
      if (a?.data?.shared_article_id) {
        setSourceArticle(await fetchJSON(`/api/admin-data?entity=items&id=${a.data.shared_article_id}`).catch(() => null))
      }
      if (a?.data?.republish_of) {
        setLinkedArticle(await fetchJSON(`/api/admin-data?entity=items&id=${a.data.republish_of}`).catch(() => null))
      }
      if (a?.data?.superseded_by) {
        setLinkedArticle(await fetchJSON(`/api/admin-data?entity=items&id=${a.data.superseded_by}`).catch(() => null))
      }
      if (a?.data?.target_flavor && ['private', 'internal', 'shared'].includes(a.data.target_flavor)) {
        setFlavor(a.data.target_flavor)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const status = article?.status || 'candidate'
  const d = article?.data || {}
  const tags: string[] = Array.isArray(d.tags) ? d.tags : []
  const isSharedArtifact = article?.type_slug === 'ao_kb_shared' || article?.design_schema?.scope === 'platform'
  const publishedFlavor = isSharedArtifact ? 'shared' : (d.learning_scope || null)
  // For a shared publish the artifact — not the source — carries the embedding
  // lifecycle, so read embed markers from it when one is linked.
  const embedData = d.shared_article_id ? (sourceArticle?.data || {}) : d
  // Learning scope is only committed at publish; while in review show the
  // pending selection rather than the candidate's private default.
  const displayFlavor = status === 'published' ? publishedFlavor : status === 'in_review' ? flavor : null

  const startEdit = () => {
    setForm({
      title: article?.title || '',
      content: d.content || '',
      tags: tags.join(', '),
      resolution_mode: d.resolution_mode || 'ai_resolvable',
      est_minutes: d.est_minutes != null ? String(d.est_minutes) : '',
      automation_score: d.automation_score != null ? String(d.automation_score) : '',
    })
    setEditing(true)
  }

  const saveEdit = async () => {
    setSaving(true)
    setError(null)
    try {
      await fetchJSON(`/api/admin-data?entity=items&id=${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: form.title.trim() || article?.title,
          data: {
            ...normalizeDataForWrite(d),
            content: form.content,
            tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
            resolution_mode: form.resolution_mode || 'ai_resolvable',
            est_minutes: form.est_minutes === '' ? null : Number(form.est_minutes),
            automation_score: form.automation_score === '' ? null : Number(form.automation_score),
          },
        }),
      })
      setEditing(false)
      if (status === 'published') await reembed()
      else await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (next: string) => {
    setActing(true)
    setError(null)
    try {
      await fetchJSON(`/api/admin-data?entity=items&id=${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      })
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setActing(false)
    }
  }

  const publish = async (acknowledge = false) => {
    setActing(true)
    setError(null)
    try {
      const result = await fetchJSON('/.netlify/functions/custom_answeronce-journey?action=publish_article', {
        method: 'POST',
        body: JSON.stringify({ article_id: id, flavor, acknowledge_warnings: acknowledge }),
      })
      if (result?.requires_acknowledgement) {
        setPendingWarnings(result.validation?.warnings || [])
        return
      }
      setPendingWarnings(null)
      // Embedding runs detached on the published record (or the shared
      // artifact for flavor=shared) — poll briefly so the badge settles from
      // 'Embedding…' without a manual refresh.
      const embedTarget = result.shared_article_id || id
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 2500))
        const rec = await fetchJSON(`/api/admin-data?entity=items&id=${embedTarget}`).catch(() => null)
        if (rec?.data?.embedding_state && rec.data.embedding_state !== 'processing') break
      }
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setActing(false)
    }
  }

  const republish = async (target: 'private' | 'internal' | 'shared') => {
    setActing(true)
    setError(null)
    try {
      const result = await fetchJSON('/.netlify/functions/custom_answeronce-journey?action=republish_article', {
        method: 'POST',
        body: JSON.stringify({ article_id: id, target_flavor: target }),
      })
      if (result?.candidate_id) navigate(appPath(`/company/kb/${result.candidate_id}`))
    } catch (e: any) {
      setError(e.message)
    } finally {
      setActing(false)
    }
  }

  const reembed = async () => {
    setActing(true)
    setError(null)
    try {
      // For shared articles the platform artifact holds the embeddings, so a
      // re-embed from the source page targets the artifact, not the source.
      await fetchJSON('/.netlify/functions/custom_answeronce-journey?action=reembed_article', {
        method: 'POST',
        body: JSON.stringify({ article_id: d.shared_article_id || id }),
      })
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setActing(false)
    }
  }

  const editable = status === 'candidate' || status === 'in_review' || status === 'published'
  const hasActions =
    status === 'published' ||
    (!isSharedArtifact && (status === 'candidate' || status === 'in_review' || status === 'rejected'))

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate(appPath('/company/kb'))}>
          <ArrowLeft size={16} />
        </Button>
        <div className="min-w-0 flex-1">
          {loading ? <Skeleton className="h-6 w-48" /> : (
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-lg font-semibold truncate min-w-0 max-w-full">{article?.title || 'Article'}</h1>
              <StatusBadge status={status} />
              {displayFlavor && (
                <Badge variant="outline" className="shrink-0">
                  {flavorLabel(displayFlavor, acctName)?.split(' — ')[0] || displayFlavor}
                  {status === 'in_review' ? ' (pending)' : ''}
                </Badge>
              )}
              {embedData.embedding_state && (
                <Badge variant={embedData.embedding_state === 'error' ? 'destructive' : 'secondary'} className="shrink-0">
                  {EMBED_LABEL[embedData.embedding_state] || embedData.embedding_state}
                </Badge>
              )}
            </div>
          )}
        </div>
        {!editing && editable && (
          <Button variant="outline" size="sm" onClick={startEdit} className="shrink-0">
            <Pencil size={14} className="sm:mr-1" /> <span className="hidden sm:inline">Edit</span>
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-auto lg:overflow-hidden">
        <div className="grid lg:h-full lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Left: content scrolls; tags + save bar pinned to the bottom */}
          <div className="flex flex-col min-w-0 lg:min-h-0 lg:border-r border-border">
            <div className="lg:flex-1 lg:min-h-0 lg:overflow-auto px-4 sm:px-6 py-4 space-y-5">
              {error && <div className="text-sm text-destructive">{error}</div>}
              {editing ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Title</label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Content</label>
                    <RichTextEditor
                      value={form.content}
                      onChange={(html) => setForm({ ...form, content: html })}
                      minHeight="320px"
                      placeholder="Write the answer…"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Resolution mode</label>
                      <Select value={form.resolution_mode} onValueChange={(v) => setForm({ ...form, resolution_mode: v })}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ai_resolvable">AI resolvable</SelectItem>
                          <SelectItem value="human_action_required">Human action required</SelectItem>
                          <SelectItem value="conditional">Conditional</SelectItem>
                          <SelectItem value="informational">Informational</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Avg human time (min)</label>
                      <Input
                        type="number" min={0} value={form.est_minutes}
                        onChange={(e) => setForm({ ...form, est_minutes: e.target.value })}
                        placeholder="e.g. 15"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Automation score (0–100)</label>
                      <Input
                        type="number" min={0} max={100} value={form.automation_score}
                        onChange={(e) => setForm({ ...form, automation_score: e.target.value })}
                        placeholder="optional"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <RichTextEditor value={d.content || ''} readonly />
              )}
            </div>

            {(editing || tags.length > 0) && (
              <div className="px-4 sm:px-6 py-3 lg:border-t border-border">
                {editing ? (
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="space-y-1.5 flex-1 min-w-[200px]">
                      <label className="text-xs font-medium text-muted-foreground">Tags (comma separated)</label>
                      <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit} disabled={saving}>
                        <Check size={14} className="mr-1" /> {saving ? 'Saving…' : 'Save'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                        <X size={14} className="mr-1" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: warnings + provenance scroll; actions pinned to the bottom */}
          <div className="flex flex-col lg:min-h-0 lg:bg-muted/30">
            <div className="lg:flex-1 lg:min-h-0 lg:overflow-auto px-4 sm:px-6 py-4 lg:p-4 space-y-4">
            {pendingWarnings && (
              <div className="rounded-lg border border-brand-light/40 bg-brand-light/10 p-4 text-sm">
                <div className="flex items-center gap-2 font-medium mb-1">
                  <AlertTriangle size={14} /> Publish warnings
                </div>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {pendingWarnings.map((w) => <li key={w}>{WARNING_LABEL[w] || w.replace(/_/g, ' ')}</li>)}
                </ul>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => publish(true)} disabled={acting}>Publish anyway</Button>
                  <Button size="sm" variant="outline" onClick={() => setPendingWarnings(null)}>Cancel</Button>
                </div>
              </div>
            )}

            {d.republish_of && status !== 'published' && status !== 'archived' && (
              <div className="rounded-lg border border-brand-light/40 bg-brand-light/10 p-4 text-sm">
                <div className="flex items-center gap-2 font-medium mb-1">
                  <AlertTriangle size={14} /> Republish candidate
                </div>
                <p className="text-muted-foreground">
                  This candidate republishes an article from scope <strong>{d.republish_source_scope || 'unknown'}</strong> to{' '}
                  <strong>{d.target_flavor || flavor}</strong>. Publishing will archive the original — review the content for
                  details that should not reach the wider audience.
                </p>
              </div>
            )}

          <div className="rounded-lg border border-border p-4 space-y-3 text-sm">
            <h2 className="text-sm font-medium">Provenance & analysis</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              <dt className="text-muted-foreground">Source ticket</dt>
              <dd>
                {d.source_ticket_id ? (
                  <button
                    className="text-primary hover:underline text-left"
                    onClick={() => navigate(appPath(`/company/tickets/${d.source_ticket_id}`))}
                  >
                    {sourceTicket?.title || d.source_ticket_id}
                  </button>
                ) : '—'}
              </dd>
              <dt className="text-muted-foreground">Analysis state</dt>
              <dd>{d.correctness_state || '—'}</dd>
              <dt className="text-muted-foreground">Confidence</dt>
              <dd>{d.confidence_score != null ? Math.round(d.confidence_score * 100) + '%' : '—'}</dd>
              <dt className="text-muted-foreground">Generalizable</dt>
              <dd>{d.generalizable == null ? '—' : d.generalizable ? 'Yes' : 'No'}</dd>
              <dt className="text-muted-foreground">Approved</dt>
              <dd>{d.approved_at || '—'}</dd>
              <dt className="text-muted-foreground">Last embedded</dt>
              <dd>{embedData.embedded_at || '—'}</dd>
              <dt className="text-muted-foreground">Learning scope</dt>
              <dd>
                {displayFlavor
                  ? `${flavorLabel(displayFlavor, acctName)}${status === 'in_review' ? ' (pending publish)' : ''}`
                  : '—'}
              </dd>
              <dt className="text-muted-foreground">Resolution mode</dt>
              <dd>{(d.resolution_mode || 'ai_resolvable').replace(/_/g, ' ')}</dd>
              <dt className="text-muted-foreground">Avg human time</dt>
              <dd>{d.est_minutes != null ? `${d.est_minutes} min` : '—'}</dd>
              <dt className="text-muted-foreground">Automation score</dt>
              <dd>{d.automation_score != null ? `${d.automation_score}/100` : '—'}</dd>
              {(d.source_article_id || d.shared_article_id) && (
                <>
                  <dt className="text-muted-foreground">{d.source_article_id ? 'Source article' : 'Shared artifact'}</dt>
                  <dd>
                    <button
                      className="text-primary hover:underline text-left"
                      onClick={() => navigate(appPath(`/company/kb/${d.source_article_id || d.shared_article_id}`))}
                    >
                      {sourceArticle?.title || d.source_article_id || d.shared_article_id}
                    </button>
                  </dd>
                </>
              )}
              {d.republish_of && (
                <>
                  <dt className="text-muted-foreground">Republished from</dt>
                  <dd>
                    <button
                      className="text-primary hover:underline text-left"
                      onClick={() => navigate(appPath(`/company/kb/${d.republish_of}`))}
                    >
                      {linkedArticle?.title || d.republish_of}
                    </button>
                  </dd>
                </>
              )}
              {d.superseded_by && (
                <>
                  <dt className="text-muted-foreground">Superseded by</dt>
                  <dd>
                    <button
                      className="text-primary hover:underline text-left"
                      onClick={() => navigate(appPath(`/company/kb/${d.superseded_by}`))}
                    >
                      {linkedArticle?.title || d.superseded_by}
                    </button>
                  </dd>
                </>
              )}
            </dl>
            {d.analysis_summary && (
              <p className="text-muted-foreground border-t border-border pt-3">{decodeEntities(d.analysis_summary)}</p>
            )}
            {embedData.embedding_error && (
              <p className="text-destructive border-t border-border pt-3">{embedData.embedding_error}</p>
            )}
            </div>
            </div>

          {hasActions && (
            <div className="px-4 sm:px-6 pb-4 lg:p-4 lg:border-t border-border space-y-3">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</h2>
              <div className="flex flex-col gap-2">
                {status === 'candidate' && !isSharedArtifact && (
                  <Button size="sm" variant="outline" onClick={() => setStatus('in_review')} disabled={acting}>
                    <Send size={14} className="mr-1" /> Submit for review
                  </Button>
                )}
                {status === 'in_review' && !isSharedArtifact && (
                  <>
                    <Select value={flavor} onValueChange={(v) => setFlavor(v as typeof flavor)}>
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">{flavorLabel('private', acctName)}</SelectItem>
                        <SelectItem value="internal">Internal — support team only</SelectItem>
                        <SelectItem value="shared">Shared — all customers</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => publish()} disabled={acting}>
                        <Check size={14} className="mr-1" /> {acting ? 'Working…' : 'Approve & publish'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setStatus('rejected')} disabled={acting}>
                        Reject
                      </Button>
                    </div>
                  </>
                )}
                {status === 'published' && (
                  <>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={reembed} disabled={acting}>
                        <RefreshCw size={14} className="mr-1" /> {acting ? 'Working…' : 'Re-embed'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setStatus('archived')} disabled={acting}>
                        <Archive size={14} className="mr-1" /> Archive
                      </Button>
                    </div>
                    <RepublishPicker
                      publishedFlavor={publishedFlavor}
                      acting={acting}
                      accountName={acctName}
                      onRepublish={republish}
                    />
                  </>
                )}
                {status === 'rejected' && !isSharedArtifact && (
                  <Button size="sm" variant="outline" onClick={() => setStatus('candidate')} disabled={acting}>
                    Restore to candidate
                  </Button>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}
