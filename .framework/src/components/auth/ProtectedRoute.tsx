








// CIL[BEGIN stable_id="~/.framework/src/components/auth/ProtectedRoute.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Provide the module-level imports for the ProtectedRoute component"]
// CIL[DOC-RESPONSIBILITY responsibility="Import the React runtime, Navigate router utility, and the Auth context hook"]
// CIL[DOC-CONTEXT module="components/auth" layer="presentation" related_files=".framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, Navigate from react-router-dom, and useAuth from the AuthContext for use by the ProtectedRoute function" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
// CIL[DOC-VECTOR type="context" content="purpose='Provide the module-level imports for the ProtectedRoute component'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/auth/ProtectedRoute.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/auth/ProtectedRoute.tsx:protectedrouteprops:interface" type="interface" identity="ProtectedRouteProps" parent="module_header"]
// CIL[DOC-MACRO purpose="Define the props contract for the ProtectedRoute component"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the typed shape of props accepted by the ProtectedRoute function"]
// CIL[DOC-CONTEXT module="components/auth" layer="presentation" related_files=".framework/src/components/auth/ProtectedRoute.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="children React.ReactNode, requireSystemAdmin boolean" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines an interface with children of type React.ReactNode and an optional requireSystemAdmin boolean" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface ProtectedRouteProps {
  children: React.ReactNode
  requireSystemAdmin?: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the props contract for the ProtectedRoute component'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/auth/ProtectedRoute.tsx:protectedrouteprops:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/auth/ProtectedRoute.tsx:protectedroute:function" type="function" identity="ProtectedRoute" parent="module_header"]
// CIL[DOC-MACRO purpose="Guard a React route by authentication and optional system-admin role"]
// CIL[DOC-RESPONSIBILITY responsibility="Render children when the user is authenticated and authorized, redirect anonymous users to login, and deny non-admin users when required"]
// CIL[DOC-CONTEXT module="components/auth" layer="presentation" related_files=".framework/src/components/auth/ProtectedRoute.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="children React.ReactNode, requireSystemAdmin boolean" outputs="ReactElement | null" errors="none" side_effects="Navigates to /login via Navigate, and to /dashboard via window.location when denied"]
// CIL[DOC-MICRO logic_summary="Obtains user from useAuth; if user is missing redirects to /login; if requireSystemAdmin is true and user does not hold system_admin role renders an Access Denied view with a dashboard button; otherwise renders children" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function ProtectedRoute({ children, requireSystemAdmin = false }: ProtectedRouteProps) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireSystemAdmin && !user.roles?.includes('system_admin')) {
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">You need system administrator privileges to access this page.</p>
          <div className="bg-slate-100 rounded-lg p-4 text-left">
            <p className="text-sm text-slate-600 mb-2"><strong>Your roles:</strong> {user.roles?.join(', ') || 'None'}</p>
            <p className="text-sm text-slate-600"><strong>Required:</strong> system_admin</p>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="mt-6 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
// CIL[DOC-VECTOR type="context" content="purpose='Guard a React route by authentication and optional system-admin role'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/auth/ProtectedRoute.tsx:protectedroute:function"]
