// CIL[BEGIN stable_id="~/.framework/src/components/ui/breadcrumb.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Provides the set of breadcrumb UI primitives for navigation patterns."]
// CIL[DOC-RESPONSIBILITY responsibility="Imports required dependencies and exports the breadcrumb component set."]
// CIL[DOC-CONTEXT module="ui/breadcrumb" layer="components/ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="N/A" errors="N/A" side_effects="N/A"]
// CIL[DOC-MICRO logic_summary="Imports React, radix Slot, local utils, and Lucide icons." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="frontend-developers, ui-consumers"]
import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='Provides the set of breadcrumb UI primitives for navigation patterns.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/breadcrumb.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/breadcrumb.tsx:breadcrumb:function" type="function" identity="Breadcrumb" parent="~/.framework/src/components/ui/breadcrumb.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a semantic <nav> wrapper for breadcrumb navigation."]
// CIL[DOC-RESPONSIBILITY responsibility="Wraps children in a nav element with an accessible aria-label."]
// CIL[DOC-CONTEXT module="ui/breadcrumb" layer="components/ui" related_files=".framework/src/components/ui/breadcrumb.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, props: React.ComponentProps<'nav'>" outputs="JSX.Element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Returns a nav element with aria-label=breadcrumb and merged className via cn." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn(className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a semantic <nav> wrapper for breadcrumb navigation.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/breadcrumb.tsx:breadcrumb:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/breadcrumb.tsx:breadcrumblist:function" type="function" identity="BreadcrumbList" parent="~/.framework/src/components/ui/breadcrumb.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the ordered list of breadcrumb items."]
// CIL[DOC-RESPONSIBILITY responsibility="Displays an ordered list styled for breadcrumb navigation."]
// CIL[DOC-CONTEXT module="ui/breadcrumb" layer="components/ui" related_files=".framework/src/components/ui/breadcrumb.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, props: React.ComponentProps<'ol'>" outputs="JSX.Element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Returns an ol element with flex wrap and muted-foreground styling." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-xs/relaxed wrap-break-word text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the ordered list of breadcrumb items.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/breadcrumb.tsx:breadcrumblist:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/breadcrumb.tsx:breadcrumbitem:function" type="function" identity="BreadcrumbItem" parent="~/.framework/src/components/ui/breadcrumb.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a single item in the breadcrumb list."]
// CIL[DOC-RESPONSIBILITY responsibility="Represents one breadcrumb entry as an inline list item."]
// CIL[DOC-CONTEXT module="ui/breadcrumb" layer="components/ui" related_files=".framework/src/components/ui/breadcrumb.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, props: React.ComponentProps<'li'>" outputs="JSX.Element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Returns an li element with inline-flex gap styling." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a single item in the breadcrumb list.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/breadcrumb.tsx:breadcrumbitem:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/breadcrumb.tsx:breadcrumblink:function" type="function" identity="BreadcrumbLink" parent="~/.framework/src/components/ui/breadcrumb.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a clickable link within a breadcrumb item."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides a navigational link or slottable anchor for a breadcrumb item."]
// CIL[DOC-CONTEXT module="ui/breadcrumb" layer="components/ui" related_files=".framework/src/components/ui/breadcrumb.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="asChild?: boolean, className?: string, props: React.ComponentProps<'a'>" outputs="JSX.Element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Selects between Slot.Root or an a tag based on asChild, applies hover classes." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a clickable link within a breadcrumb item.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/breadcrumb.tsx:breadcrumblink:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/breadcrumb.tsx:breadcrumbpage:function" type="function" identity="BreadcrumbPage" parent="~/.framework/src/components/ui/breadcrumb.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders the current page segment in a breadcrumb."]
// CIL[DOC-RESPONSIBILITY responsibility="Displays the active page with current-page semantics."]
// CIL[DOC-CONTEXT module="ui/breadcrumb" layer="components/ui" related_files=".framework/src/components/ui/breadcrumb.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, props: React.ComponentProps<'span'>" outputs="JSX.Element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Returns a span with role=link, aria-current=page, and foreground styling." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the current page segment in a breadcrumb.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/breadcrumb.tsx:breadcrumbpage:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/breadcrumb.tsx:breadcrumbseparator:function" type="function" identity="BreadcrumbSeparator" parent="~/.framework/src/components/ui/breadcrumb.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a visual separator between breadcrumb items."]
// CIL[DOC-RESPONSIBILITY responsibility="Separates breadcrumb items with a chevron icon."]
// CIL[DOC-CONTEXT module="ui/breadcrumb" layer="components/ui" related_files=".framework/src/components/ui/breadcrumb.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="children?: React.ReactNode, className?: string, props: React.ComponentProps<'li'>" outputs="JSX.Element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Returns an li with role=presentation, renders ChevronRightIcon by default." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? (
        <ChevronRightIcon />
      )}
    </li>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a visual separator between breadcrumb items.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/breadcrumb.tsx:breadcrumbseparator:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/breadcrumb.tsx:breadcrumbellipsis:function" type="function" identity="BreadcrumbEllipsis" parent="~/.framework/src/components/ui/breadcrumb.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Renders a collapsed-overflow indicator for long breadcrumbs."]
// CIL[DOC-RESPONSIBILITY responsibility="Indicates collapsed breadcrumb items while preserving screen-reader text."]
// CIL[DOC-CONTEXT module="ui/breadcrumb" layer="components/ui" related_files=".framework/src/components/ui/breadcrumb.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className?: string, props: React.ComponentProps<'span'>" outputs="JSX.Element" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Returns a span with MoreHorizontalIcon and an sr-only More label." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex size-4 items-center justify-center [&>svg]:size-3.5",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon
      />
      <span className="sr-only">More</span>
    </span>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a collapsed-overflow indicator for long breadcrumbs.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/breadcrumb.tsx:breadcrumbellipsis:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/breadcrumb.tsx:module_exports:module_exports" type="module_exports" identity="module_exports" parent="~/.framework/src/components/ui/breadcrumb.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Re-exports the public breadcrumb component set for consumers."]
// CIL[DOC-RESPONSIBILITY responsibility="Exposes named component exports from the breadcrumb module."]
// CIL[DOC-CONTEXT module="ui/breadcrumb" layer="components/ui" related_files=".framework/src/components/ui/breadcrumb.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="N/A" outputs="Named component exports" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Lists the named component exports in a single export block." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
// CIL[DOC-VECTOR type="context" content="purpose='Re-exports the public breadcrumb component set for consumers.'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/breadcrumb.tsx:module_exports:module_exports"]
