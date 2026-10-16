// CIL[BEGIN stable_id="~/.framework/src/components/ui/pagination.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/pagination.tsx"]
// CIL[DOC-MACRO purpose="Pagination component module header and imports"]
// CIL[DOC-RESPONSIBILITY responsibility="Import React, the cn utility, Button component, and Lucide icons used by the pagination subcomponents"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Module-level imports for the pagination component family" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]
import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"
// CIL[DOC-VECTOR type="context" content="purpose='Pagination component module header and imports'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/pagination.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/pagination.tsx:pagination:function" type="function" identity="pagination" parent="~/.framework/src/components/ui/pagination.tsx"]
// CIL[DOC-MACRO purpose="Render the root pagination navigation wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a styled nav element that hosts pagination controls"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/pagination.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX nav with pagination role and aria-label" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Wraps children in a centered flex nav, merging className via cn" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the root pagination navigation wrapper'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/pagination.tsx:pagination:function"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/pagination.tsx:paginationcontent:function" type="function" identity="paginationcontent" parent="~/.framework/src/components/ui/pagination.tsx"]
// CIL[DOC-MACRO purpose="Render the unordered list that holds pagination items"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a styled ul element for pagination entries"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/pagination.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX ul with flex layout" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a flex ul with a small gap between items, merging className" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the unordered list that holds pagination items'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/pagination.tsx:paginationcontent:function"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/pagination.tsx:paginationitem:function" type="function" identity="paginationitem" parent="~/.framework/src/components/ui/pagination.tsx"]
// CIL[DOC-MACRO purpose="Render a single pagination list item"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a styled li for pagination links or ellipsis"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/pagination.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="...props" outputs="JSX li with data-slot" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders an li with a data-slot and passes remaining props" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a single pagination list item'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/pagination.tsx:paginationitem:function"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/pagination.tsx:paginationlinkprops:type" type="type" identity="paginationlinkprops" parent="~/.framework/src/components/ui/pagination.tsx"]
// CIL[DOC-MACRO purpose="Define props for the PaginationLink subcomponent"]
// CIL[DOC-RESPONSIBILITY responsibility="Type alias combining isActive flag, Button size, and anchor props"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/pagination.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="PaginationLinkProps type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Intersection of isActive, Button size, and a element props" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">
// CIL[DOC-VECTOR type="context" content="purpose='Define props for the PaginationLink subcomponent'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/pagination.tsx:paginationlinkprops:type"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/pagination.tsx:paginationlink:function" type="function" identity="paginationlink" parent="~/.framework/src/components/ui/pagination.tsx"]
// CIL[DOC-MACRO purpose="Render a pagination link button"]
// CIL[DOC-RESPONSIBILITY responsibility="Render an anchor styled as a Button, active state outline variant"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/pagination.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, isActive, size, anchor props" outputs="JSX Button wrapping an a" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses Button asChild; applies outline variant when active, ghost otherwise; passes aria-current" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      asChild
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(className)}
    >
      <a
        aria-current={isActive ? "page" : undefined}
        data-slot="pagination-link"
        data-active={isActive}
        {...props}
      />
    </Button>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a pagination link button'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/pagination.tsx:paginationlink:function"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/pagination.tsx:paginationprevious:function" type="function" identity="paginationprevious" parent="~/.framework/src/components/ui/pagination.tsx"]
// CIL[DOC-MACRO purpose="Render the previous page navigation link"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a left-pointing pagination control with text"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/pagination.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, text, PaginationLink props" outputs="JSX PaginationLink with chevron and text" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defaults text to Previous; renders ChevronLeftIcon and text hidden on small screens" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function PaginationPrevious({
  className,
  text = "Previous",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("pl-2!", className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the previous page navigation link'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/pagination.tsx:paginationprevious:function"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/pagination.tsx:paginationnext:function" type="function" identity="paginationnext" parent="~/.framework/src/components/ui/pagination.tsx"]
// CIL[DOC-MACRO purpose="Render the next page navigation link"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a right-pointing pagination control with text"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/pagination.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, text, PaginationLink props" outputs="JSX PaginationLink with span and chevron" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defaults text to Next; renders span and ChevronRightIcon" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function PaginationNext({
  className,
  text = "Next",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("pr-2!", className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render the next page navigation link'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/pagination.tsx:paginationnext:function"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/pagination.tsx:paginationellipsis:function" type="function" identity="paginationellipsis" parent="~/.framework/src/components/ui/pagination.tsx"]
// CIL[DOC-MACRO purpose="Render an ellipsis placeholder for truncated page ranges"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a decorative More pages indicator"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/pagination.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX span with MoreHorizontalIcon and screen-reader text" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a centered MoreHorizontalIcon with a hidden More pages label" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-7 items-center justify-center [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon
      />
      <span className="sr-only">More pages</span>
    </span>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render an ellipsis placeholder for truncated page ranges'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/pagination.tsx:paginationellipsis:function"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/pagination.tsx:module_exports:module_exports" type="module_exports" identity="module_exports" parent="~/.framework/src/components/ui/pagination.tsx"]
// CIL[DOC-MACRO purpose="Export pagination subcomponents"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose named exports for consumers"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/button.tsx,.framework/src/components/ui/pagination.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports for Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export block for all public pagination symbols" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
// CIL[DOC-VECTOR type="context" content="purpose='Export pagination subcomponents'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/pagination.tsx:module_exports:module_exports"]
