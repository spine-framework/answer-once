// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PipelinesPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/PipelinesPage.tsx"]
/**
 * @module   PipelinesPage
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module represents the PipelinesPage component within the admin section of the application, providing a user interface for managing and viewing pipelines. It leverages hooks for API interactions and includes various UI components for functionality such as sorting and filtering. INVARIANT: The user must have admin privileges to access this page.
 *
 * @seeAlso useApi (provides API interaction capabilities).
 * @seeAlso AdminListPage (base component for admin list functionality).
 * @seeAlso SortableTableHeader (for sorting capabilities in tables).
 *
 * @cil-generated
 */
















import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
import { Plus, Search, Filter, Play, Pause, Pencil, Trash2, Settings, Calendar, User, RefreshCw, CheckCircle, Clock, Cog } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { formatDateTime } from '../../lib/utils'
import { AdminListPage } from '../../components/admin/AdminListPage'
import { SortableTableHeader } from '../../components/admin/SortableTableHeader'
// CIL[END stable_id="~/.framework/src/pages/admin/PipelinesPage.tsx:module_header:module_header"]
















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PipelinesPage.tsx:Pipeline:interface" type="interface" identity="Pipeline" parent="~/.framework/src/pages/admin/PipelinesPage.tsx"]
/**
 * The Pipeline interface defines the structure of a data pipeline, including its configuration, stages, and metadata. It is used to manage and execute data processing workflows within the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface Pipeline {
  id: string
  name: string
  description?: string
  trigger_type: string
  trigger_config: Record<string, any>
  stages: Array<{
    name: string
    type: string
    config: Record<string, any>
    order: number
  }>
  is_active: boolean
  app_id?: string
  created_at: string
  updated_at: string
  created_by: string
  account_id: string
  execution_count?: number
  last_execution?: string
  next_execution?: string
}
// CIL[END stable_id="~/.framework/src/pages/admin/PipelinesPage.tsx:Pipeline:interface"]
















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PipelinesPage.tsx:PipelineExecution:interface" type="interface" identity="PipelineExecution" parent="~/.framework/src/pages/admin/PipelinesPage.tsx"]
/**
 * The PipelineExecution interface defines the structure for tracking the execution state of a pipeline, including its status and timestamps. It is essential for managing and monitoring the lifecycle of pipeline executions within the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface PipelineExecution {
  id: string
  pipeline_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at?: string
  created_at: string
  completed_at?: string
  trigger_data?: Record<string, any>
  result?: Record<string, any>
  error?: string
}
// CIL[END stable_id="~/.framework/src/pages/admin/PipelinesPage.tsx:PipelineExecution:interface"]
















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PipelinesPage.tsx:PipelinesPage:component" type="component" identity="PipelinesPage" parent="~/.framework/src/pages/admin/PipelinesPage.tsx"]
/**
 * The PipelinesPage component manages the display and interaction with pipeline data in the admin interface. It fetches pipelines, executions, and related statistics from the API and allows users to filter and sort this data.
 *
 * @macro       Admin interface component for managing and displaying pipeline data.
 * @micro       Uses multiple API calls to fetch pipelines, executions, and statistics, and maintains local state for filtering and sorting.
 * @outputSpec  JSX.Element — renders the pipelines management interface.
 * @throws      Error — failed to fetch pipelines
 * @sideEffects Makes external API calls to fetch pipeline and execution data.
 * @stability   internal
 * @calls       useApi, apiFetch
 * @errorHandling none
 * @cil-generated
 */
export function PipelinesPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTrigger, setSelectedTrigger] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortKey, setSortKey] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const { data: pipelines, loading, error, refetch } = useApi<Pipeline[]>(
    async ({ signal }: { signal?: AbortSignal }) => {
      const response = await apiFetch('/api/pipelines?action=list', { signal })
      if (!response.ok) throw new Error('Failed to fetch pipelines')
      const result = await response.json()
      return result.data || result
    },
    { immediate: true }
  )

  const { data: executions } = useApi<PipelineExecution[]>(
    async ({ signal }: { signal?: AbortSignal }) => {
      const response = await apiFetch('/api/pipeline-executions?action=list&limit=500', { signal })
      if (!response.ok) return []
      const result = await response.json()
      return result.data || result || []
    },
    { immediate: true }
  )

  const { data: execStats } = useApi<{ total: number }>(
    async ({ signal }: { signal?: AbortSignal }) => {
      const today = new Date()
      today.setUTCHours(0, 0, 0, 0)
      const response = await apiFetch(`/api/pipeline-executions?action=stats&date_from=${encodeURIComponent(today.toISOString())}`, { signal })
      if (!response.ok) return { total: 0 }
      const result = await response.json()
      return result.data || result
    },
    { immediate: true }
  )

  const { data: apps } = useApi<Array<{ id: string; name: string }>>(
    async ({ signal }: { signal?: AbortSignal }) => {
      const response = await apiFetch('/api/apps?action=list', { signal })
      if (!response.ok) return []
      const result = await response.json()
      return result.data || []
    },
    { immediate: true }
  )

  const appNameById = new Map((apps || []).map(a => [a.id, a.name]))

  const lastExecByPipeline = new Map<string, string>()
  const execCountByPipeline = new Map<string, number>()
  for (const exec of executions || []) {
    const ts = exec.started_at || exec.created_at
    execCountByPipeline.set(exec.pipeline_id, (execCountByPipeline.get(exec.pipeline_id) || 0) + 1)
    const prev = lastExecByPipeline.get(exec.pipeline_id)
    if (ts && (!prev || ts > prev)) lastExecByPipeline.set(exec.pipeline_id, ts)
  }

  const triggerOptions = [
    { value: 'all', label: 'All Triggers' },
    { value: 'schedule', label: 'Schedule' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'event', label: 'Event' },
    { value: 'manual', label: 'Manual' },
  ]

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]

  const filteredPipelines = (pipelines || []).filter(pipeline => {
    const matchesSearch = pipeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pipeline.description && pipeline.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = selectedStatus === 'all' || pipeline.is_active === (selectedStatus === 'active')
    const matchesTrigger = selectedTrigger === 'all' || pipeline.trigger_type === selectedTrigger
    return matchesSearch && matchesStatus && matchesTrigger
  })

  const sortedPipelines = [...filteredPipelines].sort((a, b) => {
    const aValue = a[sortKey as keyof Pipeline]
    const bValue = b[sortKey as keyof Pipeline]
    
    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue as string)
        : (bValue as string).localeCompare(aValue)
    }
    
    if (typeof aValue === 'number') {
      return sortDirection === 'asc' ? aValue - (bValue as number) : (bValue as number) - aValue
    }
    
    return 0
  })

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'schedule':
        return <Calendar className="h-5 w-5 text-blue-500" />
      case 'webhook':
        return <RefreshCw className="h-5 w-5 text-green-500" />
      case 'user_created':
        return <User className="h-5 w-5 text-purple-500" />
      default:
        return <Settings className="h-5 w-5 text-slate-500" />
    }
  }

  const getTriggerBadgeColor = (triggerType: string) => {
    switch (triggerType) {
      case 'schedule':
        return 'bg-blue-100 text-blue-800'
      case 'webhook':
        return 'bg-green-100 text-green-800'
      case 'user_created':
        return 'bg-purple-100 text-purple-800'
      case 'item_created':
        return 'bg-orange-100 text-orange-800'
      case 'item_updated':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
  }

  const handleViewExecutions = (pipeline: Pipeline) => {
    navigate(`/spine-framework/admin/configs/pipelines/${pipeline.id}/executions`)
  }

  const handleRowClick = (pipeline: Pipeline) => {
    navigate(`/spine-framework/admin/configs/pipelines/${pipeline.id}`)
  }

  const handleEditPipeline = (pipeline: Pipeline) => {
    navigate(`/spine-framework/admin/configs/pipelines/${pipeline.id}/edit`)
  }

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  return (
    <AdminListPage
      title="Pipelines"
      description="Manage automated workflows and processes"
      newButtonText="New Pipeline"
      newButtonHref="/spine-framework/admin/configs/pipelines/new"
      statsCards={[
        {
          title: "Total Pipelines",
          value: (pipelines || []).length,
          icon: Play,
          iconColor: "text-blue-600"
        },
        {
          title: "Active",
          value: (pipelines || []).filter(p => p.is_active).length,
          icon: CheckCircle,
          iconColor: "text-green-600"
        },
        {
          title: "Runs Today",
          value: execStats?.total ?? 0,
          icon: Clock,
          iconColor: "text-orange-600"
        }
      ]}
      searchPlaceholder="Search pipelines..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          label: "Status",
          value: selectedStatus,
          options: statusOptions,
          onChange: setSelectedStatus
        },
        {
          label: "Trigger",
          value: selectedTrigger,
          options: triggerOptions,
          onChange: setSelectedTrigger
        }
      ]}
      loading={loading}
      error={error}
      onRetry={refetch}
      emptyMessage="No pipelines found"
      emptyIcon={Cog}
    >
      {sortedPipelines.length === 0 ? (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No pipelines found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Get started by creating your first automated workflow.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/spine-framework/admin/configs/pipelines/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Pipeline
            </Button>
          </div>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <SortableTableHeader
                title="Pipeline"
                sortKey="name"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Trigger"
                sortKey="trigger_type"
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
                title="App"
                sortKey="app_id"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Last Run"
                sortKey="last_execution"
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
            {sortedPipelines.map((pipeline) => (
              <tr 
                key={pipeline.id} 
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(pipeline)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{pipeline.name}</div>
                    {pipeline.description && (
                      <div className="text-sm text-slate-500">{pipeline.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getTriggerIcon(pipeline.trigger_type)}
                    <Badge variant={getTriggerBadgeColor(pipeline.trigger_type) as any}>
                      {pipeline.trigger_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusBadgeColor(pipeline.is_active) as any}>
                    {pipeline.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {(pipeline.app_id && appNameById.get(pipeline.app_id)) || '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {lastExecByPipeline.get(pipeline.id) ? formatDateTime(lastExecByPipeline.get(pipeline.id)!) : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewExecutions(pipeline)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPipeline(pipeline)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </AdminListPage>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/PipelinesPage.tsx:PipelinesPage:component"]






