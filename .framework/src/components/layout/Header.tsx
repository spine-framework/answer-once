// CIL[BEGIN stable_id="~/.framework/src/components/layout/Header.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/layout/Header.tsx"]
// CIL[DOC-MACRO purpose="Header UI component module imports and setup"]
// CIL[DOC-RESPONSIBILITY responsibility="Import menu, search and notification icons and the User type"]
// CIL[DOC-CONTEXT module="components/layout" layer="ui" related_files=".framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports iconography from lucide-react and heroicons plus the auth User type for the Header component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
import { Menu, Bell } from 'lucide-react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { User } from '../../types/auth'
// CIL[DOC-VECTOR type="context" content="purpose='Header UI component module imports and setup'; No verified external callers; imports: .framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Header.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/layout/Header.tsx:headerprops:interface" type="interface" identity="HeaderProps" parent="~/.framework/src/components/layout/Header.tsx"]
// CIL[DOC-MACRO purpose="Define the prop contract for the Header component"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe the onMenuClick callback and the user object expected by Header"]
// CIL[DOC-CONTEXT module="components/layout" layer="ui" related_files=".framework/src/components/layout/Header.tsx,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="onMenuClick: callback, user: User | null" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="TypeScript interface that types the Header component props for menu click and user display" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface HeaderProps {
  onMenuClick: () => void
  user: User | null
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the prop contract for the Header component'; No verified external callers; imports: .framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Header.tsx:headerprops:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/layout/Header.tsx:header:function" type="function" identity="Header" parent="~/.framework/src/components/layout/Header.tsx"]
// CIL[DOC-MACRO purpose="Render the application header with navigation, search, notifications and user profile"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a sticky top navigation bar with mobile menu button, search input, notification bell and user avatar"]
// CIL[DOC-CONTEXT module="components/layout" layer="ui" related_files=".framework/src/components/layout/Header.tsx,.framework/src/types/auth.ts"]
// CIL[DOC-CONTRACT inputs="onMenuClick: () => void, user: User | null" outputs="JSX header element" errors="none" side_effects="renders interactive UI elements; does not manage state"]
// CIL[DOC-MICRO logic_summary="Renders a sticky flex header with menu button, search input, notifications and user profile display using optional user name initials" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function Header({ onMenuClick, user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 lg:pl-72 lg:pr-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
              </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-48 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-accent-blue focus:bg-white focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
          />
        </div>

        <button
          className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-medium text-white">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
          </div>
          <span className="hidden sm:block text-sm font-medium text-slate-700">
            {user?.full_name}
          </span>
        </div>
      </div>
    </header>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the application header with navigation, search, notifications and user profile'; No verified external callers; imports: .framework/src/types/auth.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Header.tsx:header:function"]
