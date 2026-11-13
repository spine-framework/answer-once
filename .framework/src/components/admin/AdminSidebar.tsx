/**
 * @module   AdminSidebar
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * The AdminSidebar module provides a navigational sidebar for the admin interface, allowing users to access various administrative functions and settings. It utilizes React components and icons to create an interactive and visually appealing sidebar layout.
 * INVARIANT: The sidebar must always reflect the current user's permissions and available actions.
 *
 * @seeAlso useBranding (provides branding context for the sidebar).
 * @seeAlso ../ui/sidebar (contains UI components used in the sidebar).
 * @seeAlso ../ui/collapsible (provides collapsible functionality for sidebar groups).
 *
 * @cil-generated
 */













import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { 
    Settings, 
  Type, 
  Layout, 
  BarChart3,
  AlertTriangle,
  Activity,
  FileSearch,
  FlaskConical,
  Brain,
  Cpu,
  Timer,
  Puzzle,
  Shield,
  MessageSquare,
  Key,
  Truck,
  UserPlus,
  BookOpen,
  ChevronRight,
  ChevronDown
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "../ui/sidebar"

import { useBranding } from "../../hooks/useBranding"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
















/**
 * The 'navigationSections' constant defines the structure of the sidebar navigation for the admin interface, organizing various sections for configuration, access, security, observability, testing, knowledge base, and CIL functionalities. This organization provides a clear and consistent navigation experience for users managing admin functionalities.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const navigationSections = [
  {
    title: "Configs",
    items: [
      { title: "Types", url: "/spine-framework/admin/configs/types", icon: Type },
      { title: "Apps", url: "/spine-framework/admin/configs/apps", icon: Layout },
      { title: "Pipelines", url: "/spine-framework/admin/configs/pipelines", icon: Activity },
      { title: "Triggers", url: "/spine-framework/admin/configs/triggers", icon: AlertTriangle },
      { title: "AI Agents", url: "/spine-framework/admin/configs/ai-agents", icon: Brain },
      { title: "Timers", url: "/spine-framework/admin/configs/timers", icon: Timer },
      {
        title: "Integration Broker",
        icon: Puzzle,
        children: [
          { title: "Integrations", url: "/spine-framework/admin/configs/integrations", icon: Puzzle },
          { title: "API Keys", url: "/spine-framework/admin/configs/api-keys", icon: Key },
          { title: "Deliveries", url: "/spine-framework/admin/configs/deliveries", icon: Truck },
        ]
      },
      { title: "Roles", url: "/spine-framework/admin/configs/roles", icon: Shield },
      { title: "Prompts", url: "/spine-framework/admin/configs/prompts", icon: MessageSquare },
    ]
  },
  {
    title: "Access",
    items: [
      { title: "Invites", url: "/spine-framework/admin/access/invites", icon: UserPlus },
    ]
  },
  {
    title: "Security",
    items: [
      { title: "Flagged Actors", url: "/spine-framework/admin/security", icon: Shield },
    ]
  },
  {
    title: "Observability",
    items: [
      { title: "Dashboard", url: "/spine-framework/admin/observability", icon: BarChart3 },
      { title: "Alerts", url: "/spine-framework/admin/observability/alerts", icon: AlertTriangle },
      { title: "Executions", url: "/spine-framework/admin/observability/executions", icon: Activity },
      { title: "Logs", url: "/spine-framework/admin/observability/logs", icon: FileSearch },
    ]
  },
  {
    title: "KB Engine",
    items: [
      { title: "Knowledge Base", url: "/spine-framework/admin/kb/kb-spine-public", icon: BookOpen },
      { title: "Embeddings", url: "/spine-framework/admin/kb/embeddings", icon: Cpu },
    ]
  }
]
















/**
 * The AdminSidebar component provides a navigational sidebar for admin functionalities, integrating branding and dynamic navigation sections. It enhances user experience by visually indicating active routes.
 *
 * @macro       Sidebar navigation component for admin interface.
 * @micro       Utilizes React Router for navigation and manages active states based on the current URL.
 * @inputSpec
 *   props: React.ComponentProps<typeof Sidebar> (required) — properties passed to the Sidebar component.
 * @outputSpec  JSX.Element — renders the sidebar layout with navigation items.
 * @sideEffects none
 * @stability   internal
 * @calls       useBranding, useLocation, Link
 * @cil-generated
 */
export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const branding = useBranding()
  const location = useLocation()

  const isActive = (url: string) => {
    return location.pathname === url || location.pathname.startsWith(url + '/')
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/spine-framework/admin/configs/types">
                <img src={branding.logo_url} alt={branding.app_name} className="h-8 w-auto shrink-0" />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold whitespace-nowrap">{branding.title}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

      </SidebarHeader>

      <SidebarContent>
        {navigationSections.map((section) => {
          const sectionActive = section.items.some((item: any) =>
            isActive(item.url) || (item.children && item.children.some((child: any) => isActive(child.url)))
          )
          return (
            <SidebarGroup key={section.title} className="py-0">
              <Collapsible defaultOpen={sectionActive} className="group/collapsible w-full">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="font-semibold text-sm">
                        <span>{section.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>
                </SidebarMenu>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item: any) => (
                        item.children ? (
                          <SidebarMenuItem key={item.title}>
                            <Collapsible
                              defaultOpen={item.children.some((child: any) => isActive(child.url))}
                              className="group/collapsible w-full"
                            >
                              <CollapsibleTrigger asChild>
                                <SidebarMenuButton>
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.title}</span>
                                  <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                </SidebarMenuButton>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <SidebarMenuSub>
                                  {item.children.map((child: any) => (
                                    <SidebarMenuSubItem key={child.title}>
                                      <SidebarMenuSubButton asChild isActive={isActive(child.url)}>
                                        <Link to={child.url}>
                                          <child.icon className="h-4 w-4" />
                                          <span>{child.title}</span>
                                        </Link>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </Collapsible>
                          </SidebarMenuItem>
                        ) : (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={isActive(item.url)}>
                              <Link to={item.url}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground">
          Spine v2.0
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}






