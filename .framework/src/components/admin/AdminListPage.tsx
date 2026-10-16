// CIL[BEGIN stable_id="~/.framework/src/components/admin/AdminListPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent=""]
// CIL[DOC-MACRO purpose="Admin list page component module imports and entry point."]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies and declare the AdminListPage component module."]
// CIL[DOC-CONTEXT module="AdminListPage" layer="components/admin" related_files=".framework/src/components/admin/AdminStatsCard.tsx,.framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Aggregates imports for the admin list page UI: React, UI primitives, icons, local components, and utils." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="module"]

import React, { ReactNode } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Skeleton } from '../ui/skeleton'
import { Search } from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { AdminStatsCard } from './AdminStatsCard'
import { PageInstructions } from './PageInstructions'
import { cn } from '../../lib/utils'
// CIL[DOC-VECTOR type="context" content="purpose='Admin list page component module imports and entry point.'; No verified external callers; imports: .framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/AdminListPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/admin/AdminListPage.tsx:adminlistpageprops:interface" type="interface" identity="AdminListPageProps" parent="adminlistpage:function"]
// CIL[DOC-MACRO purpose="Props contract for the AdminListPage component."]
// CIL[DOC-RESPONSIBILITY responsibility="Define the typed input surface for AdminListPage."]
// CIL[DOC-CONTEXT module="AdminListPage" layer="components/admin" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/AdminStatsCard.tsx,.framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="property bag: title, description, statsCards, children, optional search/filter/loading/error/new-button fields" outputs="typed props interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes the complete prop surface for the admin list page, including stats, search, filters, loading, error, and children." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface AdminListPageProps {
  title: string
  description: string
  noPageInstructions?: boolean
  newButtonText?: string
  newButtonHref?: string
  onNewClick?: () => void
  statsCards: Array<{
    title: string
    value: string | number
    icon: LucideIcon
    iconColor?: string
  }>
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: Array<{
    label: string
    value: string
    options: Array<{ value: string; label: string }>
    onChange: (value: string) => void
  }>
  children: ReactNode
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyMessage?: string
  emptyIcon?: LucideIcon
}
// CIL[DOC-VECTOR type="context" content="purpose='Props contract for the AdminListPage component.'; No verified external callers; imports: .framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/AdminListPage.tsx:adminlistpageprops:interface"]


// CIL[BEGIN stable_id="~/.framework/src/components/admin/AdminListPage.tsx:adminlistpage:function" type="function" identity="AdminListPage" parent=""]
// CIL[DOC-MACRO purpose="Render a reusable admin list page with header, instructions, stats, search, filters, and content."]
// CIL[DOC-RESPONSIBILITY responsibility="Compose and render the admin list page layout and its interactive controls."]
// CIL[DOC-CONTEXT module="AdminListPage" layer="components/admin" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/AdminStatsCard.tsx,.framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="AdminListPageProps" outputs="JSX.Element" errors="Error state rendered inside card" side_effects="Sets window.location.href when new button is clicked and no onNewClick handler provided"]
// CIL[DOC-MICRO logic_summary="Builds a vertical page layout with title/actions, optional instructional help, stats cards, search/filter bar, and a content card that shows skeleton, error, or children." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function AdminListPage({
  title,
  description,
  noPageInstructions,
  newButtonText,
  newButtonHref = '#',
  onNewClick,
  statsCards,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  children,
  loading = false,
  error = null,
  onRetry,
}: AdminListPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        
        {newButtonText && (
          <Button onClick={() => onNewClick ? onNewClick() : (window.location.href = newButtonHref!)}>
            {newButtonText}
          </Button>
        )}
      </div>

      {!noPageInstructions && (
        <PageInstructions
          sections={[
            {
              title: 'What this page is for',
              content: `This page is the administrative list for ${title.toLowerCase()}. It shows all records in the system, their current state, and provides tools to search, filter, and create new records.`,
            },
            {
              title: 'How to find records',
              content: `Use the search field at the top of the list to look for records by name or keyword. Use the filter dropdowns to narrow the list by status, type, or other categories. Click any column header to sort ascending or descending.`,
            },
            {
              title: 'How to create, view, and edit records',
              content: `${newButtonText ? `Click the ${newButtonText} button in the top-right to create a new record. ` : ''}Click any row in the table to open its detail page. From the detail page you can review all fields, edit the record, and, if allowed, delete it. Deleting a record usually cannot be undone.`,
            },
            {
              title: 'Understanding the stats',
              content: `The summary cards above the table show the most important counts for this record type. Use them as a quick health check or to spot trends before drilling into the list.`,
            },
          ]}
        />
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <AdminStatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {onSearchChange && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            {filters.map((filter, index) => (
              <div key={index} className="sm:w-48">
                <Select value={filter.value} onValueChange={filter.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        {loading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-destructive">Error: {error}</p>
            {onRetry && (
              <Button onClick={onRetry} className="mt-4">
                Retry
              </Button>
            )}
          </div>
        ) : (
          <CardContent className="p-0">
            {children}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a reusable admin list page with header, instructions, stats, search, filters, and content.'; No verified external callers; imports: .framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/input.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/admin/AdminListPage.tsx:adminlistpage:function"]
