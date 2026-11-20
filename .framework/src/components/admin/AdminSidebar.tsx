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
import { Link, useLocation, useNavigate } from "react-router-dom"
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
  ChevronDown,
  MoreVertical,
  LogOut
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

import { useBranding } from "../../hooks/useBranding"
import { useAuth } from "../../contexts/AuthContext"
import { apiFetch } from "../../lib/api"
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
  const navigate = useNavigate()
  const { user, logout, refreshUser } = useAuth()
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [fullName, setFullName] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [settingsError, setSettingsError] = React.useState<string | null>(null)

  const openSettings = () => {
    setFullName(user?.full_name || '')
    setSettingsError(null)
    setSettingsOpen(true)
  }

  const saveSettings = async () => {
    if (!user?.id) return
    setSaving(true)
    setSettingsError(null)
    try {
      const res = await apiFetch(`/api/admin-data?entity=people&id=${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim() || user.full_name }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`)
      await refreshUser?.()
      setSettingsOpen(false)
    } catch (e: any) {
      setSettingsError(e.message)
    } finally {
      setSaving(false)
    }
  }

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
                <img src={branding.logo_url} alt={branding.app_name} className="h-10 w-auto shrink-0" />
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

      <SidebarFooter className="p-2">
        <div className="flex items-center gap-1 rounded-md px-1 py-1">
          <span className="flex-1 truncate text-xs text-muted-foreground" title={user?.email || ''}>
            {user?.email || 'Not signed in'}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" aria-label="User menu">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="w-48">
              <DropdownMenuItem onSelect={openSettings}>
                <Settings className="mr-2 h-4 w-4" /> User settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={async () => { await logout(); navigate('/login') }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>

      <SidebarRail />

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User settings</DialogTitle>
            <DialogDescription>Your profile details for this workspace.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <label htmlFor="admin-settings-name" className="text-xs font-medium text-muted-foreground">Full name</label>
              <Input
                id="admin-settings-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{user?.email || '—'}</p>
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Roles</label>
              <p className="text-sm">{user?.roles?.join(', ') || '—'}</p>
            </div>
            {settingsError && <p className="text-sm text-destructive">{settingsError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={saveSettings} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}






