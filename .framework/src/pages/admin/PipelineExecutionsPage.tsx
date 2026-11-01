// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PipelineExecutionsPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/PipelineExecutionsPage.tsx"]
/**
 * @module   PipelineExecutionsPage
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module represents the Pipeline Executions Page in the admin section of the application, allowing users to view and manage pipeline execution statuses. It integrates with various UI components to present data in a sortable table format and leverages API hooks for data fetching.
 * INVARIANT: The user must have admin privileges to access this page.
 *
 * @seeAlso LoadingSpinner (provides loading feedback).
 * @seeAlso Button (used for user actions).
 * @seeAlso AdminListPage (base component for admin-related lists).
 * @seeAlso SortableTableHeader (enables sorting functionality in tables).
 *
 * @cil-generated
 */













import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, CheckCircle, XCircle, Clock, RefreshCw, Zap } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/button'
import { AdminListPage } from '../../components/admin/AdminListPage'
import { SortableTableHeader } from '../../components/admin/SortableTableHeader'
import { formatDateTime } from '../../lib/utils'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
// CIL[END stable_id="~/.framework/src/pages/admin/PipelineExecutionsPage.tsx:module_header:module_header"]
















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PipelineExecutionsPage.tsx:PipelineExecution:interface" type="interface" identity="PipelineExecution" parent="~/.framework/src/pages/admin/PipelineExecutionsPage.tsx"]
/**
 * The PipelineExecution interface defines the structure of a pipeline execution record, capturing its status, metadata, and associated entities. It facilitates the management and tracking of pipeline executions within the application.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface PipelineExecution {
  id: string
  pipeline_id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  trigger_data?: Record<string, any>
  result?: Record<string, any>
  error_message?: string
  started_at?: string
  completed_at?: string
  duration_ms?: number
  created_by?: string
  pipeline?: {
    id: string
    name: string
    trigger_type: string
  }
  triggered_by_person?: {
    id: string
    full_name: string
    email: string
  }
  created_at: string
}
// CIL[END stable_id="~/.framework/src/pages/admin/PipelineExecutionsPage.tsx:PipelineExecution:interface"]
















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/PipelineExecutionsPage.tsx:PipelineExecutionsPage:component" type="component" identity="PipelineExecutionsPage" parent="~/.framework/src/pages/admin/PipelineExecutionsPage.tsx"]
/**
 * The PipelineExecutionsPage component manages the display and interaction with pipeline execution data, allowing users to filter, sort, and navigate to detailed execution views. It fetches execution data and statistics from an API and provides a user-friendly interface for managing this information.
 *
 * @macro       User interface component for managing and displaying pipeline execution data.
 * @micro       Utilizes multiple API calls to fetch pipeline executions, statistics, and pipeline names, and implements local state management for filtering and sorting.
 * @outputSpec  JSX.Element — renders the pipeline executions page with interactive elements.
 * @throws      Error — if fetching pipeline executions fails
 * @sideEffects API calls to '/api/pipeline-executions?action=list', '/api/pipeline-executions?action=stats', and '/api/pipelines?action=list'
 * @stability   internal
 * @calls       useApi, apiFetch, useNavigate
 * @errorHandling throws an error if fetching pipeline executions fails
 * @cil-generated
 */
export function PipelineExecutionsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortKey, setSortKey] = useState('started_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const { data: executions, loading, error, refetch } = useApi<PipelineExecution[]>(
    async () => {
      const response = await apiFetch('/api/pipeline-executions?action=list')
      if (!response.ok) throw new Error('Failed to fetch pipeline executions')
      const result = await response.json()
      return (result.data || result) as PipelineExecution[]
    },
    { immediate: true }
  )

  const { data: stats } = useApi<{ total: number; completed: number; failed: number; running: number }>(
    async () => {
      const response = await apiFetch('/api/pipeline-executions?action=stats')
      if (!response.ok) return null
      const result = await response.json()
      return result.data || result
    },
    { immediate: true }
  )

  const { data: pipelines } = useApi<{ id: string; name: string }[]>(
    async () => {
      const response = await apiFetch('/api/pipelines?action=list')
      if (!response.ok) return []
      const result = await response.json()
      return result.data || result
    },
    { immediate: true }
  )

  const pipelineNameById = new Map((pipelines || []).map(p => [p.id, p.name]))
  const pipelineName = (exec: PipelineExecution) =>
    exec.pipeline?.name || pipelineNameById.get(exec.pipeline_id) || null

  const filteredExecutions = (executions || []).filter(exec => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = !term ||
                         pipelineName(exec)?.toLowerCase().includes(term) ||
                         exec.pipeline_id?.toLowerCase().includes(term) ||
                         exec.status?.toLowerCase().includes(term) ||
                         exec.error_message?.toLowerCase().includes(term) ||
                         false
    const matchesStatus = selectedStatus === 'all' || exec.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const handleRowClick = (exec: PipelineExecution) => {
    navigate(`/spine-framework/admin/observability/executions/${exec.id}`)
  }

  const sortedExecutions = [...(filteredExecutions || [])].sort((a, b) => {
    let aValue: any = a[sortKey as keyof PipelineExecution] || ''
    let bValue: any = b[sortKey as keyof PipelineExecution] || ''
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    return 0
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-green-100 text-green-700">Completed</span>
      case 'running':
        return <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-blue-100 text-blue-700">Running</span>
      case 'pending':
        return <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-yellow-100 text-yellow-700">Pending</span>
      case 'failed':
        return <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-red-100 text-red-700">Failed</span>
      case 'cancelled':
        return <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-600">Cancelled</span>
      default:
        return <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-600">{status}</span>
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return '—'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const statsCards = [
    {
      title: 'Total Executions',
      value: stats?.total || (executions || []).length,
      icon: Zap,
      iconColor: 'text-blue-500'
    },
    {
      title: 'Completed',
      value: stats?.completed || (executions || []).filter(e => e.status === 'completed').length,
      icon: CheckCircle,
      iconColor: 'text-green-500'
    },
    {
      title: 'Failed',
      value: stats?.failed || (executions || []).filter(e => e.status === 'failed').length,
      icon: XCircle,
      iconColor: 'text-red-500'
    },
    {
      title: 'Running',
      value: stats?.running || (executions || []).filter(e => e.status === 'running').length,
      icon: Play,
      iconColor: 'text-blue-500'
    }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'running', label: 'Running' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const filters = [
    {
      label: 'Status',
      value: selectedStatus,
      options: statusOptions,
      onChange: setSelectedStatus
    }
  ]

  return (
    <AdminListPage
      title="Pipeline Executions"
      description="Monitor and manage pipeline runs"
      statsCards={statsCards}
      searchPlaceholder="Search executions..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={filters}
      loading={loading}
      error={error}
      emptyMessage="No pipeline executions found"
      emptyIcon={RefreshCw}
    >
      {sortedExecutions.length === 0 ? (
        <div className="p-8 text-center">
          <RefreshCw className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No executions found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <SortableTableHeader
                title="Pipeline"
                sortKey="pipeline"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Status"
                sortKey="status"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Started"
                sortKey="started_at"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Duration"
                sortKey="duration_ms"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Triggered By"
                sortKey="triggered_by"
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
            {sortedExecutions.map((exec) => (
              <tr 
                key={exec.id} 
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(exec)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-slate-900">
                    {pipelineName(exec) || 'Unknown Pipeline'}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">{exec.id.slice(0, 8)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(exec.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {exec.started_at ? formatDateTime(exec.started_at) : 'Not started'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {formatDuration(exec.duration_ms)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {exec.triggered_by_person?.full_name || exec.created_by || 'System'}
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
// CIL[END stable_id="~/.framework/src/pages/admin/PipelineExecutionsPage.tsx:PipelineExecutionsPage:component"]







