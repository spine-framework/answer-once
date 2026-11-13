

import { useState } from 'react'
import { RefreshCw, Truck, Inbox } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'
import { apiFetch } from '../../lib/api'
import { AdminListPage } from '../../components/admin/AdminListPage'
import { SortableTableHeader } from '../../components/admin/SortableTableHeader'
import { useApi } from '../../hooks/useApi'


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
