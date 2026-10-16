// CIL[BEGIN stable_id="~/.framework/src/pages/NotFoundPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/NotFoundPage.tsx"]
// CIL[DOC-MACRO purpose="Import dependencies used by the NotFoundPage 404 component"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide React, react-router-dom Link, and lucide-react Home icon for the page"]
// CIL[DOC-CONTEXT module=".framework/src/pages" layer="page" related_files=".framework/src/pages/NotFoundPage.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Imports React, Link, and Home icon; no runtime logic" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="Spine framework page authors"]



import React from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react';
// CIL[DOC-VECTOR type="context" content="purpose='Import dependencies used by the NotFoundPage 404 component'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/NotFoundPage.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/pages/NotFoundPage.tsx:NotFoundPage:component" type="component" identity="NotFoundPage" parent="~/.framework/src/pages/NotFoundPage.tsx"]
// CIL[DOC-MACRO purpose="Render a friendly 404 not found page with a link back to sign in"]
// CIL[DOC-RESPONSIBILITY responsibility="Display a centered 404 message and a Home icon link that navigates to /login"]
// CIL[DOC-CONTEXT module=".framework/src/pages" layer="page" related_files=".framework/src/pages/NotFoundPage.tsx"]
// CIL[DOC-CONTRACT inputs="None" outputs="JSX 404 page" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Renders a full-screen 404 page with a heading, description, and a Link to /login" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="End users who reach an unknown route"]
export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-slate-900">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-slate-900">Page not found</h2>
          <p className="mt-2 text-sm text-slate-600">
            Sorry, we couldn't find the page you're looking for.
          </p>
          
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a friendly 404 not found page with a link back to sign in'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/NotFoundPage.tsx:NotFoundPage:component"]