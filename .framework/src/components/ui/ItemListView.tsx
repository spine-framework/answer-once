// CIL[BEGIN stable_id="~/.framework/src/components/ui/ItemListView.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Module imports and exports for the item list view UI components"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the component library entry point, declaring dependencies and exporting ItemListView, ItemListPage, and their prop interfaces"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui" layer="ui" related_files=".framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/ItemCard.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="module imports and named exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, type definitions, DataTable, ItemCard, Badge, Button, icons, and date formatting utilities" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ui developers"]












import React, { useState } from 'react'
import { Item, ItemType } from '../../types/types'
import { DataTable } from './DataTable'
import { ItemCard, ItemGrid } from './ItemCard'
import { Badge } from './badge'
import { Button } from './button'
import { Squares2X2Icon, List, Plus } from 'lucide-react';
import { formatDateTime } from '../../lib/utils'

// CIL[DOC-VECTOR type="context" content="purpose='Module imports and exports for the item list view UI components'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/ItemCard.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/ItemListView.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/ItemListView.tsx:ItemListViewProps:interface" type="interface" identity="ItemListViewProps" parent="~/.framework/src/components/ui/ItemListView.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Props contract for the ItemListView component"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the shape of input properties accepted by ItemListView including items, callbacks, and display options"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui" layer="ui" related_files=".framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/ItemCard.tsx,.framework/src/components/ui/ItemListView.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ItemListViewProps TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Type-only interface describing props for item list view rendering" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ItemListViewProps {
  items: (Item & { item_type: ItemType })[]
  loading?: boolean
  onEdit?: (item: Item) => void
  onDelete?: (item: Item) => void
  onView?: (item: Item) => void
  onCreate?: () => void
  searchable?: boolean
  filterable?: boolean
  emptyMessage?: string
  showCreateButton?: boolean
  createButtonText?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Props contract for the ItemListView component'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/ItemCard.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/ItemListView.tsx:ItemListViewProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/ItemListView.tsx:ItemListView:component" type="component" identity="ItemListView" parent="~/.framework/src/components/ui/ItemListView.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render an interactive item list with grid/table toggle and actions"]
// CIL[DOC-RESPONSIBILITY responsibility="Displays items in a grid or data table, computes unique item type filters, formats dates, and wires edit/view/create handlers"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui" layer="ui" related_files=".framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/ItemCard.tsx,.framework/src/components/ui/ItemListView.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="ItemListViewProps: items, loading, onEdit, onDelete, onView, onCreate, searchable, filterable, emptyMessage, showCreateButton, createButtonText" outputs="JSX element with header, view toggle, create button, and conditional grid/table content" errors="none" side_effects="setViewMode updates local React state"]
// CIL[DOC-MICRO logic_summary="Builds a type map from item_type values for filtering, derives a primary text/textarea display field with a name fallback, renders view mode buttons, and chooses ItemGrid or DataTable" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function ItemListView({
  items,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onCreate,
  searchable = true,
  filterable = true,
  emptyMessage = 'No items found',
  showCreateButton = true,
  createButtonText = 'Create Item'
}: ItemListViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  
  const typesMap = new Map<string, ItemType>()
  items.forEach(item => {
    typesMap.set(item.item_type.id, item.item_type)
  })
  const types = Array.from(typesMap.values()).map(type => ({
    value: type.id,
    label: type.name
  }))

  
  const tableColumns = [
    {
      key: 'data' as const,
      title: 'Item',
      sortable: true,
      render: (value: Record<string, any>, item: Item & { item_type: ItemType }) => {
        const primaryField = item.item_type.design_schema?.fields ? Object.entries(item.item_type.design_schema.fields).find(([_, f]: [string, any]) => 
          f.data_type === 'text' || f.data_type === 'textarea'
        ) : null
        const fieldEntry = primaryField ? primaryField : null
        const fieldName = fieldEntry ? fieldEntry[0] : 'name'
        const displayValue = value[fieldName] || 'Untitled Item'
        
        return (
          <div>
            <div className="font-medium text-slate-900">{displayValue}</div>
            <div className="text-sm text-slate-500">
              <Badge variant={item.item_type.is_active ? 'success' : 'default'}>
                {item.item_type.name}
              </Badge>
            </div>
          </div>
        )
      }
    },
    {
      key: 'item_type' as const,
      title: 'Type',
      filterable: true,
      filterOptions: types,
      render: (value: ItemType) => (
        <Badge variant={value.is_active ? 'success' : 'default'}>
          {value.name}
        </Badge>
      )
    },
    {
      key: 'created_at' as const,
      title: 'Created',
      sortable: true,
      render: (value: string) => formatDateTime(value)
    },
    {
      key: 'updated_at' as const,
      title: 'Updated',
      sortable: true,
      render: (value: string) => formatDateTime(value)
    },
    {
      key: 'id' as const,
      title: 'Actions',
      render: (_: any, item: Item & { item_type: ItemType }) => (
        <div className="flex items-center space-x-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(item)}
            >
              View
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(item)}
            >
              Edit
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-slate-900">
            Items ({items.length})
          </h2>
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                }
              `}
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                }
              `}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {showCreateButton && onCreate && (
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            {createButtonText}
          </Button>
        )}
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <ItemGrid
          items={items}
          loading={loading}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          compact={true}
          emptyMessage={emptyMessage}
        />
      ) : (
        <DataTable
          data={items}
          columns={tableColumns as any}
          loading={loading}
          searchable={searchable}
          filterable={filterable}
          emptyMessage={emptyMessage}
        />
      )}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render an interactive item list with grid/table toggle and actions'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/ItemCard.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/ItemListView.tsx:ItemListView:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/ItemListView.tsx:ItemListPageProps:interface" type="interface" identity="ItemListPageProps" parent="~/.framework/src/components/ui/ItemListView.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Props contract for the ItemListPage page-level wrapper"]
// CIL[DOC-RESPONSIBILITY responsibility="Defines page wrapper props that extend ItemListViewProps with a title and description"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui" layer="ui" related_files=".framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/ItemCard.tsx,.framework/src/components/ui/ItemListView.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="ItemListPageProps TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Type-only interface extending ItemListViewProps with title and description fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ItemListPageProps {
  items: (Item & { item_type: ItemType })[]
  loading?: boolean
  onEdit?: (item: Item) => void
  onDelete?: (item: Item) => void
  onView?: (item: Item) => void
  onCreate?: () => void
  searchable?: boolean
  filterable?: boolean
  emptyMessage?: string
  showCreateButton?: boolean
  createButtonText?: string
  title?: string
  description?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Props contract for the ItemListPage page-level wrapper'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/ItemCard.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/ItemListView.tsx:ItemListPageProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/ItemListView.tsx:ItemListPage:component" type="component" identity="ItemListPage" parent="~/.framework/src/components/ui/ItemListView.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Page-level wrapper that renders a titled item list page"]
// CIL[DOC-RESPONSIBILITY responsibility="Provides a page header with title and description and delegates the list rendering to ItemListView"]
// CIL[DOC-CONTEXT module=".framework/src/components/ui" layer="ui" related_files=".framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/ItemCard.tsx,.framework/src/components/ui/ItemListView.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="ItemListPageProps: all ItemListViewProps plus title and description" outputs="JSX page layout containing a header and an ItemListView" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a page header and passes all props through to ItemListView" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function ItemListPage({
  items,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onCreate,
  searchable = true,
  filterable = true,
  emptyMessage = 'No items found',
  showCreateButton = true,
  createButtonText = 'Create Item',
  title = 'Items',
  description = 'Manage and organize your items'
}: ItemListPageProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>

      {/* Item List View */}
      <ItemListView
        items={items}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        onCreate={onCreate}
        searchable={searchable}
        filterable={filterable}
        emptyMessage={emptyMessage}
        showCreateButton={showCreateButton}
        createButtonText={createButtonText}
      />
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Page-level wrapper that renders a titled item list page'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/DataTable.tsx,.framework/src/components/ui/ItemCard.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/ItemListView.tsx:ItemListPage:component"]