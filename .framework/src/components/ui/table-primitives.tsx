











// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Provides styled React table primitive components for use across the UI"]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies and export the table component set"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import React and cn utility, then re-export all table subcomponents" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ui-developers,framework"]

import * as React from 'react'
import { cn } from '../../lib/utils'
// CIL[DOC-VECTOR type="context" content="purpose='Provides styled React table primitive components for use across the UI'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:table:constant" type="constant" identity="table" parent="module_header"]
// CIL[DOC-MACRO purpose="Renders a scrollable table wrapper with merged class names"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the root Table component"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX table element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forward ref to an overflow-auto div containing a styled table" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
))
// CIL[DOC-VECTOR type="context" content="purpose='Renders a scrollable table wrapper with merged class names'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:table:constant"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:table_display_name:assignment" type="assignment" identity="table_display_name" parent="module_header"]
// CIL[DOC-MACRO purpose="Assigns a human-readable display name to Table"]
// CIL[DOC-RESPONSIBILITY responsibility="Set Table.displayName for debugging"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="display name string" outputs="Table.displayName assignment" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assign the PascalCase name to the component's displayName property" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

Table.displayName = 'Table'
// CIL[DOC-VECTOR type="context" content="purpose='Assigns a human-readable display name to Table'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:table_display_name:assignment"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:tableheader:constant" type="constant" identity="tableheader" parent="module_header"]
// CIL[DOC-MACRO purpose="Renders the table header section with row border styling"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the TableHeader component"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX thead element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forward ref to a styled thead with bottom border on rows" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
))
// CIL[DOC-VECTOR type="context" content="purpose='Renders the table header section with row border styling'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:tableheader:constant"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:tableheader_display_name:assignment" type="assignment" identity="tableheader_display_name" parent="module_header"]
// CIL[DOC-MACRO purpose="Assigns a human-readable display name to TableHeader"]
// CIL[DOC-RESPONSIBILITY responsibility="Set TableHeader.displayName for debugging"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="display name string" outputs="TableHeader.displayName assignment" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assign the PascalCase name to the component's displayName property" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

TableHeader.displayName = 'TableHeader'
// CIL[DOC-VECTOR type="context" content="purpose='Assigns a human-readable display name to TableHeader'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:tableheader_display_name:assignment"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablebody:constant" type="constant" identity="tablebody" parent="module_header"]
// CIL[DOC-MACRO purpose="Renders the table body with last-row border removal"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the TableBody component"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX tbody element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forward ref to a styled tbody and remove border from the last row" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
))
// CIL[DOC-VECTOR type="context" content="purpose='Renders the table body with last-row border removal'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablebody:constant"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablebody_display_name:assignment" type="assignment" identity="tablebody_display_name" parent="module_header"]
// CIL[DOC-MACRO purpose="Assigns a human-readable display name to TableBody"]
// CIL[DOC-RESPONSIBILITY responsibility="Set TableBody.displayName for debugging"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="display name string" outputs="TableBody.displayName assignment" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assign the PascalCase name to the component's displayName property" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

TableBody.displayName = 'TableBody'
// CIL[DOC-VECTOR type="context" content="purpose='Assigns a human-readable display name to TableBody'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablebody_display_name:assignment"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablefooter:constant" type="constant" identity="tablefooter" parent="module_header"]
// CIL[DOC-MACRO purpose="Renders the table footer with top border and muted background"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the TableFooter component"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX tfoot element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forward ref to a styled tfoot with top border and muted background" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
      className
    )}
    {...props}
  />
))
// CIL[DOC-VECTOR type="context" content="purpose='Renders the table footer with top border and muted background'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablefooter:constant"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablefooter_display_name:assignment" type="assignment" identity="tablefooter_display_name" parent="module_header"]
// CIL[DOC-MACRO purpose="Assigns a human-readable display name to TableFooter"]
// CIL[DOC-RESPONSIBILITY responsibility="Set TableFooter.displayName for debugging"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="display name string" outputs="TableFooter.displayName assignment" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assign the PascalCase name to the component's displayName property" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

TableFooter.displayName = 'TableFooter'
// CIL[DOC-VECTOR type="context" content="purpose='Assigns a human-readable display name to TableFooter'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablefooter_display_name:assignment"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablerow:constant" type="constant" identity="tablerow" parent="module_header"]
// CIL[DOC-MACRO purpose="Renders a table row with hover and selected states"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the TableRow component"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX tr element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forward ref to a styled tr with hover and data-selected states" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className
    )}
    {...props}
  />
))
// CIL[DOC-VECTOR type="context" content="purpose='Renders a table row with hover and selected states'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablerow:constant"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablerow_display_name:assignment" type="assignment" identity="tablerow_display_name" parent="module_header"]
// CIL[DOC-MACRO purpose="Assigns a human-readable display name to TableRow"]
// CIL[DOC-RESPONSIBILITY responsibility="Set TableRow.displayName for debugging"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="display name string" outputs="TableRow.displayName assignment" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assign the PascalCase name to the component's displayName property" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

TableRow.displayName = 'TableRow'
// CIL[DOC-VECTOR type="context" content="purpose='Assigns a human-readable display name to TableRow'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablerow_display_name:assignment"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablehead:constant" type="constant" identity="tablehead" parent="module_header"]
// CIL[DOC-MACRO purpose="Renders a styled table header cell with checkbox padding handling"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the TableHead component"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX th element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forward ref to a styled th with reduced padding for checkboxes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
))
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled table header cell with checkbox padding handling'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablehead:constant"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablehead_display_name:assignment" type="assignment" identity="tablehead_display_name" parent="module_header"]
// CIL[DOC-MACRO purpose="Assigns a human-readable display name to TableHead"]
// CIL[DOC-RESPONSIBILITY responsibility="Set TableHead.displayName for debugging"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="display name string" outputs="TableHead.displayName assignment" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assign the PascalCase name to the component's displayName property" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

TableHead.displayName = 'TableHead'
// CIL[DOC-VECTOR type="context" content="purpose='Assigns a human-readable display name to TableHead'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablehead_display_name:assignment"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablecell:constant" type="constant" identity="tablecell" parent="module_header"]
// CIL[DOC-MACRO purpose="Renders a styled table data cell with checkbox padding handling"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the TableCell component"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX td element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forward ref to a styled td with reduced padding for checkboxes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
    {...props}
  />
))
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled table data cell with checkbox padding handling'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablecell:constant"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablecell_display_name:assignment" type="assignment" identity="tablecell_display_name" parent="module_header"]
// CIL[DOC-MACRO purpose="Assigns a human-readable display name to TableCell"]
// CIL[DOC-RESPONSIBILITY responsibility="Set TableCell.displayName for debugging"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="display name string" outputs="TableCell.displayName assignment" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assign the PascalCase name to the component's displayName property" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

TableCell.displayName = 'TableCell'
// CIL[DOC-VECTOR type="context" content="purpose='Assigns a human-readable display name to TableCell'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablecell_display_name:assignment"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablecaption:constant" type="constant" identity="tablecaption" parent="module_header"]
// CIL[DOC-MACRO purpose="Renders a styled table caption with muted foreground"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the TableCaption component"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="className, ...props" outputs="JSX caption element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Forward ref to a styled caption with top margin and muted text" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
))
// CIL[DOC-VECTOR type="context" content="purpose='Renders a styled table caption with muted foreground'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablecaption:constant"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablecaption_display_name:assignment" type="assignment" identity="tablecaption_display_name" parent="module_header"]
// CIL[DOC-MACRO purpose="Assigns a human-readable display name to TableCaption"]
// CIL[DOC-RESPONSIBILITY responsibility="Set TableCaption.displayName for debugging"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="display name string" outputs="TableCaption.displayName assignment" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Assign the PascalCase name to the component's displayName property" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

TableCaption.displayName = 'TableCaption'
// CIL[DOC-VECTOR type="context" content="purpose='Assigns a human-readable display name to TableCaption'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:tablecaption_display_name:assignment"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/table-primitives.tsx:module_exports:module_exports" type="module_exports" identity="module_exports" parent="module_header"]
// CIL[DOC-MACRO purpose="Re-exports all table primitive components"]
// CIL[DOC-RESPONSIBILITY responsibility="Expose the table subcomponents for consumers"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/table-primitives.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="named exports of table primitives" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Named export block listing every table primitive component" notable_decisions="[]"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Re-exports all table primitive components'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/table-primitives.tsx:module_exports:module_exports"]
