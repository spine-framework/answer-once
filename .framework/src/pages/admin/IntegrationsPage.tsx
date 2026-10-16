// CIL[BEGIN stable_id="~/.framework/src/pages/admin/IntegrationsPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/IntegrationsPage.tsx"]
// CIL[DOC-MACRO purpose="Top-level module for the admin Integrations page; exports the IntegrationsPage component and Integration interface."]
// CIL[DOC-RESPONSIBILITY responsibility="Serves as the module entry point and declares the public surface of the admin integrations list page."]
// CIL[DOC-CONTEXT module="admin/integrations" layer="presentation" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="exports IntegrationsPage and Integration" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, utility functions, the API client, and reusable admin components, then re-exports the page component and type interface." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]




import { useState } from 'react'
import { Link, CheckCircle, AlertTriangle, Settings, Cog } from 'lucide-react';
import { formatDateTime } from '../../lib/utils'
import { apiFetch } from '../../lib/api'
import { AdminListPage } from '../../components/admin/AdminListPage'
import { SortableTableHeader } from '../../components/admin/SortableTableHeader'
import { useApi } from '../../hooks/useApi'

// CIL[DOC-VECTOR type="context" content="purpose='Top-level module for the admin Integrations page; exports the IntegrationsPage component and Integration interface.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/lib/api.ts,.framework/src/components/admin/AdminListPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/IntegrationsPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/IntegrationsPage.tsx:Integration:interface" type="interface" identity="Integration" parent="~/.framework/src/pages/admin/IntegrationsPage.tsx"]
// CIL[DOC-MACRO purpose="TypeScript type definition for an integration record used by the admin integrations page."]
// CIL[DOC-RESPONSIBILITY responsibility="Defines the shape and optional nested fields of an integration for compile-time checking and API response typing."]
// CIL[DOC-CONTEXT module="admin/integrations" layer="type" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/IntegrationsPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="Integration interface declaration" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the Integration interface with identifiers, descriptive fields, provider/version, active and configured flags, sync state, and nested app and creator objects." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface Integration {
  id: string
  name: string
  description: string
  integration_type: string
  provider: string
  version?: string
  is_active: boolean
  is_configured: boolean
  last_sync_at?: string
  sync_status?: string
  sync_error?: string
  created_at: string
  updated_at: string
  app?: {
    id: string
    slug: string
    name: string
  }
  created_by_person?: {
    id: string
    full_name: string
    email: string
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript type definition for an integration record used by the admin integrations page.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/lib/api.ts,.framework/src/components/admin/AdminListPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/IntegrationsPage.tsx:Integration:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/IntegrationsPage.tsx:IntegrationsPage:component" type="component" identity="IntegrationsPage" parent="~/.framework/src/pages/admin/IntegrationsPage.tsx"]
// CIL[DOC-MACRO purpose="Admin list page for browsing, filtering, sorting, and navigating external service integrations."]
// CIL[DOC-RESPONSIBILITY responsibility="Loads integrations via the API, applies search/status/type filters, sorts the results, computes summary statistics, and renders the list with navigation to detail and new pages."]
// CIL[DOC-CONTEXT module="admin/integrations" layer="presentation" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/IntegrationsPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX for the AdminListPage with filterable, sortable integration table" errors="Propagates fetch failures through useApi; sort fallback returns 0 for unsupported value types" side_effects="Navigates via window.location when a table row is clicked"]
// CIL[DOC-MICRO logic_summary="Uses useApi to fetch integrations, filters by search term, status, and type, sorts by selected key and direction, builds stats cards, and renders AdminListPage with a SortableTableHeader table and row-click navigation." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [sortKey, setSortKey] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const { data: integrations, loading, error } = useApi<Integration[]>(
    async ({ signal }: { signal?: AbortSignal }) => {
      const response = await apiFetch('/api/integrations?action=list', { signal })
      if (!response.ok) throw new Error('Failed to fetch integrations')
      const result = await response.json()
      return result.data || []
    },
    { immediate: true }
  )

  const filteredIntegrations = (integrations || []).filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.provider.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && integration.is_active) ||
      (selectedStatus === 'inactive' && !integration.is_active)
    const matchesType = selectedType === 'all' || integration.integration_type === selectedType
    return matchesSearch && matchesStatus && matchesType
  })

  const types = Array.from(new Set((integrations || []).map(i => i.integration_type)))

  const getStatusBadge = (integration: Integration) => {
    if (!integration.is_active) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">Inactive</span>
    }
    if (integration.sync_status === 'error') {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Error</span>
    }
    if (integration.is_configured) {
      return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Configured</span>
    }
    return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
  }

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const handleRowClick = (integration: Integration) => {
    window.location.href = `/spine-framework/admin/configs/integrations/${integration.id}`
  }

  const sortedIntegrations = [...(filteredIntegrations || [])].sort((a, b) => {
    let aValue: any = a[sortKey as keyof Integration]
    let bValue: any = b[sortKey as keyof Integration]
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'boolean') {
      return sortDirection === 'asc' ? (aValue ? 1 : 0) : (bValue ? 1 : 0)
    }
    
    return 0
  })

  const statsCards = [
    {
      title: 'Total Integrations',
      value: (integrations || []).length,
      icon: Link,
      iconColor: 'text-blue-500'
    },
    {
      title: 'Active',
      value: (integrations || []).filter(i => i.is_active).length,
      icon: CheckCircle,
      iconColor: 'text-green-500'
    },
    {
      title: 'Configured',
      value: (integrations || []).filter(i => i.is_configured).length,
      icon: Cog,
      iconColor: 'text-purple-500'
    },
    {
      title: 'Errors',
      value: (integrations || []).filter(i => i.sync_status === 'error').length,
      icon: AlertTriangle,
      iconColor: 'text-red-500'
    }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...types.map(type => ({ value: type, label: type }))
  ]

  const filters = [
    {
      label: 'Status',
      value: selectedStatus,
      options: statusOptions,
      onChange: setSelectedStatus
    },
    {
      label: 'Type',
      value: selectedType,
      options: typeOptions,
      onChange: setSelectedType
    }
  ]

  return (
    <AdminListPage
      title="Integrations"
      description="Configure external service integrations and connections"
      newButtonText="Add Integration"
      newButtonHref="/spine-framework/admin/configs/integrations/new"
      statsCards={statsCards}
      searchPlaceholder="Search integrations..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={filters}
      loading={loading}
      error={error}
      emptyMessage="No integrations found"
      emptyIcon={Link}
    >
      {sortedIntegrations.length === 0 ? (
        <div className="p-8 text-center">
          <Link className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No integrations found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <SortableTableHeader
                title="Integration"
                sortKey="name"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Provider"
                sortKey="provider"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Type"
                sortKey="integration_type"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Status"
                sortKey="is_active"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Last Sync"
                sortKey="last_sync_at"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Created"
                sortKey="created_at"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedIntegrations.map((integration) => (
              <tr 
                key={integration.id} 
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(integration)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-slate-900">
                      <span className="text-accent-blue hover:text-navy">
                        {integration.name}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500">
                      {integration.description}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-900 font-medium">{integration.provider}</span>
                  {integration.version && (
                    <span className="text-xs text-slate-500 ml-1">v{integration.version}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-900">{integration.integration_type}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(integration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {integration.last_sync_at ? formatDateTime(integration.last_sync_at) : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {formatDateTime(integration.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-slate-400">→</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminListPage>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Admin list page for browsing, filtering, sorting, and navigating external service integrations.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/lib/api.ts,.framework/src/components/admin/AdminListPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/IntegrationsPage.tsx:IntegrationsPage:component"]