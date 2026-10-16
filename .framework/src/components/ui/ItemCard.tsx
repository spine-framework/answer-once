













// CIL[BEGIN stable_id="~/.framework/src/components/ui/ItemCard.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Import dependencies and set up module for the ItemCard and ItemGrid UI components"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare module-level imports for React, types, UI primitives, and utilities used by ItemCard and ItemGrid"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="imported symbols available to component chunks" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, Item/ItemType, Badge, Button, lucide-react icons, and date/text helpers" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="frontend maintainers"]
import React from 'react'
import { Item, ItemType } from '../../types/types'
import { Badge } from './badge'
import { Button } from './button'
import { Box, FileText, Calendar, User, MoreVertical } from 'lucide-react';
import { formatDateTime, truncateText } from '../../lib/utils'
// CIL[DOC-VECTOR type="context" content="purpose='Import dependencies and set up module for the ItemCard and ItemGrid UI components'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/ItemCard.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/ItemCard.tsx:ItemCardProps:interface" type="interface" identity="ItemCardProps" parent="~/.framework/src/components/ui/ItemCard.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Define the accepted props for the ItemCard component"]
// CIL[DOC-RESPONSIBILITY responsibility="Type the property contract and rendering options for a single item card"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/ItemCard.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="item, optional callbacks, and display flags" outputs="ItemCardProps TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Props extend Item with an optional item_type string or object plus optional onEdit/onDelete/onView callbacks and layout flags" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ItemCardProps {
  item: Item & { item_type?: ItemType | string }
  onEdit?: (item: Item) => void
  onDelete?: (item: Item) => void
  onView?: (item: Item) => void
  showActions?: boolean
  compact?: boolean
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the accepted props for the ItemCard component'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/ItemCard.tsx:ItemCardProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/ItemCard.tsx:ItemCard:component" type="component" identity="ItemCard" parent="~/.framework/src/components/ui/ItemCard.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a single item as a card, with an optional compact layout and action buttons"]
// CIL[DOC-RESPONSIBILITY responsibility="Display item title, type badge, description, metadata, and action controls"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/ItemCard.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="ItemCardProps" outputs="React JSX for the item card" errors="none" side_effects="triggers onView/onEdit callbacks when user clicks a button"]
// CIL[DOC-MICRO logic_summary="Derives primary text, secondary description, type label and badge color, then renders either a compact or full card layout" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function ItemCard({
  item,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  compact = false
}: ItemCardProps) {
  const getPrimaryValue = () => item.title || 'Untitled Item'

  const getSecondaryValue = () => {
    if (item.description) return truncateText(item.description, 100)
    return null
  }

  const getTypeIcon = () => {
    return <Box className="h-5 w-5 text-blue-500" />
  }

  const getTypeName = () => {
    if (!item.item_type) return item.item_type_slug || ''
    if (typeof item.item_type === 'string') return item.item_type
    return (item.item_type as ItemType).name || ''
  }

  const getTypeBadgeColor = () => {
    if (!item.item_type || typeof item.item_type === 'string') return 'info'
    return (item.item_type as ItemType).is_active ? 'success' : 'default'
  }

  if (compact) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0">
              {getTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-slate-900 truncate">
                  {getPrimaryValue()}
                </h3>
                <Badge variant={getTypeBadgeColor()}>
                  {getTypeName()}
                </Badge>
              </div>
              {getSecondaryValue() && (
                <p className="text-xs text-slate-500 mt-1">
                  {getSecondaryValue()}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                <span>Updated {formatDateTime(item.updated_at)}</span>
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-1">
              {onView && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(item)}
                >
                  View
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="flex-shrink-0">
            {getTypeIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-medium text-slate-900 truncate">
                {getPrimaryValue()}
              </h3>
              <Badge variant={getTypeBadgeColor()}>
                {getTypeName()}
              </Badge>
            </div>
            
            {getSecondaryValue() && (
              <p className="text-sm text-slate-600 mb-3">
                {getSecondaryValue()}
              </p>
            )}

            {/* Additional data fields */}
            {Object.keys(item.data || {}).length > 0 && (
              <div className="space-y-2 mb-4">
                {Object.entries(item.data)
                  .filter(([, v]) => v !== undefined && v !== null && v !== '')
                  .slice(0, 3)
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-slate-500">{key}:</span>
                      <span className="text-xs text-slate-900">
                        {truncateText(typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value), 50)}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Created {formatDateTime(item.created_at)}
                </span>
                <span className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  ID: {item.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2 ml-4">
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
            <Button
              variant="ghost"
              size="sm"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a single item as a card, with an optional compact layout and action buttons'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/ItemCard.tsx:ItemCard:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/ItemCard.tsx:ItemGridProps:interface" type="interface" identity="ItemGridProps" parent="~/.framework/src/components/ui/ItemCard.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Define the accepted props for the ItemGrid component"]
// CIL[DOC-RESPONSIBILITY responsibility="Type the property contract for rendering a list of items as a grid"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/ItemCard.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="item array, optional callbacks, loading flag, and empty message" outputs="ItemGridProps TypeScript interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Props describe a list of items with callbacks, loading/empty UI controls, and a compact flag" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface ItemGridProps {
  items: (Item & { item_type: ItemType })[]
  loading?: boolean
  onEdit?: (item: Item) => void
  onDelete?: (item: Item) => void
  onView?: (item: Item) => void
  compact?: boolean
  emptyMessage?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the accepted props for the ItemGrid component'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/ItemCard.tsx:ItemGridProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/ItemCard.tsx:ItemGrid:component" type="component" identity="ItemGrid" parent="~/.framework/src/components/ui/ItemCard.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render a responsive grid of ItemCard components with loading and empty states"]
// CIL[DOC-RESPONSIBILITY responsibility="Map an array of items to ItemCard instances and display loading or empty placeholders"]
// CIL[DOC-CONTEXT module="components/ui" layer="presentation" related_files=".framework/src/components/ui/ItemCard.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/lib/utils.ts,.framework/src/types/types.ts"]
// CIL[DOC-CONTRACT inputs="ItemGridProps" outputs="React JSX grid, loader, or empty message" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Shows a spinner while loading, an empty message when items are absent, or a responsive grid of ItemCard components" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function ItemGrid({
  items,
  loading = false,
  onEdit,
  onDelete,
  onView,
  compact = false,
  emptyMessage = 'No items found'
}: ItemGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-sm font-medium text-slate-900">{emptyMessage}</h3>
      </div>
    )
  }

  return (
    <div className={compact 
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    }>
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          compact={compact}
        />
      ))}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a responsive grid of ItemCard components with loading and empty states'; No verified external callers; imports: .framework/src/types/types.ts,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/ItemCard.tsx:ItemGrid:component"]
