// CIL[BEGIN stable_id="~/.framework/src/components/search-form.tsx:use_client:directive" type="directive" identity="use_client" parent="~/.framework/src/components/search-form.tsx"]
// CIL[DOC-MACRO purpose="Declares this file as a client component for the Next.js runtime."]
// CIL[DOC-RESPONSIBILITY responsibility="Instructs the bundler to execute this module in the browser, not on the server."]
// CIL[DOC-CONTEXT module="search-form" layer="component" related_files=".framework/src/components/search-form.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="Sets module bundler runtime context."]
// CIL[DOC-MICRO logic_summary="'use client' directive only." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
"use client"

// CIL[DOC-VECTOR type="context" content="purpose='Declares this file as a client component for the Next.js runtime.'; No verified external callers; imports: .framework/src/components/ui/label.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/search-form.tsx:use_client:directive"]

// CIL[BEGIN stable_id="~/.framework/src/components/search-form.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/search-form.tsx"]
// CIL[DOC-MACRO purpose="Imports dependencies for the SearchForm UI component."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide React and UI component imports used by SearchForm."]
// CIL[DOC-CONTEXT module="search-form" layer="component" related_files=".framework/src/components/ui/label.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="Loads external modules."]
// CIL[DOC-MICRO logic_summary="Imports Label, SidebarGroup, SidebarInput primitives, and the SearchIcon from lucide-react." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
import { Label } from "./ui/label"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "./ui/sidebar"
import { SearchIcon } from "lucide-react"

// CIL[DOC-VECTOR type="context" content="purpose='Imports dependencies for the SearchForm UI component.'; No verified external callers; imports: .framework/src/components/ui/label.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/search-form.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/search-form.tsx:SearchForm:component" type="component" identity="SearchForm" parent="~/.framework/src/components/search-form.tsx"]
// CIL[DOC-MACRO purpose="Renders a search input form for the sidebar."]
// CIL[DOC-RESPONSIBILITY responsibility="Display an accessible search field with a hidden label and search icon."]
// CIL[DOC-CONTEXT module="search-form" layer="component" related_files=".framework/src/components/search-form.tsx,.framework/src/components/ui/label.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-CONTRACT inputs="props: React.ComponentProps<'form'>" outputs="JSX form with a styled search input and icon" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Spreads form props and renders a sidebar-styled input, sr-only label, and lucide SearchIcon." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Search the docs..."
            className="pl-8"
          />
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  )
}

// CIL[DOC-VECTOR type="context" content="purpose='Renders a search input form for the sidebar.'; No verified external callers; imports: .framework/src/components/ui/label.tsx,.framework/src/components/ui/sidebar.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/search-form.tsx:SearchForm:component"]
