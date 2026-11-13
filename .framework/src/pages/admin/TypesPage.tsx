/**
 * @module   TypesPage
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module represents the TypesPage component within the admin section of the application, providing a user interface for managing various types. It integrates with the API to fetch data and utilizes several UI components for rendering. INVARIANT: The component must always be rendered within a valid routing context to function correctly.
 *
 * @seeAlso useApi (provides API interaction functionality).
 * @seeAlso LoadingSpinner (used for loading states).
 * @seeAlso AdminListPage (displays a list of admin items).
 * @seeAlso SortableTableHeader (enables sorting functionality in tables).
 *
 * @cil-generated
 */













import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
import { 
  Plus,
  Box,
  FileText,
  Calendar,
  Settings,
  CheckCircle
} from 'lucide-react'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/button'
import { AdminListPage } from '../../components/admin/AdminListPage'
import { SortableTableHeader } from '../../components/admin/SortableTableHeader'
import { formatDateTime } from '../../lib/utils'
















/**
 * The Type interface defines the structure for a type object used in the admin panel, encapsulating various attributes related to types. It serves to standardize the representation of types within the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface Type {
  id: string
  name: string
  slug: string
  kind: string
  description?: string
  icon?: string
  color?: string
  design_schema?: {
    fields: Record<string, {
      type: string
      label?: string
      required?: boolean
      options?: string[]
    }>
  }
  ownership: string
  is_active: boolean
  created_at: string
  updated_at: string
  app_id?: string | null
  app?: any
}
















/**
 * The TypesPage component manages the display and filtering of various types in an admin interface. It allows users to search, sort, and categorize types based on specific criteria.
 *
 * @macro       Admin interface component for managing and displaying types.
 * @micro       Utilizes state management and API calls to fetch and filter types based on user input.
 * @outputSpec  JSX.Element
 * @throws      Error — if the API response is not ok
 * @sideEffects API call to '/api/types?action=list&limit=500'
 * @stability   internal
 * @calls       useApi, apiFetch, useNavigate
 * @errorHandling throws an error if the API response is not ok
 * @cil-generated
 */
export function TypesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortKey, setSortKey] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const { data: types, loading, error, refetch } = useApi<Type[]>(
    async ({ signal }: { signal?: AbortSignal }) => {
      const response = await apiFetch('/api/types?action=list&limit=500&active=all', { signal })
      if (!response.ok) throw new Error('Failed to fetch types')
      const result = await response.json()
      return result.data || []
    },
    { immediate: true }
  )

  const categories = [
    { value: 'all', label: 'All Types' },
    { value: 'system', label: 'System Types' },
    { value: 'custom', label: 'Custom Types' },
    { value: 'active', label: 'Active Only' },
  ]

  const filteredTypes = (types || []).filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    let matchesCategory = true
    if (selectedCategory === 'system') {
      matchesCategory = type.ownership === 'system'
    } else if (selectedCategory === 'custom') {
      matchesCategory = type.ownership !== 'system'
    } else if (selectedCategory === 'active') {
      matchesCategory = type.is_active
    }
    
    return matchesSearch && matchesCategory
  })

  const getCategoryBadgeColor = (type: Type) => {
    if (type.ownership === 'system') {
      return 'bg-purple-50 text-purple-700'
    }
    return 'bg-primary/10 text-primary'
  }

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-50 text-green-700'
      : 'bg-muted text-muted-foreground'
  }

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const handleRowClick = (type: Type) => {
    navigate(`/spine-framework/admin/configs/types/${type.id}`)
  }

  const sortedTypes = [...(filteredTypes || [])].sort((a, b) => {
    let aValue: any = a[sortKey as keyof Type]
    let bValue: any = b[sortKey as keyof Type]
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })

  const statsCards = [
    {
      title: 'Total Types',
      value: (types || []).length,
      icon: Settings,
      iconColor: 'text-primary',
    },
    {
      title: 'Custom Types',
      value: (types || []).filter(t => t.ownership !== 'system').length,
      icon: Box,
      iconColor: 'text-green-600',
    },
    {
      title: 'Active Types',
      value: (types || []).filter(t => t.is_active).length,
      icon: CheckCircle,
      iconColor: 'text-orange-600',
    },
    {
      title: 'Total Fields',
      value: (types || []).reduce((sum, t) => sum + Object.keys(t.design_schema?.fields || {}).length, 0),
      icon: FileText,
      iconColor: 'text-purple-600',
    }
  ]

  const filters = [
    {
      label: 'Category',
      value: selectedCategory,
      options: categories,
      onChange: setSelectedCategory
    }
  ]

  return (
    <AdminListPage
      title="Types"
      description="Manage item types and their schemas"
      newButtonText="New Type"
      newButtonHref="/spine-framework/admin/configs/types/new"
      statsCards={statsCards}
      searchPlaceholder="Search types..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={filters}
      loading={loading}
      error={error}
      onRetry={refetch}
      emptyMessage="No types found"
      emptyIcon={Settings}
    >
      {sortedTypes.length === 0 ? (
        <div className="p-8 text-center">
          <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">No types found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <SortableTableHeader
                title="Type"
                sortKey="name"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Category"
                sortKey="ownership"
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
                title="Fields"
                sortKey="schema"
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
          <tbody className="bg-background divide-y divide-border">
            {sortedTypes.map((type) => (
              <tr 
                key={type.id} 
                className="hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(type)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-foreground">
                      <span className="text-primary hover:text-primary/80">
                        {type.name}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {type.description || type.slug}
                      <span className="mx-1.5 text-muted-foreground">&middot;</span>
                      {Object.keys(type.design_schema?.fields || {}).length} fields
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${getCategoryBadgeColor(type)}`}>
                    {type.ownership === 'system' ? 'System' : 'Custom'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${getStatusBadgeColor(type.is_active)}`}>
                    {type.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {Object.keys(type.design_schema?.fields || {}).length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {formatDateTime(type.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-muted-foreground">→</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminListPage>
  )
}






