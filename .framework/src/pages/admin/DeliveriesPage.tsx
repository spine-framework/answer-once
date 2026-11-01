// CIL[BEGIN stable_id="~/.framework/src/pages/admin/DeliveriesPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/DeliveriesPage.tsx"]
// CIL[DOC-MACRO purpose="Admin deliveries list page module: defines the Delivery record shape and DeliveriesPage React component for viewing webhook delivery attempts."]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the Delivery TypeScript interface and render the admin deliveries list with filtering, sorting, and status display."]
// CIL[DOC-CONTEXT module="admin/deliveries" layer="page" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="None" outputs="Exported Delivery interface and DeliveriesPage component" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Groups imports, the Delivery interface, and the DeliveriesPage component for the admin deliveries page." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers and admin-ui maintainers"]


import { useState } from 'react'
import { RefreshCw, Truck, Inbox } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'
import { apiFetch } from '../../lib/api'
import { AdminListPage } from '../../components/admin/AdminListPage'
import { SortableTableHeader } from '../../components/admin/SortableTableHeader'
import { useApi } from '../../hooks/useApi'
// CIL[END stable_id="~/.framework/src/pages/admin/DeliveriesPage.tsx:module_header:module_header"]


// CIL[DOC-VECTOR type="context" content="purpose='Admin deliveries list page module: defines the Delivery record shape and DeliveriesPage React component for viewing webhook delivery attempts.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/lib/api.ts,.framework/src/components/admin/AdminListPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="TypeScript contract for a webhook delivery attempt record."]
// CIL[DOC-RESPONSIBILITY responsibility="Define the fields and types for a Delivery entity consumed by the admin list page."]
// CIL[DOC-CONTEXT module="admin/deliveries" layer="model" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/DeliveriesPage.tsx"]
// CIL[DOC-CONTRACT inputs="None" outputs="Delivery interface type" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Enumerates delivery fields including direction, status, ids, retry metadata, timestamps, and optional API/handler details." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/DeliveriesPage.tsx:Delivery:interface" type="interface" identity="Delivery" parent="~/.framework/src/pages/admin/DeliveriesPage.tsx"]
interface Delivery {
  id: string
  direction: 'inbound' | 'outbound'
  status: 'pending' | 'processing' | 'delivered' | 'failed'
  integration_id: string
  api_key_id?: string
  record_id?: string
  action_slug?: string
  handler_name?: string
  external_id?: string
  attempt_count: number
  max_attempts: number
  next_attempt_at?: string
  last_error?: string
  response_status?: number
  duration_ms?: number
  created_at: string
  updated_at: string
}
// CIL[END stable_id="~/.framework/src/pages/admin/DeliveriesPage.tsx:Delivery:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript contract for a webhook delivery attempt record.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/lib/api.ts,.framework/src/components/admin/AdminListPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[DOC-MACRO purpose="Admin UI page that lists inbound and outbound webhook delivery attempts with filters and sorting."]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch deliveries from /api/deliveries, filter by search/status/direction, sort by selected key, and render a sortable table inside AdminListPage."]
// CIL[DOC-CONTEXT module="admin/deliveries" layer="page" related_files=".framework/src/components/admin/AdminListPage.tsx,.framework/src/components/admin/SortableTableHeader.tsx,.framework/src/hooks/useApi.ts,.framework/src/lib/api.ts,.framework/src/lib/utils.ts,.framework/src/pages/admin/DeliveriesPage.tsx"]
// CIL[DOC-CONTRACT inputs="None" outputs="Rendered deliveries table" errors="apiFetch/network or JSON parse errors" side_effects="Calls /api/deliveries and re-renders UI in response to filter/sort state"]
// CIL[DOC-MICRO logic_summary="Uses useApi to load deliveries, applies local filter and sort state, computes stats cards, and passes configuration to AdminListPage. Table renders color-coded status badges and formatted dates." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/DeliveriesPage.tsx:DeliveriesPage:component" type="component" identity="DeliveriesPage" parent="~/.framework/src/pages/admin/DeliveriesPage.tsx"]
export function DeliveriesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedDirection, setSelectedDirection] = useState('all')
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const { data: deliveries, loading, error, refetch } = useApi<Delivery[]>(
    async () => {
      const response = await apiFetch('/api/deliveries')
      if (!response.ok) throw new Error('Failed to fetch deliveries')
      const result = await response.json()
      return (result.data || result) as Delivery[]
    },
    { immediate: true }
  )

  const filtered = (deliveries || []).filter(d => {
    const matchesSearch = d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (d.handler_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (d.action_slug || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || d.status === selectedStatus
    const matchesDirection = selectedDirection === 'all' || d.direction === selectedDirection
    return matchesSearch && matchesStatus && matchesDirection
  })

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const sorted = [...(filtered || [])].sort((a, b) => {
    let aValue: any = a[sortKey as keyof Delivery]
    let bValue: any = b[sortKey as keyof Delivery]

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
      title: 'Total',
      value: (deliveries || []).length,
      icon: Truck,
      iconColor: 'text-blue-500'
    },
    {
      title: 'Pending',
      value: (deliveries || []).filter(d => d.status === 'pending').length,
      icon: RefreshCw,
      iconColor: 'text-yellow-500'
    },
    {
      title: 'Delivered',
      value: (deliveries || []).filter(d => d.status === 'delivered').length,
      icon: Inbox,
      iconColor: 'text-green-500'
    }
  ]

  const filters = [
    {
      label: 'Direction',
      value: selectedDirection,
      options: [
        { value: 'all', label: 'All' },
        { value: 'inbound', label: 'Inbound' },
        { value: 'outbound', label: 'Outbound' }
      ],
      onChange: setSelectedDirection
    },
    {
      label: 'Status',
      value: selectedStatus,
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'failed', label: 'Failed' }
      ],
      onChange: setSelectedStatus
    }
  ]

  return (
    <AdminListPage
      title="Deliveries"
      description="Inbound and outbound webhook delivery attempts"
      searchPlaceholder="Search deliveries..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={filters}
      statsCards={statsCards}
      loading={loading}
      error={error}
      emptyMessage="No deliveries found"
      emptyIcon={Truck}
    >
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <SortableTableHeader title="Direction" sortKey="direction" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
            <SortableTableHeader title="Status" sortKey="status" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
            <SortableTableHeader title="Integration" sortKey="integration_id" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
            <SortableTableHeader title="Handler/Action" sortKey="handler_name" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
            <SortableTableHeader title="Attempts" sortKey="attempt_count" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
            <SortableTableHeader title="Next Attempt" sortKey="next_attempt_at" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
            <SortableTableHeader title="Created" sortKey="created_at" currentSortKey={sortKey} currentSortDirection={sortDirection} onSort={handleSort} />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {sorted.map((d) => (
            <tr key={d.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 capitalize">{d.direction}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${
                  d.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  d.status === 'failed' ? 'bg-red-100 text-red-700' :
                  d.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {d.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono truncate max-w-[180px]">{d.integration_id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{d.handler_name || d.action_slug || '—'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{d.attempt_count} / {d.max_attempts}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{d.next_attempt_at ? formatDateTime(d.next_attempt_at) : '—'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{formatDateTime(d.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminListPage>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/DeliveriesPage.tsx:DeliveriesPage:component"]
// CIL[DOC-VECTOR type="context" content="purpose='Admin UI page that lists inbound and outbound webhook delivery attempts with filters and sorting.'; No verified external callers; imports: .framework/src/lib/utils.ts,.framework/src/lib/api.ts,.framework/src/components/admin/AdminListPage.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
