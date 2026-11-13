/**
 * @module   index
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module serves as the main entry point for the admin interface of the application, providing routing and layout components for the admin dashboard. It integrates authentication and error handling, ensuring that only authorized users can access the admin features.
 * INVARIANT: The user must be authenticated to access this module's routes.
 *
 * @seeAlso AuthContext (provides authentication state).
 * @seeAlso ErrorBoundary (handles errors in the admin interface).
 * @seeAlso LoadingSpinner (displays loading state).
 * @seeAlso NotFoundPage (handles 404 routing).
 *
 * @cil-generated
 */














import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { NotFoundPage } from '../../pages/NotFoundPage'
import { useAuth } from '../../contexts/AuthContext'
import { AppShell } from '../../components/layout/AppShell'
import { AdminSidebar } from '../../components/admin/AdminSidebar'
import { PageInstructions } from '../../components/admin/PageInstructions'
import { TooltipProvider } from '../../components/ui/tooltip'















/**
 * TypesPage is a lazily-loaded component that optimizes the loading performance of the application by deferring its import until needed. This approach enhances user experience by reducing initial load times.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const TypesPage = lazy(() => import('../../pages/admin/TypesPage').then(m => ({ default: m.TypesPage })))















/**
 * AppsPage is a lazily-loaded component that imports the AppsPage module from the admin pages directory to optimize performance by loading the component only when needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const AppsPage = lazy(() => import('../../pages/admin/AppsPage').then(m => ({ default: m.AppsPage })))















/**
 * TypeDetailPage is a lazily-loaded component that optimizes the loading performance of the application by splitting the code into smaller chunks. It imports the TypeDetailPage from the admin pages directory.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const TypeDetailPage = lazy(() => import('../../pages/admin/TypeDetailPage').then(m => ({ default: m.TypeDetailPage })))















/**
 * PipelinesPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the PipelinesPage module from the admin pages directory.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const PipelinesPage = lazy(() => import('../../pages/admin/PipelinesPage').then(m => ({ default: m.PipelinesPage })))















/**
 * TriggersPage is a lazily loaded component that optimizes the loading performance of the admin application by deferring its loading until needed. It imports the TriggersPage module from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const TriggersPage = lazy(() => import('../../pages/admin/TriggersPage').then(m => ({ default: m.TriggersPage })))















/**
 * AIAgentsPage is a lazily loaded component that optimizes the initial loading time of the application by deferring the loading of the AIAgentsPage module until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const AIAgentsPage = lazy(() => import('../../pages/admin/AIAgentsPage').then(m => ({ default: m.AIAgentsPage })))















/**
 * EmbeddingsPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the EmbeddingsPage module from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const EmbeddingsPage = lazy(() => import('../../pages/admin/EmbeddingsPage').then(m => ({ default: m.EmbeddingsPage })))















/**
 * TimersPage is a lazily loaded component that optimizes the initial load time of the application by deferring its loading until needed. It imports the TimersPage from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const TimersPage = lazy(() => import('../../pages/admin/TimersPage').then(m => ({ default: m.TimersPage })))















/**
 * IntegrationsPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the IntegrationsPage from the admin pages directory.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const IntegrationsPage = lazy(() => import('../../pages/admin/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })))















/**
 * AppDetailPage is a lazily-loaded component that optimizes the loading performance of the application by deferring its loading until needed. It imports the AppDetailPage from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const AppDetailPage = lazy(() => import('../../pages/admin/AppDetailPage').then(m => ({ default: m.AppDetailPage })))















/**
 * PipelineDetailPage is a lazily loaded component that displays the details of a specific pipeline in the admin interface. It exists to optimize performance by loading the component only when needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const PipelineDetailPage = lazy(() => import('../../pages/admin/PipelineDetailPage').then(m => ({ default: m.PipelineDetailPage })))















/**
 * TriggerDetailPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the TriggerDetailPage from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const TriggerDetailPage = lazy(() => import('../../pages/admin/TriggerDetailPage').then(m => ({ default: m.TriggerDetailPage })))















/**
 * AIAgentDetailPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the AIAgentDetailPage from the admin pages directory.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const AIAgentDetailPage = lazy(() => import('../../pages/admin/AIAgentDetailPage').then(m => ({ default: m.AIAgentDetailPage })))















/**
 * EmbeddingDetailPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the EmbeddingDetailPage from the admin pages directory.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const EmbeddingDetailPage = lazy(() => import('../../pages/admin/EmbeddingDetailPage').then(m => ({ default: m.EmbeddingDetailPage })))















/**
 * TimerDetailPage is a lazily loaded component that optimizes the loading performance of the application by deferring its import until needed. This approach enhances user experience by reducing initial load times.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const TimerDetailPage = lazy(() => import('../../pages/admin/TimerDetailPage').then(m => ({ default: m.TimerDetailPage })))















/**
 * IntegrationDetailPage is a lazily loaded component that optimizes application load time by splitting code into smaller chunks. It imports the IntegrationDetailPage from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const IntegrationDetailPage = lazy(() => import('../../pages/admin/IntegrationDetailPage').then(m => ({ default: m.IntegrationDetailPage })))















/**
 * RolesPage is a lazily loaded component that optimizes the initial loading time of the application by deferring the loading of the RolesPage module until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const RolesPage = lazy(() => import('../../pages/admin/RolesPage').then(m => ({ default: m.RolesPage })))















/**
 * RoleDetailPage is a lazily loaded component that optimizes the loading performance of the application by deferring its import until needed. This approach helps improve the initial load time of the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const RoleDetailPage = lazy(() => import('../../pages/admin/RoleDetailPage').then(m => ({ default: m.RoleDetailPage })))















/**
 * PromptConfigsPage is a lazily loaded component that optimizes the loading performance of the application by deferring its import until needed. This approach helps improve the initial load time of the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const PromptConfigsPage = lazy(() => import('../../pages/admin/PromptConfigsPage').then(m => ({ default: m.PromptConfigsPage })))















/**
 * PromptConfigDetailPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the PromptConfigDetailPage from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const PromptConfigDetailPage = lazy(() => import('../../pages/admin/PromptConfigDetailPage').then(m => ({ default: m.PromptConfigDetailPage })))















/**
 * APIKeysPage is a lazily loaded component that optimizes the initial loading performance of the application by deferring its loading until needed. It imports the APIKeysPage from the admin pages directory.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const APIKeysPage = lazy(() => import('../../pages/admin/APIKeysPage').then(m => ({ default: m.APIKeysPage })))















/**
 * APIKeyDetailPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the APIKeyDetailPage from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const APIKeyDetailPage = lazy(() => import('../../pages/admin/APIKeyDetailPage').then(m => ({ default: m.APIKeyDetailPage })))















/**
 * DeliveriesPage is a lazily loaded component that optimizes the initial load time of the application by deferring the loading of the DeliveriesPage module until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const DeliveriesPage = lazy(() => import('../../pages/admin/DeliveriesPage').then(m => ({ default: m.DeliveriesPage })))















/**
 * InvitesPage is a lazily loaded component that optimizes the initial loading time of the application by deferring the loading of the InvitesPage module until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const InvitesPage = lazy(() => import('../../pages/admin/InvitesPage').then(m => ({ default: m.InvitesPage })))







/**
 * SecurityPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the SecurityPage module from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const SecurityPage = lazy(() => import('../../pages/admin/SecurityPage').then(m => ({ default: m.SecurityPage })))















/**
 * ObservabilityDashboard is a lazily loaded component that optimizes the initial loading time of the application by deferring the loading of the ObservabilityDashboard page until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const ObservabilityDashboard = lazy(() => import('../../pages/admin/ObservabilityDashboard').then(m => ({ default: m.ObservabilityDashboard })))















/**
 * PipelineExecutionsPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the PipelineExecutionsPage from the admin pages directory.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const PipelineExecutionsPage = lazy(() => import('../../pages/admin/PipelineExecutionsPage').then(m => ({ default: m.PipelineExecutionsPage })))















/**
 * LogsPage is a lazily loaded component that optimizes performance by loading the LogsPage module only when needed. This approach helps reduce the initial load time of the application.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const LogsPage = lazy(() => import('../../pages/admin/LogsPage').then(m => ({ default: m.LogsPage })))















/**
 * AlertsConfigPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the AlertsConfigPage from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const AlertsConfigPage = lazy(() => import('../../pages/admin/AlertsConfigPage').then(m => ({ default: m.AlertsConfigPage })))















/**
 * DataListPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the DataListPage from the runtime components.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const DataListPage = lazy(() => import('../../components/runtime/DataListPage').then(m => ({ default: m.DataListPage })))















/**
 * DataDetailPage is a lazily loaded component that renders detailed information about data entries to optimize performance by loading the component only when needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const DataDetailPage = lazy(() => import('../../components/runtime/DataDetailPage').then(m => ({ default: m.DataDetailPage })))















/**
 * TestingDashboard is a lazily loaded component that imports the TestingDashboard page for the admin section. It exists to optimize the initial loading time of the application by deferring the loading of this component until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const TestingDashboard = lazy(() => import('../../pages/admin/TestingDashboard'))















/**
 * TestRunDetailPage is a lazily loaded component that displays detailed information about a test run. It exists to optimize performance by loading the component only when needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const TestRunDetailPage = lazy(() => import('../../pages/admin/TestRunDetailPage').then(m => ({ default: m.TestRunDetailPage })))















/**
 * KBAdminPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the KBAdminPage from the admin pages module.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const KBAdminPage = lazy(() => import('../../pages/admin/kb/KBAdminPage').then(m => ({ default: m.KBAdminPage })))















/**
 * AdminRoutes manages the routing and breadcrumb navigation for the admin section of the application. It dynamically generates breadcrumbs based on the current URL path and defines routes for various admin functionalities.
 *
 * @macro       Routing component that organizes admin-related pages and navigation.
 * @micro       Utilizes React Router to define nested routes and a breadcrumb structure based on the current location.
 * @outputSpec  JSX.Element — renders the admin routes and navigation structure.
 * @sideEffects none
 * @stability   internal
 * @calls       useLocation, AppShell, AdminSidebar, ErrorBoundary, Suspense, Routes, Route, Navigate
 * @cil-generated
 */
const CONFIG_INSTRUCTION_KEYS = new Set([
  'types', 'apps', 'pipelines', 'triggers', 'ai-agents', 'timers',
  'integrations', 'roles', 'prompts', 'api-keys', 'deliveries',
])
const OBSERVABILITY_INSTRUCTION_KEYS: Record<string, string> = {
  logs: 'logs', alerts: 'alerts', executions: 'pipeline-executions',
}

function instructionKeyFor(segments: string[]): string | null {
  const section = segments[2]
  const entity = segments[3]
  switch (section) {
    case 'configs': return entity && CONFIG_INSTRUCTION_KEYS.has(entity) ? entity : null
    case 'observability': return OBSERVABILITY_INSTRUCTION_KEYS[entity] ?? 'observability'
    case 'security': return 'security'
    case 'access': return entity === 'invites' ? 'invites' : null
    case 'testing': return 'testing'
    case 'kb': return 'kb'
    case 'runtime': return segments.length > 4 ? 'runtime-detail' : 'runtime-list'
    default: return null
  }
}

function AdminRoutes() {
  const location = useLocation()

  const pathSegments = location.pathname.split('/').filter(Boolean)
  const breadcrumbs: { title: string; url?: string }[] = [{ title: 'Spine', url: '/dashboard' }]

  if (pathSegments.includes('admin')) {
    breadcrumbs.push({ title: 'Admin', url: '/spine-framework/admin' })

    const section = pathSegments[2]
    if (section) {
      breadcrumbs.push({ title: section.charAt(0).toUpperCase() + section.slice(1) })
    }
  }

  const instructionKey = instructionKeyFor(pathSegments)

  return (
    <AppShell
      sidebar={<AdminSidebar />}
      headerActions={instructionKey ? <PageInstructions pageKey={instructionKey} /> : undefined}
      breadcrumbs={breadcrumbs}
    >
      <ErrorBoundary>
        <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><LoadingSpinner /></div>}>
          <Routes>
          <Route index element={<Navigate to="configs/types" replace />} />
          <Route path="dashboard" element={<Navigate to="configs/types" replace />} />

          <Route path="configs/types/new" element={<TypeDetailPage />} />
          <Route path="configs/types/:id" element={<TypeDetailPage />} />
          <Route path="configs/types" element={<TypesPage />} />
          <Route path="configs/apps/new" element={<AppDetailPage />} />
          <Route path="configs/apps/:id" element={<AppDetailPage />} />
          <Route path="configs/apps" element={<AppsPage />} />
          <Route path="configs/pipelines/new" element={<PipelineDetailPage />} />
          <Route path="configs/pipelines/:id" element={<PipelineDetailPage />} />
          <Route path="configs/pipelines" element={<PipelinesPage />} />
          <Route path="configs/triggers/new" element={<TriggerDetailPage />} />
          <Route path="configs/triggers/:id" element={<TriggerDetailPage />} />
          <Route path="configs/triggers" element={<TriggersPage />} />
          <Route path="configs/ai-agents/new" element={<AIAgentDetailPage />} />
          <Route path="configs/ai-agents/:id" element={<AIAgentDetailPage />} />
          <Route path="configs/ai-agents" element={<AIAgentsPage />} />
          <Route path="configs/timers/new" element={<TimerDetailPage />} />
          <Route path="configs/timers/:id" element={<TimerDetailPage />} />
          <Route path="configs/timers" element={<TimersPage />} />
          <Route path="configs/integrations/new" element={<IntegrationDetailPage />} />
          <Route path="configs/integrations/:id" element={<IntegrationDetailPage />} />
          <Route path="configs/integrations" element={<IntegrationsPage />} />
          <Route path="configs/roles/new" element={<RoleDetailPage />} />
          <Route path="configs/roles/:id" element={<RoleDetailPage />} />
          <Route path="configs/roles" element={<RolesPage />} />
          <Route path="configs/prompts/new" element={<PromptConfigDetailPage />} />
          <Route path="configs/prompts/:id" element={<PromptConfigDetailPage />} />
          <Route path="configs/prompts" element={<PromptConfigsPage />} />
          <Route path="configs/api-keys/new" element={<APIKeyDetailPage />} />
          <Route path="configs/api-keys/:id" element={<APIKeyDetailPage />} />
          <Route path="configs/api-keys" element={<APIKeysPage />} />
          <Route path="configs/deliveries" element={<DeliveriesPage />} />

          <Route path="access/invites" element={<InvitesPage />} />

          <Route path="security" element={<SecurityPage />} />

          <Route path="observability" element={<ObservabilityDashboard />} />
          <Route path="observability/dashboard" element={<ObservabilityDashboard />} />
          <Route path="observability/alerts" element={<AlertsConfigPage />} />
          <Route path="observability/executions/:id" element={<PipelineExecutionsPage />} />
          <Route path="observability/executions" element={<PipelineExecutionsPage />} />
          <Route path="observability/logs" element={<LogsPage />} />

          <Route path="testing/:run_id" element={<TestRunDetailPage />} />
          <Route path="testing" element={<TestingDashboard />} />


          <Route path="runtime/:entity" element={<DataListPage />} />
          <Route path="runtime/:entity/new" element={<DataDetailPage />} />
          <Route path="runtime/:entity/:id" element={<DataDetailPage />} />


          <Route path="kb/embeddings/:id" element={<EmbeddingDetailPage />} />
          <Route path="kb/embeddings" element={<EmbeddingsPage />} />
          <Route path="kb/:typeSlug" element={<KBAdminPage />} />
          <Route path="kb/:typeSlug/new" element={<KBAdminPage mode="new" />} />
          <Route path="kb/:typeSlug/:id" element={<KBAdminPage mode="view" />} />
          <Route path="kb/:typeSlug/:id/edit" element={<KBAdminPage mode="edit" />} />

          <Route path="data/:entity" element={<Navigate to="../runtime/:entity" replace />} />
          <Route path="data/:entity/create" element={<Navigate to="../runtime/:entity/new" replace />} />
          <Route path="data/:entity/:id" element={<Navigate to="../runtime/:entity/:id" replace />} />

          <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  )
}
















/**
 * AdminApp is a component that restricts access to admin routes for system administrators only, redirecting non-admin users to the dashboard. This ensures that only authorized personnel can access sensitive administrative functionalities.
 *
 * @macro       React component responsible for rendering admin routes based on user permissions.
 * @micro       Utilizes user authentication state to conditionally render components or redirect users.
 * @outputSpec  JSX.Element
 * @sideEffects none
 * @stability   internal
 * @calls       useAuth, Navigate, TooltipProvider, AdminRoutes
 * @cil-generated
 */
export default function AdminApp() {
  const { user } = useAuth()

  if (!user?.is_system_admin) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <TooltipProvider>
      <AdminRoutes />
    </TooltipProvider>
  )
}






