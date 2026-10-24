// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Sidebar layout module entry point"]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies and export Sidebar components and navigation constants"]
// CIL[DOC-CONTEXT module=".framework/src/components/layout/Sidebar.tsx" layer="ui" related_files=".framework/src/components/ui/popover.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="module exports, imports, and navigation constants" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Sets up the sidebar module and declares navigation arrays" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="engineers"]








import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useBranding } from '../../hooks/useBranding'
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover'
import { 
  Home, 
  Box, 
  Users, 
  Settings, 
  FileText, 
  Sparkles, 
  LogOut, 
  Building2, 
  RefreshCw, 
  Zap, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  X, 
  Link as LinkIcon, 
  User, 
  MoreVertical, 
  ShieldCheck, 
  Key,
  Truck,
  FlaskConical, 
  BarChart3, 
  Bell,
  Cpu,
  BookOpen
} from 'lucide-react'
// CIL[DOC-VECTOR type="context" content="purpose='Sidebar layout module entry point'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/components/ui/popover.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:sidebarprops:interface" type="interface" identity="sidebarprops" parent="~/.framework/src/components/layout/Sidebar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Define Sidebar component props"]
// CIL[DOC-RESPONSIBILITY responsibility="Type-safe contract for Sidebar open state and close callback"]
// CIL[DOC-CONTEXT module=".framework/src/components/layout/Sidebar.tsx" layer="ui" related_files=".framework/src/components/layout/Sidebar.tsx,.framework/src/components/ui/popover.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="open boolean and onClose callback" outputs="SidebarProps interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares open and onClose fields for the Sidebar shell" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface SidebarProps {
  open: boolean
  onClose: () => void
}
// CIL[DOC-VECTOR type="context" content="purpose='Define Sidebar component props'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/components/ui/popover.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:sidebarprops:interface"]



// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:navigation:constant" type="constant" identity="navigation" parent="~/.framework/src/components/layout/Sidebar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Primary navigation links for the sidebar"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide top-level navigation item data"]
// CIL[DOC-CONTEXT module=".framework/src/components/layout/Sidebar.tsx" layer="ui" related_files=".framework/src/components/layout/Sidebar.tsx,.framework/src/components/ui/popover.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="array of navigation entries" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Static constant array of top-level navigation objects with name, href, and icon" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const navigation = [
  { name: 'Dashboard', href: '/spine-framework/admin/configs/types', icon: Home },
]
// CIL[DOC-VECTOR type="context" content="purpose='Primary navigation links for the sidebar'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/components/ui/popover.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:navigation:constant"]





// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:configsnavigation:constant" type="constant" identity="configsnavigation" parent="~/.framework/src/components/layout/Sidebar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Configuration section navigation links"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide navigation data for the admin configuration section"]
// CIL[DOC-CONTEXT module=".framework/src/components/layout/Sidebar.tsx" layer="ui" related_files=".framework/src/components/layout/Sidebar.tsx,.framework/src/components/ui/popover.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="array of config navigation entries" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Static array of config navigation items with dividers and icons" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const configsNavigation = [
  { name: 'Item Types', href: '/spine-framework/admin/configs/types', icon: Box },
  { divider: true },
  { name: 'Apps', href: '/spine-framework/admin/configs/apps', icon: Settings },
  { name: 'Roles', href: '/spine-framework/admin/configs/roles', icon: ShieldCheck },
  { divider: true },
  { name: 'AI Agents', href: '/spine-framework/admin/configs/ai-agents', icon: Sparkles },
  { name: 'Prompt Configs', href: '/spine-framework/admin/configs/prompts', icon: FileText },
  { divider: true },
  { name: 'Pipelines', href: '/spine-framework/admin/configs/pipelines', icon: RefreshCw },
  { name: 'Triggers', href: '/spine-framework/admin/configs/triggers', icon: Zap },
  { name: 'Timers', href: '/spine-framework/admin/configs/timers', icon: Clock },
  { divider: true },
  { name: 'Integrations', href: '/spine-framework/admin/configs/integrations', icon: LinkIcon },
  { name: 'API Keys', href: '/spine-framework/admin/configs/api-keys', icon: Key },
  { name: 'Deliveries', href: '/spine-framework/admin/configs/deliveries', icon: Truck },
] as const
// CIL[DOC-VECTOR type="context" content="purpose='Configuration section navigation links'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/components/ui/popover.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:configsnavigation:constant"]





// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:observabilitynavigation:constant" type="constant" identity="observabilitynavigation" parent="~/.framework/src/components/layout/Sidebar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Observability section navigation links"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide navigation data for the observability section"]
// CIL[DOC-CONTEXT module=".framework/src/components/layout/Sidebar.tsx" layer="ui" related_files=".framework/src/components/layout/Sidebar.tsx,.framework/src/components/ui/popover.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="array of observability navigation entries" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Static array of observability navigation items with icons" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const observabilityNavigation = [
  { name: 'Dashboard', href: '/spine-framework/admin/observability', icon: BarChart3 },
  { name: 'Alerts', href: '/spine-framework/admin/observability/alerts', icon: Bell },
  { name: 'Executions', href: '/spine-framework/admin/observability/executions', icon: FlaskConical },
  { name: 'Logs', href: '/spine-framework/admin/observability/logs', icon: FileText },
]
// CIL[DOC-VECTOR type="context" content="purpose='Observability section navigation links'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/components/ui/popover.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:observabilitynavigation:constant"]





// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:runtimeentities:constant" type="constant" identity="runtimeentities" parent="~/.framework/src/components/layout/Sidebar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Runtime entity navigation links"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide navigation data for runtime entities section"]
// CIL[DOC-CONTEXT module=".framework/src/components/layout/Sidebar.tsx" layer="ui" related_files=".framework/src/components/layout/Sidebar.tsx,.framework/src/components/ui/popover.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="array of runtime entity navigation entries" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Static array of runtime entity navigation items with icons" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const runtimeEntities = [
  { name: 'Items', href: '/spine-framework/admin/runtime/items', icon: Box },
  { name: 'Accounts', href: '/spine-framework/admin/runtime/accounts', icon: Building2 },
  { name: 'People', href: '/spine-framework/admin/runtime/people', icon: User },
  { name: 'Person Types', href: '/spine-framework/admin/runtime/person-types', icon: Users },
]
// CIL[DOC-VECTOR type="context" content="purpose='Runtime entity navigation links'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/components/ui/popover.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:runtimeentities:constant"]





// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:kbenginenavigation:constant" type="constant" identity="kbenginenavigation" parent="~/.framework/src/components/layout/Sidebar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Knowledge base engine navigation links"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide navigation data for the KB engine section"]
// CIL[DOC-CONTEXT module=".framework/src/components/layout/Sidebar.tsx" layer="ui" related_files=".framework/src/components/layout/Sidebar.tsx,.framework/src/components/ui/popover.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="array of KB engine navigation entries" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Static array of KB engine navigation items with icons" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const kbEngineNavigation = [
  { name: 'Knowledge Base', href: '/spine-framework/admin/kb/kb-spine-public', icon: BookOpen },
  { name: 'Embeddings', href: '/spine-framework/admin/kb/embeddings', icon: Cpu },
]
// CIL[DOC-VECTOR type="context" content="purpose='Knowledge base engine navigation links'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/components/ui/popover.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:kbenginenavigation:constant"]


// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:classnames:function" type="function" identity="classnames" parent="~/.framework/src/components/layout/Sidebar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Conditionally combine CSS class strings"]
// CIL[DOC-RESPONSIBILITY responsibility="Filter falsy class values and join remaining classes"]
// CIL[DOC-CONTEXT module=".framework/src/components/layout/Sidebar.tsx" layer="ui" related_files=".framework/src/components/layout/Sidebar.tsx,.framework/src/components/ui/popover.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="classes: (string | false | undefined)[]" outputs="space-delimited className string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Filters truthy values from the input array and joins them with spaces" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-NOTE type="param" content="classes: (string | false | undefined)[] - class values to combine"]
function classNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}





// CIL[DOC-VECTOR type="context" content="purpose='Conditionally combine CSS class strings'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/components/ui/popover.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:classnames:function"]






// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:sidebar:function" type="function" identity="sidebar" parent="~/.framework/src/components/layout/Sidebar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render responsive sidebar shell"]
// CIL[DOC-RESPONSIBILITY responsibility="Display a mobile-friendly sidebar overlay with close controls"]
// CIL[DOC-CONTEXT module=".framework/src/components/layout/Sidebar.tsx" layer="ui" related_files=".framework/src/components/layout/Sidebar.tsx,.framework/src/components/ui/popover.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="open: boolean, onClose: () => void" outputs="JSX sidebar overlay" errors="none" side_effects="renders DOM elements and attaches click handlers"]
// CIL[DOC-MICRO logic_summary="Renders a fixed overlay and panel when open is true, delegating content to SidebarContent" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-NOTE type="param" content="open: boolean - whether the sidebar is open"]
// CIL[DOC-NOTE type="param" content="onClose: () => void - callback to close the sidebar"]
export function Sidebar({ open, onClose }: SidebarProps) {
  const branding = useBranding()
  return (
    <>
      <div className={classNames(open && 'fixed inset-0 z-40 flex')}> 
        {open && (
          <div className="fixed inset-0 z-40 flex">
            <div 
              className="fixed inset-0 bg-black/50 transition-opacity" 
              onClick={onClose}
            />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-sidebar pb-4">
              <div className="absolute right-0 top-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={onClose}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              <div className="h-0 flex-1 overflow-y-auto pt-5">
                <div className="flex flex-shrink-0 items-center gap-2 px-4">
                  <img src={branding.logo_url} alt={branding.app_name} className="h-8 w-auto" />
                  <span className="text-xl font-bold text-sidebar-foreground whitespace-nowrap">{branding.title}</span>
                </div>
                <SidebarContent onNavClick={onClose} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render responsive sidebar shell'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/components/ui/popover.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:sidebar:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:sidebarcontentprops:interface" type="interface" identity="sidebarcontentprops" parent="~/.framework/src/components/layout/Sidebar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Define SidebarContent component props"]
// CIL[DOC-RESPONSIBILITY responsibility="Type-safe contract for optional navigation click handler"]
// CIL[DOC-CONTEXT module=".framework/src/components/layout/Sidebar.tsx" layer="ui" related_files=".framework/src/components/layout/Sidebar.tsx,.framework/src/components/ui/popover.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="optional onNavClick callback" outputs="SidebarContentProps interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares an optional onNavClick callback for navigation items" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface SidebarContentProps {
  onNavClick?: () => void
}
// CIL[DOC-VECTOR type="context" content="purpose='Define SidebarContent component props'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/components/ui/popover.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:sidebarcontentprops:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:sidebarcontent:function" type="function" identity="sidebarcontent" parent="~/.framework/src/components/layout/Sidebar.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render sidebar navigation content"]
// CIL[DOC-RESPONSIBILITY responsibility="Display navigation sections, user info, and logout action"]
// CIL[DOC-CONTEXT module=".framework/src/components/layout/Sidebar.tsx" layer="ui" related_files=".framework/src/components/layout/Sidebar.tsx,.framework/src/components/ui/popover.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="onNavClick?: () => void" outputs="JSX sidebar navigation content" errors="none" side_effects="renders DOM elements, uses React hooks and auth context"]
// CIL[DOC-MICRO logic_summary="Builds navigation groups with collapsible sections and a user popover; uses useLocation, useAuth, and useState" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-NOTE type="param" content="onNavClick?: () => void - optional click handler for navigation links"]
export function SidebarContent({ onNavClick }: SidebarContentProps) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const isSystemAdmin = user?.roles?.includes('system_admin')

  const [configsOpen, setConfigsOpen] = useState(() => 
    location.pathname.includes('/admin/configs')
  )
  const [runtimeOpen, setRuntimeOpen] = useState(() => 
    location.pathname.includes('/admin/runtime')
  )
  const [kbEngineOpen, setKbEngineOpen] = useState(() =>
    location.pathname.includes('/admin/kb')
  )
  const [observabilityOpen, setObservabilityOpen] = useState(() =>
    location.pathname.includes('/admin/observability')
  )

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  return (
    <nav className="mt-5 flex flex-1 flex-col px-2">
      <div className="space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            onClick={onNavClick}
            className={classNames(
              isActive(item.href)
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
            )}
          >
            <item.icon
              className={classNames(
                isActive(item.href) ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground',
                'mr-3 h-5 w-5 flex-shrink-0'
              )}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        ))}
      </div>

      {isSystemAdmin && (
        <>
          <div className="mt-6">
            <button
              onClick={() => setConfigsOpen(!configsOpen)}
              className="flex w-full items-center justify-between px-2 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md"
            >
              <span>Configuration</span>
              {configsOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {configsOpen && (
              <div className="mt-1 space-y-1">
                {configsNavigation.map((item, index) => (
                  'divider' in item ? (
                    <div key={`divider-${index}`} className="my-2 border-t border-sidebar-border" />
                  ) : (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onNavClick}
                      className={classNames(
                        isActive(item.href)
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        'group flex items-center rounded-md px-2 py-2 text-sm font-medium pl-4'
                      )}
                    >
                      <item.icon
                        className={classNames(
                          isActive(item.href) ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground',
                          'mr-3 h-4 w-4 flex-shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  )
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={() => setRuntimeOpen(!runtimeOpen)}
              className="flex w-full items-center justify-between px-2 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md"
            >
              <span>Data</span>
              {runtimeOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {runtimeOpen && (
              <div className="mt-1 space-y-1">
                {runtimeEntities.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onNavClick}
                    className={classNames(
                      isActive(item.href)
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      'group flex items-center rounded-md px-2 py-2 text-sm font-medium pl-4'
                    )}
                  >
                    <item.icon
                      className={classNames(
                        isActive(item.href) ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground',
                        'mr-3 h-4 w-4 flex-shrink-0'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={() => setKbEngineOpen(!kbEngineOpen)}
              className="flex w-full items-center justify-between px-2 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md"
            >
              <span>KB Engine</span>
              {kbEngineOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {kbEngineOpen && (
              <div className="mt-1 space-y-1">
                {kbEngineNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onNavClick}
                    className={classNames(
                      isActive(item.href)
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      'group flex items-center rounded-md px-2 py-2 text-sm font-medium pl-4'
                    )}
                  >
                    <item.icon
                      className={classNames(
                        isActive(item.href) ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground',
                        'mr-3 h-4 w-4 flex-shrink-0'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={() => setObservabilityOpen(!observabilityOpen)}
              className="flex w-full items-center justify-between px-2 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md"
            >
              <span>Observability</span>
              {observabilityOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {observabilityOpen && (
              <div className="mt-1 space-y-1">
                {observabilityNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onNavClick}
                    className={classNames(
                      isActive(item.href)
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      'group flex items-center rounded-md px-2 py-2 text-sm font-medium pl-4'
                    )}
                  >
                    <item.icon
                      className={classNames(
                        isActive(item.href) ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground',
                        'mr-3 h-4 w-4 flex-shrink-0'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="mt-auto border-t border-sidebar-border pt-4">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 text-left">
                <p className="truncate text-sm font-medium">{user?.email || 'User'}</p>
              </div>
              <MoreVertical className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56">
            <div className="space-y-1">
              <button
                onClick={() => {
                  logout()
                }}
                className="flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render sidebar navigation content'; No verified external callers; imports: .framework/src/contexts/AuthContext.tsx,.framework/src/components/ui/popover.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:sidebarcontent:function"]