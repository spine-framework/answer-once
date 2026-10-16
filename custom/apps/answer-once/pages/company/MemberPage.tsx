// CIL[BEGIN stable_id="~/custom/apps/answer-once/pages/company/MemberPage.tsx:module_header:module_header" type="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Company team member detail — view/edit a support person and their assigned tickets"]
// CIL[DOC-RESPONSIBILITY responsibility="Show a spine-system person with editable full_name/email/phone/role (admins only), their platform account, status, and tickets assigned to them via aim_human_assignee_id"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/pages/company/MemberPage.tsx" layer="custom_app" related_files=".framework/src/lib/api.ts, custom/apps/answer-once/pages/company/ContactPage.tsx, custom/apps/answer-once/pages/company/TeamPage.tsx"]
// CIL[DOC-CONTRACT inputs="route param id" outputs="JSX page" errors="not-found and load errors render inline" side_effects="GET /api/admin-data (people, items); PATCH /api/admin-data?entity=people; supabase roles read"]
// CIL[DOC-MICRO logic_summary="Fetches the person, the platform account, support-capable roles (direct supabase read — /api/roles strips slugs), and tickets filtered client-side on data.aim_human_assignee_id; edit affordance is gated to support_admin/system_admin though person record_permissions would allow support writes" notable_decisions="role edit options exclude system_admin — admins may move members between support and support_admin only; an existing system_admin member keeps their role displayed but can't be re-assigned it"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppPath } from '@core/hooks/useAppPath'
import { useAuth } from '@core/contexts/AuthContext'
import { apiFetch } from '@core/lib/api'
import { supabase } from '@core/lib/supabase'
import { StatusBadge } from '../../components/StatusBadge'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Skeleton } from '@core/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@core/components/ui/select'
import { ArrowLeft, Pencil, Check, X, Ticket, Building2 } from 'lucide-react'
// CIL[END stable_id="~/custom/apps/answer-once/pages/company/MemberPage.tsx:module_header:module_header"]

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
const ASSIGNABLE_ROLES = ['support', 'support_admin']
const ADMIN_ROLES = ['support_admin', 'system_admin']

export default function MemberPage() {
  const { id } = useParams<{ id: string }>()
  const appPath = useAppPath()
  const navigate = useNavigate()
  const { user } = useAuth()
  const canEdit = (user?.roles || []).some((r: string) => ADMIN_ROLES.includes(r))

  const [person, setPerson] = useState<any>(null)
  const [roles, setRoles] = useState<any[]>([])
  const [roleSlug, setRoleSlug] = useState<string | null>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftEmail, setDraftEmail] = useState('')
  const [draftPhone, setDraftPhone] = useState('')
  const [draftRoleId, setDraftRoleId] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [p, rolesRes, tix] = await Promise.all([
        fetchJSON(`/api/admin-data?entity=people&id=${id}`),
        supabase.from('roles').select('id, slug, name').eq('is_active', true),
        fetchJSON('/api/admin-data?entity=items&type_slug=ao_support_ticket&limit=500&sort_field=created_at&sort_direction=desc').catch(() => []),
      ])
      setPerson(p || null)
      const allRoles = rolesRes.data || []
      setRoles(allRoles.filter((r: any) => ASSIGNABLE_ROLES.includes(r.slug)))
      setRoleSlug(allRoles.find((r: any) => r.id === p?.role_id)?.slug || null)
      setTickets((Array.isArray(tix) ? tix : []).filter((t: any) => t.data?.aim_human_assignee_id === id))
    } catch (e: any) {
      setError(e.message || 'Failed to load member')
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
    setDraftRoleId(person?.role_id || '')
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
          ...(draftRoleId ? { role_id: draftRoleId } : {}),
        }),
      })
      setPerson(updated)
      setRoleSlug(roles.find((r: any) => r.id === updated?.role_id)?.slug || null)
      setEditing(false)
    } catch (e: any) {
      setSaveError(e.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }, [id, saving, draftName, draftEmail, draftPhone, draftRoleId, person?.full_name, person?.email, roles])

  const openCount = tickets.filter(t => OPEN_STATUSES.has(t.status)).length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate(appPath('/company/team'))}>
          <ArrowLeft size={16} />
        </Button>
        <div className="min-w-0 flex-1">
          {loading ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <h1 className="text-lg font-semibold truncate">{person?.full_name || person?.email || 'Member'}</h1>
          )}
        </div>
        {!loading && person && !editing && canEdit && (
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
            Member not found.
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
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Role</label>
                      <Select value={draftRoleId} onValueChange={setDraftRoleId}>
                        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.name || r.slug}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

              {/* Assigned tickets */}
              <section className="rounded-lg border border-border bg-card p-4 space-y-3">
                <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Ticket size={12} /> Assigned tickets ({tickets.length})
                </h2>
                {tickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tickets assigned to this member.</p>
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
                  <Building2 size={12} /> Workspace
                </h2>
                <p className="text-sm">Support team</p>
              </section>
              <section className="rounded-lg border border-border bg-card p-4 space-y-3">
                <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Activity</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-2xl font-semibold">{tickets.length}</p>
                    <p className="text-xs text-muted-foreground">Assigned</p>
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
