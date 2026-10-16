// CIL[BEGIN stable_id="~/.framework/src/components/layout/Layout.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/layout/Layout.tsx"]
// CIL[DOC-MACRO purpose="Module imports and top-level declarations for the Layout component."]
// CIL[DOC-RESPONSIBILITY responsibility="Declare dependencies and types used by the Layout component."]
// CIL[DOC-CONTEXT module="components/layout" layer="ui" related_files=".framework/src/components/layout/Sidebar.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Imports React, useState, Sidebar/SidebarContent, useAuth and useLocation." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ai, developers"]

import React, { useState } from 'react'
import { Sidebar, SidebarContent } from './Sidebar'
import { useAuth } from '../../contexts/AuthContext'
import { useLocation } from 'react-router-dom'
// CIL[DOC-VECTOR type="context" content="purpose='Module imports and top-level declarations for the Layout component.'; No verified external callers; imports: .framework/src/components/layout/Sidebar.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Layout.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/layout/Layout.tsx:layoutprops:interface" type="interface" identity="LayoutProps" parent="~/.framework/src/components/layout/Layout.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Define the props contract for the Layout component."]
// CIL[DOC-RESPONSIBILITY responsibility="Type the children prop for the Layout component."]
// CIL[DOC-CONTEXT module="components/layout" layer="ui" related_files=".framework/src/components/layout/Layout.tsx,.framework/src/components/layout/Sidebar.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="LayoutProps interface" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Declares a single children prop of type React.ReactNode." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface LayoutProps {
  children: React.ReactNode
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the props contract for the Layout component.'; No verified external callers; imports: .framework/src/components/layout/Sidebar.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Layout.tsx:layoutprops:interface"]


// CIL[BEGIN stable_id="~/.framework/src/components/layout/Layout.tsx:layout:function" type="function" identity="Layout" parent="~/.framework/src/components/layout/Layout.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render the responsive application shell with sidebar and main content."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the application layout wrapper, manage sidebar visibility, and render responsive navigation and main content."]
// CIL[DOC-CONTEXT module="components/layout" layer="ui" related_files=".framework/src/components/layout/Layout.tsx,.framework/src/components/layout/Sidebar.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-CONTRACT inputs="children: React.ReactNode" outputs="JSX layout structure" errors="None" side_effects="Updates local sidebarOpen state; consumes useAuth and useLocation hooks."]
// CIL[DOC-MICRO logic_summary="Computes active route, conditionally renders mobile overlay and sidebar, and renders a responsive main content area." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + '/')

  return (
    <div className="min-h-screen bg-[#F2F3F8] flex lg:top-0">
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
      )}

      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-60 lg:flex-col lg:shrink-0 bg-white border-r border-slate-200 lg:top-0">
        <SidebarContent
          isActive={isActive}
          user={user}
          logout={logout}
          onClose={() => {}}
        />
      </aside>

      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <img src="/spine-logo.svg" alt="Spine Framework" className="h-8 w-auto" />
          <span className="text-lg font-semibold tracking-tight text-slate-900 whitespace-nowrap">Spine Framework</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the responsive application shell with sidebar and main content.'; No verified external callers; imports: .framework/src/components/layout/Sidebar.tsx,.framework/src/contexts/AuthContext.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/layout/Layout.tsx:layout:function"]
