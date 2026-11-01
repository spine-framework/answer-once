// CIL[BEGIN stable_id="~/.framework/src/components/app-shell/GenericListPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/components/app-shell/GenericListPage.tsx"]
// CIL[DOC-MACRO purpose="Imports and module setup for the generic list page"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide dependencies for GenericListPage rendering"]
// CIL[DOC-CONTEXT module="app-shell" layer="framework" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/runtime/DataFilters.tsx,.framework/src/components/runtime/DataHeader.tsx,.framework/src/components/runtime/DataStats.tsx,.framework/src/components/runtime/DataTable.tsx,.framework/src/hooks/useEntityList.ts,.framework/src/hooks/useListSchema.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports hooks and UI subcomponents used by the list page" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework"]
import { useListSchema } from '../../hooks/useListSchema'
import { useEntityList } from '../../hooks/useEntityList'
import { DataHeader } from '../runtime/DataHeader'
import { DataStats } from '../runtime/DataStats'
import { DataFilters } from '../runtime/DataFilters'
import { DataTable } from '../runtime/DataTable'
import { PageInstructions } from '../admin/PageInstructions'
// CIL[END stable_id="~/.framework/src/components/app-shell/GenericListPage.tsx:module_header:module_header"]
// CIL[DOC-VECTOR type="context" content="purpose='Imports and module setup for the generic list page'; No verified external callers; imports: .framework/src/hooks/useListSchema.ts,.framework/src/hooks/useEntityList.ts,.framework/src/components/runtime/DataHeader.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Props interface for GenericListPage"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the expected props for the list page"]
// CIL[DOC-CONTEXT module="app-shell" layer="framework" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/app-shell/GenericListPage.tsx,.framework/src/components/runtime/DataFilters.tsx,.framework/src/components/runtime/DataHeader.tsx,.framework/src/components/runtime/DataStats.tsx,.framework/src/components/runtime/DataTable.tsx,.framework/src/hooks/useEntityList.ts,.framework/src/hooks/useListSchema.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="TypeScript interface describing typeSlug, viewSlug, appPrefix, and detailPath" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/components/app-shell/GenericListPage.tsx:GenericListPageProps:interface" type="interface" identity="GenericListPageProps" parent="~/.framework/src/components/app-shell/GenericListPage.tsx"]
interface GenericListPageProps {
  typeSlug: string
  viewSlug?: string
  appPrefix: string
  detailPath: string
}
// CIL[END stable_id="~/.framework/src/components/app-shell/GenericListPage.tsx:GenericListPageProps:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='Props interface for GenericListPage'; No verified external callers; imports: .framework/src/hooks/useListSchema.ts,.framework/src/hooks/useEntityList.ts,.framework/src/components/runtime/DataHeader.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Render the generic list page for an app type"]
// CIL[DOC-RESPONSIBILITY responsibility="Display a sortable, filterable data table with schema-driven headers, stats, filters, and instructions"]
// CIL[DOC-CONTEXT module="app-shell" layer="framework" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/app-shell/GenericListPage.tsx,.framework/src/components/runtime/DataFilters.tsx,.framework/src/components/runtime/DataHeader.tsx,.framework/src/components/runtime/DataStats.tsx,.framework/src/components/runtime/DataTable.tsx,.framework/src/hooks/useEntityList.ts,.framework/src/hooks/useListSchema.ts"]
// CIL[DOC-CONTRACT inputs="typeSlug: string, viewSlug?: string, appPrefix: string, detailPath: string" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Resolve the list schema, build a config, load entity data, and render the list page with header, instructions, stats, filters, and table" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/components/app-shell/GenericListPage.tsx:GenericListPage:component" type="component" identity="GenericListPage" parent="~/.framework/src/components/app-shell/GenericListPage.tsx"]
export function GenericListPage({ typeSlug, viewSlug, appPrefix, detailPath }: GenericListPageProps) {
  const resolvedViewSlug = viewSlug || 'default_list'


  const { schema, view, loading: schemaLoading, error: schemaError } = useListSchema({
    entity: 'items',
    viewSlug: resolvedViewSlug
  })

  // nav_item `view` is a single slug shared by list + detail pages; a
  // detail-shaped view (sections, no fields) must not resolve here.
  const resolvedListView = view && ((view as any).type === 'list' || (view as any).fields)
    ? view
    : schema?.views?.default_list ?? view

  const config = resolvedListView && schema ? {
    entity: 'items',
    typeSlug,
    icon: 'database',
    api: {
      endpoint: 'admin-data',
      listAction: 'list'
    },
    list: {
      defaultSort: (resolvedListView as any).default_sort || { field: 'created_at', direction: 'desc' },
      stats: (resolvedListView as any).stats || [],
      // Docs allow bare field-name strings; DataFilters needs full
      // EntityFilter objects, so normalize strings against the schema.
      filters: ((resolvedListView as any).filters || []).map((f: any) => {
        if (typeof f !== 'string') return f
        const field: any = (schema.fields as any)?.[f] || (schema.fields as any)?.[f.replace(/^data\./, '')] || {}
        const options = (field.options || []).map((o: any) => (typeof o === 'string' ? o : o.value))
        const type = field.data_type === 'boolean' || field.data_type === 'checkbox'
          ? 'boolean'
          : options.length ? 'enum' : 'search'
        return { key: f, label: field.label || f, type, options: options.length ? options : undefined }
      }),
      columns: Object.entries((resolvedListView as any).fields || {}).map(([key, fieldConfig]: [string, any]) => ({
        key,
        label: schema.fields[key]?.label || schema.fields[key.replace(/^data\./, '')]?.label || key,
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
  } = useEntityList('items', config)

  if (schemaLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-slate-500">Loading schema...</p>
      </div>
    )
  }

  if (schemaError || !config) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-medium text-red-600">Error</h2>
        <p className="mt-2 text-sm text-slate-500">{schemaError || 'Failed to load entity configuration'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DataHeader
        title={schema?.fields ? Object.keys(schema.fields).length > 0 ? (resolvedListView as any)?.label || typeSlug : typeSlug : typeSlug}
        icon={config.icon}
        description={`Manage ${typeSlug}`}
        newButtonHref={`${appPrefix}/${detailPath}/new`}
      />

      <PageInstructions pageKey="runtime-list" />

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
        entity="items"
        emptyMessage={`No ${typeSlug} found`}
        emptyIcon={config.icon}
      />
    </div>
  )
}
// CIL[END stable_id="~/.framework/src/components/app-shell/GenericListPage.tsx:GenericListPage:component"]
// CIL[DOC-VECTOR type="context" content="purpose='Render the generic list page for an app type'; No verified external callers; imports: .framework/src/hooks/useListSchema.ts,.framework/src/hooks/useEntityList.ts,.framework/src/components/runtime/DataHeader.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
