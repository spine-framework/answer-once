// CIL[BEGIN stable_id="~/.framework/src/components/shared/MemberList.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/shared/MemberList.tsx"]
// CIL[DOC-MACRO purpose="MemberList shared component module"]
// CIL[DOC-RESPONSIBILITY responsibility="Imports React hooks and the shared apiFetch client for the MemberList component."]
// CIL[DOC-CONTEXT module="shared" layer="ui" related_files=".framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Sets up the MemberList module by importing React hooks and the shared apiFetch utility." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="shared-ui"]

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { apiFetch } from '../../lib/api'

// CIL[DOC-VECTOR type="context" content="purpose='MemberList shared component module'; No verified external callers; imports: .framework/src/lib/api.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/MemberList.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/shared/MemberList.tsx:allowedrole:interface" type="interface" identity="allowedrole" parent="~/.framework/src/components/shared/MemberList.tsx"]
// CIL[DOC-MACRO purpose="AllowedRole interface definition"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the shape of a selectable role for members."]
// CIL[DOC-CONTEXT module="shared" layer="ui" related_files=".framework/src/components/shared/MemberList.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="AllowedRole object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares slug and name properties for an allowed role." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface AllowedRole {
  slug: string
  name: string
}
// CIL[DOC-VECTOR type="context" content="purpose='AllowedRole interface definition'; No verified external callers; imports: .framework/src/lib/api.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/MemberList.tsx:allowedrole:interface"]


// CIL[BEGIN stable_id="~/.framework/src/components/shared/MemberList.tsx:member:interface" type="interface" identity="member" parent="~/.framework/src/components/shared/MemberList.tsx"]
// CIL[DOC-MACRO purpose="Member interface definition"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the shape of a member row returned by the invites API."]
// CIL[DOC-CONTEXT module="shared" layer="ui" related_files=".framework/src/components/shared/MemberList.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Member object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares id, full_name, email, status, nested role, and is_active fields for a member." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface Member {
  id: string
  full_name: string | null
  email: string
  status: string
  role: { id: string; slug: string; name: string } | null
  is_active: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Member interface definition'; No verified external callers; imports: .framework/src/lib/api.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/MemberList.tsx:member:interface"]


// CIL[BEGIN stable_id="~/.framework/src/components/shared/MemberList.tsx:callinvitesapi:function" type="function" identity="callinvitesapi" parent="~/.framework/src/components/shared/MemberList.tsx"]
// CIL[DOC-MACRO purpose="Call invites API helper"]
// CIL[DOC-RESPONSIBILITY responsibility="Sends GET or POST requests to the Netlify invites function endpoint."]
// CIL[DOC-CONTEXT module="shared" layer="ui" related_files=".framework/src/components/shared/MemberList.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="action: string, params: Record<string, any>, method: 'GET' | 'POST'" outputs="JSON response" errors="throws on network or invalid response" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Builds a query string for GET requests and a JSON body for POST requests, then fetches via apiFetch." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Call invites API helper'; No verified external callers; imports: .framework/src/lib/api.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/MemberList.tsx:callinvitesapi:function"]


// CIL[BEGIN stable_id="~/.framework/src/components/shared/MemberList.tsx:memberlistprops:interface" type="interface" identity="memberlistprops" parent="~/.framework/src/components/shared/MemberList.tsx"]
// CIL[DOC-MACRO purpose="MemberListProps interface definition"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the props accepted by the MemberList component."]
// CIL[DOC-CONTEXT module="shared" layer="ui" related_files=".framework/src/components/shared/MemberList.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="MemberListProps object" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares optional accountId and required allowedRoles props for MemberList." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export interface MemberListProps {
  accountId?: string
  allowedRoles: AllowedRole[]
}
// CIL[DOC-VECTOR type="context" content="purpose='MemberListProps interface definition'; No verified external callers; imports: .framework/src/lib/api.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/MemberList.tsx:memberlistprops:interface"]


// CIL[BEGIN stable_id="~/.framework/src/components/shared/MemberList.tsx:memberlist:function" type="function" identity="memberlist" parent="~/.framework/src/components/shared/MemberList.tsx"]
// CIL[DOC-MACRO purpose="MemberList React component"]
// CIL[DOC-RESPONSIBILITY responsibility="Renders a searchable, role-editable table of active account members."]
// CIL[DOC-CONTEXT module="shared" layer="ui" related_files=".framework/src/components/shared/MemberList.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="accountId: string | undefined, allowedRoles: AllowedRole[]" outputs="JSX table of active members" errors="displays API errors inline" side_effects="calls invites API on load and role/deactivate actions"]
// CIL[DOC-MICRO logic_summary="Loads active members, filters by search string, renders role selects and action buttons, and supports updating or deactivating members." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='MemberList React component'; No verified external callers; imports: .framework/src/lib/api.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/MemberList.tsx:memberlist:function"]
