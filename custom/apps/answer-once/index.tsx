// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/custom/apps/answer-once/index.tsx"]
// CIL[DOC-MACRO purpose="Answer Once app entry point — role-aware shell with customer and company routes"]
// CIL[DOC-RESPONSIBILITY responsibility="Mount the Answer Once app, render AppShell with AnswerOnceSidebar, and wire all routes"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/components/AnswerOnceSidebar.tsx, custom/apps/answer-once/pages/*"]
// CIL[DOC-CONTRACT inputs="none" outputs="React app shell" errors="none" side_effects="client-side navigation"]
// CIL[DOC-MICRO logic_summary="Lazy-loads customer and company pages; index redirects by role; RequireCompany guards /company/* so members land on their dashboard" notable_decisions="customer and company share the same app and record space; company routes are under /company/*; COMPANY_ROLES = support, support_admin, system_admin — must match AnswerOnceSidebar role logic"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@core/components/layout/AppShell'
import { LoadingSpinner } from '@core/components/ui/LoadingSpinner'
import { TooltipProvider } from '@core/components/ui/tooltip'
import { useAuth } from '@core/contexts/AuthContext'
import { useAppPath } from '@core/hooks/useAppPath'
import { AnswerOnceSidebar } from './components/AnswerOnceSidebar'
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:module_header:module_header"]

// CIL[DOC-MACRO purpose="Lazy-loaded customer dashboard page"]
// CIL[DOC-RESPONSIBILITY responsibility="Code-split the customer dashboard"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/pages/customer/CustomerDashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="lazy component" errors="none" side_effects="dynamic import on first route hit"]
// CIL[DOC-MICRO logic_summary="React.lazy boundary for /dashboard" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CustomerDashboardPage:constant" type="constant" identity="CustomerDashboardPage" parent="~/custom/apps/answer-once/index.tsx"]
const CustomerDashboardPage = lazy(() => import('./pages/customer/CustomerDashboardPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CustomerDashboardPage:constant"]

// CIL[DOC-MACRO purpose="Lazy-loaded customer tickets list page"]
// CIL[DOC-RESPONSIBILITY responsibility="Code-split the customer tickets list"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/pages/customer/TicketsPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="lazy component" errors="none" side_effects="dynamic import on first route hit"]
// CIL[DOC-MICRO logic_summary="React.lazy boundary for /tickets" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CustomerTicketsPage:constant" type="constant" identity="CustomerTicketsPage" parent="~/custom/apps/answer-once/index.tsx"]
const CustomerTicketsPage = lazy(() => import('./pages/customer/TicketsPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CustomerTicketsPage:constant"]

// CIL[DOC-MACRO purpose="Lazy-loaded customer ticket detail page"]
// CIL[DOC-RESPONSIBILITY responsibility="Code-split the customer ticket conversation"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/pages/customer/TicketPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="lazy component" errors="none" side_effects="dynamic import on first route hit"]
// CIL[DOC-MICRO logic_summary="React.lazy boundary for /tickets/:id" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CustomerTicketPage:constant" type="constant" identity="CustomerTicketPage" parent="~/custom/apps/answer-once/index.tsx"]
const CustomerTicketPage = lazy(() => import('./pages/customer/TicketPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CustomerTicketPage:constant"]

// CIL[DOC-MACRO purpose="Lazy-loaded customer knowledgebase list page"]
// CIL[DOC-RESPONSIBILITY responsibility="Code-split the customer KB list"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/pages/customer/KBPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="lazy component" errors="none" side_effects="dynamic import on first route hit"]
// CIL[DOC-MICRO logic_summary="React.lazy boundary for /kb" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CustomerKBPage:constant" type="constant" identity="CustomerKBPage" parent="~/custom/apps/answer-once/index.tsx"]
const CustomerKBPage = lazy(() => import('./pages/customer/KBPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CustomerKBPage:constant"]

// CIL[DOC-MACRO purpose="Lazy-loaded customer KB article page"]
// CIL[DOC-RESPONSIBILITY responsibility="Code-split the customer KB article"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/pages/customer/KBArticlePage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="lazy component" errors="none" side_effects="dynamic import on first route hit"]
// CIL[DOC-MICRO logic_summary="React.lazy boundary for /kb/:id" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CustomerKBArticlePage:constant" type="constant" identity="CustomerKBArticlePage" parent="~/custom/apps/answer-once/index.tsx"]
const CustomerKBArticlePage = lazy(() => import('./pages/customer/KBArticlePage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CustomerKBArticlePage:constant"]

// CIL[DOC-MACRO purpose="Lazy-loaded customer team page"]
// CIL[DOC-RESPONSIBILITY responsibility="Code-split the customer team list"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/pages/customer/TeamPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="lazy component" errors="none" side_effects="dynamic import on first route hit"]
// CIL[DOC-MICRO logic_summary="React.lazy boundary for /team" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CustomerTeamPage:constant" type="constant" identity="CustomerTeamPage" parent="~/custom/apps/answer-once/index.tsx"]
const CustomerTeamPage = lazy(() => import('./pages/customer/TeamPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CustomerTeamPage:constant"]

// CIL[DOC-MACRO purpose="Lazy-loaded company dashboard page"]
// CIL[DOC-RESPONSIBILITY responsibility="Code-split the company dashboard"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/pages/company/CompanyDashboardPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="lazy component" errors="none" side_effects="dynamic import on first route hit"]
// CIL[DOC-MICRO logic_summary="React.lazy boundary for /company/dashboard" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CompanyDashboardPage:constant" type="constant" identity="CompanyDashboardPage" parent="~/custom/apps/answer-once/index.tsx"]
const CompanyDashboardPage = lazy(() => import('./pages/company/CompanyDashboardPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CompanyDashboardPage:constant"]

// CIL[DOC-MACRO purpose="Lazy-loaded company tickets list page"]
// CIL[DOC-RESPONSIBILITY responsibility="Code-split the company tickets queue"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/pages/company/TicketsPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="lazy component" errors="none" side_effects="dynamic import on first route hit"]
// CIL[DOC-MICRO logic_summary="React.lazy boundary for /company/tickets" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CompanyTicketsPage:constant" type="constant" identity="CompanyTicketsPage" parent="~/custom/apps/answer-once/index.tsx"]
const CompanyTicketsPage = lazy(() => import('./pages/company/TicketsPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CompanyTicketsPage:constant"]

// CIL[DOC-MACRO purpose="Lazy-loaded company ticket workspace page"]
// CIL[DOC-RESPONSIBILITY responsibility="Code-split the company ticket workspace"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/pages/company/TicketPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="lazy component" errors="none" side_effects="dynamic import on first route hit"]
// CIL[DOC-MICRO logic_summary="React.lazy boundary for /company/tickets/:id" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CompanyTicketPage:constant" type="constant" identity="CompanyTicketPage" parent="~/custom/apps/answer-once/index.tsx"]
const CompanyTicketPage = lazy(() => import('./pages/company/TicketPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CompanyTicketPage:constant"]

// CIL[DOC-MACRO purpose="Lazy-loaded company knowledgebase page"]
// CIL[DOC-RESPONSIBILITY responsibility="Code-split the company KB list"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/pages/company/KBPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="lazy component" errors="none" side_effects="dynamic import on first route hit"]
// CIL[DOC-MICRO logic_summary="React.lazy boundary for /company/kb" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CompanyKBPage:constant" type="constant" identity="CompanyKBPage" parent="~/custom/apps/answer-once/index.tsx"]
const CompanyKBPage = lazy(() => import('./pages/company/KBPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CompanyKBPage:constant"]

// CIL[DOC-MACRO purpose="Lazy-loaded company KB article page"]
// CIL[DOC-RESPONSIBILITY responsibility="Code-split the company KB article"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/pages/company/KBArticlePage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="lazy component" errors="none" side_effects="dynamic import on first route hit"]
// CIL[DOC-MICRO logic_summary="React.lazy boundary for /company/kb/:id" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CompanyKBArticlePage:constant" type="constant" identity="CompanyKBArticlePage" parent="~/custom/apps/answer-once/index.tsx"]
const CompanyKBArticlePage = lazy(() => import('./pages/company/KBArticlePage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CompanyKBArticlePage:constant"]

// CIL[DOC-MACRO purpose="Lazy-loaded KB review page"]
// CIL[DOC-RESPONSIBILITY responsibility="Code-split the KB review queue"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/pages/company/KBReviewPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="lazy component" errors="none" side_effects="dynamic import on first route hit"]
// CIL[DOC-MICRO logic_summary="React.lazy boundary for /company/kb/review" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CompanyKBReviewPage:constant" type="constant" identity="CompanyKBReviewPage" parent="~/custom/apps/answer-once/index.tsx"]
const CompanyKBReviewPage = lazy(() => import('./pages/company/KBReviewPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CompanyKBReviewPage:constant"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CompanyDirectivesPage:constant" type="constant" identity="CompanyDirectivesPage" parent="~/custom/apps/answer-once/index.tsx"]
const CompanyDirectivesPage = lazy(() => import('./pages/company/DirectivesPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CompanyDirectivesPage:constant"]

// CIL[DOC-MACRO purpose="Lazy-loaded company accounts page"]
// CIL[DOC-RESPONSIBILITY responsibility="Code-split the company accounts list"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/pages/company/AccountsPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="lazy component" errors="none" side_effects="dynamic import on first route hit"]
// CIL[DOC-MICRO logic_summary="React.lazy boundary for /company/accounts" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CompanyAccountsPage:constant" type="constant" identity="CompanyAccountsPage" parent="~/custom/apps/answer-once/index.tsx"]
const CompanyAccountsPage = lazy(() => import('./pages/company/AccountsPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CompanyAccountsPage:constant"]

// CIL[DOC-MACRO purpose="Lazy-loaded company account detail page"]
// CIL[DOC-RESPONSIBILITY responsibility="Code-split the company account detail"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/pages/company/AccountPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="lazy component" errors="none" side_effects="dynamic import on first route hit"]
// CIL[DOC-MICRO logic_summary="React.lazy boundary for /company/accounts/:id" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CompanyAccountPage:constant" type="constant" identity="CompanyAccountPage" parent="~/custom/apps/answer-once/index.tsx"]
const CompanyAccountPage = lazy(() => import('./pages/company/AccountPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CompanyAccountPage:constant"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CompanyNewAccountPage:constant" type="constant" identity="CompanyNewAccountPage" parent="~/custom/apps/answer-once/index.tsx"]
const CompanyNewAccountPage = lazy(() => import('./pages/company/NewAccountPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CompanyNewAccountPage:constant"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CompanyContactPage:constant" type="constant" identity="CompanyContactPage" parent="~/custom/apps/answer-once/index.tsx"]
const CompanyContactPage = lazy(() => import('./pages/company/ContactPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CompanyContactPage:constant"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CompanyNewContactPage:constant" type="constant" identity="CompanyNewContactPage" parent="~/custom/apps/answer-once/index.tsx"]
const CompanyNewContactPage = lazy(() => import('./pages/company/NewContactPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CompanyNewContactPage:constant"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CompanyMemberPage:constant" type="constant" identity="CompanyMemberPage" parent="~/custom/apps/answer-once/index.tsx"]
const CompanyMemberPage = lazy(() => import('./pages/company/MemberPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CompanyMemberPage:constant"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CompanyNewMemberPage:constant" type="constant" identity="CompanyNewMemberPage" parent="~/custom/apps/answer-once/index.tsx"]
const CompanyNewMemberPage = lazy(() => import('./pages/company/NewMemberPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CompanyNewMemberPage:constant"]

// CIL[DOC-MACRO purpose="Lazy-loaded company team page"]
// CIL[DOC-RESPONSIBILITY responsibility="Code-split the company team list"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/pages/company/TeamPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="lazy component" errors="none" side_effects="dynamic import on first route hit"]
// CIL[DOC-MICRO logic_summary="React.lazy boundary for /company/team" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CompanyTeamPage:constant" type="constant" identity="CompanyTeamPage" parent="~/custom/apps/answer-once/index.tsx"]
const CompanyTeamPage = lazy(() => import('./pages/company/TeamPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CompanyTeamPage:constant"]

// CIL[DOC-MACRO purpose="Lazy-loaded company reporting page"]
// CIL[DOC-RESPONSIBILITY responsibility="Code-split the executive reporting page"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/index.tsx" layer="custom_app" related_files="custom/apps/answer-once/pages/company/ReportingPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="lazy component" errors="none" side_effects="dynamic import on first route hit"]
// CIL[DOC-MICRO logic_summary="React.lazy boundary for /company/reporting" notable_decisions="route path kept at /company/reporting"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:CompanyReportingPage:constant" type="constant" identity="CompanyReportingPage" parent="~/custom/apps/answer-once/index.tsx"]
const CompanyReportingPage = lazy(() => import('./pages/company/ReportingPage'))
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:CompanyReportingPage:constant"]

// CIL[DOC-MACRO purpose="Answer Once app root component with AppShell and routes"]
// CIL[DOC-RESPONSIBILITY responsibility="Render AppShell with sidebar and lazy-loaded customer/company routes"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX app tree" errors="none" side_effects="renders DOM, navigates"]
// CIL[DOC-MICRO logic_summary="AppShell receives AnswerOnceSidebar; Routes cover customer and company paths; RoleAwareIndex redirects by role; RequireCompany wraps every /company/* route" notable_decisions="customer and company share the same data but use different route prefixes and nav sets; member route-guard complements RLS (data was always safe, workspace rendering was not)"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:COMPANY_ROLES:constant" type="constant" identity="COMPANY_ROLES" parent="~/custom/apps/answer-once/index.tsx"]
const COMPANY_ROLES = ['support', 'support_admin', 'system_admin']
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:COMPANY_ROLES:constant"]
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:COMPANY_ADMIN_ROLES:constant" type="constant" identity="COMPANY_ADMIN_ROLES" parent="~/custom/apps/answer-once/index.tsx"]
const COMPANY_ADMIN_ROLES = ['support_admin', 'system_admin']
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:COMPANY_ADMIN_ROLES:constant"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:RoleAwareIndex:component" type="component" identity="RoleAwareIndex" parent="~/custom/apps/answer-once/index.tsx"]
function RoleAwareIndex() {
  const { user } = useAuth()
  const roles = user?.roles || []
  const isCompany = roles.some((r) => COMPANY_ROLES.includes(r))
  return <Navigate to={isCompany ? 'company/dashboard' : 'dashboard'} replace />
}
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:RoleAwareIndex:component"]

// Members must never land on the support workspace. Data stays RLS-safe either
// way, but rendering company routes to a member is a UX/trust break.
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:RequireCompany:component" type="component" identity="RequireCompany" parent="~/custom/apps/answer-once/index.tsx"]
function RequireCompany({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const appPath = useAppPath()
  if (isLoading) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
  const roles = user?.roles || []
  const isCompany = roles.some((r: string) => COMPANY_ROLES.includes(r))
  if (!isCompany) return <Navigate to={appPath('/dashboard')} replace />
  return <>{children}</>
}
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:RequireCompany:component"]

// Admin-only company routes (account provisioning, triage directives). Plain support still gets
// read/update access everywhere else — this gate is UX, not the security
// boundary (record_permissions enforce server-side).
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:RequireCompanyAdmin:component" type="component" identity="RequireCompanyAdmin" parent="~/custom/apps/answer-once/index.tsx"]
function RequireCompanyAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const appPath = useAppPath()
  if (isLoading) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
  const roles = user?.roles || []
  const isAdmin = roles.some((r: string) => COMPANY_ADMIN_ROLES.includes(r))
  if (!isAdmin) return <Navigate to={appPath('/company/accounts')} replace />
  return <>{children}</>
}
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:RequireCompanyAdmin:component"]

// Answer Once brand palette — scoped token overrides so the app wears brand
// colors without touching the shared framework theme used by other apps.
// Navy #0B1F44 (primary text), Blue #0066FF (brand accent),
// Light Blue #33A1FF (accent hover), Light Gray #F4F7FB (card hover / surfaces).
// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:AO_BRAND_VARS:constant" type="constant" identity="AO_BRAND_VARS" parent="~/custom/apps/answer-once/index.tsx"]
const AO_BRAND_VARS = {
  '--background': '0 0% 100%',
  '--foreground': '219 72% 16%',
  '--card-foreground': '219 72% 16%',
  '--popover-foreground': '219 72% 16%',
  '--primary': '216 100% 50%',
  '--primary-foreground': '0 0% 100%',
  '--secondary': '214 40% 93%',
  '--secondary-foreground': '219 72% 16%',
  '--muted': '214 40% 94%',
  '--muted-foreground': '219 30% 42%',
  '--accent': '208 100% 60%',
  '--accent-foreground': '219 72% 16%',
  '--border': '214 30% 88%',
  '--input': '214 30% 88%',
  '--ring': '216 100% 50%',
  '--chart-1': '216 100% 50%',
  '--chart-2': '208 100% 60%',
  '--chart-3': '219 72% 30%',
  '--chart-4': '214 60% 78%',
  '--chart-5': '216 45% 45%',
  '--sidebar': '214 47% 97%',
  '--sidebar-foreground': '219 50% 30%',
  '--sidebar-primary': '216 100% 50%',
  '--sidebar-primary-foreground': '0 0% 100%',
  '--sidebar-accent': '208 100% 94%',
  '--sidebar-accent-foreground': '219 72% 16%',
  '--sidebar-border': '214 30% 90%',
  '--sidebar-ring': '216 100% 50%',
} as React.CSSProperties
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:AO_BRAND_VARS:constant"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/index.tsx:AnswerOnceApp:component" type="component" identity="AnswerOnceApp" parent="~/custom/apps/answer-once/index.tsx"]
export default function AnswerOnceApp() {
  return (
    <div style={AO_BRAND_VARS} className="h-svh">
    <TooltipProvider>
      <AppShell sidebar={<AnswerOnceSidebar />} mainClassName="pt-0 px-0 pb-0">
        <Suspense fallback={<div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>}>
          <Routes>
            <Route index element={<RoleAwareIndex />} />

            {/* Customer routes */}
            <Route path="dashboard" element={<CustomerDashboardPage />} />
            <Route path="tickets" element={<CustomerTicketsPage />} />
            <Route path="tickets/:id" element={<CustomerTicketPage />} />
            <Route path="kb" element={<CustomerKBPage />} />
            <Route path="kb/:id" element={<CustomerKBArticlePage />} />
            <Route path="team" element={<CustomerTeamPage />} />

            {/* Company routes — support-side workspace, members redirected */}
            <Route path="company/dashboard" element={<RequireCompany><CompanyDashboardPage /></RequireCompany>} />
            <Route path="company/tickets" element={<RequireCompany><CompanyTicketsPage /></RequireCompany>} />
            <Route path="company/tickets/:id" element={<RequireCompany><CompanyTicketPage /></RequireCompany>} />
            <Route path="company/kb" element={<RequireCompany><CompanyKBPage /></RequireCompany>} />
            <Route path="company/kb/review" element={<RequireCompany><CompanyKBReviewPage /></RequireCompany>} />
            <Route path="company/directives" element={<RequireCompanyAdmin><CompanyDirectivesPage /></RequireCompanyAdmin>} />
            <Route path="company/kb/:id" element={<RequireCompany><CompanyKBArticlePage /></RequireCompany>} />
            <Route path="company/accounts" element={<RequireCompany><CompanyAccountsPage /></RequireCompany>} />
            <Route path="company/accounts/new" element={<RequireCompanyAdmin><CompanyNewAccountPage /></RequireCompanyAdmin>} />
            <Route path="company/accounts/:id" element={<RequireCompany><CompanyAccountPage /></RequireCompany>} />
            <Route path="company/contacts/new" element={<RequireCompany><CompanyNewContactPage /></RequireCompany>} />
            <Route path="company/contacts/:id" element={<RequireCompany><CompanyContactPage /></RequireCompany>} />
            <Route path="company/team" element={<RequireCompany><CompanyTeamPage /></RequireCompany>} />
            <Route path="company/team/new" element={<RequireCompanyAdmin><CompanyNewMemberPage /></RequireCompanyAdmin>} />
            <Route path="company/team/:id" element={<RequireCompany><CompanyMemberPage /></RequireCompany>} />
            <Route path="company/reporting" element={<RequireCompany><CompanyReportingPage /></RequireCompany>} />

            <Route path="*" element={<RoleAwareIndex />} />
          </Routes>
        </Suspense>
      </AppShell>
    </TooltipProvider>
    </div>
  )
}
// CIL[END stable_id="~/custom/apps/answer-once/index.tsx:AnswerOnceApp:component"]
