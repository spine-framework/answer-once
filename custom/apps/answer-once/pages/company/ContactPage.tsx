import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { apiFetch } from '@core/lib/api'
import { StatusBadge } from '../../components/StatusBadge'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Skeleton } from '@core/components/ui/skeleton'
import { ArrowLeft, Pencil, Check, X, Ticket, Building2 } from 'lucide-react'

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

export default function ContactPage() {
  const { id } = useParams<{ id: string }>()
  const appPath = useAppPath()
  const navigate = useNavigate()

  const [person, setPerson] = useState<any>(null)
  const [account, setAccount] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftEmail, setDraftEmail] = useState('')
  const [draftPhone, setDraftPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const p = await fetchJSON(`/api/admin-data?entity=people&id=${id}`)
      setPerson(p || null)
      const [acct, tix] = await Promise.all([
        p?.account_id
          ? fetchJSON(`/api/admin-data?entity=accounts&id=${p.account_id}`).catch(() => null)
          : Promise.resolve(null),
        fetchJSON(`/api/admin-data?entity=items&type_slug=ao_support_ticket&created_by=${id}&limit=200&sort_field=created_at&sort_direction=desc`).catch(() => []),
      ])
      setAccount(acct)
      setTickets(Array.isArray(tix) ? tix : [])
    } catch (e: any) {
      setError(e.message || 'Failed to load contact')
      setPerson(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const startEdit = () => {
    setDraftName(person?.full_name || '')
    setDraftEmail(person?.email || '')
    setDraftPhone(person?.phone || '')
    setSaveError(null)
    setEditing(true)
  }

  const handleSave = useCallback(async () => {
    if (!id || saving) return
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await fetchJSON(`/api/admin-data?entity=people&id=${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          full_name: draftName.trim() || person?.full_name,
          email: draftEmail.trim() || person?.email,
          phone: draftPhone.trim() || null,
        }),
      })
      setPerson(updated)
      setEditing(false)
    } catch (e: any) {
      setSaveError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }, [id, saving, draftName, draftEmail, draftPhone, person?.full_name, person?.email])

  const openCount = tickets.filter(t => OPEN_STATUSES.has(t.status)).length
  const roleSlug = Array.isArray(person?.role) ? person.role[0]?.slug : person?.role?.slug

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border">
        <Button
          variant="ghost" size="icon" className="h-8 w-8 shrink-0"
          onClick={() => navigate(account ? appPath(`/company/accounts/${account.id}`) : appPath('/company/accounts'))}
        >
          <ArrowLeft size={16} />
        </Button>
        <div className="min-w-0 flex-1">
          {loading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <h1 className="text-lg font-semibold truncate">{person?.full_name || person?.email || 'Contact'}</h1>
          )}
        </div>
        {!loading && person && !editing && (
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
        ) : !person ? (
          <div className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-lg max-w-2xl mx-auto">
            Contact not found.
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
                      <label className="text-xs text-muted-foreground mb-1 block">Full name</label>
                      <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                      <Input type="email" value={draftEmail} onChange={(e) => setDraftEmail(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                      <Input value={draftPhone} onChange={(e) => setDraftPhone(e.target.value)} />
                    </div>
                    {saveError && <p className="text-xs text-destructive">{saveError}</p>}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave} disabled={saving || !draftName.trim() || !draftEmail.trim()}>
                        <Check size={13} className="mr-1.5" /> {saving ? 'Saving…' : 'Save'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                        <X size={13} className="mr-1.5" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Email</span><span>{person.email || '—'}</span></div>
                    <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Phone</span><span>{person.phone || '—'}</span></div>
                    <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Status</span><span>{person.status || '—'}</span></div>
                    <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Role</span><span>{roleSlug || '—'}</span></div>
                    <div className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">Joined</span><span>{person.created_at ? new Date(person.created_at).toLocaleDateString() : '—'}</span></div>
                  </div>
                )}
              </section>

              {/* Tickets filed by this contact */}
              <section className="rounded-lg border border-border bg-card p-4 space-y-3">
                <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Ticket size={12} /> Tickets ({tickets.length})
                </h2>
                {tickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tickets from this contact.</p>
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
                            <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</p>
                          </div>
                          <StatusBadge status={t.status} />
                        </button>
                      </li>
                    ))}
                    {tickets.length > 15 && (
                      <li className="pt-2 text-xs text-muted-foreground">+{tickets.length - 15} more</li>
                    )}
                  </ul>
                )}
              </section>
            </div>

            {/* Right column — account + stats */}
            <div className="space-y-6">
              <section className="rounded-lg border border-border bg-card p-4 space-y-3">
                <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Building2 size={12} /> Account
                </h2>
                {account ? (
                  <button
                    onClick={() => navigate(appPath(`/company/accounts/${account.id}`))}
                    className="text-sm text-primary hover:underline text-left"
                  >
                    {account.display_name || account.slug}
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground">No account linked.</p>
                )}
              </section>
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
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
