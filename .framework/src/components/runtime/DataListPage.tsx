// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataListPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/runtime/DataListPage.tsx"]
// CIL[DOC-MACRO purpose="Import the hooks and child components used by the DataListPage runtime list view"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare module-level imports for routing, data hooks, and UI subcomponents"]
// CIL[DOC-CONTEXT module="components/runtime" layer="runtime" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/runtime/DataFilters.tsx,.framework/src/components/runtime/DataHeader.tsx,.framework/src/components/runtime/DataStats.tsx,.framework/src/components/runtime/DataTable.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/hooks/useEntityList.ts,.framework/src/hooks/useListSchema.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="imported symbols available to DataListPage" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Import React Router useParams, list schema and entity list hooks, and runtime/ui child components" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework-developers,ui-developers"]

import { useParams } from 'react-router-dom'
import { useListSchema } from '../../hooks/useListSchema'
import { useEntityList } from '../../hooks/useEntityList'
import { DataHeader } from './DataHeader'
import { DataStats } from './DataStats'
import { DataFilters } from './DataFilters'
import { DataTable } from './DataTable'
import { PageInstructions } from '../admin/PageInstructions'
import { Card, CardContent } from '../ui/card'
import { Skeleton } from '../ui/skeleton'
// CIL[DOC-VECTOR type="context" content="purpose='Import the hooks and child components used by the DataListPage runtime list view'; No verified external callers; imports: .framework/src/hooks/useListSchema.ts,.framework/src/hooks/useEntityList.ts,.framework/src/components/runtime/DataHeader.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataListPage.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/runtime/DataListPage.tsx:DataListPage:component" type="component" identity="DataListPage" parent="~/.framework/src/components/runtime/DataListPage.tsx"]
// CIL[DOC-MACRO purpose="Render a schema-driven list page for runtime entity records with stats, filters, and a sortable data table"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch the list schema, build the column/filter configuration, load entity list data, and render header/stats/filters/table with loading and error states"]
// CIL[DOC-CONTEXT module="components/runtime" layer="runtime" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/runtime/DataFilters.tsx,.framework/src/components/runtime/DataHeader.tsx,.framework/src/components/runtime/DataListPage.tsx,.framework/src/components/runtime/DataStats.tsx,.framework/src/components/runtime/DataTable.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/hooks/useEntityList.ts,.framework/src/hooks/useListSchema.ts"]
// CIL[DOC-CONTRACT inputs="entity and optional typeSlug from route params; list schema via useListSchema; entity list data via useEntityList" outputs="JSX page composed of DataHeader, PageInstructions, DataStats, DataFilters, and DataTable" errors="schemaError or useEntityList error renders a fallback error card" side_effects="Invokes useListSchema and useEntityList data fetching; updates filters and sort via setter functions"]
// CIL[DOC-MICRO logic_summary="Build a config object from the loaded schema and view, handle loading and error states, then compose child components with derived columns, stats, filters, sort, and routing hrefs" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function DataListPage() {
  const { entity, typeSlug } = useParams<{ entity: string; typeSlug?: string }>()

  const { schema, view, loading: schemaLoading, error: schemaError } = useListSchema({
    entity: entity || '',
    viewSlug: 'default_list'
  })

  const config = view && schema ? {
    entity: entity || '',
    typeSlug: typeSlug || undefined,
    icon: 'database',
    api: {
      endpoint: 'admin-data',
      listAction: 'list'
    },
    list: {
      defaultSort: (view as any).default_sort || { field: 'created_at', direction: 'desc' },
      stats: (view as any).stats || [],
      filters: (view as any).filters || [],
      columns: Object.entries((view as any).fields || {}).map(([key, fieldConfig]: [string, any]) => ({
        key,
        label: schema.fields[key]?.label || key,
        sortable: fieldConfig.sortable !== false,
        display_type: fieldConfig.display_type
      }))
    }
  } : null

  const {
    data,
    loading,
    error,
    refetch,
    filters,
    setFilters,
    sort,
    setSort
  } = useEntityList(entity!, config)

  if (schemaLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Card>
          <CardContent className="p-8 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (schemaError || !config) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-lg font-medium text-destructive">Error</p>
          <p className="mt-2 text-sm text-muted-foreground">{schemaError || 'Failed to load entity configuration'}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <DataHeader
        title={config.entity.charAt(0).toUpperCase() + config.entity.slice(1)}
        icon={config.icon}
        description={`Manage ${config.entity}`}
        newButtonHref={`/spine-framework/admin/runtime/${entity}/new`}
      />

      <PageInstructions
        sections={[
          {
            title: 'What this page is for',
            content: `This page is a schema-driven list for ${config.entity} records. It displays the records stored in the system, their field values, and current status based on the type definition.`,
          },
          {
            title: 'How to find records',
            content: `Use the filters above the table to narrow results. Click any column header to sort ascending or descending. The available columns and filters are defined by the type schema.`,
          },
          {
            title: 'How to create, view, and edit records',
            content: `Click the New button in the top-right to create a new ${config.entity}. Click any row to open its detail view. From the detail view you can edit field values or delete the record. Some records may have restricted permissions based on your role.`,
          },
          {
            title: 'Understanding the stats',
            content: `The cards above the table show summary counts and key metrics for this record type. Use them to quickly assess volume and status before drilling into the list.`,
          },
        ]}
      />

      <DataStats
        stats={config.list.stats}
        data={data}
        loading={loading}
      />

      <DataFilters
        filters={config.list.filters}
        values={filters}
        onChange={setFilters}
        onClear={() => setFilters({})}
      />

      <DataTable
        columns={config.list.columns}
        data={data}
        loading={loading}
        error={error}
        onRetry={refetch}
        sort={sort}
        onSort={setSort}
        entity={entity!}
        emptyMessage={`No ${config.entity} found`}
        emptyIcon={config.icon}
      />
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a schema-driven list page for runtime entity records with stats, filters, and a sortable data table'; No verified external callers; imports: .framework/src/hooks/useListSchema.ts,.framework/src/hooks/useEntityList.ts,.framework/src/components/runtime/DataHeader.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/runtime/DataListPage.tsx:DataListPage:component"]
