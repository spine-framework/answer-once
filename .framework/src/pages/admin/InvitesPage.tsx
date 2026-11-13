import React from 'react'
import { InviteManager } from '../../components/shared/InviteManager'
import { useAuth } from '../../contexts/AuthContext'


const FRAMEWORK_ROLES = [
  { slug: 'system_admin', name: 'System Admin' },
]

const FRAMEWORK_ROLE_SLUGS = FRAMEWORK_ROLES.map(r => r.slug).join(',')


export function InvitesPage() {
  const { user } = useAuth()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Invites & Access</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage system administrator invites for the Spine Framework.
        </p>
      </div>

      <InviteManager
        scope="account"
        accountId={user?.account_id}
        allowedRoles={FRAMEWORK_ROLES}
        roleSlugsFilter={FRAMEWORK_ROLE_SLUGS}
      />
    </div>
  )
}
