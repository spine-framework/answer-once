import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '@core/lib/api'

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

const DISPLAY_STAMP_RE = /^[A-Z][a-z]+ \d{1,2}, \d{4} at \d{2}:\d{2} [AP]M$/
export function normalizeDataForWrite(data: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = { ...data }
  for (const key of Object.keys(out)) {
    const v = out[key]
    if (typeof v !== 'string' || !v || /^\d{4}-\d{2}-\d{2}T/.test(v)) continue
    if (!/(_at|_timestamp|_date|_time|_since|_until)$/.test(key) && !DISPLAY_STAMP_RE.test(v)) continue
    const t = parseStamp(v)
    out[key] = t ? new Date(t).toISOString() : null
  }
  return out
}

export interface Watcher {
  id: string
  target_id: string
  person_id: string
  created_at?: string
  data?: Record<string, any>
}

// unique(target_type,target_id,person_id) makes a list-then-create race safe — a duplicate insert just errors and is ignored
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

// a timestamp that cannot be parsed is treated as no-activity rather than unread — false negatives are safer than a permanently-lit queue
export function parseStamp(v: any): number {
  if (typeof v !== 'string' || !v) return 0
  let t = new Date(v).getTime()
  if (Number.isNaN(t)) t = new Date(v.replace(/ at /i, ' ')).getTime()
  return Number.isNaN(t) ? 0 : t
}

export function formatStamp(v: any): string {
  const ts = parseStamp(v)
  return ts ? new Date(ts).toLocaleString() : (v ? String(v) : '')
}

export function hasUnreadActivity(ticket: any, watcher: Watcher | undefined): boolean {
  if (!watcher) return false
  const last = parseStamp(ticket?.data?.last_activity_at)
  if (!last) return false
  const baseline = parseStamp(watcher.data?.last_seen_at || watcher.created_at)
  if (!baseline) return true
  return last > baseline
}

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
