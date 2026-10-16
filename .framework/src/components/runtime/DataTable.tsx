// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataTable.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/runtime/DataTable.tsx"]
// CIL[DOC-MACRO purpose="Module imports and entry point for the DataTable runtime component"]
// CIL[DOC-RESPONSIBILITY responsibility="Imports dependencies and shared UI primitives used by the DataTable."]
// CIL[DOC-CONTEXT module="components/runtime" layer="component" related_files=".framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, router, types, utilities, and shared UI components required by the runtime data table." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]



import React from 'react'
import { useNavigate } from 'react-router-dom'
import { EntityColumn } from '../../types/types'
import { formatDateTime } from '../../lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { Badge } from '../ui/badge'
import * as Icons from 'lucide-react'

// CIL[DOC-VECTOR type="context" content="purpose='Module imports and entry point for the DataTable runtime component'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/table.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataTable.tsx:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataTable.tsx:DataTableProps:interface" type="interface" identity="DataTableProps" parent="~/.framework/src/components/runtime/DataTable.tsx"]
// CIL[DOC-MACRO purpose="TypeScript props contract for the DataTable component"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the expected properties passed to DataTable, including columns, data, sort handlers, and state flags."]
// CIL[DOC-CONTEXT module="components/runtime" layer="component" related_files=".framework/src/components/runtime/DataTable.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="columns: EntityColumn[], data: any[], loading?: boolean, error?: string|null, onRetry?: () => void, sort, onSort, entity, emptyMessage, emptyIcon" outputs="none (type definition)" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the DataTableProps interface consumed by the DataTable React component." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface DataTableProps {
  columns: EntityColumn[]
  data: any[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  sort: { field: string; direction: 'asc' | 'desc' }
  onSort: (sort: { field: string; direction: 'asc' | 'desc' }) => void
  entity: string
  emptyMessage: string
  emptyIcon: string
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript props contract for the DataTable component'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/table.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataTable.tsx:DataTableProps:interface"]


// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataTable.tsx:DataTable:component" type="component" identity="DataTable" parent="~/.framework/src/components/runtime/DataTable.tsx"]
// CIL[DOC-MACRO purpose="Renders a sortable, clickable data table for runtime records with loading, error, and empty states"]
// CIL[DOC-RESPONSIBILITY responsibility="Displays tabular data, handles sorting, row navigation, and loading/error/empty UI states."]
// CIL[DOC-CONTEXT module="components/runtime" layer="component" related_files=".framework/src/components/runtime/DataTable.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="columns, data, loading, error, onRetry, sort, onSort, entity, emptyMessage, emptyIcon (destructured from DataTableProps)" outputs="JSX rendering of a Card containing a Table or state-specific fallback" errors="Throws no errors; displays an error state when the error prop is provided" side_effects="Calls useNavigate to route to detail views on row click"]
// CIL[DOC-MICRO logic_summary="Renders skeleton, error, empty, or table views; uses renderCell to format timestamp, badge, and truncated text; handles ascending/descending sort and row navigation." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function DataTable({ 
  columns, 
  data, 
  loading, 
  error, 
  onRetry,
  sort,
  onSort,
  entity,
  emptyMessage,
  emptyIcon 
}: DataTableProps) {
  const navigate = useNavigate()
  const EmptyIconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[emptyIcon] || Icons.Box
  
  const handleSort = (key: string) => {
    if (sort.field === key) {
      onSort({ 
        field: key, 
        direction: sort.direction === 'asc' ? 'desc' : 'asc' 
      })
    } else {
      onSort({ field: key, direction: 'asc' })
    }
  }
  
  const getSortIcon = (key: string) => {
    if (sort.field !== key) {
      return <Icons.ArrowUpDown className="h-4 w-4 text-muted-foreground" />
    }
    return sort.direction === 'asc' 
      ? <Icons.ArrowUp className="h-4 w-4 text-primary" />
      : <Icons.ArrowDown className="h-4 w-4 text-primary" />
  }
  
  const renderCell = (column: EntityColumn, row: any) => {
    const value = column.key.includes('.')
      ? column.key.split('.').reduce((obj, k) => obj?.[k], row)
      : row[column.key]
    
    if (column.type === 'timestamp' && value) {
      return formatDateTime(value)
    }
    
    if (column.type === 'badge' && column.badgeColors) {
      const colorClass = column.badgeColors[value?.toString()] || 'bg-muted text-muted-foreground'
      return (
        <Badge variant="secondary" className={colorClass}>
          {value?.toString() || 'Unknown'}
        </Badge>
      )
    }
    
    if (column.maxLength && typeof value === 'string' && value.length > column.maxLength) {
      return value.substring(0, column.maxLength) + '...'
    }
    
    return value?.toString() || '-'
  }
  
  const handleRowClick = (row: any) => {
    navigate(`/spine-framework/admin/runtime/${entity}/${row.id}`)
  }
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </CardContent>
      </Card>
    )
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-destructive">Error: {error}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="mt-4">
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }
  
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <EmptyIconComponent className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">{emptyMessage}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or create a new record
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column.key}
                className={column.sortable ? 'cursor-pointer' : ''}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.label}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer"
              onClick={() => handleRowClick(row)}
            >
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {renderCell(column, row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Renders a sortable, clickable data table for runtime records with loading, error, and empty states'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/lib/utils.ts,.framework/src/components/ui/table.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataTable.tsx:DataTable:component"]
