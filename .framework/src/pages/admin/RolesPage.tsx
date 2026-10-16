// CIL[BEGIN stable_id="~/.framework/src/pages/admin/RolesPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/RolesPage.tsx"]
// CIL[DOC-MACRO purpose="Admin roles management page module: defines the Role interface and the RolesPage React component for listing, searching, filtering, and sorting roles."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the top-level TypeScript module exports and role model shape consumed by the admin roles UI."]
// CIL[DOC-CONTEXT module="admin" layer="pages" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="module imports and role API response data" outputs="Role interface and RolesPage React component" errors="Network or API errors are surfaced by useApi hook" side_effects="none at module scope"]
// CIL[DOC-MICRO logic_summary="Imports React, hooks, shared components, and utilities; exports Role type and RolesPage component for rendering the admin roles list." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="admin-frontend"]





import React, { useState } from 'react'
import { Plus, ShieldCheck, CheckCircle, XCircle, Settings, FileText, Cog } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/button'
import { AdminListPage } from '../../components/admin/AdminListPage'
import { SortableTableHeader } from '../../components/admin/SortableTableHeader'
import { formatDateTime } from '../../lib/utils'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'


// CIL[DOC-VECTOR type="context" content="purpose='Admin roles management page module: defines the Role interface and the RolesPage React component for listing, searching, filtering, and sorting roles.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/admin/AdminListPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/RolesPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/RolesPage.tsx:Role:interface" type="interface" identity="Role" parent="~/.framework/src/pages/admin/RolesPage.tsx"]
// CIL[DOC-MACRO purpose="Define the shape of a role record for use in the admin roles list and related operations."]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the TypeScript interface for role objects returned by the roles API."]
// CIL[DOC-CONTEXT module="admin" layer="types" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/RolesPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="Role interface type definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Typed interface with required and optional fields representing a role, its permissions, app association, and audit timestamps." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface Role {
  id: string
  name: string
  slug: string
  description?: string
  permissions?: Record<string, any>
  is_system: boolean
  is_active: boolean
  app_id?: string
  app?: any
  created_at: string
  updated_at: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the shape of a role record for use in the admin roles list and related operations.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/admin/AdminListPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/RolesPage.tsx:Role:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/RolesPage.tsx:RolesPage:component" type="component" identity="RolesPage" parent="~/.framework/src/pages/admin/RolesPage.tsx"]
// CIL[DOC-MACRO purpose="Render the admin roles list page with search, filters, sorting, stats, and navigation to role detail."]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch and display roles; handle search, status/type filters, column sorting, row navigation, and summary statistics."]
// CIL[DOC-CONTEXT module="admin" layer="pages" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/RolesPage.tsx"]
// CIL[DOC-CONTRACT inputs="none (internal state and useApi fetch)" outputs="JSX admin list page for roles" errors="API fetch error passed to AdminListPage; boolean sort fallback for permissions" side_effects="Navigates to /spine-framework/admin/configs/roles/:id on row click; uses window.location.href"]
// CIL[DOC-MICRO logic_summary="Uses useApi to load roles, applies search/status/type filters, sorts by selected column, computes stats cards, and renders an AdminListPage with a sortable table and clickable rows." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function RolesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [sortKey, setSortKey] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  
  const { data: roles, loading, error, refetch } = useApi<Role[]>(
    async () => {
      const response = await apiFetch('/api/roles?action=list')
      if (!response.ok) throw new Error('Failed to fetch roles')
      const result = await response.json()
      return (result.data || result) as Role[]
    },
    { immediate: true }
  )

  const filteredRoles = (roles || []).filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (role.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && role.is_active) ||
      (selectedStatus === 'inactive' && !role.is_active)
    const matchesType = selectedType === 'all' ||
      (selectedType === 'system' && role.is_system) ||
      (selectedType === 'custom' && !role.is_system)
    return matchesSearch && matchesStatus && matchesType
  })

  
  const getStatusBadge = (role: Role) => {
    if (!role.is_active) {
      return <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-600">Inactive</span>
    }
    if (role.is_system) {
      return <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-green-100 text-green-700">System</span>
    }
    return <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-blue-100 text-blue-700">Custom</span>
  }

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const handleRowClick = (role: Role) => {
    window.location.href = `/spine-framework/admin/configs/roles/${role.id}`
  }

  const sortedRoles = [...(filteredRoles || [])].sort((a, b) => {
    let aValue: any = a[sortKey as keyof Role]
    let bValue: any = b[sortKey as keyof Role]
    
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
      title: 'Total Roles',
      value: (roles || []).length,
      icon: ShieldCheck,
      iconColor: 'text-blue-500'
    },
    {
      title: 'Active',
      value: (roles || []).filter(r => r.is_active).length,
      icon: CheckCircle,
      iconColor: 'text-green-500'
    },
    {
      title: 'System Roles',
      value: (roles || []).filter(r => r.is_system).length,
      icon: Cog,
      iconColor: 'text-purple-500'
    },
    {
      title: 'Custom Roles',
      value: (roles || []).filter(r => !r.is_system).length,
      icon: FileText,
      iconColor: 'text-orange-500'
    }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'system', label: 'System' },
    { value: 'custom', label: 'Custom' }
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
      title="Roles"
      description="Manage system and custom roles"
      newButtonText="Add Role"
      newButtonHref="/spine-framework/admin/configs/roles/new"
      statsCards={statsCards}
      searchPlaceholder="Search roles..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={filters}
      loading={loading}
      error={error}
      emptyMessage="No roles found"
      emptyIcon={ShieldCheck}
    >
      {sortedRoles.length === 0 ? (
        <div className="p-8 text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No roles found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <SortableTableHeader
                title="Role"
                sortKey="name"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Slug"
                sortKey="slug"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Type"
                sortKey="is_system"
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
                title="Permissions"
                sortKey="permissions"
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
            {sortedRoles.map((role) => (
              <tr 
                key={role.id} 
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(role)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-slate-900">
                      <span className="text-accent-blue hover:text-navy">
                        {role.name}
                      </span>
                    </div>
                    {role.description && (
                      <div className="text-sm text-slate-500">{role.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-500 font-mono">{role.slug}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${
                    role.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {role.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {Object.keys(role.permissions || {}).length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {formatDateTime(role.created_at)}
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
// CIL[DOC-VECTOR type="context" content="purpose='Render the admin roles list page with search, filters, sorting, stats, and navigation to role detail.'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/admin/AdminListPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/RolesPage.tsx:RolesPage:component"]