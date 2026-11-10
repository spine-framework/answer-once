// CIL[BEGIN stable_id="~/custom/apps/answer-once/components/AnswerOnceSidebar.tsx:doc_block:comment" type="comment" identity="doc_block" parent="none"]
// CIL[DOC-MACRO purpose="Answer Once sidebar with role-aware navigation"]
// CIL[DOC-RESPONSIBILITY responsibility="Render customer or company navigation based on the user's roles"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/components/AnswerOnceSidebar.tsx" layer="custom_app" related_files=".framework/src/components/ui/sidebar.tsx, .framework/src/hooks/useAppPath.ts, .framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX sidebar" errors="none" side_effects="navigation via react-router"]
// CIL[DOC-MICRO logic_summary="Shows customer nav for member/member_admin; shows company nav for support/support_admin/system_admin" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
// CIL[END stable_id="~/custom/apps/answer-once/components/AnswerOnceSidebar.tsx:doc_block:comment"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/components/AnswerOnceSidebar.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Import dependencies for the AnswerOnceSidebar component"]
// CIL[DOC-RESPONSIBILITY responsibility="Load React, router, auth context, app path helper, and UI primitives"]
// CIL[DOC-CONTEXT module="custom/apps/answer-once/components/AnswerOnceSidebar.tsx" layer="custom_app" related_files=".framework/src/components/ui/sidebar.tsx, .framework/src/components/ui/button.tsx, .framework/src/hooks/useAppPath.ts, .framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="module imports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Static imports of React, lucide icons, useAppPath, useNavigate, useAuth, and Sidebar UI primitives" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developer"]
import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useAppPath } from "@core/hooks/useAppPath"
import { useAuth } from "@core/contexts/AuthContext"
import { apiFetch } from "@core/lib/api"
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
  SidebarRail,
} from "@core/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/components/ui/dialog"
import { Button } from "@core/components/ui/button"
import { Input } from "@core/components/ui/input"
import { useBranding } from "@core/hooks/useBranding"
import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  Users,
  Building2,
  BarChart3,
  Compass,
  MoreVertical,
  Settings,
  LogOut,
} from "lucide-react"
// CIL[END stable_id="~/custom/apps/answer-once/components/AnswerOnceSidebar.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/custom/apps/answer-once/components/AnswerOnceSidebar.tsx:AnswerOnceSidebar:component" type="component" identity="AnswerOnceSidebar" parent="none"]
// CIL[DOC-MACRO purpose="Render the Answer Once sidebar with role-based navigation"]
// CIL[DOC-RESPONSIBILITY responsibility="Choose customer or company nav items based on user roles and render the sidebar"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX element" errors="settings save errors surfaced in dialog" side_effects="renders DOM, navigation, PATCH /api/admin-data?entity=people, supabase signOut"]
// CIL[DOC-MICRO logic_summary="Reads user roles from useAuth; if support/support_admin/system_admin is present, company nav is rendered; otherwise customer nav. Header shows the Answer Once brand logo (bundled SVG from ../public). Footer shows the signed-in email with a kebab menu: user-settings dialog (edit full_name via admin-data, then refreshUser) and sign-out" notable_decisions="same sidebar component switches nav set by role — routes stay under /answer-once either way; logo is imported so Vite bundles it with the app; logout navigates to /login after clearing the session"]
// CIL[DOC-CONFIDENCE pass="first" score="0.9" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developers"]
export function AnswerOnceSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const appPath = useAppPath()
  const navigate = useNavigate()
  const branding = useBranding()
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

  const roles = user?.roles || []
  const isCompany = roles.includes("support") || roles.includes("support_admin") || roles.includes("system_admin")
  const isAdmin = roles.includes("support_admin") || roles.includes("system_admin")

  const customerNav = [
    { title: "Dashboard", url: appPath("/dashboard"), icon: LayoutDashboard },
    { title: "Tickets", url: appPath("/tickets"), icon: Ticket },
    { title: "Knowledgebase", url: appPath("/kb"), icon: BookOpen },
    { title: "Team", url: appPath("/team"), icon: Users },
  ]

  const companyNav = [
    { title: "Dashboard", url: appPath("/company/dashboard"), icon: LayoutDashboard },
    { title: "Tickets", url: appPath("/company/tickets"), icon: Ticket },
    { title: "Knowledgebase", url: appPath("/company/kb"), icon: BookOpen },
    { title: "Accounts", url: appPath("/company/accounts"), icon: Building2 },
    { title: "Team", url: appPath("/company/team"), icon: Users },
    ...(isAdmin ? [{ title: "Directives", url: appPath("/company/directives"), icon: Compass }] : []),
    { title: "Reporting", url: appPath("/company/reporting"), icon: BarChart3 },
  ]

  const navItems = isCompany ? companyNav : customerNav

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" onClick={() => navigate(appPath("/"))}>
              <a href={appPath("/")}>
                <img src={branding.logo_url} alt={branding.app_name} className="h-11 w-auto" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{isCompany ? "Support" : "Customer"}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
              <label htmlFor="ao-settings-name" className="text-xs font-medium text-muted-foreground">Full name</label>
              <Input
                id="ao-settings-name"
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
// CIL[END stable_id="~/custom/apps/answer-once/components/AnswerOnceSidebar.tsx:AnswerOnceSidebar:component"]
