// CIL[BEGIN stable_id="~/.framework/src/pages/NoAppPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/NoAppPage.tsx"]
// CIL[DOC-MACRO purpose="Neutral landing page for authenticated users with no routable apps"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a 'no apps installed' state with a sign-out action instead of a 404"]
// CIL[DOC-CONTEXT module="pages" layer="page" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/App.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares imports for the NoAppPage component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]

import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useBranding } from '../hooks/useBranding'
// CIL[END stable_id="~/.framework/src/pages/NoAppPage.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/pages/NoAppPage.tsx:noapppage:component" type="component" identity="NoAppPage" parent="~/.framework/src/pages/NoAppPage.tsx"]
// CIL[DOC-MACRO purpose="Render a neutral landing when the account has no accessible apps"]
// CIL[DOC-RESPONSIBILITY responsibility="Show a friendly empty state and a sign-out button for placed users whose account has no routable apps"]
// CIL[DOC-CONTEXT module="pages" layer="page" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/App.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX landing page" errors="none" side_effects="calls logout() from useAuth on sign-out click"]
// CIL[DOC-MICRO logic_summary="Static centered card: logo, 'no apps' message, sign-out button" notable_decisions="Rendered at '/' by AuthenticatedRouter when the user is not system_admin and no routable app prefix exists — replaces the previous Navigate-to-'/' → NotFound fallthrough"]
// CIL[DOC-CONFIDENCE pass="first" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
export function NoAppPage() {
  const { logout } = useAuth()
  const branding = useBranding()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex items-center justify-center">
          <img src={branding.logo_url} alt={branding.app_name} className="h-14 w-auto" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">No apps yet</h1>
          <p className="text-slate-600">
            No apps are installed for your account yet. Contact your administrator
            to get access, or sign out and try a different account.
          </p>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="py-2 px-4 rounded-[5px] bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
// CIL[END stable_id="~/.framework/src/pages/NoAppPage.tsx:noapppage:component"]
