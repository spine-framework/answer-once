// CIL[BEGIN stable_id="~/.framework/src/pages/admin/InvitesPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/InvitesPage.tsx"]
// CIL[DOC-MACRO purpose="Admin page for managing system administrator invites and access within the Spine Framework."]
// CIL[DOC-RESPONSIBILITY responsibility="Declares the module, imports dependencies, and exports the InvitesPage component."]
// CIL[DOC-CONTEXT module="admin" layer="page" related_files=".framework/src/components/shared/InviteManager.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Sets up the admin invites page module and its runtime dependencies." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="maintainer"]
import React from 'react'
import { InviteManager } from '../../components/shared/InviteManager'
import { useAuth } from '../../contexts/AuthContext'
// CIL[DOC-VECTOR type="context" content="purpose='Admin page for managing system administrator invites and access within the Spine Framework.'; No verified external callers; imports: .framework/src/components/shared/InviteManager.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/InvitesPage.tsx:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/InvitesPage.tsx:framework_roles:constant" type="constant" identity="FRAMEWORK_ROLES" parent="~/.framework/src/pages/admin/InvitesPage.tsx"]
// CIL[DOC-MACRO purpose="Defines the list of framework-level admin roles available for invites."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides a static array of role objects used by the InviteManager."]
// CIL[DOC-CONTEXT module="admin" layer="constant" related_files=".framework/src/components/shared/InviteManager.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/pages/admin/InvitesPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="FRAMEWORK_ROLES array of { slug, name }" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Hardcodes the system_admin role configuration." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const FRAMEWORK_ROLES = [
  { slug: 'system_admin', name: 'System Admin' },
]
// CIL[DOC-VECTOR type="context" content="purpose='Defines the list of framework-level admin roles available for invites.'; No verified external callers; imports: .framework/src/components/shared/InviteManager.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/InvitesPage.tsx:framework_roles:constant"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/InvitesPage.tsx:framework_role_slugs:constant" type="constant" identity="FRAMEWORK_ROLE_SLUGS" parent="~/.framework/src/pages/admin/InvitesPage.tsx"]
// CIL[DOC-MACRO purpose="Computes a comma-separated string of framework role slugs for filtering."]
// CIL[DOC-RESPONSIBILITY responsibility="Derives a string filter from FRAMEWORK_ROLES for the InviteManager roleSlugsFilter prop."]
// CIL[DOC-CONTEXT module="admin" layer="constant" related_files=".framework/src/components/shared/InviteManager.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/pages/admin/InvitesPage.tsx"]
// CIL[DOC-CONTRACT inputs="FRAMEWORK_ROLES" outputs="FRAMEWORK_ROLE_SLUGS comma-delimited string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Maps FRAMEWORK_ROLES to slugs and joins them with commas." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const FRAMEWORK_ROLE_SLUGS = FRAMEWORK_ROLES.map(r => r.slug).join(',')
// CIL[DOC-VECTOR type="context" content="purpose='Computes a comma-separated string of framework role slugs for filtering.'; No verified external callers; imports: .framework/src/components/shared/InviteManager.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/InvitesPage.tsx:framework_role_slugs:constant"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/InvitesPage.tsx:invitespage:function" type="function" identity="InvitesPage" parent="~/.framework/src/pages/admin/InvitesPage.tsx"]
// CIL[DOC-MACRO purpose="Renders the admin invites and access page for the Spine Framework."]
// CIL[DOC-RESPONSIBILITY responsibility="Fetches the current user from auth context and renders an InviteManager scoped to the account."]
// CIL[DOC-CONTEXT module="admin" layer="page" related_files=".framework/src/components/shared/InviteManager.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/pages/admin/InvitesPage.tsx"]
// CIL[DOC-CONTRACT inputs="useAuth context; user?.account_id" outputs="JSX page with InviteManager" errors="none" side_effects="renders UI; passes scope, accountId, allowedRoles, roleSlugsFilter to InviteManager"]
// CIL[DOC-MICRO logic_summary="Uses useAuth to retrieve the authenticated user, then renders a page heading and the InviteManager configured for account scope with allowed framework roles and a slug filter." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Renders the admin invites and access page for the Spine Framework.'; No verified external callers; imports: .framework/src/components/shared/InviteManager.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/InvitesPage.tsx:invitespage:function"]
