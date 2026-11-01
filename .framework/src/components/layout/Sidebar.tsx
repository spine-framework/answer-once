// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/layout/Sidebar.tsx"]
/**
 * @module   Sidebar
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * The Sidebar component provides a navigational interface for users, allowing them to access various sections of the application. It integrates with authentication and branding contexts to dynamically render links based on user permissions and branding settings.
 * INVARIANT: The user must be authenticated to access certain links.
 *
 * @seeAlso AuthContext.tsx (provides authentication context for user access control).
 * @seeAlso useBranding.ts (handles branding logic for the application).
 * @seeAlso Popover.tsx (used for displaying additional options in the sidebar).
 *
 * @cil-generated
 */

















import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useBranding } from '../../hooks/useBranding'
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover'
import { 
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:module_header:module_header"]
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















// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:SidebarProps:interface" type="interface" identity="SidebarProps" parent="~/.framework/src/components/layout/Sidebar.tsx"]
/**
 * SidebarProps defines the properties required for the Sidebar component, managing its open state and close action. This interface ensures that the Sidebar can be controlled effectively by its parent component.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface SidebarProps {
  open: boolean
  onClose: () => void
}
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:SidebarProps:interface"]


















// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:navigation:constant" type="constant" identity="navigation" parent="~/.framework/src/components/layout/Sidebar.tsx"]
/**
 * The 'navigation' constant defines the structure of the sidebar navigation items for the application. It provides a consistent way to manage and render navigation links within the sidebar component.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const navigation = [
  { name: 'Dashboard', href: '/spine-framework/admin/configs/types', icon: Home },
]
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:navigation:constant"]




















// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:configsNavigation:constant" type="constant" identity="configsNavigation" parent="~/.framework/src/components/layout/Sidebar.tsx"]
/**
 * The 'configsNavigation' constant defines a structured navigation menu for the admin configuration section of the application. It organizes various configuration items into a list, including dividers for better visual separation.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:configsNavigation:constant"]




















// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:observabilityNavigation:constant" type="constant" identity="observabilityNavigation" parent="~/.framework/src/components/layout/Sidebar.tsx"]
/**
 * The 'observabilityNavigation' constant defines a structured array of navigation items for the observability section of the application. It provides links to various observability features such as Dashboard, Alerts, Executions, and Logs.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const observabilityNavigation = [
  { name: 'Dashboard', href: '/spine-framework/admin/observability', icon: BarChart3 },
  { name: 'Alerts', href: '/spine-framework/admin/observability/alerts', icon: Bell },
  { name: 'Executions', href: '/spine-framework/admin/observability/executions', icon: FlaskConical },
  { name: 'Logs', href: '/spine-framework/admin/observability/logs', icon: FileText },
]
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:observabilityNavigation:constant"]




















// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:runtimeEntities:constant" type="constant" identity="runtimeEntities" parent="~/.framework/src/components/layout/Sidebar.tsx"]
/**
 * The constant 'runtimeEntities' defines a list of navigational items for the sidebar in the application. Each item includes a name, a link, and an associated icon for user interface representation.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const runtimeEntities = [
  { name: 'Items', href: '/spine-framework/admin/runtime/items', icon: Box },
  { name: 'Accounts', href: '/spine-framework/admin/runtime/accounts', icon: Building2 },
  { name: 'People', href: '/spine-framework/admin/runtime/people', icon: User },
]
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:runtimeEntities:constant"]




















// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:kbEngineNavigation:constant" type="constant" identity="kbEngineNavigation" parent="~/.framework/src/components/layout/Sidebar.tsx"]
/**
 * The constant 'kbEngineNavigation' defines a navigation structure for the Knowledge Base section of the application. It provides links to key resources within the admin interface.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const kbEngineNavigation = [
  { name: 'Knowledge Base', href: '/spine-framework/admin/kb/kb-spine-public', icon: BookOpen },
  { name: 'Embeddings', href: '/spine-framework/admin/kb/embeddings', icon: Cpu },
]
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:kbEngineNavigation:constant"]


















// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:classNames:function" type="function" identity="classNames" parent="~/.framework/src/components/layout/Sidebar.tsx"]
/**
 * The classNames function constructs a single string from an array of class names, filtering out any falsy values. This utility is useful for dynamically generating class attribute values in JSX components.
 *
 * @macro       Utility function for generating a concatenated class name string.
 * @micro       Filters out falsy values from the input array before joining the remaining class names.
 * @inputSpec
 *   - classes: (string | false | undefined)[] (required) — an array of class names that may include falsy values.
 * @outputSpec  string — a single string of class names separated by spaces.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
function classNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:classNames:function"]




























// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:Sidebar:component" type="component" identity="Sidebar" parent="~/.framework/src/components/layout/Sidebar.tsx"]
/**
 * The Sidebar component renders a collapsible sidebar interface that displays branding and navigation options. It provides users with a navigational aid that can be opened and closed as needed.
 *
 * @macro       UI component responsible for displaying a sidebar with branding and navigation.
 * @micro       Utilizes conditional rendering to display the sidebar based on the 'open' state.
 * @inputSpec
 *   - open: boolean (required) — determines if the sidebar is visible.
 *   - onClose: function (required) — callback function to close the sidebar.
 * @outputSpec  JSX.Element — renders the sidebar UI structure.
 * @sideEffects none
 * @stability   internal
 * @calls       useBranding, SidebarContent
 * @cil-generated
 */
export function Sidebar({ open, onClose }: SidebarProps) {
  const branding = useBranding()
  return (
    <>
      <div className={classNames(open && 'fixed inset-0 z-40 flex')}> 
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:Sidebar:component"]
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
















// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:SidebarContentProps:interface" type="interface" identity="SidebarContentProps" parent="~/.framework/src/components/layout/Sidebar.tsx"]
/**
 * SidebarContentProps defines the properties for the sidebar content component, specifically handling navigation click events. It allows for optional navigation click functionality to be passed in as a prop.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface SidebarContentProps {
  onNavClick?: () => void
}
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:SidebarContentProps:interface"]

















// CIL[BEGIN stable_id="~/.framework/src/components/layout/Sidebar.tsx:SidebarContent:component" type="component" identity="SidebarContent" parent="~/.framework/src/components/layout/Sidebar.tsx"]
/**
 * SidebarContent renders a navigation sidebar that allows users to navigate through different sections of the application and conditionally displays additional configuration options for system administrators.
 *
 * @macro       Navigation component for application sidebar with conditional rendering for admin options.
 * @micro       Utilizes React state to manage the open/closed status of various sections based on the current URL path.
 * @inputSpec
 *   - onNavClick: function (required) — callback function triggered on navigation item click.
 * @outputSpec  JSX.Element — renders the sidebar navigation structure.
 * @sideEffects none
 * @stability   internal
 * @calls       useLocation, useAuth, classNames, Link
 * @cil-generated
 */
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
// CIL[END stable_id="~/.framework/src/components/layout/Sidebar.tsx:SidebarContent:component"]
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






