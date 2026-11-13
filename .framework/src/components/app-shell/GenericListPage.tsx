import { useListSchema } from '../../hooks/useListSchema'
import { useEntityList } from '../../hooks/useEntityList'
import { DataHeader } from '../runtime/DataHeader'
import { DataStats } from '../runtime/DataStats'
import { DataFilters } from '../runtime/DataFilters'
import { DataTable } from '../runtime/DataTable'
import { PageInstructions } from '../admin/PageInstructions'

interface GenericListPageProps {
  typeSlug: string
  viewSlug?: string
  appPrefix: string
  detailPath: string
}

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
