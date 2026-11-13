
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



interface AppShellProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  breadcrumbs?: { title: string; url?: string }[]
  headerActions?: React.ReactNode
  banner?: React.ReactNode
  mainClassName?: string
}


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
