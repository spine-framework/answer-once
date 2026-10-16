// CIL[BEGIN stable_id="~/.framework/src/components/ui/table.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/ui/table.tsx"]
// CIL[DOC-MACRO purpose="Module imports and setup for the table UI components"]
// CIL[DOC-RESPONSIBILITY responsibility="Import React and the cn utility used by table subcomponents"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="" outputs="React and cn imports available to the module" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React and the cn className merge utility from @/lib/utils. No runtime logic." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ui-developers"]
import * as React from "react"

import { cn } from "@/lib/utils"
// CIL[DOC-VECTOR type="context" content="purpose='Module imports and setup for the table UI components'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/table.tsx:Table:component" type="component" identity="Table" parent="~/.framework/src/components/ui/table.tsx"]
// CIL[DOC-MACRO purpose="Renders a table wrapped in a responsive overflow container"]
// CIL[DOC-RESPONSIBILITY responsibility="Render an accessible table element inside a scrollable container with base typography"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional string, props: remaining table element props" outputs="JSX table container" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses cn to merge default w-full, caption-bottom, and text-xs classes with className and spreads remaining table props." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-xs", className)}
        {...props}
      />
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a table wrapped in a responsive overflow container'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table.tsx:Table:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/table.tsx:TableHeader:component" type="component" identity="TableHeader" parent="~/.framework/src/components/ui/table.tsx"]
// CIL[DOC-MACRO purpose="Renders the table header section with row border styling"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the thead element with bottom borders on child rows"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional string, props: remaining thead element props" outputs="JSX thead element" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Applies the default [&_tr]:border-b class plus any custom className and spreads remaining thead props." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the table header section with row border styling'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table.tsx:TableHeader:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/table.tsx:TableBody:component" type="component" identity="TableBody" parent="~/.framework/src/components/ui/table.tsx"]
// CIL[DOC-MACRO purpose="Renders the table body and removes the last row border"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the tbody element while ensuring the final row has no bottom border"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional string, props: remaining tbody element props" outputs="JSX tbody element" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses the last-child selector to remove the bottom border from the final tr and merges any custom className." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the table body and removes the last row border'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table.tsx:TableBody:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/table.tsx:TableFooter:component" type="component" identity="TableFooter" parent="~/.framework/src/components/ui/table.tsx"]
// CIL[DOC-MACRO purpose="Renders the table footer with muted background and row border reset"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the tfoot element with muted styling and last-row border removal"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional string, props: remaining tfoot element props" outputs="JSX tfoot element" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Combines border-t, bg-muted/50, font-medium, and a last-child border reset, then merges className." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders the table footer with muted background and row border reset'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table.tsx:TableFooter:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/table.tsx:TableRow:component" type="component" identity="TableRow" parent="~/.framework/src/components/ui/table.tsx"]
// CIL[DOC-MACRO purpose="Renders a table row with hover, selected, and expanded state styles"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a tr element that responds to hover, selection, and expansion states"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional string, props: remaining tr element props" outputs="JSX tr element" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Combines border-b, hover background, has-aria-expanded, and data-[state=selected] styles using cn." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a table row with hover, selected, and expanded state styles'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table.tsx:TableRow:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/table.tsx:TableHead:component" type="component" identity="TableHead" parent="~/.framework/src/components/ui/table.tsx"]
// CIL[DOC-MACRO purpose="Renders a table header cell with padding, alignment, and checkbox spacing"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a th element with consistent header cell styling"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional string, props: remaining th element props" outputs="JSX th element" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Applies h-10, text-left, align-middle, and removes right padding when a checkbox child is present." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a table header cell with padding, alignment, and checkbox spacing'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table.tsx:TableHead:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/table.tsx:TableCell:component" type="component" identity="TableCell" parent="~/.framework/src/components/ui/table.tsx"]
// CIL[DOC-MACRO purpose="Renders a table data cell with padding, alignment, and checkbox spacing"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a td element with consistent body cell styling"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional string, props: remaining td element props" outputs="JSX td element" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Applies p-2, align-middle, and removes right padding when a checkbox child is present." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a table data cell with padding, alignment, and checkbox spacing'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table.tsx:TableCell:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/table.tsx:TableCaption:component" type="component" identity="TableCaption" parent="~/.framework/src/components/ui/table.tsx"]
// CIL[DOC-MACRO purpose="Renders a table caption with muted small text"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a caption element for the table with muted foreground styling"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className: optional string, props: remaining caption element props" outputs="JSX caption element" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Displays the caption below the table with mt-4, text-xs, and text-muted-foreground styling." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a table caption with muted small text'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table.tsx:TableCaption:component"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table.tsx:exports:variable" type="variable" identity="exports" parent="~/.framework/src/components/ui/table.tsx"]
// CIL[DOC-MACRO purpose="Named exports for the table component set"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose Table and its related subcomponents to consumers"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="n/a" outputs="Named exports of Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, and TableCaption" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Re-exports all table component functions from the module for external import." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
// CIL[DOC-VECTOR type="context" content="purpose='Named exports for the table component set'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table.tsx:exports:variable"]
