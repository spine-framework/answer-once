// CIL[BEGIN stable_id="~/.framework/src/pages/admin/LogsPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/LogsPage.tsx"]
/**
 * @module   LogsPage
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * The LogsPage module provides an interface for administrators to view and manage logs within the application. It leverages various UI components for displaying log data in a sortable table format and includes functionalities for searching and filtering logs by date. INVARIANT: The user must have admin privileges to access this page.
 *
 * @seeAlso LoadingSpinner (used for loading states).
 * @seeAlso AdminListPage (provides admin-specific list functionalities).
 * @seeAlso SortableTableHeader (enables sorting of log entries).
 *
 * @cil-generated
 */
















import React, { useState, useEffect } from 'react'
import { FileText, Search, Calendar, AlertTriangle, CheckCircle, User, X } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { AdminListPage } from '../../components/admin/AdminListPage'
import { SortableTableHeader } from '../../components/admin/SortableTableHeader'
import { formatDateTime } from '../../lib/utils'
import { useApi } from '../../hooks/useApi'
import { apiFetch } from '../../lib/api'
// CIL[END stable_id="~/.framework/src/pages/admin/LogsPage.tsx:module_header:module_header"]


















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/LogsPage.tsx:LogEntry:interface" type="interface" identity="LogEntry" parent="~/.framework/src/pages/admin/LogsPage.tsx"]
/**
 * The LogEntry interface defines the structure of log entries used in the admin logs page, capturing various details about events in the system. It exists to standardize the representation of log data for better management and analysis.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface LogEntry {
  id: string
  event_type: string
  actor_id?: string
  target_type?: string
  target_id?: string
  action?: string
  span_name?: string
  trace_id?: string
  span_id?: string
  parent_span_id?: string
  duration_ms?: number
  outcome?: string
  event_category?: string
  kind?: string
  details?: Record<string, any>
  metadata?: Record<string, any>
  message?: string
  created_at: string
  actor?: {
    id: string
    full_name: string
    email: string
  }
}
// CIL[END stable_id="~/.framework/src/pages/admin/LogsPage.tsx:LogEntry:interface"]




















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/LogsPage.tsx:LogsResponse:interface" type="interface" identity="LogsResponse" parent="~/.framework/src/pages/admin/LogsPage.tsx"]
/**
 * LogsResponse defines the structure of the response for log entries in the admin logs page, ensuring a consistent format for handling log data and its total count.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface LogsResponse {
  data: LogEntry[]
  total: number
}
// CIL[END stable_id="~/.framework/src/pages/admin/LogsPage.tsx:LogsResponse:interface"]




















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/LogsPage.tsx:StatsResponse:interface" type="interface" identity="StatsResponse" parent="~/.framework/src/pages/admin/LogsPage.tsx"]
/**
 * StatsResponse defines the structure of the response containing various statistics related to user actions and events. It provides a comprehensive overview of the logged data in the admin logs page.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
interface StatsResponse {
  total: number
  error_count: number
  user_action_count: number
  event_type_count: number
  levels: string[]
  sources: string[]
  source_types: string[]
}
// CIL[END stable_id="~/.framework/src/pages/admin/LogsPage.tsx:StatsResponse:interface"]



















// CIL[BEGIN stable_id="~/.framework/src/pages/admin/LogsPage.tsx:LogsPage:component" type="component" identity="LogsPage" parent="~/.framework/src/pages/admin/LogsPage.tsx"]
/**
 * LogsPage is a component that displays system logs and allows users to filter and search through them based on various criteria. It handles fetching logs and statistics from an API and updating the displayed data based on user input.
 *
 * @macro       Component responsible for managing and displaying logs with filtering capabilities.
 * @micro       Utilizes state management and API calls to dynamically fetch and display log data based on user-defined filters.
 * @inputSpec
 *   - title: string (optional) — the title to display on the page.
 * @outputSpec  JSX.Element — renders the logs page UI.
 * @throws      Error — if the log fetch fails.
 * @sideEffects Makes external API calls to fetch logs and statistics.
 * @stability   internal
 * @calls       useApi, apiFetch
 * @errorHandling throws an error if the log fetch fails.
 * @cil-generated
 */
export function LogsPage({ title = 'System Logs' }: { title?: string }) {
  const defaultDateFrom = () => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEventType, setSelectedEventType] = useState('all')
  const [selectedSource, setSelectedSource] = useState('all')
  const [selectedSourceType, setSelectedSourceType] = useState('all')
  const [sourceIdFilter, setSourceIdFilter] = useState('')
  const [actorIdFilter, setActorIdFilter] = useState('')
  const [dateFrom, setDateFrom] = useState(defaultDateFrom)
  const [dateTo, setDateTo] = useState('')
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const [traceIdFilter, setTraceIdFilter] = useState('')
  const pageSize = 100

  const buildLogUrl = (forStats = false) => {
    const params = new URLSearchParams()
    params.set('action', forStats ? 'stats' : 'account')
    if (searchTerm.trim()) params.set('query', searchTerm.trim())
    if (selectedEventType !== 'all') params.set('event_type', selectedEventType)
    if (selectedSource !== 'all') params.set('source', selectedSource)
    if (selectedSourceType !== 'all') params.set('target_type', selectedSourceType)
    if (sourceIdFilter.trim()) params.set('source_id', sourceIdFilter.trim())
    if (actorIdFilter.trim()) params.set('actor_id', actorIdFilter.trim())
    if (traceIdFilter.trim()) params.set('trace_id', traceIdFilter.trim())
    if (dateFrom) params.set('date_from', dateFrom)
    if (dateTo) params.set('date_to', dateTo)
    if (!forStats) {
      params.set('limit', pageSize.toString())
      params.set('offset', ((page - 1) * pageSize).toString())
    }
    return `/api/logs?${params.toString()}`
  }

  const { data: logsData, loading, error, refetch } = useApi<LogsResponse>(
    async () => {
      const response = await apiFetch(buildLogUrl())
      if (!response.ok) throw new Error('Failed to fetch logs')
      const result = await response.json()
      return (result.data || result) as LogsResponse
    },
    { immediate: false }
  )

  const logs = logsData?.data || []
  const totalLogs = logsData?.total || 0

  const { data: stats, refetch: refetchStats } = useApi<StatsResponse>(
    async () => {
      const response = await apiFetch(buildLogUrl(true))
      if (!response.ok) return null
      const result = await response.json()
      return (result.data || result) as StatsResponse
    },
    { immediate: false }
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      refetch()
      refetchStats()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, selectedEventType, selectedSource, selectedSourceType, sourceIdFilter, actorIdFilter, traceIdFilter, dateFrom, dateTo, page, refetch, refetchStats])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, selectedEventType, selectedSource, selectedSourceType, sourceIdFilter, actorIdFilter, traceIdFilter, dateFrom, dateTo])

  const filteredLogs = logs || []

  const eventTypes = stats?.levels || []
  const sourceOptions = stats?.sources || []

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const sortedLogs = [...(filteredLogs || [])].sort((a, b) => {
    let aValue: any = a[sortKey as keyof LogEntry] || ''
    let bValue: any = b[sortKey as keyof LogEntry] || ''
    
    if (typeof aValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    return 0
  })

  const getEventTypeBadge = (eventType: string) => {
    if (eventType.includes('error') || eventType.includes('failed')) {
      return <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-red-100 text-red-700">{eventType}</span>
    }
    if (eventType.includes('created') || eventType.includes('success')) {
      return <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-green-100 text-green-700">{eventType}</span>
    }
    if (eventType.includes('updated') || eventType.includes('modified')) {
      return <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-blue-100 text-blue-700">{eventType}</span>
    }
    return <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-md bg-slate-100 text-slate-600">{eventType}</span>
  }

  const statsCards = [
    {
      title: 'Total Events',
      value: stats?.total ?? totalLogs,
      icon: FileText,
      iconColor: 'text-blue-500'
    },
    {
      title: 'Event Types',
      value: stats?.event_type_count ?? eventTypes.length,
      icon: Calendar,
      iconColor: 'text-purple-500'
    },
    {
      title: 'Errors',
      value: stats?.error_count ?? 0,
      icon: AlertTriangle,
      iconColor: 'text-red-500'
    },
    {
      title: 'User Actions',
      value: stats?.user_action_count ?? 0,
      icon: User,
      iconColor: 'text-green-500'
    }
  ]

  const makeOptions = (values: string[], current: string) => {
    const set = new Set(['all', current, ...values])
    return Array.from(set)
      .filter(v => v && v !== 'all')
      .map(v => ({ value: v, label: v }))
  }

  const eventTypeOptions = [{ value: 'all', label: 'All Levels' }, ...makeOptions(eventTypes, selectedEventType)]
  const sourceSelectOptions = [{ value: 'all', label: 'All Sources' }, ...makeOptions(sourceOptions, selectedSource)]
  const sourceTypeOptions = [
    { value: 'all', label: 'All Source Types' },
    ...makeOptions(stats?.source_types || [], selectedSourceType)
  ]

  const filters = [
    {
      label: 'Level',
      value: selectedEventType,
      options: eventTypeOptions,
      onChange: setSelectedEventType
    },
    {
      label: 'Source',
      value: selectedSource,
      options: sourceSelectOptions,
      onChange: setSelectedSource
    },
    {
      label: 'Source Type',
      value: selectedSourceType,
      options: sourceTypeOptions,
      onChange: setSelectedSourceType
    }
  ]

  return (
    <AdminListPage
      title={title}
      description="Audit trail and event history"
      statsCards={statsCards}
      searchPlaceholder="Search logs..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={filters}
      loading={loading}
      error={error}
      emptyMessage="No logs found"
      emptyIcon={FileText}
    >
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}

              className="px-3 py-1.5 text-sm border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Source ID</label>
            <Input
              type="text"
              placeholder="uuid"
              value={sourceIdFilter}
              onChange={(e) => setSourceIdFilter(e.target.value)}
              className="w-48 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Actor ID</label>
            <Input
              type="text"
              placeholder="uuid"
              value={actorIdFilter}
              onChange={(e) => setActorIdFilter(e.target.value)}
              className="w-48 px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Trace ID</label>
            <Input
              type="text"
              placeholder="trace id"
              value={traceIdFilter}
              onChange={(e) => setTraceIdFilter(e.target.value)}
              className="w-48 px-3 py-1.5 text-sm"
            />
          </div>
          <div className="flex-1" />
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('')
              setSelectedEventType('all')
              setSelectedSource('all')
              setSelectedSourceType('all')
              setSourceIdFilter('')
              setActorIdFilter('')
              setTraceIdFilter('')
              setDateFrom(defaultDateFrom())
              setDateTo('')
              setPage(1)
            }}
            className="text-sm"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
          <Button variant="secondary" onClick={refetch} className="text-sm">
            Refresh
          </Button>
        </div>
      </div>

      {traceIdFilter && (
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
          <div className="text-sm text-blue-900">
            Viewing trace <span className="font-mono font-medium">{traceIdFilter}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTraceIdFilter('')}
          >
            Clear trace
          </Button>
        </div>
      )}

      {sortedLogs.length === 0 ? (
        <div className="p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No logs found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Try adjusting your search or date filters
          </p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <SortableTableHeader
                title="Time"
                sortKey="created_at"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Trace"
                sortKey="trace_id"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Level"
                sortKey="event_type"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Source"
                sortKey="action"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Source Type"
                sortKey="target_type"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Source ID"
                sortKey="target_id"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Person"
                sortKey="actor_id"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
              <SortableTableHeader
                title="Message"
                sortKey="message"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={handleSort}
              />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {sortedLogs.map((log) => (
              <React.Fragment key={log.id}>
                <tr
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => setExpandedRowId(expandedRowId === log.id ? null : log.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {log.trace_id ? (
                      <button
                        className="text-blue-600 hover:text-blue-800 font-mono"
                        title={`Trace: ${log.trace_id}${log.span_name ? ` / ${log.span_name}` : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setTraceIdFilter(log.trace_id!)
                          setPage(1)
                        }}
                      >
                        {log.trace_id.slice(0, 8)}
                      </button>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getEventTypeBadge(log.event_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {log.action || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {log.target_type || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {log.target_id ? log.target_id.slice(0, 8) : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {log.actor?.full_name || log.actor_id?.slice(0, 8) || 'System'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate" title={log.message}>
                    {log.message || '—'}
                  </td>
                </tr>
                {expandedRowId === log.id && (
                  <tr>
                    <td colSpan={8} className="p-0 border-b border-slate-200">
                      <div className="p-6 bg-slate-50">
                        <h4 className="text-sm font-semibold text-slate-900 mb-3">Log Record</h4>
                        <pre className="text-xs bg-white border border-slate-200 rounded-md p-4 overflow-auto max-h-96">
                          {JSON.stringify(log, null, 2)}
                        </pre>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}

      {totalLogs > 0 && (
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Page {page} of {Math.max(1, Math.ceil(totalLogs / pageSize))} ({totalLogs} total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(totalLogs / pageSize)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </AdminListPage>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/LogsPage.tsx:LogsPage:component"]






