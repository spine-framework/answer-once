// CIL[BEGIN stable_id="~/.framework/src/components/app-shell/GenericAppShell.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Module imports and re-exports for the GenericAppShell component"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide React hooks, router utilities, app types, and child page components used by the app shell"]
// CIL[DOC-CONTEXT module="app-shell" layer="ui" related_files=".framework/src/components/app-shell/GenericDetailPage.tsx,.framework/src/components/app-shell/GenericListPage.tsx,.framework/src/hooks/useApps.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="imported types and components" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Collects module-level imports (React hooks, react-router-dom, app record type, list/detail pages) that the GenericAppShell chunk consumes." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="spine"]
import { useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { AppRecord } from '../../hooks/useApps'
import { GenericListPage } from './GenericListPage'
import { GenericDetailPage } from './GenericDetailPage'
// CIL[DOC-VECTOR type="context" content="purpose='Module imports and re-exports for the GenericAppShell component'; No verified external callers; imports: .framework/src/hooks/useApps.ts,.framework/src/components/app-shell/GenericListPage.tsx,.framework/src/components/app-shell/GenericDetailPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/app-shell/GenericAppShell.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/app-shell/GenericAppShell.tsx:NavItem:interface" type="interface" identity="NavItem" parent="~/.framework/src/components/app-shell/GenericAppShell.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Describe a single navigation item in the generic app shell"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the NavItem contract used by the sidebar and route generation"]
// CIL[DOC-CONTEXT module="app-shell" layer="ui" related_files=".framework/src/components/app-shell/GenericAppShell.tsx,.framework/src/components/app-shell/GenericDetailPage.tsx,.framework/src/components/app-shell/GenericListPage.tsx,.framework/src/hooks/useApps.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="NavItem interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="TypeScript interface with id, label, icon, path, type_slug, view, and min_role fields that define a sidebar entry." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface NavItem {
  id: string
  label: string
  icon?: string
  path: string
  type_slug?: string
  view?: string
  min_role?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Describe a single navigation item in the generic app shell'; No verified external callers; imports: .framework/src/hooks/useApps.ts,.framework/src/components/app-shell/GenericListPage.tsx,.framework/src/components/app-shell/GenericDetailPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/app-shell/GenericAppShell.tsx:NavItem:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/app-shell/GenericAppShell.tsx:GenericAppShellProps:interface" type="interface" identity="GenericAppShellProps" parent="~/.framework/src/components/app-shell/GenericAppShell.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Declare props for the GenericAppShell component"]
// CIL[DOC-RESPONSIBILITY responsibility="Type the app record passed to GenericAppShell"]
// CIL[DOC-CONTEXT module="app-shell" layer="ui" related_files=".framework/src/components/app-shell/GenericAppShell.tsx,.framework/src/components/app-shell/GenericDetailPage.tsx,.framework/src/components/app-shell/GenericListPage.tsx,.framework/src/hooks/useApps.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="GenericAppShellProps interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Contains a single app prop of type AppRecord consumed by GenericAppShell." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface GenericAppShellProps {
  app: AppRecord
}
// CIL[DOC-VECTOR type="context" content="purpose='Declare props for the GenericAppShell component'; No verified external callers; imports: .framework/src/hooks/useApps.ts,.framework/src/components/app-shell/GenericListPage.tsx,.framework/src/components/app-shell/GenericDetailPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/app-shell/GenericAppShell.tsx:GenericAppShellProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/app-shell/GenericAppShell.tsx:GenericAppShell:component" type="component" identity="GenericAppShell" parent="~/.framework/src/components/app-shell/GenericAppShell.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a responsive generic app shell with sidebar navigation and dynamic routes"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the app layout, sidebar nav, and list/detail routes for a generic app record"]
// CIL[DOC-CONTEXT module="app-shell" layer="ui" related_files=".framework/src/components/app-shell/GenericAppShell.tsx,.framework/src/components/app-shell/GenericDetailPage.tsx,.framework/src/components/app-shell/GenericListPage.tsx,.framework/src/hooks/useApps.ts"]
// CIL[DOC-CONTRACT inputs="app: AppRecord" outputs="JSX layout with sidebar and Routes for list/new/detail" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Builds nav items from app.nav_items, detects active routes, manages mobile sidebar state, and generates Route components for list, new, and detail views." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function GenericAppShell({ app }: GenericAppShellProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems: NavItem[] = (app.nav_items || []) as NavItem[]

  
  const prefix = app.route_prefix || `/${app.slug}`

  
  const isActive = (item: NavItem) => {
    const fullPath = item.path.startsWith('/') ? item.path : `${prefix}/${item.path}`
    return location.pathname.startsWith(fullPath)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:inset-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-200">
          <img src="/spine-logo.svg" alt="Spine Framework" className="h-8 w-auto shrink-0" />
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">{app.name}</h2>
            {app.description && (
              <p className="text-xs text-slate-500 truncate max-w-[160px]">{app.description}</p>
            )}
          </div>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id || item.path}
              onClick={() => {
                const target = item.path.startsWith('/') ? item.path : `${prefix}/${item.path}`
                navigate(target)
                setSidebarOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${isActive(item)
                  ? 'bg-slate-100 text-slate-900 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center h-16 px-4 border-b border-slate-200 bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:text-slate-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-3 font-semibold text-slate-900">{app.name}</span>
        </div>

        <main className="p-6">
          <Routes>
            {/* Default: redirect to first nav item */}
            {navItems.length > 0 && (
              <Route index element={
                <Navigate to={navItems[0].path.startsWith('/') ? navItems[0].path : navItems[0].path} replace />
              } />
            )}

            {/* Generate list + detail routes for each nav item with type_slug */}
            {navItems.filter(item => item.type_slug).map(item => {
              



              const relativePath = item.path.startsWith(prefix)
                ? item.path.slice(prefix.length).replace(/^\//, '')
                : item.path.replace(/^\//, '')


              return [
                <Route
                  key={`${item.id}-list`}
                  path={relativePath}
                  element={
                    <GenericListPage
                      typeSlug={item.type_slug!}
                      viewSlug={item.view}
                      appPrefix={prefix}
                      detailPath={`${relativePath}`}
                    />
                  }


                />,
                <Route
                  key={`${item.id}-new`}
                  path={`${relativePath}/new`}
                  element={
                    <GenericDetailPage
                      typeSlug={item.type_slug!}
                      viewSlug={item.view}
                      isCreating={true}
                    />
                  }
                />,
                <Route
                  key={`${item.id}-detail`}
                  path={`${relativePath}/:id`}
                  element={
                    <GenericDetailPage
                      typeSlug={item.type_slug!}
                      viewSlug={item.view}
                    />
                  }
                />
              ]
            })}

            {/* Empty state */}
            {navItems.length === 0 && (
              <Route path="*" element={
                <div className="text-center py-16">
                  <h2 className="text-lg font-medium text-slate-900">No pages configured</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Add nav_items to this app's record to create pages.
                  </p>
                </div>
              } />
            )}
          </Routes>
        </main>
      </div>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a responsive generic app shell with sidebar navigation and dynamic routes'; No verified external callers; imports: .framework/src/hooks/useApps.ts,.framework/src/components/app-shell/GenericListPage.tsx,.framework/src/components/app-shell/GenericDetailPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/app-shell/GenericAppShell.tsx:GenericAppShell:component"]
