// CIL[BEGIN stable_id="~/.framework/src/components/admin/AdminSidebar.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Provides React, router, icons, and UI component imports for the admin sidebar module"]
// CIL[DOC-RESPONSIBILITY responsibility="Declares module-level imports required by AdminSidebar"]
// CIL[DOC-CONTEXT module="admin" layer="presentation" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="imported symbols" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, react-router-dom hooks, lucide-react icons, and local sidebar/collapsible UI primitives" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]




import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  PlusIcon, 
  Database, 
  Settings, 
  Type, 
  Users, 
  Layout, 
  FileText,
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
  GitBranch,
  Lightbulb,
  Key,
  Truck,
  TestTube,
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
import { Button } from "../ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
// CIL[DOC-VECTOR type="context" content="purpose='Provides React, router, icons, and UI component imports for the admin sidebar module'; No verified external callers; imports: .framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/collapsible.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/AdminSidebar.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/admin/AdminSidebar.tsx:navigationsections:constant" type="constant" identity="navigationSections" parent="none"]
// CIL[DOC-MACRO purpose="Defines the static navigation section structure for the admin sidebar"]
// CIL[DOC-RESPONSIBILITY responsibility="Maintain the ordered list of admin navigation sections, routes, and optional nested children"]
// CIL[DOC-CONTEXT module="admin" layer="presentation" related_files=".framework/src/components/admin/AdminSidebar.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="navigationSections: NavigationSection[]" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Static array of navigation sections with title, icon, optional children, and route URLs" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

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
    title: "Runtime",
    items: [
      { title: "Items", url: "/spine-framework/admin/runtime/items", icon: Database },
      { title: "Accounts", url: "/spine-framework/admin/runtime/accounts", icon: Users },
      { title: "People", url: "/spine-framework/admin/runtime/people", icon: Users },
      { title: "Threads", url: "/spine-framework/admin/runtime/threads", icon: MessageSquare },
      { title: "Messages", url: "/spine-framework/admin/runtime/messages", icon: FileText },
      { title: "Attachments", url: "/spine-framework/admin/runtime/attachments", icon: FileSearch },
      { title: "Watchers", url: "/spine-framework/admin/runtime/watchers", icon: Activity },
      { title: "Links", url: "/spine-framework/admin/runtime/links", icon: Puzzle },
      { title: "Progress", url: "/spine-framework/admin/runtime/item_progress", icon: BarChart3 },
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
    title: "Testing",
    items: [
      { title: "Test Runs", url: "/spine-framework/admin/testing", icon: TestTube },
    ]
  },
  {
    title: "KB Engine",
    items: [
      { title: "Knowledge Base", url: "/spine-framework/admin/kb/kb-spine-public", icon: BookOpen },
      { title: "Embeddings", url: "/spine-framework/admin/kb/embeddings", icon: Cpu },
    ]
  },
  {
    title: "CIL",
    items: [
      { title: "Projects", url: "/spine-framework/admin/cil", icon: Brain },
      { title: "Search", url: "/spine-framework/admin/cil/search", icon: FileSearch },
      { title: "Versions", url: "/spine-framework/admin/cil/versions", icon: GitBranch },
      { title: "Suggestions", url: "/spine-framework/admin/cil/suggestions", icon: Lightbulb },
      { title: "Agent", url: "/spine-framework/admin/cil/agent", icon: MessageSquare },
    ]
  }
]
// CIL[DOC-VECTOR type="context" content="purpose='Defines the static navigation section structure for the admin sidebar'; No verified external callers; imports: .framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/collapsible.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/AdminSidebar.tsx:navigationsections:constant"]
// CIL[BEGIN stable_id="~/.framework/src/components/admin/AdminSidebar.tsx:adminsidebar:function" type="function" identity="AdminSidebar" parent="none"]
// CIL[DOC-MACRO purpose="Renders the admin sidebar with navigation sections and active route highlighting"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the admin sidebar UI and compute active route state from useLocation"]
// CIL[DOC-CONTEXT module="admin" layer="presentation" related_files=".framework/src/components/admin/AdminSidebar.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/collapsible.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<typeof Sidebar>" outputs="JSX.Element" errors="none" side_effects="Reads useLocation and renders react-router Link components"]
// CIL[DOC-MICRO logic_summary="Uses useLocation to determine active routes; maps navigationSections into collapsible sidebar groups and nested items" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                <img src="/spine-logo.svg" alt="Spine Framework" className="h-8 w-auto shrink-0" />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold whitespace-nowrap">Spine Framework</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarGroup className="py-2">
          <Button className="w-full" size="sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            Quick Create
          </Button>
        </SidebarGroup>
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
// CIL[DOC-VECTOR type="context" content="purpose='Renders the admin sidebar with navigation sections and active route highlighting'; No verified external callers; imports: .framework/src/components/ui/sidebar.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/collapsible.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/AdminSidebar.tsx:adminsidebar:function"]