// CIL[BEGIN stable_id="~/.framework/src/components/admin/SortableTableHeader.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Module header for the SortableTableHeader component: imports React, ChevronUp/ChevronDown icons, and the TableHead UI primitive"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare module-level imports required by the SortableTableHeader component"]
// CIL[DOC-CONTEXT module="admin" layer="presentation" related_files=".framework/src/components/ui/table.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, ChevronUp/ChevronDown icons from lucide-react, and the TableHead component from shadcn table primitives" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="admin developers"]
import React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { TableHead } from '../ui/table'
// CIL[DOC-VECTOR type="context" content="purpose='Module header for the SortableTableHeader component: imports React, ChevronUp/ChevronDown icons, and the TableHead UI primitive'; No verified external callers; imports: .framework/src/components/ui/table.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/SortableTableHeader.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/admin/SortableTableHeader.tsx:sortabletableheaderprops:interface" type="interface" identity="SortableTableHeaderProps" parent="SortableTableHeader"]
// CIL[DOC-MACRO purpose="Props interface for the SortableTableHeader clickable table header component"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the typed contract consumed by SortableTableHeader"]
// CIL[DOC-CONTEXT module="admin" layer="presentation" related_files=".framework/src/components/admin/SortableTableHeader.tsx,.framework/src/components/ui/table.tsx"]
// CIL[DOC-CONTRACT inputs="title: string; sortKey: string; currentSortKey?: string; currentSortDirection?: 'asc' | 'desc'; onSort: (key: string) => void" outputs="interface type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes props for a sortable column header including the current sort key, direction, and click handler" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface SortableTableHeaderProps {
  title: string
  sortKey: string
  currentSortKey?: string
  currentSortDirection?: 'asc' | 'desc'
  onSort: (key: string) => void
}
// CIL[DOC-VECTOR type="context" content="purpose='Props interface for the SortableTableHeader clickable table header component'; No verified external callers; imports: .framework/src/components/ui/table.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/SortableTableHeader.tsx:sortabletableheaderprops:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/admin/SortableTableHeader.tsx:sortabletableheader:function" type="function" identity="SortableTableHeader" parent=""]
// CIL[DOC-MACRO purpose="Renders a clickable table header cell that shows an ascending or descending sort indicator when active"]
// CIL[DOC-RESPONSIBILITY responsibility="Render a sortable table column header with a visual direction indicator"]
// CIL[DOC-CONTEXT module="admin" layer="presentation" related_files=".framework/src/components/admin/SortableTableHeader.tsx,.framework/src/components/ui/table.tsx"]
// CIL[DOC-CONTRACT inputs="title: string, sortKey: string, currentSortKey?: string, currentSortDirection?: 'asc' | 'desc', onSort: (key: string) => void" outputs="JSX TableHead component with optional ChevronUp/ChevronDown icon" errors="none" side_effects="invokes onSort callback when the header is clicked"]
// CIL[DOC-MICRO logic_summary="Computes whether this column is the active sort and the current ascending state, then renders a clickable TableHead with a chevron icon when sorted" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function SortableTableHeader({
  title,
  sortKey,
  currentSortKey,
  currentSortDirection,
  onSort,
}: SortableTableHeaderProps) {
  const isSorted = currentSortKey === sortKey
  const isAscending = currentSortDirection === 'asc'

  return (
    <TableHead
      className="cursor-pointer"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span>{title}</span>
        {isSorted && (
          <span className="inline-flex">
            {isAscending ? (
              <ChevronUp className="h-4 w-4 text-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-foreground" />
            )}
          </span>
        )}
      </div>
    </TableHead>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a clickable table header cell that shows an ascending or descending sort indicator when active'; No verified external callers; imports: .framework/src/components/ui/table.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/SortableTableHeader.tsx:sortabletableheader:function"]
