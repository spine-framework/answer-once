
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { apiFetch } from '../../lib/api'


export interface AllowedRole {
  slug: string
  name: string
}


interface Member {
  id: string
  full_name: string | null
  email: string
  status: string
  role: { id: string; slug: string; name: string } | null
  is_active: boolean
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


export interface MemberListProps {
  accountId?: string
  allowedRoles: AllowedRole[]
}


export function MemberList({ accountId, allowedRoles }: MemberListProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    if (!accountId) return
    setLoading(true)
    setError('')
    const result = await callInvitesApi('list-members', { account_id: accountId })
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      const rows = (result.data || []).filter((m: Member) => m.is_active || m.status === 'active')
      setMembers(rows)
      const roleMap: Record<string, string> = {}
      for (const m of rows) {
        if (m.role?.slug) roleMap[m.id] = m.role.slug
      }
      setSelectedRole(roleMap)
    }
  }, [accountId])

  useEffect(() => { load() }, [load])

  const handleRoleChange = async (personId: string) => {
    const newSlug = selectedRole[personId]
    const current = members.find(m => m.id === personId)?.role?.slug
    if (!newSlug || newSlug === current) return

    setError('')
    const result = await callInvitesApi('update-member', { person_id: personId, role_slug: newSlug }, 'POST')
    if (result.error) {
      setError(result.error)
    } else {
      await load()
    }
  }

  const handleDeactivate = async (personId: string) => {
    setError('')
    const result = await callInvitesApi('deactivate-member', { person_id: personId }, 'POST')
    if (result.error) {
      setError(result.error)
    } else {
      await load()
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return members
    return members.filter(m =>
      (m.full_name ?? '').toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.role?.name ?? '').toLowerCase().includes(q)
    )
  }, [members, search])

  const canShowRole = (slug: string) => allowedRoles.some(r => r.slug === slug)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-slate-900">Active members</h2>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search members…"
          className="w-64 px-3 py-2 border border-slate-300 rounded-[5px] shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p className="text-sm">No active members.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">{m.full_name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{m.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {canShowRole(m.role?.slug ?? '') ? m.role?.name : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end items-center flex-wrap">
                      <select
                        value={selectedRole[m.id] ?? m.role?.slug ?? ''}
                        onChange={e => setSelectedRole(s => ({ ...s, [m.id]: e.target.value }))}
                        className="text-sm border border-slate-300 rounded-[5px] px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {allowedRoles.map(r => (
                          <option key={r.slug} value={r.slug}>{r.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleRoleChange(m.id)}
                        disabled={selectedRole[m.id] === m.role?.slug}
                        className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:border-blue-400 disabled:opacity-50"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeactivate(m.id)}
                        className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded border border-red-200 hover:border-red-400"
                      >
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
