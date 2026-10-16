// CIL[BEGIN stable_id="~/.framework/src/components/layout/AppShell.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/layout/AppShell.tsx"]
// CIL[DOC-MACRO purpose="AppShell layout component module entry point"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide shared application shell imports and component"]
// CIL[DOC-CONTEXT module="AppShell" layer="component" related_files=".framework/src/components/ui/breadcrumb.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Module header with React and UI imports for the AppShell layout component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="system-ui"]

import * as React from "react"
import { Link } from 'react-router-dom'
import { cn } from "../../lib/utils"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "../ui/sidebar"
import { Separator } from "../ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb"

// CIL[DOC-VECTOR type="context" content="purpose='AppShell layout component module entry point'; No verified external callers; imports: .framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/breadcrumb.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/AppShell.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/layout/AppShell.tsx:appshellprops:interface" type="interface" identity="AppShellProps" parent="~/.framework/src/components/layout/AppShell.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Props interface for the AppShell layout component"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the inputs accepted by AppShell"]
// CIL[DOC-CONTEXT module="AppShell" layer="component" related_files=".framework/src/components/layout/AppShell.tsx,.framework/src/components/ui/breadcrumb.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="AppShellProps interface type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines AppShell props including sidebar, children, breadcrumbs, headerActions, banner and mainClassName" notable_decisions="mainClassName overrides the default main padding (p-4 md:p-6 lg:p-8) — apps whose pages self-pad pass a zero/tighter value to close the gap above the page header"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface AppShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  breadcrumbs?: { title: string; url?: string }[]
  headerActions?: React.ReactNode
  banner?: React.ReactNode
  mainClassName?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Props interface for the AppShell layout component'; No verified external callers; imports: .framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/breadcrumb.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/AppShell.tsx:appshellprops:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/layout/AppShell.tsx:appshell:function" type="function" identity="AppShell" parent="~/.framework/src/components/layout/AppShell.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the main application shell with sidebar, header and content area"]
// CIL[DOC-RESPONSIBILITY responsibility="Compose sidebar, breadcrumbs, header actions, banner and children into the app layout"]
// CIL[DOC-CONTEXT module="AppShell" layer="component" related_files=".framework/src/components/layout/AppShell.tsx,.framework/src/components/ui/breadcrumb.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-CONTRACT inputs="sidebar: React.ReactNode, children: React.ReactNode, breadcrumbs: { title: string; url?: string }[] | undefined, headerActions: React.ReactNode | undefined, banner: React.ReactNode | undefined, mainClassName: string | undefined" outputs="React tree" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wraps children in a sidebar-aware layout with optional breadcrumbs and header actions" notable_decisions="mainClassName replaces the default main padding (p-4 md:p-6 lg:p-8) entirely via cn() — pass an empty/tight value when pages self-pad to close the gap above the page header"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function AppShell({
  sidebar,
  children,
  breadcrumbs,
  headerActions,
  banner,
  mainClassName,
}: AppShellProps) {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset className="h-svh min-h-0 overflow-hidden">
        {banner}
        <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {breadcrumbs && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.title}>
                      <BreadcrumbItem
                        className={
                          index === breadcrumbs.length - 1
                            ? "hidden md:block"
                            : ""
                        }
                      >
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.url || "#"}>
                              {crumb.title}
                            </Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>
          {headerActions && (
            <div className="ml-auto flex items-center gap-2 px-4">
              {headerActions}
            </div>
          )}
        </header>

        <main className={cn("flex-1 flex flex-col min-h-0 overflow-auto", mainClassName ?? "p-4 md:p-6 lg:p-8")}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the main application shell with sidebar, header and content area'; No verified external callers; imports: .framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/separator.tsx,.framework/src/components/ui/breadcrumb.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/AppShell.tsx:appshell:function"]
