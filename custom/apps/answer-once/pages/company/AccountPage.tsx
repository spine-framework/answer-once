// CIL[BEGIN stable_id="~/custom/apps/answer-once/pages/company/AccountPage.tsx:module_header:module_header" type="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Company account detail — view/edit account, contacts, ticket history"]
// CIL[DOC-RESPONSIBILITY responsibility="Show a customer account with editable display_name/description, its people, ticket stats, and recent tickets; support edits via admin-data PATCH on the accounts entity"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/pages/company/AccountPage.tsx" layer="custom_app" related_files=".framework/src/lib/api.ts, custom/apps/answer-once/components/StatusBadge.tsx, custom/apps/answer-once/hooks/useDirectory.ts"]
// CIL[DOC-CONTRACT inputs="route param id" outputs="JSX page" errors="not-found and load errors render inline" side_effects="GET /api/admin-data (accounts, people, items); PATCH /api/admin-data?entity=accounts"]
// CIL[DOC-MICRO logic_summary="Fetches the account by id, people and tickets filtered by account_id; edit mode PATCHes display_name/description only (both declared system fields on the account type — undeclared data.* keys are rejected by field validation); contacts link to /company/contacts/:id detail and an Add contact button opens /company/contacts/new?account_id=<id>" notable_decisions="account data.* extras (segment, lifecycle_stage, temperature, health) render readonly — they are undeclared on the global account type and writes would fail validation"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { apiFetch } from '@core/lib/api'
import { StatusBadge } from '../../components/StatusBadge'
import { useDirectory } from '../../hooks/useDirectory'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Textarea } from '@core/components/ui/textarea'
import { Skeleton } from '@core/components/ui/skeleton'
import { ArrowLeft, Pencil, Check, X, Users, Ticket, BookOpen, Plus } from 'lucide-react'
// CIL[END stable_id="~/custom/apps/answer-once/pages/company/AccountPage.tsx:module_header:module_header"]

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

const OPEN_STATUSES = new Set(['new', 'ai_responding', 'pending_resolution', 'human_assigned', 'in_progress'])

export default function AccountPage() {
  const { id } = useParams<{ id: string }>()
  const appPath = useAppPath()
  const navigate = useNavigate()
  const { personName } = useDirectory()

  const [account, setAccount] = useState<any>(null)
  const [people, setPeople] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [acct, ppl, tix, arts] = await Promise.all([
        fetchJSON(`/api/admin-data?entity=accounts&id=${id}`),
        fetchJSON(`/api/admin-data?entity=people&account_id=${id}&limit=100`).catch(() => []),
        fetchJSON(`/api/admin-data?entity=items&type_slug=ao_support_ticket&account_id=${id}&limit=200&sort_field=created_at&sort_direction=desc`).catch(() => []),
        fetchJSON(`/api/admin-data?entity=items&type_slug=ao_kb_article&account_id=${id}&limit=200`).catch(() => []),
      ])
      setAccount(acct || null)
      setPeople(Array.isArray(ppl) ? ppl : [])
      setTickets(Array.isArray(tix) ? tix : [])
      setArticles(Array.isArray(arts) ? arts : [])
    } catch (e: any) {
      setError(e.message || 'Failed to load account')
      setAccount(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const startEdit = () => {
    setDraftName(account?.display_name || '')
    setDraftDescription(account?.description || '')
    setSaveError(null)
    setEditing(true)
  }

  const handleSave = useCallback(async () => {
    if (!id || saving) return
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await fetchJSON(`/api/admin-data?entity=accounts&id=${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          display_name: draftName.trim() || account?.display_name,
          description: draftDescription,
        }),
      })
      setAccount(updated)
      setEditing(false)
    } catch (e: any) {
      setSaveError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }, [id, saving, draftName, draftDescription, account?.display_name])

  const isTrue = (v: any) => v === true || v === 'true' || v === 'Yes'
  const openCount = tickets.filter(t => OPEN_STATUSES.has(t.status)).length
  const aiResolved = tickets.filter(t => isTrue(t.data?.aim_resolved_by_ai)).length
  const kbAnswered = tickets.filter(t => isTrue(t.data?.aim_answered_from_kb)).length
  const publishedArticles = articles.filter(a => a.status === 'published').length
  const extra = account?.data || {}

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate(appPath('/company/accounts'))}>
          <ArrowLeft size={16} />
        </Button>
        <div className="min-w-0 flex-1">
          {loading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <h1 className="text-lg font-semibold truncate">{account?.display_name || account?.slug || 'Account'}</h1>
          )}
        </div>
        {!loading && account && !editing && (
          <Button variant="outline" size="sm" onClick={startEdit}>
            <Pencil size={13} className="mr-1.5" /> Edit
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4">
        {loading ? (
          <div className="space-y-3 max-w-4xl">
            <Skeleton className="h-24" /><Skeleton className="h-40" />
          </div>
        ) : error ? (
          <div className="text-sm text-destructive py-8 text-center border border-dashed border-border rounded-lg max-w-2xl mx-auto">
            {error}
          </div>
        ) : !account ? (
          <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-lg max-w-2xl mx-auto">
            Account not found.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] max-w-6xl">
            {/* Left column */}
            <div className="min-w-0 space-y-6">
              {/* Details / edit form */}
              <section className="rounded-lg border border-border bg-card p-4 space-y-3">
                <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Details</h2>
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Display name</label>
                      <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                      <Textarea
                        value={draftDescription}
                        onChange={(e) => setDraftDescription(e.target.value)}
                        rows={4}
                        placeholder="Notes about this customer account…"
                      />
                    </div>
                    {saveError && <p className="text-xs text-destructive">{saveError}</p>}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave} disabled={saving || !draftName.trim()}>
                        <Check size={13} className="mr-1.5" /> {saving ? 'Saving…' : 'Save'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                        <X size={13} className="mr-1.5" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Slug</span><span className="font-mono text-xs">{account.slug}</span></div>
                    <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Status</span><span>{account.is_active ? 'Active' : 'Inactive'}</span></div>
                    <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Created</span><span>{account.created_at ? new Date(account.created_at).toLocaleDateString() : '—'}</span></div>
                    <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Description</span><span className="whitespace-pre-wrap">{account.description || <span className="text-muted-foreground">—</span>}</span></div>
                    {(extra.segment || extra.lifecycle_stage || extra.temperature) && (
                      <div className="flex gap-2 flex-wrap pt-1">
                        {extra.segment && <span className="text-xs rounded-full border border-border px-2 py-0.5">Segment: {extra.segment}</span>}
                        {extra.lifecycle_stage && <span className="text-xs rounded-full border border-border px-2 py-0.5">Stage: {extra.lifecycle_stage}</span>}
                        {extra.temperature && <span className="text-xs rounded-full border border-border px-2 py-0.5">Temp: {extra.temperature}</span>}
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Contacts */}
              <section className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <Users size={12} /> Contacts ({people.length})
                  </h2>
                  <Button
                    variant="outline" size="sm" className="h-7 text-xs"
                    onClick={() => navigate(appPath(`/company/contacts/new?account_id=${account.id}`))}
                  >
                    <Plus size={12} className="mr-1" /> Add contact
                  </Button>
                </div>
                {people.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No people on this account.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {people.map((p) => {
                      const roleSlug = Array.isArray(p.role) ? p.role[0]?.slug : p.role?.slug
                      return (
                        <li key={p.id}>
                          <button
                            onClick={() => navigate(appPath(`/company/contacts/${p.id}`))}
                            className="w-full text-left py-2 flex items-center justify-between gap-3 hover:bg-brand-gray rounded px-1 -mx-1"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{p.full_name || p.email || p.id}</p>
                              {p.full_name && p.email && <p className="text-xs text-muted-foreground truncate">{p.email}</p>}
                            </div>
                            {roleSlug && <span className="text-xs text-muted-foreground shrink-0">{roleSlug}</span>}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>

              {/* Recent tickets */}
              <section className="rounded-lg border border-border bg-card p-4 space-y-3">
                <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Ticket size={12} /> Tickets ({tickets.length})
                </h2>
                {tickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tickets from this account.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {tickets.slice(0, 15).map((t) => (
                      <li key={t.id}>
                        <button
                          onClick={() => navigate(appPath(`/company/tickets/${t.id}`))}
                          className="w-full text-left py-2 flex items-center gap-3 hover:bg-brand-gray rounded px-1 -mx-1"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{t.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(t.created_at).toLocaleDateString()}
                              {t.created_by ? ` · ${personName(t.created_by) || '—'}` : ''}
                            </p>
                          </div>
                          <StatusBadge status={t.status} />
                        </button>
                      </li>
                    ))}
                    {tickets.length > 15 && (
                      <li className="pt-2 text-xs text-muted-foreground">+{tickets.length - 15} more — see Tickets, filtered by this company</li>
                    )}
                  </ul>
                )}
              </section>
            </div>

            {/* Right column — stats */}
            <div className="space-y-6">
              <section className="rounded-lg border border-border bg-card p-4 space-y-3">
                <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Activity</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-2xl font-semibold">{tickets.length}</p>
                    <p className="text-xs text-muted-foreground">Total tickets</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{openCount}</p>
                    <p className="text-xs text-muted-foreground">Open</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{aiResolved}</p>
                    <p className="text-xs text-muted-foreground">Resolved by AI</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{kbAnswered}</p>
                    <p className="text-xs text-muted-foreground">Answered from KB</p>
                  </div>
                </div>
              </section>
              <section className="rounded-lg border border-border bg-card p-4 space-y-3">
                <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <BookOpen size={12} /> Knowledge
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-2xl font-semibold">{articles.length}</p>
                    <p className="text-xs text-muted-foreground">KB articles</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{publishedArticles}</p>
                    <p className="text-xs text-muted-foreground">Published</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
