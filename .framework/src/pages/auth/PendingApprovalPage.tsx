// CIL[BEGIN stable_id="~/.framework/src/pages/auth/PendingApprovalPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/auth/PendingApprovalPage.tsx"]
// CIL[DOC-MACRO purpose="Provides React and authentication context imports for the pending-approval page"]
// CIL[DOC-RESPONSIBILITY responsibility="Import React and the useAuth hook"]
// CIL[DOC-CONTEXT module="auth" layer="ui" related_files=".framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="React, useAuth imports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports the React library and the useAuth authentication hook" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="system"]

import React from 'react'
import { useAuth } from '../../contexts/AuthContext'

// CIL[DOC-VECTOR type="context" content="purpose='Provides React and authentication context imports for the pending-approval page'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/auth/PendingApprovalPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/auth/PendingApprovalPage.tsx:PendingApprovalPage:component" type="component" identity="PendingApprovalPage" parent="~/.framework/src/pages/auth/PendingApprovalPage.tsx"]
// CIL[DOC-MACRO purpose="Render the pending-approval page UI for users awaiting administrator approval"]
// CIL[DOC-RESPONSIBILITY responsibility="Display the pending approval notice and allow the user to sign out"]
// CIL[DOC-CONTEXT module="auth" layer="ui" related_files=".framework/src/contexts/AuthContext.tsx,.framework/src/pages/auth/PendingApprovalPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX UI" errors="none" side_effects="calls logout on sign-out button click"]
// CIL[DOC-MICRO logic_summary="Renders a centered pending approval card with clock icon, message, info box, and sign out button" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function PendingApprovalPage() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-amber-100">
          <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900">Awaiting approval</h1>
          <p className="text-slate-600">
            Your access request has been submitted. An account administrator will review
            and approve your request shortly.
          </p>
        </div>

        <div className="rounded-md bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm text-amber-800">
            You'll be able to access the platform once your request has been approved.
            Please check back later or contact your administrator directly.
          </p>
        </div>

        <button
          onClick={() => logout()}
          className="text-sm text-slate-500 hover:text-slate-700 underline"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the pending-approval page UI for users awaiting administrator approval'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/auth/PendingApprovalPage.tsx:PendingApprovalPage:component"]
