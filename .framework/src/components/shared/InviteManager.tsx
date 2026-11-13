

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { apiFetch } from '../../lib/api'



export type InviteScope = 'account' | 'system'



export interface AllowedRole {
  slug: string
  name: string
}



export interface InviteManagerProps {
  accountId?: string
  allowedRoles: AllowedRole[]
  roleSlugsFilter?: string
  scope: InviteScope
}



interface InviteRow {
  id: string
  email: string
  full_name: string
  status: 'invited' | 'pending' | 'approved' | 'active' | 'inactive' | 'expired' | 'blocked'
  kind: 'invite' | 'access_request'
  expires_at: string | null
  blocked_at: string | null
  created_at: string
  account: { id: string; slug: string; display_name: string } | null
  role: { id: string; slug: string; name: string } | null
}


async function callInvitesApi(action: string, params: Record<string, any> = {}, method: 'GET' | 'POST' = 'GET') {
  const base = '/.netlify/functions/invites'
  if (method === 'GET') {
    const qs = new URLSearchParams({ action, ...params }).toString()
    const res = await apiFetch(`${base}?${qs}`)
    return res.json()
  }
  const res = await apiFetch(`${base}?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return res.json()
}


function deriveDisplayStatus(row: InviteRow): string {
  if (row.blocked_at) return 'blocked'
  if (row.status === 'inactive') return 'revoked'
  if (row.status === 'active' && row.kind === 'invite') return 'claimed'
  if (row.status === 'active') return 'approved'
  if (row.status === 'pending') return 'pending approval'
  if (row.status === 'invited') {
    if (row.expires_at && new Date(row.expires_at) < new Date()) return 'expired'
    return 'pending'
  }
  return row.status
}



const STATUS_CLASSES: Record<string, string> = {
  pending:            'bg-yellow-100 text-yellow-800',
  'pending approval': 'bg-blue-100 text-blue-800',
  claimed:            'bg-blue-100 text-blue-800',
  approved:           'bg-green-100 text-green-800',
  expired:            'bg-slate-100 text-slate-600',
  blocked:            'bg-red-100 text-red-800',
  revoked:            'bg-slate-100 text-slate-500',
}




function timeUntil(iso: string | null): string {
  if (!iso) return '—'
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'expired'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `${days}d`
  return `${hours}h`
}


export function InviteManager({ accountId, allowedRoles, roleSlugsFilter, scope }: InviteManagerProps) {
  const [invites, setInvites] = useState<InviteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [selectedRoleSlug, setSelectedRoleSlug] = useState(allowedRoles[0]?.slug ?? '')
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<'full_name' | 'email' | 'status' | 'created_at'>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  useEffect(() => {
    if (!allowedRoles.find(r => r.slug === selectedRoleSlug)) {
      setSelectedRoleSlug(allowedRoles[0]?.slug ?? '')
    }
  }, [allowedRoles, selectedRoleSlug])

  const loadInvites = useCallback(async () => {
    setLoading(true)
    setError('')
    const params: Record<string, string> = {}
    if (accountId) params.account_id = accountId
    if (roleSlugsFilter) params.role_slugs = roleSlugsFilter

    const result = await callInvitesApi('list-invites', params)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setInvites(result.data || [])
    }
  }, [accountId, roleSlugsFilter])

  useEffect(() => { loadInvites() }, [loadInvites])

  const filteredInvites = useMemo(() => {
    const q = search.toLowerCase()
    const filtered = q
      ? invites.filter(r =>
          r.full_name?.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          deriveDisplayStatus(r).includes(q) ||
          r.role?.name?.toLowerCase().includes(q)
        )
      : invites

    return [...filtered].sort((a, b) => {
      let av = '', bv = ''
      if (sortKey === 'full_name')   { av = a.full_name ?? ''; bv = b.full_name ?? '' }
      if (sortKey === 'email')       { av = a.email; bv = b.email }
      if (sortKey === 'status')      { av = deriveDisplayStatus(a); bv = deriveDisplayStatus(b) }
      if (sortKey === 'created_at')  { av = a.created_at; bv = b.created_at }
      const cmp = av.localeCompare(bv)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [invites, search, sortKey, sortDir])

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim() || !accountId) return
    setGenerating(true)
    setGenerateError('')

    const result = await callInvitesApi('create-invite', {
      full_name: newName.trim() || undefined,
      email: newEmail.trim(),
      account_id: accountId,
      role_slug: selectedRoleSlug,
      allowed_role_slugs: allowedRoles.map(r => r.slug),
      base_url: window.location.origin,
    }, 'POST')

    setGenerating(false)

    if (result.error) {
      setGenerateError(result.error)
      return
    }

    if (result.data?.invite_url) {
      navigator.clipboard.writeText(result.data.invite_url).catch(() => {})
    }

    setNewName('')
    setNewEmail('')
    await loadInvites()
  }

  const handleReinvite = async (personId: string) => {
    const result = await callInvitesApi('reinvite', {
      person_id: personId,
      base_url: window.location.origin,
    }, 'POST')
    if (result.error) {
      setError(result.error)
    } else {
      if (result.data?.invite_url) {
        navigator.clipboard.writeText(result.data.invite_url).catch(() => {})
        setCopiedId(personId)
        setTimeout(() => setCopiedId(null), 2000)
      }
      await loadInvites()
    }
  }

  const handleAction = async (action: string, personId: string) => {
    const result = await callInvitesApi(action, { person_id: personId }, 'POST')
    if (result.error) {
      setError(result.error)
    } else {
      await loadInvites()
    }
  }

  const canGenerate = !!accountId || scope === 'system'
  const showRolePicker = allowedRoles.length > 1

  return (
    <div className="space-y-6">

      {/* Generate invite form */}
      <form onSubmit={handleGenerate} className="space-y-3">
        <div className="flex gap-3 items-end flex-wrap">
          {/* Name */}
          <div className="flex-1 min-w-[160px]">
            <label htmlFor="invite-name" className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              id="invite-name"
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Jane Smith"
              disabled={!canGenerate}
              className="block w-full px-3 py-2 border border-slate-300 rounded-[5px] shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
            />
          </div>

          {/* Email */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="invite-email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="colleague@company.com"
              disabled={!canGenerate}
              className="block w-full px-3 py-2 border border-slate-300 rounded-[5px] shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
            />
          </div>

          {/* Role picker — only shown when more than one role is available */}
          {showRolePicker && (
            <div className="min-w-[140px]">
              <label htmlFor="invite-role" className="block text-sm font-medium text-slate-700 mb-1">
                Role
              </label>
              <select
                id="invite-role"
                value={selectedRoleSlug}
                onChange={e => setSelectedRoleSlug(e.target.value)}
                disabled={!canGenerate}
                className="block w-full px-3 py-2 border border-slate-300 rounded-[5px] shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 bg-white"
              >
                {allowedRoles.map(r => (
                  <option key={r.slug} value={r.slug}>{r.name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={generating || !newEmail.trim() || !canGenerate}
            className="px-4 py-2 rounded-[5px] bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap self-end"
          >
            {generating ? 'Generating...' : 'Generate Link'}
          </button>
        </div>

        {!canGenerate && (
          <p className="text-xs text-slate-500">Select an account to enable invite generation.</p>
        )}
      </form>

      {generateError && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{generateError}</p>
        </div>
      )}

      <hr className="border-slate-200" />

      {/* Search bar */}
      <div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or status…"
          className="block w-full px-3 py-2 border border-slate-300 rounded-[5px] shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Invite list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900" />
        </div>
      ) : filteredInvites.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-sm">
            {invites.length === 0
              ? 'No invites yet. Generate a link above to invite someone.'
              : 'No results match your search.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <SortTh label="Name"    col="full_name"  current={sortKey} dir={sortDir} onSort={handleSort} />
                <SortTh label="Email"   col="email"      current={sortKey} dir={sortDir} onSort={handleSort} />
                {scope === 'system' && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Account</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <SortTh label="Status"  col="status"     current={sortKey} dir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Expires</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvites.map(row => {


                const displayStatus = deriveDisplayStatus(row)



                const isPending   = row.status === 'invited' && !row.blocked_at && !(row.expires_at && new Date(row.expires_at) < new Date())



                const isExpired   = displayStatus === 'expired'



                const isBlocked   = displayStatus === 'blocked'



                const isRevoked   = displayStatus === 'revoked'



                const isClaimed   = displayStatus === 'claimed'



                const isApproved  = displayStatus === 'approved'



                const isAccessReq = row.status === 'pending' && row.kind === 'access_request'


                return (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">{row.full_name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{row.email}</td>

                    {scope === 'system' && (
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {row.account?.display_name ?? '—'}
                      </td>
                    )}

                    <td className="px-4 py-3 text-sm text-slate-600">
                      {row.role?.name ?? '—'}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CLASSES[displayStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                        {displayStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-500">
                      {row.status === 'invited' ? timeUntil(row.expires_at) : '—'}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end flex-wrap">

                        {/* Pending unclaimed invite — Reinvite + Revoke */}
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleReinvite(row.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:border-blue-400"
                            >
                              {copiedId === row.id ? 'Copied!' : 'Reinvite'}
                            </button>
                            <button
                              onClick={() => handleAction('revoke-invite', row.id)}
                              className="text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded border border-slate-200 hover:border-red-300"
                            >
                              Revoke
                            </button>
                          </>
                        )}

                        {/* Expired — Reinvite + Revoke */}
                        {isExpired && (
                          <>
                            <button
                              onClick={() => handleReinvite(row.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:border-blue-400"
                            >
                              {copiedId === row.id ? 'Copied!' : 'Reinvite'}
                            </button>
                            <button
                              onClick={() => handleAction('revoke-invite', row.id)}
                              className="text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded border border-slate-200 hover:border-red-300"
                            >
                              Revoke
                            </button>
                          </>
                        )}

                        {/* Blocked — Reinvite only (unblock + new token) */}
                        {isBlocked && (
                          <button
                            onClick={() => handleReinvite(row.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:border-blue-400"
                          >
                            {copiedId === row.id ? 'Copied!' : 'Reinvite'}
                          </button>
                        )}

                        {/* Revoked — Reinvite only */}
                        {isRevoked && (
                          <button
                            onClick={() => handleReinvite(row.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:border-blue-400"
                          >
                            {copiedId === row.id ? 'Copied!' : 'Reinvite'}
                          </button>
                        )}

                        {/* Claimed (active invite) or Approved (access request) — no actions, visible in list */}
                        {(isClaimed || isApproved) && (
                          <span className="text-xs text-slate-400 px-2 py-1">—</span>
                        )}

                        {/* Pending access request — Approve + Deny */}
                        {isAccessReq && (
                          <>
                            <button
                              onClick={() => handleAction('approve', row.id)}
                              className="text-xs text-white bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction('deny', row.id)}
                              className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded border border-red-200 hover:border-red-400"
                            >
                              Deny
                            </button>
                          </>
                        )}

                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}










function SortTh({
  label, col, current, dir, onSort
}: {
  label: string
  col: 'full_name' | 'email' | 'status' | 'created_at'
  current: string
  dir: 'asc' | 'desc'
  onSort: (col: 'full_name' | 'email' | 'status' | 'created_at') => void
}) {
  const active = current === col
  return (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700"
      onClick={() => onSort(col)}
    >
      {label}
      {active ? (dir === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
    </th>
  )
}