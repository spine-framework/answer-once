// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PromptConfigsPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/PromptConfigsPage.tsx"]
// CIL[DOC-MACRO purpose="Admin prompt config list page module header"]
// CIL[DOC-RESPONSIBILITY responsibility="Imports React dependencies and admin UI components for prompt configuration management"]
// CIL[DOC-CONTEXT module="admin-prompt-configs" layer="pages" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, UI icons, components, hooks, and utilities for the prompt configs page" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="ai-rag"]






import React, { useState } from 'react'
import { Plus, FileText, CheckCircle, Star, Cpu, MessageSquare } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/button'
import { AdminListPage } from '../../components/admin/AdminListPage'
import { SortableTableHeader } from '../../components/admin/SortableTableHeader'
import { formatDateTime } from '../../lib/utils'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'

// CIL[DOC-VECTOR type="context" content="purpose='Admin prompt config list page module header'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/admin/AdminListPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/PromptConfigsPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PromptConfigsPage.tsx:PromptConfig:interface" type="interface" identity="PromptConfig" parent="~/.framework/src/pages/admin/PromptConfigsPage.tsx"]
// CIL[DOC-MACRO purpose="PromptConfig TypeScript interface definition"]
// CIL[DOC-RESPONSIBILITY responsibility="Declares the shape of prompt configuration records used by the admin page"]
// CIL[DOC-CONTEXT module="admin-prompt-configs" layer="types" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/PromptConfigsPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="PromptConfig type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines optional and required fields for prompt config records including model settings, status, and audit timestamps" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

interface PromptConfig {
  id: string
  name: string
  slug: string
  system_prompt?: string
  model?: string
  temperature?: number
  max_tokens?: number
  is_multi_turn?: boolean
  is_active: boolean
  is_default?: boolean
  prompt_type?: string
  category?: string
  app_id?: string
  app?: any
  created_by?: string
  created_at: string
  updated_at: string
}
// CIL[DOC-VECTOR type="context" content="purpose='PromptConfig TypeScript interface definition'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/admin/AdminListPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/PromptConfigsPage.tsx:PromptConfig:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PromptConfigsPage.tsx:PromptConfigsPage:component" type="component" identity="PromptConfigsPage" parent="~/.framework/src/pages/admin/PromptConfigsPage.tsx"]
// CIL[DOC-MACRO purpose="Renders the admin prompt configurations list page"]
// CIL[DOC-RESPONSIBILITY responsibility="Loads prompt configs, applies filters and sorting, and renders an AdminListPage with stats and table"]
// CIL[DOC-CONTEXT module="admin-prompt-configs" layer="pages" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/PromptConfigsPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX element" errors="useApi error if API fetch fails" side_effects="window navigation on row click"]
// CIL[DOC-MICRO logic_summary="Fetches prompt configs, filters by search, status, and type, sorts by selected key, and renders stat cards and sortable table rows" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

export function PromptConfigsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [sortKey, setSortKey] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const { data: promptConfigs, loading, error, refetch } = useApi<PromptConfig[]>(
    async () => {
      const response = await apiFetch('/api/prompt-configs?action=list')
      if (!response.ok) throw new Error('Failed to fetch prompt configs')
      const result = await response.json()
      return (result.data || result) as PromptConfig[]
    },
    { immediate: true }
  )

  const filteredPromptConfigs = (promptConfigs || []).filter(config => {
    const matchesSearch = config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (config.system_prompt?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && config.is_active) ||
      (selectedStatus === 'inactive' && !config.is_active)
    const matchesType = selectedType === 'all' || config.prompt_type === selectedType
    return matchesSearch && matchesStatus && matchesType
  })

  const promptTypes = Array.from(new Set((promptConfigs || []).map(c => c.prompt_type).filter(Boolean)))

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const handleRowClick = (config: PromptConfig) => {
    window.location.href = `/spine-framework/admin/configs/prompts/${config.id}`
  }

  const sortedConfigs = [...(filteredPromptConfigs || [])].sort((a, b) => {
    let aValue: any = a[sortKey as keyof PromptConfig]
    let bValue: any = b[sortKey as keyof PromptConfig]
    
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
      title: 'Total Prompts',
      value: (promptConfigs || []).length,
      icon: FileText,
      iconColor: 'text-blue-500'
    },
    {
      title: 'Active',
      value: (promptConfigs || []).filter(c => c.is_active).length,
      icon: CheckCircle,
      iconColor: 'text-green-500'
    },
    {
      title: 'Default',
      value: (promptConfigs || []).filter(c => c.is_default).length,
      icon: Star,
      iconColor: 'text-yellow-500'
    },
    {
      title: 'Multi-Turn',
      value: (promptConfigs || []).filter(c => c.is_multi_turn).length,
      icon: MessageSquare,
      iconColor: 'text-purple-500'
    }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    ...promptTypes.filter((type): type is string => !!type).map(type => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) }))
  ]

  const filters = [
    {
      label: 'Status',
      value: selectedStatus,
      options: statusOptions,
      onChange: (v: string) => setSelectedStatus(v)
    },
    {
      label: 'Type',
      value: selectedType,
      options: typeOptions,
      onChange: (v: string) => setSelectedType(v)
    }
  ]

  return (
    <AdminListPage
      title="Prompt Configs"
      description="Manage AI prompt templates and configurations"
      newButtonText="Add Prompt Config"
      newButtonHref="/spine-framework/admin/configs/prompts/new"
      statsCards={statsCards}
      searchPlaceholder="Search prompts..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={filters}
      loading={loading}
      error={error}
      emptyMessage="No prompt configs found"
      emptyIcon={FileText}
    >
      {sortedConfigs.length === 0 ? (
        <div className="p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No prompt configs found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <SortableTableHeader
                title="Name"
                sortKey="name"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Model"
                sortKey="model"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Type"
                sortKey="prompt_type"
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
                title="Settings"
                sortKey="is_default"
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
            {sortedConfigs.map((config) => (
              <tr 
                key={config.id} 
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(config)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-slate-900">
                      <span className="text-accent-blue hover:text-navy">
                        {config.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{config.slug}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-md bg-purple-100 text-purple-700">
                    <Cpu className="w-3 h-3" />
                    {config.model || 'Default'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-600 capitalize">{config.prompt_type || 'General'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${
                    config.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {config.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-1">
                    {config.is_default && (
                      <span className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-700">Default</span>
                    )}
                    {config.is_multi_turn && (
                      <span className="inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">Multi-turn</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {formatDateTime(config.created_at)}
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
// CIL[DOC-VECTOR type="context" content="purpose='Renders the admin prompt configurations list page'; No verified external callers; imports: .framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/admin/AdminListPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/PromptConfigsPage.tsx:PromptConfigsPage:component"]