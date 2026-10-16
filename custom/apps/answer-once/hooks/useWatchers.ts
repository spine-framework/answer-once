// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Watcher subscription helpers for Answer Once records"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide watch state per record, idempotent auto-watch, unread tracking via last_seen_at, and ticket activity stamping"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/hooks/useWatchers.ts" layer="custom_app" related_files=".framework/src/lib/api.ts, custom/apps/answer-once/hooks/useTickets.ts"]
// CIL[DOC-CONTRACT inputs="target/person ids" outputs="{ watching, watcherId, toggle, markSeen } / Map<targetId, watcher> / side-effect helpers" errors="network errors surfaced where sensible" side_effects="GET/POST/PATCH/DELETE /api/admin-data watchers + items"]
// CIL[DOC-MICRO logic_summary="Watchers are created through /api/admin-data entity=watchers (type_slug watcher); last_seen_at lives in watcher.data and ticket activity in ticket.data.last_activity_at — Needs Attention = escalated statuses OR watched tickets whose last_activity_at exceeds the watch baseline" notable_decisions="watch baseline falls back to watcher.created_at so activity after subscribing counts as unread"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@core/lib/api'
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:fetchjson:function" type="function" identity="fetchJSON" parent="~/custom/apps/answer-once/hooks/useWatchers.ts"]
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
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:fetchjson:function"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:normalizedataforwrite:function" type="function" identity="normalizeDataForWrite" parent="~/custom/apps/answer-once/hooks/useWatchers.ts"]
// CIL[DOC-MACRO purpose="Convert display-formatted timestamps back to ISO before a data PATCH"]
// CIL[DOC-MICRO logic_summary="admin-data returns *_at fields display-formatted; sending them back verbatim fails datetime validation — normalize or null them first" notable_decisions="same normalization KBArticlePage applies before saving articles"]
export function normalizeDataForWrite(data: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = { ...data }
  for (const key of Object.keys(out)) {
    if (!/(_at|_timestamp|_date|_time)$/.test(key)) continue
    const v = out[key]
    if (typeof v === 'string' && v && !/^\d{4}-\d{2}-\d{2}T/.test(v)) {
      let t = new Date(v)
      if (Number.isNaN(t.getTime())) t = new Date(v.replace(/ at /i, ' '))
      out[key] = Number.isNaN(t.getTime()) ? null : t.toISOString()
    }
  }
  return out
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:normalizedataforwrite:function"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:watcher:interface" type="interface" identity="Watcher" parent="~/custom/apps/answer-once/hooks/useWatchers.ts"]
export interface Watcher {
  id: string
  target_id: string
  person_id: string
  created_at?: string
  data?: Record<string, any>
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:watcher:interface"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:ensurewatching:function" type="function" identity="ensureWatching" parent="~/custom/apps/answer-once/hooks/useWatchers.ts"]
// CIL[DOC-MACRO purpose="Idempotently subscribe a person to a record"]
// CIL[DOC-RESPONSIBILITY responsibility="Return the existing watcher row or create one for (target, person)"]
// CIL[DOC-CONTRACT inputs="targetId: string, personId: string" outputs="Promise<Watcher | null>" errors="swallows failures (watching is best-effort)" side_effects="GET/POST /api/admin-data watchers"]
// CIL[DOC-MICRO logic_summary="Lists watchers for target+person; creates with watch_type all when absent" notable_decisions="unique(target_type,target_id,person_id) makes a list-then-create race safe — a duplicate insert just errors and is ignored"]
export async function ensureWatching(targetId: string, personId: string): Promise<Watcher | null> {
  try {
    const existing = await fetchJSON(
      `/api/admin-data?entity=watchers&target_type=item&target_id=${targetId}&person_id=${personId}`
    )
    const row = Array.isArray(existing) ? existing[0] : null
    if (row) return row
    return await fetchJSON('/api/admin-data?entity=watchers', {
      method: 'POST',
      body: JSON.stringify({
        entity: 'watchers',
        type_slug: 'watcher',
        target_type: 'item',
        target_id: targetId,
        person_id: personId,
        watch_type: 'all',
      }),
    })
  } catch {
    return null
  }
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:ensurewatching:function"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:markseen:function" type="function" identity="markSeen" parent="~/custom/apps/answer-once/hooks/useWatchers.ts"]
// CIL[DOC-MACRO purpose="Clear the unread marker on a watched record"]
// CIL[DOC-RESPONSIBILITY responsibility="Stamp watcher.data.last_seen_at = now so later activity counts as unread"]
export async function markSeen(watcher: Watcher | null | undefined): Promise<void> {
  if (!watcher?.id) return
  try {
    await fetchJSON(`/api/admin-data?entity=watchers&id=${watcher.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ data: { ...(watcher.data || {}), last_seen_at: new Date().toISOString() } }),
    })
  } catch {
    // best-effort
  }
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:markseen:function"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:touchactivity:function" type="function" identity="touchTicketActivity" parent="~/custom/apps/answer-once/hooks/useWatchers.ts"]
// CIL[DOC-MACRO purpose="Stamp a ticket's last-activity timestamp"]
// CIL[DOC-RESPONSIBILITY responsibility="Merge last_activity_at into ticket.data so watch baselines can detect unread"]
// CIL[DOC-CONTRACT inputs="ticketId: string, extraData?: Record<string, any>" outputs="Promise<void>" errors="swallowed — activity stamping is best-effort" side_effects="GET + PATCH /api/admin-data items"]
// CIL[DOC-MICRO logic_summary="GET-then-PATCH merge — admin-data replaces data wholesale, so the current object is fetched first" notable_decisions="called after every human message send; agent-side activity is stamped in finalizeTicket server-side"]
// CIL[DOC-STABILITY stability="experimental"]
export async function touchTicketActivity(ticketId: string, extraData?: Record<string, any>): Promise<void> {
  try {
    const current = await fetchJSON(`/api/admin-data?entity=items&id=${ticketId}`)
    await fetchJSON(`/api/admin-data?entity=items&id=${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: {
          ...normalizeDataForWrite(current?.data || {}),
          ...(extraData || {}),
          last_activity_at: new Date().toISOString(),
        },
      }),
    })
  } catch {
    // best-effort — never block a send on bookkeeping
  }
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:touchactivity:function"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:hasunread:function" type="function" identity="hasUnreadActivity" parent="~/custom/apps/answer-once/hooks/useWatchers.ts"]
// CIL[DOC-MACRO purpose="Decide whether a watched ticket has unread activity"]
// CIL[DOC-CONTRACT inputs="ticket { data }, watcher" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Compares ticket.data.last_activity_at to watcher.data.last_seen_at (fallback watcher.created_at). Both arrive display-formatted from admin-data when declared in design_schema, so parsing tolerates the 'Month D, YYYY at h:mm AM' shape" notable_decisions="a timestamp that cannot be parsed is treated as no-activity rather than unread — false negatives are safer than a permanently-lit queue"]
function parseStamp(v: any): number {
  if (typeof v !== 'string' || !v) return 0
  let t = new Date(v).getTime()
  if (Number.isNaN(t)) t = new Date(v.replace(/ at /i, ' ')).getTime()
  return Number.isNaN(t) ? 0 : t
}

export function hasUnreadActivity(ticket: any, watcher: Watcher | undefined): boolean {
  if (!watcher) return false
  const last = parseStamp(ticket?.data?.last_activity_at)
  if (!last) return false
  const baseline = parseStamp(watcher.data?.last_seen_at || watcher.created_at)
  if (!baseline) return true
  return last > baseline
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:hasunread:function"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:usewatch:function" type="function" identity="useWatch" parent="~/custom/apps/answer-once/hooks/useWatchers.ts"]
// CIL[DOC-MACRO purpose="Watch state + toggle for the current user on one record"]
// CIL[DOC-RESPONSIBILITY responsibility="Load my watcher row for a target, expose watching/watcher/toggle, and mark seen on open"]
// CIL[DOC-CONTRACT inputs="targetId: string | null, personId: string | undefined" outputs="{ watching, watcher, toggle }" errors="swallowed" side_effects="GET/POST/DELETE watchers; PATCH last_seen_at when a watcher exists and the page opens"]
// CIL[DOC-MICRO logic_summary="On mount: fetch my watcher; if present markSeen clears unread (viewing implies read). toggle creates or deletes the watcher row" notable_decisions="opening a watched ticket clears its unread flag; viewing does NOT subscribe"]
export function useWatch(targetId: string | null, personId: string | undefined) {
  const [watcher, setWatcher] = useState<Watcher | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!targetId || !personId) return
    let cancelled = false
    fetchJSON(`/api/admin-data?entity=watchers&target_type=item&target_id=${targetId}&person_id=${personId}`)
      .then((rows) => {
        const w = Array.isArray(rows) ? rows[0] || null : null
        if (cancelled) return
        setWatcher(w)
        if (w) markSeen(w)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [targetId, personId])

  const toggle = useCallback(async () => {
    if (!targetId || !personId || loading) return
    setLoading(true)
    try {
      if (watcher) {
        await fetchJSON(`/api/admin-data?entity=watchers&id=${watcher.id}`, { method: 'DELETE' })
        setWatcher(null)
      } else {
        const w = await ensureWatching(targetId, personId)
        if (w) setWatcher(w)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [targetId, personId, watcher, loading])

  return { watching: !!watcher, watcher, toggle, loading }
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:usewatch:function"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:usewatchedmap:function" type="function" identity="useWatchedMap" parent="~/custom/apps/answer-once/hooks/useWatchers.ts"]
// CIL[DOC-MACRO purpose="Map of target_id → watcher for list pages"]
// CIL[DOC-RESPONSIBILITY responsibility="Load all my watcher rows once so ticket lists can flag watched + unread"]
export function useWatchedMap(personId: string | undefined) {
  const [map, setMap] = useState<Map<string, Watcher>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!personId) { setLoading(false); return }
    fetchJSON(`/api/admin-data?entity=watchers&target_type=item&person_id=${personId}`)
      .then((rows) => {
        const m = new Map<string, Watcher>()
        for (const w of Array.isArray(rows) ? rows : []) m.set(w.target_id, w)
        setMap(m)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [personId])

  return { watchedMap: map, loading }
}
// CIL[END stable_id="~/custom/apps/answer-once/hooks/useWatchers.ts:usewatchedmap:function"]
