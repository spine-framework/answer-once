



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
import { AnalyticsTracker } from './components/AnalyticsTracker'
import { CustomAppLoader } from './components/CustomAppLoader'
import { GenericAppShell } from './components/app-shell/GenericAppShell'
import { APIPage } from './pages/spine-framework/APIPage'
import { CLIPage } from './pages/spine-framework/CLIPage'

const AdminApp = lazy(() => import('./apps/admin/index'))

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

// The public.apps.renderer field switches routing: 'custom' uses CustomAppLoader and loads custom/apps/<slug>/index.tsx; 'generic' uses GenericAppShell and builds a schema-driven UI from nav_items.
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
      <AnalyticsTracker />
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

export default App
