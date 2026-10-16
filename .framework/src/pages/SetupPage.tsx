// CIL[BEGIN stable_id="~/.framework/src/pages/SetupPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/SetupPage.tsx"]
// CIL[DOC-MACRO purpose="Declare module-level imports for the Setup page"]
// CIL[DOC-RESPONSIBILITY responsibility="Import React and the Link routing component so SetupPage can render"]
// CIL[DOC-CONTEXT module=".framework/src/pages/SetupPage.tsx" layer="ui" related_files=".framework/src/pages/SetupPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="React and Link bindings available to the module" errors="Module load fails if react-router-dom is not installed" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import React and Link from react-router-dom" notable_decisions="Keeps imports minimal and localized to the page"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="developers"]

import React from 'react'
import { Link } from 'react-router-dom'
// CIL[DOC-VECTOR type="context" content="purpose='Declare module-level imports for the Setup page'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/SetupPage.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/pages/SetupPage.tsx:SetupPage:component" type="component" identity="SetupPage" parent="~/.framework/src/pages/SetupPage.tsx"]
// CIL[DOC-MACRO purpose="Render a welcome/setup landing page when no apps are installed"]
// CIL[DOC-RESPONSIBILITY responsibility="Display onboarding instructions and a link to the login page"]
// CIL[DOC-CONTEXT module=".framework/src/pages/SetupPage.tsx" layer="ui" related_files=".framework/src/pages/SetupPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX for the setup page with instructions and login link" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Return a centered layout with the logo, getting started steps, and a login link" notable_decisions="Uses Tailwind utility classes for layout and styling, keeps the component stateless and presentational"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]

export function SetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center">
            <img src="/spine-logo.svg" alt="Spine Framework" className="h-14 w-auto" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
            Welcome to Spine
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Your project is running but no apps are installed yet.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Getting started
          </h3>
          <ol className="space-y-3 text-sm text-slate-600 list-decimal list-inside">
            <li>
              Edit <code className="bg-slate-100 px-1 rounded">.env</code> with your Supabase credentials
            </li>
            <li>
              Run migrations:{' '}
              <code className="bg-slate-100 px-1 rounded">npx spine-framework migrate</code>
            </li>
            <li>
              Install an app:{' '}
              <code className="bg-slate-100 px-1 rounded">npx spine-framework install-app &lt;app-package&gt;</code>
            </li>
            <li>
              Reassemble:{' '}
              <code className="bg-slate-100 px-1 rounded">npm run assemble && netlify dev</code>
            </li>
          </ol>
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Already set up? Sign in →
          </Link>
        </div>
      </div>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a welcome/setup landing page when no apps are installed'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/SetupPage.tsx:SetupPage:component"]