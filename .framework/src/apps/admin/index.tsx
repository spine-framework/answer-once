// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/apps/admin/index.tsx"]
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
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:module_header:module_header"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:TypesPage:constant" type="constant" identity="TypesPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * TypesPage is a lazily-loaded component that optimizes the loading performance of the application by deferring its import until needed. This approach enhances user experience by reducing initial load times.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const TypesPage = lazy(() => import('../../pages/admin/TypesPage').then(m => ({ default: m.TypesPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:TypesPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:AppsPage:constant" type="constant" identity="AppsPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * AppsPage is a lazily-loaded component that imports the AppsPage module from the admin pages directory to optimize performance by loading the component only when needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const AppsPage = lazy(() => import('../../pages/admin/AppsPage').then(m => ({ default: m.AppsPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:AppsPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:TypeDetailPage:constant" type="constant" identity="TypeDetailPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * TypeDetailPage is a lazily-loaded component that optimizes the loading performance of the application by splitting the code into smaller chunks. It imports the TypeDetailPage from the admin pages directory.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const TypeDetailPage = lazy(() => import('../../pages/admin/TypeDetailPage').then(m => ({ default: m.TypeDetailPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:TypeDetailPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:PipelinesPage:constant" type="constant" identity="PipelinesPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * PipelinesPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the PipelinesPage module from the admin pages directory.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const PipelinesPage = lazy(() => import('../../pages/admin/PipelinesPage').then(m => ({ default: m.PipelinesPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:PipelinesPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:TriggersPage:constant" type="constant" identity="TriggersPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * TriggersPage is a lazily loaded component that optimizes the loading performance of the admin application by deferring its loading until needed. It imports the TriggersPage module from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const TriggersPage = lazy(() => import('../../pages/admin/TriggersPage').then(m => ({ default: m.TriggersPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:TriggersPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:AIAgentsPage:constant" type="constant" identity="AIAgentsPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * AIAgentsPage is a lazily loaded component that optimizes the initial loading time of the application by deferring the loading of the AIAgentsPage module until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const AIAgentsPage = lazy(() => import('../../pages/admin/AIAgentsPage').then(m => ({ default: m.AIAgentsPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:AIAgentsPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:EmbeddingsPage:constant" type="constant" identity="EmbeddingsPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * EmbeddingsPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the EmbeddingsPage module from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const EmbeddingsPage = lazy(() => import('../../pages/admin/EmbeddingsPage').then(m => ({ default: m.EmbeddingsPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:EmbeddingsPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:TimersPage:constant" type="constant" identity="TimersPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * TimersPage is a lazily loaded component that optimizes the initial load time of the application by deferring its loading until needed. It imports the TimersPage from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const TimersPage = lazy(() => import('../../pages/admin/TimersPage').then(m => ({ default: m.TimersPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:TimersPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:IntegrationsPage:constant" type="constant" identity="IntegrationsPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * IntegrationsPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the IntegrationsPage from the admin pages directory.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const IntegrationsPage = lazy(() => import('../../pages/admin/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:IntegrationsPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:AppDetailPage:constant" type="constant" identity="AppDetailPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * AppDetailPage is a lazily-loaded component that optimizes the loading performance of the application by deferring its loading until needed. It imports the AppDetailPage from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const AppDetailPage = lazy(() => import('../../pages/admin/AppDetailPage').then(m => ({ default: m.AppDetailPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:AppDetailPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:PipelineDetailPage:constant" type="constant" identity="PipelineDetailPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * PipelineDetailPage is a lazily loaded component that displays the details of a specific pipeline in the admin interface. It exists to optimize performance by loading the component only when needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const PipelineDetailPage = lazy(() => import('../../pages/admin/PipelineDetailPage').then(m => ({ default: m.PipelineDetailPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:PipelineDetailPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:TriggerDetailPage:constant" type="constant" identity="TriggerDetailPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * TriggerDetailPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the TriggerDetailPage from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const TriggerDetailPage = lazy(() => import('../../pages/admin/TriggerDetailPage').then(m => ({ default: m.TriggerDetailPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:TriggerDetailPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:AIAgentDetailPage:constant" type="constant" identity="AIAgentDetailPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * AIAgentDetailPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the AIAgentDetailPage from the admin pages directory.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const AIAgentDetailPage = lazy(() => import('../../pages/admin/AIAgentDetailPage').then(m => ({ default: m.AIAgentDetailPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:AIAgentDetailPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:EmbeddingDetailPage:constant" type="constant" identity="EmbeddingDetailPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * EmbeddingDetailPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the EmbeddingDetailPage from the admin pages directory.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const EmbeddingDetailPage = lazy(() => import('../../pages/admin/EmbeddingDetailPage').then(m => ({ default: m.EmbeddingDetailPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:EmbeddingDetailPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:TimerDetailPage:constant" type="constant" identity="TimerDetailPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * TimerDetailPage is a lazily loaded component that optimizes the loading performance of the application by deferring its import until needed. This approach enhances user experience by reducing initial load times.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const TimerDetailPage = lazy(() => import('../../pages/admin/TimerDetailPage').then(m => ({ default: m.TimerDetailPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:TimerDetailPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:IntegrationDetailPage:constant" type="constant" identity="IntegrationDetailPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * IntegrationDetailPage is a lazily loaded component that optimizes application load time by splitting code into smaller chunks. It imports the IntegrationDetailPage from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const IntegrationDetailPage = lazy(() => import('../../pages/admin/IntegrationDetailPage').then(m => ({ default: m.IntegrationDetailPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:IntegrationDetailPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:RolesPage:constant" type="constant" identity="RolesPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * RolesPage is a lazily loaded component that optimizes the initial loading time of the application by deferring the loading of the RolesPage module until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const RolesPage = lazy(() => import('../../pages/admin/RolesPage').then(m => ({ default: m.RolesPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:RolesPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:RoleDetailPage:constant" type="constant" identity="RoleDetailPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * RoleDetailPage is a lazily loaded component that optimizes the loading performance of the application by deferring its import until needed. This approach helps improve the initial load time of the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const RoleDetailPage = lazy(() => import('../../pages/admin/RoleDetailPage').then(m => ({ default: m.RoleDetailPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:RoleDetailPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:PromptConfigsPage:constant" type="constant" identity="PromptConfigsPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * PromptConfigsPage is a lazily loaded component that optimizes the loading performance of the application by deferring its import until needed. This approach helps improve the initial load time of the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const PromptConfigsPage = lazy(() => import('../../pages/admin/PromptConfigsPage').then(m => ({ default: m.PromptConfigsPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:PromptConfigsPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:PromptConfigDetailPage:constant" type="constant" identity="PromptConfigDetailPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * PromptConfigDetailPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the PromptConfigDetailPage from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const PromptConfigDetailPage = lazy(() => import('../../pages/admin/PromptConfigDetailPage').then(m => ({ default: m.PromptConfigDetailPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:PromptConfigDetailPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:APIKeysPage:constant" type="constant" identity="APIKeysPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * APIKeysPage is a lazily loaded component that optimizes the initial loading performance of the application by deferring its loading until needed. It imports the APIKeysPage from the admin pages directory.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const APIKeysPage = lazy(() => import('../../pages/admin/APIKeysPage').then(m => ({ default: m.APIKeysPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:APIKeysPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:APIKeyDetailPage:constant" type="constant" identity="APIKeyDetailPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * APIKeyDetailPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the APIKeyDetailPage from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const APIKeyDetailPage = lazy(() => import('../../pages/admin/APIKeyDetailPage').then(m => ({ default: m.APIKeyDetailPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:APIKeyDetailPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:DeliveriesPage:constant" type="constant" identity="DeliveriesPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * DeliveriesPage is a lazily loaded component that optimizes the initial load time of the application by deferring the loading of the DeliveriesPage module until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const DeliveriesPage = lazy(() => import('../../pages/admin/DeliveriesPage').then(m => ({ default: m.DeliveriesPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:DeliveriesPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:InvitesPage:constant" type="constant" identity="InvitesPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * InvitesPage is a lazily loaded component that optimizes the initial loading time of the application by deferring the loading of the InvitesPage module until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const InvitesPage = lazy(() => import('../../pages/admin/InvitesPage').then(m => ({ default: m.InvitesPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:InvitesPage:constant"]







// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:SecurityPage:constant" type="constant" identity="SecurityPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * SecurityPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the SecurityPage module from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const SecurityPage = lazy(() => import('../../pages/admin/SecurityPage').then(m => ({ default: m.SecurityPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:SecurityPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:ObservabilityDashboard:constant" type="constant" identity="ObservabilityDashboard" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * ObservabilityDashboard is a lazily loaded component that optimizes the initial loading time of the application by deferring the loading of the ObservabilityDashboard page until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const ObservabilityDashboard = lazy(() => import('../../pages/admin/ObservabilityDashboard').then(m => ({ default: m.ObservabilityDashboard })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:ObservabilityDashboard:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:PipelineExecutionsPage:constant" type="constant" identity="PipelineExecutionsPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * PipelineExecutionsPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the PipelineExecutionsPage from the admin pages directory.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const PipelineExecutionsPage = lazy(() => import('../../pages/admin/PipelineExecutionsPage').then(m => ({ default: m.PipelineExecutionsPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:PipelineExecutionsPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:LogsPage:constant" type="constant" identity="LogsPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * LogsPage is a lazily loaded component that optimizes performance by loading the LogsPage module only when needed. This approach helps reduce the initial load time of the application.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const LogsPage = lazy(() => import('../../pages/admin/LogsPage').then(m => ({ default: m.LogsPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:LogsPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:AlertsConfigPage:constant" type="constant" identity="AlertsConfigPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * AlertsConfigPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the AlertsConfigPage from the admin pages.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const AlertsConfigPage = lazy(() => import('../../pages/admin/AlertsConfigPage').then(m => ({ default: m.AlertsConfigPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:AlertsConfigPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:DataListPage:constant" type="constant" identity="DataListPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * DataListPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the DataListPage from the runtime components.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const DataListPage = lazy(() => import('../../components/runtime/DataListPage').then(m => ({ default: m.DataListPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:DataListPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:DataDetailPage:constant" type="constant" identity="DataDetailPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * DataDetailPage is a lazily loaded component that renders detailed information about data entries to optimize performance by loading the component only when needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const DataDetailPage = lazy(() => import('../../components/runtime/DataDetailPage').then(m => ({ default: m.DataDetailPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:DataDetailPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:TestingDashboard:constant" type="constant" identity="TestingDashboard" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * TestingDashboard is a lazily loaded component that imports the TestingDashboard page for the admin section. It exists to optimize the initial loading time of the application by deferring the loading of this component until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const TestingDashboard = lazy(() => import('../../pages/admin/TestingDashboard'))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:TestingDashboard:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:TestRunDetailPage:constant" type="constant" identity="TestRunDetailPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * TestRunDetailPage is a lazily loaded component that displays detailed information about a test run. It exists to optimize performance by loading the component only when needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const TestRunDetailPage = lazy(() => import('../../pages/admin/TestRunDetailPage').then(m => ({ default: m.TestRunDetailPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:TestRunDetailPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:CILProjectsPage:constant" type="constant" identity="CILProjectsPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * CILProjectsPage is a lazily loaded component that renders the CIL Projects page in the admin section of the application. It exists to optimize the initial load time by deferring the loading of this component until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const CILProjectsPage = lazy(() => import('../../pages/admin/cil/CILProjectsPage'))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:CILProjectsPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:KBAdminPage:constant" type="constant" identity="KBAdminPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * KBAdminPage is a lazily loaded component that optimizes the initial loading time of the application by deferring its loading until needed. It imports the KBAdminPage from the admin pages module.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const KBAdminPage = lazy(() => import('../../pages/admin/kb/KBAdminPage').then(m => ({ default: m.KBAdminPage })))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:KBAdminPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:CILDashboardPage:constant" type="constant" identity="CILDashboardPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * CILDashboardPage is a lazily loaded component that renders the CIL Dashboard for the admin interface. It exists to optimize performance by loading the component only when it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const CILDashboardPage = lazy(() => import('../../pages/admin/cil/CILDashboardPage'))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:CILDashboardPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:CILSearchPage:constant" type="constant" identity="CILSearchPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * CILSearchPage is a lazily loaded component that renders the CIL search page for the admin interface. It exists to optimize performance by loading the component only when needed.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const CILSearchPage = lazy(() => import('../../pages/admin/cil/CILSearchPage'))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:CILSearchPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:CILVersionsPage:constant" type="constant" identity="CILVersionsPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * CILVersionsPage is a lazily loaded component that renders the CIL Versions page in the admin section of the application. It exists to optimize the initial loading time by deferring the loading of this component until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const CILVersionsPage = lazy(() => import('../../pages/admin/cil/CILVersionsPage'))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:CILVersionsPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:CILSuggestionsPage:constant" type="constant" identity="CILSuggestionsPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * CILSuggestionsPage is a lazily loaded component that optimizes the loading performance of the application by deferring its import until needed. This approach enhances user experience by reducing initial load times.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const CILSuggestionsPage = lazy(() => import('../../pages/admin/cil/CILSuggestionsPage'))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:CILSuggestionsPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:CILAgentPage:constant" type="constant" identity="CILAgentPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * CILAgentPage is a lazily loaded component that optimizes application loading performance by deferring its import until needed. This approach enhances user experience by reducing initial load times.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const CILAgentPage = lazy(() => import('../../pages/admin/cil/CILAgentPage'))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:CILAgentPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:CILFileListPage:constant" type="constant" identity="CILFileListPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * CILFileListPage is a lazily loaded React component that renders the CIL file list for the admin interface. It exists to optimize the loading performance of the application by splitting the code into smaller chunks.
 *
 * @sideEffects none
 * @stability   internal
 * @calls       import
 * @cil-generated
 */
const CILFileListPage = lazy(() => import('../../pages/admin/cil/CILFileListPage'))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:CILFileListPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:CILFileSelectPage:constant" type="constant" identity="CILFileSelectPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * CILFileSelectPage is a lazily loaded component that optimizes the initial loading time of the admin application by deferring the loading of the CILFileSelectPage module until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const CILFileSelectPage = lazy(() => import('../../pages/admin/cil/CILFileSelectPage'))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:CILFileSelectPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:CILGraphPage:constant" type="constant" identity="CILGraphPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * CILGraphPage is a lazily loaded component that renders the CIL Graph page in the admin section of the application. It exists to optimize the initial loading time by deferring the loading of this component until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const CILGraphPage = lazy(() => import('../../pages/admin/cil/CILGraphPage'))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:CILGraphPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:CILChunkDetailPage:constant" type="constant" identity="CILChunkDetailPage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * CILChunkDetailPage is a lazily loaded component that renders the CILChunkDetailPage from the admin section of the application. It exists to optimize performance by reducing the initial load time of the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const CILChunkDetailPage = lazy(() => import('../../pages/admin/cil/CILChunkDetailPage'))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:CILChunkDetailPage:constant"]















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:FlexiblePipelinePage:constant" type="constant" identity="FlexiblePipelinePage" parent="~/.framework/src/apps/admin/index.tsx"]
/**
 * FlexiblePipelinePage is a lazily loaded component that renders the Flexible Pipeline page in the admin section of the application. It exists to optimize the initial loading time by deferring the loading of this component until it is needed.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const FlexiblePipelinePage = lazy(() => import('../../pages/admin/cil/FlexiblePipelinePage'))
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:FlexiblePipelinePage:constant"]
















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:CONFIG_INSTRUCTION_KEYS:constant" type="constant" identity="CONFIG_INSTRUCTION_KEYS" parent="~/.framework/src/apps/admin/index.tsx"]
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
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:CONFIG_INSTRUCTION_KEYS:constant"]
// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:OBSERVABILITY_INSTRUCTION_KEYS:constant" type="constant" identity="OBSERVABILITY_INSTRUCTION_KEYS" parent="~/.framework/src/apps/admin/index.tsx"]
const OBSERVABILITY_INSTRUCTION_KEYS: Record<string, string> = {
  logs: 'logs', alerts: 'alerts', executions: 'pipeline-executions',
}
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:OBSERVABILITY_INSTRUCTION_KEYS:constant"]
// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:CIL_INSTRUCTION_KEYS:constant" type="constant" identity="CIL_INSTRUCTION_KEYS" parent="~/.framework/src/apps/admin/index.tsx"]
const CIL_INSTRUCTION_KEYS: Record<string, string> = {
  search: 'cil-search', projects: 'cil-projects', files: 'cil-files',
  'file-select': 'cil-files', graph: 'cil-graph', ingestion: 'cil-ingestion',
  versions: 'cil-versions', suggestions: 'cil-suggestions', agent: 'cil-agent',
  chunks: 'cil-chunks', pipeline: 'cil-pipeline',
}
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:CIL_INSTRUCTION_KEYS:constant"]

// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:instructionKeyFor:function" type="function" identity="instructionKeyFor" parent="~/.framework/src/apps/admin/index.tsx"]
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
    case 'cil': return CIL_INSTRUCTION_KEYS[entity] ?? 'cil'
    case 'runtime': return segments.length > 4 ? 'runtime-detail' : 'runtime-list'
    default: return null
  }
}
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:instructionKeyFor:function"]

// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:AdminRoutes:component" type="component" identity="AdminRoutes" parent="~/.framework/src/apps/admin/index.tsx"]
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

          <Route path="cil" element={<CILProjectsPage />} />
          <Route path="cil/search" element={<CILSearchPage />} />
          <Route path="cil/versions" element={<CILVersionsPage />} />
          <Route path="cil/suggestions" element={<CILSuggestionsPage />} />
          <Route path="cil/agent" element={<CILAgentPage />} />
          <Route path="cil/:id" element={<CILDashboardPage />} />
          <Route path="cil/:id/dashboard" element={<CILDashboardPage />} />
          <Route path="cil/:id/files" element={<CILFileListPage />} />
          <Route path="cil/:id/select" element={<CILFileSelectPage />} />
          <Route path="cil/:id/graph" element={<CILGraphPage />} />
          <Route path="cil/:id/agent" element={<CILAgentPage />} />
          <Route path="cil/:id/ingest" element={<FlexiblePipelinePage />} />
          <Route path="cil/:id/chunks/:chunkId" element={<CILChunkDetailPage />} />
          <Route path="cil/chunks/:chunkId" element={<CILChunkDetailPage />} />

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
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:AdminRoutes:component"]
















// CIL[BEGIN stable_id="~/.framework/src/apps/admin/index.tsx:AdminApp:component" type="component" identity="AdminApp" parent="~/.framework/src/apps/admin/index.tsx"]
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
// CIL[END stable_id="~/.framework/src/apps/admin/index.tsx:AdminApp:component"]






