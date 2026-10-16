// CIL[BEGIN stable_id="~/.framework/src/components/AppWrapper.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/AppWrapper.tsx:file"]
// CIL[DOC-MACRO purpose="AppWrapper component module that guards child apps with authentication and role checks"]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies and set up the AppWrapper component that wraps an app with authentication and authorization checks"]
// CIL[DOC-CONTEXT module="components" layer="presentation" related_files=".framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="React, useAuth, AppProvider, AppRecord, AppWrapperProps, and AppWrapper bindings available to the module" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React router, authentication and app context dependencies, and the AppRecord type for use by AppWrapper" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="frontend"]
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AppProvider } from '../contexts/AppContext'
import { AppRecord } from '../hooks/useApps'
// CIL[DOC-VECTOR type="context" content="purpose='AppWrapper component module that guards child apps with authentication and role checks'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/contexts/AppContext.tsx,.framework/src/hooks/useApps.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/AppWrapper.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/AppWrapper.tsx:appwrapperprops:interface" type="interface" identity="appwrapperprops" parent="~/.framework/src/components/AppWrapper.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Defines the props contract for the AppWrapper component"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the app record and children accepted by AppWrapper"]
// CIL[DOC-CONTEXT module="components" layer="presentation" related_files=".framework/src/components/AppWrapper.tsx,.framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="AppWrapperProps interface type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="TypeScript interface describing app and children props" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface AppWrapperProps {
  app: AppRecord
  children: React.ReactNode
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the props contract for the AppWrapper component'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/contexts/AppContext.tsx,.framework/src/hooks/useApps.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/AppWrapper.tsx:appwrapperprops:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/AppWrapper.tsx:appwrapper:function" type="function" identity="appwrapper" parent="~/.framework/src/components/AppWrapper.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders an app wrapper that enforces authentication and role-based access before rendering children"]
// CIL[DOC-RESPONSIBILITY responsibility="Guard access to an app by verifying a user is authenticated and has a required role"]
// CIL[DOC-CONTEXT module="components" layer="presentation" related_files=".framework/src/components/AppWrapper.tsx,.framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/hooks/useApps.ts"]
// CIL[DOC-CONTRACT inputs="{ app, children }: AppWrapperProps" outputs="JSX.Element" errors="none" side_effects="Navigates to /login when unauthenticated; renders an access-denied view when roles are missing"]
// CIL[DOC-MICRO logic_summary="Reads the current user from useAuth, redirects to login when missing, computes required roles from app metadata, and renders an access-denied screen or the wrapped children inside AppProvider" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.85" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function AppWrapper({ app, children }: AppWrapperProps) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const requiredRoles: string[] = app.required_roles?.length
    ? app.required_roles
    : app.min_role ? [app.min_role] : []

  if (requiredRoles.length > 0) {
    const hasRole = user.roles?.includes('system_admin') ||
      requiredRoles.some(r => user.roles?.includes(r))
    if (!hasRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
            <p className="text-slate-600 mb-6">You don't have permission to access {app.name}.</p>
            <div className="bg-slate-100 rounded-lg p-4 text-left">
              <p className="text-sm text-slate-600 mb-2"><strong>Your roles:</strong> {user.roles?.join(', ') || 'None'}</p>
              <p className="text-sm text-slate-600"><strong>Required (any):</strong> {requiredRoles.join(', ')}</p>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <AppProvider app={app}>
      {children}
    </AppProvider>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders an app wrapper that enforces authentication and role-based access before rendering children'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/contexts/AppContext.tsx,.framework/src/hooks/useApps.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/AppWrapper.tsx:appwrapper:function"]
