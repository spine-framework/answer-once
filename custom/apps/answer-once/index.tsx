// customer and company share the same app and record space; company routes are under /company/*; COMPANY_ROLES = support, support_admin, system_admin — must match AnswerOnceSidebar role logic
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@core/components/layout/AppShell'
import { LoadingSpinner } from '@core/components/ui/LoadingSpinner'
import { TooltipProvider } from '@core/components/ui/tooltip'
import { useAuth } from '@core/contexts/AuthContext'
import { useAppPath } from '@core/hooks/useAppPath'
import { AnswerOnceSidebar } from './components/AnswerOnceSidebar'

const CustomerDashboardPage = lazy(() => import('./pages/customer/CustomerDashboardPage'))

const CustomerTicketsPage = lazy(() => import('./pages/customer/TicketsPage'))

const CustomerTicketPage = lazy(() => import('./pages/customer/TicketPage'))

const CustomerKBPage = lazy(() => import('./pages/customer/KBPage'))

const CustomerKBArticlePage = lazy(() => import('./pages/customer/KBArticlePage'))

const CustomerTeamPage = lazy(() => import('./pages/customer/TeamPage'))

const CompanyDashboardPage = lazy(() => import('./pages/company/CompanyDashboardPage'))

const CompanyTicketsPage = lazy(() => import('./pages/company/TicketsPage'))

const CompanyTicketPage = lazy(() => import('./pages/company/TicketPage'))

const CompanyKBPage = lazy(() => import('./pages/company/KBPage'))

const CompanyKBArticlePage = lazy(() => import('./pages/company/KBArticlePage'))

const CompanyKBReviewPage = lazy(() => import('./pages/company/KBReviewPage'))
const CompanyDirectivesPage = lazy(() => import('./pages/company/DirectivesPage'))

const CompanyAccountsPage = lazy(() => import('./pages/company/AccountsPage'))

const CompanyAccountPage = lazy(() => import('./pages/company/AccountPage'))

const CompanyNewAccountPage = lazy(() => import('./pages/company/NewAccountPage'))
const CompanyContactPage = lazy(() => import('./pages/company/ContactPage'))
const CompanyNewContactPage = lazy(() => import('./pages/company/NewContactPage'))
const CompanyMemberPage = lazy(() => import('./pages/company/MemberPage'))
const CompanyNewMemberPage = lazy(() => import('./pages/company/NewMemberPage'))

const CompanyTeamPage = lazy(() => import('./pages/company/TeamPage'))

const CompanyReportingPage = lazy(() => import('./pages/company/ReportingPage'))

// customer and company share the same data but use different route prefixes and nav sets; member route-guard complements RLS (data was always safe, workspace rendering was not)
const COMPANY_ROLES = ['support', 'support_admin', 'system_admin']
const COMPANY_ADMIN_ROLES = ['support_admin', 'system_admin']

function RoleAwareIndex() {
  const { user } = useAuth()
  const roles = user?.roles || []
  const isCompany = roles.some((r) => COMPANY_ROLES.includes(r))
  return <Navigate to={isCompany ? 'company/dashboard' : 'dashboard'} replace />
}

// Members must never land on the support workspace. Data stays RLS-safe either
// way, but rendering company routes to a member is a UX/trust break.
function RequireCompany({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const appPath = useAppPath()
  if (isLoading) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
  const roles = user?.roles || []
  const isCompany = roles.some((r: string) => COMPANY_ROLES.includes(r))
  if (!isCompany) return <Navigate to={appPath('/dashboard')} replace />
  return <>{children}</>
}

// Admin-only company routes (account provisioning, triage directives). Plain support still gets
// read/update access everywhere else — this gate is UX, not the security
// boundary (record_permissions enforce server-side).
function RequireCompanyAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const appPath = useAppPath()
  if (isLoading) return <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
  const roles = user?.roles || []
  const isAdmin = roles.some((r: string) => COMPANY_ADMIN_ROLES.includes(r))
  if (!isAdmin) return <Navigate to={appPath('/company/accounts')} replace />
  return <>{children}</>
}

// Answer Once brand palette — scoped token overrides so the app wears brand
// colors without touching the shared framework theme used by other apps.
// Navy #0B1F44 (primary text), Blue #0066FF (brand accent),
// Light Blue #33A1FF (accent hover), Light Gray #F4F7FB (card hover / surfaces).
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
