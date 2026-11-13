// ban_user accepts person_id OR email OR ip so anonymous-signal rows (no person) still ban by account/ip; all calls go through apiFetch — service role never leaves the server

import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../lib/api'
import { Button } from '../../components/ui/button'
import { Checkbox } from '../../components/ui/checkbox'
import { Badge } from '../../components/ui/badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table'

type FlaggedRow = {
  person_id: string | null
  email: string | null
  account_id: string | null
  account_name: string | null
  last_ip: string | null
  last_country: string | null
  person_status: string | null
  signals: number
  kinds: string[]
  patterns: string[]
  last_seen_at: string | null
  banned: boolean
}

type BlocklistRow = {
  id: string
  type: string
  value: string
  severity: string
  reason: string | null
  expires_at: string | null
  revoked_at: string | null
  created_at: string
}

function rowKey(r: FlaggedRow): string {
  return r.person_id || `acct:${r.account_id || 'unknown'}`
}

async function callSecurity(action: string, body?: any) {
  const res = await apiFetch(`/api/security?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error || data?.message || `${action} failed (${res.status})`)
  return data?.data ?? data
}

export function SecurityPage() {
  const [rows, setRows] = useState<FlaggedRow[]>([])
  const [blocklist, setBlocklist] = useState<BlocklistRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [actionBusy, setActionBusy] = useState(false)
  const [actionResult, setActionResult] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [flagged, bl] = await Promise.all([
        callSecurity('flagged_accounts'),
        callSecurity('blocklist'),
      ])
      setRows(flagged?.rows || [])
      setBlocklist(bl?.rows || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load security data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const rowByKey = useMemo(() => new Map(rows.map(r => [rowKey(r), r])), [rows])
  const selectedRows = useMemo(
    () => [...selected].map(k => rowByKey.get(k)).filter(Boolean) as FlaggedRow[],
    [selected, rowByKey]
  )

  const toggle = (key: string, checked: boolean) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (checked) next.add(key); else next.delete(key)
      return next
    })
  }

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(rows.map(rowKey)) : new Set())
  }

  const banSelected = async () => {
    if (!selectedRows.length) return
    setActionBusy(true)
    setActionResult(null)
    const results: string[] = []
    for (const r of selectedRows) {
      try {
        const res = await callSecurity('ban_user', {
          person_id: r.person_id || undefined,
          email: r.email || undefined,
          ip: r.last_ip || undefined,
          reason: `Security admin action — signals: ${r.kinds.join(', ')}`,
        })
        results.push(`${r.email || r.account_name || rowKey(r)}: banned (auth:${res.layers?.auth} edge:${res.layers?.edge})`)
      } catch (e: any) {
        results.push(`${r.email || rowKey(r)}: FAILED — ${e?.message}`)
      }
    }
    setActionResult(results.join('\n'))
    setSelected(new Set())
    setActionBusy(false)
    void load()
  }

  const unbanRow = async (r: FlaggedRow) => {
    if (!r.person_id) { setActionResult('Cannot unban — no person id on this row'); return }
    setActionBusy(true)
    try {
      const res = await callSecurity('unban_user', { person_id: r.person_id })
      setActionResult(`${r.email || r.person_id}: unbanned (auth:${res.layers?.auth} edge:${res.layers?.edge})`)
    } catch (e: any) {
      setActionResult(`Unban failed: ${e?.message}`)
    }
    setActionBusy(false)
    void load()
  }

  const revokeEntry = async (entry: BlocklistRow) => {
    setActionBusy(true)
    try {
      await callSecurity('blocklist_revoke', { id: entry.id })
    } catch (e: any) {
      setActionResult(`Revoke failed: ${e?.message}`)
    }
    setActionBusy(false)
    void load()
  }

  const allChecked = rows.length > 0 && selected.size === rows.length
  const activeBlocklist = blocklist.filter(b => !b.revoked_at)

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Security</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Flagged actors and platform blocklist. "Add to Blacklist" applies all
          three layers: internal blocklist, Supabase Auth ban, and Netlify edge IP deny.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}
      {actionResult && (
        <pre className="rounded-md bg-slate-100 border border-slate-200 p-3 text-xs whitespace-pre-wrap">{actionResult}</pre>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Flagged actors</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => load()} disabled={loading}>
              Refresh
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={!selected.size || actionBusy}
              onClick={banSelected}
            >
              {actionBusy ? <LoadingSpinner size="sm" /> : null}
              Add to Blacklist{selected.size ? ` (${selected.size})` : ''}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner /></div>
        ) : rows.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-muted-foreground">
            No security signals yet. Rate-limit violations, prompt-injection detections,
            and blocked registrations appear here.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allChecked}
                    onCheckedChange={(c) => toggleAll(c === true)}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>IP / Country</TableHead>
                <TableHead>Signals</TableHead>
                <TableHead>Last seen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={rowKey(r)}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(rowKey(r))}
                      onCheckedChange={(c) => toggle(rowKey(r), c === true)}
                      aria-label={`Select ${r.email || rowKey(r)}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {r.email || <span className="text-muted-foreground">(no person)</span>}
                  </TableCell>
                  <TableCell>{r.account_name || '—'}</TableCell>
                  <TableCell className="text-xs">
                    {r.last_ip || '—'}{r.last_country ? ` · ${r.last_country.toUpperCase()}` : ''}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 items-center">
                      <Badge variant="secondary">{r.signals}×</Badge>
                      {r.kinds.map(k => (
                        <Badge key={k} variant="outline" className="text-xs">{k}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.last_seen_at ? new Date(r.last_seen_at).toLocaleString() : '—'}
                  </TableCell>
                  <TableCell>
                    {r.banned
                      ? <Badge variant="destructive">banned</Badge>
                      : <Badge variant="outline">{r.person_status || 'active'}</Badge>}
                  </TableCell>
                  <TableCell>
                    {r.banned && r.person_id ? (
                      <Button variant="ghost" size="sm" disabled={actionBusy} onClick={() => unbanRow(r)}>
                        Unban
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Active blocklist</h2>
        {activeBlocklist.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-muted-foreground">
            No active blocklist entries.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeBlocklist.map((b) => (
                <TableRow key={b.id}>
                  <TableCell><Badge variant="outline">{b.type}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{b.value}</TableCell>
                  <TableCell>{b.severity}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{b.reason || '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(b.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" disabled={actionBusy} onClick={() => revokeEntry(b)}>
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}
