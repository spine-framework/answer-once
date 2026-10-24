



// CIL[BEGIN stable_id="~/.framework/src/App.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Import React and routing dependencies for main app component"]
// CIL[DOC-RESPONSIBILITY responsibility="Manage all external module imports and lazy loading"]
// CIL[DOC-CONTEXT module="App" layer="entry-point" related_files=".framework/src/components/AppWrapper.tsx,.framework/src/components/CustomAppLoader.tsx,.framework/src/components/app-shell/GenericAppShell.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/pages/NotFoundPage.tsx,.framework/src/pages/SetupPage.tsx,.framework/src/pages/auth/AuthConfirmPage.tsx,.framework/src/pages/auth/ForgotPasswordPage.tsx,.framework/src/pages/auth/LoginPage.tsx,.framework/src/pages/auth/PendingApprovalPage.tsx,.framework/src/pages/auth/RegisterPage.tsx,.framework/src/pages/spine-framework/APIPage.tsx,.framework/src/pages/spine-framework/CLIPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="Imported modules and lazy components" errors="Import failures" side_effects="Module loading"]
// CIL[DOC-MICRO logic_summary="Imports React hooks, routing components, pages, and app shell components" notable_decisions="['lazy_load_admin_app']"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useBranding } from './hooks/useBranding'
import { LoadingSpinner } from './components/ui/LoadingSpinner'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { AuthConfirmPage } from './pages/auth/AuthConfirmPage'
import { PendingApprovalPage } from './pages/auth/PendingApprovalPage'
import { NoAppPage } from './pages/NoAppPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SetupPage } from './pages/SetupPage'
import { AppWrapper } from './components/AppWrapper'
import { AppsRegistryProvider, useAppsRegistry } from './contexts/AppContext'
import { CustomAppLoader } from './components/CustomAppLoader'
import { GenericAppShell } from './components/app-shell/GenericAppShell'
import { APIPage } from './pages/spine-framework/APIPage'
import { CLIPage } from './pages/spine-framework/CLIPage'
// CIL[DOC-VECTOR type="context" content="purpose='Import React and routing dependencies for main app component'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/pages/auth/LoginPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/App.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/App.tsx:adminapp:constant" type="constant" identity="AdminApp" parent="none"]
// CIL[DOC-MACRO purpose="Lazy-load the admin app component"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a lazy-loaded admin app component"]
// CIL[DOC-CONTEXT module="App" layer="entry-point" related_files=".framework/src/App.tsx,.framework/src/components/AppWrapper.tsx,.framework/src/components/CustomAppLoader.tsx,.framework/src/components/app-shell/GenericAppShell.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/pages/NotFoundPage.tsx,.framework/src/pages/SetupPage.tsx,.framework/src/pages/auth/AuthConfirmPage.tsx,.framework/src/pages/auth/ForgotPasswordPage.tsx,.framework/src/pages/auth/LoginPage.tsx,.framework/src/pages/auth/PendingApprovalPage.tsx,.framework/src/pages/auth/RegisterPage.tsx,.framework/src/pages/spine-framework/APIPage.tsx,.framework/src/pages/spine-framework/CLIPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="Lazy-loaded AdminApp component" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Lazily imports and exposes the admin application bundle" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const AdminApp = lazy(() => import('./apps/admin/index'))
// CIL[DOC-VECTOR type="context" content="purpose='Lazy-load the admin app component'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/pages/auth/LoginPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/App.tsx:adminapp:constant"]

// CIL[BEGIN stable_id="~/.framework/src/App.tsx:app:function" type="function" identity="App" parent="none"]
// CIL[DOC-MACRO purpose="Root app component handling authentication state and routing"]
// CIL[DOC-RESPONSIBILITY responsibility="Manage global app state, auth flows, and route selection"]
// CIL[DOC-CONTEXT module="App" layer="entry-point" related_files=".framework/src/App.tsx,.framework/src/components/AppWrapper.tsx,.framework/src/components/CustomAppLoader.tsx,.framework/src/components/app-shell/GenericAppShell.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/pages/NotFoundPage.tsx,.framework/src/pages/SetupPage.tsx,.framework/src/pages/auth/AuthConfirmPage.tsx,.framework/src/pages/auth/ForgotPasswordPage.tsx,.framework/src/pages/auth/LoginPage.tsx,.framework/src/pages/auth/PendingApprovalPage.tsx,.framework/src/pages/auth/RegisterPage.tsx,.framework/src/pages/spine-framework/APIPage.tsx,.framework/src/pages/spine-framework/CLIPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX routes based on auth state" errors="Auth context failures" side_effects="Navigation, route rendering"]
// CIL[DOC-MICRO logic_summary="Shows loading, handles auth states, routes to appropriate components" notable_decisions="['ternary_auth_routing', 'setup_mode_check', 'unplaced_person_resume_routing']"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-NOTE type="change" content="Batch4b: authenticated-but-unplaced users (falsy account_id, not pending) are routed to /register?resume=1 for all paths so RegisterPage can finish placement — they no longer fall through to NotFound"]
function App() {
  const { user, isLoading } = useAuth()
  const branding = useBranding()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <LoadingSpinner className="w-8 h-8 mx-auto mb-4" />
          <p className="text-slate-600">Loading {branding.app_name}...</p>
        </div>
      </div>
    )
  }

  return (
    <AppsRegistryProvider>
      {!user ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/confirm" element={<AuthConfirmPage />} />
          <Route
            path="/"
            element={
              import.meta.env.VITE_SETUP_MODE === 'true'
                ? <SetupPage />
                : <Navigate to="/login" replace />
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : user.status === 'pending' ? (
        <Routes>
          <Route path="*" element={<PendingApprovalPage />} />
        </Routes>
      ) : !user.account_id ? (
        // Authenticated but unplaced (no account bound yet) — e.g. email
        // confirmation interrupted registration. Route everything to
        // /register?resume=1 so RegisterPage can finish placement; never
        // let them hit NotFound.
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/confirm" element={<AuthConfirmPage />} />
          <Route path="/auth/pending-approval" element={<PendingApprovalPage />} />
          <Route path="*" element={<Navigate to="/register?resume=1" replace />} />
        </Routes>
      ) : (
        <AuthenticatedRouter />
      )}
    </AppsRegistryProvider>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Root app component handling authentication state and routing'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/pages/auth/LoginPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/App.tsx:app:function"]

// CIL[BEGIN stable_id="~/.framework/src/App.tsx:authenticatedrouter:function" type="function" identity="AuthenticatedRouter" parent="none"]
// CIL[DOC-LEARNING topic="App:renderer_switch" content="The public.apps.renderer field switches routing: 'custom' uses CustomAppLoader and loads custom/apps/<slug>/index.tsx; 'generic' uses GenericAppShell and builds a schema-driven UI from nav_items."]
// CIL[DOC-MACRO purpose="Handle authenticated user routing and dynamic app loading"]
// CIL[DOC-RESPONSIBILITY responsibility="Manage app registry, route sorting, and dynamic component rendering"]
// CIL[DOC-CONTEXT module="App" layer="routing" related_files=".framework/src/App.tsx,.framework/src/components/AppWrapper.tsx,.framework/src/components/CustomAppLoader.tsx,.framework/src/components/app-shell/GenericAppShell.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/pages/NotFoundPage.tsx,.framework/src/pages/SetupPage.tsx,.framework/src/pages/auth/AuthConfirmPage.tsx,.framework/src/pages/auth/ForgotPasswordPage.tsx,.framework/src/pages/auth/LoginPage.tsx,.framework/src/pages/auth/PendingApprovalPage.tsx,.framework/src/pages/auth/RegisterPage.tsx,.framework/src/pages/spine-framework/APIPage.tsx,.framework/src/pages/spine-framework/CLIPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="Dynamic routes for authenticated apps" errors="App loading failures" side_effects="Navigation, lazy loading"]
// CIL[DOC-MICRO logic_summary="Loads apps, sorts routes, handles redirects, renders dynamic app components" notable_decisions="['route_prefix_sorting', 'renderer_type_switching', 'no_app_page_landing', 'unplaced_register_guard']"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-NOTE type="change" content="Batch4b: '/' now resolves to admin / root app / first app prefix / NoAppPage; redirect effect no longer bounces unplaced users off /register"]
function AuthenticatedRouter() {
  const { user } = useAuth()
  const { routableApps: apps, loading } = useAppsRegistry()
  const navigate = useNavigate()
  const location = useLocation()

  // Authenticated but unplaced (no account bound) — RegisterPage resume mode
  // must be allowed to run; never bounce them off /register.
  const isUnplaced = !!user && !user.account_id

  const defaultRedirect = user?.roles?.includes('system_admin')
    ? '/spine-framework/admin'
    : (apps[0]?.route_prefix || '/')

  useEffect(() => {
    if (!loading && ['/login', '/register'].includes(location.pathname)) {
      if (isUnplaced && location.pathname === '/register') return
      navigate(defaultRedirect, { replace: true })
    }
  }, [loading, location.pathname, defaultRedirect, navigate, isUnplaced])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <LoadingSpinner className="w-8 h-8 mx-auto mb-4" />
          <p className="text-slate-600">Loading apps...</p>
        </div>
      </div>
    )
  }

  const sorted = [...apps]
    .filter(app => app.slug !== 'spine-framework' && !app.route_prefix?.startsWith('/spine-framework'))
    .sort((a, b) => {
      if (a.route_prefix === '/') return 1
      if (b.route_prefix === '/') return -1
      return (b.route_prefix?.length || 0) - (a.route_prefix?.length || 0)
    })

  const toRoutePath = (prefix: string) => prefix === '/' ? '/*' : `${prefix}/*`

  const renderAppElement = (app: (typeof apps)[number]) => {
    if (app.renderer === 'custom') {
      return (
        <AppWrapper app={app}>
          <CustomAppLoader slug={app.slug} />
        </AppWrapper>
      )
    }
    if (app.renderer === 'generic') {
      return (
        <AppWrapper app={app}>
          <GenericAppShell app={app} />
        </AppWrapper>
      )
    }
    return null
  }

  // '/' landing: system_admin → admin; a root-mounted app renders directly;
  // otherwise first sorted app prefix; nothing routable → neutral NoAppPage
  // instead of Navigate-to-'/' falling through to NotFoundPage.
  const rootApp = sorted.find(a => a.route_prefix === '/')
  const firstAppPrefix = sorted.find(a => a.route_prefix && a.route_prefix !== '/')?.route_prefix
  const rootElement =
    user?.is_system_admin || user?.roles?.includes('system_admin')
      ? <Navigate to="/spine-framework/admin" replace />
      : rootApp
        ? renderAppElement(rootApp)
        : firstAppPrefix
          ? <Navigate to={firstAppPrefix} replace />
          : <NoAppPage />

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
      <Routes>
        <Route path="/spine-framework/admin/*" element={<AdminApp />} />
        <Route path="/spine-framework/api" element={<APIPage />} />
        <Route path="/spine-framework/cli" element={<CLIPage />} />

        <Route path="/login" element={<Navigate to={defaultRedirect} replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/confirm" element={<AuthConfirmPage />} />
        <Route path="/auth/pending-approval" element={<PendingApprovalPage />} />

        <Route path="/" element={rootElement} />

        {sorted.map(app => {
          const prefix = app.route_prefix!
          const element = renderAppElement(app)
          if (!element) return null
          return <Route key={app.slug} path={toRoutePath(prefix)} element={element} />
        })}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Handle authenticated user routing and dynamic app loading'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/pages/auth/LoginPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/App.tsx:authenticatedrouter:function"]

// CIL[BEGIN stable_id="~/.framework/src/App.tsx:export_default:export" type="export" identity="export_default" parent="none"]
// CIL[DOC-MACRO purpose="Export the main App component as default"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the entry point for the React application"]
// CIL[DOC-CONTEXT module="App" layer="entry-point" related_files=".framework/src/App.tsx,.framework/src/components/AppWrapper.tsx,.framework/src/components/CustomAppLoader.tsx,.framework/src/components/app-shell/GenericAppShell.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/contexts/AppContext.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/pages/NotFoundPage.tsx,.framework/src/pages/SetupPage.tsx,.framework/src/pages/auth/AuthConfirmPage.tsx,.framework/src/pages/auth/ForgotPasswordPage.tsx,.framework/src/pages/auth/LoginPage.tsx,.framework/src/pages/auth/PendingApprovalPage.tsx,.framework/src/pages/auth/RegisterPage.tsx,.framework/src/pages/spine-framework/APIPage.tsx,.framework/src/pages/spine-framework/CLIPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="App component" errors="none" side_effects="Application bootstrap"]
// CIL[DOC-MICRO logic_summary="Default export of the root App component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export default App
// CIL[DOC-VECTOR type="context" content="purpose='Export the main App component as default'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/pages/auth/LoginPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/App.tsx:export_default:export"]
