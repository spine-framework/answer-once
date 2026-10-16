// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TriggersPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/TriggersPage.tsx"]
// CIL[DOC-MACRO purpose="Admin triggers management module for the Spine framework"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the TriggersPage module and its core dependencies for admin configuration"]
// CIL[DOC-CONTEXT module="admin" layer="presentation" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="module imports and component exports" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React hooks, API utilities, Lucide icons, and admin UI components used by TriggersPage" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]


import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
import { Plus, Search, Filter, Play, Pause, Pencil, Zap, CheckCircle, Clock, XCircle, MoreVertical, Link, User, Box, Calendar, Settings } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/button'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/badge'
import { formatDateTime } from '../../lib/utils'
import { AdminListPage } from '../../components/admin/AdminListPage'
import { SortableTableHeader } from '../../components/admin/SortableTableHeader'

// CIL[DOC-VECTOR type="context" content="purpose='Admin triggers management module for the Spine framework'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/TriggersPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TriggersPage.tsx:Trigger:interface" type="interface" identity="Trigger" parent="~/.framework/src/pages/admin/TriggersPage.tsx"]
// CIL[DOC-MACRO purpose="Define the data shape for a Trigger record"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide TypeScript typings for trigger entities consumed by TriggersPage"]
// CIL[DOC-CONTEXT module="admin" layer="presentation" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TriggersPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="Trigger type definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes all fields of a trigger including metadata, scheduling, and execution counters" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface Trigger {
  id: string
  name: string
  description?: string
  trigger_type: string
  trigger_config: Record<string, any>
  item_type_id?: string
  pipeline_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string
  account_id: string
  execution_count: number
  last_execution?: string
  next_execution?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the data shape for a Trigger record'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/TriggersPage.tsx:Trigger:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TriggersPage.tsx:TriggerExecution:interface" type="interface" identity="TriggerExecution" parent="~/.framework/src/pages/admin/TriggersPage.tsx"]
// CIL[DOC-MACRO purpose="Define the data shape for a trigger execution record"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide TypeScript typings for individual trigger executions"]
// CIL[DOC-CONTEXT module="admin" layer="presentation" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TriggersPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="TriggerExecution type definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Describes execution status, timing, payload, and optional error for a single run" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface TriggerExecution {
  id: string
  trigger_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at: string
  completed_at?: string
  trigger_data: Record<string, any>
  result?: Record<string, any>
  error?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Define the data shape for a trigger execution record'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/TriggersPage.tsx:TriggerExecution:interface"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/TriggersPage.tsx:TriggersPage:component" type="component" identity="TriggersPage" parent="~/.framework/src/pages/admin/TriggersPage.tsx"]
// CIL[DOC-MACRO purpose="Render the admin triggers list page with filtering, sorting, and navigation"]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch and display triggers; provide status/type filters, sorting, and row actions"]
// CIL[DOC-CONTEXT module="admin" layer="presentation" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/components/ui/LoadingSpinner.tsx,.framework/src/components/ui/Modal.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/TriggersPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSX for the admin triggers list" errors="Failed to fetch triggers" side_effects="navigates to trigger create, edit, and execution routes; calls toggle/execute/row click handlers"]
// CIL[DOC-MICRO logic_summary="Uses useApi to load triggers, filters and sorts them, then renders an AdminListPage with a data table" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function TriggersPage() {
  console.log('TriggersPage rendering...')
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortKey, setSortKey] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const { data: triggers, loading, error, refetch } = useApi<Trigger[]>(
    async ({ signal }: { signal?: AbortSignal }) => {
      try {
        console.log('Fetching triggers...')
        
        const response = await apiFetch('/api/triggers?action=list', { signal })
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          console.error('Response not ok:', response.statusText)
          throw new Error(`Failed to fetch triggers: ${response.statusText}`)
        }
        
        const result = await response.json()
        console.log('Raw API result:', result)
        
        const triggers = result.data || result
        console.log('Triggers after processing:', triggers)
        
        return triggers
      } catch (error) {
        console.error('Error in TriggersPage:', error)
        throw error
      }
    },
    { immediate: true }
  )

  const triggerTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'item_created', label: 'Item Created' },
    { value: 'item_updated', label: 'Item Updated' },
    { value: 'item_deleted', label: 'Item Deleted' },
    { value: 'schedule', label: 'Schedule' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'manual', label: 'Manual' },
  ]

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ]

  const filteredTriggers = (triggers || []).filter(trigger => {
    const matchesSearch = trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (trigger.description && trigger.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = selectedStatus === 'all' || trigger.is_active === (selectedStatus === 'active')
    const matchesType = selectedType === 'all' || trigger.trigger_type === selectedType
    return matchesSearch && matchesStatus && matchesType
  })

  const sortedTriggers = [...filteredTriggers].sort((a, b) => {
    const aValue = a[sortKey as keyof Trigger]
    const bValue = b[sortKey as keyof Trigger]
    
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

  console.log('TriggersPage - triggers:', triggers)
  console.log('TriggersPage - filteredTriggers:', filteredTriggers)

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'item_created':
        return <Plus className="h-5 w-5 text-green-500" />
      case 'item_updated':
        return <Pencil className="h-5 w-5 text-blue-500" />
      case 'item_deleted':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'schedule':
        return <Calendar className="h-5 w-5 text-purple-500" />
      case 'webhook':
        return <Link className="h-5 w-5 text-orange-500" />
      case 'manual':
        return <Play className="h-5 w-5 text-slate-500" />
      default:
        return <Zap className="h-5 w-5 text-slate-500" />
    }
  }

  const getTriggerBadgeColor = (triggerType: string) => {
    switch (triggerType) {
      case 'item_created':
        return 'bg-green-100 text-green-800'
      case 'item_updated':
        return 'bg-blue-100 text-blue-800'
      case 'item_deleted':
        return 'bg-red-100 text-red-800'
      case 'schedule':
        return 'bg-purple-100 text-purple-800'
      case 'webhook':
        return 'bg-orange-100 text-orange-800'
      case 'manual':
        return 'bg-slate-100 text-slate-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
  }

  const handleToggleTrigger = (trigger: Trigger) => {
    console.log('Toggle trigger:', trigger.id)
  }

  const handleExecuteTrigger = (trigger: Trigger) => {
    console.log('Execute trigger:', trigger.id)
  }

  const handleViewExecutions = (trigger: Trigger) => {
    navigate(`/spine-framework/admin/configs/triggers/${trigger.id}/executions`)
  }

  const handleRowClick = (trigger: Trigger) => {
    navigate(`/spine-framework/admin/configs/triggers/${trigger.id}`)
  }

  const handleEditTrigger = (trigger: Trigger) => {
    navigate(`/spine-framework/admin/configs/triggers/${trigger.id}/edit`)
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
      title="Triggers"
      description="Manage automated triggers for workflows"
      newButtonText="New Trigger"
      newButtonHref="/spine-framework/admin/configs/triggers/new"
      statsCards={[
        {
          title: "Total Triggers",
          value: (triggers || []).length,
          icon: Zap,
          iconColor: "text-blue-600"
        },
        {
          title: "Active",
          value: (triggers || []).filter(t => t.is_active).length,
          icon: CheckCircle,
          iconColor: "text-green-600"
        },
        {
          title: "Executions Today",
          value: "47",
          icon: Clock,
          iconColor: "text-orange-600"
        }
      ]}
      searchPlaceholder="Search triggers..."
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
          label: "Type",
          value: selectedType,
          options: triggerTypes,
          onChange: setSelectedType
        }
      ]}
      loading={loading}
      error={error}
      onRetry={refetch}
      emptyMessage="No triggers found"
      emptyIcon={Zap}
    >
      {sortedTriggers.length === 0 ? (
        <div className="text-center py-12">
          <Zap className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No triggers found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Get started by creating your first automated trigger.
          </p>
          <div className="mt-6">
            <Button onClick={() => navigate('/spine-framework/admin/configs/triggers/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Trigger
            </Button>
          </div>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <SortableTableHeader
                title="Trigger"
                sortKey="name"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Type"
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
                title="Executions"
                sortKey="execution_count"
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
            {sortedTriggers.map((trigger) => (
              <tr 
                key={trigger.id} 
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(trigger)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{trigger.name}</div>
                    {trigger.description && (
                      <div className="text-sm text-slate-500">{trigger.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getTriggerIcon(trigger.trigger_type)}
                    <Badge variant={getTriggerBadgeColor(trigger.trigger_type) as any}>
                      {trigger.trigger_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getStatusBadgeColor(trigger.is_active) as any}>
                    {trigger.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                  {trigger.execution_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {trigger.last_execution ? formatDateTime(trigger.last_execution) : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewExecutions(trigger)}
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTrigger(trigger)}
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
// CIL[DOC-VECTOR type="context" content="purpose='Render the admin triggers list page with filtering, sorting, and navigation'; No verified external callers; imports: .framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/components/ui/LoadingSpinner.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/TriggersPage.tsx:TriggersPage:component"]
