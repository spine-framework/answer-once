// CIL[BEGIN stable_id="~/.framework/src/components/ui/DataTable.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Provides a reusable DataTable UI component with sorting, searching, filtering, and pagination controls"]
// CIL[DOC-RESPONSIBILITY responsibility="Export the DataTable component and supporting column/props interfaces for use across the UI layer"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="DataTable component and TypeScript interfaces" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Contains default imports, type declarations, and the DataTable component implementation" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer|ai"]












import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { Badge } from './badge'
import { Button } from './button'
import { Search, Filter } from 'lucide-react'
import { cn } from '../../lib/utils'
// CIL[DOC-VECTOR type="context" content="purpose='Provides a reusable DataTable UI component with sorting, searching, filtering, and pagination controls'; No verified external callers; imports: .framework/src/components/ui/table.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/DataTable.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/DataTable.tsx:TableColumn:interface" type="interface" identity="TableColumn" parent="none"]
// CIL[DOC-MACRO purpose="Define the base column configuration contract for a generic DataTable"]
// CIL[DOC-RESPONSIBILITY responsibility="Describe a single table column with key, title, optional renderer and sort flag"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="TableColumn<T> type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Base generic interface for a table column" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface TableColumn<T> {
  key: keyof T | string
  title: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the base column configuration contract for a generic DataTable'; No verified external callers; imports: .framework/src/components/ui/table.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/DataTable.tsx:TableColumn:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/DataTable.tsx:DataTableColumn:interface" type="interface" identity="DataTableColumn" parent="none"]
// CIL[DOC-MACRO purpose="Extend TableColumn with filter-specific properties for the DataTable"]
// CIL[DOC-RESPONSIBILITY responsibility="Add filterable flag and filter options to a table column"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="DataTableColumn<T> type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="DataTable column interface extending TableColumn with filtering support" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface DataTableColumn<T> extends TableColumn<T> {
  filterable?: boolean
  filterOptions?: Array<{ value: string; label: string }>
}
// CIL[DOC-VECTOR type="context" content="purpose='Extend TableColumn with filter-specific properties for the DataTable'; No verified external callers; imports: .framework/src/components/ui/table.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/DataTable.tsx:DataTableColumn:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/DataTable.tsx:DataTableProps:interface" type="interface" identity="DataTableProps" parent="none"]
// CIL[DOC-MACRO purpose="Define the prop contract for the DataTable component"]
// CIL[DOC-RESPONSIBILITY responsibility="List all configurable props including data, columns, pagination, sort, search, filter, and callbacks"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="DataTableProps<T> type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Props interface for the DataTable component" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  filterable?: boolean
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    onPageChange: (page: number) => void
    onItemsPerPageChange: (itemsPerPage: number) => void
  }
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void
  sortColumn?: keyof T
  sortDirection?: 'asc' | 'desc'
  onRowClick?: (item: T) => void
  onSearch?: (query: string) => void
  onFilter?: (filters: Record<string, any>) => void
  emptyMessage?: string
  className?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the prop contract for the DataTable component'; No verified external callers; imports: .framework/src/components/ui/table.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/DataTable.tsx:DataTableProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/DataTable.tsx:DataTable:component" type="component" identity="DataTable" parent="none"]
// CIL[DOC-MACRO purpose="Render a searchable, filterable, sortable data table with pagination"]
// CIL[DOC-RESPONSIBILITY responsibility="Display tabular data, manage search/filter UI state, and call provided handlers"]
// CIL[DOC-CONTEXT module="components/ui" layer="ui" related_files=".framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/table.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="data: T[], columns: DataTableColumn<T>[], loading: boolean, searchable: boolean, filterable: boolean, pagination, sort/search/filter callbacks" outputs="Rendered table UI with search, filters, active filter badges and pagination controls" errors="none" side_effects="Calls onSearch, onFilter, onSort, onRowClick callbacks and updates local useState"]
// CIL[DOC-MICRO logic_summary="Uses React state for search query, filter map and filter visibility; renders optional search input, filter dropdowns, active filter badges, table, and pagination" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  filterable = true,
  pagination,
  onSort,
  sortColumn,
  sortDirection,
  onRowClick,
  onSearch,
  onFilter,
  emptyMessage = 'No data available',
  className
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key]
    }
    setFilters(newFilters)
    onFilter?.(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilter?.({})
  }

  const hasActiveFilters = Object.keys(filters).length > 0
  const hasActiveSearch = searchQuery.length > 0

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="bg-card shadow rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            {searchable && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-input rounded-md focus:ring-ring focus:border-ring"
                  />
                </div>
              </div>
            )}

            {/* Filters */}
            {filterable && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    hasActiveFilters && 'bg-primary/10 border-primary text-primary'
                  )}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="info">
                      {Object.keys(filters).length}
                    </Badge>
                  )}
                </Button>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && filterable && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {columns
                  .filter(column => column.filterable && column.filterOptions)
                  .map((column) => (
                    <div key={String(column.key)}>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        {column.title}
                      </label>
                      <select
                        value={filters[String(column.key)] || ''}
                        onChange={(e) => handleFilter(String(column.key), e.target.value || null)}
                        className="w-full px-3 py-2 border border-input rounded-md focus:ring-ring focus:border-ring"
                      >
                        <option value="">All</option>
                        {column.filterOptions?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active filters display */}
      {(hasActiveFilters || hasActiveSearch) && (
        <div className="flex flex-wrap gap-2">
          {hasActiveSearch && (
            <Badge variant="info" className="flex items-center">
              Search: "{searchQuery}"
              <button
                onClick={() => handleSearch('')}
                className="ml-1 text-primary hover:text-primary/80"
              >
                ×
              </button>
            </Badge>
          )}
          
          {Object.entries(filters).map(([key, value]) => {


            const column = columns.find(col => String(col.key) === key)



            const option = column?.filterOptions?.find(opt => opt.value === value)

            
            return (
              <Badge key={key} variant="info" className="flex items-center">
                {column?.title}: {option?.label || value}
                <button
                  onClick={() => handleFilter(key, null)}
                  className="ml-1 text-primary hover:text-primary/80"
                >
                  ×
                </button>
              </Badge>
            )
          })}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)} className={column.sortable ? 'cursor-pointer' : ''}>
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? 'cursor-pointer' : ''}
                >
                  {columns.map((column) => (
                    <TableCell key={String(column.key)}>
                      {column.render
                        ? column.render(row)
                        : String(row[column.key as keyof T] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a searchable, filterable, sortable data table with pagination'; No verified external callers; imports: .framework/src/components/ui/table.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/DataTable.tsx:DataTable:component"]

