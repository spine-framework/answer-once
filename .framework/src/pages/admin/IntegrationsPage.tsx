/**
 * @module   IntegrationsPage
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * The IntegrationsPage module provides an interface for managing integrations within the admin panel of the application. It allows users to view, sort, and interact with a list of integrations, leveraging various UI components for enhanced user experience.
 * INVARIANT: The user must have admin privileges to access this page.
 *
 * @seeAlso AdminListPage (provides the list view for integrations).
 * @seeAlso SortableTableHeader (enables sorting functionality for the integration list).
 * @seeAlso useApi (custom hook for API interactions).
 *
 * @cil-generated
 */













import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link, CheckCircle, AlertTriangle, Settings, Cog } from 'lucide-react';
import { formatDateTime } from '../../lib/utils'
import { apiFetch } from '../../lib/api'
import { AdminListPage } from '../../components/admin/AdminListPage'
import { SortableTableHeader } from '../../components/admin/SortableTableHeader'
import { useApi } from '../../hooks/useApi'
















/**
 * The Integration interface defines the structure for integration objects used in the admin panel, encapsulating essential details about each integration, including its status and configuration.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
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
















/**
 * The IntegrationsPage component manages the display and filtering of integrations within an admin interface. It allows users to search, sort, and navigate to detailed views of integrations.
 *
 * @macro       Admin interface component for managing integrations.
 * @micro       Utilizes state management for search, filtering, and sorting of integration data fetched from an external API.
 * @outputSpec  JSX.Element
 * @throws      Error — if the API response is not ok
 * @sideEffects Fetches integration data from an external API.
 * @stability   internal
 * @calls       useApi, apiFetch, useNavigate
 * @errorHandling throws an error if the API response is not ok
 * @cil-generated
 */
export function IntegrationsPage() {
  const navigate = useNavigate()
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
    navigate(`/spine-framework/admin/configs/integrations/${integration.id}`)
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






