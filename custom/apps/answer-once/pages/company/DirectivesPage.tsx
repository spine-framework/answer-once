/**
 * Triage Directives — review, author, and manage routing rules for the Answer
 * Once triage agent. Suggested directives arrive via case analysis or are
 * authored here; activating one embeds its match_description so
 * apply_directive can select it. All CRUD goes through /api/admin-data
 * entity=items (type_slug ao_triage_directive).
 */
import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { apiFetch } from '@core/lib/api'
import { StatusBadge } from '../../components/StatusBadge'

async function fetchJSON(path: string, options?: RequestInit) {
  const res = await apiFetch(path, options)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

const STATUS_ORDER = ['suggested', 'draft', 'active', 'disabled']

interface Directive {
  id: string
  title: string
  status: string
  data: any
  updated_at: string
}

export default function DirectivesPage() {
  const location = useLocation()
  const [directives, setDirectives] = useState<Directive[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [drafts, setDrafts] = useState<Record<string, any>>({})
  const [creating, setCreating] = useState(false)
  const [savingNew, setSavingNew] = useState(false)
  const [newDraft, setNewDraft] = useState<any>({
    title: '', match_description: '', reply_template: '', mode: 'suggest', priority: 100, actions: '{}',
  })

  // TicketPage 'Save as directive' lands here with a prefill via router state —
  // support decides a resolution is a repeatable routing rule, not a KB article.
  useEffect(() => {
    const prefill = (location.state as any)?.newDirective
    if (prefill) {
      setNewDraft((p: any) => ({ ...p, ...prefill }))
      setCreating(true)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await fetchJSON('/api/admin-data?entity=items&type_slug=ao_triage_directive&limit=200')
      setDirectives(Array.isArray(rows) ? rows : (Array.isArray(rows?.data) ? rows.data : []))
      setError(null)
    } catch (e: any) {
      setError(e.message || 'Failed to load directives')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const update = async (id: string, body: any) => {
    await fetchJSON(`/api/admin-data?entity=items&id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity: 'items', ...body }),
    })
    await load()
  }

  const setStatus = (d: Directive, status: string) =>
    update(d.id, { status, data: { ...d.data, status, ...(status === 'active' ? { approved_at: new Date().toISOString() } : {}) } })

  const draftFor = (d: Directive) => drafts[d.id] ?? {
    match_description: d.data?.match_description ?? '',
    reply_template: d.data?.reply_template ?? '',
    mode: d.data?.mode ?? 'suggest',
    priority: d.data?.priority ?? 100,
    actions: JSON.stringify(d.data?.actions ?? {}, null, 2),
  }

  const save = async (d: Directive) => {
    const f = draftFor(d)
    let actions: any
    try { actions = JSON.parse(f.actions || '{}') } catch { setError('Actions must be valid JSON'); return }
    await update(d.id, {
      data: {
        ...d.data,
        match_description: f.match_description,
        reply_template: f.reply_template,
        mode: f.mode,
        priority: Number(f.priority) || 100,
        actions,
      },
    })
  }

  const setDraft = (id: string, patch: any) =>
    setDrafts(prev => ({ ...prev, [id]: { ...draftFor(directives.find(x => x.id === id)!), ...patch } }))

  const create = async () => {
    if (!newDraft.title.trim() || !newDraft.match_description.trim()) {
      setError('Title and match description are required')
      return
    }
    let actions: any
    try { actions = JSON.parse(newDraft.actions || '{}') } catch { setError('Actions must be valid JSON'); return }
    setSavingNew(true)
    try {
      await fetchJSON('/api/admin-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: 'items',
          type_slug: 'ao_triage_directive',
          title: newDraft.title.trim(),
          status: 'draft',
          data: {
            status: 'draft',
            match_description: newDraft.match_description.trim(),
            reply_template: newDraft.reply_template,
            mode: newDraft.mode,
            priority: Number(newDraft.priority) || 100,
            actions,
            ...(newDraft.source_ticket_id ? { source_ticket_id: newDraft.source_ticket_id } : {}),
          },
        }),
      })
      setCreating(false)
      setNewDraft({ title: '', match_description: '', reply_template: '', mode: 'suggest', priority: 100, actions: '{}' })
      await load()
    } catch (e: any) {
      setError(e.message || 'Create failed')
    } finally {
      setSavingNew(false)
    }
  }

  const groups = STATUS_ORDER.map(s => ({
    status: s,
    rows: directives.filter(d => (d.status || d.data?.status) === s),
  })).filter(g => g.rows.length > 0)

  if (loading) return <div className="p-8 text-sm text-muted-foreground">Loading directives…</div>

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Triage Directives</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Routing rules the triage agent can apply when a customer asks for something to be done —
            not a question to answer. Active directives are embedded and matched semantically.
          </p>
        </div>
        <button className="text-sm border rounded px-3 py-1.5 shrink-0" onClick={() => setCreating(c => !c)}>
          {creating ? 'Cancel' : 'New directive'}
        </button>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {creating && (
        <div className="border rounded-md p-4 space-y-3">
          <label className="block text-xs">Title
            <input className="mt-1 w-full border rounded p-2 text-sm" value={newDraft.title}
              onChange={e => setNewDraft(p => ({ ...p, title: e.target.value }))}
              placeholder="Refund request" />
          </label>
          <label className="block text-xs">Match description
            <textarea className="mt-1 w-full border rounded p-2 text-sm" rows={2} value={newDraft.match_description}
              onChange={e => setNewDraft(p => ({ ...p, match_description: e.target.value }))}
              placeholder="Customer asks for a refund, wants their money back, or wants to cancel and be refunded" />
          </label>
          <label className="block text-xs">Reply template
            <textarea className="mt-1 w-full border rounded p-2 text-sm" rows={3} value={newDraft.reply_template}
              onChange={e => setNewDraft(p => ({ ...p, reply_template: e.target.value }))}
              placeholder="Optional — what the customer is told when this directive matches" />
          </label>
          <div className="flex gap-4">
            <label className="text-xs">Mode
              <select className="ml-2 border rounded p-1 text-sm" value={newDraft.mode}
                onChange={e => setNewDraft(p => ({ ...p, mode: e.target.value }))}>
                <option value="suggest">suggest</option>
                <option value="auto_reply">auto_reply</option>
              </select>
            </label>
            <label className="text-xs">Priority
              <input className="ml-2 border rounded p-1 text-sm w-20" type="number" value={newDraft.priority}
                onChange={e => setNewDraft(p => ({ ...p, priority: Number(e.target.value) }))} />
            </label>
          </div>
          <label className="block text-xs">Actions (JSON)
            <textarea className="mt-1 w-full border rounded p-2 text-xs font-mono" rows={6} value={newDraft.actions}
              onChange={e => setNewDraft(p => ({ ...p, actions: e.target.value }))}
              placeholder='{"record_ops": {"tags": [], "watchers": ["role:support_admin"], "set_fields": {}, "escalate": false}, "run_pipelines": []}' />
          </label>
          <p className="text-xs text-muted-foreground">
            Actions shape: record_ops.tags, record_ops.watchers (role:&lt;slug&gt; or person:&lt;uuid&gt;),
            record_ops.set_fields (non-system fields, plus status/priority), record_ops.escalate,
            run_pipelines (pipeline slugs or ids), continue.
          </p>
          <button className="text-sm border rounded px-3 py-1" disabled={savingNew} onClick={() => void create()}>
            {savingNew ? 'Creating…' : 'Create directive'}
          </button>
        </div>
      )}
      {directives.length === 0 && (
        <div className="text-sm text-muted-foreground">No directives yet — they'll appear here when case analysis suggests one, or when you create one.</div>
      )}
      {groups.map(g => (
        <section key={g.status} className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{g.status} ({g.rows.length})</h2>
          {g.rows.map(d => {
            const f = draftFor(d)
            const open = expanded[d.id]
            return (
              <div key={d.id} className="border rounded-md p-4 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusBadge status={d.status || d.data?.status || 'draft'} />
                    <span className="font-medium truncate">{d.title}</span>
                    <span className="text-xs text-muted-foreground">mode: {d.data?.mode || 'suggest'}</span>
                    {d.data?.is_ai_generated && <span className="text-xs text-muted-foreground">AI-suggested</span>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="text-xs underline" onClick={() => setExpanded(p => ({ ...p, [d.id]: !open }))}>{open ? 'Close' : 'Edit'}</button>
                    {d.status !== 'active' && <button className="text-xs underline" onClick={() => void setStatus(d, 'active')}>Activate</button>}
                    {d.status === 'active' && <button className="text-xs underline" onClick={() => void setStatus(d, 'disabled')}>Disable</button>}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{d.data?.match_description}</div>
                {open && (
                  <div className="space-y-3 pt-2 border-t">
                    <label className="block text-xs">Match description
                      <textarea className="mt-1 w-full border rounded p-2 text-sm" rows={2} value={f.match_description}
                        onChange={e => setDraft(d.id, { match_description: e.target.value })} />
                    </label>
                    <label className="block text-xs">Reply template
                      <textarea className="mt-1 w-full border rounded p-2 text-sm" rows={3} value={f.reply_template}
                        onChange={e => setDraft(d.id, { reply_template: e.target.value })} />
                    </label>
                    <div className="flex gap-4">
                      <label className="text-xs">Mode
                        <select className="ml-2 border rounded p-1 text-sm" value={f.mode}
                          onChange={e => setDraft(d.id, { mode: e.target.value })}>
                          <option value="suggest">suggest</option>
                          <option value="auto_reply">auto_reply</option>
                        </select>
                      </label>
                      <label className="text-xs">Priority
                        <input className="ml-2 border rounded p-1 text-sm w-20" type="number" value={f.priority}
                          onChange={e => setDraft(d.id, { priority: e.target.value })} />
                      </label>
                    </div>
                    <label className="block text-xs">Actions (JSON)
                      <textarea className="mt-1 w-full border rounded p-2 text-xs font-mono" rows={6} value={f.actions}
                        onChange={e => setDraft(d.id, { actions: e.target.value })} />
                    </label>
                    <button className="text-sm border rounded px-3 py-1" onClick={() => void save(d)}>Save</button>
                  </div>
                )}
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}
